---
title: "160相交链表"
publishDate: "2026-07-13"
updatedDate: "2026-07-13"
tags: ["算法", "Leetcode", "链表"]
seriesId: leetcode
orderInSeries: 1
---

## 双指针

双指针算法本质上就是$a + b = b + a$的问题  
$pA$先走A再走B，$pB$先走B再走A，两者里程都相等。由于两条链表最后有公共部分，所以$pA$和$pB$最后会在相交部分相等

![双指针](https://cdn.fancyflow.top/image/post/study/leetcode/160/double-pointer.webp)

## 长度差

长度差是一个更直观的方法  
剪掉长链表的前面部分，使得两条链表长度相等，然后同时遍历两条链表，找到第一个相同的节点就是相交节点
