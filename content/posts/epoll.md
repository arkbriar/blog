---
title: "Epoll"
date: 2018-04-16T19:51:21+08:00
draft: false
categories: ["Linux", "IO Multiplex", "Development"]
tags: ["epoll"]
toc: true
comments: true
---

Epoll 是 Linux 平台上独有的一组编程接口，用于监听多个文件描述符上的 IO 事件。Epoll 相对于 select/poll 的优势在于即使监听了大量的文件描述符，性能也非常好。Epoll API 支持两种监听方式：edge-triggered (EPOLLET) 和 level_triggered (default)。

<!--more-->

### Epoll API

Linux 提供了以下几个函数，用于创建、管理和使用 epoll 实例：

+ `int epoll_create(int size);`、`int epoll_create1(int flags);`
+ `int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);`
+ `int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);`
+ `int epoll_pwait(int epfd, struct epoll_event *events, int maxevents, int timeout, const sigset_t *sigmask);`

// TODO

### 参考文献

[1] https://jvns.ca/blog/2017/06/03/async-io-on-linux--select--poll--and-epoll/

[2] Linux Programmer's Manual: man epoll/epoll_create/epoll_ctl/epoll_wait

### 代码

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
        // must make sure that the next read will block this non-blocking
        // socket, then we think the event is fully consumed.
        if (read_len < 0 && errno == EAGAIN) {
            break;
        }
        // end of file
        if (read_len == 0) {
            break;
        }

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




