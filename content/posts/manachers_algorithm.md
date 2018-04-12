---
title: "Longest Palindromic Substring -- Manacher's Algorithm"
date: 2018-04-13T01:50:51+08:00
draft: false
categories: ["Development", "Algorithm"]
tags: ["algorithm", "longest palindromic substring"]
toc: true
comments: true
---

Emm，这篇其实在 2017 年 9 月就打算写了，到现在才填上，再不填又要忘记了...

字符串界的明星回文串，总是有各种稀奇古怪难搞的题目，比如说这道最长回文子串 (Longest Palindromic Substring)，显而易见的算法复杂度是 `$O(n^2)$`，而这个 Manacher's Algorithm 则可以在 `$O(n)$` 的时间给出答案。

<!--more-->

我们用一个简单但是不错的例子来解释这个算法: "abababa"，它的最长回文子串就是自己。

### 简单的算法

简单的算法就是枚举回文核，对于一个长度为 n 的字符串，一共有 2n + 1 个回文核，每个回文核计算回文长度的复杂度为 `$O(n)$`，所以总计为 `$O(n^2)$`。

### Manacher's Algorithm

Manacher's Algorithm 利用了之前已经计算过的最大回文长度，来加速后面的计算。

首先依旧是标明所有回文核，如下图所示：

![](/img/15235560287436.jpg)

对于每个回文核，我们标号从 0 - 2n，一共 2n + 1 个。偶数号的为偶数长度的回文的核，奇数号的为奇数长度的回文的核。我们使用一个数组 LPS 来记录已经知道的最长回文长度。

毫无疑问，LPS[0] 一定是 0，LPS[1] 一定是 1。假设我们从左往右计算 LPS，当前为标红的 7 号，LPS[7] = 7。

**这里有一个很重要的事情，那就是 7 是 i <= 7 中，i + LPS[i] 最大的，也就是右边界最远的那个。i + LPS[i] 一定是偶数。**

为什么一定要它呢，我们之后会详细讲。

我们现在要计算 LPS[8] 了，因为 8 关于 7 对称为 6，而 6 上的最大回文串为 0，所以其实在可见范围 [i - LPS[i], i + LPS[i]] = [0, 14] 内，6 上的回文串 [6 - LPS[6], 6 + LPS[6]] = [6, 6] 在 8 上的对称为 [8, 8]，**它整个在 (0, 14) 内，不接触边界**。

由回文串对回文核的对称性，LPS[8] = 0。

但是如果对称到的回文串接触边界或者超出边界？我们已知的长度只能是 min(i + LPS[i] - cur, LPS[2 * i - cur]), 也就是对称那边的 LPS 和右边剩余范围这两个的最小值。那么我们就邻近了一些未知的字符，此时就应该 **向右扫描未知的字符，并逐个和左边匹配**，来准确得到 LPS[cur]。此时右边界扩展了，我们可以更新 i 到 cur。

上述文字可能有点绕，但是也有现成的例子，比如 i = 5, cur = 7 时，对称过去是 3，LPS[3] = 3 = i + LPS[i] - cur，也就是接着右边界了，所以就向右扫描，把右边界扩展到 14，同时更新 i = 7。

重复上述过程，就可以获得所有 LPS[i]，返回其中最大的即可。

#### 复杂度

LPS 的计算，分为两种情况，一是直接计算，而是计算初始值后扩展右边界。

右边界最多扩展到 2 * n，所以是 O(n) 的，而赋值一共 2 * n + 1 次，所以也是 O(n) 的。

所以总计时间复杂度为 O(n)。

### Cpp

```cpp
class Solution {
public:
    string longestPalindrome(string s) {
        if (s.empty()) return "";
        int n = s.size();
        int res = 1, resi = 1;
        int N = n * 2 + 1;

        vector<int> lps(N);
        lps[1] = 1;

        int c = 1;
        for (int i = 2; i < N; ++i) {
            int li = 2 * c - i, r = c + lps[c];
            int to_r = r - i;
            if (lps[li] < to_r)
                lps[i] = lps[li];
            else {
                lps[i] = min(lps[li], to_r);
                // expand if we can
                // i + lps[i] < N - 1 && i - lps[i] > 0 so that there are spaces for expand
                while (i + lps[i] < N - 1 && i - lps[i] > 0 &&
                       ((i + lps[i] + 1) % 2 == 0 ||
                        s[(i - lps[i] - 1) / 2] == s[(i + lps[i] + 1) / 2])) {
                    lps[i]++;
                }

                if (i + lps[i] > r) {
                    c = i;
                }
            }

            if (lps[i] > res) {
                res = lps[i];
                resi = i;
            }
        }

        return s.substr((resi - res) / 2, res);
    }
};
```
### Reference

[1] http://articles.leetcode.com/longest-palindromic-substring-part-ii

[2] https://www.felix021.com/blog/read.php?entryid=2040

[3] https://www.geeksforgeeks.org/manachers-algorithm-linear-time-longest-palindromic-substring-part-1/


