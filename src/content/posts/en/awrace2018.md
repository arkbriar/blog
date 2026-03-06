---
title: "Reflections on the 4th Tianchi Middleware Performance Challenge"
published: 2018-08-01T19:59:45+08:00
draft: false
category: "Systems"
tags: ["middleware", "performance", "contest"]
---

It has been nearly four months since I signed up for the competition, and it has finally come to an end. I'm very happy to have won third place. Over these three months I learned a lot of practical engineering knowledge, and got reacquainted with C++ along the way. The preliminary round code was too ugly to share, but the final round code is hosted on GitHub:

https://github.com/arkbriar/awrace2018_messagestore

Below are the thought processes and final solutions for both the preliminary and final rounds.

## Preliminary Round

### Problem Analysis and Understanding

> Implement a high-performance Service Mesh Agent component with the following features: 1. Service registration and discovery, 2. Protocol conversion, 3. Load balancing

The problem required us to achieve the highest possible **performance**. We first restated the scenario and general approach:

+ The Consumer will receive over 500 connections: use IO multiplexing
+ HTTP = TCP connection: disable Nagle's algorithm
+ The Dubbo provider has only 200 processing threads, and exceeding 200 concurrent requests will cause fast failures: load balancing should avoid provider overload as much as possible
+ Online network performance (pps) is poor: batch send requests/responses, use UDP for inter-Agent communication
+ The Consumer has poor performance: offload protocol conversion and similar tasks to the Provider Agent

### Core Approach

To reduce system overhead, we maintain only a single UDP channel between agents, and only a single TCP channel between the PA (Provider Agent) and the Provider.

The overall architecture is as follows:

![](/img/15321002017148.jpg)

On the CA (Consumer Agent) side, we use a single epoll event loop. The general flow of the loop is shown below:

![](/img/15321002990709.jpg)
1\. First, accept all new connections. When a connection is accepted, assign a provider to handle all subsequent requests on that connection based on provider weights.

2\. Read all readable sockets.

+ If a complete request is read, **enqueue it into the request queue**.
+ If a complete response is read, write it back directly via blocking write.

3\. After all events are processed, batch send all requests in the queue (using writev).


Throughout the request sending and response receiving process, we always attach an ID to the request. This ID is unique on the consumer side, ensuring that we only need a single map on the consumer side to determine which connection a response belongs to. Here, our ID is the handler's index.

### Key Code

The batch request sending code looks roughly like this:

```cpp
epoll_event events[LOWER_LOAD_EVENT_SIZE];
while (_event_group.wait_and_handle(events, LOWER_LOAD_EVENT_SIZE, -1)) {
    // check pending write queue, and block write all
    for (auto& entry : _pending_data) {
        // write all requests to provider agent
        // ...
    }
}
```

The rest of the code is at https://code.aliyun.com/arkbriar/dubbo-agent-cxx.

## Final Round

### Problem Analysis and Understanding

> Implement the Queue Store interface put/get, supporting millions of queues and hundreds of gigabytes of data on a single machine.

After some initial analysis, we gathered the following information:

+ The number of messages is approximately 2 billion, with message sizes around 64 bytes, though some may be up to 1024 bytes
+ The online machines have 4 cores, 8 GB RAM with SSD, approximately 10K IOPS, and sequential 4K read/write throughput around 200 MB/s
+ For the same queue, put operations are serialized
+ For the same queue, get operations may be concurrent
+ There is no deletion of queues or messages, and put and get do not occur simultaneously

The benchmark program's idle put TPS is around 6 million, so performance isn't extremely high. Without compression, writing 100 GB of data takes at least 500 seconds. Therefore, the challenge requires contestants to ensure the put phase is as non-blocking as possible, and to design a data structure that allows the get phase to take advantage of caching and locality.

### Core Approach

To implement high-performance interfaces, we needed to solve three problems:

1. Storage design: support sequential writes and random reads
2. IO/SSD optimization: push IO throughput to its limits
3. Memory planning: compact planning and usage due to limited evaluation environment memory

#### Storage Design: Page-Based Storage

We first studied a similar product, Kafka:

![](/img/15321022399044.jpg)

![](/img/15321022432192.jpg)

Kafka's general storage model is shown above. We won't elaborate here; interested readers can learn more at https://thehoard.blog/how-kafkas-storage-internals-work-3a29b02e026

However, directly copying Kafka's approach poses several problems for our use case:

1. With 1 million queues, there would be at least 2 million files, placing enormous burden on the filesystem
2. Kafka uses full indexing, but a full index for 2 billion messages won't fit in memory. At minimum, a two-level index is needed, which adds read overhead
3. The disk overhead of a full index for 2 billion messages is too large
4. The primary queue use case is sequential reads, where full indexing provides no advantage (it's designed for random reads)

So we adopted a common file partitioning pattern: paging, with pages as the smallest unit of operation and indexing. This is our storage model: page-based storage.

This storage approach:

+ Effectively reduces the number of files
+ Since writes are sequential, we don't need to worry about dirty pages
+ Since pages are the smallest unit, consecutive messages belonging to the same queue stay in the same page as much as possible, ensuring sequential reads can leverage caching and locality
+ Finally, we index at the page level, and at this point the index fits entirely in memory

The page size is set to 4K to balance memory usage.

#### IO/SSD Optimization: Block Reads and Writes

For most existing storage devices, whether HDD or SSD, sequential read/write is always optimal.

However, SSDs differ in one key aspect: due to their "built-in concurrency" characteristic, reads and writes aligned to Clustered Blocks perform just as well as sequential reads and writes.

To understand built-in concurrency, we need to know some SSD internals. The following website provides more details; here we only cover part of it.

http://codecapsule.com/2014/02/12/coding-for-ssds-part-3-pages-blocks-and-the-flash-translation-layer/

![](/img/15321031573324.jpg)

SSD reads and writes operate at the page (NAND-flash page) level. Even reading or writing a single bit involves reading or writing an entire page. Adjacent pages form a block, typically sized between 256 KB and 4 MB. There are additional SSD characteristics that cause write amplification and GC issues, which we won't cover here; interested readers can look into these independently.

SSD built-in concurrency means that accesses to different channels/packages/chips/planes in the diagram can proceed concurrently. Blocks across different planes form an access unit called a Clustered Block, as shown by the yellow box in the diagram. Reading and writing Clustered Blocks fully leverages concurrent access. The read/write pattern we'll describe next is: random reads and writes aligned to Clustered Blocks perform just as well as sequential reads and writes. As a side note, Clustered Block sizes are typically 32 or 64 MB.

Here is a throughput comparison between random writes and sequential writes. At 32M/64M, random write throughput matches sequential write throughput across the board:
![](/img/15321036720838.jpg)

We also ran a small test, measuring read/write performance on a 4 GB file (all times in seconds):

![](/img/15321037598597.jpg)

Here, "concurrent pseudo sequential write" means multiple threads obtain the next write offset from a shared atomic integer. The experimental results confirmed the effectiveness of this pattern.

So our final read/write pattern is block reads and writes:

+ Large block (64 MB) writes, which don't even need to be sequential
+ Effectively improved concurrent read/write performance
+ Sequential reads fully leverage caching and prefetching

#### Memory Planning: Every Byte Counts

Building on the above two designs, we planned memory precisely:

+ Each queue has its own 4K page cache, corresponding to the page currently being written
+ Each put thread has its own double 64 MB write buffer, where the buffer always corresponds to a range within a file
+ Total cache memory: 4K * 1M + 64M * 2 = approximately 5.2 GB

#### Overall Architecture

The relationship between queues and files is shown below:

![](/img/15321040869218.jpg)
The page and message structure is shown below:

![](/img/15321040994886.jpg)Size is encoded using variable-length encoding:

+ Size < 128: stored in one byte, with the first bit being 0
+ Size >= 128 and < 32768: stored in two bytes, but since the first bit is also 0, we store size | 0x8000

The index for each page looks roughly like this:

![](/img/15321041984763.jpg)

Each page stores four fields: page number, file number, number of messages in the page, and total number of messages in all preceding pages. This way, during get operations, a binary search locates the page containing the target message. The total index size is approximately 12 bytes * 25M = 300 MB, which fits entirely in memory.

#### Put/Get Flow

These two flows are relatively straightforward. First, the put flow:

![](/img/15321043391182.jpg)

+ Check if the in-memory page has space
    + Yes: write directly
    + No: flush the current page, update the index, then write the message

When a page is flushed, it is submitted to the current put thread's write buffer, and the index is updated accordingly. When the write buffer is full, it swaps with the backup buffer and continues writing while a new thread flushes to disk, minimizing blocking of the put thread.

Before any get operations begin, we force all buffers to flush to disk. The get flow is also relatively straightforward:

+ Binary search for the first and last pages
+ Sequentially **blocking read** the corresponding file pages
+ Skip irrelevant messages within the page, collect all relevant messages
+ If the number of remaining messages in the last requested page is below a threshold (e.g., 15), use readahead to prefetch the next page
+ Return the requested messages

During the get phase, we maintained two principles:

1. Fully leverage the OS page cache
2. Prefetch as much as possible, hoping to reduce sequential read time

Fully leveraging the OS page cache was motivated by:

1. Implementing a concurrent LRU cache is cumbersome
2. If we implement a sequential read buffer per queue (similar to a linked list structure), it would be constantly invalidated when multiple threads read sequentially at the same time; even with thread-local buffers, if a single thread performs sequential reads on the same queue at different offsets (e.g., two full reads), the buffer would be constantly invalidated

So we chose to use the page cache directly.

### Key Code

For queue mapping, we used TBB's concurrent hash map, which turned out to be the biggest CPU bottleneck. Our put operations were entirely CPU-bound.

```cpp
template <class K, class V, class C = tbb::tbb_hash_compare<K>,
          class A = tbb::cache_aligned_allocator<std::pair<const K, V>>>
class ConcurrentHashMapProxy : public tbb::concurrent_hash_map<K, V, C, A> {
public:
    ConcurrentHashMapProxy(size_t n) : tbb::concurrent_hash_map<K, V, C, A>(n) {}
    ~ConcurrentHashMapProxy() {
        this->tbb::concurrent_hash_map<K, V, C, A>::~concurrent_hash_map<K, V, C, A>();
    }
    typename tbb::concurrent_hash_map<K, V, C, A>::const_pointer fast_find(const K& key) const {
        return this->internal_fast_find(key);
    }
};

MessageQueue* QueueStore::find_or_create_queue(const String& queue_name) {
    auto q_ptr = queues_.fast_find(queue_name);
    if (q_ptr) return q_ptr->second;

    decltype(queues_)::const_accessor ac;
    queues_.find(ac, queue_name);
    if (ac.empty()) {
        uint32_t queue_id = next_queue_id_.next();
        auto queue_ptr = new MessageQueue(queue_id, this);
        queues_.insert(ac, std::make_pair(queue_name, queue_ptr));
        DLOG("Created a new queue, id: %d, name: %s", q->get_queue_id(),
             q->get_queue_name().c_str());
    }
    return ac->second;
}

MessageQueue* QueueStore::find_queue(const String& queue_name) const {
    auto q_ptr = queues_.fast_find(queue_name);
    return q_ptr ? q_ptr->second : nullptr;

    decltype(queues_)::const_accessor ac;
    queues_.find(ac, queue_name);
    return ac.empty() ? nullptr : ac->second;
}

void QueueStore::put(const String& queue_name, const MemBlock& message) {
    if (!message.ptr) return;
    auto q_ptr = find_or_create_queue(queue_name);
    q_ptr->put(message);
}

Vector<MemBlock> QueueStore::get(const String& queue_name, long offset, long size) {
    if (!flushed) flush_all_before_read();

    auto q_ptr = find_queue(queue_name);
    if (q_ptr) return q_ptr->get(offset, size);
    // return empty list when queue is not found
    return Vector<MemBlock>();
}
```

Next is our main data structure, FilePage:

```cpp
// File page header
struct __attribute__((__packed__)) FilePageHeader {
    uint64_t offset = NEGATIVE_OFFSET;
};

#define FILE_PAGE_HEADER_SIZE sizeof(FilePageHeader)
#define FILE_PAGE_AVAILABLE_SIZE (FILE_PAGE_SIZE - FILE_PAGE_HEADER_SIZE)

// File page
struct __attribute__((__packed__)) FilePage {
    FilePageHeader header;
    char content[FILE_PAGE_AVAILABLE_SIZE];
};
```

The double write buffer requires synchronization during swaps, which we handle with a mutex:

```cpp
// buffer is full, switch to back
{
    // spin wait until back buf is not in scheduled status
    while (back_buf_status->load() == BACK_BUF_FLUSH_SCHEDULED)
        ;
    // try swap active and back buffer
    std::unique_lock<std::mutex> lock(*back_buf_mutex);
    std::swap(active_buf, back_buf);
    assert(back_buf_status->load() == BACK_BUF_FREE);
    uint32_t exp = BACK_BUF_FREE;
    back_buf_status->compare_exchange_strong(exp, BACK_BUF_FLUSH_SCHEDULED);
}
```

To let the OS make full use of available memory, the get phase needs to release all unused memory. However, tcmalloc does not proactively release memory, so we force it:

```cpp
// release free memory back to os
MallocExtension::instance()->ReleaseFreeMemory();
```

Since the online writes were extremely uniform, when it was time to flush, all page caches would flush simultaneously, causing all put threads to block and wait. To mitigate this, we made some queues flush their first page early:

```cpp
// first page will hold at most (queue_id / DATA_FILE_SPLITS) % 64 + 1 messages, this make write
// more average. This leads to 64 timepoints of first flush. I call it flush fast.
bool flush_fast =
    paged_message_indices_.size() == 1 &&
    paged_message_indices_.back().msg_size >= ((queue_id_ / DATA_FILE_SPLITS) & 0x3f) + 1;
```

The rest of the code is at https://code.aliyun.com/arkbriar/queue-race-2018-cpp.

### Final Results

The fastest write time was approximately 690 seconds, final cache flushing took 20 seconds, random verification took 120 seconds, sequential verification took 140 seconds, totaling 970+ seconds.

All improvements from version 1.9 onward were focused on reducing CPU overhead, without changing the read/write structure.

### Engineering Value and Robustness

During the storage design process, we fully accounted for the existence of long messages. Although in the competition code, the maximum supported length was just over 4K, it would be easy to support cross-page messages to remove this limitation.

During the put design process, we fully leveraged SSD characteristics, enabling even random writes to achieve maximum disk throughput. Unfortunately, we were ultimately stuck on the CPU bottleneck and never reached maximum throughput.

Although the scenario had no concurrent read-write requirements, by adding read-write locks on the queue mapping or finer-grained locks on in-memory pages, and accounting for unflushed in-memory data during reads, concurrent read-write support could be added immediately.

## Summary and Reflections

Understanding and applying various types of knowledge is the key to solving real-world problems. Through the exchange and competition with other contestants, we learned a great deal, and I believe everyone gained a lot from this competition.
