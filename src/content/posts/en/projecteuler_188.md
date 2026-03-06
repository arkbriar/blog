---
title: "Hyperexponentiation of an Integer (Project Euler #188 -- The Hyperexponentiation of A Number)"
published: 2017-08-25T21:32:26+08:00
draft: false
category: "Mathematics"
tags: ["number-theory", "factorization", "project-euler"]
---

Following up on the previous blog post, let us solve the large integer factorization problem and ultimately solve Project Euler #188.

Recall that the problem asks us to compute $a\uparrow\uparrow b \ (\textrm{mod} \ m)$, where $1 \le a, b, m \le 10^{18}$.

In the field of integer factorization, the integers here are not particularly large. I had never studied algorithms of this kind before, so this was a good opportunity to fill that gap. Here I used the Pollard Rho algorithm; other algorithms include the Fermat Rho and Quadratic Sieve algorithms.


### Pollard Rho

#### Algorithm Pseudocode

```
x <- 2; y <- 2; d <- 1
while d = 1:
    x <- g(x)
    y <- g(g(y))
    d <- gcd(|x - y|, n)
if d = n:
    return failure
else:
    return d
```

#### Core Idea

Suppose the integer to be factored is $n = pq$, where $p, q$ are both primes. Without loss of generality, assume $p \le q$. We use $g(x) = (x^2 + 1) \ (\textrm{mod} \ n)$ to generate a pseudorandom number sequence.

Suppose the initial x is 2. Then we have a sequence $\{x_1 = g(2), x_2 = g(g(2)), ... x_k = g^k(2),...\}$. Since the values in the sequence are finite and each number depends only on its predecessor, the sequence must eventually cycle.

Define the sequence $\{y_k = x_k\ (\textrm{mod} \ p), k = 1, 2, ...\}$. This sequence must also cycle, and since $p$ is much smaller than $n$, this sequence will cycle much earlier than the $\{x_k\}$ sequence.

We only need to detect this cycle. Suppose the cycle length is r; it must satisfy $y_{r+k} - y_{k} \equiv 0 \ (\textrm{mod} \ p)$. So we use Floyd Cycle Detection and the greatest common divisor to detect the appearance of the cycle (the GCD is not 1). At this point, if the GCD is not equal to n, it must be either p or q.

The only caveat is that when the cycle appears, the GCD might equal n, i.e., x equals y in the algorithm above. In this case, we randomly change the sequence seed x and proceed with the next round of factorization.

#### Time Complexity

The expected running time is proportional to the square root of the smallest prime factor of n, which is approximately O(3.2e4) here.

### #188 Overall Approach

Define $T(a, b) = a\uparrow\uparrow b$.

We have $T(a, b) = a^{T(a, b - 1)}$.

By the extended Euler's theorem, if $T(a, b - 1) >= \phi(m)$, then $T(a,b) \equiv a^{T(a, b - 1) \ \%\  \phi(m) + \phi(m)} \ (\textrm{mod} \ m)$; otherwise $T(a,b) \equiv a^{T(a, b - 1) \ \%\  \phi(m)} \ (\textrm{mod} \ m)$. In this case, we need to solve $T(a, b - 1) \ (\textrm{mod}\ \phi(m))$.

Similarly, $T(a, b - 1) \equiv a^{T(a, b - 2) \ \%\  \phi(\phi(m))\ ?+\ \phi(\phi(m))} \ (\textrm{mod} \ \phi(m))$, requiring us to solve $T(a, b - 2) \ (\textrm{mod}\ \phi(\phi(m)))$. We can keep recursing.

Until we solve $T(a, 1)\ (\textrm{mod} \ \phi^{b - 1}(m))$, or $T(a, b') \ (\textrm{mod} \ 1), \phi^{b - b'}(m) = 1$.

#### Recursion Depth

The recursion depth is at most min(128, b - 1). The proof is as follows:

There are two termination conditions for the recursion: either b equals 1, or the Euler's totient function equals 1.

We prove that when $m \ge 2$, $\phi(\phi(m)) \le m/2$. By the definition of $\phi(m)$, we always have $1 \le \phi(m) \le m$.

We consider two cases:

1. m is even: by definition $\phi(m) \le m / 2$, so $\phi(\phi(m)) \le \phi(m) \le m / 2$
2. m is odd: by definition $\phi(m)$ must be even, so $\phi(\phi(m)) \le \phi(m) / 2 \le m / 2$

QED.

Therefore, if $\phi^{s}(m) = 1, m < 2^{64}$, then $s \le 64 \times 2 = 128$ always holds, so the recursion depth never exceeds 128.

#### Application of the Extended Euler's Theorem

The extended form has a size comparison condition, so we need to estimate the magnitude of the current tetration. Since tetration grows extremely fast, the values of a and b for which the result stays within (2^63 - 1) can even be enumerated:

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

We can easily compute these numbers and compare them with the modulus, while all others are guaranteed to exceed the modulus.

#### Large Integer Factorization

Given the range of $m$, I first precompute a table of all primes up to 1e6 and factor out all such prime factors from m. Let the remaining number be $m'$. If $m'$ is composite, it must be the product of two primes $p, q \gt 1000000$.

If $m' \le 1e12$, then $m'$ must be prime. Otherwise, we first perform a primality test on $m'$ (Miller-Rabin), and if it is composite, we use Pollard-Rho to factor it -- once factored, the result must be two primes.

#### 64-bit Modular Multiplication Trick

Both Gcc and Clang provide the built-in type `__int128_t`, which supports 128-bit arithmetic. If running on an Intel x86_64 architecture, you can directly use the following assembly:

```cpp
long mulmod(long a, long b, long m) {
    long res;
    asm("mulq %2; divq %3" : "=d"(res), "+a"(a) : "S"(b), "c"(m));
    return res;
}
```

#### Algorithm Flow

$T(a, b, m)$:

1. If a == 1 or b == 1, return a % m
2. If m == 1, return 0
3. Factorize m and compute the Euler's totient function $\phi(m)$
4. Recursively compute $e = T(a, b - 1, \phi(m))$
5. Estimate $T(a, b - 1)$ and compare with $\phi(m)$. If $T(a, b - 1) \ge \phi(m)$, set $e = e + \phi(m)$
6. Compute $a ^ e \% m$

The entire flow ensures that all operands stay within 64 bits, with a maximum recursion depth of min(128, b - 1).

The algorithm code is hosted at https://github.com/arkbriar/hackerrank-projecteuler/blob/master/cpp/188.cc .


### References

[1] https://en.wikipedia.org/wiki/Pollard%27s_rho_algorithm

