---
title: "RISC-V 基础"
publishDate: "2026-04-09"
updatedDate: "2026-04-09"
description: "指令集，汇编语言，CPU组成，RISC-V的基础知识，包括add/sub/addi指令和数据传输指令lw/sw/lb/sb/lbu等。"
seriesId: cs61c
orderInSeries: 3
tags: ["学习", "CS61C", "笔记","汇编语言", "RISC-V"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/cs61c/lec07-cover.webp"
    alt: "星空，流星与大地"
---

## 基本概念

### 指令与指令集

- **指令(Instruction)**：CPU执行的基本操作单元，包含操作码和操作数。
- **指令集(Instruction Set Architecture, ISA)**：定义CPU支持的指令类型和格式的规范，决定了CPU的功能和性能。  
  - 常见的指令集有x86、ARM、MIPS等，**RISC-V**是近年来兴起的一种开源指令集架构。

### 汇编语言

- **汇编语言(Assembly Language)**：一种低级编程语言，直接对应于机器指令，使用助记符表示操作码和寄存器。
- *Instruction set for a particular architecture (e.g. RISC-V) is represented by the Assembly language.*（一个特定架构的指令集由汇编语言表示。）
- *Each line of assembly code represents one instruction for the compute.*（每行汇编代码代表计算机的一条指令。）

### 寄存器

![Processor interact with memory](https://cdn.fancyflow.top/image/post/study/cs61c/lec07-cpu-and-memory.webp)

- **寄存器(Register)**：CPU内部的高速存储单元，用于临时存储数据和指令。寄存器数量有限，访问速度快。
- **内存(Memory)**：用于存储程序和数据的较大容量存储设备，访问速度较慢。
- 汇编语言不能使用变量，而是操纵寄存器。CPU从内存中加载数据到寄存器，进行计算后再存回内存。
- 寄存器比内存快得多。操作内存的速度大约是操作一次寄存器的速度(0.25ns)的50-500倍。
- 在RISC-V中，一共有32个寄存器，每个寄存器32位宽（4个字节）
- 寄存器命名：x0-x31，**其中x0始终为0**，x1-x31可用于存储数据。寄存器中的数据没有类型，类型由指令决定。

### 大字端与小字端

![大字端与小字端的举例对比](https://cdn.fancyflow.top/image/post/study/cs61c/lec07-big-small-endian.webp)

- **大字端(Big-endian)**：数据的高位字节存储在低地址，低位字节存储在高地址。
- **小字端(Little-endian)**：数据的低位字节存储在低地址，高位字节存储在高地址。
- RISC-V，以及世界上大多数现代处理器，采用小字端格式存储数据。

## ADD/SUB

### add

```assembly
add rd, rs1, rs2
```

- **功能**：将寄存器rs1和rs2中的值相加，并将结果存储在寄存器rd中。
- **操作数**：3个寄存器，分别是目的寄存器(rd)和两个源寄存器(rs1和rs2)。

:::tip
`add x1, x2, x0`相当于把寄存器x2的值复制到寄存器x1中，因为x0始终为0。
:::

:::note
`add x0, x1, x2`相当于执行了一个无效操作，因为结果被存储在x0中，而x0始终为0，所以这个指令不会改变任何寄存器的值。
:::

### sub

```assembly
sub rd, rs1, rs2
```

- **功能**：将寄存器rs1中的值减去寄存器rs2中的值，并将结果存储在寄存器rd中。
- **操作数**：3个寄存器，分别是目的寄存器(rd)和两个源寄存器(rs1和rs2)。

:::note
C语言的一行也许在汇编当中成为多行
:::

:::tip
RISC-V中注释以#开头，#后面的内容被视为注释，不会被CPU执行。
:::

### addi

```assembly
addi rd, rs1, imm
```

- **功能**：将寄存器rs1中的值与立即数imm相加，并将结果存储在寄存器rd中。
- **操作数**：2个寄存器(rd和rs1)和一个立即数(imm)。立即数是一个常数值，直接编码在指令中。

:::tip
实现立即数减法：`addi rd, rs1, -imm`，将立即数取负即可实现减法。
:::

## Data Transfer

### lw

```assembly
lw rd, offset(rs1)
```

**举例**:
假设x15存了int数组A的起始地址，lw指令可以从内存中加载一个字(4字节)到寄存器中：

```assembly
lw x5, 0(x15)   # 从地址x15加载第一个元素
lw x6, 4(x15)   # 从地址x15+4加载第二个元素
```

x5就是A[0]，x6就是A[1]。

:::note
偏移量计算以字节为单位，一个字节8位，4字节就是32位。  
lw/sw一次操作一个字(4字节32位)，所以偏移量通常是4的倍数。
:::

:::tip
lw指令，数据流向是从右到左(offset(rs1) -> rd)
:::

### sw

```assembly
sw rs2, offset(rs1)
```

**举例**:
假设x15存了int数组A的起始地址，sw指令可以将寄存器中的值存储到内存中：

```assembly
sw x5, 0(x15)   # 将寄存器x5的值存储到地址x15
sw x6, 4(x15)   # 将寄存器x6的值存储到地址x15+4
```

:::tip
sw指令，数据流向是从左到右(rs2 -> offset(rs1))
:::

### lb,sb

```assembly
lb rd, offset(rs1)   # 加载一个字节到寄存器
sb rs2, offset(rs1)   # 将寄存器中的一个字节存储到内存
```

**功能**：  
lb/sb指令与lw/sw很相似，但是lb指令从内存中加载1个字节(8位)到寄存器中，sb指令将寄存器中的1个字节存储到内存中。

**举例**：  
假设x15存了char数组B的起始地址，lb指令可以从内存中加载一个字节到寄存器中：

```assembly
lb x5, 0(x15)   # 从地址x15加载第一个元素
lb x6, 1(x15)   # 从地址x15+1加载第二个元素
sb x5, 2(x15)   # 将寄存器x5的值存储到地址x15
```

x5就是B[0]，x6就是B[1],sb指令将x5的值存储到地址x15+2，即B[2]。所以现在B[2]的值被更新为B[0]的值。

:::note
lb指令加载一个字节到寄存器中时，会进行符号扩展，即如果最高位是1，则在寄存器的高位填充1，否则填充0。  
sb指令将寄存器中的一个字节存储到内存中时，只会存储寄存器的最低8位，其他位会被忽略。
:::

### lbu

```assembly
lbu rd, offset(rs1)   # 加载一个字节到寄存器，无符号扩展
```

**功能**：  
lbu指令与lb指令类似，但它加载一个字节到寄存器时进行无符号扩展，即不考虑最高位的符号，直接在寄存器的高位填充0。

:::tip
为什么没有sbu指令？因为sb指令存储一个字节时只会存储寄存器的最低8位，无论是符号扩展还是无符号扩展都不会影响存储的结果，所以不需要sbu指令。
:::

---

**习题**：

```assembly
addi x11, x0, 0x3F5
sw x11, 0(x5)
lb x12, 1(x5)
```

`x12` 的结果是什么？

**解答**：

1. `addi x11, x0, 0x3F5`：将立即数 `0x3F5` 加载到寄存器 `x11` 中。
2. `sw x11, 0(x5)`：将寄存器 `x11` 的值（`0x3F5`）按照 **小端序** 存储到内存地址 `x5` 开始的 4 个字节中。  
  内存地址（设 `x5 = A`）：

- `A[0] = 0xF5`（`0x3F5` 的最低字节）
- `A[1] = 0x03`（`0x3F5` 的次低字节）
- `A[2] = 0x00`（`0x3F5` 的次高字节）
- `A[3] = 0x00`（`0x3F5` 的最高字节）

3. `lb x12, 1(x5)`：从内存地址 `x5 + 1`（即 `A[1]`）加载一个字节到寄存器 `x12` 中。`A[1]` 的值是 `0x03`，最高位是 `0`，所以进行符号扩展时，会在寄存器 `x12` 的高位填充 `0`，最终结果是 `0x00000003`。
