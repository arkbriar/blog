---
title: "Thread-safe Fast Search Data Structures -- Concurrent Fast Search Data Structures"
published: 2018-06-01T14:29:20+08:00
draft: true
category: "Data Structures"
tags: ["data structures"]
---

When it comes to fast search, the first data structures that come to mind are classic ones like Hash Map and Tree Map. However, to make them work in high-concurrency scenarios and ensure data consistency, we generally need to use locks. In these scenarios, lock granularity directly affects the degree of concurrency. Some other data structures take a different approach, ensuring data consistency without using locks at all -- these are commonly known as lock-free data structures.

This article mainly introduces four data structures, all of which are thread-safe: Concurrent Hash Map, Concurrent Skip List, Non-blocking Hash Table, and Concurrent Hash Array Mapped Trie. Performance comparisons of these data structures can be found in reference [1].


### Concurrent Hash Map

### Concurrent Skip List

### Non-blocking Hash Table

### Concurrent Hash Array Mapped Trie


### References

[1] https://www.researchgate.net/publication/221643801_Concurrent_Tries_with_Efficient_Non-Blocking_Snapshots

[2] https://en.wikipedia.org/wiki/Ctrie

[3] https://en.wikipedia.org/wiki/Hash_array_mapped_trie

[4] https://en.wikipedia.org/wiki/Skip_list

[5] https://github.com/romix/java-concurrent-hash-trie-map

[6] https://web.stanford.edu/class/ee380/Abstracts/070221_LockFreeHash.pdf

[7] https://github.com/boundary/high-scale-lib/blob/master/src/main/java/org/cliffc/high_scale_lib/NonBlockingHashMap.java
