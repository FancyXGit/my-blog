---
title: "链路"
publishDate: "2026-11-19"
updatedDate: "2026-11-19"
description: "链路的属性和行为"
seriesId: cs168
orderInSeries: 3
tags: ["学习", "cs168", "网络", "链路"]
coverImage:
    src: "/image/post/study/cs168/lec03/cover.webp"
    alt: "金秋落叶"
---

## 属性

我们之前关注于Internet的分层设计，接下来我们关注于一个数据包如何穿越一条链路  
一个链路可以由3个属性描述

- 带宽(bandwidth)：单位时间内能发送多少数据进入链路之中
- 传播延迟(propagation delay)：一个bit从链路的一端传播到另一端需要的时间
- 带宽延迟积(bandwidth-delay product)：链路中最多同时存在bit，等于带宽乘以传播延迟

![链路属性](/image/post/study/cs168/lec03/link-attributes.webp)

## 时序图

现在考虑有一条链路。带宽1 Mbps即为 $ 10 ^6 $ bit/s，传播延迟为 1 ms即为 $ 10 ^{-3} $ s。我们想要发送一个100字节也就是800bit的数据包，从第一个bit开始发送到最后一个bit到达链路的另一端，考虑需要多久  
首先，第一个bit需要 $ 10 ^ {-6} $ s传输到链路中。对于最后一个bit，它在 $ 10 ^ {-6} \times 800 $ s后才被传输到链路中，然后它需要 $ 10 ^ {-3} $ s才能到达链路的另一端。因此总共需要 $ 10 ^ {-6} \times 800 + 10 ^ {-3} = 1.8$ ms 才能将整个数据包发送完毕

![链路时序图](/image/post/study/cs168/lec03/link-timing.webp)

因此，对于给定链路带宽 $B$ 和传播延迟 $D$，发送一个大小为 $L$ bit的数据包需要的时间为 $L/B + D$ s。前半部分是传输延迟(transmission delay)，后半部分是传播延迟(propagation delay)

## 过载

当同时有多个数据包发送到router中时，router会将他们暂时放在队列之中等待发送。当队列也满了之后，router就会丢弃数据包，这就是过载(overload)的现象。原因是因为发送数据包的链路带宽有限，router无法及时发送数据包

![队列](/image/post/study/cs168/lec03/queue.webp)

![过载](/image/post/study/cs168/lec03/overload.webp)
