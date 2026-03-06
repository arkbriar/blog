---
title: "Mysterious Combinators (AGC019-F)"
published: 2017-09-06T21:16:06+08:00
draft: false
category: "Mathematics"
tags: ["combinatorics", "atcoder"]
---

The original problem is from AtCoder Grand Contest 019, F - Yes or No.

Rephrased as a math problem, the statement is as follows:

> Suppose you have M+N questions to answer, and each answer is either Yes or No. You know that N of them are Yes and M are No, but you don't know the order. You answer the questions one by one in order, and immediately learn the correct answer after each question.
> Assuming you always answer in a way that maximizes the expected number of correct answers, what is the expected number of correct answers?


### The Answer

Let $E(M, N)$ denote the expected number of correct answers given (M, N) for (Yes, No).

Then

$E(M, N) = E(N, M)$, and

$E(M, N) = \dfrac{\sum\limits_{k = 1}^{k = N}\binom{2k}{k}\binom{M + N - 2k}{N - k}}{2\binom{M + N}{N}} + M, M \ge N$

### Proof by Induction

Clearly, the strategy that maximizes the expected value is to always guess whichever answer currently has more remaining, so we have

1. $E(M, N) = \dfrac{M}{M + N}\left(E(M - 1, N) + 1\right) + \dfrac{N}{M + N}E(M, N - 1), M \ge N$

2. $E(M, 0) = M$

From these two equations and the symmetry $E(M, N) = E(N, M)$, any $E(M, N)$ can be derived.

Let $F(M, N) = E(M, N) - M, M \ge N$, and $F(M, N) = F(N, M)$

We have

1. $F(M, N) = \dfrac{M}{M + N}F(M - 1, N) + \dfrac{N}{M + N}F(M, N - 1), M \gt N$
2. $F(N, N) = F(N, N - 1) + \dfrac{1}{2}$

Let $G(M, N) = \binom{M + N}{N}F(M, N), M \ge N$, which likewise satisfies $G(M, N) = G(N, M)$

The following two identities hold simultaneously:

1. $G(M, N) = G(M - 1, N) + G(M, N - 1), M \gt N$
2. $G(N, N) = \dfrac{1}{2}\binom{2N}{N} + 2G(N, N-1)$

So we only need to verify that $G(M, N) = \dfrac{\sum\limits_{k = 1}^{k = N}\binom{2k}{k}\binom{M + N - 2k}{N - k}}{2} = \sum\limits_{k = 1}^{k = N}\binom{2k - 1}{k}\binom{M + N - 2k}{N - k}, M\ge N$.

First, clearly $G(M, 0) = 0$ holds.

Setting $M = N = 1$, we get $G(1, 1) = 1 + 2G(1, 0) = 1$, and $G(M, 1) = G(M - 1, 1) + G(M, 0), M \gt 1$, so $G(M, 1) = 1, M \ge 1$ holds.

Assume that for $\forall n.n \le N - 1, \forall m.m\ge n$, we have $G(m, n) = \sum\limits_{k = 1}^{k = n}\binom{2k - 1}{k}\binom{m + n - 2k}{n - k}$, then

$G(N, N) = \binom{2N - 1}{N - 1} + 2\sum\limits_{k = 1}^{k = N - 1}\binom{2k - 1}{k}\binom{2N - 1 - 2k}{N - k}$
$ = \binom{2N - 1}{N - 1} + \sum\limits_{k = 1}^{k = N - 1}\binom{2k - 1}{k}\binom{2N - 2k}{N - 1 - k}$
$=\sum\limits_{k = 1}^{k = N}\binom{2k - 1}{k}\binom{2N - 2k}{N - k}$

Assume for $\forall m. m \le M, m \ge n$, the formula also holds, then

$G(M + 1, N) = G(M, N) + G(M + 1, N - 1)$
$= \sum\limits_{k = 1}^{k = N}\binom{2k - 1}{k}\binom{M + N - 2k}{N - k} + \sum\limits_{k = 1}^{k = N - 1}\binom{2k - 1}{k}\binom{M + N - 2k}{N - 1- k}$
$ = \sum\limits_{k = 1}^{k = N - 1}\binom{2k - 1}{k}\left(\binom{M + N - 2k}{N - k} + \binom{M + N- 2k}{N - 1- k}\right) + \binom{2N-1}{N}$
$ = \sum\limits_{k = 1}^{k = N - 1}\binom{2k - 1}{k}\binom{M + N + 1 - 2k}{N - k}+  \binom{2N-1}{N} = \sum\limits_{k = 1}^{k = N}\binom{2k - 1}{k}\binom{M + N + 1 - 2k}{N - k}$

Therefore for $\forall n.n\le N, \forall m.m\ge n$, the formula holds.

Hence for $\forall m, \forall n.m \ge n$, the formula holds.

Q.E.D.


### The Troublesome Part

Looking at the form of this solution, it feels like there should be a constructive proof, but I racked my brain and couldn't come up with one. More critically, without knowing the form of the solution in advance, it's impossible to carry out the induction proof above...

I think I need to ask an old friend for help... or maybe email the problem setter...

### Constructive Proof

It turns out I figured it out right after taking a shower... Could this be the legendary shower-solving method???

#### Problem Mapping

Suppose we have an M x N rectangular grid. We place the grid in the first quadrant of a coordinate system, with the bottom-left corner at (0, 0) and the top-right corner at (M, N).

There are a total of $\binom{M + N}{N}$ distinct paths connecting the bottom-left and top-right corners (from bottom-left to top-right consists of M rightward steps and N upward steps in some order).

**All paths described below are constructed from the top-right corner (M,N) to the bottom-left corner (0,0), and M >= N is assumed throughout.**

We now define a mapping from a path to an answering strategy:

1. Being at grid point (x, y) means there are x + y questions remaining, of which x are Yes and y are No.
2. At grid point (x, y):
    + If x >= y, then going left to (x - 1, y) means (answer Yes, correct), and going down to (x, y - 1) means (answer Yes, wrong).
    + If x < y, then going left to (x - 1, y) means (answer No, wrong), and going down means (answer No, correct).

Clearly, through this mapping, **a path uniquely determines both the question sequence and the answering strategy, and vice versa.**

How do we compute the number of correct answers in the original problem? We can see that when the path passes through grid point (x, y), whether the answer is correct or wrong is uniquely determined by the direction of the edge, i.e., determined by the edge itself:

1. For all x >= y, edge (x, y)-(x - 1, y) has weight 1, edge (x, y)-(x, y - 1) has weight 0.
2. For all x < y, edge (x, y)-(x - 1, y) has weight 0, edge (x, y)-(x, y - 1) has weight 1.

If we label all edges of the grid with these weights, then the number of correct answers equals the sum of edge weights along each path.

#### Solving the Problem

I won't draw diagrams here; readers should sketch this on paper.

Let $w(x, y, 1)$ denote the weight on edge (x,y)-(x-1,y), and $w(x, y, 0)$ denote the weight on edge (x,y)-(x,y-1). Then:

1. $x \ne y, w(x, y, 1) = w(y, x, 0)$
2. $x = y, w(x, y, 1) = 1, w(x, y, 0) = 0$

Intuitively, this means that except for edges emanating from points (x, x), all edges are symmetric about $y = x$.

For any path S, let S' be its reflection about y=x within the grid (reflecting what can be reflected).

Let $w(S)$ denote the sum of weights on all edges of S. We can show that:

$w(S) + w(S')= 2M + |S \cap \{(x, y) | y = x\}|$

The proof is as follows:

Clearly, suppose S first intersects $y = x$ at (X, X). Before reaching (X, X), the total weight is (M - X).

From (X, X) to (0, 0), the combined weight of the two paths S + S' is $2X + |S \cap \{(x, y) | y = x\}|$:

This is because if we set $w(x,x,1)=w(x,x,0)=0$, then edges are completely symmetric about $y=x$. Flipping all of S's path above $y=x$ does not change the path weight, so downward edges always contribute 1 and leftward edges always contribute 0, giving a weight of X. And in S + S', each of $w(x,x,1)$ and $w(x,x,0)$ can only be collected once, so the formula holds.

Therefore, over all paths, the total edge weight is $W = \sum\limits_{S}w(S) = \sum\limits_{S}\dfrac{2M + |S \cap \{(x, y) | y = x\}|}{2}$, i.e.,

$W = M\binom{M + N}{N} + \frac{\sum\limits_{S}{|S \cap \{(x, y) | y = x\}|}}{2}$. We just need to compute how many paths pass through each point (x,x), then sum up.

For a point (x,y), the number of paths passing through it is $\binom{x + y}{x}\binom{M + N - x - y}{N - y}$, which is obvious...

Therefore, $W = M\binom{M + N}{N} + \frac{\sum\limits_{k = 1}^{N}\binom{2k}{k}\binom{M + N - 2k}{N - k}}{2}$.

So the expected value is $\dfrac{W}{\binom{M + N}{N}} = M + \frac{\sum\limits_{k = 1}^{N}\binom{2k}{k}\binom{M + N - 2k}{N - k}}{2\binom{M + N}{N}}$. Q.E.D.

During the proof, we can observe an interesting fact: in the process of answering questions, if at some point the remaining M equals N, and you simply give up answering and look at the answers, the number of correct answers is always M.

### Summary

When my brain isn't working, I choose to take a shower (just kidding).

The constructive solution to this problem is quite elegant. Without diagrams, it can be tiring to explain or understand, so I recommend drawing it out yourself.

It took me three days to figure this out, and I even looked at the editorial, which hinted at the grid construction approach... If I were under time pressure during a contest, I would probably just go with an O(MN) DP solution...

### Appendix

#### A Small Lemma

During this investigation, I also found a small result. Suppose $p$ is a prime, $a, b, c, d$ are all coprime to $p$, and there exist $x, y \lt p$ such that $a \equiv bx \ (\textrm{mod} \ p)$ and $c \equiv dy \ (\textrm{mod} \ p)$.

Then $ad + bc \equiv (x + y)bd \ (\textrm{mod} \ p)$. The proof is as follows:

$ad + bc \equiv xbd^pb^{p - 1} + ydb^pd^{p - 1} \ (\textrm{mod} \ p) \equiv (bd)^p(x + y) \ (\textrm{mod} \ p) \equiv bd(x + y) \ (\textrm{mod} \ p)$. Q.E.D.

This is useful for computing the sum of fractions $\frac{a}{b}$ modulo $p$, i.e., $ab^{-1} \ (\textrm{mod} \ p)$.
