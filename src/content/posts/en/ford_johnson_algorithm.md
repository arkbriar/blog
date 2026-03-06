---
title: "Sorting Algorithm that Minimizes Comparisons (Ford-Johnson Algorithm)"
published: 2017-08-04T14:15:35+08:00
category: "Algorithm"
tags: ["sorting", "comparison-bound", "atcoder"]
draft: false
---

I happened to discover AtCoder, signed up to give it a try, and ended up stuck on the practice contest...

The problem itself is quite simple:


> There are N balls labeled with the first N uppercase letters. The balls have pairwise distinct weights.
You are allowed to ask at most Q queries. In each query, you can compare the weights of two balls (see Input/Output section for details).
Sort the balls in the ascending order of their weights.

> **Constraints**
(N,Q)=(26,1000), (26,100), or (5,7).

> **Partial Score**
There are three testsets. Each testset is worth 100 points.
In testset 1, N=26 and Q=1000.
In testset 2, N=26 and Q=100.
In testset 3, N=5 and Q=7.

Through comparison-based sorting, there are three test cases. The (26, 1000) case can be passed with any comparison sort, though it might TLE. The (26, 100) case can be passed with merge sort which has a worst-case of $O(nlgn)$. The only tricky one is (5, 7). For this case, merge sort has a worst case of 8 comparisons.

Like a fellow internet user, I tried using STL's sort to solve it, only to find it produced even more WAs.

You must be kidding!


## Ford-Johnson

In desperation I turned to Google, and sure enough found an algorithm called the Ford-Johnson Algorithm. It was proposed in 1959 and is an algorithm that optimizes the number of comparisons in comparison-based sorting. In fact, for a considerable period after its proposal, it was believed to be the lower bound on the number of comparisons.

Even though it was later shown that further optimization is possible, the Ford-Johnson algorithm remains extremely close to the actual lower bound.

In Knuth's *The Art of Computer Programming*, Volume 3, this algorithm is also called merge-insertion sort.

### Algorithm Steps

Suppose we have n elements to sort. The algorithm consists of three steps:

1. Divide the elements into $\lfloor n/2 \rfloor$ pairs and compare each pair. If n is odd, the last element is left unpaired.

2. Recursively sort the larger element from each pair. Now we have a sorted sequence consisting of the larger values from each pair, called the main chain. Suppose the main chain is $a_1, a_2, ... a_{\lfloor n/2 \rfloor}$, and the remaining elements are $b_1, b_2, ..., b_{\lceil n/2\rceil}$, where $b_i \le a_i$ holds for $i = 1, 2, ..., \lfloor n/2 \rfloor$.
3. Now we insert $b_1, ..., b_{\lceil n/2 \rceil}$ into the main chain. First is $b_1$ -- we know it comes before $a_1$, so the main chain becomes $\{b_1, a_1, a_2, ... a_{\lfloor n/2 \rfloor}\}$. Then consider inserting $b_3$, which only needs to be compared against three elements $\{b_1, a_1, a_2\}$. Suppose the first three elements become $\{b_1, a_1, b_3\}$; then inserting $b_2$ also requires searching among only these three elements. As you can see, no matter where $b_3$ is inserted, the search range is always at most 3. The next element to insert, $b_k$, corresponds to the next [Jacobsthal number](https://en.wikipedia.org/wiki/Jacobsthal_number). That is, we first insert $b_3$, then $b_5, b_{11}, b_{21} ...$. To summarize, the insertion order is $b_1, b_3, b_2, b_5, b_4, b_{11}, b_{10}, ..., b_6, b_{21}, ...$

### Performance

The Ford-Johnson algorithm requires special data structures to implement. Its running speed is not particularly fast -- it just performs fewer comparisons. In practice, merge sort and quick sort are still faster.

### The (5, 7) Problem

Suppose the elements are A, B, C, D, E.

1. Compare (A, B) and (C, D). Without loss of generality, assume A > B and C > D.
2. Compare (A, C). Without loss of generality, assume A > C.
3. Insert E into (D, C, A) -- this can be done in two comparisons.
4. Insert B into the sorted {E, C, D} (since B < A, we don't need to consider comparing with A) -- this can be done in two comparisons.

In step 3, E is inserted first because if we inserted B into (D, C) first, it would take at most two comparisons, but then inserting E into {D, C, B, A} would take at most three comparisons.

## References

[1] Bui, T. D., and Mai Thanh. "Significant improvements to the Ford-Johnson algorithm for sorting." BIT Numerical Mathematics 25.1 (1985): 70-75.

[2] https://codereview.stackexchange.com/questions/116367/ford-johnson-merge-insertion-sort

## Appendix

### Interactive Sorter in C++

```cpp
#include <iostream>
#include <algorithm>
#include <vector>
using namespace std;

bool less_than(char a, char b) {
    cout << "? " << a << " " << b << endl;
    cout.flush();
    char ans;
    cin >> ans;
    if (ans == '<') return true;
    return false;
}

void ford_johnson(string &s, int n) {
    // assert(n == 5)
    // ugly but work
    if (!less_than(s[0], s[1])) {
        swap(s[0], s[1]);
    }

    if (!less_than(s[2], s[3])) {
        swap(s[2], s[3]);
    }

    if (!less_than(s[1], s[3])) {
        swap(s[0], s[2]);
        swap(s[1], s[3]);
    }

    // now we have s[0] < s[1], s[2] < s[3], s[1] < s[3]
    vector<char> cs = {s[0], s[1], s[3]};

    // insertion will be completed in two comparations
    auto insert_into_first_three = [&](char c) {
        if (less_than(c, cs[1])) {
            if (less_than(c, cs[0])) cs.insert(cs.begin(), c);
            else cs.insert(cs.begin() + 1, c);
        } else {
            if (less_than(c, cs[2])) cs.insert(cs.begin() + 2, c);
            else cs.insert(cs.begin() + 3, c);
        }
    };

    insert_into_first_three(s[4]);
    // always sorted {s[0], s[1], s[4]} < s[3] or s[0] < s[1] < s[3] < s[4]
    // so the first three elements are enough
    insert_into_first_three(s[2]);

    s = string(cs.begin(), cs.end());
}

// at most 99 comparations for n = 26
void merge_sort(string &s, int n) {
    if (n == 1) return;
    else if (n == 2) {
        if (!less_than(s[0], s[1])) swap(s[0], s[1]);
        return;
    }

    auto left_half = s.substr(0, n / 2),
        right_half = s.substr(n / 2);

    merge_sort(left_half, n / 2);
    merge_sort(right_half, n - n / 2);

    // merge, at most n - 1 comparations
    int i = 0, j = 0, k = 0;
    while (k < n) {
        if (i >= n / 2) s[k++] = right_half[j++];
        if (j >= n - n / 2) s[k++] = left_half[i++];
        else if (less_than(left_half[i], right_half[j])) s[k++] = left_half[i++];
        else s[k++] = right_half[j++];
    }
}

int main() {
    int n, q;
    cin >> n >> q;

    string s;
    for (int i = 0; i < n; ++i) {
        s += 'A' + i;
    }

    if (n == 5) ford_johnson(s, n);
    else merge_sort(s, n);

    cout << "! " << s << endl;

    return 0;
}
```
