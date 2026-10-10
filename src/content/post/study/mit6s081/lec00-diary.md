---
title: "记录"
publishDate: "2026-09-02"
updatedDate: "2026-10-10"
description: "学习MIT 6.S081课程的记录"
tags: ["学习", "MIT6.S081", "笔记", "操作系统"]
seriesId: mit6s081
orderInSeries: 99
---

## LAB记录

### Unix Utilities

- 花费时间：6小时
- 得分：100/100
- 难度：较难
- 结果：

```txt
== Test sleep, no arguments ==
$ make qemu-gdb
sleep, no arguments: OK (3.4s)
== Test sleep, returns ==
$ make qemu-gdb
sleep, returns: OK (0.9s)
== Test sleep, makes syscall ==
$ make qemu-gdb
sleep, makes syscall: OK (0.9s)
== Test pingpong ==
$ make qemu-gdb
pingpong: OK (1.1s)
== Test primes ==
$ make qemu-gdb
primes: OK (1.3s)
== Test find, in current directory ==
$ make qemu-gdb
find, in current directory: OK (1.2s)
== Test find, recursive ==
$ make qemu-gdb
find, recursive: OK (1.3s)
== Test xargs ==
$ make qemu-gdb
xargs: OK (1.8s)
== Test time ==
time: OK
Score: 100/100
```

此LAB难度主要在于primes的实现  
primes需要注意作为子进程和父进程时分别需要做的事情，同时需要注意fork之后会复制文件描述符  
需要恰当设置好父子进程的分工，同时注意管道的流式传输  
xargs有一定难度，主要在于字符串的处理

### System Calls

- 花费时间：4小时
- 得分：35/35
- 难度：中等
- 结果：

```txt
== Test trace 32 grep ==
$ make qemu-gdb
trace 32 grep: OK (4.5s)
== Test trace all grep ==
$ make qemu-gdb
trace all grep: OK (0.8s)
== Test trace nothing ==
$ make qemu-gdb
trace nothing: OK (0.8s)
== Test trace children ==
$ make qemu-gdb
trace children: OK (30.5s)
== Test sysinfotest ==
$ make qemu-gdb
sysinfotest: OK (3.6s)
== Test time ==
time: OK
Score: 35/35
```

此LAB理解系统调用的原理之后难度不大  
用户空间中通过`usys.pl`自动生成函数调用的封装函数，内容就是设置寄存器之后执行`ecall`  
执行`ecall`之后陷入内核，通过一系列处理抵达`kernal/syscall.c`中的`syscall()`函数，之后根据系统调用号调用对应的内核函数`sys_XXX()`  
`sys_XXX()`函数中通过`argint()`等函数获取参数，之后跳转到真正的内核函数中执行  
用户态和内核态之间的参数传递是通过`trapframe`实现的

### Page Tables

- 花费时间：3小时
- 难度：中等
- 通过：3/3
- 结果：

```txt
== Test   pgtbltest: ugetpid ==
  pgtbltest: ugetpid: OK
== Test   pgtbltest: pgaccess ==
  pgtbltest: pgaccess: OK
== Test pte printout ==
$ make qemu-gdb
pte printout: OK (0.7s)
```

理解页表结构之后这个LAB便不难

### Traps

- 花费时间：2.5小时
- 难度：中等
- 通过：4/4
- 结果：

```txt
== Test backtrace test ==
$ make qemu-gdb
backtrace test: OK (2.9s)
== Test running alarmtest ==
$ make qemu-gdb
(4.6s)
== Test   alarmtest: test0 ==
  alarmtest: test0: OK
== Test   alarmtest: test1 ==
  alarmtest: test1: OK
== Test   alarmtest: test2 ==
  alarmtest: test2: OK
```

此LAB理解trap的处理流程之后难度不大  
需要注意在于alarm部分的a0寄存器的恢复，注意不要被对应syscall的处理函数的返回值覆盖掉了

### Copy-on-write fork

- 花费时间：3小时
- 难度：较难
- 通过：3/3
- 结果：

```txt
== Test   simple ==
  simple: OK
== Test   three ==
  three: OK
== Test   file ==
  file: OK
```

此LAB需要注意几点

- 全局页引用数组需要上锁，注意该锁与空闲链表锁的顺序，避免死锁
- 触发COW页错误时，创建新的页之后记得复制父进程的内容到新的页中

其实LAB题干已经写的很清楚要怎么做了，照着干就行  

P.S.感觉自己这里代码写的好丑陋

### Thread

- 花费时间：2小时
- 难度：中等
- 分数：60/60
- 结果：

```txt
== Test uthread ==
$ make qemu-gdb
uthread: OK (4.9s)
== Test answers-thread.txt == answers-thread.txt: OK
== Test ph_safe == make[1]: Entering directory '/home/fancy/MIT6S081/xv6-labs-2021'
gcc -o ph -g -O2 -DSOL_THREAD -DLAB_THREAD notxv6/ph.c -pthread
make[1]: Leaving directory '/home/fancy/MIT6S081/xv6-labs-2021'
ph_safe: OK (16.8s)
== Test ph_fast == make[1]: Entering directory '/home/fancy/MIT6S081/xv6-labs-2021'
make[1]: 'ph' is up to date.
make[1]: Leaving directory '/home/fancy/MIT6S081/xv6-labs-2021'
ph_fast: OK (36.8s)
== Test barrier == make[1]: Entering directory '/home/fancy/MIT6S081/xv6-labs-2021'
gcc -o barrier -g -O2 -DSOL_THREAD -DLAB_THREAD notxv6/barrier.c -pthread
make[1]: Leaving directory '/home/fancy/MIT6S081/xv6-labs-2021'
barrier: OK (3.1s)
== Test time ==
time: OK
Score: 60/60
```

LAB有三个部分，第一个部分是XV6中实现用户态的单线程模拟多线程，这个挺简单的，和内核中的线程调度事实差不多，很多可以照抄，而且因为是单线程模拟的，也不需要管锁之类的问题。最需要注意的是RISC-V中栈向下增长，所以`sp`应该传`stack + STACKSIZE`  
二三部分是和LINUX编程有关，主要涉及`pthread`库。第二个实现是为并发访问的哈希表加上锁，我的实现使用了读写锁`pthread_rwlock_t`而不是实验要求的互斥锁`pthread_mutex_t`，性能快了一些。下面是三种实施办法的速率对比。可以看到在多线程读的情况读写锁显著提高了吞吐量（我的云服务器CPU只有1核2线程，太慢了）

| 场景 | 无锁 | 读写锁 | 互斥锁 |
|---|---|---|---|
| 1线程 put | 8963/s | 9893/s | 9544/s |
| 1线程 get | 9009/s | 10025/s | 8680/s |
| 2线程 put | 18409/s | 15775/s | 15962/s |
| 2线程 get | 16899/s | **20095/s** | 14866/s |
| 2线程 keys missing | **15594** | 0 | 0 |

第三个部分是实现屏障，这个想初次写对还是有点困难的，实验提示给了很多。我总结主要是两点，首先`pthread_cond_wait`可能会意外唤醒，所以需要包在循环里面，另外不能使用`bstate.nthread == 0`作为退出循环条件，因为有线程会抢先修改，导致别的线程看不到`0`又睡下去了，这就是实验教材里面说的

## 日程

- 2026-08-31
  - LEC: 01 Introduction and Examples
  - BOOK: Chapter 1 Operating Systems Interfaces
  - LAB: Unix Utilities: sleep - find
- 2026-09-01
  - LAB: Unix Utilities: xargs
- 2026-09-04
  - LEC: 03 OS Organization and System Calls
  - BOOK: Chapter 2 Operating Systems Organization
  - LAB: System Calls
- 2026-09-05
  - BLOG: LEC02
  - BOOK: Chapter 3 Page Tables: 3.1-3.3
- 2026-09-06
  - BOOK: Chapter 3 Page Tables: 3.4-3.10
  - BLOG: LEC03
- 2026-09-07
  - LEC: 04 Page Tables
  - LEC: 05 Calling Conventions and Stack Frames RISC-V
- 2026-09-08
  - LAB: Page tables
- 2026-09-14
  - BOOK: Chapter 4 Traps and system calls
  - BLOG: LEC04
- 2026-09-15
  - LEC: 06 Isolation & system call entry/exit
- 2026-09-16
  - LEC: 08 Page faults
  - LAB: Traps
- 2026-09-17
  - BLOG: LEC08
- 2026-09-20
  - BOOK: Chapter 5 Interrupts and device drivers
- 2026-09-21
  - LEC: 09 Interrupts
  - BLOG: LEC09
- 2026-09-23
  - LAB: Copy-on-write fork
- 2026-09-25
  - BOOK: Chapter 6 Locking
  - LEC: 10 Multiprocessors and locking
- 2026-10-02
  - BLOG: LEC10
- 2026-10-08
  - BOOK: Chapter 7 Scheduling: 7.1-7.4
  - BLOG: LEC11
  - LEC: 11 Thread switching
- 2026-10-09
  - BOOK: Chapter 7 Scheduling: 7.5-7.10
  - BLOG: LEC13
  - LEC: 13 Sleep & Wake up
- 2026-10-10
  - LAB: Thread
