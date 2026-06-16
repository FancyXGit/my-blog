---
title: "x86-64 基础"
publishDate: "2026-05-30"
updatedDate: "2026-05-30"
description: "关于x86-64指令集的基础知识，包括寄存器命名，数据格式，传输指令，算数指令"
tags: ["学习", "笔记", "CSAPP", "汇编语言", "x86-64"]
seriesId: csapp
orderInSeries: 1
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/csapp/lec05/cover.webp"
    alt: "蓝色海洋与银色沙滩"
---

## 寄存器命名

![寄存器命名](https://cdn.fancyflow.top/image/post/study/csapp/lec05/registers.webp)

x86-64架构寄存器可以分为两种:

- `rax` - `rsp`
  - 前缀`r`表示64位，`e`表示32位
  - 无前缀表示16位，`l`分别表示低8位
- `r8` - `r15`
  - 无后缀表示64位，后缀`d`表示32位，`w`表示16位，`b`表示8位

## 数据格式

***操作大小***:

![数据格式](https://cdn.fancyflow.top/image/post/study/csapp/lec05/data-formats.webp)

- `b` - byte (8 bits)
- `w` - word (16 bits)
- `l` - long (32 bits)
- `q` - quad (64 bits)

***表示方法***:

- 寄存器: `%rax`, `%r8d`, `%eax`, `%al`
- 内存地址: `(%rax)`, `8(%rbx)`, `-4(%rcx, %rdx, 4)`
- 立即数: `$0x10`, `$42`

***比例寻址***:

```assembly
Imm(%Reg1, %Reg2, Scale)
```

得到的地址为: `Imm + Reg1 + Reg2 * Scale`

:::warning
`Scale`只能是1, 2, 4, 或8
:::

:::tip
`leaq`指令可以很方便地计算地址而**不访问内存**  
例如`leaq 8(%rbx, %rcx, 4), %rax`计算地址`8 + rbx + rcx * 4`并将结果存入`rax`
:::

## 传输指令

:::note
x86-64指令集的AT&T语法使用源操作数在前，目的操作数在后，数据方向从左到右
:::

`mov`指令要求源和目的操作数必须具有相同的数据位数，例如`movq %rax, %rbx`，但不允许`movq %rax, %ebx`。

![mov指令](https://cdn.fancyflow.top/image/post/study/csapp/lec05/mov-instruction.webp)

`movz`和`movs`指令允许小位向大位的传输，分别进行零扩展和符号扩展。

![movz和movs指令](https://cdn.fancyflow.top/image/post/study/csapp/lec05/movz-movs-instruction.webp)

`pushq`和`popq`指令分别将寄存器的值压入栈顶和从栈顶弹出到寄存器。

![pushq和popq指令](https://cdn.fancyflow.top/image/post/study/csapp/lec05/push-pop-instruction.webp)

## 算数指令

![基础算数指令](https://cdn.fancyflow.top/image/post/study/csapp/lec05/arithmetic-instructions.webp)

![乘除指令](https://cdn.fancyflow.top/image/post/study/csapp/lec05/mul-div-instructions.webp)

:::note
x86-64默认将`rax`作为乘法的一个乘数，得到的128位结果存储在`rdx:rax`寄存器对中  
除法指令`idiv`将`rdx:rax`寄存器对作为被除数，商存储在`rax`中，余数存储在`rdx`中
:::
