---
title: "网络编程"
publishDate: "2026-06-28"
updatedDate: "2026-06-28"
description: "客户端-服务端模型，IP，套接字接口"
seriesId: csapp
orderInSeries: 12
tags: ["学习", "笔记", "CSAPP", "网络"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/csapp/lec21/cover.webp"
    alt: "飞鸟与森林"
---

## 基本概念

### IP

- 主机被映射成32位的IP地址
- IP地址被映射成域名

IP地址是32位的二进制数，存在`in_addr`结构中

```c
struct in_addr {
    uint32_t s_addr; // 32位的IP地址
};
```

:::note
网络字节顺序使用大端序，例如IP地址在网络中以大端法顺序发送
:::

应用程序提供`inet_pton`和`inet_ntop`函数来在点分十进制字符串和二进制IP地址之间进行转换

```c
#include <arpa/inet.h>

int inet_pton(int af, const char *src, void *dst);
const char *inet_ntop(int af, const void *src, char *dst, socklen_t size);
```

Unix提供`htonl`和`ntohl`函数来在主机字节顺序和网络字节顺序之间进行转换

```c
#include <arpa/inet.h>

uint32_t htonl(uint32_t hostlong); // 将32位主机字节顺序转换为网络字节顺序
uint32_t ntohl(uint32_t netlong);  // 将32位网络字节顺序转换为主机字节顺序

uint16_t htons(uint16_t hostshort); // 将16位主机字节顺序转换为网络字节顺序
uint16_t ntohs(uint16_t netshort);  // 将16位网络字节顺序转换为主机字节顺序
```

### 套接字

套接字是系统提供的网络通信接口  
在Linux中，套接字被实现为文件描述符，应用程序可以使用普通文件的`read`和`write`函数来进行网络通信  
写套接字，就是将数据发往网络的发送缓冲区；读套接字，就是从网络的接收缓冲区读取数据

## 套接字接口

套接字接口是用来创建网络连接的一组函数

### 地址结构

套接字地址结构是`struct sockaddr`，它是一个通用的套接字地址结构

```c
struct sockaddr {
    sa_family_t sa_family; // 地址族
    char sa_data[14];      // 地址数据
};
```

具体的IPV4套接字地址结构是`struct sockaddr_in`

```c
struct sockaddr_in {
    sa_family_t sin_family; // 地址族(AF_INET)
    in_port_t sin_port;     // 端口号
    struct in_addr sin_addr; // IP地址
    char sin_zero[8];       // 填充字节，保持结构体大小为16字节
};
```

:::tip
后续`connect`，`bind`，`accept`等函数都使用`sockaddr *`结构体指针作为参数  
传入`struct sockaddr_in *`结构体指针时，需要将其强制转换为`sockaddr *`类型  
两个结构体大小相同，通过指针转换可以实现多态
:::

### socket

**客户端和服务器**都需要创建套接字，使用`socket`函数

```c
#include <sys/socket.h>
#include <sys/types.h>

int socket(int domain, int type, int protocol);
```

`socket`函数创建一个套接字，返回一个文件描述符  
返回的文件描述符还不能进行读写操作  

- 对于服务器，要`bind`套接字到一个地址和端口，然后`listen`套接字，等待客户端连接
- 对于客户端，要`connect`套接字到服务器的地址，建立连接

![套接字接口](https://cdn.fancyflow.top/image/post/study/csapp/lec21/socket-interface.webp)

### 服务端

***BIND***:  

服务器使用`bind`函数将套接字绑定到一个地址和端口

```c
#include <sys/socket.h>

int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
```

`const struct sockaddr *addr`表示要绑定的地址和端口  
端口表示服务端开放服务的端口，客户端通过连接这个端口来访问服务端  
IP地址表示服务器愿意为哪些特定IP提供服务

- `0.0.0.0`表示服务器愿意为所有IP提供服务
- `192.168.1.10`表示只有内网内的机器可以访问
- `127.0.0.1`表示只有本机可以访问

***LISTEN***:  

服务器使用`listen`函数将套接字设置为监听状态，等待客户端连接

```c
#include <sys/socket.h>

int listen(int sockfd, int backlog);
```

:::tip
`listen`函数仅仅是设置状态，并不会阻塞等待客户端连接
:::

`listen`函数返回的`listen_fd`是监听套接字，当标记为可读时，表示有客户端连接请求到达  
系统会维持一个队列，当客户端连接请求到达时，系统会将请求放入队列中  

***ACCEPT***:  

服务器使用`accept`函数从队列中取出一个客户端连接请求，返回一个新的套接字文件描述符，用于与客户端通信

```c
#include <sys/socket.h>

int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
```

`accept`返回的`conn_fd`是一个新的套接字文件描述符，用于与客户端通信  
对`conn_fd`进行写操作时，数据会通过网络发送到客户端；对`conn_fd`进行读操作时，数据读取客户端发送的数据  

### 客户端

客户端使用`connect`函数连接服务器

```c
#include <sys/socket.h>

int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
```

`connect`返回的`sockfd`可以读写以与服务器通信

### 主机与服务转换

***GETADDRINFO***:

`getaddrinfo`函数将主机名和服务名转换为套接字地址结构

```c
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>

int getaddrinfo(const char *host, const char *service,
                const struct addrinfo *hints,
                struct addrinfo **res);

void freeaddrinfo(struct addrinfo *res);
```

函数`getaddrinfo`将传入的`res`指针指向一个链表，链表中的每个节点都是一个`struct addrinfo`结构体，包含着`host`的信息

![getaddrinfo返回链表](https://cdn.fancyflow.top/image/post/study/csapp/lec21/getaddrinfo.webp)

***GETNAMEINFO***:

`getnameinfo`函数将套接字地址结构转换为主机名和服务名

```c
#include <sys/socket.h>
#include <netdb.h>

int getnameinfo(const struct sockaddr *sa, socklen_t salen,
                char *host, size_t hostlen,
                char *serv, size_t servlen, int flags);
```
