---
title: "x86-64 数据"
publishDate: "2026-06-03"
updatedDate: "2026-06-03"
description: "数组，结构体汇编表示与内存布局，数据对齐，缓存区溢出攻击"
seriesId: csapp
orderInSeries: 4
tags: ["学习", "笔记", "CSAPP", "汇编语言", "x86-64"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/csapp/lec08/cover.webp"
    alt: "湖面与倒映山川"
---

## 数组,结构体

### 数组

***定长数组***:

数组在内存中是连续存储的，程序通过基地址和偏移量访问数组元素  

在汇编中，访问`arr[i]`需要计算地址：`base_address + i * element_size`，其中`element_size`是数组元素的大小（如4字节对于int）。  

对应的汇编指令可能是`movl (%rdx ,%rcx, 4), %ebx`，其中`%rdx`存储基地址，`%rcx`存储索引`i`，`4`是元素大小。  

多维数组本质上为数组的数组，多个相同的数组连续存储在内存中  

访问`arr[i][j]`需要计算地址：`base_address + (i * num_columns + j) * element_size`，其中`num_columns`是每行的元素数量。  

访问`A[i][j]`的汇编指令如下：

```assembly
# A in %rdi, i in %rsi, j in %rdx

leaq (%rsi, %rsi, 4), %rax   # 计算 i * num_columns (假设 num_columns = 5)
leaq (%rdi, %rax, 4), %rax   # 计算 A + (i * num_columns) * element_size
movl (%rax, %rdx, 4), %ebx   # 访问 A[i][j]
```

:::tip
注意到汇编中多维数组的行数被硬编码为常量，这要求函数传递多维数组时必须指定行数，例如`void func(int A[][5])`，而不能使用`void func(int** A)`
:::
  
***变长数组***:
  
变长数组在C99标准中引入，允许在运行时定义数组大小。变长数组的内存布局与定长数组类似，但其大小在编译时未知，因此需要动态分配内存。

```c
int val_ele(int n, int A[n][n], int i, int j) {
    return A[i][j];
}
```

对应汇编

```assembly
# n in %rdi, A in %rsi, i in %rdx, j in %rcx
imulq %rdx, %rdi    # 计算 i * n
leaq (%rsi, %rdi, 4), %rax   # 计算 A + (i * n) * element_size
movl (%rax, %rcx, 4), %ebx   # 访问 A[i][j]
```

:::note
可以看到变长数组的实现多了乘法imulq指令的操作，相较于leaq指令可能耗时较多
:::

### 结构体

结构体是由多个不同类型的成员组成的数据类型，编译器为结构体分配连续的内存空间，并根据成员的类型和顺序确定每个成员的偏移量。  

当访问结构体成员时，编译器在指令中硬编码成员的偏移量  

结构的各个字段的选取完全是在编译时处理的。机器代码不包含关于字段声明或字段名字的信息。  

```c
struct Point {
    int x; // offset 0
    int y; // offset 4
};
```

访问`Point p; p.y`的汇编指令如下：

```assembly
# p in %rdi
movl 4(%rdi), %eax   # 访问 p.y，偏移量为4
```

## 数据对齐

数据对齐指特定类型的数据在内存中必须存储在特定的地址边界上，以提高访问效率。

| 数据类型 | 对齐要求字节数 |
|----------|----------|
| char     | 1 |
| short    | 2 |
| int      | 4 |
| long     | 8 |
| double   | 8 |

例如`double`类型的数据必须存储在8字节边界上，即地址必须是8的倍数。  

编译器会在数据之中中插入填充字节以满足对齐要求

## 缓冲区溢出

C语言中的`gets`函数不检查输入的长度，可能导致缓冲区溢出攻击

```c
char *gets(char *buf) {
    char c;
    char *p = buf;
    while ((c = getchar()) != '\n' && c != EOF) {
        *p++ = c; // 可能写入超过buf大小的数据，导致溢出
    }
    *p = '\0'; // 添加字符串结束符
    return buf;
}
```

例如创建了24字节的栈区，然后调用`gets(%rsp)`，如果输入的字节数超过23，那么上一个栈顶的返回地址就会被覆盖，`ret`指令执行时会跳转到未知的地址

![栈溢出示例](https://cdn.fancyflow.top/image/post/study/csapp/lec08/stack-overflow.webp)

攻击者可以利用这个漏洞覆盖返回地址，例如输入24字节的垃圾数据，之后输入攻击代码的地址，最后输入攻击代码，这样当函数返回时就会跳转到攻击代码执行

***对抗措施***:

- 栈不可执行：将栈区标记为不可执行，防止攻击代码在栈上执行
- 栈随机化：每次程序运行时随机化栈的起始地址，增加攻击者猜测正确地址的难度
- 金丝雀值：在返回地址前插入一个编译器给定的随机值，函数返回时检查该值是否被修改，如果被修改则说明发生了溢出攻击，程序可以选择终止执行

gadget攻击方式可以对抗栈不可执行和栈随机化，其原理是利用程序中已有的代码片段（gadget）来构造攻击链，但是gadget攻击无法对抗金丝雀值

例如代码区中存在代码(不是当前执行的):

```assembly
pop %rdi
ret
```

攻击者通过缓存溢出将栈顶的返回地址覆盖pop为指令的地址，再在返回地址前面放置0x12345678。当函数返回时，执行ret指令，跳转到pop指令，栈顶元素是0x12345678，执行pop指令后将0x12345678放入%rdi寄存器中，然后执行ret指令跳转到下一个gadget地址，攻击者可以通过多个gadget组合实现任意代码执行。  
栈布局成`[gadget地址][0x12345678][下一个gadget地址]`(从左到右栈顶到栈底)，攻击者通过构造这样的栈布局来实现攻击链
