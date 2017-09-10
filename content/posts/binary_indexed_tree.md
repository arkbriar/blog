---
title: "Binary Indexed Tree"
date: 2017-09-08T22:23:50+08:00
draft: false
categories: ["Development", "Algorithm"]
tags: ["algorithm"]
toc: true
comments: true
---

Binary Indexed Tree的树构成方式我一直很疑惑，总是似懂非懂。现在终于弄清楚了它的节点的父子关系，记录下来防止忘记。

### Binary Indexed Tree

二叉索引树用一个数组表示底层数组，这个数组的大小和原数组相同，我们假设为n。

BIT数组里的第i项（1-based）记录了原数组第 i - (i & -i) + 1 到第 i 项的和，其中(i & -i) 是 i 的最低位1表示的数。

我们定义节点i的直接父节点为第一个大于i的j，并且节点j表示的范围包含i的范围。

#### Direct Parent

假设我们有节点i，也就是包含了原数组[i - L(i) + 1, i]的和，这里L(i)表示i的最低位1。那么节点i的直接父节点为 i + L(i)，很容易证明。

重要性质：

+ **节点i到它的直接父节点之间的节点，与节点i不会有交集。** 这个很显然。

+ **除了节点i的父节点，其余节点不会与该节点有交集**。证明如下：

假设节点j有：

1. 1个1，也就是j是2的幂，j>i，则j一定是i的父节点。
2. 2个以上1，那么j与i一定有公共前缀，并且剩余部分一定构成父子关系，从而显然j一定是i的父节点，证明如下：
    + j的最高位1大于i的最高位，那么 `j - (j & -j)` 不影响最高位一定大于i
    + 所以最高位相同，令 `j_ = j - 1 << (fls(j) - 1)`, `i_ = i - 1 << (fls(i) - 1)`，那么 `j - (j & -j) < i` 等价于 `j_ - (j_ & -j_) < i_`，这里`fls`表示二进制最高位的索引(1-based)。
    + 此时我们减少了以为，再次循环上述过程，直到j只剩一个1, 或者i等于0
        + i等于0，不存在这样的j
        + j只剩一个1，那么此时任意0<i<j都符合条件，这样的j一定是i的父节点，j - (j & -j) = 0。

#### Direct Childrens

假设节点j是节点i的直接父节点，我将i称为j的直接子节点。

假设我们有节点i，那么可以通过以下过程获取所有直接子节点。

```cpp
int z = i - (i & -i);
int j = i - 1;
while (j != z) {
    // here j is a direct children of i
    j = j - (j & -j);
}
```

上述过程即把 i - 1 的末尾的连续的1一步步移除。

所有直接子节点所表示的范围不交，且父节点的区间与所有直接子节点表示的区间的并的差为[i, i]。

#### How to get nodes for interval [1, i]

通过以下过程：

```cpp
for (int j = i; j > 0; j -= (j & -j)) {
    // all node j shows here
}
```

显然，各个区间不交。

#### How to get intervals cover i


通过以下过程，获得所有覆盖i的节点，也就是所有节点i的父节点：

```cpp
for (int j = i; j < n; j += (j & -j)) {
    // here we get all parents of node i,
    // which is equal to the nodes cover i
}
```

证明如下：

第一个覆盖i的节点是i;
所有比i大的非父节点与节点i都不交，所以比i的节点覆盖i的就是所有父节点;
而所有小于i的节点都不与节点i交于[i, i]。


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
