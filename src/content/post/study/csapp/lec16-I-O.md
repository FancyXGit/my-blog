---
title: "系统级I/O"
publishDate: "2026-06-15"
updatedDate: "2026-06-15"
description: "Linux上的文件I/O，包括文件构成，基础I/O，RIO与标准I/O"
seriesId: csapp
orderInSeries: 9
tags: ["学习", "笔记", "CSAPP"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/csapp/lec16/cover.webp"
    alt: "悬崖与大海"
---

## 文件

Unix系统中文件就是字节的序列，所有I/O设备都被抽象为文件  
应用程序通过系统调用内核来访问文件，内核返回给程序一个非负整数，称为描述符，程序通过文件描述符来访问文件  
Linux系统为每一个进程都创建3个默认打开的文件描述符，分别是标准输入STDIN(0)，标准输出STDOUT(1)和标准错误STDERR(2)

## Unix I/O

### 打开关闭文件

Unix提供了`open`系统调用来打开文件，成功时返回一个新的文件描述符，失败时返回-1并设置errno变量来指示错误类型

```c
#include <unistd.h>

int open(char *pathname, int flags, mode_t mode);
```

- `pathname`参数指定要打开的文件路径
- `flags`参数指定打开文件的方式，例如只读，写入，追加等
- `mode`参数指定新文件的权限，仅在创建新文件时使用
- `umask`函数用于设置新文件的默认权限掩码，影响新文件的权限设置。通过`umask`函数设置的掩码会从新文件的权限中被屏蔽掉

```c
#include <unistd.h>

int close(int fd);
```

`close`系统调用用于关闭文件描述符，成功时返回0，失败时返回-1并设置errno变量来指示错误类型

### 读写文件

Unix提供了`read`和`write`系统调用来读写文件

```c
#include <unistd.h>

ssize_t read(int fd, void *buf, size_t count);
ssize_t write(int fd, const void *buf, size_t count);
```

- `fd`参数指定要读写的文件描述符
- `buf`参数指定数据的缓冲区地址
- `count`参数指定要读写的字节数

成功时，`read`返回实际读到的字节数，`write`返回实际写入的字节数，失败时返回-1并设置errno变量来指示错误类型

### 读取元数据

Unix提供了`stat`，`fstat`系统调用来获取文件的元数据，例如文件大小，权限，所有者等信息

```c
#include <sys/stat.h>

int stat(const char *filename, struct stat *buf);
int fstat(int fd, struct stat *buf);
```

元数据结构体保存到`struct stat`类型的结构体中，包含了文件的各种属性信息，例如文件大小，权限，所有者等

### 读取目录

Unix将目录也视作一个文件，固定包含`.`和`..`两个目录项，分别指向当前目录和父目录  
Unix提供了`opendir`，`readdir`，`closedir`系统调用来读取目录

```c
#include <dirent.h>

DIR *opendir(const char *name);
struct dirent *readdir(DIR *dirp);
int closedir(DIR *dirp);
```

- `opendir`函数用于打开一个目录，成功时返回一个指向`DIR`类型的指针，失败时返回NULL并设置errno变量来指示错误类型
- `readdir`函数用于读取目录的**一项**，成功时返回一个指向`struct dirent`类型的指针，失败时返回NULL并设置errno变量来指示错误类型
- `closedir`函数用于关闭目录流，成功时返回0，失败时返回-1并设置errno变量来指示错误类型

## RIO

RIO(robust I/O)是CSAPP中提供的一套可靠的I/O函数，封装了Unix I/O系统调用，提供了更高层次的接口，处理了部分边界情况和错误处理

### 无缓冲读写

```c
#include "csapp.h"

ssize_t rio_readn(int fd, void *usrbuf, size_t n);
ssize_t rio_writen(int fd, void *usrbuf, size_t n);
```

`rio_readn`和`rio_writen`是无缓冲的读写函数  
通过循环调用`read`和`write`系统调用，直到读写了指定的字节数或者发生错误为止，处理了部分边界情况，例如被信号中断等

### 带缓冲读

切换到内核态读文件是一个昂贵的操作，带缓冲的读函数通过在用户空间维护一个缓冲区来减少切换内核态的次数，提高性能  
当读时，一次性将大量数据读出内核缓冲区到用户缓冲区，下次读直接从用户空间的缓冲区读写，直到缓冲区被耗尽或者需要刷新时才切换内核态进行读，从而减少了切换内核态的次数，提高了性能

```c
#include "csapp.h" 

void rio_readinitb(rio_t *rp, int fd); 

ssize_t rio_readlineb(rio_t *rp, void *usrbuf, size_t maxlen); 
ssize_t rio_readnb(rio_t *rp, void *usrbuf, size_t n); 
```

- `rio_readinitb`函数用于初始化一个`rio_t`类型的缓冲区结构体，关联一个文件描述符。这个结构体包含了用户空间的缓冲区
- `rio_readlineb`函数用于从缓冲区中读取一行数据，直到遇到换行符或者达到最大长度为止
- `rio_readnb`函数用于从缓冲区中读取指定字节数的数据，处理了部分边界情况

## Linux文件结构

Linux使用三张表来管理文件系统中的文件，分别是描述符表，文件表和v-node表

- 描述符表：每个进程都有一个描述符表，记录了该进程打开的文件描述符以及对应的文件表项
- 文件表：系统全局的文件表，记录了所有打开的文件的信息，包括文件位置，访问模式等
- v-node表：系统全局的v-node表，记录了文件系统中所有文件的元数据，例如文件大小，权限，所有者等信息

当一个进程打开一个文件时，内核会在描述符表中为该进程分配一个新的文件描述符，并在文件表中创建一个新的文件表项，记录该文件的访问模式和位置等信息，同时在v-node表中查找该文件的元数据，如果没有找到则创建一个新的v-node表项来记录该文件的元数据

![Linux文件结构](https://cdn.fancyflow.top/image/post/study/csapp/lec16/linux-file-structure.webp)

![指向同一文件](https://cdn.fancyflow.top/image/post/study/csapp/lec16/same-file.webp)

当`fork`系统调用创建一个新的子进程时，父进程的描述符表会被复制到子进程中，父子进程共享同一个文件表项和v-node表项

![父子进程共享文件](https://cdn.fancyflow.top/image/post/study/csapp/lec16/fork-file.webp)

当使用`<`或者`>`等重定向符号时，系统通过调用`dup2`系统调用来复制文件描述符，将标准输入或者标准输出重定向到指定的文件描述符上

![重定向](https://cdn.fancyflow.top/image/post/study/csapp/lec16/redirect.webp)

## 标准I/O

标准I/O库提供了更高层次的接口来进行文件I/O操作，封装了Unix I/O系统调用，提供了缓冲机制和格式化输入输出等功能

```c
#include <stdio.h>

extern FILE *stdin;
extern FILE *stdout;
extern FILE *stderr;

FILE *fopen(const char *pathname, const char *mode);
int fclose(FILE *stream);

size_t fread(void *ptr, size_t size, size_t nmemb, FILE *stream);
size_t fwrite(const void *ptr, size_t size, size_t nmemb, FILE *stream);

int printf(const char *format, ...);
int fprintf(FILE *stream, const char *format, ...);
int sprintf(char *str, const char *format, ...);

int scanf(const char *format, ...);
int fscanf(FILE *stream, const char *format, ...);
int sscanf(const char *str, const char *format, ...);
```

标准I/O适用范围广，一般情况都可以使用标准I/O库函数来进行文件I/O操作  
但是对于网络套接字等特殊文件，标准I/O库函数可能不适用，需要使用RIO进行文件操作  
信号处理函数中也不适合使用标准I/O库函数，因为它们可能不是异步信号安全的
