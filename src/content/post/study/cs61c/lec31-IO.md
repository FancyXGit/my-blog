---
title: "I/O"
publishDate: "2026-05-23"
updatedDate: "2026-05-23"
description: "关于I/O，内存映射，poll&interrupt，DMA"
seriesId: cs61c
orderInSeries: 13
tags: ["学习", "CS61C", "笔记"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/cs61c/lec31/cover.webp"
    alt: "夕阳下的紫色群峦"
---

## 内存映射

每个I/O设备自己都会携带寄存器，这些寄存器被映射到内存地址空间中。  
  
当CPU访问这些特定的内存地址时，实际上是在与I/O设备进行通信。

![内存映射示例](https://cdn.fancyflow.top/image/post/study/cs61c/lec31/memory_mapped_io.webp)

## 轮询

I/O设备的寄存器分为两种：控制寄存器和数据寄存器。  
  
CPU通过轮询(polling)的方式不断检查控制寄存器的状态，以确定I/O设备是否准备好进行数据传输。  
  
当CPU发现控制寄存器的状态表明设备准备好时，CPU就可以通过写入或者读取数据寄存器进行数据传输。

:::note
轮询的缺点在于它会浪费CPU资源，因为CPU需要不断检查设备状态，即使设备没有准备好。
:::

## 中断

为了避免轮询的资源浪费，I/O设备可以通过中断(interrupt)的方式通知CPU它们已经准备好进行数据传输。  
  
当I/O设备准备好时，它会向CPU发送一个中断信号，CPU会暂停当前的执行，转而处理这个中断请求。  
  
中断处理程序会执行必要的操作来处理I/O设备的请求，例如读取数据寄存器中的数据或者写入数据寄存器。处理完成后，CPU会恢复之前的执行。  

:::tip
例子：键盘  

1. 键盘A键被按下，键盘向CPU发送一个中断信号
2. CPU执行完当前的指令后，暂停当前的执行，转而处理这个中断请求（跳转到内核里预先注册好的键盘中断服务程序）
3. CPU把按键数据读走放进缓冲区，然后马上返回之前的执行
4. 如果有程序正在阻塞等待键盘输入（比如read），内核此时会唤醒它；否则数据就先留在缓冲区，等进程下次来取

:::

## DMA

直接内存访问(Direct Memory Access, DMA)是一种允许I/O设备直接与内存进行数据传输的技术，而不需要CPU的干预。

![DMA示例](https://cdn.fancyflow.top/image/post/study/cs61c/lec31/dma.webp)

**输入数据**:

1. I/O设备准备好数据后，向CPU发送一个DMA请求
2. CPU暂停当前的执行，转而处理这个DMA请求，配置好DMA控制器
3. DMA控制器直接从I/O设备读取数据，并将数据写入内存
4. DMA控制器完成数据传输后，向CPU发送一个DMA完成的中断信号

**输出数据**:

1. CPU准备好数据后，配置好DMA控制器，向DMA控制器发送一个DMA请求
2. DMA控制器直接从内存读取数据，并将数据写入I/O设备
3. DMA控制器完成数据传输后，向CPU发送一个DMA完成的中断信号
