---
title: "有序矩阵中的第k大数 (Selection in X+Y or Sorted Matrices)"
tags: ["algorithm", "paper", "leetcode"]
categories: ["Development", "Algorithm"]
date: 2017-08-02T20:58:55+08:00
toc: true
comments: true
draft: false
---

今天在刷 leetcode 的时候遇到一道题目 [Kth Smallest Element in a Sorted Matrix](https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/)。

首先用一个 Min-Heap 就可以得到 O(klgn) (n为列数)的算法，实现放在最后。

然而在翻阅览 Discuss 区的时候发现，这玩意居然有 O(n) (n为行、列数) 的算法，来自一篇论文 [Selection in X + Y and Matrices with Sorted Rows and Columns](http://www.cse.yorku.ca/~andy/pubs/X+Y.pdf)，同时适用于另一道题 [Find k Pairs with Smallest Sums](https://leetcode.com/problems/find-k-pairs-with-smallest-sums/)，在此只做介绍，因为我不认为有人能在面试的时候写的出来...

<!--more-->

### 简单介绍

设 A 为一个 n * n 的矩阵，所有行和列都是非降续的。

令 `$A^*$` 是 A 取所有奇数行的子矩阵，如果 n 为偶数的话添上 A 的最后一行一列；令 `$rank_{desc}(A, a)$` 为 A 中大于 a 的元素的数目，`$rank_{asc}(A, a)$` 为 A 中小于 a 的元素数目。

那么有以下不等式成立

1. `$rank_{asc}(A, a) \le 4 rank_{asc}(A^*, a)$`
2. `$rank_{desc}(A, a) \le 4 rank_{desc}(A^*, a)$`

这是这个算法的基础，加上巧妙的选择，可以是使得问题变为解一个在A*上的子问题。

算法过程参考论文，非常不直观，需要不少理论证明，实在没法详述... 有兴趣的同学还是参阅原论文

### Python、C++ 算法实现

在此摘录 discuss 上大佬给出的 python 和 cpp 版实现，在面试中谁能手写出来我只能跪穿。

```python
class Solution(object):
    def kthSmallest(self, matrix, k):

        # The median-of-medians selection function.
        def pick(a, k):
            if k == 1:
                return min(a)
            groups = (a[i:i+5] for i in range(0, len(a), 5))
            medians = [sorted(group)[len(group) / 2] for group in groups]
            pivot = pick(medians, len(medians) / 2 + 1)
            smaller = [x for x in a if x < pivot]
            if k <= len(smaller):
                return pick(smaller, k)
            k -= len(smaller) + a.count(pivot)
            return pivot if k < 1 else pick([x for x in a if x > pivot], k)

        # Find the k1-th and k2th smallest entries in the submatrix.
        def biselect(index, k1, k2):

            # Provide the submatrix.
            n = len(index)
            def A(i, j):
                return matrix[index[i]][index[j]]
            
            # Base case.
            if n <= 2:
                nums = sorted(A(i, j) for i in range(n) for j in range(n))
                return nums[k1-1], nums[k2-1]

            # Solve the subproblem.
            index_ = index[::2] + index[n-1+n%2:]
            k1_ = (k1 + 2*n) / 4 + 1 if n % 2 else n + 1 + (k1 + 3) / 4
            k2_ = (k2 + 3) / 4
            a, b = biselect(index_, k1_, k2_)

            # Prepare ra_less, rb_more and L with saddleback search variants.
            ra_less = rb_more = 0
            L = []
            jb = n   # jb is the first where A(i, jb) is larger than b.
            ja = n   # ja is the first where A(i, ja) is larger than or equal to a.
            for i in range(n):
                while jb and A(i, jb - 1) > b:
                    jb -= 1
                while ja and A(i, ja - 1) >= a:
                    ja -= 1
                ra_less += ja
                rb_more += n - jb
                L.extend(A(i, j) for j in range(jb, ja))
                
            # Compute and return x and y.
            x = a if ra_less <= k1 - 1 else \
                b if k1 + rb_more - n*n <= 0 else \
                pick(L, k1 + rb_more - n*n)
            y = a if ra_less <= k2 - 1 else \
                b if k2 + rb_more - n*n <= 0 else \
                pick(L, k2 + rb_more - n*n)
            return x, y

        # Set up and run the search.
        n = len(matrix)
        start = max(k - n*n + n-1, 0)
        k -= n*n - (n - start)**2
        return biselect(range(start, min(n, start+k)), k, k)[0]
```

```cpp
class Solution {
public:
	int kthSmallest(const std::vector<std::vector<int>> & matrix, int k)
	{
		if (k == 1) // guard for 1x1 matrix
		{
			return matrix.front().front();
		}

		size_t n = matrix.size();
		std::vector<size_t> indices(n);
		std::iota(indices.begin(), indices.end(), 0);
		std::array<size_t, 2> ks = { k - 1, k - 1 }; // use zero-based indices
		std::array<int, 2> results = biSelect(matrix, indices, ks);
		return results[0];
	}

private:
	// select two elements from four elements, recursively
	std::array<int, 2> biSelect(
		const std::vector<std::vector<int>> & matrix,
		const std::vector<size_t> & indices,
		const std::array<size_t, 2> & ks)
	// Select both ks[0]-th element and ks[1]-th element in the matrix,
	// where k0 = ks[0] and k1 = ks[1] and n = indices.size() satisfie
	// 0 <= k0 <= k1 < n*n  and  k1 - k0 <= 4n-4 = O(n)   and  n>=2
	{
		size_t n = indices.size();		
		if (n == 2u) // base case of resursion
		{			
			return biSelectNative(matrix, indices, ks);
		}
		
		// update indices
		std::vector<size_t> indices_;
		for (size_t idx = 0; idx < n; idx += 2)
		{
			indices_.push_back(indices[idx]);
		}
		if (n % 2 == 0) // ensure the last indice is included
		{
			indices_.push_back(indices.back());
		}

		// update ks
		// the new interval [xs_[0], xs_[1]] should contain [xs[0], xs[1]]
		// but the length of the new interval should be as small as possible
		// therefore, ks_[0] is the largest possible index to ensure xs_[0] <= xs[0]
		// ks_[1] is the smallest possible index to ensure xs_[1] >= xs[1]
		std::array<size_t, 2> ks_ = { ks[0] / 4, 0 };
		if (n % 2 == 0) // even
		{
			ks_[1] = ks[1] / 4 + n + 1;
		}
		else // odd
		{
			ks_[1] = (ks[1] + 2 * n + 1) / 4;
		}

		// call recursively
		std::array<int, 2> xs_ = biSelect(matrix, indices_, ks_);

		// Now we partipate all elements into three parts:
		// Part 1: {e : e < xs_[0]}.  For this part, we only record its cardinality
		// Part 2: {e : xs_[0] <= e < xs_[1]}. We store the set elementsBetween
		// Part 3: {e : x >= xs_[1]}. No use. Discard.
		std::array<int, 2> numbersOfElementsLessThanX = { 0, 0 };
		std::vector<int> elementsBetween; // [xs_[0], xs_[1])

		std::array<size_t, 2> cols = { n, n }; // column index such that elem >= x
		 // the first column where matrix(r, c) > b
		 // the first column where matrix(r, c) >= a
		for (size_t row = 0; row < n; ++row)
		{
			size_t row_indice = indices[row];
			for (size_t idx : {0, 1})
			{
				while ((cols[idx] > 0)
					&& (matrix[row_indice][indices[cols[idx] - 1]] >= xs_[idx]))
				{
					--cols[idx];
				}
				numbersOfElementsLessThanX[idx] += cols[idx];
			}
			for (size_t col = cols[0]; col < cols[1]; ++col)
			{
				elementsBetween.push_back(matrix[row_indice][indices[col]]);
			}
		}

		std::array<int, 2> xs; // the return value
		for (size_t idx : {0, 1})
		{
			size_t k = ks[idx];
			if (k < numbersOfElementsLessThanX[0]) // in the Part 1
			{
				xs[idx] = xs_[0];
			}
			else if (k < numbersOfElementsLessThanX[1]) // in the Part 2
			{
				size_t offset = k - numbersOfElementsLessThanX[0];
				std::vector<int>::iterator nth = std::next(elementsBetween.begin(), offset);
				std::nth_element(elementsBetween.begin(), nth, elementsBetween.end());
				xs[idx] = (*nth);
			}
			else // in the Part 3
			{
				xs[idx] = xs_[1];
			}
		}
		return xs;
	}

	// select two elements from four elements, using native way
	std::array<int, 2> biSelectNative(
		const std::vector<std::vector<int>> & matrix,
		const std::vector<size_t> & indices,
		const std::array<size_t, 2> & ks)
	{
		std::vector<int> allElements;
		for (size_t r : indices)
		{
			for (size_t c : indices)
			{
				allElements.push_back(matrix[r][c]);
			}
		}
		std::sort(allElements.begin(), allElements.end());
		std::array<int, 2> results;
		for (size_t idx : {0, 1})
		{
			results[idx] = allElements[ks[idx]];
		}
		return results;
	}
};
```

### Min-Heap O(klgn) 算法
```cpp
class Solution {
    struct Tuple {
        int x, y, val;
        Tuple(int x, int y, int val) : x(x), y(y), val(val) {}

        bool operator<(const Tuple& other) const { return val < other.val; }
        bool operator>(const Tuple& other) const { return val > other.val; }
    };

public:
    int kthSmallest(vector<vector<int>>& matrix, int k) {
        priority_queue<Tuple, vector<Tuple>, std::greater<Tuple>> min_heap;
        int n = matrix.size();
        for (int i = 0; i < n; ++i) min_heap.push(Tuple(0, i, matrix[0][i]));

        for (int i = 0; i < k - 1; ++i) {
            auto t = min_heap.top();
            min_heap.pop();
            if (t.x == n - 1) continue;
            min_heap.push(Tuple(t.x + 1, t.y, matrix[t.x + 1][t.y]));
        }

        return min_heap.top().val;
    }
};
```


