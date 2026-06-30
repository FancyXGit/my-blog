---
title: "并发编程"
publishDate: "2026-06-30"
updatedDate: "2026-06-30"
description: "多进程，I/O多路复用，线程编程，信号量，线程安全"
seriesId: csapp
orderInSeries: 12
tags: ["学习", "笔记", "CSAPP", "并行计算"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/csapp/lec23/cover.webp"
    alt: "雏菊"
---

## 多进程

服务器可以使用多进程来处理多个客户端的请求  

1. 父进程监听客户端请求
2. 客户端请求到来后，父进程创建子进程来处理请求
3. 父进程关闭`connfd`，子进程关闭`listenfd`
4. 子进程处理完请求后，关闭`connfd`，退出
5. 父进程监听到子进程退出信号，信号处理函数调用`waitpid()`回收子进程资源

![多进程服务器-1](https://cdn.fancyflow.top/image/post/study/csapp/lec23/multi-process-server-1.webp)

![多进程服务器-2](https://cdn.fancyflow.top/image/post/study/csapp/lec23/multi-process-server-2.webp)

## I/O多路复用

I/O多路复用的核心是`select()`函数调用，它允许一个进程同时监听多个文件描述符的I/O事件，从而实现高效的I/O操作  
`select`函数检查的对象是文件描述符集合，通常使用`fd_set`类型来表示  
描述符集合是大小为$n$的位向量，每一位$b_k$对应一个文件描述符$k$  
$b_k=1$表示文件描述符$k$在集合中，否则不在集合中  
`select`函数与操作描述符集合的宏如下

```c
#include <sys/select.h>

int select(int nfds, fd_set *readfds, fd_set *writefds, fd_set *exceptfds, struct timeval *timeout);

FD_ZERO(fd_set *set); // 清空集合
FD_SET(int fd, fd_set *set); // 将文件描述符fd加入集合set
FD_CLR(int fd, fd_set *set); // 将文件描述符fd从集合set中移除
FD_ISSET(int fd, fd_set *set); // 检查文件描述符fd是否在集合set中
```

在本节`select`函数只会使用前两个参数，后面3个都设为`NULL`  

```c
select(nfds, &readfds, NULL, NULL, NULL);
```

调用逻辑如下：  

1. 开始时，设置`readfds`集合，其中为1的位表示需要监听的文件描述符
2. 备份`readfds`集合
3. 调用`select`函数

`select`函数会一只阻塞，直到集合中标记为监听的文件描述符中有I/O事件发生  
当I/O事件发生时，内核修改`readfds`集合，仅设置发生了I/O事件的文件描述符对应的位为1，其他位为0
`select`函数返回可读的文件描述符数量

4. 进程检查`readfds`集合，使用`FD_ISSET(fd, &readfds)`判断文件描述符`fd`是否可读
5. 处理可读的文件描述符，使用I/O函数进行读写操作。**由于此时文件必定可读，因此I/O函数不会阻塞**
6. 处理完所有可读的文件描述符后，重新设置`readfds`集合，重复步骤2-5

:::tip
由于内核会修改`readfds`集合，所以调用`select`函数前需要备份集合，调用后需要重新设置集合
:::

:::note
I/O多路复用使得服务端不会一只陷入一个I/O操作阻塞的状态，而可以同时监听多个I/O请求
:::

## 线程编程

线程就是一串连续的指令流，有它自己的程序计数器、寄存器和栈空间，但它与同一进程的其他线程共享代码段、全局变量、虚拟内存和文件描述符等资源  
线程与创建它的线程没有像父子进程一样严格的关系，它们之间是对等的  

### 创建线程

通过调用`pthread_create()`函数创建线程，函数原型如下

```c
#include <pthread.h>
typedef void *(func)(void *);

int pthread_create(pthread_t *tid, const pthread_attr_t *attr, func *f, void *arg);
```

创建的线程会执行函数`f`，并将`arg`作为参数传递给函数`f`  
函数返回时，`tid`中保存了新创建线程的ID  
`attr`参数用于设置线程的属性，一般传入`NULL`，表示使用默认属性

### 终止线程

线程有两种状态：可结合的与分离的

- 可结合的：线程终止后必须由其他线程显式回收资源
- 分离的：线程终止后操作系统自动回收资源

通过调用`pthread_detach()`函数将线程设置为分离状态，函数原型如下

```c
#include <pthread.h>

int pthread_detach(pthread_t tid);
```

当调用`pthread_exit()`函数时，线程立刻终止自己

```c
#include <pthread.h>

void pthread_exit(void *retval);
```

线程通过调用`pthread_join()`函数等待其他线程终止，这个函数是阻塞的，直到指定线程终止

```c
#include <pthread.h>

int pthread_join(pthread_t tid, void **retval);
```

### 初始化线程

`pthread_once()`函数确保了整个进程中某个初始化函数只会被调用一次

```c
#include <pthread.h>

pthread_once_t once_control = PTHREAD_ONCE_INIT;

int pthread_once(pthread_once_t *once_control, void (*init_routine)(void));
```

:::tip
例如，在`pthread_create()`函数中创建线程，传入的函数指针`f`中调用了`pthread_once()`。可以保证`pthread_once()`函数只会在全过程中调用一次`init_routine`。后续的进程遇到`pthread_once()`函数时，都会直接返回，不会再次调用初始化函数
:::

## 线程安全

### 线程共享

多线程程序中，线程共享进程的地址空间，因此它们可以直接访问共享数据

- 全局变量：任何线程访问的全局变量都位于全局区的同一处内存
- 函数内部`static`变量：只会被初始化一次，所有线程访问的都是同一块内存
- 自动变量：每个线程都有自己的栈空间，函数内部的自动变量位于栈上，每个线程访问的都是不同的内存

### 进度图

线程由操作系统随机调度，可能出现由于线程切换导致的数据错误  
例如将每个线程将全局变量`count`加1，可分为5个阶段

1. H：初始化，线程内部操作，不访问全局变量
2. L：加载，将全局变量`count`的值从内存加载到寄存器中
3. U：线程内部寄存器操作，将寄存器中的值加1
4. S：存储，将寄存器中的值写回内存
5. T：尾部，线程内部操作，不访问全局变量

可以看到，`L-U-S`阶段理论上应该为原始的  
如果线程切换导致`L-U-S`阶段被打断，可能会出现数据错误。例如$L_1$紧接着$L_2$，线程1，2同时读到的`count`的值为0，最后都写入1，导致少加了一次  
将程序的执行步骤化成二维图，得到进度图

![进度图](https://cdn.fancyflow.top/image/post/study/csapp/lec23/progress-graph.webp)

当一个线程开始执行$L$，就不应该执行任何其他线程的操作，直到结束完毕$S$，由此画出不安全区

![不安全区](https://cdn.fancyflow.top/image/post/study/csapp/lec23/unsafe-area.webp)

`L-U-S`被称为临界区，各线程临界区的交集就是不安全区，程序的执行路径不得进入不安全区

### 信号量

信号量提供`P`和`V`操作来实现锁的操作  

- `P(s)`：如果`s`为0，则阻塞当前线程，否则将`s`减1
- `V(s)`：将`s`加1，如果有线程阻塞在`s`上，则唤醒其中随机一个线程

将`P`,`V`操作包裹临界区，信号量初始化为1，就可以实现互斥锁的功能，过程如下

1. 线程1调用`P(s)`，此时`s`为1，则将`s`减1，进入临界区
2. 线程2调用`P(s)`，此时`s`为0，则阻塞线程2
3. 线程1执行完临界区代码后，调用`V(s)`，将`s`加1，并唤醒线程2
4. 线程2执行，同时上锁

如此保证了同一时刻只有一个线程进入临界区，避免了数据错误的发生

![信号量实现互斥](https://cdn.fancyflow.top/image/post/study/csapp/lec23/semaphore-mutex.webp)

## 线程问题

### 线程不安全函数

线程不安全函数是指在多线程环境下可能会出现数据错误的函数  
可以归类为4类

- **不保护全局变量**：函数内部使用了全局变量，导致多个线程同时访问同一块内存
- **调用与状态有关**：函数调用的结果取决于前一次的调用，多线程随机调用不符合函数预期
- **返回变量指向静态存储区**：函数返回的变量指向静态存储区，多个线程同时访问同一块内存
- **调用非线程安全函数**：函数内部调用了非线程安全函数

### 死锁

死锁表现为多个线程互相等待对方释放资源，导致所有线程都无法继续执行  
例如定义两个互斥锁`s`，`t`  
线程1执行`P(s)`，然后执行`P(t)`  
线程2执行`P(t)`，然后执行`P(s)`
如果线程1执行`P(s)`后，线程2执行`P(t)`，则线程1阻塞在`s`上，线程2阻塞在`t`上，两个线程都无法继续执行，形成死锁

![死锁进度图](https://cdn.fancyflow.top/image/post/study/csapp/lec23/deadlock-progress-graph.webp)

由进度图可以看出，进入死锁区域之后，上面与右边都是禁止区，无法继续执行  
解决死锁的一个方法是合理设置锁的顺序，例如线程1和线程2都先执行`P(s)`，然后再执行`P(t)`，释放以相反的顺序，则不会出现死锁

![死锁解决进度图](https://cdn.fancyflow.top/image/post/study/csapp/lec23/deadlock-solution-progress-graph.webp)
