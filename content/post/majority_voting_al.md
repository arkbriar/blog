---
title: "Boyer-Moore Majority Voting Algorithm"
date: 2017-07-28T21:08:02+08:00
tags: ["algorithm", "boyer-moore majority vote algorithm"]
categories: ["Development", "Algorithm"]
draft: false
---

刷leetcode时碰到的问题，本篇仅做简要描述，以及记录思考。

参考自: [https://gregable.com/2013/10/majority-vote-algorithm-find-majority.html](https://gregable.com/2013/10/majority-vote-algorithm-find-majority.html)，一篇写的非常好的博客

问题描述：考虑你有一个长度为n的**无序**列表，现在你想知道列表中是否有一个值占据了列表的一半以上 (majority)，如果有的话找出这个数。

这个问题的一个普遍的应用场景是在容错计算 (fault-tolerant computing) 中，在进行了多次冗余的计算后，输出最后多数计算得到的值。

<!--more-->

## 显而易见的做法

先排序，然后遍历列表并计数就行。耗时为 O(nlgn)，不够快！实际上我们可以在 O(n) 的时间内给出结果。

## Boyer-Moore Majority Algorithm

论文依据：[Boyer-Moore Majority Algorithm](http://www.cs.rug.nl/~wim/pub/whh348.pdf)

该算法时间开销为 O(2n), 空间开销为 O(1)，总共遍历两遍列表，思想非常简单。

我们需要以下两个值:

1. candidate，初始化为任意值
2. count，初始化为0

第一遍遍历，以 current 代表当前值：

1. IF count == 0, THEN candidate = current
2. IF candiadate == current THEN count += 1 ELSE count -= 1

第二遍遍历，对上次结果中的 candidate 计数，超过一半则存在 majority 为 candidate，否则不存在

来看一下Python版代码实现：

```python
{{< highlight python "linenos=inline">}}
def boyer_moore_majority(input):
    candidate = 0
    count = 0
    for value in input:
        if count == 0:
            candidate = value
        if candidate == value
            count += 1
        else:
            count -= 1

    count = 0
    for value in input:
        if candidate == value:
            count += 1
    
    if count > len(input) / 2:
        return candidate
    else:
        return -1 # any value represents NOT FOUND

{{< /highlight >}}
```

### 一个简单的证明

我们只需要考虑在原列表中有 majority 的情况，因为如果没有第二遍遍历会直接 reject。

所以假设列表 L 中存在majority，记为 M。

可以看到，上面 candidate 在 count 等于 0 的时候变更，其实将列表分成了一段一段，每一段有一个 candidate。

每一段有一个重要的性质，即 candidate 在这一段中恰好占据了一半。

我们归纳证明：在最后一段中 candidate == M

那么当扫描到第一段S时，有两种情况：

1. candidate == M，那么根据 M 是 majority，以及根据 count(M in S) = len(S) / 2，在子列表 L - S 中 M 还是 majority
2. candidate != M，那么 count(M in S) <= len(S) / 2, 同上，L - S 中 M 还是 majority

最后一段就是最后一个子列表，所以 candidate == M。

### 更快更好 😁

两遍遍历的 O(n) 已经很快，但是大家还是觉得不够快，于是... O(3n / 2 -2) 的算法诞生了。

这个算法只比较 3n/2 - 2 次，已经是理论下限。 Here is the prover.[Finding a majority among N votes](http://www.cs.yale.edu/publications/techreports/tr252.pdf)

这个算法的基本想法是：将原列表重新排列，使得没有两个相邻的值是相同的。

在这里，我们需要一个**桶**来存放额外的值，所以空间消耗为 O(n)，同样是两遍遍历。

第一遍遍历，candidate 保持为列表的最后一个值，current 为当前值

1. current == candidate, 把 current 放入桶中
2. current != candidate, 把 current 放到列表的最后，然后从桶中取出一个放到列表最后

显然列表相邻的两个绝不可能相同

第二遍遍历中，我们需要将 candidate 不断的与列表最后一个值比较：

1. 如果相同，从列表最后去除**两个**元素
2. 否则，从列表最后去除**一个**元素，并从桶中去除**一个**元素

如果桶空了，那么没有 majority，否则 candidate 就是 majority。

证明略去，有兴趣的同学可以参考论文。


### 分布式 Boyer-Moore

有兴趣的同学可以阅读 [Finding the Majority Element in Parallel](http://www.crm.umontreal.ca/pub/Rapports/3300-3399/3302.pdf)。

主要算法如下：

```python
{{< highlight python "linenos=inline">}}
def distributed_boyer_moore_majority(parallel_output):
    candidate = 0
    count = 0
    for candidate_i, count_i in parallel_output:
    if candidate_i = candidate:
        count += count_i
    else if count_i > count:
        count = count_i - count
        candidate = candidate_i
    else:
        count = count - count_i
    ...
{{</highlight>}}
```

## 总结

刷 leetcode 时遇到的很有意思的题目 [https://leetcode.com/problems/majority-element-ii/tabs/description](https://leetcode.com/problems/majority-element-ii/tabs/description)，知道这个算法就非常容易了。



