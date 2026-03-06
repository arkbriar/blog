---
title: "Sliding Window Maximum / Monotonic Queue"
tags: ["sliding-window", "monotonic-queue", "leetcode"]
category: "Algorithm"
published: 2017-08-03T15:55:02+08:00
draft: false
---

There is a problem on Leetcode called Sliding Window Maximum. Although I didn't solve it today, the solution is very interesting, so I'm recording it here.

Problem description:

> Given an array nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position.

> For example, Given nums = [1,3,-1,-3,5,3,6,7], and k = 3.

> Therefore, return the max sliding window as [3,3,5,5,6,7].

This problem can be solved using a priority queue, self-balancing BST, or similar methods to get an O(nlgn) solution, but there is actually an O(n) solution based on maintaining a monotonic queue during the process.


### Monotonic Queue

We use a double-ended queue to implement this monotonic queue, ensuring that all numbers in the queue are monotonically non-increasing, and the maximum value in a window is always at the front of the queue.

Suppose we have a queue Q satisfying the above condition. When a number a enters the window and a number b slides out of the window, the queue operations are:

1. If the queue is not empty and the front of the queue equals b, remove it!
2. If the queue is not empty and the back of the queue is less than a, remove it!
3. Repeat **step 2** until the queue is empty or the back of the queue is not less than a
4. Add a to the back of the queue

Clearly, in **step 2**, the numbers removed are **numbers that cannot possibly be the maximum**, so after the operations, the maximum value in the window is still in the queue, and the queue remains monotonically non-increasing.

The maximum value is then the front of the queue.

Since each number enters the queue once and exits once, the time cost is O(n).

### Appendix

#### C++ Implementation

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
