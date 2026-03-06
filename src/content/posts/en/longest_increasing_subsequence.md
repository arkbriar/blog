---
title: "Longest Increasing Subsequence"
published: 2017-09-01T15:41:22+08:00
draft: false
category: "Algorithm"
tags: ["dynamic-programming", "binary-search"]
---

The Longest Increasing Subsequence algorithm -- I thought I had memorized the fastest algorithm, but my memory is too poor. Today I encountered a problem and forgot how to do it again.

Three approaches: DP, Sort + LCS, DP + BS. I only remembered the first one, DP...

And while we're at it, let's solve a certain problem too.


### Algorithms for LIS

#### DP

Obviously, the length of the longest increasing subsequence ending at the i-th element is max{dp[j] + 1}, j < i && arr[j] < arr[i]. So the DP has O(n) space complexity and O(n^2) time complexity.

```cpp
int LIS(vector<int> nums) {
    int n = nums.size();
    int dp[n];
    int res = 0;
    for (int i = 0; i < n; ++ i) {
        dp[n] = 1;
        for (int j = 0; j < i; ++ j) {
            if (nums[j] < nums[i])
                dp[i] = max(dp[i], dp[j] + 1);
        }
        res = max(res, dp[i]);
    }
    return res;
}
```

#### Sort + LCS

An increasing subsequence of the original array must be a common subsequence of the **sorted** array and the original array. So we just sort and find the longest common subsequence.

Space complexity O(n^2), time complexity O(n^2).

```cpp
int LCS(vector<int> a, vector<int> b) {
    assert(a.size() == b.size());

    int n = a.size();
    int dp[n + 1][n + 1];
    for (int i = 0; i < n; ++ i) {
        for (int j = 0; j < n; ++ j) {
            if (i == 0 || j == 0)
                dp[i][j] = 0;
            else if (a[i - 1] == b[j - 1])
                dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[n][n];
}

int LIS(vector<int> nums) {
    auto sorted = nums;
    sort(sorted.begin(), sorted.end());
    return LCS(nums, sorted);
}
```

#### DP + BS

This is the fastest algorithm, and also the one I still haven't memorized. The key idea is to maintain an array where the l-th entry (1-based) stores the smallest possible last element of an increasing subsequence of length l. We continuously maintain this array until the end, and the effective length of the array is the LIS result.

Since the l-th entry stores the smallest possible last element of an increasing subsequence of length l, this array is guaranteed to be sorted in increasing order. When the next number n needs to become the end of some increasing subsequence, we search the array for the first element that is not less than n. Suppose the position is l. Then we know we can build an increasing subsequence of length at most l ending with n (think about why -- it's straightforward). At this point, we update the array value at position l to n. A special case is when position l doesn't exist in the array, in which case we append n to the end.

Binary search can be used here, giving O(n) space complexity and O(nlgn) time complexity.

```cpp
int LIS(vector<int> nums) {
    vector<int> dp;
    for (auto n : nums) {
        auto it = lower_bound(dp.begin(), dp.end(), n);
        if (it == dp.end()) dp.push_back(n);
        else *it = n;
    }
    return dp.size();
}
```

Actually, I realized... I don't even need to hand-write BS. The STL handles a lot of things. Apart from not having a Fibonacci Heap, it seems like there aren't many downsides (laughs).

### AtCoder Grand Contest 019C

Problem:

> In the city of Nevermore, there are 10e8 streets and 10e8 avenues, both numbered from 0 to 10e8 - 1. All streets run straight from west to east, and all avenues run straight from south to north. The distance between neighboring streets and between neighboring avenues is exactly 100 meters.
Every street intersects every avenue. Every intersection can be described by pair (x,y), where x is avenue ID and y is street ID.


> There are N fountains in the city, situated at intersections (Xi,Yi). Unlike normal intersections, there's a circle with radius 10 meters centered at the intersection, and there are no road parts inside this circle.
The picture below shows an example of how a part of the city with roads and fountains may look like.

![city](/img/posts/1f931bf0c98ec6f07e612b0282cdb094.png)

Constraints:

> + 0<=x1,y1,x2,y2<10e8
+ 1<=N<=200,000
+ 0<=Xi,Yi<10e8
+ Xi!=Xj for i!=j
+ Yi!=Yj for i!=j
+ Intersections (x1,y1) and (x2,y2) are different and don't contain fountains.
+ All input values are integers.


Input:

> x1 y1 x2 y2
N
X1 Y1
X2 Y2
:
XN YN

Output:

> Print the shortest possible distance one needs to cover in order to get from intersection (x1,y1) to intersection (x2,y2), in meters. Your answer will be considered correct if its absolute or relative error doesn't exceed 10e-11.


Samples:

> I: 1 1 6 5
3
3 2
5 3
2 4

> O: 891.415926535897938

<br/>


> I: 3 5 6 4
3
3 2
5 3
2 4

> O: 400.000000000000000

<br/>

> I: 4 2 2 2
3
3 2
5 3
2 4

> O: 211.415926535897938


OK, given two points on a grid, the path without considering fountains is fixed, with length abs(x1 - x2) + abs(y1 - y2).

By symmetry, we may assume x1 <= x2, y1 <= y2. When fountains are considered, turning at a fountain saves some distance, while going straight through a fountain costs extra distance.

Suppose our strategy is to detour to maximize turns or to avoid going straight through fountains, i.e., going outside the rectangle formed by {(x1, y1), (x2, y2)}. Since each row and column has at most one fountain, going one cell further from the rectangle adds 200m of extra distance, while the maximum savings is about (2 * r - pi * r / 2) approximately 4.5m, or avoiding the extra cost of (pi * r - 2 * r) approximately 11.4m. So this is clearly not worthwhile.

Therefore, the path must stay inside the rectangle {(x1, y1), (x2, y2)}, maximizing the number of turns.

Clearly, on the path from (x1, y1) to (x2, y2), there are at most c = min(x2 - x1, y2 - y1) turns and at most c + 1 fountains.

If the fountains are sorted by their x-coordinate, the maximum number of fountains we can pass through equals the length of the longest increasing subsequence of the fountains' y-values. Let this length be k.

There are two cases:

1. k <= c: then there exists a path that turns at every fountain in this subsequence
2. k == c + 1: then one fountain must be passed through straight, so the path makes c turns and passes through the remaining one

So the key is computing the longest increasing subsequence. Here's the code:

```cpp
#include <bits/stdc++.h>

using namespace std;

pair<long long, long long> p[200000];

const double PI = 3.14159265358979323846;
const double R = 10.0;
const double quarter_circle = PI * R / 2;
const double edge = 100.0;

using PLL = pair<long long, long long>;
int dp[200000];

int main() {
    long long x1, y1, x2, y2;
    scanf("%lld %lld %lld %lld", &x1, &y1, &x2, &y2);

    if (x1 > x2) {
        swap(x1, x2);
        swap(y1, y2);
    }

    long long y_min = min(y1, y2), y_max = max(y1, y2);

    // drop those not used
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n;) {
        scanf("%lld %lld", &p[i].first, &p[i].second);
        if (p[i].first < x1 || p[i].first > x2 || p[i].second < y_min || p[i].second > y_max) {
            n--;
        } else {
            ++i;
        }
    }

    // x1 <= x2
    double res = edge * (x2 - x1 + y_max - y_min);
    sort(p, p + n, [&](const PLL& a, const PLL& b) { return a.first < b.first; });
    if (y1 > y2) {
        for (int i = 0; i < n; ++i) {
            p[i].second = -p[i].second;
        }
    }

    int len = 0;
    for (int i = 0; i < n; ++i) {
        auto it = lower_bound(dp, dp + len, p[i].second);
        *it = p[i].second;
        if (it == dp + len) {
            len ++;
        }
    }

    int max_corner = min(x2 - x1, y_max - y_min);

    if (len < max_corner + 1)
        res += len * (quarter_circle - 2 * R);
    else
        res += max_corner * (quarter_circle - 2 * R) + (2 * quarter_circle - 2 * R);

    printf("%.15f\n", res);

    return 0;
}
```

### Summary

Skip one day of problem grinding and you'll forget the algorithms. Also, AtCoder problems really are hard...




