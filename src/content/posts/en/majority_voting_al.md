---
title: "Boyer-Moore Majority Voting Algorithm"
published: 2017-07-28T21:08:02+08:00
tags: ["boyer-moore", "voting"]
category: "Algorithm"
draft: false
---

A problem I encountered while doing leetcode. This post provides a brief description and records my thoughts.

Reference: [https://gregable.com/2013/10/majority-vote-algorithm-find-majority.html](https://gregable.com/2013/10/majority-vote-algorithm-find-majority.html), an excellently written blog post.

Problem description: Consider an **unsorted** list of length n. You want to determine whether there is a value that occupies more than half of the list (majority), and if so, find that value.

A common application of this problem is in fault-tolerant computing, where after performing multiple redundant computations, the value obtained by the majority of computations is output.


## The Obvious Approach

Sort first, then traverse the list and count. The time cost is O(nlgn), which is not fast enough! In fact, we can produce the result in O(n) time.

## Boyer-Moore Majority Algorithm

Paper reference: [Boyer-Moore Majority Algorithm](http://www.cs.rug.nl/~wim/pub/whh348.pdf)

This algorithm has O(2n) time complexity and O(1) space complexity. It traverses the list twice, and the idea is very simple.

We need the following two values:

1. candidate, initialized to any value
2. count, initialized to 0

First pass, with current representing the current value:

1. IF count == 0, THEN candidate = current
2. IF candidate == current THEN count += 1 ELSE count -= 1

Second pass: count the candidate from the first pass. If it exceeds half, then the majority is candidate; otherwise, no majority exists.

Here is the Python implementation:

```python
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
```

### A Simple Proof

We only need to consider the case where a majority exists in the original list, since the second pass will directly reject if there is none.

So assume that list L contains a majority, denoted as M.

As we can see, the candidate changes when count equals 0, which effectively divides the list into segments, each with its own candidate.

Each segment has an important property: the candidate occupies exactly half of that segment.

We prove by induction that in the last segment, candidate == M.

When scanning the first segment S, there are two cases:

1. candidate == M: Since M is the majority, and count(M in S) = len(S) / 2, M is still the majority in the sublist L - S.
2. candidate != M: Then count(M in S) <= len(S) / 2. Similarly, M is still the majority in L - S.

The last segment is the final sublist, so candidate == M.

### Even Faster

Two-pass O(n) is already fast, but people still wanted faster, so... an O(3n/2 - 2) algorithm was born.

This algorithm makes only 3n/2 - 2 comparisons, which is the theoretical lower bound. Here is the prover: [Finding a majority among N votes](http://www.cs.yale.edu/publications/techreports/tr252.pdf)

The basic idea of this algorithm is to rearrange the original list so that no two adjacent values are the same.

Here, we need a **bucket** to store extra values, so the space cost is O(n), and it still requires two passes.

First pass: candidate remains the last value of the list, current is the current value.

1. current == candidate: put current into the bucket
2. current != candidate: put current at the end of the list, then take one from the bucket and put it at the end of the list

Clearly, no two adjacent elements in the list can be the same.

In the second pass, we need to continuously compare candidate with the last value of the list:

1. If they are the same, remove **two** elements from the end of the list
2. Otherwise, remove **one** element from the end of the list, and remove **one** element from the bucket

If the bucket is empty, there is no majority; otherwise, candidate is the majority.

The proof is omitted. Interested readers can refer to the paper.


### Distributed Boyer-Moore

Interested readers can read [Finding the Majority Element in Parallel](http://www.crm.umontreal.ca/pub/Rapports/3300-3399/3302.pdf).

The main algorithm is as follows:

```python
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
```

## Summary

An interesting problem encountered while doing leetcode: [https://leetcode.com/problems/majority-element-ii/tabs/description](https://leetcode.com/problems/majority-element-ii/tabs/description). Knowing this algorithm makes it very easy.
