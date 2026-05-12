---
title: "缓存"
publishDate: "2026-05-09"
updatedDate: "2026-05-09"
description: "关于缓存cache的知识，包括缓存作用，缓存结构"
seriesId: cs61c
orderInSeries: 11
tags: ["学习", "CS61C", "笔记"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/cs61c/lec24/cover.webp"
    alt: "白花，草地与天空"
---

## 直接映射缓存

![直接映射地址](https://cdn.fancyflow.top/image/post/study/cs61c/lec24/direct-mapped-address.webp)

直接映射缓存将内存地址分为三个部分：标签（tag）、索引（index）和块内偏移（block offset）。  
  
缓存只是内存的一小块拷贝。  
  
直接映射缓存中，每一块缓存（就是一行）对应一个索引，包含Valid位, tag标签和数据块。在每个索引对应的块里面，通过offset寻找具体某一个字节。  
  
块内偏移offset的位数的2次幂等于块的大小。索引index的位数的2次幂等于缓存行数。  

![直接映射缓存示例](https://cdn.fancyflow.top/image/post/study/cs61c/lec24/direct-mapped-cache.webp)

![直接映射缓存结构](https://cdn.fancyflow.top/image/post/study/cs61c/lec24/direct-mapped-cache-structure.webp)

## 全相联缓存

全相联结构的缓存取消了索引，而是改由tag标签来标识每一块缓存。  
  
内存数据可以被存储在缓存的任何位置。  

当访问缓存时，检查所有缓存行的标签，以找到匹配的标签来确定数据是否在缓存中。

![全相联缓存结构](https://cdn.fancyflow.top/image/post/study/cs61c/lec24/fully-associative-cache.webp)

## 组相联缓存

组相联缓存是介于直接映射缓存和全相联缓存之间的一种设计。  
  
组相联缓存将缓存分为多个组，每个组包含多个缓存行。每个内存地址通过索引确定它所属的组，然后在该组内进行全相联搜索以找到匹配的标签。  

![组相联缓存地址](https://cdn.fancyflow.top/image/post/study/cs61c/lec24/set-associative-address.webp)
![组相联缓存结构](https://cdn.fancyflow.top/image/post/study/cs61c/lec24/set-associative-cache.webp)

:::tip
设想将直接映射缓存的每个索引改为一个组，每个组有两个缓存行。那么当index相同，tag不同的两个内存数据访问时，就可以同时存储在同一个组的两个缓存行中，而不会发生冲突。
:::

## 多级缓存

多级缓存将缓存分为多个层次，例如L1、L2和L3缓存。  
  
L1缓存从L2缓存中获取数据，L2缓存从L3缓存中获取数据，L3缓存从内存中获取数据。  

多级缓存有效提高了访问内存的速度。
