---
title: "Bloom Filter"
published: 2018-04-16T13:02:27+08:00
draft: false
category: "Data Structure"
tags: ["bloom-filter", "probability", "hash"]
---

A Bloom filter is a space-efficient **probabilistic** data structure used to test whether an element is a member of a set. A Bloom filter may produce false positives (reporting that an element exists when it actually does not), but never produces false negatives (reporting that an element does not exist when it actually does). The more elements in the set, the higher the probability of false positives.


### Structure

The structure of a Bloom filter is very simple: a bit array of length m, initialized to all zeros. The Bloom filter requires k different hash functions, each of which maps an element to a number in [0, m), i.e., a position in the array, with a uniform distribution.

Typically, k is a constant much smaller than m, proportional to the number of elements to be added. The exact values of k and m depend on the desired false positive rate.

The following diagram shows a Bloom filter:

![](/img/15238556159607.png)

Here are the two operations on a Bloom filter:

+ **Add an element**: For each hash function, compute the corresponding position in the array and set it to 1.
+ **Query an element**: For each hash function, compute the corresponding position in the array. If all positions are 1, report that the element exists; otherwise, the element does not exist.

Clearly, if an element was previously added, a query will always report it as present. However, a query reporting presence does not necessarily mean the element was actually added.

In this design, since false negatives are not allowed, element deletion is not possible. If false negatives were acceptable, element deletion could be handled using a counting array. For one-time deletion, a second Bloom filter recording deleted elements could be used, but then the false positives of this second filter would become false negatives of the first.

### Space and Time

Bloom filters are extremely space-efficient, far more so than other set data structures such as self-balancing binary trees, tries, and hash tables. A Bloom filter with an expected false positive rate below 1%, using optimal k, requires only 9.6 bits per element, regardless of the element itself. Furthermore, adding only about 4.8 additional bits per element can reduce the false positive rate to 0.1%. However, when the number of possible elements is very small, a Bloom filter is obviously worse than a simple bit array.

For both insertion and query, the time complexity of a Bloom filter depends on the k hash functions. Since hash functions are typically efficient, we consider the time complexity to be O(k).

### False Positive Rate and Optimal Parameters

Let's derive the false positive probability. When an element is inserted, the probability that a given position in the array has not been set to 1 is: $(1 - \frac{1}{m})^{k}$. After inserting n elements, the probability that this position is still 0 is $(1 - \frac{1}{m})^{kn}$.

So during a query, the probability that all k hash positions are 1 is: $(1 - \left[1 - \frac{1}{m}\right]^{kn})^k \approx (1 - e^{-kn/m})^k$.

This derivation is not completely rigorous because it assumes **the events of each bit being set are mutually independent**. [In fact, when this assumption is removed, the same approximation can still be derived. Interested readers can refer to this source.](https://books.google.co.jp/books?id=0bAYl6d7hvkC&pg=PA110&redir_esc=y#v=onepage&q&f=false) We have:

+ The false positive rate decreases as m increases, and increases as n increases.

The optimal number of hash functions is: $k = \dfrac{m}{n}\ln 2$

The derivation is as follows:

$p = (1 - e^{-kn/m})^k$

$\ln p = k\ln(1 - e^{-kn/m}) = -\dfrac{m}{n}\ln(e^{-kn/m}) \ln(1 - e^{-kn/m})$

Let $g = e^{-kn/m}$, so $\ln p = -\dfrac{m}{n}\ln(g) \ln(1 - g)$. By symmetry, the expression is minimized when $g = \dfrac{1}{2}$.

Therefore $g = e^{-kn/m} = \dfrac{1}{2}$, giving $k = \dfrac{m}{n}\ln 2$.

### Estimating Set Size

Swamidass & Baldi (2007) gave a formula to estimate the approximate size of the set in a Bloom filter:

$$n^* = -\dfrac{m}{k}\ln\left[1 - \dfrac{X}{m}\right]$$
,

where X is the number of 1-bits in the bit array.

### Applications of Bloom Filters

+ Google Bigtable, Apache HBase, Apache Cassandra, and PostgreSQL use Bloom filters to reduce unnecessary disk lookups.
+ Google Chrome uses a Bloom filter to detect dangerous URLs.
+ ...

### References

[1] https://en.wikipedia.org/wiki/Bloom_filter#Approximating_the_number_of_items_in_a_Bloom_filter
