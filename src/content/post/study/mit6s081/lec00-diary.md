---
title: "记录"
publishDate: "2026-09-02"
updatedDate: "2026-09-02"
description: "学习MIT 6.S081课程的记录"
tags: ["学习", "MIT 6.S081", "笔记"]
seriesId: mit6s081
orderInSeries: 99
---

## 学习资料

### 课程

2020秋季课程视频文字  

https://mit-public-courses-cn-translatio.gitbook.io/mit6-s081

### 参考书籍

官方教材book-riscv-rev1中文翻译版  

https://github.com/pleasewhy/xv6-book-2020-Chinese

### 日程表与实验

2021年LAB  

https://pdos.csail.mit.edu/6.828/2021/schedule.html

:::note
2020年的LAB环境需使用较老版本的qemu，故采用2021年的LAB
:::

### 个人解答

基于2021的LAB解答，使用了AI辅助DEBUG  

https://github.com/FancyXGit/MIT-6.S081

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

:::tip
此LAB难度主要在于primes的实现  
primes需要注意作为子进程和父进程时分别需要做的事情，同时需要注意fork之后会复制文件描述符  
需要恰当设置好父子进程的分工，同时注意管道的流式传输  
xargs有一定难度，主要在于字符串的处理
:::

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

:::tip
此LAB理解系统调用的原理之后难度不大  
用户空间中通过`usys.pl`自动生成函数调用的封装函数，内容就是设置寄存器之后执行`ecall`  
执行`ecall`之后陷入内核，通过一系列处理抵达`kernal/syscall.c`中的`syscall()`函数，之后根据系统调用号调用对应的内核函数`sys_XXX()`  
`sys_XXX()`函数中通过`argint()`等函数获取参数，之后跳转到真正的内核函数中执行  
用户态和内核态之间的参数传递是通过`trapframe`实现的
:::

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
  