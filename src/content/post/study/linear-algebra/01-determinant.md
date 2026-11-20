---
title: "行列式"
publishDate: "2026-11-20"
description: "从二元线性方程组引出二阶行列式，推广到 n 阶定义与余子式，再给出行列式的基本性质、逆序数判定与 Cramer 法则的证明。"
seriesId: linear-algebra
orderInSeries: 1
tags: ["学习", "线性代数", "笔记", "行列式"]
---

## 1.1 行列式的定义与性质

### 1\. 由解 2 元线性方程组 → 2 阶行列式

$$
\begin{cases}
a_{11}x_1+a_{12}x_2=b_1\\
a_{21}x_1+a_{22}x_2=b_2
\end{cases}
$$

$$
\begin{aligned}
D&=\begin{vmatrix}a_{11}&a_{12}\\a_{21}&a_{22}\end{vmatrix}\\
D_1&=\begin{vmatrix}b_1&a_{12}\\b_2&a_{22}\end{vmatrix}\\
D_2&=\begin{vmatrix}a_{11}&b_1\\a_{21}&b_2\end{vmatrix}
\end{aligned}
$$

$x_1=\frac{D_1}{D}$，$x_2=\frac{D_2}{D}$（$D_n$ 即将第 $n$ 列换为 $b_1,b_2$）

### 2\. 由 2 阶推广到 n 阶，并定义计算方法

$$
\begin{aligned}
D&\overset{\text{def}}{=}a_{11}A_{11}+a_{12}A_{12}+\cdots+a_{1n}A_{1n}\\
A_{ij}&=(-1)^{i+j}M_{ij}
\end{aligned}
$$

### 3\. 上、下三角行列式

$$
D=\begin{vmatrix}
a_{11}&0&\cdots&0\\
a_{21}&a_{22}&\cdots&0\\
\vdots&\vdots&&\vdots\\
a_{n1}&a_{n2}&\cdots&a_{nn}
\end{vmatrix}=a_{11}a_{22}\cdots a_{nn}
$$

副对角线：

$$
\begin{vmatrix}
0&\cdots&0&a_{1n}\\
0&\cdots&a_{2,n-1}&a_{2n}\\
\vdots&&\vdots&\vdots\\
a_{n1}&a_{n2}&\cdots&a_{nn}
\end{vmatrix}=(-1)^{\frac{n(n-1)}{2}}a_{1n}a_{2,n-1}\cdots a_{n1}
$$

### 4\. 行列式性质

1. $D=D^{T}$
2. 互换 2 行反号
3. $D=\sum_{j=1}^{n}a_{ij}A_{ij}$，$i=1,2,\cdots,n$

行列式的结果相当于前 1 个数不动保持 $1,2,3,\cdots,n$，后一个数进行全排列，逆序数决定正负号

## 1.3 Cramer 法则

简单证明：对于 $n$ 个方程，$n$ 个未知量组成的线性方程组

$$
\begin{cases}
a_{11}x_1+a_{12}x_2+\cdots+a_{1n}x_n=b_1\\
a_{21}x_1+a_{22}x_2+\cdots+a_{2n}x_n=b_2\\
\cdots\\
a_{n1}x_1+a_{n2}x_2+\cdots+a_{nn}x_n=b_n
\end{cases}
$$

对每一行乘上 $A_{i1}$ 得

$$
\begin{cases}
A_{11}a_{11}x_1+A_{11}a_{12}x_2+\cdots+A_{11}a_{1n}x_n=A_{11}b_1\\
A_{21}a_{21}x_1+A_{21}a_{22}x_2+\cdots+A_{21}a_{2n}x_n=A_{21}b_2\\
\cdots\\
A_{n1}a_{n1}x_1+A_{n1}a_{n2}x_2+\cdots+A_{n1}a_{nn}x_n=A_{n1}b_n
\end{cases}
$$

全部相加得

$$
\begin{aligned}
&(A_{11}a_{11}+A_{21}a_{21}+\cdots+A_{n1}a_{n1})x_1\\
&\quad+(A_{11}a_{12}+A_{21}a_{22}+\cdots+A_{n1}a_{n2})\\
&\quad+\cdots+(A_{11}a_{1n}+A_{21}a_{2n}+\cdots+A_{n1}a_{nn})x_n\\
&=A_{11}b_1+A_{21}b_2+\cdots+A_{n1}b_n
\end{aligned}
$$

注意到，令

$$
D=\begin{vmatrix}
a_{11}&a_{12}&\cdots&a_{1n}\\
a_{21}&a_{22}&\cdots&a_{2n}\\
\vdots&\vdots&&\vdots\\
a_{n1}&a_{n2}&\cdots&a_{nn}
\end{vmatrix}
$$

得

$$
\begin{aligned}
A_{11}a_{11}+A_{21}a_{21}+\cdots+A_{n1}a_{n1}&=D\\
A_{11}a_{12}+A_{21}a_{22}+\cdots+A_{n1}a_{n2}&=0
\end{aligned}
$$

将 $D$ 中第 1 列换成 $b_1,b_2,\cdots,b_n$ 得 $D_1$

故 $Dx_1=D_1$，$x_1=\frac{D_1}{D}$

同理得 $x_2,x_3\cdots x_n$
