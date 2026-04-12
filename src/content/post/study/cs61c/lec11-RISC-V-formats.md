---
title: "RISC-V 格式"
publishDate: "2026-04-12"
updatedDate: "2026-04-12"
description: "RISC-V中的指令格式"
seriesId: cs61c
orderInSeries: 5
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

- `opcode` (7 bits): 操作码，指示指令类型。对于 R-format 指令，`opcode` 通常为 `0110011`。
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

**所有R-format指令**:

| `funct7` | `rs2` | `rs1` | `funct3` | `rd` | `opcode` | 指令名 |
|--------|-----|-----|--------|----|--------|--------|
| `0000000` | `rs2` | `rs1` | `000` | `rd` | `0110011` | `add` |
| `0100000` | `rs2` | `rs1` | `000` | `rd` | `0110011` | `sub` |
| `0000000` | `rs2` | `rs1` | `001` | `rd` | `0110011` | `sll` |
| `0000000` | `rs2` | `rs1` | `010` | `rd` | `0110011` | `slt` |
| `0000000` | `rs2` | `rs1` | `011` | `rd` | `0110011` | `sltu` |
| `0000000` | `rs2` | `rs1` | `100` | `rd` | `0110011` | `xor` |
| `0000000` | `rs2` | `rs1` | `101` | `rd` | `0110011` | `srl` |
| `0100000` | `rs2` | `rs1` | `101` | `rd` | `0110011` | `sra` |
| `0000000` | `rs2` | `rs1` | `110` | `rd` | `0110011` | `or` |
| `0000000` | `rs2` | `rs1` | `111` | `rd` | `0110011` | `and` |

:::tip
注意到 `add` 和 `sub`,`srl` 和 `sra` 的 `rd` 相同，但是 `funct7` 不同。`funct7` 的值 `0100000` 就代表需要拓展符号位。
:::

## I-format

### 立即数指令

**指令布局**:

![I指令布局](https://cdn.fancyflow.top/image/post/study/cs61c/lec11-i-format-imm.webp)

**字段说明**:

- I-format指令的字段与R-format指令的区别只在于 `rs2` 和 `funct7` 被替换成了一个12位的立即数 `imm`。
- `opcode` (7 bits): 操作码，指示指令类型。对于 I-format 立即数指令，`opcode` 通常为 `0010011`（算术立即数指令）或 `0000011`（加载指令）。
- `rd` (5 bits): 目的寄存器地址
- `funct3` (3 bits): 功能码，指示具体操作
- `rs1` (5 bits): 源寄存器地址
- `imm` (12 bits): 立即数，直接编码在指令中。在数学立即数指令中，`imm` 是一个有符号数，可以表示 -2048 到 2047 之间的值，在使用之前一直符号扩展为 32 位。

**指令示例**:

```assembly
addi x15, x1, -50
```

![addi指令示例](https://cdn.fancyflow.top/image/post/study/cs61c/lec11-i-format-addi.webp)

**所有I-format立即数指令**:

<table>
    <thead>
        <tr>
            <th>`imm[11:0]`</th>
            <th>`funct3`</th>
            <th>`rd`</th>
            <th>`opcode`</th>
            <th>指令</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>`imm[11:0]`</td>
            <td>`000`</td>
            <td>`rd`</td>
            <td>`0010011`</td>
            <td>`addi`</td>
        </tr>
        <tr>
            <td>`imm[11:0]`</td>
            <td>`010`</td>
            <td>`rd`</td>
            <td>`0010011`</td>
            <td>`slti`</td>
        </tr>
        <tr>
            <td>`imm[11:0]`</td>
            <td>`011`</td>
            <td>`rd`</td>
            <td>`0010011`</td>
            <td>`sltiu`</td>
        </tr>
        <tr>
            <td>`imm[11:0]`</td>
            <td>`100`</td>
            <td>`rd`</td>
            <td>`0010011`</td>
            <td>`xori`</td>
        </tr>
        <tr>
            <td>`imm[11:0]`</td>
            <td>`110`</td>
            <td>`rd`</td>
            <td>`0010011`</td>
            <td>`ori`</td>
        </tr>
        <tr>
            <td>`imm[11:0]`</td>
            <td>`111`</td>
            <td>`rd`</td>
            <td>`0010011`</td>
            <td>`andi`</td>
        </tr>
        <tr>
            <td>`0000000` / `shamt`</td>
            <td>`001`</td>
            <td>`rd`</td>
            <td>`0010011`</td>
            <td>`slli`</td>
        </tr>
        <tr>
            <td>`0000000` / `shamt`</td>
            <td>`101`</td>
            <td>`rd`</td>
            <td>`0010011`</td>
            <td>`srli`</td>
        </tr>
        <tr>
            <td>`0100000` / `shamt`</td>
            <td>`101`</td>
            <td>`rd`</td>
            <td>`0010011`</td>
            <td>`srai`</td>
        </tr>
    </tbody>
</table>

:::note
立即数左移右移指令 `slli`、`srli` 和 `srai` 由于最多移动 31 位，因此立即数字段 `imm` 被重新拆分为 `shamt`（shift amount）和 `funct7` 两部分。
:::  
:::tip
`funct3` 只能存 8 种值但是有 9 条指令，正因为 `imm` 拆出了 `funct7`。`funct7` 的值为 `0100000` 表示算术右移，这与 R-format 指令中的 `funct7` 值情况相同。
:::

### 加载指令

**指令布局**:

![I指令布局](https://cdn.fancyflow.top/image/post/study/cs61c/lec11-i-format-load.webp)

**字段说明**:

- I-format指令中，存储指令字段与立即数指令相同，区别在于 `opcode` 不同以及 `imm` 的使用方式不同。
- `opcode` (7 bits): 操作码，指示指令类型。对于 I-format 加载指令，`opcode` 通常为 `0000011`。
- `rd` (5 bits): 目的寄存器地址
- `funct3` (3 bits): 功能码，指示具体加载类型
- `rs1` (5 bits): 基址寄存器地址
- `imm` (12 bits): 立即数，表示内存地址的偏移

:::tip
加载指令也用 I-format 指令格式，是因为实际上就是地址寄存器 `rs1` 加上一个立即数偏移量 `imm` 来计算内存地址，这就是一个立即数指令的操作。
:::

**指令示例**:

```assembly
lw x14, 8(x2)
```

![lw指令示例](https://cdn.fancyflow.top/image/post/study/cs61c/lec11-i-format-lw.webp)

**所有I-format加载指令**:

| `imm[11:0]` | `rs1` | `funct3` | `rd` | `opcode` | 指令 |
|-----------|-----|--------|----|--------|------|
| `imm[11:0]` | `rs1` | `000` | `rd` | `0000011` | `lb` |
| `imm[11:0]` | `rs1` | `001` | `rd` | `0000011` | `lh` |
| `imm[11:0]` | `rs1` | `010` | `rd` | `0000011` | `lw` |
| `imm[11:0]` | `rs1` | `100` | `rd` | `0000011` | `lbu` |
| `imm[11:0]` | `rs1` | `101` | `rd` | `0000011` | `lhu` |

:::tip
`funct3` 的值为 `000`、`001` 和 `010` 分别表示加载 1 字节、2 字节和 4 字节，并且会进行符号扩展；  
而 `funct3` 的值为 `100` 和 `101` 表示加载 1 字节和 2 字节，但不会进行符号扩展。
:::

## S-format

**指令布局**:

![S指令布局](https://cdn.fancyflow.top/image/post/study/cs61c/lec11-s-format.webp)

**字段说明**:

- `opcode` (7 bits): 操作码，指示指令类型。对于 S-format 存储指令，`opcode` 通常为 `0100011`。
- `funct3` (3 bits): 功能码，指示具体存储类型
- `rs1` (5 bits): 基址寄存器地址
- `rs2` (5 bits): 源寄存器地址，存储指令中 `rs2` 寄存器的值将被存储到内存中
- `imm` (12 bits): 立即数，表示内存地址的偏移。

:::tip
S-format指令中的立即数被拆分成两部分：`imm[11:5]`和`imm[4:0]`，分别存储在指令的不同位置。这是为了保持和R-format指令的字段对齐。这是因为寄存器的名字在硬件设计中更加重要，保证CPU可以最快地读取到寄存器。
:::

**指令示例**:

```assembly
sw x14, 8(x2)
```

![sw指令示例](https://cdn.fancyflow.top/image/post/study/cs61c/lec11-s-format-sw.webp)

**所有S-format存储指令**:

| `imm[11:5]` | `rs2` | `rs1` | `funct3` | `imm[4:0]` | `opcode` | 指令 |
|-----------|-----|-----|--------|----------|--------|------|
| `imm[11:5]` | `rs2` | `rs1` | `000` | `imm[4:0]` | `0100011` | `sb` |
| `imm[11:5]` | `rs2` | `rs1` | `001` | `imm[4:0]` | `0100011` | `sh` |
| `imm[11:5]` | `rs2` | `rs1` | `010` | `imm[4:0]` | `0100011` | `sw` |

:::tip
注意到这里 `funct3` 的值的含义与上面 I-format 加载指令中的 `funct3` 值的含义是相同的。
:::

## B-format

**说明**:

- 如何表示Label?
Label是跳转的指令地址，可以通过与当前指令的地址的差值来表示。这个差值就是一个立即数，直接编码在指令中。
- Label一定要存偏移量的每一位吗?
不需要，立即数的每一位不需要存储在指令中。因为指令地址是对齐的。  
(***注意***:只省略了偏移量的最后一位)

:::note
立即数只省略最后一位，而不是两位的原因在于:虽然一般RISC-V指令是4字节对齐的(最后两位是0)，但是一些RISC-V扩展支持16位压缩指令(倒数第二位不一定是0),所以只能省略最后一位。
:::

**指令布局**:

![B指令布局](https://cdn.fancyflow.top/image/post/study/cs61c/lec11-b-format.webp)

**字段说明**:

- `opcode` (7 bits): 操作码，指示指令类型。对于 B-format 分支指令，`opcode` 通常为 `1100011`。
- `funct3` (3 bits): 功能码，指示具体分支类型
- `rs1` (5 bits): 源寄存器1地址
- `rs2` (5 bits): 源寄存器2地址
- `imm` (13 bits): 立即数，表示跳转的偏移量。由于指令地址是对齐的，所以立即数的最后一位被省略了。

:::tip
`imm`奇怪的排列是为了保持以下原则:

- 最高位 `imm[12]` 存储在指令的最高位，方便符号扩展。
- `imm[10:5]` 存储在指令的中间位置，保持与 R-format 指令的字段对齐。
- `imm[4:1]` 存储在指令的较低位置，保持与 R-format 指令的字段对齐。
- 由于指令地址是对齐的，所以 `imm[0]` 被省略了。
- 最后`imm[11]`放到被省略的`imm[0]`的位置上了。

:::

**指令示例**:

```assembly
Loop: 
    beq x19, x10, End
    add x18, x18, x10
    addi x19, x19, -1
    j Loop
End:
```

:::tip
上面的例子中, beq指令偏移量为`4 * 4 = 16`
:::

![beq指令示例](https://cdn.fancyflow.top/image/post/study/cs61c/lec11-b-format-beq.webp)

**立即数扩展**:
下面的图片演示了I/S/B-format指令中立即数的扩展方式

![立即数扩展示例](https://cdn.fancyflow.top/image/post/study/cs61c/lec-11-imm-expand.webp)

**所有B-format分支指令**:

| `imm[12]` | `imm[10:5]` | `rs2` | `rs1` | `funct3` | `imm[4:1]` | `imm[11]` | `opcode` | 指令 |
|---------|-----------|-----|-----|--------|----------|---------|--------|------|
| `imm[12]` | `imm[10:5]` | `rs2` | `rs1` | `000` | `imm[4:1]` | `imm[11]` | `1100011` | `beq` |
| `imm[12]` | `imm[10:5]` | `rs2` | `rs1` | `001` | `imm[4:1]` | `imm[11]` | `1100011` | `bne` |
| `imm[12]` | `imm[10:5]` | `rs2` | `rs1` | `100` | `imm[4:1]` | `imm[11]` | `1100011` | `blt` |
| `imm[12]` | `imm[10:5]` | `rs2` | `rs1` | `101` | `imm[4:1]` | `imm[11]` | `1100011` | `bge` |
| `imm[12]` | `imm[10:5]` | `rs2` | `rs1` | `110` | `imm[4:1]` | `imm[11]` | `1100011` | `bltu` |
| `imm[12]` | `imm[10:5]` | `rs2` | `rs1` | `111` | `imm[4:1]` | `imm[11]` | `1100011` | `bgeu` |

## U-format

### lui/auipc

**指令含义**:

- `lui` (load upper immediate): 将20位立即数左移12位加载到寄存器中，低12位填0。
- `auipc` (add upper immediate to pc): 将20位立即数左移12位加上当前指令地址(pc)，并将结果存储在寄存器中。

:::tip
这两个指令是为了解决分支指令中立即数位数有限无法跳转到任意地方的问题
:::

**典型用途**:

```assembly
# 加载一个32位立即数到寄存器中
lui rd, imm20
addi rd, rd, imm12
```

```assembly
# 加载相对PC地址偏移量的指令地址到寄存器中
auipc rd, imm20
lw rd, imm12(rd)
```

```assembly
# 实现32位立即数宽度的长跳转
auipc rd, imm20
jalr rd, imm12(rd)
```

:::note
`addi`将后面12字节加入进去的时候，需要考虑符号问题。例如寄存器中`lui`设置了`0xABCDE000`，如果`addi`的立即数是`0xFFF`，那么最终寄存器中的值将是`0xABCD D FFF`，而不是`0xABCDEFFF`。  
解决办法:`lui`的立即数设置`+1`。
:::

### 指令结构

![U指令布局](https://cdn.fancyflow.top/image/post/study/cs61c/lec-11-u-format.webp)

## J-format

![J指令布局](https://cdn.fancyflow.top/image/post/study/cs61c/lec11-j-format.webp)

## 总结

![RISC-V指令格式总结](https://cdn.fancyflow.top/image/post/study/cs61c/lec-11-formats.webp)
