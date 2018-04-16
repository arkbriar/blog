---
title: "非质数的欧拉定理扩展 (Euler Theorem for Non-coprime)"
date: 2017-08-23T22:02:59+08:00
draft: false
categories: ["Mathematics"]
tags: ["math", "euler theorem", "non-coprime"]
toc: true
comments: true
---

刚遇到一道可怕的题目，迭代次幂(tetration)在超级大的范围下快速求解对某个模数的幂，模数范围在 1 到 1e18 之间。

OK，这道题其实思路很清晰，用欧拉定理降幂，但是最难的部分在于

1. 对 m 进行质因数分解
2. 使用欧拉定理在非互质情况的扩展形式

我们先把m的质因数分解放一放 (其实还没解决)... 先来解决第二个问题。

<!--more-->

### Euler Theorem & Fermat's Little/Last Theorem

设m是大于1的整数，`$(a, m) = 1$`，则

$$a^{\phi(m)} \equiv 1 \ (\textrm{mod}\ m)$$

这里 `$\phi(m)$` 是欧拉函数，如果 `$m = p_1^{k_1}p_2^{k_2}\cdots p_s^{k_s}$，$\phi(m) = m(1 - \frac{1}{p_1})\cdots (1 - \frac{1}{p_s})$`。

这里引入简化剩余系的概念，对整数m简化剩余系为一个集合 `$R(m) = \{r | 0 \le r \lt m, (r, m) = 1\}$`，也就是所有m的模数里与m互质的数的集合。

显然 `$|R(m)| = \phi(m)$`。

#### Proven for Euler Theorem

这个证明应该很常见了，我还是写一下，也很简单，对于整数a和m，`$(a, m) = 1$`，m的简化剩余系 `$R(m) = \{r_1, r_2, ..., r_{\phi(m)}\}$`

`$(ar_1)(ar_2)\cdots(ar_{\phi(m)}) \equiv a^{\phi(m)}(r_1r_2\cdots r_{\phi(m)})\ (\textrm{mod}\ m)$`

而因为 `$(a, m) = 1$`, 显然有

1. `$ar_i \not\equiv 0 \ (\textrm{mod} \ m)$`
2. `$ar_i \not\equiv ar_j \ (\textrm{mod} \ m), i \ne j$`

因此 `$b_i = (ar_i\ \textrm{mod} \ m)$` 同样构成了m的简化剩余系。

所以 `$\prod_{i = 1}^{i = \phi(m)} b_i \equiv \prod_{i = 1}^{i = \phi(m)} r_i \ (\textrm{mod} \ m)$`

所以 `$\prod_{i = 1}^{i = \phi(m)} r_i \equiv a^{\phi(m)}\prod_{i = 1}^{i = \phi(m)} r_i \ (\textrm{mod} \ m)$`

那么 `$(a^{\phi(m)} - 1)\prod_{i = 1}^{i = \phi(m)} r_i \equiv 0 \ (\textrm{mod} \ m)$`

由 `$(r_i, m) = 1$`，显然 `$a^{\phi(m)} - 1 \equiv 0 \ (\textrm{mod} \ m)$`

证毕。

#### Fermat's Little Theorem

欧拉定理的特殊情况。


### Euler Theorem for Non-coprime

先给出结论，设a，m是正整数，我们有 `$a^{k\phi(m) + b} \equiv a^{\phi(m) + b} \ (\textrm{mod} \ m), k \in N^+$`，显然只需要考虑 `$(a, m) \ne 1$`

我们通过证明两个弱化的结论，来证明上述结论。

1. 如果p是m的质因数，即 `$(p, m) = p$`，那么`$p^{2\phi(m)} \equiv p^{\phi(m)} \ (\textrm{mod} \ m)$`
2. `$a^{2\phi(m)} \equiv a^{\phi(m)} \ (\textrm{mod} \ m)$`

令 `$m = p_1^{k_1}p_2^{k_2}\cdots p_s^{k_s}$`。

#### 弱化1(p, m)

不妨设 `$p = p_1$`, 令 `$m' = m \ / \ p_1^{k_1}, k = k_1$`，显然 `$(p^{k}, m') = 1$`。

易见，`$p^{2\phi(m)} - p^{\phi(m)} \equiv 0 \ (\textrm{mod} \ m')$`。

且, `$p^{2\phi(m)} - p^{\phi(m)} \equiv 0 \ (\textrm{mod} \ p^k)$`，因为 `$\phi(m) \ge p^{k - 1}(p - 1) \ge k$` 永远成立。

由中国剩余定理，`$(p^{2\phi(m)} - p^{\phi(m)}) \ (\textrm{mod} \ p^k\cdot m')$`解存在且唯一，而这里显然是0.

所以，`$p^{2\phi(m)} \equiv p^{\phi(m)} \ (\textrm{mod} \ m)$`

#### 弱化2(a, m)

假设 `$(a, m) \ne 1$`，并且质数p，有 `$p | (a,m)$`，同上不妨设`$p = p_1, k = k_1$`, 定义`$a = pa_1, m = p^km_1$`，我们有

`$a^{2\phi(m)} - a^{\phi(m)} = p^{2\phi(m)}a_1^{2\phi(m)} - p^{\phi(m)}a_1^{\phi(m)}$`

`$= p^{2\phi(m)}a_1^{2\phi(m)} -  p^{\phi(m)}a_1^{2\phi(m)} + p^{\phi(m)}a_1^{2\phi(m)} - p^{\phi(m)}a_1^{\phi(m)}$`

因此 `$a^{2\phi(m)} - a^{\phi(m)} = (p^{2\phi(m)} - p^{\phi(m)})a_1^{2\phi(m)} + p^{\phi(m)}(a_1^{2\phi(m)} -a_1^{\phi(m)})$`

`$\equiv p^{\phi(m)}(a_1^{2\phi(m)} -a_1^{\phi(m)}) \ (\textrm{mod} \ m)$`

即要证明 `$p^{\phi(m)}(a_1^{2\phi(m)} -a_1^{\phi(m)}) \equiv 0\ (\textrm{mod} \ m)$`，显然即 `$a_1^{2\phi(m)} -a_1^{\phi(m)} \equiv 0\ (\textrm{mod} \ m_1)$`

如果 `$(a_1, m_1) = 1$`，即得证，否则 `$a_1 < a$`，我们总能找到质数 `$q | (a_1, m_1)$`，然后递降，而 `$a_1$` 一定是整数，所以 `$a_1 \ge 1$`，即存在递降下限1，而 `$(1, m_t) = 1$` 恒成立。

故得证。

#### 最终结论

由弱化结论2，很容易得知 `$a^{k\phi(m)} \equiv a^{\phi(m)} \ (\textrm{mod} \ m), k \in N^+$`，以及 `$a^{k\phi(m) + b} \equiv a^{\phi(m) + b} \ (\textrm{mod} \ m), k \in N^+, b \in N, b \le m$`，得证。

### 总结

证明这个花了我一段时间，果然数论已经全扔了=_=。

然而还有大整数分解让我头疼...

### Reference

[1] 《初等数论》(第三版)，高等教育出版社


