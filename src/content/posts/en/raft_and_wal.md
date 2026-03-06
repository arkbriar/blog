---
title: "Raft on RocksDB -- Shared Log"
published: 2021-08-17T10:44:38+08:00
draft: false
category: "Systems"
tags: ["raft", "write-ahead-log", "rocksdb"]
---

It has been three years since the last blog update. During this time, I went through studying abroad, graduation, starting work, and many other things -- experiences that only I truly understand. Now that the blog is back, I hope my writing and thinking have improved a little. At the same time, given my limited knowledge, I welcome any guidance from experts.

## Background

Last month, to learn the Rust programming language, I participated in a performance challenge called CloudBuild hosted by Alibaba Cloud's ECS team, implementing a chatroom server in Rust. Since I was not proficient with Rust, I only submitted once during the preliminary round, yet somehow made it to the finals, which was quite interesting. The finals required the service to be deployed across three machines while providing complete read and write services, with the requirement that the service should remain unaffected even if one machine goes down. Upon seeing the problem, my intuitive thought was to use a consensus protocol to make the three machines agree on the stored data. Common consensus protocols in distributed systems include Paxos and Raft. Raft is essentially a specialized form of Paxos and is simple and easy to understand. Therefore, I ultimately decided to implement the solution using Raft + RocksDB.

## Problem

Raft is a distributed consensus protocol, and RocksDB is a key-value database. Both are well-known in their respective fields and need no further introduction. During the implementation, I encountered several issues. One major problem was: the Raft protocol requires maintaining a log during operation, and RocksDB also maintains a WAL (Write-Ahead Log) to ensure durability. These two logs are highly redundant in terms of data content. This means that during data writes, an extra copy needs to be written, which is unacceptable for any performance-conscious system.

In fact, many distributed database systems have already merged these two logs. For example, some modified distributed MySQL systems, as well as TiKV (though I haven't verified this). Their approaches include either extending the storage engine's WAL to support special events from the consensus protocol, embedding a storage engine WAL entry within the consensus protocol's log, or for specialized systems like distributed log systems, directly transforming the Raft log into the storage engine. While searching for solutions, I found a previous article from eBay [1] that discusses how to combine the log storage's log with the Raft log. Although it is only a workshop paper, the illustrated explanations were truly enlightening.

Since I adopted RocksDB as the storage engine, I obviously did not want to modify RocksDB's WAL -- the engineering effort would be too large and not worth it. Therefore, I decided to try customizing the Raft log and disabling RocksDB's WAL. During crash recovery, the Raft log would be used to recover RocksDB. Because RocksDB is an LSM-tree based system, the SSTs (Sorted String Tables) persisted on disk are all read-only. Even in case of a crash, only the memtable in memory that hasn't been flushed is lost, which greatly simplifies the crash recovery workload.

## Shared Log

The shared log needs to consider the following two issues for functionality and performance:

1. During crash recovery, how do we find the earliest log entry not yet written to RocksDB?
2. How do we reduce small disk I/Os and maximize throughput?

### Crash Recovery

Since RocksDB only loses the in-memory memtable, and KV operations are all idempotent, the simplest approach is to replay the entire log from beginning to end. Obviously this is not a good solution -- not only is the recovery time long, but the redundant data caused by duplicate KV operations also brings additional disk pressure, which is very unfriendly to SSDs that have expensive GC and limited write endurance. A better approach is to record the maximum log LSN of the currently written SST when RocksDB finishes flushing an SST, and write it to disk as well. Upon restart, query this recorded LSN and replay from that point onward.

There are two ways to implement this:

1. Use RocksDB's event callbacks to asynchronously obtain and write the LSN
2. Each time a put(k, v) is performed, additionally put a special key, for example `_raft_log_lsn`, with the value being the current log's LSN

The first approach's asynchronous write may always fail (during a crash), so I prefer the second approach. Its only requirement is that the special key must not fall within the range of valid user keys. When the memtable is written to disk as an SST, this special key is also written. When RocksDB restarts, simply querying this key's value yields the maximum LSN already written. This approach is clearly more elegant. Of course, this method cannot guarantee that the LSN and the data in the SST are always consistent, unless the memtable can be locked during writes to prevent flushing.

One important note here is that RocksDB's default memtable flushing policy is based on size. Therefore, we can write the LSN key first (which does not change the memtable size), then perform put(k, v). This way, even if a flush is triggered, the data and LSN remain consistent. However, we need to ensure that no other policy triggers a flush that writes the LSN key while the data is lost -- this currently seems quite difficult to guarantee (without modifying RocksDB).

### Group Commit

All databases have a requirement: before returning to the user, data must already be on disk in some form (e.g., WAL) to ensure durability. However, when a large number of user requests are small, writing each request individually to disk causes many small I/Os. Small I/Os (less than 4KB) are slow and harmful on any type of disk product. A common optimization technique in database systems is group commit, which combines a group of requests into a single request and commits them to disk together before returning to users. This makes each I/O request as large as possible, effectively improving throughput.

The shared WAL can also use group commit for writes. Note that this requires a small modification to the crash recovery scheme described above: the LSN should only be written after all K-V pairs have been put.

### Flow Diagram

Here is a flow diagram following the approach described above:

![Flow Diagram](/img/posts/raft_on_rocksdb.jpg)

## Summary

This is just some thoughts triggered by a small competition. In practice, the competition only involved inserts and queries, with no deletes or overwrites -- messages were append-only. RocksDB is not optimal for every scenario, but the idea of Raft on top of some storage engine should be universally applicable.

## References

[1] Designing an Efficient Replicated Log Store with Consensus Protocol. Jung-Sang Ahn, et al. 11th USENIX Workshop on Hot Topics in Cloud Computing 2019.
