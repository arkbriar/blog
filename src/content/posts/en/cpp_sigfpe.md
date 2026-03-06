---
title: "SIGFPE When Doing DivQ"
published: 2017-08-27T17:38:37+08:00
draft: false
category: "Programming"
tags: ["cpp", "x86-64", "assembly"]
---

This was my first encounter with a SIGFPE caused by something other than division by zero. Here's a note about it.

### Symptoms

When using the following function with a = 1e18, b = 1e18, m = 1e9 + 7, a SIGFPE is triggered.

```cpp
long mulmod(long a, long b, long m) {
    long res;
    asm("mulq %2; divq %3" : "=d"(res), "+a"(a) : "S"(b), "c"(m));
    return res;
}
```


### Cause

The root cause is that `divq S` divides the 128-bit value %rdx:%rax by S, storing the quotient in %rax and the remainder in %rdx. In the above case, a * b / m is too large to fit in 64 bits, so %rax overflows and triggers SIGFPE.

### Solution

Take the modulus before performing the modular multiplication.
