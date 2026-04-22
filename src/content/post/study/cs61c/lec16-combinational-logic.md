---
title: "组合逻辑"
publishDate: "2026-04-22"
updatedDate: "2026-04-22"
description: "真值表，逻辑运算，逻辑门，布尔代数；多路复用器，ALU，加法器"
seriesId: cs61c
orderInSeries: 8
tags: ["学习", "CS61C", "笔记"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/cs61c/lec16/cover.webp"
    alt: "黑色的海滩与海水"
---

## 逻辑门

主要的逻辑门包括与门(AND)、或门(OR)、非门(NOT)、异或门(XOR)、与非门(NAND)、或非门(NOR)等。

![and-or-not](https://cdn.fancyflow.top/image/post/study/cs61c/lec16/and-or-not.webp)
![xor-nand-nor](https://cdn.fancyflow.top/image/post/study/cs61c/lec16/xor-nand-nor.webp)

:::tip
线路中的小圆圈表示取反，即NOT操作。  
异或门XOR中的X表示exclusive，即排除OR当中全为1的情况。  
与非门NAND，或非门NOR中的N表示not，即与对应门的输出取反。
:::

## 布尔代数

布尔代数的基本运算法则如下：
![布尔代数](https://cdn.fancyflow.top/image/post/study/cs61c/lec16/boolean-algebra.webp)

## 多路复用器

多路复用器（Multiplexer）可以根据选择信号从多个输入中选择一个输出。

![多路复用器](https://cdn.fancyflow.top/image/post/study/cs61c/lec16/multiplexer.webp)

## ALU

算术逻辑单元（Arithmetic Logic Unit）是计算机中的一个重要组件，负责执行算术和逻辑运算。

![ALU](https://cdn.fancyflow.top/image/post/study/cs61c/lec16/alu.webp)
![ALU内部结构](https://cdn.fancyflow.top/image/post/study/cs61c/lec16/alu-internal.webp)

:::tip
当接收到信号，ALU里面的加法器，与门和或门**同时工作**，由多路复用器根据控制信号选择输出结果。
:::

## 加法器

### 原理

二进制加法的过程中每一位运算不是独立的。两个数字的当前位的和加上当前产生的进位，产生当前位的和以及下一位的进位。
设$a_i$和$b_i$分别是两个二进制数的第$i$位，$c_i$是当前位产生的进位，那么当前位的和$s_i$和下一位的进位$c_{i+1}$可以表示为：
$$
s_i = XOR(a_i, b_i, c_i) = a_i \oplus b_i \oplus c_i
$$
$$
c_{i+1} = MAJ(a_i, b_i, c_i) = a_i b_i + a_i c_i + b_i c_i
$$

![加法真值表](https://cdn.fancyflow.top/image/post/study/cs61c/lec16/adder-truth-table.webp)

:::tip
异或运算`XOR`可以看作为一位的加法。  
`MAJ`是多数函数，表示当输入中至少有两个1时输出为1，否则输出为0。  
这是符合逻辑的，要产生进位，至少需要两个输入为1。
:::

### 电路

一位加法器的电路如下：

![一位加法器](https://cdn.fancyflow.top/image/post/study/cs61c/lec16/one-bit-adder.webp)

将上一位的进位输入到下一位的加法器中，就可以构建多位加法器：

![多位加法器](https://cdn.fancyflow.top/image/post/study/cs61c/lec16/multi-bit-adder.webp)

### 溢出

需要有一种标志表示加法器得到的结果是否溢出(OF)。  
溢出只会发生在有符号运算的两种情况下：

- 两个正数相加得到一个负数。此时输入的最高位都是0，但输出的最高位是1。
- 两个负数相加得到一个正数。此时输入的最高位都是1，但输出的最高位是0。

:::tip
正数+负数不可能产生溢出，因为他们的绝对值一定变小。
:::

有符号数可能产生溢出的运算情况可以分为下面四种:

| 加数1 | 加数2 | 输出 | 是否溢出 | $c_{n-1}$ | $c_n$ |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 正 | 正 | 负 | 是 | 0 | 1 |
| 正 | 正 | 正 | 否 | 0 | 0 |
| 负 | 负 | 正 | 是 | 1 | 0 |
| 负 | 负 | 负 | 否 | 1 | 1 |

由上表看出溢出发生的标志是
$$
\text{overflow} = c_{n-1} \oplus c_n
$$
即当最高位的进位和次高位的进位不同时发生溢出。

:::tip
两个正数相加要产生负数，由于最高位都是`0`，所以最高位的进位$c_n$必须为1，$c_{n-1}$不可能为1，必须为0。  
两个负数相加要产生正数，由于最高位都是`1`，所以最高位的进位$c_n$必须为0，$c_{n-1}$不可能为0，必须为1。
:::

## 减法器

减法器可以通过加法器来实现。减去一个数等价于加上它的补码。

![减法器](https://cdn.fancyflow.top/image/post/study/cs61c/lec16/subtractor.webp)

:::note
当`SUB`信号为1时执行减法，此时所有输入的`b_i`都被取反。原本应该为`0`的初始进位$c_0$被置为1，这样就相当于加上了`b`的补码。
:::
