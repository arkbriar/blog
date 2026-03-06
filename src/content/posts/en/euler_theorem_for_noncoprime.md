---
title: "Euler's Theorem Extension for Non-coprime Cases"
published: 2017-08-23T22:02:59+08:00
draft: false
category: "Mathematics"
tags: ["number-theory", "euler-theorem", "modular-arithmetic"]
---

I just encountered a terrifying problem: computing iterated exponentiation (tetration) modulo some number quickly under an extremely large range, where the modulus is between 1 and 1e18.

OK, the approach for this problem is actually quite clear -- use Euler's theorem to reduce the exponent. But the hardest parts are:

1. Factorizing m into prime factors
2. Using the extended form of Euler's theorem for non-coprime cases

Let's set aside the prime factorization of m for now (actually still unsolved)... and focus on the second problem first.


### Euler Theorem & Fermat's Little/Last Theorem

Let m be an integer greater than 1, and $(a, m) = 1$. Then

$$a^{\phi(m)} \equiv 1 \ (\textrm{mod}\ m)$$

Here $\phi(m)$ is Euler's totient function. If $m = p_1^{k_1}p_2^{k_2}\cdots p_s^{k_s}$, then $\phi(m) = m(1 - \frac{1}{p_1})\cdots (1 - \frac{1}{p_s})$.

Here we introduce the concept of a reduced residue system. For an integer m, the reduced residue system is the set $R(m) = \{r | 0 \le r \lt m, (r, m) = 1\}$, i.e., the set of all residues modulo m that are coprime to m.

Clearly $|R(m)| = \phi(m)$.

#### Proven for Euler Theorem

This proof should be quite well-known. I'll write it out anyway -- it's also quite simple. For integers a and m with $(a, m) = 1$, let the reduced residue system of m be $R(m) = \{r_1, r_2, ..., r_{\phi(m)}\}$.

$(ar_1)(ar_2)\cdots(ar_{\phi(m)}) \equiv a^{\phi(m)}(r_1r_2\cdots r_{\phi(m)})\ (\textrm{mod}\ m)$

Since $(a, m) = 1$, we obviously have:

1. $ar_i \not\equiv 0 \ (\textrm{mod} \ m)$
2. $ar_i \not\equiv ar_j \ (\textrm{mod} \ m), i \ne j$

Therefore $b_i = (ar_i\ \textrm{mod} \ m)$ also forms a reduced residue system of m.

So $\prod_{i = 1}^{i = \phi(m)} b_i \equiv \prod_{i = 1}^{i = \phi(m)} r_i \ (\textrm{mod} \ m)$

Thus $\prod_{i = 1}^{i = \phi(m)} r_i \equiv a^{\phi(m)}\prod_{i = 1}^{i = \phi(m)} r_i \ (\textrm{mod} \ m)$

Then $(a^{\phi(m)} - 1)\prod_{i = 1}^{i = \phi(m)} r_i \equiv 0 \ (\textrm{mod} \ m)$

Since $(r_i, m) = 1$, it is clear that $a^{\phi(m)} - 1 \equiv 0 \ (\textrm{mod} \ m)$.

Q.E.D.

#### Fermat's Little Theorem

This is a special case of Euler's theorem.


### Euler Theorem for Non-coprime

First, let us state the conclusion. Let a and m be positive integers. We have $a^{k\phi(m) + b} \equiv a^{\phi(m) + b} \ (\textrm{mod} \ m), k \in N^+$. Clearly we only need to consider the case $(a, m) \ne 1$.

We prove the above conclusion by proving two weaker results.

1. If p is a prime factor of m, i.e., $(p, m) = p$, then $p^{2\phi(m)} \equiv p^{\phi(m)} \ (\textrm{mod} \ m)$
2. $a^{2\phi(m)} \equiv a^{\phi(m)} \ (\textrm{mod} \ m)$

Let $m = p_1^{k_1}p_2^{k_2}\cdots p_s^{k_s}$.

#### Weakened Result 1 (p, m)

Without loss of generality, let $p = p_1$, and set $m' = m \ / \ p_1^{k_1}, k = k_1$. Clearly $(p^{k}, m') = 1$.

It is easy to see that $p^{2\phi(m)} - p^{\phi(m)} \equiv 0 \ (\textrm{mod} \ m')$.

Also, $p^{2\phi(m)} - p^{\phi(m)} \equiv 0 \ (\textrm{mod} \ p^k)$, because $\phi(m) \ge p^{k - 1}(p - 1) \ge k$ always holds.

By the Chinese Remainder Theorem, the solution to $(p^{2\phi(m)} - p^{\phi(m)}) \ (\textrm{mod} \ p^k\cdot m')$ exists and is unique, and here it is clearly 0.

Therefore, $p^{2\phi(m)} \equiv p^{\phi(m)} \ (\textrm{mod} \ m)$.

#### Weakened Result 2 (a, m)

Assume $(a, m) \ne 1$, and that a prime p satisfies $p | (a,m)$. As before, without loss of generality let $p = p_1, k = k_1$, and define $a = pa_1, m = p^km_1$. We have:

$a^{2\phi(m)} - a^{\phi(m)} = p^{2\phi(m)}a_1^{2\phi(m)} - p^{\phi(m)}a_1^{\phi(m)}$

$= p^{2\phi(m)}a_1^{2\phi(m)} -  p^{\phi(m)}a_1^{2\phi(m)} + p^{\phi(m)}a_1^{2\phi(m)} - p^{\phi(m)}a_1^{\phi(m)}$

Therefore $a^{2\phi(m)} - a^{\phi(m)} = (p^{2\phi(m)} - p^{\phi(m)})a_1^{2\phi(m)} + p^{\phi(m)}(a_1^{2\phi(m)} -a_1^{\phi(m)})$

$\equiv p^{\phi(m)}(a_1^{2\phi(m)} -a_1^{\phi(m)}) \ (\textrm{mod} \ m)$

So we need to prove $p^{\phi(m)}(a_1^{2\phi(m)} -a_1^{\phi(m)}) \equiv 0\ (\textrm{mod} \ m)$, which clearly reduces to $a_1^{2\phi(m)} -a_1^{\phi(m)} \equiv 0\ (\textrm{mod} \ m_1)$.

If $(a_1, m_1) = 1$, the result follows immediately. Otherwise $a_1 < a$, and we can always find a prime $q | (a_1, m_1)$, then descend. Since $a_1$ must be an integer, we have $a_1 \ge 1$, providing a lower bound for the descent, and $(1, m_t) = 1$ always holds.

Thus proved.

#### Final Conclusion

From Weakened Result 2, it is easy to see that $a^{k\phi(m)} \equiv a^{\phi(m)} \ (\textrm{mod} \ m), k \in N^+$, and $a^{k\phi(m) + b} \equiv a^{\phi(m) + b} \ (\textrm{mod} \ m), k \in N^+, b \in N, b \le m$. Q.E.D.

### Summary

Proving this took me quite a while. Clearly I've forgotten all my number theory =_=.

And there's still large integer factorization giving me a headache...

### Reference

[1] "Elementary Number Theory" (3rd edition), Higher Education Press
