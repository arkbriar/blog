---
title: "稀疏表和并行二分查找 (Sparse Table & Parallel Binary Search)"
published: 2017-09-10T01:06:11+08:00
draft: false
category: "Data Structure"
tags: ["sparse-table", "range-query", "hackerrank"]
---

不刷题不知道自己菜，越刷题越发现自己🙄 —— 记 HourRank23 被虐。


### Sparse Table

还记得上两篇线段树和 BIT 都讲到了区间查找的问题，我们来回忆一下。

线段树空间支持各种函数 (Associative，需要满足结合律) 的区间更新和区间查询，空间复杂度是 O(nlgn)，更新和查询的时间复杂度都是 O(lgn)。

BIT 支持任意群上运算的单点更新/区间查询、区间更新/单点查询，空间复杂度是 O(n)，更新和查询的时间复杂度也都是 O(lgn) (其实取决于逆元构造速度)。 BIT 的区间更新/区间查询泛化需要更多性质，反正主要是用于整数域上的和运算。

而这里所要讲的 Sparse Table 是另一种支持区间查询的数据结构，针对的是**不变的（immutable）的数组**，其空间复杂度为 O(nlgn)。

Sparse Table 同样支持各种函数，只要是满足结合律的函数一律都是支持的，对所有这样的函数，其时间复杂度为 O(nlgn)，而且思想和编码都非常简单易懂。

更进一步地，如果**函数是幂等 (Idemponent) 的，Sparse Table 可以在 O(1) 内得到区间查询的结果**。

#### 核心原理

假设有一个长度为 $N$ 的数组 $\{a_0, ..., a_{N - 1}\}$，并有一个二元函数 $f$，满足结合律 $f(a, f(b, c)) = f(f(a, b), c)$。

我们简记区间 $[i, j]$ 上对函数 $f$ 的查询为 $f(a[i..j])$。

那么 Sparse Table 将生成这样一个二维数组，这个二维数组的大小为 $N(\lfloor\log N\rfloor + 1)$。数组的第 $(i, j)$ 项代表了区间结果 $f(a[i..i + 2^j - 1])$，记为 $b_{i,j}$。

生成一个这样的二维数组是很简单的，因为 $f(a[i..i + 2^j - 1]) = f(f(a[i..i+2^{j-1} - 1]), f(a[i + 2^{j-1}..i + 2^j - 1]))$，而后面这两个分别是第 $(i, j - 1)$ 项和第 $(i + 2^{j - 1}, j - 1)$项，并且 $f([i..i]) = a_i$，所以我们一层层递推就行，过程如下

```pascal
// assuming Arr is indexed from 0
for i=0..N-1: 
  Table[i][0] = Arr[i]
  
// assuming N < 2^(k+1)
for j=1..k: 
  for i=0..N-2^j:
    Table[i][j] = F(Table[i][j - 1], Table[i + 2^(j - 1)][j - 1])
```

那么我们如何进行查询呢？因为对于一个区间 $[i, j]$ 来说，区间长度 $L = j - i + 1 \le N$ 恒成立，所以如果我们将 $L$ 表示成二进制形式，$L = 2^{q_k} + 2^{q_{k - 1}} + ... + 2^{q_0}$，
那么有 

$j = (\cdots((i + 2^{q_k} - 1) + 2^{q_{k - 1}} - 1) + ... + 2^{q_0}) - 1$，这个表示形式是不是提醒你了呢？

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

假设我们的函数 $f$ 同时是幂等的，也就是说 $f(x, x) = x$ 对所有定义域内的数都成立，那么我们马上就能得到 

$f(a[i..j]) = f(f(a[i..s],f(a[t..j])), i \le t, s \le j, t \le s + 1$。

**这条性质允许我们不用精确地只覆盖该区域一次，这是加速到 O(1) 的关键。**

令 $t$ 是满足 $2^t \le (j - i + 1)$ 的最大的 $t$，也就是 $2^{t + 1} > (j - i + 1)$。那么显然 $i + 2^t - 1 \le j$，$j - 2^t + 1 \ge i$，并且有 $j - 2^t + 1 \le (i + 2^t - 1) + 1$ 恒成立。

所以 $f(a[i..j]) = f(f(i..i + 2^t - 1), f(j - 2^t + 1..j))$，后面两项就是 $b_{i, t}$ 和 $b_{j - 2^t, t}$。

至此原理介绍完毕，实现的代码在最后 Appendix 中。

#### ST & LCA

Sparse Table 不仅可以用于计算各种区间查询，还可以用于计算树上两个节点的最近公共祖先。使用 ST 可以在 O(2lgH) 的时间内计算出任意两个几点的最近公共祖先，空间复杂度还是 O(NlgN)，这里 N 是树上节点数，H 是树高度。

其主要思想是用数组存放节点 i 的第 2^j 个祖先，然后搜索，具体细节有兴趣的同学可以参考 topcoder 上关于 RMQ 和 LCA 的那篇文章，链接在引用中，这里不再赘述。

### Parallel Binary Search

Parallel Binary Search，中文叫**整体二分**，我们先用一个 spoj 上的题目来介绍这个方法，然后再来看一下 hourrank 上的另一个不太一样的题目。

接下来的两个小节大量参考了 codeforces 上的博客，原文链接在文章的末尾，有兴趣的同学可以前去学习。

#### Motivation Problem

SPOJ 上有这样一个题目：[Meteors](http://www.spoj.com/problems/METEORS/)，在这里我简单描述一下：

> 有 N 个国家，有一块圆形的地方，等分成 M 个扇形区域，每个区域属于某一个国家。现在预报有 Q 阵流星雨，每一针降落在某个扇形区域 [L, R]，每个扇形都获得相同数量 K 的陨石。已知每个国家有一个陨石收集目标 reqd[i]，请问每个国家分别最少在多少阵流星雨后才能收集到目标数量的陨石。

> 1 <= N, M, Q<= 300000
> 1 <= K <= 1e9

#### Solution

如果我们考虑不使用任何数据结构逐次模拟，然后检查目标是否达到了，更新代价是 O(M)，检查的代价是 O(N + M)，总代价 O((2M + N)Q) 是无法承受的。

而看到区间更新，结合 Blog 开头所讲的几个数据结构，选择 BIT 用于模拟更新是最合适不过的了；这样我们更新代价降到了 O(lgM)，但是检查的代价变为了 O(MlgM)，如果还是逐次模拟，显然会比之前更差。

到了这里，能想到了什么了嘛？对，二分查找！二分查找不关心序列中每个数长什么样子，只需要知道：

1. 序列单调
2. 可以通过某种方式获取到序列中指定位置的值

然后，通过二分查找，我们可以在 O(lgN) 的值获取/检查内，找到我们想要的位置。

这里的序列指一个国家的收集总数，而这个收集总数由扇形区间所构成的序列隐式地反应，那么通过二分查找，对每个国家我们只需要进行 O(lgQ) 次检查，就能知道是在那个时间点满足条件。所以每个国家的总计时间复杂度为大约为 O(logQ * Q * logM)，这里每次检查的时间相比更新的时间微不足道所以略去了。最终复杂度为 O(N * log Q * Q * logM)。

可以看到，上面的复杂度还是太高，比直接模拟还是高了很多，那怎么办呢？

稍微想一想，每次模拟的代价虽然降低了，但是模拟的数量上升到了 O(NlgQ) 次，虽然检查的次数也降低了，但是跟模拟的耗时相比，低的都被略掉了 ... 所以当务之急是同时能降低模拟的开销。

是不是感觉有点奢侈？每次我就检查那么一下，就要模拟一整轮，虽然我开销小，也架不住你烧 CPU 玩啊。

其实每个国家的二分查找经历是很类似的，在整个模拟出来的序列里面找到那一片要的，然后检查一下我们就下一轮了。那么，既然一整轮模拟都做完了，能不能让每个国家都检查完，然后我们再开下一轮好不好？

这就是 Parallel Binary Search 的核心思想：**通过一轮模拟完成所有国家的这一步查找**，从而将模拟总数减少到了 O(lgQ) 次，巨大的进步！

具体方法是，开两个长度为 N 的数组，对每一个国家，记录它当前的 L 和 R；对于每一个要检查的 mid，开一个链表记录当前需要检查 mid 值的国家；其余过程用下列伪代码描述：

```
for all logQ steps:
    clear range tree and linked list check
    for all member states i:
        if L[i] != R[i]:
            mid = (L[i] + R[i]) / 2
            insert i in check[mid]
    for all queries q:
        apply(q)
        for all member states m in check[q]:
            if m has requirements fulfilled:
                R[m] = q
            else:
                L[m] = q + 1
```

上述过程中，`apply()` 函数的作用是，进行模拟，然后检查需要检查的国家是否满足条件了。

这样子，模拟的代价总计为 O(lgQ * Q * lgM)，检查的代价总计为 O(lgQ * (MlgM + N))，我们成功地同时将模拟和检查的代价都减小了！这样的时间复杂度总共为 O(lgQ * (Q + M) * lgM)，至于少的那个 N，忽略不计~

同原文一样，这里引一句大佬的话解释这个 Parallel Binary Search，

> "A cool way to visualize this is to think of a binary search tree. Suppose we are doing standard binary search, and we reject the right interval — this can be thought of as moving left in the tree. Similarly, if we reject the left interval, we are moving right in the tree.
So what Parallel Binary Search does is move one step down in N binary search trees simultaneously in one "sweep", taking O(N  \*  X) time, where X is dependent on the problem and the data structures used in it. Since the height of each tree is LogN, the complexity is O(N  \*  X  \*  logN)." — rekt_n00b

#### Hourrank23 -- Selective Additions

这是一道被诅咒的题目...抱歉实在没忍住🤣 

这道题目是这样的：

> 有一个数组，长度为 N，现在要进行 M 次区间更新，都是加一个正数。但是我有 K 个很喜欢的数字，一旦数组中某个元素成为我喜欢的数字，对它的更新就无效，它将一直保持那个数字。
> 问每轮更新后的数组和。
> 
> 1 <= N, M <= 1e5
> 1 <= k <= 5

这道题和上道题不太一样，**检查的代价低、检查目标和原区间相同**，而且目标变成了多个。

目标是多个可以这样解决：对喜欢的数排序，因为永远是正的更新，所以先到达前一个后一个就不用检查了。

采用上述的 PBS 的方法，这题的复杂度在 O(k(n + m)lognlogm)，是一个很好的复杂度了。

但是，这里一定要有个但是，因为检查的代价很低，所以这题的二分查找不是必须的，我翻阅了大量大佬的代码和 editorial，有用 PBS 的，有模拟时间序列的，有用 Segment tree 加 trick 的，各种各样，我来一个个介绍一下：

#### PBS

这个不多说了，离线模拟 logm 遍。

#### Time Series Simulation

代码: https://www.hackerrank.com/rest/contests/hourrank-23/challenges/selective-additions/hackers/nuipqiun/download_solution

同样是离线处理，但是这个大佬的模拟方式很特别，他是在时间序列上模拟数组当前项的值，我还是第一次见。

首先还记得 BIT 的区间更新方式么，在 l 处加 delta，r + 1 处减去 delta。假设考虑区间更新都是 [l, n] 的，那么在时间序列上模拟 i-th 数组项 的值就很容易想到了：对于在 i 以及之前的更新 (j, a, b, delta) (a <= i), 在时间序列对应数组的 j 处加 delta。这样 j 时间之后的数都被加了 delta。

想到这里，时间序列上的模拟就呼之欲出了，既然对应有加，肯定对应有减：对于 i  以及 i 之前的所有更新 (j, a, b, delta) (b < i)，在序列上抵消掉，也即在时间序列 j 处减 delta，因为这样的更新不应该影响到数组项 i 的时间序列，而且一定在之前被更新上去了。

所以就变成了这样一种方式：

```cpp
rep(i,n){
	for(int j:ad[i]) add(j,ads[j]);
	for(int j:rm[i]) add(j,-ads[j]);
	// do you work
}
```

这里，ad[i] 是 [i, r] 更新的索引号，rm[i] 是 [l, i - 1] 更新的索引号，add 操作是 fenwick tree 的加操作，于是我们可以用 sum(j) 计算出任一个时间节点上 a[i] 的值。

后面就很简单了，对每个 i 二分查找，找到就记下来。总计时间复杂度应该为 O((kn + m)logm)。

这里明显比 PBS 快了一点，这是因为**检查区间和原区间一致**。这件事情很重要，类比到 Meteors，虽然我们也能模拟出一个区间的时间序列，但是一个区间对于目标没有意义。

#### Segment Tree

与上面两个不同的是，这是个在线算法。

时间复杂度是 O(klgm(n + m))，不过用了线段树，空间复杂度为 O(kmlgm)。

这里线段树中记录了三个值：lazy 域 add，区间最大值 maxi，对应的数组索引 id。

一共 k 棵线段树，每颗线段树初始化为数组 {a\_i - fav_j}，也就是说，对应的值如果为正数，才有检查的必要，如果为负数，那压根还没到检查的时候。

正巧，利用线段树的结构，我们检查线段树的 root 节点就能知道这棵树中存不存在需要检查的项，这个操作是 O(1) 的。而当一个数组项被检查过后，它将被赋值为 -inf，这样它永远也不会被再次检查，线段树也顺利更新到下一个待检查状态。

由于每个数组项对于每个 favorite 最多被检查一次，所以总计检查复杂度为 O(knlgm)。

更新复杂度是 O(kmlgm)，所以总计复杂度为 O(k(m + n)lgm)。

这里利用 Segment Tree 的 trick 一开始让我百思不得其解，为什么 meteors 不行而这里可以，想来想去也想不出第三种方式，把 meteors 的查询区间映射到方便修改的结构上，所以还是归结为之前所述的两个原因。

### Conclusion

对于更新/查询的一系列问题，业界大佬们已经提供了各种各样有力的武器：

1. 数据结构 Segment tree、 Fenwick tree、 Sparse table，还有最近才研究到的 Cartesian tree 等等
2. 二分、整体二分、还没看过的 CDQ 分治等等

把这里整理进脑子里，大概下次刷题的时候底气也会足一些🍺

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

#### Selective Additions / PBS C++

```cpp
#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <algorithm>
#include <vector>
#include <climits>
#include <utility>
#include <queue>
#include <map>

using namespace std;

#define defv(alias, type) using v##alias = vector<type>
#define defvv(alias, type) using vv##alias = vector<vector<type>>

using ii = pair<int, int>;
using iii = pair<int, ii>;

defv(i, int);
defvv(i, int);
defv(ii, ii);
defvv(ii, ii);

#define forall(i, a, b) for (int i = int(a); i < int(b); ++i)
#define all(a) a.begin(), a.end()
#define inf (IMAX_NT_MAX / 2)
#define sz(a) int(a.size())
#define mp(a, b) make_pair(a, b)

const int MAX_N = 1e5 + 5;

long a[MAX_N], d[MAX_N];
int l[MAX_N], r[MAX_N];
long f[5];

int n, m, k;

long fen[MAX_N];
int lowbit(int x) { return x & -x; }

void fen_update(long *fen, int idx, int delta) {
    for (int i = idx; i < n; i += lowbit(i + 1)) {
        fen[i] += delta;
    }
}

long __fen_get(long *fen, int r) {
    long res = 0;
    while (r >= 0) {
        res += fen[r];
        r -= lowbit(r + 1);
    }
    return res;
}

long fen_get(long *fen, int l, int r) { return __fen_get(fen, r) - __fen_get(fen, l - 1); }

void fen_range_update(long *fen, int l, int r, int delta) {
    fen_update(fen, l, delta);
    fen_update(fen, r + 1, -delta);
}

long fen_point_get(long *fen, int i) { return __fen_get(fen, i); }

void fen_reset(long *fen) { forall(i, 0, n) fen[i] = 0; }

inline int fls(int x) {
    int r = 32;

    if (!x) return 0;
    if (!(x & 0xffff0000u)) {
        x <<= 16;
        r -= 16;
    }
    if (!(x & 0xff000000u)) {
        x <<= 8;
        r -= 8;
    }
    if (!(x & 0xf0000000u)) {
        x <<= 4;
        r -= 4;
    }
    if (!(x & 0xc0000000u)) {
        x <<= 2;
        r -= 2;
    }
    if (!(x & 0x80000000u)) {
        x <<= 1;
        r -= 1;
    }
    return r;
}

int t[MAX_N], lb[MAX_N], rb[MAX_N];
vector<int> to_check[MAX_N + 1];
void solve() {
    sort(f, f + k);
    fill_n(t, n, -1);
    forall(i, 0, n) forall(s, 0, k) {
        if (t[i] < 0 && a[i] == f[s]) t[i] = 0;
    }

    // Parallel Binary Search
    for (int s = 0; s < k; ++s) {
        forall(i, 0, n) if (t[i] < 0) { lb[i] = 1, rb[i] = m; }
        forall(rnd, 0, fls(m)) {
            fen_reset(fen);
            forall(i, 0, m + 1) to_check[i].clear();
            forall(i, 0, n) {
                if (t[i] < 0) to_check[(lb[i] + rb[i]) >> 1].push_back(i);
            }
            forall(i, 0, m) {
                fen_range_update(fen, l[i], r[i], d[i]);
                for (int idx : to_check[i + 1]) {
                    auto now = fen_point_get(fen, idx);
                    if (now + a[idx] > f[s])
                        rb[idx] = i;
                    else if (now + a[idx] < f[s])
                        lb[idx] = i + 2;
                    else
                        t[idx] = i + 1;
                }
            }
        }
    }

    // reuse fen for counting invalid updates
    long sum = 0;
    fen_reset(fen);
    forall(i, 0, m + 1) to_check[i].clear();
    forall(i, 0, n) {
        if (t[i] == 0)
            fen_update(fen, i, 1);
        else if (t[i] > 0)
            to_check[t[i]].push_back(i);
        sum += a[i];
    }

    forall(i, 0, m) {
        sum += d[i] * (r[i] - l[i] + 1 - fen_get(fen, l[i], r[i]));
        cout << sum << endl;
        for (auto idx : to_check[i + 1]) {
            fen_update(fen, idx, 1);
        }
    }
}

int main() {
    cin >> n >> m >> k;
    forall(i, 0, n) { cin >> a[i]; }
    forall(i, 0, k) { cin >> f[i]; }
    forall(i, 0, m) {
        cin >> l[i] >> r[i] >> d[i];
        l[i]--, r[i]--;
    }

    solve();

    return 0;
}
```


