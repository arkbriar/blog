---
title: "Maximum Matching in Bipartite Graph"
date: 2017-09-26T22:26:08+08:00
draft: false
categories: ["Development", "Algorithm", "Graph Theory"]
tags: ["maximum matching", "graph", "hungarian algorithm", "hopcraft-karp algorithm", "hall's marriage theorem", "bipartite graph"]
toc: true
comments: true
---

上几篇博文主要是关于范围更新和范围查询的几个数据结构，接下去的主题是图论和图算法，希望能够学习和回忆起大部分图算法。

今天遇到一个问题，可以转化成二部图(bipartite graph)上的完美匹配的存在性问题，我们先来看一下完美匹配的理论，Hall's Marriage theorem；然后介绍两个算法，用于解决完美匹配的超集——最大匹配问题。

### Hall's Marriage Theorem

令 `$G$` 表示一个二部图，左部和右部分别为 `$X$` 和 `$Y$`。令 `$W \subset X$`, `$N_G(W)$` 为 `$W$` 在 `$Y$` 中的相邻点的集合。

那么如果存在一个匹配方式覆盖整个 `$X$` 当且仅当

`$\forall W \subset X, |W| \le |N_G(W)|$`，也就是说每个 `$X$` 的子集都有足够的邻居做匹配。

证明

#### Deduction 1 [1]

加入一个二部图 `$G(X + Y, E)$`，`$|X| = |Y|$`，`$G$` 是连通图，且每个 `$X$` 中的点的度数都不相同，那么 `$G$` 上一定存在完美匹配。

证明：

首先，因为 `$G$` 是连通图，所以 `$\forall u \in X, deg(u) >= 1$`。
那么 `$\forall W \subset X$`， `$\max\limits_{u \in W}\{deg(u)\} \ge |S|$`，满足 Hall's Marriage Theorem，得证。

### Edmonds-Karp Algorithm

Edmonds-Karp 算法是

#### Pseudocode

### Hopcroft-Karp Algorithm

Hopcroft-Karp 算法是一个专用于解二部图最大匹配问题的算法，它最差情况的时间复杂度为 `$\mathcal{O}(|E|\sqrt{|V|})$`，最差情况下的空间开销为 `$\mathcal{O}(|V|)$`。

Hopcroft-Karp 算法是在1973年由 Hohn Hopcroft 和 Richard Karp 两位计算机学者发现的。

和匈牙利算法一样，Hopcroft-Karp 算法同样是不断地通过寻找增广路径，来增大部分匹配。不同的是，匈牙利算法每次只找到一条增广路径，而该算法则每次找增广路径的一个最大集合，从而我们只需要进行 `$\mathcal{O}(\sqrt{|V|})$` 次迭代。

Hopcroft-Karp 算法循环以下两个阶段：

1. 用 BFS 寻找下一个长度的增广路径，并且能遍历该长度下所有增广路径 (也就是上面所说的最大集合)。
2. 如果存在更长的增广路径，对每个可能的起点 u，用 DFS 寻找并记录增广路径

每一次循环，BFS 所找到的最短增广路径的长度至少增加1，所以在 `$\sqrt{|V|}$` 次循环以后，能找到的最短增广路径长度至少为 `$\sqrt{|V|}$`。假设当前的部分匹配集合为 `$M$` (边集)，`$M$` 和最大匹配的对称差组成了一组点不相交的增广路径和交替环。如果这个集合内所有的路径的长度都至少为 `$\sqrt{|V|}$`，那么最多只有 `$\sqrt{|V|}$` 条路径，那么最大匹配的大小与 `$|M|$` 最多为 `$\sqrt{|V|}$`。而每次循环至少将匹配大小增加1，所以直到算法结束最多还有 `$\sqrt{|V|}$` 次循环。

每次循环中，BFS 最多遍历图中每条边，DFS 也是最多遍历每条边，所以每一轮循环的时间复杂度为 `$\mathcal{O}({|E|})$`，总时间复杂度为 `$\mathcal{O}({|E|\sqrt{|V|}})$`。

#### Pseudocode

```pascal
/* 
 G = U ∪ V ∪ {NIL}
 where U and V are partition of graph and NIL is a special null vertex
*/
  
function BFS ()
    for each u in U
        if Pair_U[u] == NIL
            Dist[u] = 0
            Enqueue(Q,u)
        else
            Dist[u] = ∞
    Dist[NIL] = ∞
    while Empty(Q) == false
        u = Dequeue(Q)
        if Dist[u] < Dist[NIL] 
            for each v in Adj[u]
                if Dist[ Pair_V[v] ] == ∞
                    Dist[ Pair_V[v] ] = Dist[u] + 1
                    Enqueue(Q,Pair_V[v])
    return Dist[NIL] != ∞

function DFS (u)
    if u != NIL
        for each v in Adj[u]
            if Dist[ Pair_V[v] ] == Dist[u] + 1
                if DFS(Pair_V[v]) == true
                    Pair_V[v] = u
                    Pair_U[u] = v
                    return true
        Dist[u] = ∞
        return false
    return true

function Hopcroft-Karp
    for each u in U
        Pair_U[u] = NIL
    for each v in V
        Pair_V[v] = NIL
    matching = 0
    while BFS() == true
        for each u in U
            if Pair_U[u] == NIL
                if DFS(u) == true
                    matching = matching + 1
    return matching
```

### A Problem

一个可以转换成做完美匹配的题目，题目大意：

> 二维平面上一共 n 个人和 n 个防空洞，现在你需要将 n 个人分配到防空洞中，使得每个防空洞仅容纳一个人，并且所有人进入防空洞的时间最短，即最晚进入防空洞的人的时间最短。一个人从 (X, Y) 移动到 (X1, Y1) 所需时间为 |X - X1| + |Y - Y1|。
> 1 <= n <= 100

这道题直接做我没有想到什么好办法，但是观察到可能解一定为某个人移动到某个防空洞的时间，所以我们将所有人移动到所有防空洞的时间全部计算出来并排序。

对于某个人移动到某个防空洞，假设耗时为 T，那么所有耗时小于等于 T 的移动操作是可行的。我们建立一张二部图，左边是人的集合，右边是防空洞的集合，对于所有可行操作，我们在二部图上添加一条对应的边。那么如果此时存在一种分配方式满足上述条件，它在图上一定是一个完美匹配，而目标就是找到这样最小的一个T。

对于我们的二部图，最差情况为完全二部图，对于匈牙利算法判定完美匹配的时间复杂度为 `$\mathcal{O}(n^3)$`，Hopcroft-Karp 算法为 `$\mathcal{O}(n^2\sqrt{n})$`，所以判定复杂度还是比较高的。

假如我们一条一条添加，也就是按照耗时顺序添加，那么最坏情况一共要判定 `$n^2$` 次，这太高了，这里数据比较小还可以，但是万一n大到1000就难说了。

还记得之前我们提过的减小判定次数的方式嘛？对，二分查找，一共判定 `$2\log n$` 次。

在这里，我们同时也存在模拟复杂度，这里模拟为构造对应的二部图，每次构造的最坏时间复杂度为 `$n^2$`，所以总计时间复杂度为 `$\mathcal{O}(n^3\log n)$` 或者 `$\mathcal{O}(n^2\sqrt{n}\log n)$`。

代码实现在附录中。

### References

[1] https://en.wikipedia.org/wiki/Hall%27s_marriage_theorem

[2] https://math.stackexchange.com/questions/1204270/bipartite-graph-has-perfect-matching

[3] https://en.wikipedia.org/wiki/Matching_(graph_theory)

[4] https://en.wikipedia.org/wiki/Hopcroft%E2%80%93Karp_algorithm

[5] https://www.topcoder.com/community/data-science/data-science-tutorials/maximum-flow-augmenting-path-algorithms-comparison/

[6] http://www.csl.mtu.edu/cs4321/www/Lectures/Lecture%2022%20-%20Maximum%20Matching%20in%20Bipartite%20Graph.htm

### Appendix


#### Air Defense Exercise

```cpp
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <algorithm>
#include <vector>
#include <string>
#include <stack>
#include <cmath>
#include <deque>
#include <queue>
#include <map>
#include <bitset>
#include <set>
#include <list>
#include <unordered_map>
#include <unordered_set>
#include <sstream>
#include <numeric>
#include <climits>
#include <utility>
#include <iomanip>
#include <cassert>

using namespace std;

using ll = long long;
using ii = pair<int, int>;
using iii = pair<int, ii>;
template <class T>
using vv = vector<vector<T>>;

#define rep(i, b) for (int i = 0; i < int(b); ++i)
#define reps(i, a, b) for (int i = int(a); i < int(b); ++i)
#define rrep(i, b) for (int i = int(b) - 1; i >= 0; --i)
#define rreps(i, a, b) for (int i = int(b) - 1; i >= a; --i)
#define repe(i, b) for (int i = 0; i <= int(b); ++i)
#define repse(i, a, b) for (int i = int(a); i <= int(b); ++i)
#define rrepe(i, b) for (int i = int(b); i >= 0; --i)
#define rrepse(i, a, b) for (int i = int(b); i >= int(a); --i)

#define all(a) a.begin(), a.end()
#define rall(a) a.rbegin(), a.rend()
#define sz(a) int(a.size())
#define mp(a, b) make_pair(a, b)

#define inf (INT_MAX / 2)
#define infl (LONG_MAX / 2)
#define infll (LLONG_MAX / 2)

#define X first
#define Y second
#define pb push_back
#define eb emplace_back

// tools for pair<int, int> & graph
template <class T, size_t M, size_t N>
class graph_delegate_t {
    T (&f)[M][N];

public:
    graph_delegate_t(T (&f)[M][N]) : f(f) {}
    T& operator[](const ii& s) { return f[s.first][s.second]; }
    const T& operator[](const ii& s) const { return f[s.first][s.second]; }
};
ii operator+(const ii& lhs, const ii& rhs) {
    return mp(lhs.first + rhs.first, lhs.second + rhs.second);
}

// clang-format off
template <class S, class T> ostream& operator<<(ostream& os, const pair<S, T>& t) { return os << "(" << t.first << "," << t.second << ")"; }
template <class T> ostream& operator<<(ostream& os, const vector<T>& t) { os << "{"; rep(i, t.size() - 1) { os << t[i] << ","; } if (!t.empty()) os << t.back(); os << "}"; return os; }
vector<string> __macro_split(const string& s) { vector<string> v; int d = 0, f = 0; string t; for (char c : s) { if (!d && c == ',') v.pb(t), t = ""; else t += c; if (c == '\"' || c == '\'') f ^= 1; if (!f && c == '(') ++d; if (!f && c == ')') --d; } v.pb(t); return v; }
void __args_output(vector<string>::iterator, vector<string>::iterator) { cerr << endl; }
template <typename T, typename... Args>
void __args_output(vector<string>::iterator it, vector<string>::iterator end, T a, Args... args) { cerr << it->substr((*it)[0] == ' ', it->length()) << " = " << a; if (++it != end) { cerr << ", "; } __args_output(it, end, args...); }
#define out(args...) { vector<string> __args = __macro_split(#args); __args_output(__args.begin(), __args.end(), args); }
// clang-format on

const int MAX_N = 100;
int n;
ii p[MAX_N], h[MAX_N];
iii d[MAX_N * MAX_N];

vector<int> edges[MAX_N];
int match[MAX_N];
bool visited[MAX_N];

void link(int u, int v) { edges[u].push_back(v); }

bool dfs(int u) {
    for (auto v : edges[u]) {
        if (visited[v]) continue;
        visited[v] = true;
        if (match[v] == -1 || dfs(match[v])) {
            match[v] = u;
            return true;
        }
    }
    return false;
}

bool hungarian() {
    int m = 0;
    fill_n(match, n, -1);
    rep(i, n) {
        fill_n(visited, n, false);
        if (dfs(i)) ++m;
    }
    return m == n;
}

int match_u[MAX_N], match_v[MAX_N];
int dist[MAX_N];
int NIL = MAX_N;

bool bfs() {
    queue<int> q;
    rep(u, n) {
        if (match_u[u] == NIL) {
            dist[u] = 0;
            q.push(u);
        } else {
            dist[u] = inf;
        }
    }

    dist[NIL] = inf;
    while (!q.empty()) {
        auto u = q.front();
        q.pop();
        for (auto v : edges[u]) {
            if (dist[match_v[v]] == inf) {
                dist[match_v[v]] = dist[u] + 1;
                if (match_v[v] != NIL) q.push(match_v[v]);
            }
        }
    }
    return dist[NIL] != inf;
}

bool dfs_h(int u) {
    if (u == NIL) return true;
    for (auto v : edges[u]) {
        if (dist[match_v[v]] == dist[u] + 1 && dfs_h(match_v[v])) {
            match_u[u] = v;
            match_v[v] = u;
            return true;
        }
    }
    dist[u] = inf;
    return false;
}

bool hopcraft_karp() {
    int m = 0;
    fill_n(match_u, n, NIL);
    fill_n(match_v, n, NIL);
    while (bfs()) {
        rep(u, n) {
            if (match_u[u] == NIL && dfs_h(u)) {
                ++m;
            }
        }
    }
    return m == n;
}

bool pfmatch() { return hopcraft_karp(); }

int main() {
    cin >> n;
    rep(i, n) { cin >> p[i].first >> p[i].second; }
    rep(i, n) { cin >> h[i].first >> h[i].second; }
    rep(i, n) {
        rep(j, n) {
            int idx = i * n + j;
            int dis = abs(p[i].X - h[j].X) + abs(p[i].Y - h[j].Y);
            d[idx] = {dis, {i, j}};
        }
    }
    sort(d, d + n * n);
    int l = 0, r = n * n - 1;
    // binary search
    // time complexity: O(n^3lgn) for hungarian,
    // O(n^2√n * lgn) for hopcroft-karp
    while (l < r && d[l].first != d[r].first) {
        // replay
        rep(i, n) { edges[i].clear(); }
        int mid = (l + r) / 2;
        repe(i, mid) {
            int pi = d[i].second.first, hj = d[i].second.second;
            link(hj, pi);
        }
        if (pfmatch()) {
            r = mid;
        } else {
            l = mid + 1;
        }
    }
    cout << d[l].first << endl;
    return 0;
}
```
