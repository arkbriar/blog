---
title: "Longest Palindromic Substring -- Manacher's Algorithm"
published: 2018-04-13T01:50:51+08:00
draft: false
category: "Algorithm"
tags: ["string", "palindrome"]
---

Emm, I actually planned to write this post back in September 2017, but only now am I finally getting to it. If I don't write it soon, I'll forget everything...

Palindromic strings are celebrities in the world of string algorithms, always coming with all sorts of tricky problems. Take, for example, the Longest Palindromic Substring problem. The obvious algorithm has a complexity of $O(n^2)$, while Manacher's Algorithm can give the answer in $O(n)$ time.


Let's use a simple but good example to explain this algorithm: "abababa", whose longest palindromic substring is itself.

### The Simple Algorithm

The simple algorithm enumerates palindrome centers. For a string of length n, there are 2n + 1 palindrome centers, and computing the palindrome length for each center takes $O(n)$, giving a total of $O(n^2)$.

### Manacher's Algorithm

Manacher's Algorithm leverages previously computed maximum palindrome lengths to speed up subsequent computations.

First, we mark all palindrome centers as shown below:

![](/img/15235560287436.jpg)

For each palindrome center, we label them from 0 to 2n, totaling 2n + 1 centers. Even-numbered ones are centers of even-length palindromes, and odd-numbered ones are centers of odd-length palindromes. We use an array LPS to record the known longest palindrome lengths.

Clearly, LPS[0] is always 0, and LPS[1] is always 1. Assume we compute LPS from left to right, and the current position is the red-marked 7, with LPS[7] = 7.

**An important observation here is that 7 is the center with the farthest right boundary among all i <= 7, meaning it has the largest i + LPS[i]. Note that i + LPS[i] is always even.**

Why must it be this one? We will explain in detail later.

Now we want to compute LPS[8]. Since 8 mirrors to 6 with respect to center 7, and the maximum palindrome at 6 is 0, within the visible range [i - LPS[i], i + LPS[i]] = [0, 14], the palindrome at 6, [6 - LPS[6], 6 + LPS[6]] = [6, 6], mirrors to [8, 8] at position 8. **It lies entirely within (0, 14) without touching the boundary.**

By the symmetry of palindromes with respect to the palindrome center, LPS[8] = 0.

But what if the mirrored palindrome touches or exceeds the boundary? The known length can only be min(i + LPS[i] - cur, LPS[2 * i - cur]), i.e., the minimum of the mirrored LPS value and the remaining range to the right. In this case, we are adjacent to some unknown characters, and we should **scan the unknown characters to the right, matching them one by one with the left side** to accurately determine LPS[cur]. At this point, the right boundary has expanded, and we can update i to cur.

The above text may be a bit convoluted, but there is a ready example: when i = 5, cur = 7, the mirror is 3, and LPS[3] = 3 = i + LPS[i] - cur, meaning it reaches the right boundary exactly. So we scan to the right, expanding the right boundary to 14, and update i = 7.

Repeating the above process gives us all LPS[i] values. Return the maximum one.

#### Complexity

Computing LPS falls into two cases: direct computation, or computing an initial value followed by expanding the right boundary.

The right boundary can expand at most to 2 * n, so it is O(n). Assignment occurs 2 * n + 1 times, which is also O(n).

Therefore, the total time complexity is O(n).

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

            // set initial lps[i]
            lps[i] = min(lps[li], to_r);

            /* if (lps[li] >= to_r) { */

            // expand if we can
            // i + lps[i] < N - 1 && i - lps[i] > 0 so that there are spaces for expand
            while (
                i + lps[i] < N - 1 && i - lps[i] > 0 &&
                ((i + lps[i] + 1) % 2 == 0 || s[(i - lps[i] - 1) / 2] == s[(i + lps[i] + 1) / 2])) {
                lps[i]++;
            }

            if (i + lps[i] > r) {
                c = i;
            }

            /* } */

            // record result
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
