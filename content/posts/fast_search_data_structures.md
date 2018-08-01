---
title: "线程安全的快速搜索数据结构 -- Concurrent Fast Search Data Structures"
date: 2018-06-01T14:29:20+08:00
draft: true
categories: ["Data Structures"]
tags: ["data structures"]
toc: true
comments: true
---

说到快速搜索，最容易也是最先想到的肯定是类似于 Hash Map，Tree Map 这一类经典的数据结构。但是如果要在高并发场景下也能够工作，为了保证数据一致性，我们一般是需要使用锁来保证数据的一致性。在这些场景下，锁的粒度直接影响了并发度。而另一些数据结构则另辟蹊径，在不使用锁的情况下，也能保证数据的一致性，我们通常称之为 lock-free 的数据结构。

本文主要介绍四种数据结构，它们都是线程安全的: Concurrent Hash Map, Concurrent Skip List, Non-blocking Hash Table 以及 Concurrent Hash Array Mapped Trie。这几个数据结构的性能比较在参考文献 [1] 中有。

<!--more-->

### Concurrent Hash Map

### Concurrent Skip List

### Non-blocking Hash Table

### Concurrent Hash Array Mapped Trie


### 参考文献

[1] https://www.researchgate.net/publication/221643801_Concurrent_Tries_with_Efficient_Non-Blocking_Snapshots

[2] https://en.wikipedia.org/wiki/Ctrie

[3] https://en.wikipedia.org/wiki/Hash_array_mapped_trie

[4] https://en.wikipedia.org/wiki/Skip_list

[5] https://github.com/romix/java-concurrent-hash-trie-map

[6] https://web.stanford.edu/class/ee380/Abstracts/070221_LockFreeHash.pdf

[7] https://github.com/boundary/high-scale-lib/blob/master/src/main/java/org/cliffc/high_scale_lib/NonBlockingHashMap.java

