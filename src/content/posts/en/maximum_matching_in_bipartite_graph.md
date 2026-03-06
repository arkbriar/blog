---
title: "Maximum Matching in Bipartite Graph"
published: 2017-09-26T22:26:08+08:00
draft: false
category: "Graph Theory"
tags: ["bipartite-graph", "hungarian", "hopcroft-karp"]
---

The previous few blog posts were mainly about data structures for range updates and range queries. The upcoming topic is graph theory and graph algorithms. I hope to learn and recall most graph algorithms.

Today I encountered a problem that can be transformed into the existence of a perfect matching in a bipartite graph. Let's first look at the theory behind perfect matching, Hall's Marriage Theorem, and then introduce two algorithms for solving the superset of perfect matching -- the maximum matching problem.


### Hall's Marriage Theorem

Let $G$ denote a bipartite graph with left and right parts $X$ and $Y$ respectively. Let $W \subset X$, and $N_G(W)$ be the set of vertices in $Y$ adjacent to $W$.

Then a matching that covers all of $X$ exists if and only if

$\forall W \subset X, |W| \le |N_G(W)|$, meaning every subset of $X$ has enough neighbors for matching.

#### Deduction 1 [1]

Given a bipartite graph $G(X + Y, E)$, $|X| = |Y|$, $G$ is connected, and every vertex in $X$ has a distinct degree, then a perfect matching must exist in $G$.

Proof:

First, since $G$ is connected, $\forall u \in X, deg(u) >= 1$.
Then $\forall W \subset X$, $\max\limits_{u \in W}\{deg(u)\} \ge |S|$, satisfying Hall's Marriage Theorem. QED.

### Hungarian Algorithm

In fact, after extensive searching, I could not find an algorithm specifically called the Hungarian Algorithm for bipartite maximum matching. The only Hungarian Algorithm I found is for the Assignment Problem, i.e., maximum matching in weighted bipartite graphs.

Since the maximum matching problem and the maximum flow problem can be easily converted to each other, I also found many algorithms with similar or even identical ideas, such as the Ford-Fulkerson Algorithm, Edmonds-Karp Algorithm, etc.

As for which book introduced the name "Hungarian Algorithm," I can't quite remember... It was probably some graph theory book I studied. Here I will mainly discuss its specific idea and proof.

#### Alternating Path & Augmenting Path

Suppose we have a bipartite graph $G(U + V, E)$, and there is a matching $M \subset E$. If a vertex does not appear on any edge in $M$, we say the vertex is unmatched. The definition of unmatched edges is similar.

Alternating path: Starting from an unmatched vertex, a path that alternates between unmatched edges, matched edges, unmatched edges... is called an alternating path.
Augmenting path: An **alternating path** that starts from an unmatched vertex in $U$ and ends at an unmatched vertex in $V$ is called an augmenting path.

Clearly, by the definition of an augmenting path, there is one more unmatched edge than matched edge on the path. If we flip all unmatched edges to matched and matched edges to unmatched on this path, the resulting matching $M'$ is larger than the original by 1.

#### Theorem of Augmenting Path

A matching $M$ is a maximum matching if and only if there is no augmenting path in graph $G$.

Proof:

If an augmenting path exists, $M$ is obviously not maximum. So we only need to prove that when no augmenting path exists, $M$ is maximum.

Assume there exists a matching $M$ with no augmenting path, and $M$ is not a maximum matching. Let $M^*$ be a maximum matching on $G$, so $|M^*| > |M|$.

Thus $|M^* - M| > |M - M^*|$.

Consider all edges in the symmetric difference of $M^*$ and $M$ ($M^* \cup M - M^* \cap M$), and let $G'$ be the graph formed by vertices $U + V$ and these edges.

Since the edges in $G'$ come from two matchings, any vertex in $G'$ is adjacent to at most two edges.

Therefore, any connected component of $G'$ can only be a path or a cycle, with an even number of edges, and the edges along the path or cycle must form an alternating sequence with respect to $M^* - M$ or $M - M^*$.

Since $|M^* - M| > |M - M^*|$ and all cycles have an even number of edges, there must be a path whose edges, start vertex, and end vertex are all in $M^* - M$, and which alternates between $M^* - M$ and $M - M^*$. Clearly, this path forms an augmenting path with respect to $M$. Contradiction!

QED.

#### Pseudocode

The Hungarian Algorithm has two implementations, based on DFS and BFS respectively, both with time complexity $\mathcal{O}(|V||E|)$.

Below is the pseudocode for the BFS version:

```pascal
Algorithm MaximumBigartiteMatching(G)
    initialize set M of edges // can be the empty set
    initialize queue Q with all the free vertices in V
    while not Empty(Q) do
        w ← Front(Q)
        if w ε V then
            for every vertex u adjacent to w do // u must be in U
                if u is free then // augment
                    M ← M union (w, u)
                    v ← w
                    while v is labeled do // follow the augmenting path
                        u ← label of v
                        M ← M - (v, u)  // (v, u) was in previous M
                        v ← label of u
                        M ← M union (v, u) // add the edge to the path
                    // start over
                    remove all vertex labels
                    reinitialize Q with all the free vertices in V
                    break // exit the for loop
                else // u is matched
                    if (w, u) not in M and u is unlabeled then
                    label u with w // represents an edge in E-M
                    Enqueue(Q, u)
                    // only way for a U vertex to enter the queue

        else // w ε U and therefore is matched with v
            v  ←  w's mate // (w, v) is in M
            label v with w // represents in M
            Enqueue(Q, v) // only way for a mated v to enter Q
```

Compared to BFS, the DFS version of the Hungarian Algorithm is easier to implement. Its C++ code can be found in the appendix.

### Hopcroft-Karp Algorithm

The Hopcroft-Karp Algorithm is an algorithm specifically designed for the bipartite maximum matching problem. Its worst-case time complexity is $\mathcal{O}(|E|\sqrt{|V|})$, and its worst-case space complexity is $\mathcal{O}(|V|)$.

The Hopcroft-Karp Algorithm was discovered in 1973 by computer scientists John Hopcroft and Richard Karp.

Like the Hungarian Algorithm, the Hopcroft-Karp Algorithm also repeatedly finds augmenting paths to enlarge the partial matching. The difference is that while the Hungarian Algorithm finds only one augmenting path at a time, this algorithm finds a maximal set of augmenting paths each time, so we only need $\mathcal{O}(\sqrt{|V|})$ iterations.

The Hopcroft-Karp Algorithm alternates between the following two phases:

1. Use BFS to find augmenting paths of the next length, traversing all augmenting paths of that length (i.e., the maximal set mentioned above).
2. If longer augmenting paths exist, for each possible starting vertex u, use DFS to find and record augmenting paths.

In each iteration, the length of the shortest augmenting path found by BFS increases by at least 1. So after $\sqrt{|V|}$ iterations, the shortest augmenting path that can be found has length at least $\sqrt{|V|}$. Suppose the current partial matching is $M$ (edge set). The symmetric difference of $M$ and the maximum matching forms a collection of vertex-disjoint augmenting paths and alternating cycles. If all paths in this collection have length at least $\sqrt{|V|}$, then there are at most $\sqrt{|V|}$ paths, so the maximum matching size differs from $|M|$ by at most $\sqrt{|V|}$. Since each iteration increases the matching size by at least 1, there are at most $\sqrt{|V|}$ more iterations until the algorithm terminates.

In each iteration, BFS traverses at most every edge in the graph, and so does DFS, so the time complexity per iteration is $\mathcal{O}({|E|})$, giving a total time complexity of $\mathcal{O}({|E|\sqrt{|V|}})$.

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

A problem that can be converted into finding a perfect matching. Problem summary:

> There are n people and n shelters on a 2D plane. You need to assign n people to shelters such that each shelter accommodates exactly one person, and the time for everyone to enter a shelter is minimized, i.e., the time for the last person to enter a shelter is minimized. The time for a person to move from (X, Y) to (X1, Y1) is |X - X1| + |Y - Y1|.
> 1 <= n <= 100

I couldn't think of a good direct approach to this problem. However, observing that any possible solution must equal the travel time of some person to some shelter, we can compute and sort all travel times from every person to every shelter.

For a person moving to a shelter with travel time T, all moves with time less than or equal to T are feasible. We build a bipartite graph with people on the left and shelters on the right. For all feasible moves, we add a corresponding edge to the bipartite graph. If an assignment satisfying the above conditions exists, it must be a perfect matching on the graph, and the goal is to find the smallest such T.

For our bipartite graph, the worst case is a complete bipartite graph. The time complexity for the Hungarian Algorithm to determine a perfect matching is $\mathcal{O}(n^3)$, and for the Hopcroft-Karp Algorithm it is $\mathcal{O}(n^2\sqrt{n})$, so the verification complexity is still relatively high.

If we add edges one by one in order of travel time, we would need up to $n^2$ verifications in the worst case, which is too expensive. While the small data size here is manageable, it would be problematic if n were as large as 1000.

Remember the technique we mentioned for reducing the number of verifications? Yes, binary search -- only $2\log n$ verifications needed.

Here we also have a simulation cost for constructing the corresponding bipartite graph each time. The worst-case construction time per iteration is $n^2$, giving a total time complexity of $\mathcal{O}(n^3\log n)$ or $\mathcal{O}(n^2\sqrt{n}\log n)$.

The code implementation is in the appendix.

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
