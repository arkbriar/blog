---
title: "Linux IO Multiplexing -- Epoll"
published: 2018-04-16T19:51:21+08:00
draft: false
category: "Systems"
tags: ["epoll", "io-multiplexing", "linux"]
---

Epoll is a set of programming interfaces unique to the Linux platform, used for monitoring IO events on multiple file descriptors. The advantage of epoll over select/poll is that it performs very well even when monitoring a large number of file descriptors. The epoll API supports two monitoring modes: edge-triggered (EPOLLET) and level-triggered (default).

In edge-triggered mode, a file descriptor is only returned by epoll_wait when an event occurs on it. For example, when monitoring a socket, suppose the first epoll_wait returns that socket with 2 bytes available to read, but only 1 byte is read. The next epoll_wait will not return that file descriptor. In other words, having unread data remaining in the buffer is not considered an event.

Level-triggered mode is different -- as long as the socket is still readable, it will continue to be returned.

When using ET mode, non-blocking file descriptors must be used to prevent blocking reads/writes from starving tasks that handle multiple file descriptors. It is best to use the ET mode epoll_wait interface with the following pattern:

+ Use **non-blocking** file descriptors
+ Only suspend and wait when read/write returns EAGAIN; when read/write returns less data than requested, you can be sure there is no more data in the buffer, and the event can be considered complete.

### Epoll API

Linux provides the following functions for creating, managing, and using epoll instances:

+ `int epoll_create(int size);`, `int epoll_create1(int flags);`
+ `int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);`
+ `int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);`
+ `int epoll_pwait(int epfd, struct epoll_event *events, int maxevents, int timeout, const sigset_t *sigmask);`

#### epoll_create/epoll_create1

`epoll_create` creates an epoll instance and returns a file descriptor representing that instance. In `epoll_create1`, the size limitation of epoll was removed. The flags parameter can be set to EPOLL_CLOEXEC, which sets close-on-exec (FD_CLOEXEC) on the new file descriptor. This flag indicates whether the file descriptor should be closed after an execve system call in the new thread.

#### epoll_ctl

epoll_ctl is used to control the file descriptors monitored by an epoll instance. Here, epfd is the epoll file descriptor, and op specifies the operation to perform. There are three types of operations:

+ EPOLL_CTL_ADD
+ EPOLL_CTL_MOD
+ EPOLL_CTL_DEL

As the names suggest: add, modify, and delete.

The remaining parameters are the corresponding file descriptor fd and the set of events to monitor, stored in `struct epoll_event`:

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

The events field in `struct epoll_event` is a bitmask indicating the events being monitored. Here are some of the important ones:

+ EPOLLIN/EPOLLOUT: the file is readable/writable
+ EPOLLRDHUP: the connection was closed or half-shutdown for writing
+ EPOLLERR: default parameter, an error occurred on the file descriptor
+ EPOLLHUP: default parameter, the file was hung up; on sockets/pipes this means the local end closed the connection
+ EPOLLET: enables edge-triggered mode; level-triggered is the default
+ EPOLLONESHOT: automatically removes the monitor after a single trigger
+ EPOLLWAKEUP: if EPOLLONESHOT and EPOLLET are cleared and the process has CAP_BLOCK_SUSPEND capability, this flag ensures the system does not suspend or sleep while the event is pending or being processed

#### epoll_wait/epoll_pwait

`epoll_wait` blocks and waits for events on file descriptors. The events array must be at least as large as maxevents. `epoll_wait` blocks until:

+ A file descriptor produces an event
+ It is interrupted by a signal
+ It times out (timeout)

And returns the number of current events.

`epoll_pwait` additionally takes a sigmask parameter specifying signals that should not interrupt the call; otherwise it is equivalent to `epoll_wait`.

### Performance Benchmark

A comparison of system call overhead for poll/select and epoll when monitoring different numbers of file descriptors, referenced from the first website in the references.

```
# operations  |  poll  |  select   | epoll
10            |   0.61 |    0.73   | 0.41
100           |   2.9  |    3.0    | 0.42
1000          |  35    |   35      | 0.53
10000         | 990    |  930      | 0.66
```

### References

[1] https://jvns.ca/blog/2017/06/03/async-io-on-linux--select--poll--and-epoll/

[2] Linux Programmer's Manual: man epoll/epoll_create/epoll_ctl/epoll_wait

### A Simple Epoll-based Server

The following is a simple server implemented in C that supports up to 100 simultaneous connections. For each new connection, it is added to the epoll queue. When IO events arrive, the corresponding client's IO events are handled.

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
