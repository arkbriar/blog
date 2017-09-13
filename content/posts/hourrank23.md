---
title: "Two Algorithms -- Sparse Table, Parallel Binary Search"
date: 2017-09-10T01:06:11+08:00
draft: false
categories: ["Development", "Algorithm"]
tags: ["hackerrank", "hourrank", "algorithm"]
toc: true
comments: true
---

不刷题不知道自己菜，越刷题越发现自己🙄 —— 记 HourRank23 被虐。

### Sparse Table

还记得上两篇线段树和BIT都讲到了区间查找的问题，我们来回忆一下。

线段树空间支持各种函数(Associative，需要满足结合律)的区间更新和区间查询，空间复杂度是 O(nlgn)，更新和查询的时间复杂度都是 O(lgn)。

BIT 支持任意群上运算的单点更新/区间查询、区间更新/单点查询，空间复杂度是 O(n)，更新和查询的时间复杂度也都是 O(lgn) (其实取决于逆元构造速度)。BIT 的区间更新/区间查询泛化需要更多性质，反正主要是用于整数域上的和运算。

而这里所要讲的 Sparse Table 是另一种支持区间查询的数据结构，针对的是**不变的（immutable）的数组**，其空间复杂度为 O(nlgn)。

Sparse Table 同样支持各种函数，只要是满足结合律的函数一律都是支持的，对所有这样的函数，其时间复杂度为 O(nlgn)，而且思想和编码都非常简单易懂。

更进一步地，如果**函数是幂等 (Idemponent) 的，Sparse Table可以在O(1)内得到区间查询的结果**。

#### 核心原理

假设有一个长度为 `$N$ 的数组 $\{a_0, ..., a_{N - 1}\}$`，并有一个二元函数 `$f$`，满足结合律 `$f(a, f(b, c)) = f(f(a, b), c)$`。

我们简记区间 `$[i, j]$` 上对函数 `$f$` 的查询为 `$f(a[i..j])$`。

那么 Sparse Table 将生成这样一个二维数组，这个二维数组的大小为 `$N(\lfloor\log N\rfloor + 1)$`。数组的第 `$(i, j)$` 项代表了区间结果 `$f(a[i..i + 2^j - 1])$`，记为 `$b_{i,j}$`。

生成一个这样的二维数组是很简单的，因为 `$f(a[i..i + 2^j - 1]) = f(f(a[i..i+2^{j-1} - 1]), f(a[i + 2^{j-1}..i + 2^j - 1]))$`，而后面这两个分别是第 `$(i, j - 1)$` 项和第 `$(i + 2^{j - 1}, j - 1)$ `项，并且 `$f([i..i]) = a_i$`，所以我们一层层递推就行，过程如下

```pascal
// assuming Arr is indexed from 0
for i=0..N-1: 
  Table[i][0] = Arr[i]
  
// assuming N < 2^(k+1)
for j=1..k: 
  for i=0..N-2^j:
    Table[i][j] = F(Table[i][j - 1], Table[i + 2^(j - 1)][j - 1])
```

那么我们如何进行查询呢？因为对于一个区间 `$[i, j]$` 来说，区间长度 `$L = j - i + 1 \le N$` 恒成立，所以如果我们将 `$L$` 表示成二进制形式，`$L = 2^{q_k} + 2^{q_{k - 1}} + ... + 2^{q_0}$`，
那么有 

`$j = (\cdots((i + 2^{q_k} - 1) + 2^{q_{k - 1}} - 1) + ... + 2^{q_0}) - 1$`，这个表示形式是不是提醒你了呢？

所以用以下过程我们可以在 O(lgN) 时间内得到准确结果:

```pascal
answer = ZERO 
L’ = L
for i=k..0:
  if L’ + 2^i - 1 <= R:
    // F is associative, so this operation is meaningful
    answer = F(answer, Table[L’][i]) 
    L’ += 2^i
```

假设我们的函数 `$f$` 同时是幂等的，也就是说 `$f(x, x) = x$` 对所有定义域内的数都成立，那么我们马上就能得到 

`$f(a[i..j]) = f(f(a[i..s],f(a[t..j])), i \le t, s \le j, t \le s + 1$`。

**这条性质允许我们不用精确地只覆盖该区域一次，这是加速到 O(1) 的关键。**

令 `$t$` 是满足 `$2^t \le (j - i + 1)$` 的最大的 `$t$`，也就是 `$2^{t + 1} > (j - i + 1)$`。那么显然 `$i + 2^t - 1 \le j$，$j - 2^t + 1 \ge i$`，并且有 `$j - 2^t + 1 \le (i + 2^t - 1) + 1$` 恒成立。

所以 `$f(a[i..j]) = f(f(i..i + 2^t - 1), f(j - 2^t + 1..j))$，后面两项就是 $b_{i, t}$ 和 $b_{j - 2^t, t}$`。

至此原理介绍完毕，实现的代码在最后 Appendix 中。

#### ST & LCA

Sparse Table 不仅可以用于计算各种区间查询，还可以用于计算树上两个节点的最近公共祖先。使用ST可以在 O(2lgH) 的时间内计算出任意两个几点的最近公共祖先，空间复杂度还是 O(NlgN)，这里 N 是树上节点数，H 是树高度。

其主要思想是用数组存放节点 i 的第 2^j 个祖先，然后搜索，具体细节有兴趣的同学可以参考 topcoder 上关于RMQ和LCA的那篇文章，链接在引用中，这里不再赘述。

### Parallel Binary Search

这是一个将二分查找运用到极致的算法。接下来的部分大量参考了codeforces上的博客，原文链接在文章的末尾，有兴趣的同学可以前去学习。

#### Motivation Problem

TODO

#### Solution

TODO

### Reference

[1] https://www.hackerearth.com/practice/notes/sparse-table/

[2] https://www.topcoder.com/community/data-science/data-science-tutorials/range-minimum-query-and-lowest-common-ancestor/#Sparse_Table_(ST)_algorithm

[3] http://codeforces.com/blog/entry/45578

[4] https://ideone.com/tTO9bD


### Appendix

#### Impl ST/C++

```cpp
#include <vector>
#include <cassert>
#include <cstring>
#include <iostream>
#include <limits>
#include <type_traits>
#include <random>
using namespace std;

namespace st_impl {

template <class T, class F>
class SparseTable {
public:
    typedef F func_type;
    typedef unsigned size_type;
    typedef T value_type;

    SparseTable(const vector<T>& init) : _size(init.size()), _idx_size(flsl(_size)) {
        table.resize(_size);
        for (auto& row : table) {
            row.resize(_idx_size, func_type::default_value);
        }

        // initialize sparse table
        for (size_type i = 0; i < _size; ++i) {
            table[i][0] = init[i];
        }
        for (size_type j = 1; j < _idx_size; ++j) {
            for (size_type i = 0; i <= _size - (1 << j); ++i) {
                table[i][j] = f(table[i][j - 1], table[i + (1 << (j - 1))][j - 1]);
            }
        }
    }

    SparseTable(const initializer_list<T>& init) : SparseTable(vector<T>(init)) {}

    SparseTable(const vector<T>& init, F f) : SparseTable(init) { this->f = f; }
    SparseTable(const initializer_list<T>& init, F f) : SparseTable(vector<T>(init), f) {}

    T rangeQuery(size_type l, size_type r) const {
        if (!(l <= r && r < _size)) {
            throw std::out_of_range("Bad query!");
        }

        // if the function is idempotent, which means f(x, x) = x holds for
        // all x with definition, then we can deduce that
        // f(range(l, s), range(t, r)) == f(range(l, r)) always
        // holds for all l, s, t, r which satisfies l <= t && s <= r && t <= s + 1
        // then rangeQuery will be executed in O(1).
        // otherwise it should be finished in O(lgN).
        if (func_type::idempotent) {
            size_type idx = flsl(r - l + 1) - 1;
            return f(table[l][idx], table[r - (1 << idx) + 1][idx]);
        } else {
            T res = func_type::default_value;
            for (size_type i = 0; i < _idx_size; ++i) {
                size_type idx = _idx_size - 1 - i;
                if (l + (1 << idx) - 1 <= r) {
                    res = f(res, table[l][idx]);
                    l += 1 << idx;
                }
            }
            return res;
        }
    }

private:
    func_type f;

    size_type _size;
    size_type _idx_size;
    vector<vector<T>> table;
};

}  // namespace st_impl

template <class T, T v = T{}>
struct sum_f {
    static constexpr T default_value = v;
    static constexpr bool idempotent = false;
    T operator()(const T& a, const T& b) const { return a + b; }
};
template <class T, T v>
constexpr const T sum_f<T, v>::default_value;

template <class T, T v = numeric_limits<T>::min(),
          typename = typename enable_if<numeric_limits<T>::is_specialized>::type>
struct max_f {
    static constexpr T default_value = v;
    static constexpr bool idempotent = true;
    T operator()(const T& a, const T& b) const { return max(a, b); }
};
template <class T, T v, typename R>
constexpr const T max_f<T, v, R>::default_value;

template <class T, T v = numeric_limits<T>::max(),
          typename = typename enable_if<numeric_limits<T>::is_specialized>::type>
struct min_f {
    static constexpr T default_value = v;
    static constexpr bool idempotent = true;
    T operator()(const T& a, const T& b) const { return min(a, b); }
};
template <class T, T v, typename R>
constexpr const T min_f<T, v, R>::default_value;

uint64_t gcd(uint64_t a, uint64_t b) {
    if (a < b) swap(a, b);
    while (b != 0) {
        auto t = b;
        b = a % b;
        a = t;
    }
    return a;
}

template <class T, T v = T{}, typename = typename enable_if<numeric_limits<T>::is_integer>::type>
struct gcd_f {
    static constexpr T default_value = v;
    static constexpr bool idempotent = true;
    T operator()(const T& a, const T& b) const { return gcd(a, b); }
};
template <class T, T v, typename R>
constexpr const T gcd_f<T, v, R>::default_value;

template <class T, class F = max_f<T>>
using SparseTable = st_impl::SparseTable<T, F>;

template <class F>
void random_test(string target_func) {
    int n = 400;
    vector<int> test(n);

    // generate random numbers
    random_device r;
    default_random_engine eng(r());
    uniform_int_distribution<int> uniform_dist(0, 2000);

    for (int i = 0; i < n; ++i) {
        test[i] = uniform_dist(eng);
    }

    // query and verify
    F f;
    SparseTable<int, F> st_test(test, f);

    cout << "Begin random test on " << target_func << "!" << endl;
    int t = 10;
    for (int i = 0; i < t; ++i) {
        int l = uniform_dist(eng) % n, r = l + ((uniform_dist(eng) % (n - l)) >> (i / 2));
        auto to_verify = st_test.rangeQuery(l, r);
        auto expected = decltype(f)::default_value;

        for (int j = l; j <= r; ++j) {
            expected = f(expected, test[j]);
        }
        assert(to_verify == expected);
        cout << " + query range(" << l << "," << r << ")\t= " << to_verify << endl;
    }
    cout << "Test passed!" << endl;
}

void regular_test() {
    SparseTable<int> st_max({3, 1, 2, 5, 2, 10, 8});

    assert(st_max.rangeQuery(0, 2) == 3);
    assert(st_max.rangeQuery(3, 6) == 10);
    assert(st_max.rangeQuery(0, 6) == 10);
    assert(st_max.rangeQuery(2, 4) == 5);

    SparseTable<int, min_f<int>> st_min({3, 1, 2, 5, 2, 10, 8});

    assert(st_min.rangeQuery(0, 2) == 1);
    assert(st_min.rangeQuery(3, 6) == 2);
    assert(st_min.rangeQuery(0, 6) == 1);
    assert(st_min.rangeQuery(2, 4) == 2);

    SparseTable<int, sum_f<int>> st_sum({3, 1, 2, 5, 2, 10, 8});

    assert(st_sum.rangeQuery(0, 2) == 6);
    assert(st_sum.rangeQuery(3, 6) == 25);
    assert(st_sum.rangeQuery(0, 6) == 31);
    assert(st_sum.rangeQuery(2, 4) == 9);
}

int main() {
    regular_test();

    random_test<max_f<int>>("max");
    random_test<min_f<int>>("min");
    random_test<sum_f<int>>("sum");
    random_test<gcd_f<int>>("gcd");

    return 0;
}
```
