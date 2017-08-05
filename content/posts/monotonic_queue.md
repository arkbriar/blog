---
title: "Sliding Window Maximum / Monotonic Queue"
tags: ["algorithm", "leetcode"]
categories: ["Development", "Algorithm"]
date: 2017-08-03T15:55:02+08:00
toc: true
comments: true
draft: false
---

Leetcode 上有一道题叫 Sliding Window Maximum，虽然不是今天刷的，但是解法非常有意思，就记录一下。

问题描述：

> Given an array nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position.

> For example, Given nums = [1,3,-1,-3,5,3,6,7], and k = 3.

> Therefore, return the max sliding window as [3,3,5,5,6,7].

这道题可以用优先队列、自平衡BST等方法得到一个 O(nlgn) 的解法，但其实这道题有另一种 O(n) 的解法，基本思想是在过程中维持一个单调队列。

### Monotonic Queue

我们用双端队列来实现这个单调队列，保证这个队列中所有数单调非增，同时一个窗口中的最大的数就在队列的开端。

假设我们现在有一个队列 Q 满足上述条件，当一个数 a 进入窗口时，此时数 b 滑出窗口，队列操作步骤：

1. 如果队列不为空并且队列开端等于 b，remove it! 
2. 如果队列不为空并且队列尾端小于 a，remove it！
3. 循环 **步骤2** 直到队列为空或者队列尾端不小于 a
4. 将 a 加到队列尾端

显然，在 **步骤2** 中，删除的数都是**不可能为最大值的数**，所以在操作结束后，窗口内最大值仍然在队列中，并且队列保持单调非增。

此时最大值即为队列开端。

因为每个数只进队一次，并出队一次，所以时间开销为 O(n)。

### Appendix

#### C++ 实现

```cpp
vector<int> maxSlidingWindow(vector<int> &nums, int k) {
    vector<int> res;
    // tracking index instead of value
    deque<int> dq;
    
    for (int i = 0; i < nums.size(); ++ i) {
        // dequeue (i - k)th element if exists
        if (!dq.empty() && dq.front() == i - k) dq.pop_front();
        // remove those less than current
        while (!dq.empty() && nums[dq.back()] < nums[i]) dq.pop_back();
        // enqueue current
        dq.push_back(i);
        
        if (i >= k - 1) res.push_back(nums[dq.front()]);
    }
    
    return res;
}
```
