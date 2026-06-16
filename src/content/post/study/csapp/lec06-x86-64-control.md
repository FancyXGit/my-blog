---
title: "x86-64 控制"
publishDate: "2026-05-31"
updatedDate: "2026-05-31"
description: "条件码，条件码访问，跳转指令，条件分支，循环结构"
seriesId: csapp
orderInSeries: 2
tags: ["学习", "笔记", "CSAPP", "汇编语言", "x86-64"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/csapp/lec06/cover.webp"
    alt: "春日的花朵"
---

## 条件码

***条件码寄存器***:

CPU维护一组单个位的寄存器，称为条件码寄存器，包含以下：

- `CF` (Carry Flag): 进位标志
- `ZF` (Zero Flag): 零标志
- `SF` (Sign Flag): 符号标志
- `OF` (Overflow Flag): 溢出标志

:::note
`leaq`指令不会修改条件码寄存器，因为它仅计算地址
:::

***设置条件码***:  

算术指令（如`addq`, `subq`）和比较指令（如`cmpq`，`testq`）会根据结果设置条件码。  
  
区别在于算数指令会修改目的寄存器的值，而比较指令**不会修改任何寄存器的值**，只设置条件码。

![比较与测试指令](https://cdn.fancyflow.top/image/post/study/csapp/lec06/cmp-test-instructions.webp)

## 访问条件码

***设置指令***:  
  
条件码寄存器不能直接访问，但可以通过设置指令将条件码的值存储到寄存器中：

![设置指令](https://cdn.fancyflow.top/image/post/study/csapp/lec06/set-instructions.webp)

:::tip
`cmpq %rsi, %rdi`,`setl %al`需要把`cmpq`指令反过来看  
`setl`表示`<`，就看`%rdi < %rsi`是否成立
:::

***条件跳转指令***:  
  
条件跳转指令根据条件码的值决定是否跳转到指定标签：

![条件跳转指令](https://cdn.fancyflow.top/image/post/study/csapp/lec06/jump-instructions.webp)

:::note
常见跳转指令的编码是PC相对的，会将目标指令的地址与紧跟在跳转指令**后面**那条指令的地址之间的差作为编码  
当执行 PC 相对寻址时，程序计数器的值是跳转指令后面的那条指令的地址
:::

## 条件分支

C语言中的条件分支语句（如`if`语句）在汇编中通常通过比较指令和条件跳转指令来实现：

```c
if (test-expr)
    then-statement
else
    else-statement
```

用`goto`改写以更贴切汇编：

```c
    t = test-expr;
    if (!t)
        goto false;
    then-statement
    goto done;
false:
    else-statement
done:
```

在汇编中实现：

```assembly
    # 计算 test-expr 的值并存储在 %rax 中
    cmpq $0, %rax        # 比较 test-expr 的值与 0
    je false              # 如果 test-expr 为 0，跳转到 false 标签
then:
    # 执行 then-statement
    jmp done             # 跳转到 done 标签
false:
    # 执行 else-statement
done:
```

***条件传送***:

出于避免分支预测失败的惩罚考虑，有时会同时计算2个分支的值，再通过分支传送指令（如`cmov`指令）根据条件码选择性地将结果传送到寄存器：

```assembly
    # 计算 test-expr 的值并存储在 %rax 中
    cmpq $0, %rax        # 比较 test-expr 的值与 0
    movq then-result, %rbx  # 计算 then-statement 的结果
    movq else-result, %rcx  # 计算 else-statement 的结果
    cmovz %rcx, %rbx     # 如果 test-expr 为 0，选择 else-result，否则选择 then-result
```

![条件传送指令](https://cdn.fancyflow.top/image/post/study/csapp/lec06/conditional-move-instructions.webp)

:::note
条件传送仅适用于简单而且无副作用的分支
:::

## 循环

C语言中的循环语句（如`while`语句）在汇编中通常通过标签和条件跳转指令来实现：

```c
do
    body-statement
    while (test-expr);
```

用`goto`改写以更贴切汇编：

```c
start:
    body-statement
    t = test-expr;
    if (t)
        goto start;
```

在汇编中实现：

```assembly
start:
    # 执行 body-statement
    # 计算 test-expr 的值并存储在 %rax 中
    cmpq $0, %rax        # 比较 test-expr 的值与 0
    jne start             # 如果 test-expr 不为 0，跳转回 start 标签
```

对while循环和for循环的实现类似，只需调整标签的位置和跳转条件即可，在此不再赘述。

## switch语句

C语言中的`switch`语句在汇编中通常通过跳转表（jump table）来实现：

```c
void switch_eg(long x, long n, long *dest)
{
    long val = x;

    switch (n) {
    case 100:
        val *= 13;
        break;

    case 102:
        val += 10;
        /* Fall through */

    case 103:
        val += 11;
        break;

    case 104:
    case 106:
        val *= val;
        break;

    default:
        val = 0;
    }

    *dest = val;
}
```

用`goto`改写以更贴切汇编：

```c
void switch_eg(long x, long n,
    long *dest)
{
    /* Table of code pointers */
    static void *jt[7] = {
    &loc_A, &loc_def, &loc_B,
    &loc_C, &loc_D, &loc_def,
    &loc_D
    };

    // 偏移并且显示范围
    // int转unsigned int自动将负数转为很大的正数从而过滤
    unsigned long index = n - 100;
    long val;

    if (index > 6)
    goto loc_def;
    /* Multilay branch */
    goto *jt[index];

    loc_A:    /* Case 100 */
    val = x * 13;
    goto done;

    loc_B:    /* Case 102 */
    x = x + 10;
    /* Fall through */

    loc_C:    /* Case 103 */
    val = x + 11;
    goto done;

    loc_D:    /* Cases 104, 106 */
    val = x * x;
    goto done;

    loc_def: /* Default case */
    val = 0;
    done:
    *dest = val;
}
```

通过建立跳转表，程序可以在$O(1)$时间内跳转到对应的代码块，而不需要进行多次比较和跳转  
  
建立的跳转表有如下特征：

- 通过偏移与限制，让跳转表的索引从0开始
- 0和最大值之间无效的索引会跳转到默认处理代码块
- 多个case标签对应同一代码块时，跳转表中会有多个相同的地址
- 标签按顺序排列时，没有`break`的case标签自然滑下
- 标签不按顺序存储，需要加一个跳转语句跳转到下一个标签

:::tip
当标签特别稀疏，例如`case 0`和`case 100000`时，使用跳转表可能会浪费大量空间  
此时编译器可能会选择使用一系列`if-else`语句来实现`switch`语句
:::

汇编当中编译器会在`.s`文件写入跳转表的内容：

```assembly
    .L4:
        .quad .L9
        .quad .L5
        .quad .L6
        .quad .L7
        .quad .L2
        .quad .L7
        .quad .L8
        .quad .L2
        .quad .L5
```

通过`jmp *L4(,%rdi,8)`指令实现跳转到对应的标签，其中`%rdi`存储了偏移后的索引值，`8`是因为每个地址占8字节。
