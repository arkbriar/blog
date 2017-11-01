---
title: "Project Euler #188 -- The Hyperexponentiation of A Number"
date: 2017-08-25T21:32:26+08:00
draft: false
categories: ["Development", "Algorithm", "Project Euler"]
tags: ["hackerrank", "projecteuler"]
toc: true
comments: true
---

接上次的博文，我们来解决大整数分解问题，并最终解决 Project Euler #188。

回忆一下，问题要求解的是 `$a\uparrow\uparrow b \ (\textrm{mod} \ m)$`，其中 `$1 \le a, b, m \le 10^{18}$`。

其实这里的整数在整数分解领域并不算太大，之前并没有学习过这类的算法，正好也算是补上了。在这里我使用了 Pollard Rho 算法，其他的算法还有 Fermat Rho 和 Quadratic Sieve 算法。

<!--more-->

### Pollard Rho

#### 算法伪代码

```
x ← 2; y ← 2; d ← 1
while d = 1:
    x ← g(x)
    y ← g(g(y))
    d ← gcd(|x - y|, n)
if d = n: 
    return failure
else:
    return d
```

#### 核心思想

假设要分解的整数 `$n = pq$`，其中 `$p, q$` 都是质数，不妨设 `$p \le q$`。我们使用 `$g(x) = (x^2 + 1) \ (\textrm{mod} \ n)$` 来生成一个伪随机数序列。

不妨设初始的x为2，那么我们有一个序列为 `$\{x_1 = g(2), x_2 = g(g(2)), ... x_k = g^k(2),...\}$`，因为序列中的值一定是有穷的，并且序列的每一个数只依赖于前一个数，所以该序列一定会循环。

定义 `$\{y_k = x_k\ (\textrm{mod} \ p), k = 1, 2, ...\}$` 序列，那么这个序列也一定会循环，并且由于 `$p$` 比 `$n$` 小得多，所以序列循环也一定会比 `$\{x_k\}$` 序列循环得早许多。

那么我们只需要检测到这个环，假设环长为r，他一定有`$y_{r+k} - y_{k} \equiv 0 \ (\textrm{mod} \ p)$`，所以使用 Floyd Cycle Detection ，并使用最小公约数来检测环的出现 (最小公约数不为1)，此时如果最小公约数为不等于n，那么它一定是p或者q。

唯一需要注意的是环出现的时候可能最小公约数为n，也就是上述算法中x等于y。此时我们随机更换序列种子x，并进行下一轮分解。

#### 时间复杂度

期望运行时间正比于n的最小素数的开根，此处大约为 O(3.2e4)。

### #188 整体思路

定义 `$T(a, b) = a\uparrow\uparrow b$`。

我们有 `$T(a, b) = a^{T(a, b - 1)}$`。

由欧拉定理的扩展，如果 `$T(a, b - 1) >= \phi(m)$`，则有 `$T(a,b) \equiv a^{T(a, b - 1) \ \%\  \phi(m) + \phi(m)} \ (\textrm{mod} \ m)$`，否则有 `$T(a,b) \equiv a^{T(a, b - 1) \ \%\  \phi(m)} \ (\textrm{mod} \ m)$`，此时需要求解 `$T(a, b - 1) \ (\textrm{mod}\ \phi(m))$`。

同理，`$T(a, b - 1) \equiv a^{T(a, b - 2) \ \%\  \phi(\phi(m))\ ?+\ \phi(\phi(m))} \ (\textrm{mod} \ \phi(m))$`，此时求解 `$T(a, b - 2) \ (\textrm{mod}\ \phi(\phi(m)))$`，我们可以一直递归下去。

直到求解 `$T(a, 1)\ (\textrm{mod} \ \phi^{b - 1}(m))$`，或者 `$T(a, b') \ (\textrm{mod} \ 1), \phi^{b - b'}(m) = 1$` 为止。

#### 递归深度

递归深度顶多为 min(128, b - 1)，证明如下：

递归结束条件有两个，一个是 b 等于 1，或者欧拉函数为1。

我们证明 `$m \ge 2$` 时，`$\phi(\phi(m)) \le m/2$` 即可，由 `$\phi(m)$` 定义, `$1 \le \phi(m) \le m$` 恒成立。

分以下两种情况：

1. m 为偶数，则由定义 `$\phi(m) \le m / 2$，$\phi(\phi(m)) \le \phi(m) \le m / 2$`
2. m 为奇数，则由定义`$\phi(m)$`一定为偶数，`$\phi(\phi(m)) \le \phi(m) / 2 \le m / 2$`

证毕。

所以如果 `$\phi^{s}(m) = 1, m < 2^{64}$`，那么 `$s \le 64 \times 2 = 128$` 恒成立，所以递归深度最大不会超过 128。

#### 扩展欧拉定理的应用

扩展形式由于有一个大小比较的条件，所以需要估算当前栈迭代次幂的大小，而迭代次幂 (tetration) 增长十分快，所以值在 (2^63 - 1) 以内的a和b甚至可以枚举出来：

a | b | T(a, b)
:----: | :----: | -----:
1 | any | 1
any | 1 | a
2 | 2 | 4
2 | 3 | 16
2 | 4 | 65536
3 | 2 | 27
3 | 3 | 7625597484987
4 | 2 | 64
... | ... |...
15| 2 | 437893890380859375

这些数我们可以轻易的计算出来，与模数进行比较，而其余的一定大于模数。

#### 大整数分解

由于 `$m$` 的范围，我先打表 1e6 内所有的素数，并先将 m 中这样的质因子全部分解，假设剩余的数为 `$m'$`，那么 `$m'$` 如果是合数，一定是两个质数 `$p, q \gt 1000000$` 的乘积。

如果 `$m' \le 1e12$`，那么 `$m'$` 一定是素数，否则我们先对 `$m'$` 进行素数测试 (Miller-Rabin)，如果为合数再使用 Polland-Rho 进行分解，一旦分解一定为两个素数。 

#### 64位模乘trick

Gcc/Clang 均提供内置类型 `__int128_t`，可以支持128位的运算，而如果运行在 intel x86_64 架构上，可以直接使用如下汇编

```cpp
long mulmod(long a, long b, long m) {
    long res;
    asm("mulq %2; divq %3" : "=d"(res), "+a"(a) : "S"(b), "c"(m));
    return res;
}
```

#### 算法流程

`$T(a, b, m)$`:

1. 如果 a == 1 或者 b == 1，返回 a % m
2. 如果 m == 1，返回 0
3. 对m进行质因数分解，并计算欧拉函数 `$\phi(m)$`
4. 递归计算 `$e = T(a, b - 1, \phi(m))$`
5. 估算 `$T(a, b - 1)$` 并与 `$\phi(m)$` 比较大小，如果 `$T(a, b - 1) \ge \phi(m)$，$e = e + \phi(m)$`
6. 计算 `$a ^ e \% m$`

整个流程保证了所有操作数都在64位以内，递归深度最大为 min(128, b - 1)。

算法代码托管在 https://github.com/arkbriar/hackerrank-projecteuler/blob/master/cpp/188.cc 。


### References

[1] https://en.wikipedia.org/wiki/Pollard%27s_rho_algorithm


