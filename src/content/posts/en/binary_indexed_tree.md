---
title: "Binary Indexed Tree (Fenwick Tree)"
published: 2017-09-08T22:23:50+08:00
draft: false
category: "Data Structure"
tags: ["fenwick-tree", "range-query"]
---

I was always confused about the tree construction of Binary Indexed Tree/Fenwick tree, understanding it only vaguely. Now I've finally figured out the parent-child relationships of its nodes, so I'm writing this down to avoid forgetting.


### Binary Indexed Tree

BIT is commonly used to store prefix sums, or to store the array itself (using a prefix sum trick). BIT uses an array to represent the tree, with O(n) space complexity. BIT supports two operations, update and query, for point updates and prefix sum queries, both with a strict time complexity of O(lg n).

In a prefix sum BIT, the i-th element (1-based) stores the sum of the original array over the interval [i - (i & -i) + 1, i], where (i & -i) is the value represented by the lowest set bit of i.

#### Parent

Given a node i, its parent is i - (i & -i), which clears the lowest set bit. Clearly the parent is unique, and all nodes share a common ancestor at 0.

#### Siblings

All siblings can be obtained through the following process:

```cpp
for (int j = 1; j < (i & -i); j <<= 1) {
    // z is a sibling of i
    int z = i + j;
}
```

#### Point Get

Given a node i, we can obtain the value of array element i through the following process:

```cpp
int res = bit[i];
int z = i - (i & -i);
int j = i - 1;
while (j != z) {
    res -= bit[j];
    j = j - (j & -j);
}
```

The above process removes the trailing consecutive 1-bits of i - 1 one by one, effectively computing sum(i - (i & -i), i - 1), and then subtracting it from node i's stored sum to get the value of array element i.

#### Prefix Sum

By repeatedly finding the parent node and accumulating:

```cpp
long sum = 0;
for (int j = i; j > 0; j -= (j & -j)) {
    sum += bit[j];
}
```

Clearly the intervals are disjoint, and the final interval is [1, i].

#### Intervals Cover [i, i]


The following process finds all nodes whose intervals cover [i, i]. These are also the ancestors of node i in two's complement, as we will prove shortly:

```cpp
for (int j = i; j < n; j += (j & -j)) {
    // node j covers [i, i]
}
```

First, clearly node i is the first node covering i. Then j = i + (i & -i) is the first node after i satisfying j - (j & -j) < i, which is easy to prove.

Furthermore, for j = i + (i & -i), the inequality j - (j & -j) <= i - (i & -i) always holds, meaning node j's interval covers node i's interval, while nodes between i and j are all disjoint from node i.

Therefore, it's easy to deduce that all nodes whose intervals intersect with node i's interval are exactly those produced by the above process.

#### Parent in 2's Complement

Assume we're in a 32-bit environment. Remember the binary representation of -i? It's 2^32 - i. So we have i & -i = i & (2^32 - i), allowing us to convert from signed to unsigned arithmetic.

Recall the operation for finding the next node covering i: i + (i & -i). Let j = 2^32 - i, and we can reorganize this expression:

i + (i & -i) = 2^32 - (j - (j & (2 ^32 - j))),

Mapping it to two's complement: 2^32 - i - (i & -i) = j - (j & (2 ^32 - j))

This looks very familiar, doesn't it? It's the operation of clearing j's lowest set bit, which we can also view as a find-parent operation, with 0 as the common ancestor. Now we can see clearly: the operation i + (i & -i) is a symmetric find-parent operation in two's complement, and the original find-parent operation i - (i & -i) is likewise its symmetric counterpart.

#### Suffix BIT

Now we can introduce a suffix sum BIT:

```cpp
const int MAX_N = 1e5;
int bit[MAX_N];

void update(int i, int delta) {
    while (i > 0) {
        bit[i] += delta;
        i -= (i & -i);
    }
}

// get the suffix sum of [i, n]
int get(int i, int n) {
    int res = 0;
    while (i <= n) {
        res += bit[i];
        i += (i & -i);
    }
    return res;
}
```

The operation that was previously baffling finds its explanation in two's complement. Here, node i represents the interval sum of [i, i + (i & -i) - 1].

Of course, one could also just maintain a global sum variable and compute sum - prefix(1, i - 1) instead.

### Appendix

#### Impl & 3 Usages

```cpp
#include <vector>
#include <iostream>
#include <cassert>
using namespace std;

class BinaryIndexedTree {
protected:
    vector<long> bit;

    static int lowbit(int x) { return x & -x; }

    BinaryIndexedTree(BinaryIndexedTree&& other) { bit = std::move(other.bit); }

public:
    BinaryIndexedTree(int n) { bit = vector<long>(n); }

    BinaryIndexedTree(const vector<long>& nums) {
        int n = nums.size();
        bit = vector<long>(n);

        for (int i = 0; i < n; ++i) {
            bit[i] = nums[i];
            for (int j = i - 1; j > i - lowbit(i + 1); --j) {
                bit[i] += nums[j];
            }
        }
    }

    void add(int i, long delta) {
        for (int j = i; j < int(bit.size()); j += lowbit(j + 1)) {
            bit[j] += delta;
        }
    }

    long sum(int k) {
        long res = 0;
        for (int i = k; i >= 0; i -= lowbit(i + 1)) {
            res += bit[i];
        }
        return res;
    }
};

class PointUpdateRangeQueryExectuor {
private:
    int n;
    BinaryIndexedTree tree;

    long prefixSum(int r) {
        if (r < 0) return 0;
        return tree.sum(r);
    }

public:
    PointUpdateRangeQueryExectuor(int n) : n(n), tree(n) {}
    PointUpdateRangeQueryExectuor(const vector<long>& nums) : n(nums.size()), tree(nums) {}

    void update(int i, long delta) {
        assert(i >= 0 && i < n);
        tree.add(i, delta);
    }

    long rangeSum(int l, int r) {
        assert(l <= r && l >= 0 && r < n);
        return prefixSum(r) - prefixSum(l - 1);
    }
};

class RangeUpdatePointQueryExecutor {
private:
    int n;
    BinaryIndexedTree tree;

    // Tear array into pieces
    static vector<long> rangePieces(const vector<long>& nums) {
        int n = nums.size();
        vector<long> res(n);
        // make sure that prefix_sum(res, i) = nums[i]
        if (n != 0) res[0] = nums[0];
        for (int i = 1; i < n; ++i) {
            res[i] = nums[i] - nums[i - 1];
        }
        return res;
    }

    friend class RangeUpdateRangeQueryExecutor;

public:
    RangeUpdatePointQueryExecutor(int n) : n(n), tree(n) {}

    RangeUpdatePointQueryExecutor(const vector<long>& nums)
        : n(nums.size()), tree(rangePieces(nums)) {}

    void update(int l, int r, long delta) {
        assert(l <= r && l >= 0 && r < n);
        tree.add(l, delta);
        if (r + 1 < n) tree.add(r + 1, -delta);
    }

    long get(int i) {
        assert(i >= 0 && i < n);
        return tree.sum(i);
    }
};

class RangeUpdateRangeQueryExecutor {
private:
    long n;
    BinaryIndexedTree tree;
    BinaryIndexedTree tree2;

    static vector<long> prefixPieces(const vector<long>& nums) {
        int n = nums.size();
        vector<long> res(n);
        // make sure that nums[i] * i - res[i] = prefix_sum(nums, i),
        // so that the following prefixSum works.
        // Then run rangePieces, so that we get res[i] = (nums[i] - nums[i - 1]) * (i - 1);
        if (n != 0) res[0] = -nums[0];
        for (long i = 0; i < n; ++i) {
            res[i] = (nums[i] - nums[i - 1]) * (i - 1);
        }
        return res;
    }

    long prefixSum(long r) {
        if (r < 0) return 0;
        return tree.sum(r) * r - tree2.sum(r);
    }

    static constexpr auto rangePieces = RangeUpdatePointQueryExecutor::rangePieces;

public:
    RangeUpdateRangeQueryExecutor(long n) : n(n), tree(n), tree2(n) {}

    RangeUpdateRangeQueryExecutor(const vector<long>& nums)
        : n(nums.size()), tree(rangePieces(nums)), tree2(prefixPieces(nums)) {}

    void update(long l, long r, long delta) {
        assert(l <= r && l >= 0 && r < n);
        tree.add(l, delta);
        if (r + 1 < n) tree.add(r + 1, -delta);
        tree2.add(l, delta * (l - 1));
        if (r + 1 < n) tree2.add(r + 1, -delta * r);
    }

    long rangeSum(long l, long r) {
        assert(l <= r && l >= 0 && r < n);
        return prefixSum(r) - prefixSum(l - 1);
    }
};

int main() {
    // point update range query
    PointUpdateRangeQueryExectuor purq(5);
    purq.update(0, 2);
    purq.update(3, 3);
    purq.update(4, 5);
    cout << purq.rangeSum(0, 1) << endl;  // 2
    cout << purq.rangeSum(2, 3) << endl;  // 3
    cout << purq.rangeSum(3, 4) << endl;  // 8

    PointUpdateRangeQueryExectuor purq2({2, 1, 2, 3, 5});
    cout << purq2.rangeSum(0, 1) << endl;  // 3
    cout << purq2.rangeSum(2, 3) << endl;  // 5
    cout << purq2.rangeSum(3, 4) << endl;  // 8

    // range update point query
    RangeUpdatePointQueryExecutor rupq(5);
    rupq.update(0, 4, 2);
    rupq.update(3, 4, 3);
    cout << rupq.get(0) << endl;  // 2
    cout << rupq.get(3) << endl;  // 5

    RangeUpdatePointQueryExecutor rupq2({11, 3, 2, 6, 5});
    cout << rupq2.get(0) << endl;  // 11
    cout << rupq2.get(3) << endl;  // 6

    // range update range query
    RangeUpdateRangeQueryExecutor rurq(5);
    rurq.update(0, 4, 2);
    rurq.update(3, 4, 3);
    cout << rurq.rangeSum(2, 4) << endl;  // 12

    RangeUpdateRangeQueryExecutor rurq2({2, 2, 3, 6, 5});
    cout << rurq2.rangeSum(2, 4) << endl;  // 14

    return 0;
}
```
