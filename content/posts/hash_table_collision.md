---
title: "哈希表 -- 哈希冲突"
date: 2018-08-16T14:55:23+08:00
draft: false
categories: ["Computer Science", "Hash Table"]
tags: []
toc: true
comments: true
---

# Hash table -- Collision

在计算机科学中，哈希表 (hash table) 是一个非常重要的数据结构，它帮助我们快速的进行插入和查询。理论上来说，在表中查询一次的耗时应该是 O(1) 的。这里假设大家对于哈希 (hash) 都已经了解，如果你以前没有接触过这个概念，这篇[文章](http://blog.thedigitalcatonline.com/blog/2018/04/06/introduction-to-hashing/)或许是一个很好的开始。

假设你有一个完美的哈希函数 (perfect hashing) 和无穷大的内存，那么哈希表中每一个哈希值都对应了一个原始的元素。显然此时要进行查找，我们只需要算出哈希值，然后找到表中对应的项就可以了。然而现实中不存在无穷大的内存，也不是很容易去找到一个“优秀”的完美哈希，比如最小完美哈希 (minimal perfect hashing)。

所以实际中，我们不可避免的会碰到哈希冲突 (hash collision) ，也就是两个不同的元素被映射到同一个哈希值上。当一个哈希表碰到哈希冲突的时候，有几种办法去解决它，它们各有优劣，且容我一一道来。

## Hash collision

哈希冲突的解决办法通常是两种，一种叫拉链法 (separate chaining) ，一种叫开地址法 (open addressing)。当然不仅限于这两种，其他的比如 multiple-choice hashing, cuckoo hashing, hopscotch hashing, robin hood hashing 等等，本文挑几种介绍一下。

### Separate chaining

拉链法核心思想就是将哈希冲突的元素存入都存入到链表中，如下图所示，

![Separate Chaining](https://upload.wikimedia.org/wikipedia/commons/d/d0/Hash_table_5_0_1_1_1_1_1_LL.svg)

在每个哈希表的单元格中 (hash table cell, 或者我们也称为桶 bucket)，都存放了一个链表头。当哈希冲突发生时，只需要把冲突的元素放到链表中。当需要查找时，先通过哈希值找到对应的单元格，再遍历链表找到想要的元素，此时查找时间是 O(N) 的。这里 N 是链表长度，通常链表不会很长，所以可以认为整体查询时间还是 O(1) 的。大多数标准库中的哈希表时间都是采用了这种方式，因为足够通用，性能也还不错。

当然我们也可以用一棵 BST 来代替链表，此时查询时间是 O(lgN) 的，但是插入和空间开销要比链表大。Java 的 HashMap 的实现中，当一个哈希单元格的链表长度超过 8 时，就会自动转成一颗红黑树来降低查询开销。

拉链法有两个缺点，这在一些对性能要求比较高的地方可能不太能忍受: 

1. 链表的空间开销比较大
2. 链表对 CPU cache 不友好

但同时它的通用性最好，因为采用拉链法不需要对存入的元素有任何了解，所以绝大部分标准库的实现都用的这种方式。


### Open Addressing

开地址法是将元素直接存入到表中，但不一定是哈希值对应的那个单元格中，而找到元素对应存储的单元格的过程通常被称为探查 (probe)。开地址法需要有一个特殊的元素，来标识空的单元格。比较著名的开地址法有线性/二次探查 (linear/quadratic probing) 和双重哈希 (double hashing)。

#### Linear/Quadratic probing

在插入/查找的过程中，线性/二次探查法会通过以下过程来找到插入/存放的位置:

1. 找到初始的哈希值 h(e) 对应位置 s(0) 的单元格，查看是否是空/相同的键，如果符合要求则返回，否则继续下面的过程
	+ 通常 s(0) = h(e) % n，n 是表大小
2. 如果是线性探查，则依次往后搜索，位置由 s(i +1) = (s(i) + 1) % n 推导; 如果是二次探查，也是依次往后搜索，不过位置推导为 s(i + 1) = (s(i) + i^2) % n
3. 循环第二步直到找到或者确认找不到为止

![Linear Probing](https://upload.wikimedia.org/wikipedia/commons/b/bf/Hash_table_5_0_1_1_1_1_0_SP.svg)

线性探查的优势是对于 CPU cache 非常友好，相关的元素都聚集在一起；但是缺点同样也是因为聚集，这个问题称为 primary clustering: 任何添加到哈希表的元素，必须探查并跨过探查过程中的元素聚簇 (cluster)，并且最终会增大聚簇。Primary clustering 的问题在负载系数 (load factor) 比较大时候非常严重，感兴趣的同学可以去看下参考文献 [2] 中 CMU 的课程讲义，有一些证明和实验结果。

由于这个原因，线性探查的性能和哈希函数的质量有很大的关系。当负载系数较小 (30% -70%) 并且哈希函数质量比较高时，线性探查的实际运行速度是相当快的。

二次探查则很好的解决了 primary clustering 的问题，但同样无法避免聚集，这个聚集叫做 secondary clustering: 当两个哈希值相同时，它们的探查序列也是相同的，这就和刚才的一样，探查序列会越来越长。

二次探查有一个重要的性质：当表大小是素数 p，并且表中还有至少一半的位置是空的，那么二次探查一定能找到空的位置，并且任何位置只会被探查一次。关于这个性质的证明同样可以参考 CMU 的教材。由于只能在负载系数小于 0.5 时才有这个保证，二次探查法的空间效率不怎么高。

#### Double hashing

双重哈希与线性/二次探查一样，都是一步步探查空/存放的位置，只不过使用两个哈希函数 h_1 和 h_2，探查的位置序列 s(i) = (h_1(e) +i * h_2(e)) % n。双重哈希有效地避免了 secondary clustering，因为对于每个探查起点，不同的元素对应的探查序列也是不同的。

双重哈希相比于线性/二次探查，可以用更小的表空间存放更多的元素，但是探查的计算过程会较慢。

#### Robin Hood hashing

罗宾汉哈希 (Robin Hood Hashing) 是一个开地址法的变种，我们通常所说的罗宾汉哈希是指 Robin Hood Linear Probing。在这篇博文 [[14]](https://www.sebastiansylvan.com/post/robin-hood-hashing-should-be-your-default-hash-table-implementation/) 中，作者甚至推荐大家使用基于罗宾汉哈希实现的哈希表。那它到底有什么优势？

> To give you an idea how Robin Hood Hashing improves things, the probe length variance for a RH table at a load factor of 0.9 is 0.98, whereas for a normal open addressing scheme it’s 16.2. At a load factor of 0.99 it’s 1.87 and 194 respectively.

换句话说，罗宾汉哈希可以显著降低探查长度的方差。我们来看一下它是怎么做的：

+ 对每个哈希表中的元素，记录插入时的探查长度
+ 当插入一个新元素时，对于探查过程中的元素，如果它的探查长度小于当前插入元素的探查长度，那么交换这两个元素 (以及探测长度)，然后继续探查

也就是说，事实上大家的探查长度更加平均了，所以期望最长探查长度也会显著的下降。这也是罗宾汉 (英国传说中的侠盗) 哈希名字的来源，劫富济贫。虽然大部分元素的探查长度都更趋近于平均值，不是一次就能查到，但是由于这部分开销较 CPU 加载 cache line 开销可以忽略不计，所以整体上仍有显著的提高。

论文 [[16]](http://citeseerx.ist.psu.edu/viewdoc/download;jsessionid=73030975E67DE0BE034E8F36429A31C7?doi=10.1.1.130.6339&rep=rep1&type=pdf) 中针对各种负载系数和表规模的实验表明，罗宾汉哈希在负载系数为 0.9 时，最长探查长度的期望值也就是 6 左右 (表规模 20万)，而且随着表规模的增大，增长速度极为缓慢。

但是，即使是罗宾汉哈希也不能解决 Primary clustering 的问题，该聚簇的还是会聚簇在一起，如果在聚簇块开始探查一个不存在的元素，那么探查过程会相当漫长。不必惊慌，这个问题很容易解决：我们记录一个全局的最长探查长度，如果当前探查长度大于全局最长探查长度了，那肯定是找不到了，我们就可以直接返回。而根据上面的实验，全局最长也不会太长，麻麻再也不怕我查询失败了！

在各种测试中，罗宾汉哈希表的空间和时间性能表现都非常好，希望以后在工作过程中能有机会使用。


### 2-choice hashing

2-choice hashing 同样是使用两个哈希函数 h_1 和 h_2，每次插入时，只考虑 h_1(e) 和 h_2(e) 这两个位置，并选取其中元素少的那个插入。2-choice hashing 有一个神奇的结论，即每个桶中的元素的期望值为 $\theta(\log(\log(n)))$。

关于期望值的证明，如果你也是南大的同学并且被尹一通老师的[随机算法](http://tcs.nju.edu.cn/wiki/index.php/%E9%AB%98%E7%BA%A7%E7%AE%97%E6%B3%95_(Fall_2017))课虐过，那你应该听说过 The power of 2-choice，同样 [CMU 的讲义](http://www.cs.cmu.edu/afs/cs/academic/class/15859-f04/www/scribes/lec10.pdf)中也有证明。

###  Cuckoo Hashing

布谷鸟哈希 (Cuckoo Hashing) 也是开地址法的一种，它最差情况的查询速度都是 O(1) 的。布谷鸟哈希的名字来源于一种布谷鸟，他们的幼崽会在刚孵化的时候，把其他未孵化的蛋一脚踢出鸟巢。

布谷鸟哈希通常使用两个数组以及哈希函数，所以和 2-choice hashing 一样，每一个元素都对应两个位置。当一个元素插入的时候，如果两个位置没满，就直接放入空的位置；如果满了，那么踢掉其中一个，放入其中，然后把踢掉的这个放入它的第二个位置；如果踢掉的这个的第二个位置也被占了，那么继续踢掉其中的；循环上述过程直到最后放入空的位置。

显然，当最后遇到无限循环的时候，上述插入过程有可能会失败。此时我们可以用新的哈希函数原地重建一个表：

> There is no need to allocate new tables for the rehashing: We may simply run through the tables to delete and perform the usual insertion procedure on all keys found not to be at their intended position in the table.
>	
> — Pagh & Rodler, "Cuckoo Hashing"[[17]](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.25.4189&rep=rep1&type=pdf)

布谷鸟哈希相较于其他方法来说，空间利用率更高，所以有研究者用它设计了 Cuckoo Filter [[18]](https://www.cs.cmu.edu/~dga/papers/cuckoo-conext2014.pdf) [[10]](https://brilliant.org/wiki/cuckoo-filter/)，比 Bloom Filter 更加的空间高效，并且支持动态删除。

具体的其他细节这里就不多叙述了，大家可以去阅读维基百科 [[5]](https://en.wikipedia.org/wiki/Cuckoo_hashing) 上的资料和参考文献。

### Benchmarks

这儿有一篇博客[[11]](https://tessil.github.io/2016/08/29/benchmark-hopscotch-map.html)，分析了 8 种哈希表主流实现在各种场景下的时间和空间性能，分析表明罗宾汉哈希表 (robin_map) 和二次线性探查 (dense_map) 的性能表现都相当优秀，详细数据可以前往原博文查看。

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