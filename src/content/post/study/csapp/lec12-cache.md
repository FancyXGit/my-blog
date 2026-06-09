---
title: "缓存"
publishDate: "2026-06-09"
updatedDate: "2026-06-09"
description: "缓存结构，缓存策略，存储层次，缓存优化"
seriesId: csapp
orderInSeries: 6
tags: ["学习", "笔记", "CSAPP"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/csapp/lec12/cover.webp"
    alt: "白花与三叶草"
---

## 存储层次结构

![存储层次结构](https://cdn.fancyflow.top/image/post/study/csapp/lec12/memory-hierarchy.webp)

存储层次为运行的顶层程序提供一种幻想：在获得最底层的大量容量时，同时具备最顶层的快速访问速度

## 缓存结构

![通用缓存结构](https://cdn.fancyflow.top/image/post/study/csapp/lec12/common-cache-structure.webp)

缓存存储下一级存储（内存或者低级缓存）的一部分数据副本  

- 块(B): 缓存中数据的基本单位，缓存至少一次读取一整个块
- 组(S): 一个或者多个多个块的集合
- 相联度(E): 每个组中块的数量
- 容量(C): 缓存中数据的总字节数，$C = B \times S \times E$

![缓存地址分解](https://cdn.fancyflow.top/image/post/study/csapp/lec12/cache-address-decomposition.webp)

内存地址被分解为三个部分：块内偏移、组索引和标签  
地址按照组索引被映射到缓存中的一个组中，同时对应块记录了内存地址的标记  
内存地址的块偏移部分就是缓存中块内的偏移  
因此对于缓存中的一个块，标记和组索引唯一确定了内存地址

### 直接相连

直接相连缓存中每个组只有一个块，即$E = 1$  
因此对于组索引相同的两个不同标签的地址，缓存只能存储其中一个

![直接相连缓存](https://cdn.fancyflow.top/image/post/study/csapp/lec12/direct-mapped-cache.webp)

### 组相联

组相联缓存中每个组有多个块，即$E > 1$，而且有多个组，即$S > 1$
因此对于组索引相同的两个不同标签的地址，缓存可以存储其中多个

![组相联缓存](https://cdn.fancyflow.top/image/post/study/csapp/lec12/set-associative-cache.webp)

现代处理器中通常使用8路组相联缓存，即每个组有8个块

### 全相联

全相联缓存中只有一个组，即$S = 1$  
此时内存地址不再有组索引部分，只有块内偏移和标签两部分  

![全相联缓存](https://cdn.fancyflow.top/image/post/study/csapp/lec12/fully-associative-cache.webp)

## 缓存策略

缓存有多种处理写数据的策略:  

***处理写命中***:  

- 写回(write-back): 只有当缓存块被替换时才将数据写回内存
- 直写(write-through): 每次写数据时都同时更新内存

***处理写缺失***:

- 写分配(write-allocate): 当写数据时，如果数据不在缓存中，则先将数据块加载到缓存中，然后再写数据
- 非写分配(no-write-allocate): 当写数据时，如果数据不在缓存中，则直接将数据写入内存，不加载到缓存中

:::tip
一般写回对应写分配，直写对应非写分配  
建议在心中采用写回和写分配的缓存模型
:::

## 缓存优化

缓存优化主要是提高程序的时间局部性和空间局部性

- 时间局部性: 程序倾向于访问最近访问过的数据
- 空间局部性: 程序倾向于访问与最近访问过的数据地址相近的数据

```c
for (i = 0; i < N; i++) {
    for (j = 0; j < N; j++) {
        A[i][j] = B[i][j] + C[i][j];
    }
}
```

上述代码按行遍历数组A,B,C，相较于按列遍历更具有空间局部性，缓存更友好

```c
for (i = 0; i < N; i++) {
    for (k = 0; k < N; k++) {
        for (j = 0; j < N; j++) {
            A[i][j] += B[i][k] * C[k][j];
        }
    }
}
```

上述代码按照`j-k-i`的顺序访问数组`A`,`B`,`C`，因为数组`A`,`C`递增`j`按行访问，数组`B`递增`k`按行访问，因此具有较好的空间局部性，缓存更友好

## 存储器山

![存储器山](https://cdn.fancyflow.top/image/post/study/csapp/lec12/memory-mountain.webp)

存储器山展示了在不同Size（数组大小）和Stride（遍历步长）下系统读取数据的吞吐量  

- 保持Stride不变，增大Size,吞吐量呈现出阶梯状下降，这是因为当Size超过某个存储层次的容量时，数据无法完全存储在该层次中，导致频繁的缓存缺失和访问更慢的下一级存储层次，从而降低了吞吐量
- 保持Size不变，增大Stride,吞吐量呈现出稳步下降，这是因为当Stride增大时，访问的数据地址之间的距离也增大，可能导致更多的缓存缺失和访问更慢的下一级存储层次，从而降低了吞吐量
- 注意到stride为1时，本来应该在L2缓存山脊出现的吞吐量急剧下降并没有发生，这是因为处理器对步长为1的访问模式进行了优化，预取器能够有效地预取数据到缓存中
