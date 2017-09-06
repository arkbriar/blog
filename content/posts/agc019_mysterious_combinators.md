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
