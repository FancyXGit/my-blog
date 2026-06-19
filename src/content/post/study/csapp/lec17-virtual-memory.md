---
title: "虚拟内存"
publishDate: "2026-06-18"
updatedDate: "2026-06-18"
description: "虚拟内存，页表，TLB，Linux虚拟内存"
seriesId: csapp
orderInSeries: 10
tags: ["学习", "笔记", "CSAPP", "内存", "操作系统"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/csapp/lec17/cover.webp"
    alt: "天空与小路"
---

## 虚拟内存

现在的计算机都使用虚拟内存，CPU发出的地址是虚拟地址，内存管理单元（MMU）将虚拟地址转换为物理地址

![虚拟内存系统](https://cdn.fancyflow.top/image/post/study/csapp/lec17/virtual-memory-system.webp)

虚拟内存系统由硬件和软件共同实现，硬件负责地址转换，软件负责内存管理  
每一个进程都有自己的虚拟地址空间，虚拟内存和物理内存被划分为固定大小的页，操作系统维持一个页表来记录虚拟页和物理页的映射关系  
虚拟页面被分为三种状态

- 未分配：虚拟页没有被分配或者创建
- 缓存的：虚拟页已经被映射到物理页
- 未缓存的：虚拟页已经被分配，但是实际对应的物理内存中没有加载数据

![虚拟页状态](https://cdn.fancyflow.top/image/post/study/csapp/lec17/virtual-page-states.webp)

:::note
当程序加载时，操作系统会为程序分配虚拟地址空间，并在页表中建立虚拟页与物理页框的映射关系  
当该数据还没有被访问时，虚拟页处于未缓存状态，数据没有被加载到物理内存中  
当程序访问该数据时，会触发缺页异常，操作系统会将数据加载到物理内存中，并将虚拟页状态更新为缓存的
:::

## 页表

虚拟页与物理页的映射关系由页表来维护，页表是一个数据结构存储在物理内存之中  
虚拟地址被划分为页号和页内偏移，页号用于索引页表来找到对应的物理页框，页内偏移用于计算物理地址  
页表的地址存储在一个特殊的寄存器中，CPU通过该寄存器来访问页表

![页表](https://cdn.fancyflow.top/image/post/study/csapp/lec17/page-table.webp)

不同进程有不同的页表，可以通过将不同页面映射到同一物理页来实现进程间的内存共享  
例如，C标准库函数被映射到不同进程的虚拟地址空间中，这样多个进程可以共享同一份代码和数据

![共享内存](https://cdn.fancyflow.top/image/post/study/csapp/lec17/shared-memory.webp)

单级页表是非常占用空间的，尤其是对于64位系统，虚拟地址空间非常大，页表也会非常大  
因此，现代操作系统通常使用多级页表来减少页表的空间占用

![多级页表](https://cdn.fancyflow.top/image/post/study/csapp/lec17/multi-level-page-table.webp)

虚拟地址被划分为多级，每一级表示一个页表的索引  
获取物理地址的过程如下：

1. 读取寄存器获得第一级页表的物理地址
2. 使用VPN1作为第一级页表的索引来访问第一级页表，获取第二级页表的物理地址
3. 使用VPN2作为第二级页表的索引来访问第二级页表，获取第三级页表的物理地址
4. 不断重复上述过程，直到获取到最终的物理页框地址
5. 与页内偏移相加得到最终的物理地址

## TLB

页表访问非常慢，因为需要多次内存访问来获取物理地址  
为了加速地址转换，CPU引入了一个叫做翻译后备缓冲器（TLB）的高速缓存来存储最近使用的虚拟页和物理页的映射关系  
TLB的结构和访问方式与一般的CPU高速缓存并无太大区别  
VPN被划分为TAG和SET两部分，TLB通过SET来索引找到对应组，TAG用于验证是否命中

![虚拟地址用于访问TLB](https://cdn.fancyflow.top/image/post/study/csapp/lec17/tlb-access.webp)

MMU先访问TLB来查找虚拟页的物理页映射关系，如果TLB命中则直接返回物理地址，如果TLB未命中则需要访问页表来获取物理地址，并将该映射关系加载到TLB中以加速后续访问

![TLB命中和未命中](https://cdn.fancyflow.top/image/post/study/csapp/lec17/tlb-hit-miss.webp)

## 综合地址翻译

下图展现了一个CPU访问内存的完整过程

![CPU地址翻译](https://cdn.fancyflow.top/image/post/study/csapp/lec17/address-translation.webp)

- CPU发出一个虚拟地址，被分割为VPN与VPO
- VPN被划分为TLBT和TLBI两部分
- 访问TLB
  - TLB命中：直接返回物理页框地址
  - TLB未命中：访问页表来获取物理页框地址
    - 通过访问多级页表来获取物理页框地址
    - 将该映射关系加载到TLB中
- 最终物理地址由物理页框地址与页内偏移相加得到
- CPU通过物理地址查询L1数据缓存
  - L1数据缓存命中：直接返回数据
  - L1数据缓存未命中：访问L2,L3以及物理内存来获取数据
- 数据返回给CPU进行处理

考虑一个常见的四级页表的结构
下图是第一级，第二级和第三级页表的结构

![高级页表结构](https://cdn.fancyflow.top/image/post/study/csapp/lec17/high-level-page-table-structure.webp)

下图是第四级页表的结构

![第四级页表结构](https://cdn.fancyflow.top/image/post/study/csapp/lec17/fourth-level-page-table-structure.webp)

:::tip
前几级列表的读写权限表示：

- 如果读写权限为0，表示该页表项对应的所有子表的页面都不能读写
- 如果读写权限为1，表示该页表项对应的所有子表的页面可能可以读写
  - 但是如果子表项的读写权限为0，则该页面不能读写
  - 只有页面的所有父级页表项与当前页表的读写权限都为1时才可以读写

:::

## Linux虚拟内存

Linux进程的虚拟内存被典型地划分为了多个区域

![Linux虚拟内存区域](https://cdn.fancyflow.top/image/post/study/csapp/lec17/linux-virtual-memory-regions.webp)

一个区域就是已经存在已经分配了的虚拟内存的连续片  
Linux为每个进程的虚拟内存维护了一个数据结构来记录这些区域的信息

![Linux维护虚拟内存区域](https://cdn.fancyflow.top/image/post/study/csapp/lec17/linux-manage-virtual-memory-area.webp)

`task_struct`结构体是Linux内核中用于表示一个进程的主要数据结构，其中包含了一个指向`mm_struct`结构体的指针，`mm_struct`结构体用于管理进程的虚拟内存，其中包含了一个指向`vm_area_struct`结构体的链表头指针，`vm_area_struct`结构体用于表示一个虚拟内存区域，记录了该区域的起始地址，结束地址，权限等信息  
程序访问的虚拟地址必须落入某个虚拟的内存区域内，否则会触发段错误（segmentation fault）异常  
如果访问的虚拟地址落入一个未缓存的虚拟页中，则会触发缺页异常，操作系统会将数据加载到物理内存中，并更新页表和TLB来建立虚拟页与物理页的映射关系  

![Linux缺页处理](https://cdn.fancyflow.top/image/post/study/csapp/lec17/linux-page-fault-handling.webp)
