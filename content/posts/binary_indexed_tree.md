---
title: "Binary Indexed Tree"
date: 2017-09-08T22:23:50+08:00
draft: false
categories: ["Development", "Algorithm"]
tags: ["algorithm"]
toc: true
comments: true
---

Binary Indexed Tree/Fenwick tree 的树构成方式我一直很疑惑，总是似懂非懂。现在终于弄清楚了它的节点的父子关系，记录下来防止忘记。

<!--more-->

### Binary Indexed Tree

BIT 通常用于存储前缀和，或者存储数组本身(用前缀和trick)。BIT 用一个数组来表示树，空间复杂度为 O(n)。BIT 支持两个操作，update和query，用于单点更新和前缀和查询，它们的时间复杂度都为严格的 O(lgn)。

前缀和BIT数组里的第i项（1-based）记录了原数组区间 [i - (i & -i) + 1, i] 的和，其中(i & -i) 是 i 的最低位1表示的数。

#### Parent

假设我们有节点i，节点i的父节点为 i - (i & -i)，也就是抹除最后一个1。显然父节点唯一，且所有节点都有公共祖先0。

#### Siblings

通过以下过程可以获得所有兄弟节点:

```cpp
for (int j = 1; j < (i & -i); j <<= 1) {
    // z is a sibling of i
    int z = i + j;
}
```

#### Point Get

假设我们有节点i，那么可以通过以下过程获取数组i的值：

```cpp
int res = bit[i];
int z = i - (i & -i);
int j = i - 1;
while (j != z) {
    res -= bit[j];
    j = j - (j & -j);
}
```

上述过程即把 i - 1 的末尾的连续的1一步步移除，也就是求了 sum(i - (i & -i), i - 1)，然后用i节点的和减去就得到了数组项i的值。

#### Prefix Sum

通过以下过程不断找到父节点，并加和：

```cpp
long sum = 0;
for (int j = i; j > 0; j -= (j & -j)) {
    sum += bit[j];
}
```

显然各个区间不交，最终区间为 [1, i]。

#### Intervals Cover [i, i]


通过以下过程，获得所有覆盖区间[i, i]的节点，同时它们是节点i在补码中的父节点，稍后证明：

```cpp
for (int j = i; j < n; j += (j & -j)) {
    // node j covers [i, i]
}
```

首先显然，节点i是第一个覆盖i的节点，然后 j = i + (i & -i) 是i之后的第一个满足 j - (j & -j) < i 的节点，证明也很容易。

且有 j = i + (i & -i)，j - (j & -j) <= i - (i & -i) 恒成立，也就是节点j所代表的区间能够覆盖i的节点，而i到j之间的节点与节点i均不交。

所以很容易就能推导出，所有与节点i所代表区间相交的节点为上述过程中的节点。

#### Parent in 2's Complement

不妨设这里是32位的环境，大家还记得负数 -i 的二进制表示么？对，就是 2^32 - i，所以我们有 i & -i = i & (2^32 - i)，这样我们可以从有符号数转换到无符号数的操作。

还记得上述获取下一个覆盖i的节点的操作，i + (i & -i)，我们用 j = 2^32 - i 来重新组织一下这个式子：

i + (i & -i) = 2^32 - (j - (j & (2 ^32 - j))),

我们把它也映射成补码，2^32 - i - (i & -i) = j - (j & (2 ^32 - j))

十分熟悉了吧？就是j去掉最后一位1的操作，我们也可以把它看做一个找父节点的操作，公共祖先也是0。现在就可以清楚地看到了，其实 i + (i & -i) 的操作在补码中是一个对称的求父节点操作，原来的求父节点操作 i - (i & -i) 同理为对称操作。

#### Suffix BIT

现在可以引出一个后缀和的BIT：

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

本来百思不得其解的操作在补码中得到了解释，这里节点i代表的区间和为[i, i + (i & -i) - 1]。

但是这里直接添加一个数字用于记录全局sum，然后 sum - prefix(1, i - 1) 也是可以的。

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


