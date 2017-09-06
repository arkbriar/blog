---
title: "AGC019-F Mysterious Combinators"
date: 2017-09-06T21:16:06+08:00
draft: false
categories: ["Development", "Mathematics"]
tags: ["math", "combination"]
toc: true
comments: true
---

原题目在 AtCoder Grand Contest 019，F - Yes or No。

把它改成数学题，题目大意如下：

> 假设你有M+N个问题要回答，每个问题的回答不是Yes就是No。你知道其中有N个Yes，M个No，但是并不知道顺序。你将按顺序一个一个回答问题，并且答完一道题后立刻就能知道这道题的正确答案。
> 假设你每次回答问题都采取最大化期望正确题目数的方式，请问期望正确题目数是多少？

### 正确答案

令 `$E(M, N)$` 表示已知(M, N)x(Yes, No)的期望正确题目数。

则

`$E(M, N) = E(N, M)$`，且

`$E(M, N) = \dfrac{\sum\limits_{k = 1}^{k = N}\binom{2k}{k}\binom{M + N - 2k}{N - k}}{2\binom{M + N}{N}} + M, M \ge N$`

### 归纳证明

显然，所谓最大化期望的方式就是选当前答案多的那个，所以有

1. `$E(M, N) = \dfrac{M}{M + N}\left(E(M - 1, N) + 1\right) + \dfrac{N}{M + N}E(M, N - 1), M \ge N$`

2. `$E(M, 0) = M$`

由两条及对称性 `$E(M, N) = E(N, M)$ 可以推出任何 $E(M, N)$`。

令 `$F(M, N) = E(M, N) - M, M \ge N$，以及 $F(M, N) = F(N, M)$`

我们有 

1. `$F(M, N) = \dfrac{M}{M + N}F(M - 1, N) + \dfrac{N}{M + N}F(M, N - 1), M \gt N$`
2. `$F(N, N) = F(N, N - 1) + \dfrac{1}{2}$`

令 `$G(M, N) = \binom{M + N}{N}F(M, N), M \ge N$，同样有 $G(M, N) = G(N, M)$`

同时下两式成立

1. `$G(M, N) = G(M - 1, N) + G(M, N - 1), M \gt N$`
2. `$G(N, N) = \dfrac{1}{2}\binom{2N}{N} + 2G(N, N-1)$`

所以我们只需要验证 `$G(M, N) = \dfrac{\sum\limits_{k = 1}^{k = N}\binom{2k}{k}\binom{M + N - 2k}{N - k}}{2} = \sum\limits_{k = 1}^{k = N}\binom{2k - 1}{k}\binom{M + N - 2k}{N - k}, M\ge N$` 即可。

首先显然 `$G(M, 0) = 0$` 成立。

令 `$M = N = 1$，有$G(1, 1) = 1 + 2G(1, 0) = 1$，且 $G(M, 1) = G(M - 1, 1) + G(M, 0), M \gt 1$，所以 $G(M, 1) = 1, M \ge 1$` 成立。

假设对 `$\forall n.n \le N - 1, \forall m.m\ge n$, 都有 $G(m, n) = \sum\limits_{k = 1}^{k = n}\binom{2k - 1}{k}\binom{m + n - 2k}{n - k}$`, 则有

`$G(N, N) = \binom{2N - 1}{N - 1} + 2\sum\limits_{k = 1}^{k = N - 1}\binom{2k - 1}{k}\binom{2N - 1 - 2k}{N - k}$`
`$ = \binom{2N - 1}{N - 1} + \sum\limits_{k = 1}^{k = N - 1}\binom{2k - 1}{k}\binom{2N - 2k}{N - 1 - k}$`
`$=\sum\limits_{k = 1}^{k = N}\binom{2k - 1}{k}\binom{2N - 2k}{N - k}$` 

假设 `$\forall m. m \le M, m \ge n$`, 上式同样成立，则有

`$G(M + 1, N) = G(M, N) + G(M + 1, N - 1)$`
`$= \sum\limits_{k = 1}^{k = N}\binom{2k - 1}{k}\binom{M + N - 2k}{N - k} + \sum\limits_{k = 1}^{k = N - 1}\binom{2k - 1}{k}\binom{M + N - 2k}{N - 1- k}$`
`$ = \sum\limits_{k = 1}^{k = N - 1}\binom{2k - 1}{k}\left(\binom{M + N - 2k}{N - k} + \binom{M + N- 2k}{N - 1- k}\right) + \binom{2N-1}{N}$`
`$ = \sum\limits_{k = 1}^{k = N - 1}\binom{2k - 1}{k}\binom{M + N + 1 - 2k}{N - k}+  \binom{2N-1}{N} = \sum\limits_{k = 1}^{k = N}\binom{2k - 1}{k}\binom{M + N + 1 - 2k}{N - k}$`

所以 `$\forall n.n\le N, \forall m.m\ge n$`，上式成立。

所以 `$\forall m, \forall n.m \ge n$`，上式成立。

证毕。


### 头疼的问题

看这个解的形式，感觉上去像是可以有构造解，但是我绞尽脑汁也想不出来。而且更关键的是，在不知道解形式的情况下，根本不能完成上述归纳证明...

我想我得求助下老朋友...或者发个邮件问下解题的大佬了...

### 构造解

结果刚洗完澡就研究出来了...难道是传说中的洗澡解题法？？？

#### 问题映射

假设我们有一个MxN的矩形格子，我们把格子放置在坐标系第一象限，格子左下角在(0, 0)，右上角在(M, N)。

那么，一共存在 `$\binom{M + N}{N}$` 条不同的路径能够连通左下角和右上角，(从左下到右上为M次向右和N次向上的排列)。

**下述所有路径构造过程均从右上角(M,N)至左下角(0,0)，且 M >= N，提前声明。**

下面定义一条路径到答题方式的映射：

1. 当处于格点 (x, y) 时，表明当前还剩 x + y 题，其中 x 题为Yes，y题为No
2. 当处于格点 (x, y) 时
    + 如果 x >= y，那么路径向左(x - 1, y)表明(答Yes，正确)，向下(x, y - 1)表明(答Yes，错误)
    + 如果 x < y, 则向左(x - 1, y)表明(答No，错误)，向下表明(答No，正确)

显然，通过上述表示映射，**一条路径唯一地确定出题和答题方式，反之亦然。**

那么原问题中正确答案的数目怎么计算呢？可以看到，路径经过格点(x, y)时，正确或是错误是由路径走向唯一确定的，也就是由边唯一确定的

1. 所有 x >= y, (x, y)-(x - 1, y) 的边计数为1，(x, y)-(x, y - 1)的边计数为0
2. 所有 x < y, (x, y)-(x - 1, y) 的边计数为0，(x, y)-(x, y - 1)为1

我们将计数标到格子的所有边上，那么我们正确答案的计数就等于所有路径上所经过的边权和。

#### 问题求解

这里我不画图，大家还是在稿纸上画一下。

令 `$w(x, y, 1)$` 代表(x,y)-(x-1,y)边上的权，`$w(x, y, 0)$`代表(x, y-1)边上的权，那么

1. `$x \ne y, w(x, y, 1) = w(y, x, 0)$`
2. `$x = y, w(x, y, 1) = 1, w(x, y, 0) = 0$`

这个脑补出来就是除了(x, x)格点出来的边，其余边都关于`$y = x$`对称。

假设任意一条路径S，其在格子内与y=x对称得到的路径为S' (可以对称的部分对称)。

令`$w(S)$`表示S上所有边的加权和，可以证明：

`$w(S) + w(S')= 2M + \sum\limits_{p, p \in S \cap \{(x, y) | y = x\}}w(p)$`

证明如下：

显然，假设 S 与 `$y = x$` 第一次相交于 (X, X)，那么到达 (X, X)之前权和总共为 (M - X)；

从 (X, X) 开始到 (0, 0)，两条路径 S + S' 的加权和为 `$2X + \sum\limits_{p, p \in S \cap \{(x, y) | y = x\}}w(p)$`：

因为假设 `$w(x,x,1)=w(x,x,0)=0$`，那么边关于`$y=x$`就完全对称，我们将S所有路径全部翻到`$y=x$`之上不影响路径权和，则向下永远为1，向左永远为0，权和为X。而 S + S' 中 `$w(x,x,1)$`和`$w(x,x,0)$` 都只能获得一次，所以上式成立。

所以对于所有路径，边权和为 `$W = \sum\limits_{S}w(S) = \sum\limits_{S}\dfrac{2M + \sum\limits_{p, p \in S \cap \{(x, y) | y = x\}}w(p)}{2}$`，也就是

`$W = M\binom{M + N}{N} + \frac{\sum\limits_{S}{\sum\limits_{p, p \in S \cap \{(x, y) | y = x\}}w(p)}}{2}$`，我们只需要再计算每个(x,x)点被被多少条路径经过，再加和就行。

对于一个点(x,y)，经过的路径数为`$\binom{x + y}{x}\binom{M + N - x - y}{N - y}$`，超级显然...

所以，`$W = M\binom{M + N}{N} + \frac{\sum\limits_{k = 1}^{N}\binom{2k}{k}\binom{M + N - 2k}{N - k}}{2}$`。

所以期望为 `$\dfrac{W}{\binom{M + N}{N}} = M + \frac{\sum\limits_{k = 1}^{N}\binom{2k}{k}\binom{M + N - 2k}{N - k}}{2\binom{M + N}{N}}$`，终于证毕。

### 总结

脑子不好使的时候，我选择洗澡🛀（误

这题的解法构造十分巧妙，没图解释/理解起来会很累，大家看的时候还是自己画一画图比较好。

我花了三天时间才想出来，期间还看了editorial，提示了我格子构造法...如果答题没什么时间想，我大概就直接O(MN)的dp了...

### 附录

#### 小结论

这次研究题目还有一个小结论，假设 `$p$` 是质数，`$a, b, c, d$` 与 `$p$` 均互质，且存在 `$x, y \lt p$`，使得 `$a \equiv bx \ (\textrm{mod} \ p)$`，`$c \equiv dy \ (\textrm{mod} \ p)$`。

那么 `$ad + bc \equiv (x + y)bd \ (\textrm{mod} \ p)$`，证明如下

`$ad + bc \equiv xbd^pb^{p - 1} + ydb^pd^{p - 1} \ (\textrm{mod} \ p) \equiv (bd)^p(x + y) \ (\textrm{mod} \ p) \equiv bd(x + y) \ (\textrm{mod} \ p)$`，证毕。

用于分数 `$\frac{a}{b}$` 对于 `$p$` 的模数 `$ab^{-1} \ (\textrm{mod} \ p)$` 的加和。
