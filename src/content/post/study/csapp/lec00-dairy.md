---
title: "记录"
publishDate: "2026-05-27"
updatedDate: "2026-05-31"
description: ""
tags: ["学习", "CSAPP", "笔记"]
seriesId: csapp
orderInSeries: 0
draft: true
---

## LAB评分

所有我的LAB答案都在[这里](https://github.com/FancyXGit/CSAPP)

### Data Lab

- 花费时间：5小时
- 难度：偏易
- Total points: 36/36

| Score | Rating | Errors | Function        | Operators |
|-------|--------|--------|-----------------|-----------|
| 1     | 1      | 0      | bitXor          | 8         |
| 1     | 1      | 0      | tmin            | 1         |
| 1     | 1      | 0      | isTmax          | 6         |
| 2     | 2      | 0      | allOddBits      | 9         |
| 2     | 2      | 0      | negate          | 2         |
| 3     | 3      | 0      | isAsciiDigit    | 7         |
| 3     | 3      | 0      | conditional     | 8         |
| 3     | 3      | 0      | isLessOrEqual   | 5         |
| 4     | 4      | 0      | logicalNeg      | 6         |
| 4     | 4      | 0      | howManyBits     | 89        |
| 4     | 4      | 0      | floatScale2     | 18        |
| 4     | 4      | 0      | floatFloat2Int  | 16        |
| 4     | 4      | 0      | floatPower2     | 9         |

### Bomb Lab

- 花费时间：6小时
- 难度：较难
- 通过：6/6

```txt
Welcome to my fiendish little bomb. You have 6 phases with
which to blow yourself up. Have a nice day!
Phase 1 defused. How about the next one?
That's number 2.  Keep going!
Halfway there!
So you got that one.  Try this one.
Good work!  On to the next...
Congratulations! You've defused the bomb!
```

### Attack Lab

- 花费时间：6小时
- 难度：中等
- 通过：5/5

```txt
Cookie: 0x59b997fa
Type string:Touch3!: You called touch3("59b997fa")
Valid solution for level 3 with target rtarget
PASS: Would have posted the following:
        user id bovik
        course  15213-f15
        lab     attacklab
        result  1:PASS:0xffffffff:rtarget:3:30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 AD 1A 40 00 00 00 00 00 C5 19 40 00 00 00 00 00 AB 19 40 00 00 00 00 00 48 00 00 00 00 00 00 00 DD 19 40 00 00 00 00 00 70 1A 40 00 00 00 00 00 13 1A 40 00 00 00 00 00 D6 19 40 00 00 00 00 00 C5 19 40 00 00 00 00 00 FA 18 40 00 00 00 00 00 35 39 62 39 39 37 66 61
```

### Cache Lab

- 花费时间：8小时
- 难度：中等+
- 分数：80/80

```txt
Part A: Testing cache simulator
Running ./test-csim
                        Your simulator     Reference simulator
Points (s,E,b)    Hits  Misses  Evicts    Hits  Misses  Evicts
     3 (1,1,1)       9       8       6       9       8       6  traces/yi2.trace
     3 (4,2,4)       4       5       2       4       5       2  traces/yi.trace
     3 (2,1,4)       2       3       1       2       3       1  traces/dave.trace
     3 (2,1,3)     167      71      67     167      71      67  traces/trans.trace
     3 (2,2,3)     201      37      29     201      37      29  traces/trans.trace
     3 (2,4,3)     212      26      10     212      26      10  traces/trans.trace
     3 (5,1,5)     231       7       0     231       7       0  traces/trans.trace
     6 (5,1,5)  265189   21775   21743  265189   21775   21743  traces/long.trace
    27


Part B: Testing transpose function
Running ./test-trans -M 32 -N 32
Running ./test-trans -M 64 -N 64
Running ./test-trans -M 61 -N 67

Cache Lab summary:
                        Points   Max pts      Misses
Csim correctness          27.0        27
Trans perf 32x32           8.0         8         288
Trans perf 64x64           8.0         8        1172
Trans perf 61x67          10.0        10        1997
          Total points    53.0        53
```

### Shell Lab

- 花费时间：4小时
- 难度：较难
- 通过：16/16

> 虽说照着书上的代码依葫芦画瓢莫名其妙完成了这个LAB  
> 但是我感觉我对信号，并发的理解并不深入，后续还需要继续学习

## 日程

- 2026-05-27
  - SETUP: find material
  - Lecture: 01 Course Overview
  - Textbook: Chapter 1
- 2026-05-28
  - Lecture: 02-04 Data Representation
  - Textbook: Chapter 2 - Chapter 3.3
  - LAB: Data Lab: xor - conditional
- 2026-05-29
  - LAB: Data Lab: finished
- 2026-05-30
  - Lecture: 05: Machine Level Programming I Basis
  - Textbook: Chapter 3.4 - 3.6.5
  - Notes: lec05
- 2026-05-31
  - Lecture: 06: Machine Level Programming II Control
  - Textbook: Chapter 3.6.6 - 3.8.4
  - Notes: lec06
- 2026-06-01
  - Lecture: 07: Machine Level Programming III Procedure
  - Notes: lec07
  - Textbook: Chapter 3.8.5 - 3.10
  - LAB: Bomb Lab: Phase_1 - Phase_2
- 2026-06-02
  - LAB: Bomb Lab: finished
- 2026-06-03
  - Lecture: 08-09: Machine Level Programming IV-V Data - Advanced Topics
  - Notes: lec08-09
  - Textbook: Chapter 3.11 - Chapter 3.12
- 2026-06-04
  - LAB: Attack Lab
- 2026-06-07
  - Textbook: Chapter 5
  - Lecture: 10: Program Optimization
- 2026-06-08
  - Textbook: Chapter 6
  - Notes: lec10
  - Lecture: 11: The Memory Hierarchy
- 2026-06-09
  - Textbook: Chapter 7.1 - 7.5
  - Notes: lec12
  - Lecture: 12: Cache Memory
  - LAB: Cache Lab: Part A
- 2026-06-10
  - LAB: Cache Lab: finished
- 2026-06-11
  - Lecture: 13: Linking
  - Textbook: Chapter 7.6 - 7.15
- 2026-06-13
  - Lecture: 14: Exceptions Control Flow: Exceptions and Processes
  - Textbook: Chapter 8.1 - 8.4
- 2026-06-14
  - Lecture: 15: Exceptions Control Flow: Signals and Nonlocal Jumps
  - Textbook: Chapter 8.5 - 8.8
  - Notes: lec14
- 2026-06-15
  - Lecture: 16: System Level I/O
  - Textbook: Chapter 10
  - Notes: lec16
- 2026-06-16
  - LAB: Shell Lab
  - Lecture: 17: Virtual Memory Concepts
  - Textbook: Chapter 9.1 - 9.6
- 2026-06-17
  - Lecture: 18 - 19: Virtual Memory Systems & Dynamic Memory Allocation Basic Concepts
  - Textbook: Chapter 9.7 - 9.9
- 2026-06-18
  - Notes: lec17
  - Lecture: 20: Dynamic Memory Allocation Advanced Concepts
  - Textbook: Chapter 9.10 - 9.12
