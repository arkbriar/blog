---
title: "2017 Alibaba Middleware 24h Final (Just for Fun)"
published: 2017-07-26T16:59:26+08:00
tags: ["distributed-system", "java", "contest"]
category: "Systems"
draft: false
---

When the Alibaba Middleware competition came around this year, I happened to be in a bad mood and had to prepare for final exams, so I didn't participate -- a real shame. Fortunately, my good friend [Eric Fu](https://ericfu.me) competed and won the championship! This year's theme was distributed databases. For details and the semifinal solution, please visit Eric's blog.

I was quite regretful about missing it, and the problem kept itching at me. So I asked Eric for the final 24-hour geek challenge to play around with.

## 24h TOPKN

The problem is paginated sorting on a distributed database, corresponding to the SQL execution of `order by id limit k, n`. The main technical challenge is the "distributed" strategy -- the competition uses multiple files to simulate multiple data shards.

Abbreviated as top(k, n).


> Given a batch of data, find n consecutive data items starting from the k-th index in ascending order (similar to the semantics of `order by asc + limit k,n` in databases).

> top(k,3) means getting items ranked k+1, k+2, k+3. For example: top(10,3) means items ranked 11, 12, 13; top(0,3) means items ranked 1, 2, 3.
Consider several cases for the value of k, such as very small or very large values, e.g., k=1,000,000,000.
Range of k,n values: 0 <= k < 2^63 and 0 < n < 100.
All data consists of text and numbers combined. Sorting is based on the entire string's length. For strings of equal length, the one with a smaller ASCII code comes first.
Example: a ab abc def abc123

> For example, given (k,n) = (2,2), the answer for the above data would be: abc def

The original problem is at [https://code.aliyun.com/wanshao/topkn_final](https://code.aliyun.com/wanshao/topkn_final).

Required to be completed within 24 hours, however...

Code is hosted on GitHub at [https://github.com/arkbriar/topKN](https://github.com/arkbriar/topKN). This version is lightly modified from Eric's version...

## Solution Process


**Key Conditions** | | **Key Constraints**
:---- | :-:|:------
1. 3 machines: 2 workers, 1 master <br /> 2. Output on the master | |1. Timeout: 5min <br /> 2. JVM heap size: 3G <br/> 3. Off-heap memory not allowed (FileChannel)


<br />
The problem involves approximately 160,000,000 data entries (strings) distributed across two machines. To perform top(k, n), brute force is clearly not feasible.

Fully sorting 160,000,000 entries in JVM is impractical -- first, the memory is too small; second, there isn't enough time. Sorting 10,000,000 entries takes approximately 1 minute and 13 seconds, as referenced from [https://codereview.stackexchange.com/questions/67387/quicksort-implementation-seems-too-slow-with-large-data](https://codereview.stackexchange.com/questions/67387/quicksort-implementation-seems-too-slow-with-large-data). External sorting would be even slower due to disk I/O; plus there's the network overhead of outputting results to the master.

Anyone with basic database knowledge knows about indexes, which are used to speed up queries. So let's first look at MySQL's indexes.

### MySQL Indexes

Indexes have a crucial impact on query speed, and understanding indexes is the starting point for database performance tuning. Suppose a database table has 100,000 records, the DBMS page size is 4K, and each page stores 100 records. Without an index, a query must scan the entire table. In the worst case, if none of the data pages are in memory, 10,000 pages need to be read. If these 10,000 pages are randomly distributed on disk, 10,000 I/O operations are needed. Assuming each disk I/O takes 10ms, this totals 100 seconds (in practice, much more). However, with a B+ tree index, only $log_{100}1000000 = 3$ page reads are needed, with a worst-case time of 30ms -- that's the power of indexes.

MySQL has two types of indexes: B+ tree and Hash indexes.

Referenced from [http://www.cnblogs.com/hustcat/archive/2009/10/28/1591648.html](http://www.cnblogs.com/hustcat/archive/2009/10/28/1591648.html)

### B/B+ Trees

We all know that RB-Trees and AVL-Trees are self-balancing binary search trees, where insertion, deletion, and query operations can all be completed in $O(log_{2}n)$ time in the worst case.

The B-tree was proposed in 1972 by Rudolf Bayer and Edward M. McCreight. It is a generalized self-balancing tree where each node can have more than two children. Unlike self-balancing binary search trees, B-trees are optimized for systems that read and write large blocks of data. B-trees reduce the number of intermediate steps when locating records, thereby speeding up access. This is why B-trees are commonly used in database and file system implementations.

Assuming each B-tree node has b child nodes (b partitions), a lookup can be completed with approximately logbN disk read operations.

Other characteristics of B/B+ trees are well documented on Wikipedia and other resources, so I won't elaborate further here.

Due to time constraints, implementing a B/B+ tree index was impractical, so we considered a degenerate approach -- bucket sort.

Referenced from:

1. [https://zh.wikipedia.org/wiki/B%E6%A0%91](https://zh.wikipedia.org/wiki/B%E6%A0%91)
2. [https://zh.wikipedia.org/wiki/B%2B%E6%A0%91](https://zh.wikipedia.org/wiki/B%2B%E6%A0%91)


### Bucket Sort

Let's first look at the data distribution:

> Each string has a length in the range [1, 128] (numbers are uniformly distributed within the Long value range)

Clearly, using string length as the bucket identifier is feasible, but with 160,000,000 strings and 128 buckets, each bucket would still contain 1,250,000 entries -- the bucket granularity is still too coarse.

Since we have no other distribution information, and strings of the same length are sorted lexicographically, using string length plus the first 2-3 characters as the bucket identifier suffices.

In this problem, since only 5 rounds of queries are performed and write overhead is very high, we only track the count of strings in each bucket.

### Basic Approach

1. Workers independently scan and build counts for all buckets
2. Master aggregates all buckets and builds a global bucket map
3. Master uses binary search to find the bucket(s) containing (k, n)
4. Master requests all strings within those buckets from the Workers
5. Master sorts these strings and outputs the final result

## Implementation

The main difficulty in implementing this problem lies in I/O and GC tuning, as well as fully utilizing the CPU.

1. For GC tuning, we used fixed buffers for operations, essentially avoiding GC altogether.
2. Multi-threaded processing ensures full CPU utilization.
3. Network overhead is negligible under the above algorithm.

However, the remaining I/O optimization was a real headache, along with potential synchronization issues between reading and processing.

Let's look at the hardware specifications:

1. CPU: 24 cores, 2.2GHz
2. Memory: 3G heap memory
3. Data disk: in-memory file system
4. Temporary/result disk: SSD

### Top 1's Final Result

From Eric, I learned that the top 1 implementation completed all 5 rounds (including JVM startup, pausing, and computation) in just over 11 seconds, which served as a benchmark for how far away from optimal I was.

(I really can't figure out how first place got it down to 11 seconds -- maybe I set up the in-memory file system incorrectly?)

### Unstable I/O Implementation

Single-threaded reading per file, fixed 4 threads for processing, with pre-allocated buffers to avoid GC.

File operations are parallelized, with 5 files running in parallel occupying a total of 25 cores.

Due to the inability to effectively balance reading and processing, it was hard to achieve process-as-you-read. A lot of time was spent waiting for the read thread to produce a new buffer or for the processing thread to finish with a buffer.

With system cache cleared, processing all strings took about 8 seconds; without clearing, about 4 seconds.

This implementation could not be optimized -- the waiting time was entirely at the OS's mercy.

### Stable I/O Implementation

As mentioned earlier, single-threaded reading isn't a great approach, and the above processing architecture has an unstable waiting problem.

So how can we maintain multi-threaded reading while also enabling multi-threaded processing, without wasting time on waiting?

The answer is **each thread reads a chunk of data, processes it immediately, then reads the next chunk**.

But how do we assign each thread its chunk of data, ensuring no duplicate reads and no missed data blocks between threads?

Here we adopted Eric's semifinal implementation: FileSegment. By splitting a file into individual Segments, each thread requests the next Segment on its own and reads it using RandomAccessFile (since FileChannel was not allowed).

```java
public class FileSegment {
    private File file;

    private long offset;

    private long size;
    ...
}
```

```java
public abstract class BufferedFileSegmentReadProcessor implements Runnable {
    private final int bufferMargin = 1024;
    private FileSegmentLoader fileSegmentLoader;
    private int bufferSize;
    private byte[] readBuffer;

    // Here bufferSize must be greater than segments' size got from fileSegmentLoader,
    // otherwise segment will not be fully read/processed!
    public BufferedFileSegmentReadProcessor(FileSegmentLoader fileSegmentLoader, int bufferSize) {
        this.bufferSize = bufferSize;
        this.fileSegmentLoader = fileSegmentLoader;
    }

    private int readSegment(FileSegment segment, byte[] readBuffer) throws IOException {
        int limit = 0;
        try (RandomAccessFile randomAccessFile = new RandomAccessFile(segment.getFile(), "r")) {
            randomAccessFile.seek(segment.getOffset());
            limit = randomAccessFile.read(readBuffer, 0, readBuffer.length);
        }
        return limit;
    }

    protected abstract void processSegment(FileSegment segment, byte[] readBuffer, int limit);

    @Override
    public void run() {
        readBuffer = new byte[bufferSize + bufferMargin];
        try {
            FileSegment segment;
            while ((segment = fileSegmentLoader.nextFileSegment()) != null) {
                int limit = readSegment(segment, readBuffer);
                processSegment(segment, readBuffer, limit);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

This way, each thread cycles between reading and processing. Threads that finish first request the next Segment, ensuring all cores are utilized in the shortest time possible to complete one pass of data processing.

This approach guarantees very stable reading and processing without needing to wait for Reader-Processor communication. In my test environment, with cache present it took 3-4 seconds to scan through, and 7-8 seconds with cache cleared.

At this point, the problem was essentially solved. I recall that with this approach, Eric's final competition result was just over 14 seconds.

### Top 1's Optimization

1. While building buckets, simultaneously store the offset and bucket index for the i-th string in each file into two arrays. Save the bucket information along with these two arrays to local storage, creating an index that allows fast querying of all strings within a bucket.
2. This information totals approximately 1GB. By building such an index, each query only needs to read the index information and perform a limited number of reads to retrieve all required strings.

In comparison, the previous approach read 5GB of files from the in-memory file system, while the new approach reads about 1GB from SSD. As long as the concurrent read speed difference is not more than 5x, this optimization saves significant time!

## Testing

Only tested index building.

### With Cache Cleared

```bash
$ sysctl -w vm.drop_caches=3
vm.drop_caches = 3
$ time java ${JAVA_OPTS} -cp /exp/topkn/topkn.jar com.alibaba.middleware.topkn.TopknWorker localhost 5527 .
[2017-07-27 14:24:27.512] INFO com.alibaba.middleware.topkn.TopknWorker Connecting to master at localhost:5527
[2017-07-27 14:24:27.519] INFO com.alibaba.middleware.topkn.TopknWorker Building index ...
0.673: [GC (Allocation Failure) 0.673: [ParNew: 809135K->99738K(943744K), 0.1759305 secs] 809135K->542134K(3040896K), 0.1761763 secs] [Times: user=3.15 sys=0.69, real=0.17 secs]
[2017-07-27 14:24:32.330] INFO com.alibaba.middleware.topkn.TopknWorker Index built.
Heap
 par new generation   total 943744K, used 903716K [0x0000000700000000, 0x0000000740000000, 0x0000000740000000)
  eden space 838912K,  95% used [0x0000000700000000, 0x00000007311225e0, 0x0000000733340000)
  from space 104832K,  95% used [0x00000007399a0000, 0x000000073fb06b38, 0x0000000740000000)
  to   space 104832K,   0% used [0x0000000733340000, 0x0000000733340000, 0x00000007399a0000)
 concurrent mark-sweep generation total 2097152K, used 442395K [0x0000000740000000, 0x00000007c0000000, 0x00000007c0000000)
 Metaspace       used 3980K, capacity 4638K, committed 4864K, reserved 1056768K
  class space    used 434K, capacity 462K, committed 512K, reserved 1048576K

real    0m5.238s
user    1m11.980s
sys     0m26.324s
```

### Without Cache Cleared

```bash
$ time java ${JAVA_OPTS} -cp /exp/topkn/topkn.jar com.alibaba.middleware.topkn.TopknWorker localhost 5527 .
[2017-07-27 14:25:39.986] INFO com.alibaba.middleware.topkn.TopknWorker Connecting to master at localhost:5527
[2017-07-27 14:25:39.992] INFO com.alibaba.middleware.topkn.TopknWorker Building index ...
0.590: [GC (Allocation Failure) 0.590: [ParNew: 838912K->99751K(943744K), 0.1851592 secs] 838912K->591302K(3040896K), 0.1855308 secs] [Times: user=3.03 sys=0.88, real=0.19 secs]
[2017-07-27 14:25:44.449] INFO com.alibaba.middleware.topkn.TopknWorker Index built.
Heap
 par new generation   total 943744K, used 863664K [0x0000000700000000, 0x0000000740000000, 0x0000000740000000)
  eden space 838912K,  91% used [0x0000000700000000, 0x000000072ea02318, 0x0000000733340000)
  from space 104832K,  95% used [0x00000007399a0000, 0x000000073fb09e00, 0x0000000740000000)
  to   space 104832K,   0% used [0x0000000733340000, 0x0000000733340000, 0x00000007399a0000)
 concurrent mark-sweep generation total 2097152K, used 491550K [0x0000000740000000, 0x00000007c0000000, 0x00000007c0000000)
 Metaspace       used 3980K, capacity 4638K, committed 4864K, reserved 1056768K
  class space    used 434K, capacity 462K, committed 512K, reserved 1048576K

real    0m4.754s
user    0m57.144s
sys     0m30.568s
```

**UPDATE**

On my 8-core physical machine, scanning through the data in the in-memory file system takes less than 1 second... It seems to be a machine issue -- cloud servers just can't keep up.

## Summary

This year's middleware competition was really interesting. The problem set high expectations for contestants, involving multi-threaded concurrent read/write, distributed sorting, indexing, socket programming, JVM tuning, and many other aspects. Coming in cold, I went through two broken versions of code, looking everywhere and asking everyone before finally figuring out the final approach.

Rather than saying I solved it, it's more accurate to say I was learning how to solve it. In the process, I discovered many interesting technical points that I plan to continue studying.
