---
title: "RISC-V 格式"
publishDate: "2026-04-09"
updatedDate: "2026-04-09"
description: "RISC-V中的指令格式"
seriesId: cs61c
orderInSeries: 4
tags: ["学习", "CS61C", "笔记", "汇编语言", "RISC-V", "指令格式"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/cs61c/lec07-cover.webp"
    alt: "星空，流星与大地"
---

## 总览

RISC-V 的6种指令格式：

- R-format: 寄存器-寄存器数学指令
- I-format: 寄存器-立即数指令以及加载指令
- S-format: 存储指令
- B-format: 分支指令
- U-format: 上半立即数指令
- J-format: 跳转指令

## R-format

**指令布局**:

![R指令布局](https://cdn.fancyflow.top/image/post/study/cs61c/lec11-r-format.webp)

**字段说明**:

- `opcode` (7 bits): 操作码，指示指令类型。对于R-format指令，opcode通常为`0110011`。
- `rd` (5 bits): 目的寄存器地址
- `funct3` (3 bits): 功能码，指示具体操作
- `rs1` (5 bits): 源寄存器1地址
- `rs2` (5 bits): 源寄存器2地址
- `funct7` (7 bits): 功能码，进一步指示具体操作

**指令示例**:

```assembly
add x18, x19, x20
```

![add指令示例](https://cdn.fancyflow.top/image/post/study/cs61c/lec11-r-format-add.webp)