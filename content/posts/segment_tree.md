---
title: "Segment Tree"
date: 2017-09-08T12:58:11+08:00
draft: false
categories: ["Development", "Algorithm"]
tags: ["segment tree", "algorithm"]
toc: true
comments: true
---

本篇为WCIPEG上关于SegmentTree的翻译稿，除了删去了几个小节，其余行文结构将完全一致。

**线段树**是一种非常灵活的数据结构，它可以帮助我们高效地完成对底层数组区间查询或是修改。顾名思义，线段树可以被想象成底层数组区间构成的一棵树，它的基本思想是分治。

### Motivation

线段树的一个最常见的应用是用于解决范围最小值查询问题：给定一个数组，然后不断地查询某个给定索引范围的最小值。举个例子，给定数组 [9, 2, 6, 3, 1, 5, 0, 7]，查询第3个到第6个数之间的最小值，答案是 min(6, 3, 1, 5) = 1。接着查询第1个到第3个，答案是2... 等等一系列查询操作。关于这个问题有很多文章进行了探讨，提出了诸多不同的解法。其中线段树往往是最合适的选择，特别是查询和修改穿插着进行的时候。为了简便起见，在接下来的几个小节中，我们将关注于用于回答范围最小值查询的特定线段树，不会再另行声明，而其他类型线段树将在本文后面进行讨论。

#### The divide-and-conquer solution

分而治之:

+ 如果这个范围仅包含一个元素，那么这个元素自己显然就是最小值
+ 否则，将范围二分成两个差不多大的小范围，然后找到它们相应的最小值，那么原来的最小值等于两个值之中小的那个。

故而，令 `$a_i$` 表示数组内第i个元素，最小值查询可以表示为以下递归函数：

`$f(x,y) = \begin{cases} a_x & \textrm{if}\ x = y\\\min(f(x, \lfloor\frac{x+y}{2}\rfloor), f(\lfloor\frac{x+y}{2}\rfloor) + 1, y) & \textrm{otherwise}\end{cases}, x \le y$`

因此，举个例子，上一章的第一个查询`$f(3,6)$`将被递归地表示为`$\min(f(3,4),f(5,6))$`。

### Structure

假设我们用上面定义的函数来计算 `$f(1,N)$`，这里 `$N$` 是数组内元素的数目。当 `$N$` 很大时，这个递归计算有两个子计算，一个是 `$f(1, \lfloor\frac{1+N}{2}\rfloor)$`，另一个是 `$f(\lfloor\frac{1+N}{2}\rfloor) + 1, N)$`。每个子计算又有两个子计算，等等，直到遇到base case。如果我们将这个递归计算的过程表示成一棵树，`$f(1, N)$`就是根节点，它有两个自己点，每个子节点可能也有两个子节点，等等。Base case 就是这棵树的叶节点。现在我们可以来描述线段树的结构：

+ 一棵二叉树，用于表示底层数组
+ 每个节点代表了数组的某个区间，并且包含了区间上的某些函数值
+ 根节点代表整个数组 (也就是区间 [1, N])
+ 每个叶节点表示数组中某个特定元素
+ 每个非叶节点有两个子节点，它们的区间不交，并且它们的区间的并等于父节点的区间
+ 每个子节点的区间大约是父节点区间的一半大小
+ 每个非叶节点存储的值不仅是它代表的区间的函数值，而且是它的子节点的存储值的函数值（拗口...就是那个递归过程）

也就是说，线段树的结构和递归计算 `$f(1,N)$` 的过程完全相同。

因此，举个例子，数组 [9,2,6,3,1,5,0,7]的根节点包含数字0 —— 整个数组的最小值。它的左子节点包含[9,2,6,3]中的最小，2；右子节点包含[1,5,0,7]中的最小，0。每个元素对应于一个叶节点，仅仅包含它自己。

![](/img/posts/Segtree_92631507.png)

### Operations

线段树一共有三种基础操作：构建、更新、查询。

#### Construction

为了进行查询和更新，首先我们需要构建一棵线段树来表示某个数组。我们可以自底向上或是自顶向下地构建。自顶向下的构建是一个递归的过程：尝试填充节点，如果是叶子节点，直接用对应的值填充，否则先填充该节点的两个子节点，然后用子节点中小的值填充该节点。自底向上的构建留作练习。这两种方式在运行速度上的差距几乎可以忽略不计。

#### Update

更新线段树即更新底层数组的某个元素。我们首先更新对应的叶子节点 —— 因为叶子节点只对应数组的一个元素。被更新的节点的父节点也将被影响，因为它对应的区间包含了被修改的元素，对祖父节点同样，直到根节点，但是**不会影响其他节点**。如果要进行自顶向下的更新，首先进行根节点的更新，这将导致两个子节点中的相关的那个递归地更新。对子节点的更新也是同样的，边界为对叶节点的更新。当递归过程完成以后，非叶节点的值更新为两个子节点的较小值。自底向上的更新同样留作练习。

![0 changed to 8](/img/posts/Segtree_92631587.png)

#### Query

在线段树上进行查询即确定底层数组某个区间的函数值，在这里就是区间内的最小元素值。查询操作的执行过程比更新操作复杂的多，我们用一个例子来阐释。假设我们想要知道第1个到第6个元素内的最小值，我们将这个查询表示为 `$f(1, 6)$`。线段树上每个节点包含了某个区间内的最小值：举例来说，根节点包含了 `$f(1, 8)$`，它的左子节点 `$f(1, 4)$`，右子节点 `$f(5, 8)$`，等等；每个叶节点包含了 `$f(x,x)$`。没有一个节点是 `$f(1,6)$`，但是注意到 `$f(1, 6) = \min(f(1,4),f(5,6))$`，并且存在两个节点包含这两个值（在下图中以黄色标识）。

因此在线段树上查询时，我们选择所有节点的一个子集，使得它们所表示的区间的并集与我们要查询的区间完全相同。为了找到这些节点，我们首先从根节点开始，递归查询那些与区间至少有一个交集的节点。在我们的例子中，`$f(1, 6)$`，我们注意到左子树和右子树对应的区间都有交集，因此他们都被递归执行。左子节点是一个base case（以黄色标识），因为它的区间被查询区间整个包含。在右子节点中，我们注意到它的左子节点和查询区间相交，但是右子节点没有，所以我们只递归执行它的左子节点。而它也是一个base case，同样以黄色标识。递归终止，而最终的最小值就是这些被选中的节点的最小值。

![Query (1, 6)](/img/posts/Segtree_query_92631587.png)

### Analysis

线段树的一些重要的性能指标如下：

#### Space

很容易证明，一个深度为d的节点对应的区间大小不超过 `$\lceil \frac{N}{2^d} \rceil$`。我们可以看到所有深度为 `$\lceil \lg N\rceil$` 的节点对应于不超过一个节点，也就说它们是叶节点。因此，线段树是一棵完全平衡二叉树，它的高度是理论最小值。因此，我们可以将树存储为一个数组，节点顺序按照宽度优先遍历排序，为了方便起见，子节点按照先左后右顺序。那么，对于上述[9,2,6,3,1,5,8,7]的线段树，将被存储为[1,2,1,2,3,1,7,9,2,6,3,1,5,8,7]。假设根节点的索引是1。那么对于一个索引是i的非叶节点，它的两个子节点的索引是2i和2i+1。注意在树的叶节点层有一些空间可能是被无用的，但是通常这都是可以接受的。一棵高度为 `$\lceil \lg N\rceil$` 的二叉树最多有 `$2^{\lfloor\lg N\rfloor + 1} - 1$` 个节点，所以通过简单的数学分析我们可以知道一棵存储了N个元素的线段树需要一个不超过 `$4N$` 大小的数组进行存储。一棵线段树使用了 `$\mathcal{O} (N)$` 的空间

#### Time

##### Construction

对每个节点，构建只需要进行几个固定操作。因为一棵线段树的节点数是 `$\mathcal{O} (n)$`，所以构建也是线性的时间。

##### Update

更新操作一共更新从根节点到被影响的叶节点的路径上所有的节点，对每个节点的更新操作数是固定的。节点的数量以树的高度为上界，因此同上述结论，更新的时间复杂度为 `$\mathcal{O}(\lg N)$`。

##### Query

考虑所有被选中的节点 (上节图中黄色的节点)。查询 `$f(1, N - 1)$` 的情况下，有 `$\lg N$` 那么多。那么是否会有更多呢？答案是否定的。一个可能最简单的证明是，将选中节点的算法展开，将在 `$\mathcal{O}(\lg N)$` 步内终止，也就是之前暗示过的非递归的方式。所以一个查询操作耗时 `$\mathcal{O}(\lg N)$` 。对递归版本的证明留作练习。

### Implementation

```
object rmq_segtree
     private function build_rec(node,begin,end,a[])
          if begin = end
               A[node] = a[begin];
          else
               let mid = floor((begin+end)/2)
               build_rec(2*node,begin,mid,a[])
               build_rec(2*node+1,mid+1,end,a[])
               A[node] = min(A[2*node],A[2*node+1])
     private function update_rec(node,begin,end,pos,val)
          if begin = end
               A[node] = val
          else
               let mid=floor((begin+end)/2)
               if pos<=mid
                    update_rec(2*node,begin,mid,pos,val)
               else
                    update_rec(2*node+1,mid+1,end,pos,val)
               A[node] = min(A[2*node],A[2*node+1])
     private function query_rec(node,t_begin,t_end,a_begin,a_end)
          if t_begin>=a_begin AND t_end<=a_end
               return A[node]
          else
               let mid = floor((t_begin+t_end)/2)
               let res = ∞
               if mid>=a_begin AND t_begin<=a_end
                    res = min(res,query_rec(2*node,t_begin,mid,a_begin,a_end))
               if t_end>=a_begin AND mid+1<=a_end
                    res = min(res,query_rec(2*node+1,mid+1,t_end,a_begin,a_end))
               return res
     function construct(size,a[1..size])
          let N = size
          let A be an array that can hold at least 4N elements
          build_rec(1,1,N,a)
     function update(pos,val)
          update_rec(1,1,N,pos,val)
     function query(begin,end)
          return query_rec(1,1,N,begin,end)
```          

### Variations

线段树不仅适用于区间最小值查询，它还可以适用于许多不同的函数查询。这里有一些比较难的竞赛题中的例子。

#### Maximum

和最小类似：所有min操作替换为max。

#### Sum or product

每个非叶节点的值为它的子节点的和，也就是表示了它的区间内的数组和。举例来说，在上述伪代码中，所有min操作被替换成加操作。但是，在一些加和的情况中，线段树被二叉索引树(Binary Indexed Tree)取代，因为BIT空间占用更小，运行更快，并且容易编码。乘可以以同样的方式实现，只不过是用乘取代加。

#### Maximum/minimum prefix suffix sum

一个区间前缀由区间内前k个元素组成 (k可以为0)；类似的，后缀由后k个元素组成。区间最大前缀和表示区间内所有前缀的和中最大的数(空区间的和为0)。这个最大和被称为最大前缀和（最小前缀和可以类似的定义）。我们希望能够高效地查询某个区间的最大前缀和。举个例子，[1,-2,3,-4]的前缀和是2，对应的前缀是[1,-2,3]。

为了使用线段树解决这个问题，我们用每个节点存储对应区间的两个函数值：最大前缀和和区间和。一个非叶节点的区间和是它的两个子节点区间和的和。为了找到一个非叶节点的最大前缀和，我们注意到最大前缀和对应的前缀的最后一个元素要么在左子节点对应的区间内，要么在右子节点对应的区间内。前一种情况，我们可以直接从左子节点获取最大前缀和，而后一种情况，我们通过左子节点的区间和和右子节点的最大前缀和相加获得。这两个数中的较大这就是我们的最大前缀和。查询也是类似的，但是可能会有超过两个相邻的区间（这种情况下最大前缀和的最后一个元素可能在它们中的任何一个）。

#### Maximum/minimum subvector sum

这个问题是查询给定区间内所有子区间的最大和。和上一节最大前缀和的问题类似，但是子区间的第一个元素并不一定在区间的开始。([1,-2,3,-4]最大子区间和是3，对应的子区间是[3])。每个节点需要存储4份信息：最大前缀和，最大后缀和，最大子区间和，区间和。详细设计留作习题。

#### "Stabbing query"

For more details, please visit the original page. 🍺

### Extension to two or more dimensions

线段树并不只限于解决一维数组的问题。原则上来说，它可以被用于任意纬度的数组，区间将被箱子答题。因此，在一个二维数组中，我们可以查询一个箱子内的最小元素，或者两个区间的笛卡尔乘积。

For more details, please visit the original page. 🍺

### Lazy propagation

某些类型的线段树支持区间更新。举个例子，考虑一个区间最小值问题的变种：我们需要能够更新一个区间内所有的元素到某个特定的值。这被称为区间更新。懒传播是一种可以使得区间更新和单个元素更新一样能够在 `$\mathcal{O}(\lg N)$` 时间内完成的技术。

它的工作原理如下：每个节点额外拥有一个lazy域，用于临时存储。当这个域不被使用是，令它的值为 `$+\infty$`。当更新一个区间是，我们选中和查询一样的那些区间。如果区间不是叶节点，则更新它们的lazy域到新的最小值(如果新的最小值比原来小的话)，否则直接将值更新到节点上。当查询或是更新操作需要访问一个节点的后代，并且这个节点的lazy域有值，我们将lazy域内的值更新到它的两个子节点上：用父节点lazy域内的值更新到两个子节点的lazy域上，然后将父节点的lazy域重新设置为 `$+\infty$`。但是，如果我们只是想要该节点的值，并不访问它的任何子节点，并且lazy域有值，我们可以直接返回lazy内的值当做是区间内最小值。

### Reference

[1] https://wcipeg.com/wiki/Segment_tree


### Apendix

#### C++ 最大查询、区间更新、懒传播

```cpp
class SegmentTree {
private:
    int n;
    vector<int> max_val, to_add;

    void push(int i, int tl, int tr) {
        max_val[i] += to_add[i];
        if (tl != tr - 1) {
            max_val[2 * i + 1] += to_add[i];
            max_val[2 * i + 2] += to_add[i];
        }
        to_add[i] = 0;
    }

    void add(int i, int tl, int tr, int l, int r, int delta) {
        push(i, tl, tr);
        if (tl >= r || tr <= l) {
            return;
        }
        if (l <= tl && tr <= r) {
            to_add[i] += delta;
            push(i, tl, tr);
            return;
        }
        int tm = (tl + tr) / 2;
        add(2 * i + 1, tl, tm, l, r, delta);
        add(2 * i + 2, tm, tr, l, r, delta);
        max_val[i] = max(max_val[2 * i + 1], max_val[2 * i + 2]);
    }

    int get(int i, int tl, int tr, int l, int r) {
        push(i, tl, tr);
        if (tl >= r || tr <= l) {
            return 0;
        }
        if (l <= tl && tr <= r) {
            return max_val[i];
        }
        int tm = (tl + tr) / 2;
        return max(get(2 * i + 1, tl, tm, l, r), get(2 * i + 2, tm, tr, l, r));
    }

public:
    SegmentTree(int k) {
        n = 1;
        while (n < k) {
            n *= 2;
        }
        max_val = vector<int>(2 * n, 0);
        to_add = vector<int>(2 * n, 0);
    }

    void add(int l, int r, int delta) { add(0, 0, n, l, r, delta); }

    int get(int l, int r) { return get(0, 0, n, l, r); }
};
```
