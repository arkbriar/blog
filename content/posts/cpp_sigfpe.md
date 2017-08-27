---
title: "SIGFPE When Doing DivQ"
date: 2017-08-27T17:38:37+08:00
draft: false
categories: ["Development", "Assembly"]
tags: ["assembly", "intel x86_64"]
toc: true
comments: true
---

第一次遇到了除0以外的SIGFPE，记录一下。

### 症状

在使用以下函数的时候，假定 a = 1e18, b = 1e18, m = 1e9 + 7 就会触发 SIGFPE。

```cpp
long mulmod(long a, long b, long m) {
    long res;
    asm("mulq %2; divq %3" : "=d"(res), "+a"(a) : "S"(b), "c"(m));
    return res;
}
```

### 原因

主要是由于 divq S 的执行逻辑是用 128bit 的 %rdx:%rax 除以 S，将商存入 %rax, 余数存入 %rdx，而上面的情况 a * b / m 太大，超过了 64bit，所以 %rax 存不下就触发了 SIGFPE。

### 解决方案

先模再模乘。
