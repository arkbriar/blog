---
title: "Polynomial Hash and Thue-Morse Sequence"
published: 2017-08-21T23:58:42+08:00
draft: false
category: "Mathematics"
tags: ["polynomial-hash", "thue-morse", "hackerrank"]
---

A couple days ago I was working through a [Contest](https://www.hackerrank.com/contests/gs-codesprint/challenges) on Hackerrank. We were given two days, and I didn't expect to get completely stuck on the last problem. Here I document my thought process and takeaways.

The original problem is at https://www.hackerrank.com/contests/gs-codesprint/challenges/transaction-certificates, so I won't restate it here.


### Thought Process

Essentially, the problem asks you to hash a transaction chain and produce two different transaction chains that result in the same hash (a hash collision).

Some potentially useful conditions: p is a prime number, and m is a power of 2.

I won't prove the existence of a solution -- the pigeonhole principle makes it straightforward.

#### Approach 1

By subtracting two hashes, the problem can be transformed into: $\sum\limits_{i = 0}^{n - 1}a_i \cdot p^{n - 1 - i}  \equiv 0 \ (mod\ m), a_i \in (-k, k)$, with the constraint that it cannot be the trivial solution where all $a_i$ are 0.

When $k \gt p$, let $a_{n - 1} = p \% m, a_{n - 2} = -1$, with all others being 0, and we can easily construct the original solution.

But when $k \le p$, the only approach I could think of was brute-force search (searching the solution space of the multivariate linear congruence).


#### Approach 2

By observation, $a_0a_1...a_{n-1}$ forms a base-p representation of a number, and for a positive integer $x$, $tm + x, t \in N$ has the same remainder modulo m as x.

For the base-p representation of $x$, we can uniquely determine a transaction chain (by adding 1 to each digit), and it will have the same hash as the transaction chain formed by $tm + x$.

However, due to the constraint on transaction chain indices, this can only give a fast solution when $k\ge p$.

For the case $k \lt p$, I could still only think of brute-force search (searching through $tm$), but combined with the fast construction for the $k > p$ case above, I managed to score 44 points.

But there were two or three TLE cases, so this approach clearly wouldn't work.


### Editorial

In the author's editorial, a very fast construction method is given using the Thue-Morse Sequence, primarily exploiting the property that m is a power of 2. In fact, p only needs to be odd (not necessarily prime).

Define two sequences $f(N)$ and $g(N)$ as follows:

$f(1) = [1]$

$g(0) = [0]$

$f(N) = f(N - 1) \oplus g(N - 1)$

$g(N) = g(N - 1) \oplus f(N - 1)$

Here $\oplus$ denotes the concatenation of two sequences.

Define the certificate computation function as $H(A, m), A = [a_0, a_1, ..., a_{n - 1}]$.

Clearly, N is always a power of 2. Let $N = 2^n$. Then there exists a sufficiently large $N$ such that $H(f(N), m) = H(g(N), m)$, where m must be a power of 2.

The most interesting part is the proof. Through the proof, we can see that for $m \le 2^{32}$, such an $N$ is approximately $\sqrt{m}$.

Here is the proof:

Clearly, we know that $\overline{f(N)} = g(N)$.

Let $T = H(f(N), m) - H(g(N), m)$. Clearly:

$T = p^{2^n - 1} - p^{2^n - 2} - p^{2^n - 3} + p^{2^n - 4} - ... \pm 1$

Then $T = (p - 1)(p^2 - 1)\cdots(p^{2^{n-1}} - 1)$.

OK, one last piece of the puzzle: if $2^s|(p - 1)$, then $2^{s + 1} |(p^2 - 1)$. The proof is simple, so I'll skip it.

**Note: the editorial overlooked the case p = 2, but this case is trivial, so it was simply ignored... and it wasn't in the test cases either.**

Since p is prime and therefore odd, $2 | (p - 1)$, and it follows that $2^n | (p^{2^n} - 1)$.

Therefore $2^{n(n - 1)/2} | T$, and as long as $n(n-1)/2 \ge x$ where $m = 2^x$, we have $m | T$.

As you can see, the convergence of $N$ is remarkably fast.

Once $f$ and $g$ are obtained, a little processing yields the answer. Since the answer is required to be a multiple of $n$ in length, the complexity is $O(n)$.

### Summary

The certificate computation in this problem is essentially Polynomial Hash, which, like the Thue-Morse Sequence, has some very interesting properties worth exploring further.

When I saw the condition that m is a power of 2, my first reaction was that it must be exploitable somehow. I kept trying to apply Fermat's Last Theorem but could never make it work. Since the solution space is enormous, it must be a constructive solution -- I just couldn't figure out how to leverage both "p is prime" and "m is a power of 2." As you can see in my approaches, I consistently failed to make use of these two conditions.

The editorial's solution is truly elegant -- it leans much more toward pure mathematics.

### References

1. http://codeforces.com/blog/entry/4898
2. https://www.hackerrank.com/contests/gs-codesprint/challenges/transaction-certificates/editorial
3. https://www.wikiwand.com/en/Thue%E2%80%93Morse_sequence
