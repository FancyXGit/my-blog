---
title: "向量"
publishDate: "2026-11-20"
description: "向量的共面判定与投影，向量积与混合积，平面方程与空间直线方程，最后是点到平面、点到直线与异面直线之间的距离。"
seriesId: linear-algebra
orderInSeries: 3
tags: ["学习", "线性代数", "笔记", "向量"]
---

## 3.1 向量及其线性运算

### 1\. 三向量共面

$$
\begin{vmatrix}
x_{1}&y_{1}&z_{1}\\
x_{2}&y_{2}&z_{2}\\
x_{3}&y_{3}&z_{3}
\end{vmatrix}=0
$$

### 2\. 投影

(1) $\operatorname{Proj}_{\vec{a}}\vec{b}=\lvert\vec{b}\rvert\cos\theta\cdot\frac{\vec{a}}{\lvert\vec{a}\rvert}=\lvert\vec{b}\rvert\cos\theta\,\vec{a}^{\circ}$

(2) $(\vec{b})_{\vec{a}}=\lvert\vec{b}\rvert\cos\theta=\frac{\vec{a}\cdot\vec{b}}{\lvert\vec{a}\rvert}$

(3) $(\vec{b}+\vec{c})_{\vec{a}}=(\vec{b})_{\vec{a}}+(\vec{c})_{\vec{a}}$

## 3.2 数量积 向量积

### 1\. 向量积

$$
\vec{a}\times\vec{b}=
\begin{vmatrix}
\vec{i}&\vec{j}&\vec{k}\\
x_1&y_1&z_1\\
x_2&y_2&z_2
\end{vmatrix}
$$

### 2\. 混合积

$$
\begin{aligned}
[\vec{a},\vec{b},\vec{c}]&=(\vec{a}\times\vec{b})\cdot\vec{c}\\
&=\begin{vmatrix}
x_1&y_1&z_1\\
x_2&y_2&z_2\\
x_3&y_3&z_3
\end{vmatrix}
\end{aligned}
$$

## 3.3 平面与空间直线

### 1\. 平面

1. 点法式 $A(x-x_0)+B(y-y_0)+C(z-z_0)=0$
2. 一般式 $Ax+By+Cz+D=0$
3. 截距式 $\frac{x}{a}+\frac{y}{b}+\frac{z}{c}=0$
4. 参数式 $\vec{a}=(L_1,M_1,N_1)$ $\vec{b}=(L_2,M_2,N_2)$ $P_0(x_0,y_0,z_0)$

   都在平面上

   $$
   \begin{cases}
   x=x_0+sL_1+tL_2\\
   y=y_0+sM_1+tM_2\\
   z=z_0+sN_1+tN_2
   \end{cases}
   $$

### 2\. 直线

1. 对称式

   $$
   \frac{x-x_0}{L}=\frac{y-y_0}{M}=\frac{z-z_0}{N}
   $$

2. 参数式

   $$
   \begin{cases}
   x=x_0+lt\\
   y=y_0+mt\\
   z=z_0+nt
   \end{cases}
   $$

3. 一般式

   $$
   \begin{cases}
   a_1x+b_1y+c_1z+d_1=0\\
   a_2x+b_2y+c_2z+d_2=0
   \end{cases}
   $$

### 3\. 距离

1. 点到平面距离

   $$
   d=\frac{\lvert Ax_1+By_1+Cz_1+D\rvert}{\sqrt{A^2+B^2+C^2}}
   $$

2. 点到直线距离（$P$ 在直线外，$P_0$ 在直线上）

   $$
   d=\frac{\lvert\overrightarrow{P_0P}\times\vec{l}\rvert}{\lvert\vec{l}\rvert}
   $$

3. 异面直线距离

   $$
   d=\left\lvert\frac{(\vec{l}_1\times\vec{l}_2)\cdot\overrightarrow{P_1P_2}}{\lvert\vec{l}_1\times\vec{l}_2\rvert}\right\rvert
   =\left\lvert\frac{[\vec{l}_1,\vec{l}_2,\overrightarrow{P_1P_2}]}{\lvert\vec{l}_1\times\vec{l}_2\rvert}\right\rvert
   $$
