---
title: "Hash Table -- Hash Collision"
published: 2018-08-16T14:55:23+08:00
draft: false
category: "Data Structure"
tags: ["hash-table", "collision-resolution"]
---

# Hash table -- Collision

In computer science, a hash table is a very important data structure that helps us perform fast insertions and lookups. Theoretically, a single lookup in the table should take O(1) time. Here I assume you already understand what hashing is. If you have never encountered this concept before, this [article](http://blog.thedigitalcatonline.com/blog/2018/04/06/introduction-to-hashing/) might be a good place to start.

Suppose you have a perfect hashing function and infinite memory. Then each hash value in the hash table corresponds to exactly one original element. Clearly, to perform a lookup, we just need to compute the hash value and find the corresponding entry in the table. However, in reality there is no infinite memory, and it is not easy to find a "good" perfect hash, such as minimal perfect hashing.

So in practice, we inevitably encounter hash collisions, meaning two different elements are mapped to the same hash value. When a hash table encounters a hash collision, there are several ways to resolve it, each with its own pros and cons. Let me walk through them one by one.

## Hash collision

There are typically two main approaches to resolving hash collisions: separate chaining and open addressing. Of course, there are more beyond these two, such as multiple-choice hashing, cuckoo hashing, hopscotch hashing, robin hood hashing, and so on. This article will cover several of them.

### Separate chaining

The core idea of separate chaining is to store all elements that hash to the same value in a linked list, as shown in the figure below:

![Separate Chaining](https://upload.wikimedia.org/wikipedia/commons/d/d0/Hash_table_5_0_1_1_1_1_1_LL.svg)

Each hash table cell (also called a bucket) stores a linked list head. When a hash collision occurs, the colliding element is simply appended to the linked list. For lookups, we first find the corresponding cell using the hash value, then traverse the linked list to find the desired element. The lookup time here is O(N), where N is the length of the linked list. Since the linked list is usually short, we can consider the overall query time to still be O(1). Most standard library hash table implementations use this approach because it is sufficiently general and offers decent performance.

We can also replace the linked list with a BST, reducing query time to O(lgN), though insertion and space overhead are higher than with a linked list. In Java's HashMap implementation, when a bucket's linked list length exceeds 8, it automatically converts to a red-black tree to reduce lookup overhead.

Separate chaining has two drawbacks that may be intolerable in performance-critical contexts:

1. Linked lists have relatively high space overhead
2. Linked lists are not CPU cache-friendly

At the same time, it has the best generality because separate chaining does not need to know anything about the elements being stored. This is why the vast majority of standard library implementations use this approach.


### Open Addressing

Open addressing stores elements directly in the table, though not necessarily in the cell corresponding to the hash value. The process of finding the cell where an element is stored is called probing. Open addressing requires a special element to mark empty cells. Well-known open addressing methods include linear/quadratic probing and double hashing.

#### Linear/Quadratic probing

During insertion/lookup, linear/quadratic probing finds the insertion/storage position through the following process:

1. Find the cell at position s(0) corresponding to the initial hash value h(e), check whether it is empty or has the same key. If it matches the requirement, return; otherwise continue with the following process:
	+ Typically s(0) = h(e) % n, where n is the table size
2. For linear probing, search sequentially with positions derived by s(i+1) = (s(i) + 1) % n; for quadratic probing, also search sequentially but with positions derived by s(i + 1) = (s(i) + i^2) % n
3. Repeat step 2 until found or confirmed not found

![Linear Probing](https://upload.wikimedia.org/wikipedia/commons/b/bf/Hash_table_5_0_1_1_1_1_0_SP.svg)

The advantage of linear probing is that it is very CPU cache-friendly since related elements are clustered together. However, the downside is also due to clustering, known as primary clustering: any element added to the hash table must probe across element clusters encountered during the probing process, and ultimately enlarges the cluster. The primary clustering problem is particularly severe at high load factors. Interested readers can check the CMU course notes in reference [2], which contain proofs and experimental results.

For this reason, linear probing's performance is highly correlated with the quality of the hash function. When the load factor is small (30%-70%) and the hash function quality is high, linear probing's actual running speed is quite fast.

Quadratic probing effectively solves the primary clustering problem, but similarly cannot avoid clustering. This type of clustering is called secondary clustering: when two hash values are identical, their probe sequences are also identical, leading to increasingly long probe sequences, just as before.

Quadratic probing has an important property: when the table size is a prime p and at least half the positions in the table are empty, quadratic probing is guaranteed to find an empty position, and no position will be probed more than once. The proof of this property can also be found in the CMU notes. Since this guarantee only holds when the load factor is less than 0.5, quadratic probing is not very space-efficient.

#### Double hashing

Like linear/quadratic probing, double hashing probes step by step for empty/occupied positions, but uses two hash functions h_1 and h_2. The probe position sequence is s(i) = (h_1(e) + i * h_2(e)) % n. Double hashing effectively avoids secondary clustering because for each probe starting point, different elements correspond to different probe sequences.

Compared to linear/quadratic probing, double hashing can store more elements in a smaller table, but the probing computation is slower.

#### Robin Hood hashing

Robin Hood Hashing is a variant of open addressing. What we commonly refer to as Robin Hood hashing means Robin Hood Linear Probing. In this blog post [[14]](https://www.sebastiansylvan.com/post/robin-hood-hashing-should-be-your-default-hash-table-implementation/), the author even recommends using hash tables based on Robin Hood hashing. So what are its advantages?

> To give you an idea how Robin Hood Hashing improves things, the probe length variance for a RH table at a load factor of 0.9 is 0.98, whereas for a normal open addressing scheme it's 16.2. At a load factor of 0.99 it's 1.87 and 194 respectively.

In other words, Robin Hood hashing can significantly reduce the variance of probe lengths. Let's see how it works:

+ For each element in the hash table, record the probe length at insertion time
+ When inserting a new element, for elements encountered during probing, if their probe length is less than the current inserting element's probe length, swap the two elements (along with their probe lengths), then continue probing

In effect, everyone's probe lengths become more equalized, so the expected maximum probe length decreases significantly. This is also the origin of the name Robin Hood (the legendary English outlaw) hashing -- "steal from the rich, give to the poor." Although most elements' probe lengths are closer to the average and not found in one step, since this overhead is negligible compared to the cost of loading a CPU cache line, there is still a significant overall improvement.

The paper [[16]](http://citeseerx.ist.psu.edu/viewdoc/download;jsessionid=73030975E67DE0BE034E8F36429A31C7?doi=10.1.1.130.6339&rep=rep1&type=pdf) presents experiments across various load factors and table sizes, showing that at a load factor of 0.9, the expected maximum probe length for Robin Hood hashing is only about 6 (with a table size of 200,000), and the growth rate is extremely slow as the table size increases.

However, even Robin Hood hashing cannot solve the primary clustering problem. Clusters that should cluster will still cluster together. If you probe for a nonexistent element starting at the beginning of a cluster, the probing process can be quite lengthy. But don't panic -- this problem is easy to solve: we record a global maximum probe length. If the current probe length exceeds the global maximum, the element definitely doesn't exist, and we can return immediately. According to the experiments above, the global maximum won't be too long either, so no more worries about failed lookups!

In various tests, Robin Hood hash tables demonstrate excellent space and time performance. Hopefully there will be opportunities to use it in practice.


### 2-choice hashing

2-choice hashing also uses two hash functions h_1 and h_2. During insertion, only the two positions h_1(e) and h_2(e) are considered, and the one with fewer elements is chosen. 2-choice hashing has a remarkable result: the expected number of elements per bucket is $\theta(\log(\log(n)))$.

For the proof of the expected value, if you are a student at Nanjing University and have taken Professor Yin Yitong's [Randomized Algorithms](http://tcs.nju.edu.cn/wiki/index.php/%E9%AB%98%E7%BA%A7%E7%AE%97%E6%B3%95_(Fall_2017)) course, you should have heard of The Power of 2-Choice. Similarly, [CMU's lecture notes](http://www.cs.cmu.edu/afs/cs/academic/class/15859-f04/www/scribes/lec10.pdf) also contain the proof.

###  Cuckoo Hashing

Cuckoo Hashing is also a form of open addressing with O(1) worst-case lookup time. Cuckoo hashing gets its name from a type of cuckoo bird whose hatchlings kick unhatched eggs out of the nest shortly after birth.

Cuckoo hashing typically uses two arrays and hash functions, so like 2-choice hashing, each element corresponds to two positions. When an element is inserted, if either position is empty, it is placed in the empty position. If both are occupied, one of the occupants is evicted and the new element takes its place. The evicted element is then placed in its alternative position. If that position is also occupied, another eviction occurs, and the process repeats until the element is finally placed in an empty position.

Obviously, the insertion process can fail when it enters an infinite loop. In that case, we can rebuild the table in-place using new hash functions:

> There is no need to allocate new tables for the rehashing: We may simply run through the tables to delete and perform the usual insertion procedure on all keys found not to be at their intended position in the table.
>
> — Pagh & Rodler, "Cuckoo Hashing"[[17]](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.25.4189&rep=rep1&type=pdf)

Compared to other methods, cuckoo hashing has higher space utilization, which led researchers to design the Cuckoo Filter [[18]](https://www.cs.cmu.edu/~dga/papers/cuckoo-conext2014.pdf) [[10]](https://brilliant.org/wiki/cuckoo-filter/), which is more space-efficient than Bloom Filters and supports dynamic deletion.

Further details are omitted here. Readers can consult the materials and references on Wikipedia [[5]](https://en.wikipedia.org/wiki/Cuckoo_hashing).

### Benchmarks

This blog post [[11]](https://tessil.github.io/2016/08/29/benchmark-hopscotch-map.html) analyzes the time and space performance of 8 mainstream hash table implementations across various scenarios. The analysis shows that Robin Hood hash tables (robin_map) and quadratic probing (dense_map) both deliver excellent performance. Detailed data can be found in the original blog post.

## References

[1] https://courses.cs.washington.edu/courses/cse373/01sp/Lect13.pdf

[2] http://www.cs.cmu.edu/afs/cs/academic/class/15210-f13/www/lectures/lecture24.pdf

[3] https://en.wikipedia.org/wiki/Hash_table

[4] https://github.com/efficient/libcuckoo

[5] https://en.wikipedia.org/wiki/Cuckoo_hashing

[6] https://en.wikipedia.org/wiki/2-choice_hashing

[7] https://www.threadingbuildingblocks.org/

[8] https://github.com/sparsehash/sparsehash

[9] http://www.cs.cmu.edu/afs/cs/academic/class/15859-f04/www/scribes/lec10.pdf

[10] https://brilliant.org/wiki/cuckoo-filter/

[11] https://tessil.github.io/2016/08/29/benchmark-hopscotch-map.html

[12] http://www.cs.princeton.edu/~mfreed/docs/cuckoo-eurosys14.pdf

[13] http://tcs.nju.edu.cn/wiki/index.php/%E9%AB%98%E7%BA%A7%E7%AE%97%E6%B3%95_(Fall_2017)

[14] https://www.sebastiansylvan.com/post/robin-hood-hashing-should-be-your-default-hash-table-implementation/

[15] http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.130.6339

[16] http://codecapsule.com/2013/11/17/robin-hood-hashing-backward-shift-deletion/
[17] http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.25.4189&rep=rep1&type=pdf
[18] https://www.cs.cmu.edu/~dga/papers/cuckoo-conext2014.pdf