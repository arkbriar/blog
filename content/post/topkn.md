---
title: "2017 Alibaba Middelware 24h Final (Just for Fun 😀)"
date: 2017-07-26T16:59:26+08:00
keywords: ["2017阿里天池中间件大赛","分布式","24h极客赛","数据库"]
draft: false
markdown: mmark
---

今年阿里中间件比赛的时候不巧博主心情不好，外加要准备期末考试，并没有参加，非常遗憾。不过好在好基友 [Eric Fu](https://ericfu.me) 参加并获得了冠军！今年的主题是分布式数据库，如果想了解详情及复赛的解题思路请读者前往 Eric 的博客。

博主没有参加甚是遗憾，外加看到题目手痒难耐，遂问基友讨了最后的24h极客赛来玩一玩。

## 24h TOPKN

题目是分布式数据库上的分页排序，对应的SQL执行为 order by id limit k，n；主要的技术挑战为"分布式"的策略，赛题中使用多个文件模拟多个数据分片。

简称 top(k, n)。
 
> 给定一批数据，求解按顺序从小到大，顺序排名从第k下标序号之后连续的n个数据 (类似于数据库的order by asc + limit k,n语义)

> top(k,3)代表获取排名序号为k+1,k+2,k+3的内容,例:top(10,3)代表序号为11、12、13的内容,top(0,3)代表序号为1、2、3的内容
需要考虑k值几种情况，k值比较小或者特别大的情况，比如k=1,000,000,000
对应k,n取值范围： 0 <= k < 2^63 和 0 < n < 100
数据全部是文本和数字结合的数据，排序的时候按照整个字符串的长度来排序。例如一个有序的排序如下(相同长度情况下ascii码小的排在前面)：
例： a ab abc def abc123

> 例如给定的k,n为(2,2)，则上面的数据需要的答案为: abc def

原题目在 [https://code.aliyun.com/wanshao/topkn_final](https://code.aliyun.com/wanshao/topkn_final)。

要求在24小时内完成，然而 ...

这题我死命优化，带cache建一次index也要4s，清cache建一次要8s以上，也不知道第一名5轮 11s 怎么做的...

## 解题过程

主要条件：
1. 3台机器，2台worker，一台master
2. 输出在master上

主要限制：
1. Timeout: 5min
2. JVM heap size: 3G
3. 不允许使用堆外内存(FileChannel)

题目中一共有大约160000000条数据(字符串)，并分布在两台机器上，要进行 top(k, n)，首先 brute force 一定是不行的。

如果要对160000000条数据全排序JVM，第一内存太小，第二时间不够。对 10000000 条数据进行排序大约耗时为 1min13s，参考自 [https://codereview.stackexchange.com/questions/67387/quicksort-implementation-seems-too-slow-with-large-data](https://codereview.stackexchange.com/questions/67387/quicksort-implementation-seems-too-slow-with-large-data)；如果要进行外排序，磁盘读写导致耗时更长；以及还有最后要输出到master上，还有网络开销。

稍微了解一些数据库的同学都知道，数据库里有个叫索引(Index)的东西，是用来加速查询的。那我们首先来看一下 MySQL 的索引。

### MySQL 的索引

索引对查询的速度有至关重要的影响，理解索引也是进行数据库性能调优的起点。假设数据库中一个表有100000条记录，DBMS的页面大小为4K，并存储100条记录。如果没有索引，查询将对整个表进行扫描，最坏的情况下，如果所有数据页都不在内存，需要读取10000个页面，如果这10000个页面在磁盘上随机分布，需要进行10000次I/O，假设磁盘每次I/O时间为10ms，则总共需要100s(实际远不止)。但是如果建立 B+ 树索引，则只需要进行 $log_{100}1000000 = 3$次页面读取，最坏情况下耗时30ms，这就是索引带来的效果。

参考自 [http://www.cnblogs.com/hustcat/archive/2009/10/28/1591648.html](http://www.cnblogs.com/hustcat/archive/2009/10/28/1591648.html)

### B/B+ 树

我们都知道RB-Tree和AVL-Tree是都是自平衡的二叉查找树，在这样的树上进行插入，删除和查询操作最坏情况都能在$O(log_{2}n)$的时间内完成。

B树是1972年由 Rudolf Bayer 和 Edward M.McCreight 提出的，它是一种泛化的自平衡树，每个节点可以有多于两个的子节点。与自平衡二叉查找树不同的是，B树为系统大块数据的读写操作做了优化。B树减少定位记录时所经历的中间过程，从而加快存取速度。所以B树常被应用于数据库和文件系统的实现。

// TODO

参考自 

1. [https://zh.wikipedia.org/wiki/B%E6%A0%91](https://zh.wikipedia.org/wiki/B%E6%A0%91)
2. [https://zh.wikipedia.org/wiki/B%2B%E6%A0%91](https://zh.wikipedia.org/wiki/B%2B%E6%A0%91)


### 桶排序

// TODO






