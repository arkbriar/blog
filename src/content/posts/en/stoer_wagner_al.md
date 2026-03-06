---
title: "Stoer-Wagner Algorithm -- Global Min-Cut in Undirected Weighted Graphs"
published: 2017-08-05T22:14:01+08:00
draft: false
tags: ["min-cut", "graph"]
category: "Graph Theory"
---

I recently came across a problem that required finding the global minimum cut of a graph. Unfortunately, graph theory was never my strong suit -- the only algorithm I could recall was Ford-Fulkerson for computing s-t max-flow/min-cut. I thought to myself, surely I can't just run max-flow $n^2$ times, so I eventually turned to Wikipedia for help.


## Stoer-Wagner Algorithm

The Stoer-Wagner algorithm computes the global minimum cut in an **undirected graph with non-negative edge weights**. It was proposed in 1995 by Mechthild Stoer and Frank Wagner.

The core idea of the algorithm is to repeatedly merge vertices from an s-t minimum cut to reduce the size of the graph, until only two merged vertices remain.

### Algorithm Procedure

In graph G, let C = {S, T} be the global minimum cut of G. Then for any pair of vertices (s, t) in G:

1. Either s and t **belong to different sides** S and T
2. Or s and t **belong to the same side** S or T

Stoer-Wagner first finds an s-t minimum cut, then merges s and t:

1. Remove the edge between s and t
2. For any vertex v adjacent to s or t, the weight of the edge to the new merged vertex is w(v, s) + w(v, t) (assuming weight 0 if not adjacent)

Clearly, for any cut where s and t are in the same set, merging s and t does not affect the cut weight.

The above procedure (finding a minimum cut, then merging) constitutes one phase. After performing |V| - 1 such phases, only two vertices remain in G. The global minimum cut is then the minimum among **the s-t minimum cuts from each phase** and **the cut between the final two vertices**. This completes the algorithm.

As you may have noticed, the key to making the algorithm efficient is how to find an s-t minimum cut. This is precisely where the elegance of the Stoer-Wagner algorithm lies.

Since the algorithm has no specific requirements for the endpoints of the s-t minimum cut, any minimum cut will do. The procedure is as follows:

1. Pick an arbitrary vertex $u$ from graph G and add it to set $A$
2. Select a vertex $v$ from $V - A$ that maximizes $w(A,v)$, and add it to $A$; where $w(A,v) = \sum\limits_{u \in A}w(u,v)$
3. Repeat **Step 2** until $V = A$
4. Let the last two vertices added to $A$ be $s$ and $t$; merge them

In the above procedure, $\left(A - \{s\}, \{t\}\right)$ is an s-t minimum cut.

### Proof of Correctness

To prove the correctness of the algorithm, we only need to show that each phase finds a valid s-t minimum cut.

**Symbol Definitions**

1. Graph $G(V,E,W)$
2. $s$, $t$ are the last two vertices added to set $A$
3. Let $C = (X, \overline{X})$ be any s-t cut; without loss of generality, let $t \in X$
4. $A_v$ is the set $A$ before vertex $v$ is added
5. $C_v$ is the cut induced by $C$ on the subgraph of $G$ formed by vertices $A_v \cup \{v\}$

Therefore, we have $C_v = C$, and we only **need to prove** that $w(A_t, t) \le w(C) = w(C_t)$.

We will prove by induction that $\forall u \in X$, $w(A_u, u) \le w(C_u)$.

Let $u_0$ be the first vertex in $X$ added to $A$. By definition, we have $w(A_{u_0}, u) = w(C_{u_0})$.

Assume that for two consecutive vertices $u, v$ added to $A$ that both belong to $X$, the induction hypothesis gives $w(A_u,u) \le w(C_u)$.

First, we have $w(A_v, v) = w(A_u, v) + w(A_v - A_u, v)$.

Since $u$ was selected before $v$, we know $w(A_u, u) \ge w(A_u, v)$, so:

$w(A_v, v) \le w(A_u, u) + w(A_v - A_u, v) \le w(C_u) + w(A_v - A_u, v)$

Since $(A_v - A_u) \cap X = \{u\}$, we have $W(C_u) + w(A_v - A_u, v) = w(C_v)$.

Therefore $w(A_u, u) \le w(C_u)$. QED.

Thus, we know that each phase of the algorithm finds a valid s-t minimum cut.

### Time Complexity

Computing the maximum $w(A, u)$ each time takes $O(|V|^2)$, and the final merge takes $O(|E|)$, so each phase has time complexity $O(|E| + |V|^2)$.

With $|V|-1$ phases in total, the overall time complexity is $O(|V||E| + |V|^3)$.

The selection of the maximum $w(A, u)$ can be optimized using a heap, reducing it to $O(lg|V|)$ per selection, giving a total time complexity of $O(|V||E| + |V|^2lg|V|)$.

As a side note, the Stoer-Wagner algorithm requires a heap that supports dynamic updates. A commonly used heap for this is the Fibonacci heap, which is not implemented in the C++ standard STL. An alternative is `std::multiset`. The Boost library provides direct support for the Stoer-Wagner algorithm.

## References

[1] https://en.wikipedia.org/wiki/Stoer%E2%80%93Wagner_algorithm

[2] http://www.boost.org/doc/libs/1_64_0/libs/graph/doc/stoer_wagner_min_cut.html
