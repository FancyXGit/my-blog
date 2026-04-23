---
title: "单周期CPU"
publishDate: "2026-04-23"
updatedDate: "2026-04-23"
description: "单周期CPU的设计架构，以实现所有RISC-V指令集"
seriesId: cs61c
orderInSeries: 9
tags: ["学习", "CS61C", "笔记"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/cs61c/lec17/cover.webp"
    alt: "沙滩、森林与海洋"
---

## 基本概念

### 数据通路

数据通路的步骤便是CPU执行指令从开始到结束的过程。  
数据通路有5个阶段：

1. IF：指令获取（Instruction Fetch），根据PC寄存器的值从内存中获取指令。
2. ID：指令译码（Instruction Decode），解析指令的操作码和操作数，并从寄存器文件中读取所需的寄存器值。
3. EX：执行（Execute），根据指令类型执行相应的操作，如算术运算、逻辑运算或地址计算。
4. MEM：内存访问（Memory Access），对于需要访问内存的指令，如加载和存储指令，在这个阶段进行内存操作。
5. WB：写回（Write Back），将执行结果写回寄存器。

在单周期CPU中，这五个阶段在一个时钟周期内完成，每条指令的执行时间为一个时钟周期。

![CPU执行指令的五个阶段](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/data-path.webp)

### 寄存器文件

在RISC-V架构中，寄存器文件(Register File)包含32个寄存器(`x0`到`x31`)，每个寄存器宽度为32位。

![寄存器文件](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/register-file.webp)

- 输入RA、RB的值（即寄存器的地址），可以从busA、busB读到对应寄存器的值
- 将Write Enable置为1，在RW设置写入寄存器的地址，在busW设置要写入的数据，就可以将数据写入对应寄存器中
- Clk用于输入时钟信号

:::note
对于接入的引线，应当看成由数根线(如5，32)组成的引线束，每根线传输一个比特的数据。
:::

### 内存

设计中将内存分为指令内存和数据内存两部分，虽然它们在物理上是同一块内存  
内存的模型表示与寄存器组类似

![内存模型](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/memory.webp)

## ADD

先从最简单的ADD指令设计一个CPU，该CPU只能执行ADD指令。

![ADD指令格式](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/add-format.webp)

![ADD指令的数据通路](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/add-data-path.webp)

![ADD数据通路时间线](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/add-timeline.webp)

下面是数据通路执行ADD指令的步骤：

1. 当前时钟周期开始，PC计数器输出当前指令地址
2. 当前指令地址通过+4的ADD加法器计算出下一条指令的地址，但是还没有被存储到PC中
3. 当前指令地址输入IMEM中，指令被读取出来
4. 指令进入控制电路，控制电路解码返回RegWEn为1，表示允许寄存器文件写入
5. 指令的寄存器地址部分进入寄存器文件，寄存器文件输出对应寄存器的值
6. ALU根据指令的操作码执行加法运算，得到结果
7. 在下一个时钟周期开始时，PC计数器更新为下一条指令的地址，同时ALU的结果被写回寄存器文件中

## R格式

将ADD指令的数据通路扩展到R指令，只需要在ALU中增加一个控制信号来区分不同的R指令即可。

![R指令的数据通路](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/r-format-data-path.webp)

## I格式

### 立即数指令

为了适配I格式指令，首先需要一个立即数生成器(Immediate Generator)，将指令中的立即数部分提取出来并进行符号扩展。  
同时，在ALU中增加一个多路选择器(MUX)来选择ALU的第二个操作数是来自寄存器文件还是立即数生成器。

![I格式的数据通路](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/i-format-data-path.webp)

执行立即数指令的步骤如下：

1. 当前时钟周期开始，PC计数器输出当前指令地址
2. 当前指令地址通过+4的ADD加法器计算出下一条指令的地址，但是还没有被存储到PC中
3. 当前指令地址输入IMEM中，指令被读取出来
4. 指令进入控制电路，控制电路解码返回RegWEn为1，表示允许寄存器文件写入；ImmSel为I，表示立即数生成器需要提取I格式立即数；BSel为1，表示ALU的第二个操作数来自立即数生成器；ALUSel设置为对于的运算类型
5. 指令的寄存器地址部分进入寄存器文件，寄存器文件输出对应寄存器的值。同时指令的立即数部分进入立即数生成器，立即数生成器提取出立即数并进行符号扩展，输出到ALU
6. ALU根据指令的操作码执行相应的运算，得到结果
7. 在下一个时钟周期开始时，PC计数器更新为下一条指令的地址，同时ALU的结果被写回寄存器文件中

### 加载指令

加载指令与立即数指令的数据通路类似，区别在于ALU的结果需要通过数据内存(DMEM)进行访问，最终的结果写回寄存器文件。

![加载指令的数据通路](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/load-data-path.webp)

执行加载指令的步骤如下：

1. 前面的步骤与立即数指令相同
2. 控制电路设置ImmSel为I，表示立即数生成器需要提取I格式立即数；RegWriteEnable设为1，表示允许寄存器文件写入；BSel为1，表示ALU的第二个操作数来自立即数生成器；ALUSel设置为加法运算；MemRW为0，表示不需要写内存；WBSel为0，表示内存数据写回寄存器文件
3. 寄存器组，立即数生成器生成地址与偏移，在ALU中计算出内存地址
4. DMEM根据ALU计算出的地址读取数据，数据输出
5. 在下一个时钟周期开始时，PC计数器更新为下一条指令的地址，同时DMEM输出的数据被写回寄存器文件中

## S格式

存储指令只需要添加一条从寄存器输入到内存的引线即可

![S格式的数据通路](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/s-format-data-path.webp)

## B格式

分支指令需要在ALU中增加一个比较器来比较两个寄存器的值，并根据比较结果决定是否更新PC计数器。  
同时由于需要计算PC加上立即数，需要PC到ALU的一条引线。

![B格式的数据通路](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/b-format-data-path.webp)

对Branch Comp的说明:

![Branch Comp](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/branch-comp.webp)

- 输入$A=B$时，BrEq输出1
- 输入$A \lt B$时，BrLT输出1
- 若BrUn是1，则BrLT比较无符号数，否则比较有符号数

## JALR

JALR指令`JALR rd, rs1, imm`的功能是将PC加4的值写入寄存器`rd`，并将PC更新为寄存器`rs1`的值加上立即数`imm`。
PC更新的部分与B格式指令类似，都是通过ALU计算出新的PC值。  
需要新增一条从PC到寄存器组的引线来将PC加4的值写入寄存器`rd`。

![JALR的数据通路](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/jalr-data-path.webp)

## J格式

J格式只有JAL指令，`JAL rd, imm`的功能是将PC加4的值写入寄存器`rd`，并将PC更新为当前PC加上立即数`imm`。
J格式可以完全复用之前的数据通路，无需增加新的引线。

![J格式的数据通路](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/j-format-data-path.webp)

## U格式

U格式只是匹配立即数的，只需要改变立即数生成器的输入和控制电路的ImmSel信号即可，无需增加新的引线。

## 总结

![单周期CPU的数据通路](https://cdn.fancyflow.top/image/post/study/cs61c/lec17/full-data-path.webp)

## 控制电路

控制电路的实现由两种方法：

- 使用ROM(Read-Only Memory)来存储控制信号的逻辑。一般在设计CPU时会使用ROM来实现控制电路，因为这样更灵活，易于修改和扩展。
- 在硬件中硬编码逻辑门来实现控制信号的生成。CPU成品的控制电路通常是通过组合逻辑电路实现的。

