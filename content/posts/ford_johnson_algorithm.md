---
title: "Ford Johnson Algorithm"
date: 2017-08-04T14:15:35+08:00
categories: ["Development", "Algorithm"]
tags: ["algorithm", "atcoder", "sort"]
toc: true
comments: true
draft: false
---

偶然发现 AtCoder，上去注册了准备试试，结果卡在practice contest...

问题倒是很简单：


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

通过比较排序，一共三种数据，其中 (26, 1000) 的情况用任何比较都能过，但是可能会 TLE，(26, 100) 的用 worst-case `$O(nlgn)$` 的 merge sort 能过，唯一难受的是 (5, 7)。这个样例 merge sort 的 worst case 是比较8次。

我和某网友一样，尝试用 STL 的 sort 来解决，结果发现 WA 了更多 🙄 

You must be kidding!

## Ford-Johnson

绝望之下只能求助 google，果然找到了一个算法叫 Ford-Johnson Algorithm，是 1959 年被提出来的，是针对比较排序中比较数进行最优化的算法，事实上在提出后的相当长一段时间被认为是比较数的 lower bound。

即便后来被证明能够进一步优化，Ford-Johnson 算法距离事实 lower bound 也极其接近。

在 Knuth 老爷子的 《 *The Art of Computer Programming* 》第三卷中，该算法也被称为 merge-insertion sort。

### 算法流程

假设我们有n个元素需要排序，算法总共分为三步：

1. 将元素分为 `$\lfloor n/2 \rfloor$` 对，并两两进行比较，如果 n 是奇数，最后一个元素不进行配对

2. 递归地排序每对中大的那一个。现在我们有一个由每对中较大值组成的排过序的序列，叫做 main chain。假设 main chain 是 `$a_1, a_2, ... a_{\lfloor n/2 \rfloor}$` ，剩余的元素假设他们是 `$b_1, b_2, ..., b_{\lceil n/2\rceil}$`，并且有 `$b_i \le a_i$` 对 `$i = 1, 2, ..., \lfloor n/2 \rfloor$` 成立。
3. 现在我们将 `$b_1, ..., b_{\lceil n/2 \rceil}$` 插入 main chain 中，首先是 `$b_1$`，我们知道他在 `$a_1$` 前面，所以 main chain 变为 `$\{b_1, a_1, a_2, ... a_{\lfloor n/2 \rfloor}\}$`，然后考虑插入 `$b_3$`，仅需要比较三个数 `$\{b_1, a_1, a_2\}$`；假设前三个元素变为 `$\{b_1, a_1, b_3\}$`，那么插入 `$b_2$` 也是在这三个数内；可以看到，不论 `$b_3$` 被插入到那里了，要插入的范围总是最多为3。下一个要插入的数 `$b_k$` 对应于下一个[Jacobsthal Number](https://en.wikipedia.org/wiki/Jacobsthal_number)，即我们先插入 `$b_3$`，然后插入 `$b_5, b_{11}, b_{21} ...$`，总结一下插入顺序为 `$b_1, b_3, b_2, b_5, b_4, b_{11}, b_{10}, ..., b_6, b_{21}, ...$`

### 性能

Ford-Johnson 算法需要特殊的数据结构来实现，运行速度并不算快，只是能够更少地进行比较，在实际使用中还是 merge sort 和 quick sort 来得更快一点。

### 问题 (5, 7)

假设元素 A, B, C, D, E

1. 比较 (A, B) 和 (C, D)，不失一般性，我们假设 A > B，C > D
2. 比较 (A, C)，不失一般性，假设 A > C
3. 将 E 插入 (D, C, A)，两次比较内完成
4. 将 B 插入排序后的{E, C, D} 中 (因为 B < A，所以不需要考虑 A 的比较)，两次比较内完成

这里第三步先插入 E，是因为如果先插入 B 到 (D, C)，最多需要两次比较，而插入 E 到 {D, C, B, A} 最多要三次比较。

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
