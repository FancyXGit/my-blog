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

## 日程

- 2026-08-31
  - LEC: 01 Introduction and Examples
  - BOOK: Chapter 1 Operating Systems Interfaces
  - LAB: Unix Utilities: sleep - find
- 2026-09-01
  - LAB: Unix Utilities: xargs
