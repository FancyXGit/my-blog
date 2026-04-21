---
title: "状态机"
publishDate: "2026-04-21"
updatedDate: "2026-04-21"
description: "逻辑电路，时钟，寄存器，累加器，有限状态机"
seriesId: cs61c
orderInSeries: 7
tags: ["学习", "CS61C", "笔记"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/cs61c/lec15/cover.webp"
    alt: "海面与玫瑰花"
---

## 寄存器

寄存器是由多个并联的触发器组成的电路，每一个触发器可以存储一个二进制位（0或1）。  
触发器有这样的特性：当时钟信号由低电平(0)变为高电平(1)时，触发器将输出端的值更新为输入端的值。  
寄存器有清零端口，可以将寄存器的输出强制设置为0。  
![寄存器](https://cdn.fancyflow.top/image/post/study/cs61c/lec15/register.webp)

## 累加器

如下是一种累加器电路  

![累加器](https://cdn.fancyflow.top/image/post/study/cs61c/lec15/accumulator.webp)

![累加器时序图](https://cdn.fancyflow.top/image/post/study/cs61c/lec15/accumulator-timing.webp)

- 第1个时钟周期: 寄存器输出$s_{i-1}$置为0，加法器输入$x_i$置为$x_0$，累加器输出$s_i$为$x_0 = s_0$。
- 第2个时钟周期: 寄存器输出$s_{i-1}$置为$s_0$，加法器输入$x_i$置为$x_1$，累加器输出$s_i$为$s_0+x_1 = s_1$。

如此循环往复，最后加法器输出的$s_i$就是前i个输入的和。

## 有限状态机

有限状态机由一个寄存器和一个组合逻辑电路组成。寄存器存储当前状态，组合逻辑电路根据当前状态和输入计算下一个状态。
![有限状态机](https://cdn.fancyflow.top/image/post/study/cs61c/lec15/fsm.webp)

:::tip
有限状态机有两个输入，当前状态与输入信号；两个输出，下一个状态与输出信号。  
当时钟给出信号，寄存器将状态机输入更新为下一个状态。
:::

下面是一个简单有限状态机的例子：
检测输入是否有连续3个1：
![连续3个1的有限状态机](https://cdn.fancyflow.top/image/post/study/cs61c/lec15/fsm-3ones.webp)
可以画出状态转移图：
![状态转移图](https://cdn.fancyflow.top/image/post/study/cs61c/lec15/fsm-3ones-graph.webp)
