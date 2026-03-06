---
title: "Sparse Table & Parallel Binary Search"
published: 2017-09-10T01:06:11+08:00
draft: false
category: "Data Structure"
tags: ["sparse-table", "range-query", "hackerrank"]
---

You don't know how weak you are until you start grinding problems, and the more you grind the more you realize it -- a record of getting destroyed in HourRank23.


### Sparse Table

Recall that the previous two posts on segment trees and BIT both discussed the range query problem. Let's review.

Segment trees support range updates and range queries for various functions (associative, i.e., satisfying the associative law), with O(nlgn) space complexity and O(lgn) time complexity for both updates and queries.

BIT supports single-point update/range query and range update/single-point query for operations on any group, with O(n) space complexity and O(lgn) time complexity for both updates and queries (actually depending on the speed of inverse element construction). BIT's generalization to range update/range query requires additional properties, and is mainly used for sum operations on the integer domain.

The Sparse Table discussed here is another data structure supporting range queries, targeting **immutable arrays**, with O(nlgn) space complexity.

Sparse Table also supports various functions -- any function satisfying the associative law is supported. For all such functions, its time complexity is O(nlgn), and both the concept and implementation are very simple and easy to understand.

Furthermore, **if the function is idempotent, Sparse Table can return range query results in O(1) time**.

#### Core Principle

Suppose we have an array of length $N$, $\{a_0, ..., a_{N - 1}\}$, and a binary function $f$ satisfying the associative law $f(a, f(b, c)) = f(f(a, b), c)$.

We use the shorthand $f(a[i..j])$ for the query of function $f$ over the range $[i, j]$.

The Sparse Table generates a 2D array of size $N(\lfloor\log N\rfloor + 1)$. The $(i, j)$-th entry represents the range result $f(a[i..i + 2^j - 1])$, denoted $b_{i,j}$.

Generating such a 2D array is straightforward, because $f(a[i..i + 2^j - 1]) = f(f(a[i..i+2^{j-1} - 1]), f(a[i + 2^{j-1}..i + 2^j - 1]))$, where the two sub-expressions are the $(i, j - 1)$-th and $(i + 2^{j - 1}, j - 1)$-th entries, and $f([i..i]) = a_i$. So we just build layer by layer as follows:

```pascal
// assuming Arr is indexed from 0
for i=0..N-1:
  Table[i][0] = Arr[i]

// assuming N < 2^(k+1)
for j=1..k:
  for i=0..N-2^j:
    Table[i][j] = F(Table[i][j - 1], Table[i + 2^(j - 1)][j - 1])
```

How do we perform queries? For a range $[i, j]$, the range length $L = j - i + 1 \le N$ always holds. If we express $L$ in binary form, $L = 2^{q_k} + 2^{q_{k - 1}} + ... + 2^{q_0}$,
then we have

$j = (\cdots((i + 2^{q_k} - 1) + 2^{q_{k - 1}} - 1) + ... + 2^{q_0}) - 1$. Does this representation ring a bell?

So using the following process we can get the exact result in O(lgN) time:

```pascal
answer = ZERO
L' = L
for i=k..0:
  if L' + 2^i - 1 <= R:
    // F is associative, so this operation is meaningful
    answer = F(answer, Table[L'][i])
    L' += 2^i
```

Suppose our function $f$ is also idempotent, meaning $f(x, x) = x$ holds for all x in the domain. Then we immediately get

$f(a[i..j]) = f(f(a[i..s],f(a[t..j])), i \le t, s \le j, t \le s + 1$.

**This property allows us to not precisely cover the region exactly once, which is the key to achieving O(1).**

Let $t$ be the largest $t$ satisfying $2^t \le (j - i + 1)$, i.e., $2^{t + 1} > (j - i + 1)$. Then clearly $i + 2^t - 1 \le j$, $j - 2^t + 1 \ge i$, and $j - 2^t + 1 \le (i + 2^t - 1) + 1$ always holds.

So $f(a[i..j]) = f(f(i..i + 2^t - 1), f(j - 2^t + 1..j))$, where the two terms are $b_{i, t}$ and $b_{j - 2^t, t}$.

This concludes the principle. Implementation code is in the Appendix at the end.

#### ST & LCA

Sparse Table can be used not only for various range queries but also for computing the Lowest Common Ancestor (LCA) of two nodes in a tree. Using ST, the LCA of any two nodes can be computed in O(2lgH) time, with O(NlgN) space complexity, where N is the number of nodes in the tree and H is the tree height.

The main idea is to store the 2^j-th ancestor of node i in an array, then search. Interested readers can refer to the article on RMQ and LCA on TopCoder. The link is in the references, and further details are omitted here.

### Parallel Binary Search

Parallel Binary Search -- let's first use a problem from SPOJ to introduce this method, then look at a slightly different problem from HourRank.

The following two subsections heavily reference a blog on Codeforces. The original link is at the end of the article, and interested readers can go there to learn more.

#### Motivation Problem

There is a problem on SPOJ: [Meteors](http://www.spoj.com/problems/METEORS/). Here is a brief description:

> There are N member states and a circular area divided equally into M sectors, each belonging to some member state. Q meteor showers are forecast, each falling on a sector range [L, R], with each sector receiving the same quantity K of meteorites. Each member state has a meteorite collection target reqd[i]. For each member state, determine the minimum number of meteor showers needed to meet the collection target.

> 1 <= N, M, Q <= 300000
> 1 <= K <= 1e9

#### Solution

If we consider simulating each step without any data structures and then checking whether the target is met, the update cost is O(M) and the check cost is O(N + M), giving a total cost of O((2M + N)Q), which is unacceptable.

Noticing the range updates and recalling the data structures discussed at the beginning of this blog, BIT is the most suitable choice for simulating updates. This reduces the update cost to O(lgM), but the check cost becomes O(MlgM). If we still simulate step by step, it will obviously be worse than before.

At this point, can you think of something? Yes, binary search! Binary search doesn't care what each value in the sequence looks like. It only needs to know:

1. The sequence is monotonic
2. The value at a given position in the sequence can be obtained by some method

Then, through binary search, we can find the desired position within O(lgN) value retrievals/checks.

Here, the "sequence" refers to a member state's cumulative collection total, which is implicitly reflected by the sequence of sector ranges. Through binary search, for each member state we only need O(lgQ) checks to find the time point at which the target is met. So the total time complexity per member state is approximately O(logQ * Q * logM), where the check time is negligible compared to the update time and is thus omitted. The final complexity is O(N * log Q * Q * logM).

As we can see, this complexity is still too high -- even higher than direct simulation. So what do we do?

Think about it: while the cost per simulation step decreased, the number of simulations rose to O(NlgQ). Although the number of checks also decreased, compared to simulation cost, the reduction was negligible. So the priority is to simultaneously reduce the simulation overhead.

It feels a bit wasteful, doesn't it? Each time we just do a quick check but have to simulate an entire round. Even though the per-step cost is low, you can't afford to burn CPU like that.

In reality, each member state's binary search experience is very similar -- finding the right portion in the fully simulated sequence and then doing a check before moving to the next round. Since we've already done the full simulation, can we let every member state check at once before starting the next round?

This is the core idea of Parallel Binary Search: **complete one step of search for all member states through a single simulation round**, reducing the total number of simulations to O(lgQ) -- a huge improvement!

The concrete method is to maintain two arrays of length N, recording the current L and R for each member state. For each mid value to check, maintain a linked list of member states that need to check that mid value. The rest is described by the following pseudocode:

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

In the above process, the `apply()` function simulates the update and checks whether the member states that need checking have met their targets.

This way, the total simulation cost is O(lgQ * Q * lgM), and the total check cost is O(lgQ * (MlgM + N)). We successfully reduced both the simulation and check costs simultaneously! The total time complexity is O(lgQ * (Q + M) * lgM). As for the smaller N term, it's negligible.

As in the original article, here's a quote from a top competitor explaining Parallel Binary Search:

> "A cool way to visualize this is to think of a binary search tree. Suppose we are doing standard binary search, and we reject the right interval — this can be thought of as moving left in the tree. Similarly, if we reject the left interval, we are moving right in the tree.
So what Parallel Binary Search does is move one step down in N binary search trees simultaneously in one "sweep", taking O(N  \*  X) time, where X is dependent on the problem and the data structures used in it. Since the height of each tree is LogN, the complexity is O(N  \*  X  \*  logN)." — rekt_n00b

#### Hourrank23 -- Selective Additions

This is a cursed problem... sorry I couldn't help it.

The problem is as follows:

> There is an array of length N. We perform M range updates, each adding a positive number. However, we have K favorite numbers. Once an element in the array becomes one of our favorite numbers, further updates to it are invalidated and it retains that value forever.
> Output the array sum after each update.
>
> 1 <= N, M <= 1e5
> 1 <= k <= 5

This problem differs from the previous one: **the check cost is low, and the check target coincides with the original range**. Also, there are multiple targets.

The multiple targets can be handled as follows: sort the favorite numbers. Since updates are always positive, once the earlier (smaller) favorite number is reached, the later ones no longer need to be checked.

Using the PBS approach described above, the complexity of this problem is O(k(n + m)lognlogm), which is a very good complexity.

However, there must be a "however" here. Since the check cost is very low, binary search is not strictly necessary for this problem. I reviewed many top competitors' code and the editorial. Some used PBS, some simulated the time series, and some used segment trees with tricks. Let me introduce them one by one:

#### PBS

Nothing more to say -- offline simulation for logm rounds.

#### Time Series Simulation

Code: https://www.hackerrank.com/rest/contests/hourrank-23/challenges/selective-additions/hackers/nuipqiun/download_solution

This is also offline processing, but this competitor's simulation method is quite unique -- they simulate the value of the current array element along the time series. This was a first for me.

First, recall BIT's range update method: add delta at position l, subtract delta at position r + 1. Suppose we consider all range updates as [l, n]. Then simulating the value of the i-th array element along the time series becomes intuitive: for updates (j, a, b, delta) where a <= i, add delta at position j in the time series array. This way, all values after time j are increased by delta.

With this in mind, the time series simulation is straightforward. Since there are additions, there must be corresponding subtractions: for all updates (j, a, b, delta) where b < i, cancel them out by subtracting delta at position j in the time series, because such updates should not affect the time series of array element i, and they were previously applied.

So the approach becomes:

```cpp
rep(i,n){
	for(int j:ad[i]) add(j,ads[j]);
	for(int j:rm[i]) add(j,-ads[j]);
	// do you work
}
```

Here, ad[i] contains the indices of updates of the form [i, r], rm[i] contains the indices of updates of the form [l, i - 1], and the add operation is the Fenwick tree's addition operation. This allows us to compute a[i]'s value at any time point using sum(j).

The rest is simple: for each i, do a binary search to find the target and record it. The total time complexity should be O((kn + m)logm).

This is clearly faster than PBS because **the check range coincides with the original range**. This observation is very important. In contrast, for Meteors, although we can also simulate the time series of a range, a range is not meaningful for the target.

#### Segment Tree

Unlike the two approaches above, this is an online algorithm.

The time complexity is O(klgm(n + m)), but it uses segment trees, so the space complexity is O(kmlgm).

The segment tree stores three values: a lazy field add, a range maximum maxi, and the corresponding array index id.

There are k segment trees in total, each initialized with the array {a\_i - fav_j}. In other words, if the corresponding value is positive, it's worth checking; if negative, it hasn't reached the check threshold yet.

Conveniently, leveraging the segment tree's structure, we can check the root node to determine whether there are any elements in the tree that need checking. This operation is O(1). When an array element has been checked, it is assigned -inf so it will never be checked again, and the segment tree transitions to the next pending state.

Since each array element is checked at most once per favorite number, the total check complexity is O(knlgm).

The update complexity is O(kmlgm), so the total complexity is O(k(m + n)lgm).

The segment tree trick here initially puzzled me. Why doesn't it work for Meteors but works here? I thought about it extensively but couldn't come up with a third approach to map Meteors' query ranges to a conveniently modifiable structure. So it ultimately comes down to the two reasons described earlier.

### Conclusion

For a series of update/query problems, the community has provided a variety of powerful tools:

1. Data structures: segment tree, Fenwick tree, Sparse Table, the recently studied Cartesian tree, and so on
2. Binary search, parallel binary search, CDQ divide and conquer (which I haven't looked into yet), and more

Organizing all of this in my head should give me a bit more confidence next time I tackle problems.

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

