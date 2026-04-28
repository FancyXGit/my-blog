---
title: "流水线"
publishDate: "2026-04-28"
updatedDate: "2026-04-28"
description: "流水线CPU设计，包括如何处理三种风险"
seriesId: cs61c
orderInSeries: 10
tags: ["学习", "CS61C", "笔记"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/cs61c/lec21/cover.webp"
    alt: "樱花与溪流"
---

## 流水线

### 概览

流水线将指令执行分为多个阶段，每个阶段处理指令的一部分。这样可以在同一时间内处理多条指令，提高CPU的吞吐量。

![流水线示意图](https://cdn.fancyflow.top/image/post/study/cs61c/lec21/pipeline.webp)

### 数据通路

要将单周期CPU改为流水线CPU，需要做以下修改：

![数据通路修改](https://cdn.fancyflow.top/image/post/study/cs61c/lec21/datapath.webp)

- 在每个阶段之间添加寄存器，以存储中间结果。
- 修改控制信号，使其适应流水线结构。
- 写回pc + 4的分支采用独立的加法器，避免干扰其他阶段。

## 风险

### 结构风险

结构风险发生在两个指令需要使用同一资源时，例如ALU或内存。  
解决方法：

- 增加资源，例如增加ALU数量。
- 通过调度指令来避免资源冲突。例如让指令暂停，直到资源可用。

:::note
RISC-V指令集设计时就考虑到避免结构风险
:::

### 数据风险

数据风险发生在指令之间存在数据依赖时，例如一条指令需要使用前一条指令的结果，但是前一条指令还没有完成。

**读写**:

当两条指令同时写和读的时候，可以通过合理设计寄存器文件来避免数据风险。

![数据风险示例](https://cdn.fancyflow.top/image/post/study/cs61c/lec21/datahazard-rw.webp)

寄存器文件被设计为，在前半个周期写入数据，在后半个周期读取数据。这样可以确保写入操作完成后，读取操作才能获取到正确的数据。  

当读的指令在写指令之前时，数据风险就会发生。  
注意到，下一条指令需要使用ALU的结果时，上一条指令的ALU已经计算完成了，但是结果还没有写回寄存器文件。  
为了不产生空泡，我们可以使用转发（forwarding）技术，将ALU的输出直接转发到需要它的指令，而不必等待写回寄存器文件。

:::tip
RISC-V中`nops`指令可以用来插入空泡，也就是`addi x0, x0, 0`，它不会改变任何寄存器的值。
:::

![转发示例](https://cdn.fancyflow.top/image/post/study/cs61c/lec21/forwarding.webp)

![转发电路](https://cdn.fancyflow.top/image/post/study/cs61c/lec21/forwarding-circuit.webp)

**加载**:

当指令需要使用前一条指令加载的数据时，数据风险就会发生。这时候转发无法解决问题，因为在数据从内存读出来时，ALU的阶段已经结束。

![加载数据风险示例](https://cdn.fancyflow.top/image/post/study/cs61c/lec21/datahazard-load.webp)

解决方法：

- 插入空泡，让指令暂停一个周期，等待数据加载完成。
- 通过编译器优化指令顺序，避免数据风险。例如将不相关的指令插入到需要等待的指令之间。

### 控制风险

控制风险发生在分支指令时，因为是否分支直到分支指令的EX阶段才知道。此时，下面两条指令已经开始执行。

解决方法：**预测分支**  
分支预测器根据历史执行情况预测分支的结果，从而提前加载可能需要执行的指令。
