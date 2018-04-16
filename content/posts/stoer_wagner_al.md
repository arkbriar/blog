---
title: "无向带权图图全局最小割 Stoer-Wagner 算法 (Stoer-Wagner Algorithm -- Global Min-Cut in Undirected Weighted Graphs)"
date: 2017-08-05T22:14:01+08:00
draft: false
toc: true
comments: true
tags: ["algorithm", "graph theory", "min-cut"]
categories: ["Development", "Algorithm"]
---

最近碰到一道题目，求一个图的全局最小割，可惜图论博主学的不太好，至今只记得一个求s-t最大流/最小割的 ford-fulkerson。想了想总不能做`$n^2$`次最大流吧，最终还是求助了维基百科 🤣

<!--more-->

## Stoer-Wagner Algorithm

Stoer-Wagner 算法是一个求**带非负权无向图**中全局最小割的算法，它是在1995年由 Mechthild Stoer 和 Frank Wagner 提出的。

算法的核心思想是通过不断的合并某个s-t最小割的顶点来缩小图的规模，直到图里只剩下两个合并剩下的顶点。

### 算法流程

在图G中，假设G的全局最小割为C = {S, T}，那么对于任何一对G上的顶点(s, t)来说

1. 要么s和t**分属**S和T
2. 要么s和t**同属**S或T

Stoer-Wagner首先找到一个s-t最小割，然后将s和t合并：

1. 删除s和t之间的边
2. 对于任何和s、t相邻的顶点v，与新顶点链接的权重为 w(v, s) + w(v, t)（假设不相邻为0权重）

显然，对于任何s、t在同一个集合的割，合并s、t并不影响割的权重。

上述流程（找到一个最小割、合并）为一个阶段，在进行 |V| - 1 次这样的阶段之后，G中只剩下两个点，那么全局最小割一定为**每个阶段的s-t最小割**以及**最后两个点的割**中的最小值，如此算法即完成了。

同学们一定发现了，如何找到一个s-t最小割才是算法能够高效执行的关键，Stoer-Wagner 算法的巧妙之处就在于此。

因为算法对于s-t最小割的起点和终点没有任何要求，所以找到任何一个最小割就行，过程如下：

1. 图G上任意一个顶点`$u$`，放入集合`$A$`中
2. 选取一个`$V - A$`中的点`$v$`，使得`$w(A,v)$`最大，将它放入`$A$`中；其中 `$w(A,v) = \sum_\limits{u \in A}w(u,v)$`
3. 重复执行 **步骤2**，直到`$V = A$`
4. 假设最后加入$A$的两个顶点是$s$和$t$, 合并它们

上述过程中 `$\left(A - \{s\}, \{t\}\right)$` 是一个s-t最小割。

### 正确性证明

要证明算法的正确性，只需要证明阶段中找到的一定是一个s-t最小割。

**符号定义**

1. 图`$G(V,E,W)$`
2. `$s$`,`$t$` 是最后加入集合`$A$`的两个顶点
3. 令`$C = (X, \overline{X})$`为任意一个s-t割，不失一般性，令 `$t \in X$`
4. `$A_v$`为在顶点`$v$`加入`$A$`之前的集合
5. `$C_v$`是在由顶点`$A_v \cup \{v\}$`构成的`$G$`的子图上，由割`$C$`导出的割

所以，我们有`$C_v = C$`，即只**需要证明** `$w(A_t, t) \le w(C ) = w(C_t)$`。

下面我们将归纳证明 `$\forall u \in X$，$w(A_u, u) \le w(C_u)$`。

设`$u_0$`是`$X$`中第一个被放入`$A$`中的顶点，那么由定义，有 `$w(A_{u_0}, u) = w(C_{u_0})$`

假设对于两个连续被放入`$A$`中、并且同属于`$X$`的顶点`$u, v$`，归纳假设有 `$w(A_u,u) \le w(C_u)$`

首先，我们有 `$w(A_v, v) = w(A_u, v) + w(A_v - A_u, v)$`

因为`$u$`优先于`$v$`被选取，所以`$w(A_u, u) \ge w(A_u, v)$`，所以上式有

`$w(A_v, v) \le w(A_u, u) + w(A_v - A_u, v) \le w(C_u) + w(A_v - A_u, v)$`

而由于`$(A_v - A_u) \cap X = \{u\}$`，所以 `$W(C_u) + w(A_v - A_u, v) = w(C_v)$`

所以有 `$w(A_u, u) \le w(C_u)$`，证毕。

故而我们知道，算法每个阶段都能找到一个s-t最小割。

### 时间复杂度

每次计算最大的`$w(A, u)$`的时间为`$O(|V|^2)$`，最后合并的时间为 `$O(|E|)$`，所以每一个阶段时间复杂度为 `$O(|E| + |V|^2)$`；

一共执行 `$|V|-1$`次，算法总计时间复杂度为 `$O(|V||E| + |V|^3)$`。

其中每次选择最大的`$w(A, u)$`可以通过堆进行优化，将时间优化到`$O(lg|V|)$`，总计时间复杂度可以降为 `$O(|V||E| + |V|^2lg|V|)$`。

这里顺便一提，Stoer-Wagner 算法适用的堆需要支持动态 update，常用的堆为斐波那契堆，在 C++ 的标准 stl 里并没有实现，替代方案可以使用 `std::multiset`。在 boost 中，对 Stoer-Wagner 算法有直接支持。

## References

[1] https://en.wikipedia.org/wiki/Stoer%E2%80%93Wagner_algorithm

[2] http://www.boost.org/doc/libs/1_64_0/libs/graph/doc/stoer_wagner_min_cut.html


