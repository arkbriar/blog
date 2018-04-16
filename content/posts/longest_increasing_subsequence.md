---
title: "最长递增子序列 (Longest Increasing Subsequence)"
date: 2017-09-01T15:41:22+08:00
draft: false
categories: ["Algorithm", "Development"]
tags: ["algorightm", "LIS"]
toc: true
comments: true
---

最长递增子序列算法，原本以为已经记住了最快的算法，看来是记性太差，今天碰到一道题目又忘记了怎么做 🙄

三种做法：DP，Sort + LCS，DP + BS，我只记得第一种DP了 ...

然后咱们顺便把某道题目做了 🤣

<!--more-->

### Algorithms for LIS

#### DP

很显然，以第i个元素为结尾的最长递增子序列的长度是 max{dp[j] + 1}, j <  i && arr[j] < arr[i]，所以DP空间复杂度 O(n)，时间复杂度 O(n^2)。

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

原数组的递增子序列一定是**排序后**数组和原来数组的公共子序列，所以排完序找最长公共子序列就行了。

空间复杂度 O(n^2)，时间复杂度 O(n^2)。

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

这是最快的一个算法，也是我到现在都还没记住的算法 🙄，关键思想为维护一个数组，数组中第l项(1-based) 为长度为l的递增子序列的最大(最后)元素的最小值，然后不断维护这个数组直到结束，最终数组的有效长度即为LIS的结果。

由于第l项为长度为l的递增子序列的最大元素的最小值，所以该数组一定为一个递增数组。当下一个数n需要能够成为某个递增子序列的结尾时，我们在该数组中查找第一个不比n小的数，假设位置为l，那么我们就知道我们能以n结尾构建一个最长为l的递增子序列 (想想为什么？很简单)，此时我们就将l位置的数组值更新为n。有一个特殊情况即数组中不存在位置l，那么就在数组最后添加n。

这里查找可以使用二分查找的方式，从而空间复杂度为 O(n)，时间复杂度为 O(nlgn)。

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

其实我发现...，我都不用手写BS，STL还是解决了很多问题的，除了没有Fibonacci Heap之外感觉好像也没啥缺点了 (笑

### AtCoder Grand Contest 019C

题目：

> In the city of Nevermore, there are 10e8 streets and 10e8 avenues, both numbered from 0 to 10e8 − 1. All streets run straight from west to east, and all avenues run straight from south to north. The distance between neighboring streets and between neighboring avenues is exactly 100 meters.
Every street intersects every avenue. Every intersection can be described by pair (x,y), where x is avenue ID and y is street ID.


> There are N fountains in the city, situated at intersections (Xi,Yi). Unlike normal intersections, there's a circle with radius 10 meters centered at the intersection, and there are no road parts inside this circle.
The picture below shows an example of how a part of the city with roads and fountains may look like.

![city](/img/posts/1f931bf0c98ec6f07e612b0282cdb094.png)

约束:

> + 0≤x1,y1,x2,y2<10e8
+ 1≤N≤200,000
+ 0≤Xi,Yi<10e8
+ Xi≠Xj for i≠j
+ Yi≠Yj for i≠j
+ Intersections (x1,y1) and (x2,y2) are different and don't contain fountains.
+ All input values are integers.


输入:

> x1 y1 x2 y2
N
X1 Y1
X2 Y2
:
XN YN

输出:

> Print the shortest possible distance one needs to cover in order to get from intersection (x1,y1) to intersection (x2,y2), in meters. Your answer will be considered correct if its absolute or relative error doesn't exceed 10e−11.


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


Ok，一个网格给定两个点，那么不考虑喷泉的走法是固定的，长度为 abs(x1 - x2) + abs(y1 - y2)。

由对称性，我们不妨设 x1 <= x2, y1 <= y2，考虑喷泉的情况下，从喷泉处转角能够少走一些路，而直走经过喷泉会多走一些路。

假设我们的走法是绕远路贪转角少走，或是避免直走，即走出{(x1, y1), (x2, y2)}所构成的矩形的情况，由于每行每列仅有一个喷泉，所以多远离矩形一格会导致多走200m，而最多只能少走 (2 * r - pi * r / 2) 大约为4.5m的距离，或者少走(pi * r - 2 * r) 大约为 11.4m 的距离，所以显然是不可能的。

所以走法一定是在{(x1, y1), (x2, y2)}矩形内部，贪最多的转角。

显然，在 (x1, y1) 到 (x2, y2) 的路程中，最多只有 c = min(x2 - x1, y2 - y1) 次转角，最多有 c + 1 个喷泉。

假设喷泉是按照x的大小进行排列的，那么我们能过的最多的温泉等于温泉y值数组的最长递增子序列，假设长度为k。

那么有两种情况，

1. k <= c, 那么就一定有一种走法，使得我们经过这个子序列中每个温泉的时候都是转角
2. k == c + 1，那么一定存在一个喷泉需要经过，所以走法是走c个角，并经过剩余的一个。

所以关键即求最长递增子序列，放代码

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

### 总结

一天不刷题就会忘记算法，还有 atcoder 的题还真是难...





