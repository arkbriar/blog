---
title: "Linux IO 多路复用 —— Epoll"
date: 2018-04-16T19:51:21+08:00
draft: false
categories: ["Linux", "IO Multiplex", "Development"]
tags: ["epoll"]
toc: true
comments: true
---

Epoll 是 Linux 平台上独有的一组编程接口，用于监听多个文件描述符上的 IO 事件。Epoll 相对于 select/poll 的优势在于即使监听了大量的文件描述符，性能也非常好。Epoll API 支持两种监听方式：edge-triggered (EPOLLET) 和 level_triggered (default)。

<!--more-->

Edge-triggered 模式下，只有当文件描述符上产生事件时，才会被 epoll_wait 返回。例如，监听一个 socket，假如第一次 epoll_wait 返回了该 sock，可读取为 2 字节，但是只读取了 1 字节。那么下一次 epoll_wait 将不会返回该文件描述符了。换句话说，缓冲区中还有数据可读不是一个事件。

Level-triggered 不同，只要该 sock 还是可读的，将持续返回。

在使用 ET 模式时，必须使用非阻塞文件描述符，防止阻塞读/阻塞写将处理多个文件描述符的任务饿死。最好以以下模式调用 ET 模式的 epoll_wait 接口：

+ 使用**非阻塞的**文件描述符
+ 只有当 read/write 返回 EAGAIN 时挂起并等待；当 read/write 返回的数据长度小于请求的数据长度时，就可以确定缓冲中已经没有数据了，也就可以认为事件已经完成了。

### Epoll API

Linux 提供了以下几个函数，用于创建、管理和使用 epoll 实例：

+ `int epoll_create(int size);`、`int epoll_create1(int flags);`
+ `int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);`
+ `int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);`
+ `int epoll_pwait(int epfd, struct epoll_event *events, int maxevents, int timeout, const sigset_t *sigmask);`

#### epoll_create/epoll_create1

`epoll_create` 将创建一个 epoll 实例，并且返回一个代表该实例的文件描述符。在 `epoll_create1` 中，epoll 的大小限制被取消了。flags 可以为 EPOLL_CLOEXEC，即为新的文件描述符设置 close-on-exec (FD_CLOEXEC)，这个标志在文件描述符上表示当 execve 系统调用之后，新线程的文件描述符是否要被关闭。

#### epoll_ctl

epoll_ctl 用于控制 epoll 实例上的监听的文件描述符，其中 epfd 就是 epoll 文件描述符，op 是指可以做的操作 (operation)，一共有三种：

+ EPOLL_CTL_ADD
+ EPOLL_CTL_MOD
+ EPOLL_CTL_DEL

顾名思义，添加、修改和删除。

后面的就是对应的文件描述符和 fd，以及设置好的想要监听的事件集合，存放在 `struct epoll_event` 中：

```c
typedef union epoll_data {
   void        *ptr;
   int          fd;
   uint32_t     u32;
   uint64_t     u64;
} epoll_data_t;

struct epoll_event {
   uint32_t     events;      /* Epoll events */
   epoll_data_t data;        /* User data variable */
};
```

`struct epoll_event` 中的 events 是个位数组，表明当前监听的时间，列举几个比较重要的：

+ EPOLLIN/EPOLLOUT，文件可读/写
+ EPOLLRDHUP，关闭连接或者写入半连接
+ EPOLLERR，默认参数，文件描述符上发生错误
+ EPOLLHUP，默认参数，文件被挂断，在 socket/pipe 上代表本端关闭连接
+ EPOLLET，开启 edge-triggered，默认是 level-triggered
+ EPOLLONESHOT，一次触发后自动移除监听
+ EPOLLWAKEUP，如果EPOLLONESHOT和EPOLLET清除了，并且进程拥有CAP_BLOCK_SUSPEND权限，那么这个标志能够保证事件在挂起或者处理的时候，系统不会挂起或休眠

#### epoll_wait/epoll_pwait

`epoll_wait` 阻塞并等待文件描述上的事件，需要保证 events 数组的大小要比 maxevents 大。`epoll_wait` 将阻塞直到：

+ 一个文件描述符产生事件
+ 被信号打断
+ 超时 (timeout）

并返回当前事件的数量。

`epoll_pwait` 多设置一个 sigmask，代表不想被这些信号打断，其余的相当于 `epoll_wait`。

### 性能测试

对 poll/selelct 和 epoll 在监听不同数量文件描述符时的系统调用消耗对比，参考自参考文献表中的第一个网站。

```
# operations  |  poll  |  select   | epoll
10            |   0.61 |    0.73   | 0.41
100           |   2.9  |    3.0    | 0.42
1000          |  35    |   35      | 0.53
10000         | 990    |  930      | 0.66
```

### 参考文献

[1] https://jvns.ca/blog/2017/06/03/async-io-on-linux--select--poll--and-epoll/

[2] Linux Programmer's Manual: man epoll/epoll_create/epoll_ctl/epoll_wait

### 基于 epoll 的简易服务器

以下使用 C 语言实现了一个简单的服务器，支持同时最多 100 个连接，对每个新建的连接。将它加入 epoll 队列中。当 IO 事件到达时，处理对应的客户端的 IO 事件。

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <sys/epoll.h>

#define MAX_EVENTS 10
#define LISTEN_PORT 1234
#define BUF_LEN 512
#define MAX_CONN 100

struct epoll_event ev, events[MAX_EVENTS];
int listen_sock, conn_sock, nfds, epollfd;
struct sockaddr_in server;

#define log(...) printf(__VA_ARGS__)

void response_to_conn(int conn_sock) {
    char buf[BUF_LEN + 1];

    int read_len = 0;
    while ((read_len = read(conn_sock, buf, BUF_LEN)) > 0) {
        buf[read_len] = '\0';

        int cursor = 0;
        while (cursor < read_len) {
            // writing to a pipe or socket whose reading end is closed
            // will lead to a SIGPIPE
            int len = write(conn_sock, buf + cursor, read_len - cursor);
            if (len < 0) {
                perror("write");
                return;
            }
            cursor += len;
        }

        // there are no data so we do not have to do another read
        if (read_len < BUF_LEN) {
            break;
        }
    }
    
    // must make sure that the next read will block this non-blocking
    // socket, then we think the event is fully consumed.
    if (read_len < 0 && errno == EAGAIN) {
        return;
    }
    // end of file
    if (read_len == 0) {
        return;
    }
}

/* Code to set up listening socket, 'listen_sock' */
void listen_and_bind() {
    if ((listen_sock = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
        perror("socket");
        exit(EXIT_FAILURE);
    }
    int option = 1;
    setsockopt(listen_sock, SOL_SOCKET, SO_REUSEADDR, &option, sizeof(option));

    server.sin_family = AF_INET;
    server.sin_addr.s_addr = INADDR_ANY;
    server.sin_port = htons(LISTEN_PORT);
    if (bind(listen_sock, (struct sockaddr *)&server, sizeof(server)) == -1) {
        perror("bind");
        exit(EXIT_FAILURE);
    }

    listen(listen_sock, MAX_CONN);
}

void create_epoll() {
    epollfd = epoll_create1(0);
    if (epollfd == -1) {
        perror("epoll_create1");
        exit(EXIT_FAILURE);
    }

    ev.events = EPOLLIN;
    ev.data.fd = listen_sock;
    if (epoll_ctl(epollfd, EPOLL_CTL_ADD, listen_sock, &ev) == -1) {
        perror("epoll_ctl: listen_sock");
        exit(EXIT_FAILURE);
    }
}

void set_fd_nonblocking(int fd) {
    int flags = fcntl(fd, F_GETFL, 0);
    if (flags == -1) {
        perror("getfl");
        return;
    }
    if (fcntl(fd, F_SETFL, flags | O_NONBLOCK) < 0) {
        perror("setfl");
        return;
    }
}

void epoll_loop() {
    for (;;) {
        int nfds = epoll_wait(epollfd, events, MAX_EVENTS, -1);
        if (nfds == -1) {
            perror("epoll_wait");
            exit(EXIT_FAILURE);
        }

        log("get %d events from epoll_wait!\n", nfds);

        for (int n = 0; n < nfds; ++ n) {
            if (events[n].data.fd == listen_sock) {
                struct sockaddr_in local;
                socklen_t addrlen;
                conn_sock = accept(listen_sock, (struct sockaddr *) &local, &addrlen);
                if (conn_sock == -1) {
                    perror("accept");
                    exit(EXIT_FAILURE);
                }

                log("accept a new connection!\n");

                // set non-blocking
                set_fd_nonblocking(conn_sock);

                ev.events = EPOLLIN | EPOLLET | EPOLLRDHUP;
                ev.data.fd = conn_sock;
                if (epoll_ctl(epollfd, EPOLL_CTL_ADD, conn_sock, &ev) == -1) {
                    perror("epoll_ctl: conn_sock");
                    exit(EXIT_FAILURE);
                }
            } else {
                if (events[n].events & (EPOLLRDHUP | EPOLLERR)) {
                    log("detect a closed/broken connection!\n");
                    epoll_ctl(epollfd, EPOLL_CTL_DEL, events[n].data.fd, NULL);
                    close(events[n].data.fd);
                } else response_to_conn(events[n].data.fd);
            }
        }
    }
}

int main(int argc, char **argv) {
    log("listenning on port 1234!\n");
    listen_and_bind();

    log("creating epoll!\n");
    create_epoll();

    log("starting loop on epoll!\n");
    epoll_loop();

    return 0;
}
```








