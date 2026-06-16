---
title: "虚拟内存"
publishDate: "2026-05-18"
updatedDate: "2026-05-18"
description: "虚拟内存，分页表，TLB等"
seriesId: cs61c
orderInSeries: 12
tags: ["学习", "CS61C", "笔记", "内存", "操作系统"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/cs61c/lec28/cover.webp"
    alt: "夕阳，山脉与草地"
---

## 概念

- 中断(Interrupt)：被外部事物中断，例如键盘，或者I/O
- 异常(Exception)：内部出现错误，例如内存错误

## 虚拟内存

操作系统为每个进程提供一个独立的地址空间，称为虚拟内存(Virtual Memory)。每个进程认为自己拥有连续的内存地址，但实际上这些地址可能被映射到物理内存的不同位置。  
  
这是为了保持进程之间的隔离，防止一个进程访问另一个进程的内存，从而提高系统的安全性和稳定性。

## 分页

物理内存和虚拟内存都被划分为固定大小的块，称为页(Page)，每页通常为4KB。  
  
虚拟地址被分为两部分：页号(Page Number)和页内偏移(Page Offset)。  

![虚拟地址结构](https://cdn.fancyflow.top/image/post/study/cs61c/lec28/virtual_address_structure.webp)

物理内存对应的页框(Frame)也被划分为相同大小的块。  
  
操作系统维护一个页表(Page Table)，用于记录虚拟页与物理页框之间的映射关系。  

![虚拟地址映射](https://cdn.fancyflow.top/image/post/study/cs61c/lec28/virtual_address_mapping.webp)

## 多级页表

单级页表的一个问题在于页表空间可能占用非常大  

:::tip
32位地址空间中，如果页表大小为4KB($2^{12}$字节)，那么页表一共需要$2^{20}$个页表项，每个页表项占用4字节，总共需要4MB的内存。  
如果有256个进程，那么总共需要1GB的内存来存储页表，这对于系统来说是一个巨大的开销。
:::

应对：采用多级页表。  

多级页表将页表分为多个层次，每层页表只存储部分虚拟地址空间的映射关系。

![多级页表下的虚拟地址映射](https://cdn.fancyflow.top/image/post/study/cs61c/lec28/multilevel_page_table_mapping.webp)

以图中两级列表为例，虚拟地址被分为三部分：一级页表索引(p1)、二级页表索引(p2)和页内偏移(offset)。  

1. 进程寄存器中存储一级页表的基地址
2. 读取一级索引p1，在第一级页表中找到对应的二级页表的地址
3. 读取二级索引p2，在第二级页表中找到对应的物理页框地址
4. 最后将物理页框地址与页内偏移offset相加，得到最终的物理地址

:::note
注意到只有第一级页表的每一行都分配了内存空间，而第一级页表中无效行并不会分配第二级页表的内存空间，这样就大大节省了内存。
:::

下图是最后一级页表一行的结构，包含了物理页框地址和一些标志位，例如有效位(valid bit)，读写权限位(read/write bit)等。
![页表结构](https://cdn.fancyflow.top/image/post/study/cs61c/lec28/page_table_structure.webp)

## TLB

TLB(Translation Lookaside Buffer)是一个小型的高速缓存，用于存储最近使用的虚拟地址到物理地址的映射关系。  
  
TLB通常是全相联的，即任何虚拟页都可以映射到TLB中的任何位置。  

当CPU需要访问一个虚拟地址时，首先会检查TLB，如果TLB中有对应的映射关系(称为TLB命中)，则直接使用该映射关系进行地址转换；如果TLB中没有对应的映射关系(称为TLB未命中)，则需要访问页表来获取映射关系，并将其加载到TLB中。

![TLB作用](https://cdn.fancyflow.top/image/post/study/cs61c/lec28/tlb.webp)
