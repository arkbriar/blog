---
title: "Polynomial Hash and Theu-Morse Sequence"
date: 2017-08-21T23:58:42+08:00
draft: false
categories: ["Development", "Mathematics"]
tags: ["math", "hackerrank"]
toc: true
comments: true
---

前两天刷 Hackerrank 上的 [Contest](https://www.hackerrank.com/contests/gs-codesprint/challenges)，给了两天时间，没想到被最后一题卡成🐶，谨记录思考和收获。

原题目在 https://www.hackerrank.com/contests/gs-codesprint/challenges/transaction-certificates ，就不在此赘述了。

<!--more-->

### 思考过程

首先，题目其实就是将一个交易链进行hash，并要求给出hash碰撞的两个不同的交易链。

有一些可能有用的条件，p是素数，m是2的幂。

解的存在性就不证明了，鸽笼原理很简单。

#### 思路1

由两个hash相减得到，可以将题目转换为 `$\sum\limits_{i = 0}^{n - 1}a_i \cdot p^{n - 1 - i}  \equiv 0 \ (mod\ m), a_i \in (-k, k)$`, 并且不能是所有 `$a_i$` 为0的 trival 解。

在 `$k \gt p$` 时，令 `$a_{n - 1} = p \% m, a_{n - 2} = -1$`，其余都为0，我们可以很容易的构造原来的解。

但是在 `$k \le p$` 时，我只想到了暴力搜索（通过暴力搜索多元一次同余式的解空间）。


#### 思路2

由观察，`$a_0a_1...a_{n-1}$` 构成了一个数的p进制表示，而对于一个正整数`$x$`，有 `$tm + x, t \in N$` 模m的余数值与x相同。

而对于 `$x$` 的p进制表示，可以唯一的确定一条交易链 (每位+1构成交易链)，并与 `$tm + x$` 构成的交易链hash相同。

但是因为交易链编号限制，只能在 `$k\ge p$` 时快速给出解。

对于 `$k \lt p$` 的情况，还是只想到了暴力搜索 (通过暴力搜索 tm)，但是结合上面的 `$k > p$` 情况的快速构造，解出了44分。

但是有两三个 TLE，这种解法肯定不行。


### Editorial

在出题者给出的答案里，使用 Thue-Morse Sequence 给出了一种非常快速的构造方案，主要是利用了m是2的幂这个性质，并且p甚至可以退化为奇数。

下面定义两个序列 `$f(N)$` 和 `$g(N)$`，定义为

`$f(1) = [1]$`

`$g(0) = [0]$`

`$f(N) = f(N - 1) \oplus g(N - 1)$`

`$g(N) = g(N - 1) \oplus f(N - 1)$`

这里 `$\oplus$` 是指级联两个序列。

定义计算 certificate 的函数为 `$H(A, m), A = [a_0, a_1, ..., a_{n - 1}]$`。

显然, N 一直是2的幂，令 `$N = 2^n$`，那么存在一个足够大的 `$N$` ，`$H(f(N), m) = H(g(N), m)$`，这里 m 必须是2的幂。

最有意思的是它的证明，我们可以通过证明知道，在 `$m \le 2^{32}$` 的情况下，这样的 `$N$` 大约在 `$\sqrt{m}$` 左右。

下面是证明：

显然，我们知道 `$\overline{f(N)} = g(N)$`。

令 `$T = H(f(N), m) - H(g(N), m)$`, 显然

`$T = p^{2^n - 1} - p^{2^n - 2} - p^{2^n - 3} + p^{2^n - 4} - ... \pm 1$`

那么 `$T = (p - 1)(p^2 - 1)\cdots(p^{2^{n-1}} - 1)$`。

OK，还有最后一块砖: 如果 `$2^s|(p - 1)$`，那么 `$2^{s + 1} |(p^2 - 1)$`，这个证明很简单，就不证了。

**这里答案漏考虑 p = 2 的情况，但是这种情况太容易了，所以直接忽略了...而且test cases里也没有😅**

所以由p为质数即奇数，`$2 | (p - 1)$`，那么一定有 `$2^n | (p^{2^n} - 1)$`。

故而一定有 `$2^{n(n - 1)/2} | T$`，只要 `$n(n-1)/2 \ge x，m = 2^x$`，就有 `$m | T$`。

可以看到，`$N$` 的收敛岂止是快。

得到 `$f, g$` 稍微处理下就出答案了，因为答案要求长度为 $n$ 的整数倍，所以复杂度为 `$O(n)$`。

### 总结

这个题目里Certificate的计算方式就是 Polynominal Hash，它和 Thue-Morse Sequence 一样，都有一些很有意思的性质，留着之后慢慢发掘一下。

在看到 m为2的幂的条件时，第一反应肯定是能够做什么文章，而我想来想去想将 Fermat's Last Theorem 应用上去，始终无法如愿。这道题由于解空间庞大，所以想必是构造解，只是实在想不到如何应用p是素数以及m是2的幂，可以看到我的思路中始终无法应用这两点。

Editorial 的解法简直精妙，更偏近于数学了。

### References

1. http://codeforces.com/blog/entry/4898
2. https://www.hackerrank.com/contests/gs-codesprint/challenges/transaction-certificates/editorial
3. https://www.wikiwand.com/en/Thue%E2%80%93Morse_sequence


