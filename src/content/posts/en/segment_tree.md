---
title: "Segment Tree"
published: 2017-09-08T12:58:11+08:00
draft: false
category: "Data Structure"
tags: ["segment-tree", "range-query"]
---

This post is a translated version of the Segment Tree article on WCIPEG. Aside from removing a few sections, the structure follows the original exactly.

A **segment tree** is a very flexible data structure that helps us efficiently perform range queries or modifications on an underlying array. As the name suggests, a segment tree can be thought of as a tree formed by intervals of the underlying array, and its fundamental idea is divide and conquer.


### Motivation

One of the most common applications of segment trees is solving the Range Minimum Query (RMQ) problem: given an array, repeatedly query the minimum value within a given index range. For example, given the array [9, 2, 6, 3, 1, 5, 0, 7], querying the minimum from the 3rd to the 6th element yields min(6, 3, 1, 5) = 1. Then querying from the 1st to the 3rd element yields 2... and so on for a series of queries. There are many articles discussing this problem with various solutions. Among them, the segment tree is often the most suitable choice, especially when queries and modifications are interleaved. For simplicity, in the following sections, we will focus on the specific segment tree used for answering range minimum queries without further notice, while other types of segment trees will be discussed later in this article.

#### The divide-and-conquer solution

Divide and conquer:

+ If the range contains only one element, then that element is obviously the minimum.
+ Otherwise, split the range into two roughly equal halves, find their respective minimums, and the original minimum is the smaller of the two.

Therefore, let $a_i$ denote the i-th element of the array. The minimum query can be expressed as the following recursive function:

$f(x,y) = \begin{cases} a_x & \textrm{if}\ x = y\\\min(f(x, \lfloor\frac{x+y}{2}\rfloor), f(\lfloor\frac{x+y}{2}\rfloor) + 1, y) & \textrm{otherwise}\end{cases}, x \le y$

Thus, for example, the first query from the previous section, $f(3,6)$, would be recursively expressed as $\min(f(3,4),f(5,6))$.

### Structure

Suppose we use the function defined above to compute $f(1,N)$, where $N$ is the number of elements in the array. When $N$ is large, this recursive computation has two sub-computations: $f(1, \lfloor\frac{1+N}{2}\rfloor)$ and $f(\lfloor\frac{1+N}{2}\rfloor) + 1, N)$. Each sub-computation in turn has two sub-computations, and so on, until reaching the base case. If we represent this recursive computation process as a tree, $f(1, N)$ is the root node with two children, each of which may also have two children, and so on. The base cases are the leaf nodes of this tree. Now we can describe the structure of a segment tree:

+ A binary tree used to represent the underlying array
+ Each node represents a certain interval of the array and contains some function value over that interval
+ The root node represents the entire array (i.e., the interval [1, N])
+ Each leaf node represents a specific element in the array
+ Each non-leaf node has two children whose intervals are disjoint and whose union equals the parent node's interval
+ Each child's interval is approximately half the size of its parent's interval
+ Each non-leaf node stores a value that is not only the function value of the interval it represents, but also a function of its children's stored values (i.e., corresponding to the recursive process)

In other words, the structure of a segment tree is identical to the process of recursively computing $f(1,N)$.

Therefore, for example, the root node of the array [9,2,6,3,1,5,0,7] contains the number 0 -- the minimum of the entire array. Its left child contains the minimum of [9,2,6,3], which is 2; its right child contains the minimum of [1,5,0,7], which is 0. Each element corresponds to a leaf node containing only itself.

![](/img/posts/Segtree_92631507.png)

### Operations

A segment tree has three basic operations: construction, update, and query.

#### Construction

To perform queries and updates, we first need to build a segment tree representing a given array. We can build it either bottom-up or top-down. Top-down construction is a recursive process: attempt to fill a node; if it is a leaf node, fill it directly with the corresponding value; otherwise, first fill its two children, then fill the node with the smaller of the children's values. Bottom-up construction is left as an exercise. The difference in running speed between these two approaches is almost negligible.

#### Update

Updating a segment tree means updating a specific element of the underlying array. We first update the corresponding leaf node -- since leaf nodes correspond to a single array element. The parent of the updated node will also be affected, because its interval contains the modified element. The same applies to the grandparent, all the way up to the root, but **no other nodes are affected**. For a top-down update, we first update the root node, which causes the relevant one of its two children to be recursively updated. The update of a child node works the same way, with the boundary being the update of a leaf node. Once the recursive process completes, non-leaf node values are updated to the smaller of their two children's values. Bottom-up updating is also left as an exercise.

![0 changed to 8](/img/posts/Segtree_92631587.png)

#### Query

Querying a segment tree means determining the function value over a certain interval of the underlying array -- in this case, the minimum element value within the interval. The query operation is much more complex than the update operation, so we illustrate with an example. Suppose we want to find the minimum from the 1st to the 6th element, represented as $f(1, 6)$. Each node in the segment tree contains the minimum of some interval: for example, the root contains $f(1, 8)$, its left child $f(1, 4)$, its right child $f(5, 8)$, and so on; each leaf contains $f(x,x)$. No single node is $f(1,6)$, but notice that $f(1, 6) = \min(f(1,4),f(5,6))$, and there exist two nodes containing these two values (highlighted in yellow in the figure below).

Therefore, when querying a segment tree, we select a subset of all nodes such that the union of the intervals they represent is exactly the interval we want to query. To find these nodes, we start from the root and recursively query nodes whose intervals have at least some intersection with the query interval. In our example, $f(1, 6)$, we notice that both the left and right subtrees' intervals intersect, so both are recursively processed. The left child is a base case (highlighted in yellow) because its interval is entirely contained within the query interval. For the right child, we notice that its left child intersects the query interval, but its right child does not, so we only recurse into its left child. This is also a base case, also highlighted in yellow. The recursion terminates, and the final minimum is the minimum among all selected nodes.

![Query (1, 6)](/img/posts/Segtree_query_92631587.png)

### Analysis

Some important performance metrics of segment trees are as follows:

#### Space

It is easy to prove that a node at depth d corresponds to an interval of size at most $\lceil \frac{N}{2^d} \rceil$. We can see that all nodes at depth $\lceil \lg N\rceil$ correspond to at most one element, meaning they are leaf nodes. Therefore, a segment tree is a perfectly balanced binary tree with the theoretically minimum height. Consequently, we can store the tree as an array, with nodes ordered by breadth-first traversal, and for convenience, children ordered left-to-right. For the segment tree of [9,2,6,3,1,5,8,7] above, it would be stored as [1,2,1,2,3,1,7,9,2,6,3,1,5,8,7]. Assume the root node's index is 1. For a non-leaf node with index i, its two children have indices 2i and 2i+1. Note that some space at the leaf level of the tree may be unused, but this is usually acceptable. A binary tree of height $\lceil \lg N\rceil$ has at most $2^{\lfloor\lg N\rfloor + 1} - 1$ nodes, so through simple mathematical analysis, we know that a segment tree storing N elements requires an array of size no more than $4N$. A segment tree uses $\mathcal{O} (N)$ space.

#### Time

##### Construction

For each node, construction requires only a constant number of operations. Since the number of nodes in a segment tree is $\mathcal{O} (n)$, construction takes linear time.

##### Update

The update operation updates all nodes on the path from the root to the affected leaf node, with a constant number of operations per node. The number of nodes is bounded by the tree height, so as shown above, the time complexity of an update is $\mathcal{O}(\lg N)$.

##### Query

Consider all selected nodes (the yellow nodes in the figure from the previous section). In the case of querying $f(1, N - 1)$, there are $\lg N$ such nodes. Can there be more? The answer is no. Perhaps the simplest proof is that unrolling the selected-node algorithm terminates in $\mathcal{O}(\lg N)$ steps, as hinted at by the non-recursive approach mentioned earlier. So a query operation takes $\mathcal{O}(\lg N)$ time. The proof for the recursive version is left as an exercise.

### Implementation

```
object rmq_segtree
     private function build_rec(node,begin,end,a[])
          if begin = end
               A[node] = a[begin];
          else
               let mid = floor((begin+end)/2)
               build_rec(2*node,begin,mid,a[])
               build_rec(2*node+1,mid+1,end,a[])
               A[node] = min(A[2*node],A[2*node+1])
     private function update_rec(node,begin,end,pos,val)
          if begin = end
               A[node] = val
          else
               let mid=floor((begin+end)/2)
               if pos<=mid
                    update_rec(2*node,begin,mid,pos,val)
               else
                    update_rec(2*node+1,mid+1,end,pos,val)
               A[node] = min(A[2*node],A[2*node+1])
     private function query_rec(node,t_begin,t_end,a_begin,a_end)
          if t_begin>=a_begin AND t_end<=a_end
               return A[node]
          else
               let mid = floor((t_begin+t_end)/2)
               let res = ∞
               if mid>=a_begin AND t_begin<=a_end
                    res = min(res,query_rec(2*node,t_begin,mid,a_begin,a_end))
               if t_end>=a_begin AND mid+1<=a_end
                    res = min(res,query_rec(2*node+1,mid+1,t_end,a_begin,a_end))
               return res
     function construct(size,a[1..size])
          let N = size
          let A be an array that can hold at least 4N elements
          build_rec(1,1,N,a)
     function update(pos,val)
          update_rec(1,1,N,pos,val)
     function query(begin,end)
          return query_rec(1,1,N,begin,end)
```

### Variations

Segment trees are not limited to range minimum queries; they can be applied to many different function queries. Here are some examples from more challenging competition problems.

#### Maximum

Similar to minimum: replace all min operations with max.

#### Sum or product

Each non-leaf node's value is the sum of its children's values, representing the array sum over its interval. For example, in the pseudocode above, all min operations are replaced with addition. However, in some summation cases, the segment tree is replaced by a Binary Indexed Tree (BIT), because BIT uses less space, runs faster, and is easier to code. Multiplication can be implemented in the same way, simply replacing addition with multiplication.

#### Maximum/minimum prefix suffix sum

An interval prefix consists of the first k elements of the interval (k can be 0); similarly, a suffix consists of the last k elements. The maximum prefix sum is the largest sum among all prefixes of the interval (the sum of an empty interval is 0). This maximum is called the maximum prefix sum (the minimum prefix sum can be defined similarly). We want to efficiently query the maximum prefix sum of a given interval. For example, the maximum prefix sum of [1,-2,3,-4] is 2, corresponding to the prefix [1,-2,3].

To solve this problem with a segment tree, each node stores two function values for its corresponding interval: the maximum prefix sum and the interval sum. A non-leaf node's interval sum is the sum of its two children's interval sums. To find a non-leaf node's maximum prefix sum, we note that the last element of the prefix corresponding to the maximum prefix sum is either in the left child's interval or in the right child's interval. In the former case, we can directly obtain the maximum prefix sum from the left child. In the latter case, we add the left child's interval sum and the right child's maximum prefix sum. The larger of these two values is our maximum prefix sum. Querying is similar, but there may be more than two adjacent intervals (in which case the last element of the maximum prefix sum could be in any of them).

#### Maximum/minimum subvector sum

This problem queries the maximum sum among all subintervals of a given interval. It is similar to the maximum prefix sum problem from the previous section, but the first element of the subinterval does not necessarily start at the beginning of the interval. (The maximum subinterval sum of [1,-2,3,-4] is 3, corresponding to the subinterval [3].) Each node needs to store 4 pieces of information: maximum prefix sum, maximum suffix sum, maximum subinterval sum, and interval sum. The detailed design is left as an exercise.

#### "Stabbing query"

For more details, please visit the original page.

### Extension to two or more dimensions

Segment trees are not limited to solving one-dimensional array problems. In principle, they can be used for arrays of arbitrary dimensions, where intervals are replaced by boxes. Therefore, in a two-dimensional array, we can query the minimum element within a box, or the Cartesian product of two intervals.

For more details, please visit the original page.

### Lazy propagation

Certain types of segment trees support range updates. For example, consider a variant of the range minimum problem: we need to be able to update all elements within an interval to a specific value. This is called a range update. Lazy propagation is a technique that enables range updates to be completed in $\mathcal{O}(\lg N)$ time, just like single element updates.

It works as follows: each node has an additional lazy field for temporary storage. When this field is unused, its value is set to $+\infty$. When updating an interval, we select the same set of intervals as in a query. If the interval is not a leaf node, update its lazy field to the new minimum value (if the new value is smaller). Otherwise, directly update the value on the node. When a query or update operation needs to access a node's descendants, and that node's lazy field has a value, we push the lazy field's value down to its two children: update the two children's lazy fields with the parent's lazy field value, then reset the parent's lazy field to $+\infty$. However, if we only want the node's value without accessing any of its children, and the lazy field has a value, we can directly return the lazy value as the interval minimum.

### Reference

[1] https://wcipeg.com/wiki/Segment_tree


### Appendix

#### C++ Maximum Query, Range Update, Lazy Propagation

```cpp
class SegmentTree {
private:
    int n;
    vector<int> max_val, to_add;

    void push(int i, int tl, int tr) {
        max_val[i] += to_add[i];
        if (tl != tr - 1) {
            to_add[2 * i + 1] += to_add[i];
            to_add[2 * i + 2] += to_add[i];
        }
        to_add[i] = 0;
    }

    void add(int i, int tl, int tr, int l, int r, int delta) {
        push(i, tl, tr);
        if (tl >= r || tr <= l) {
            return;
        }
        if (l <= tl && tr <= r) {
            to_add[i] += delta;
            push(i, tl, tr);
            return;
        }
        int tm = (tl + tr) / 2;
        add(2 * i + 1, tl, tm, l, r, delta);
        add(2 * i + 2, tm, tr, l, r, delta);
        max_val[i] = max(max_val[2 * i + 1], max_val[2 * i + 2]);
    }

    int get(int i, int tl, int tr, int l, int r) {
        push(i, tl, tr);
        if (tl >= r || tr <= l) {
            return 0;
        }
        if (l <= tl && tr <= r) {
            return max_val[i];
        }
        int tm = (tl + tr) / 2;
        return max(get(2 * i + 1, tl, tm, l, r), get(2 * i + 2, tm, tr, l, r));
    }

public:
    SegmentTree(int k) {
        n = 1;
        while (n < k) {
            n *= 2;
        }
        max_val = vector<int>(2 * n, 0);
        to_add = vector<int>(2 * n, 0);
    }

    void add(int l, int r, int delta) { add(0, 0, n, l, r, delta); }

    int get(int l, int r) { return get(0, 0, n, l, r); }
};
```

