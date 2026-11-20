---
title: "线性方程组"
publishDate: "2026-11-20"
description: "用消元法讨论线性方程组的解，给出向量组线性表示与线性相关的判据，极大无关组与向量组的秩，以及齐次与非齐次方程组解的结构。"
seriesId: linear-algebra
orderInSeries: 4
tags: ["学习", "线性代数", "笔记", "线性方程组"]
---

## 4.1 消元法

### 1\. 非齐次线性方程组的解

$n$ 元线性方程组 $Ax=b$ 的解

(1) $r(A)=r$，$r(\bar{A})=r+1$ 无解

(2) $r(A)=r(\bar{A})=r$

1. $r=n$ 唯一解
2. $r<n$ 无数组解

### 2\. 齐次线性方程组的解

$n$ 元齐次线性方程组 $Ax=0$ 的解

(1) $r(A)=n$ 只有 $0$ 解

(2) $r(A)<n$ 无数组非 $0$ 解

## 4.2 向量组的线性相关性

### 1\. 线性表示

若 $\vec{\beta}=\sum_{i=1}^{s}k_i\vec{\alpha}_i$，则 $\vec{\beta}$ 可用 $\vec{\alpha}_1,\vec{\alpha}_2\cdots\vec{\alpha}_s$ 线性表示

若（Ⅰ）$\vec{\beta}_1,\vec{\beta}_2,\vec{\beta}_3\cdots\vec{\beta}_m$　（Ⅱ）$\vec{\alpha}_1,\vec{\alpha}_2\cdots\vec{\alpha}_n$

（Ⅰ）中每一个向量都可用（Ⅱ）线性表示，则向量组（Ⅰ）可用（Ⅱ）线性表示

### 2\. 等价

若（Ⅰ）可用（Ⅱ）线性表示，（Ⅱ）可用（Ⅰ）线性表示，则（Ⅰ）与（Ⅱ）等价

### 3\. 线性相关与线性无关

对于一个向量组 $\vec{\alpha}_1,\vec{\alpha}_2,\cdots,\vec{\alpha}_s$

若存在不全为 $0$ 的数 $k_1,k_2\cdots k_s$ 使 $\sum_{i=1}^{s}k_i\vec{\alpha}_i=0$

则向量组线性相关

否则线性无关

### 4\. 线性表示与线性相关的判定

判定线性表示与线性相（无）关

① 判定向量组（Ⅰ）$\vec{\alpha}_1,\vec{\alpha}_2\cdots\vec{\alpha}_m$ 是否能被向量组（Ⅱ）$\vec{\beta}_1,\vec{\beta}_2\cdots\vec{\beta}_m$ 线性表示

写出矩阵 $[\vec{\alpha}_1,\vec{\alpha}_2\cdots\vec{\alpha}_m\ \vdots\ \vec{\beta}_1,\vec{\beta}_2\cdots\vec{\beta}_m]$

将左侧化为阶梯形矩阵，整体作行变化，比较左侧的秩与增广矩阵 $[\vec{\alpha}_1,\vec{\alpha}_2\cdots\vec{\alpha}_m\ \vdots\ \vec{\beta}_1]$（即将除 $\vec{\beta}_1$ 外的 $\vec{\beta}$ 删去）的秩比较，判定是否有解

② 判定 $\vec{\alpha}_1,\vec{\alpha}_2\cdots\vec{\alpha}_s$ 是否线性相关

(1) 线性相关 $\Leftrightarrow r[\vec{\alpha}_1,\vec{\alpha}_2\cdots\vec{\alpha}_s]\leqslant s$

线性无关 $\Leftrightarrow r[\vec{\alpha}_1,\vec{\alpha}_2\cdots\vec{\alpha}_s]=s$

(2) $n$ 个 $n$ 维向量线性无关 $\Leftrightarrow \det[\vec{\alpha}_1\cdots\vec{\alpha}_n]\neq 0$

(3) $s>n$，则一定线性相关

(4) $s=1$ 即单个向量 $\vec{\alpha}$

$\vec{\alpha}=0\Leftrightarrow$ 线性相关

$\vec{\alpha}\neq 0\Leftrightarrow$ 线性无关

(5) 若 $B=AP$（$B$、$A$ 为列向量组构成的矩阵）

则可得 <1> Ⅰ 可用 Ⅱ 线性表示

设 $B=[\vec{\beta}_1,\vec{\beta}_2\cdots\vec{\beta}_m]$，$A=[\vec{\alpha}_1,\vec{\alpha}_2\cdots\vec{\alpha}_s]$

则 $P$ 是一个 $s\times m$ 矩阵，设为

$$
\begin{bmatrix}
C_{11}&C_{12}&\cdots&C_{1m}\\
\vdots&\vdots&&\vdots\\
C_{s1}&C_{s2}&\cdots&C_{sm}
\end{bmatrix}
$$

则

$$
\begin{aligned}
AP&=[C_{11}\vec{\alpha}_1+C_{21}\vec{\alpha}_2+\cdots+C_{s1}\vec{\alpha}_s,\ \cdots,\\
&\quad C_{1m}\vec{\alpha}_1+C_{2m}\vec{\alpha}_2+\cdots+C_{sm}\vec{\alpha}_s]\\
&=[\vec{\beta}_1,\ \cdots,\ \vec{\beta}_m]
\end{aligned}
$$

则 $\vec{\beta}_i=\sum_{\mu=1}^{m}C_{\mu i}\vec{\alpha}_\mu$，即 $B$ 可用 $A$ 线性表示，$P$ 可得表示法

<2> 若 $P$ 可逆，则 Ⅱ 与 Ⅰ 等价

$B=AP\Rightarrow BP^{-1}=A$，即 $A=BP^{-1}\Rightarrow$ Ⅱ 可用 Ⅰ 线性表示

则 Ⅰ 与 Ⅱ 等价

<3> 若 $P$ 为列满秩矩阵，则 Ⅱ 线性无关 $\Rightarrow$ Ⅰ 线性无关

$B=AP$，设 $Bx=0$，由 Ⅱ 线性无关知，得 $(AP)x=0$，即 $A(Px)=0$，$\therefore Px=0$，又 $P$ 列满秩

$\therefore x=0$，即 $Bx=0\Rightarrow x=0$，即 Ⅰ 线性无关。

<4> $P$ 可逆，则 Ⅱ、Ⅰ 线性关系相同

线性无关 <3> 已证

设 Ⅱ 线性相关，由 $B=AP$ 得 $A=BP^{-1}$

$Ax=0$，则 $B(P^{-1}x)=0$，若 $P^{-1}x=0$，得 $PP^{-1}x=x=0$，又 $x\neq 0$

故 $P^{-1}x\neq 0$，即 Ⅰ 线性相关。

### (6) 一个向量可由其余向量表示

$\vec{\alpha}_1,\dots,\vec{\alpha}_s$ 线性相关 $\Leftrightarrow$ 组中至少有一个向量可用其余向量线性表示

### (7) 无关组添一个相关向量

$\vec{\alpha}_1,\dots,\vec{\alpha}_s$ 线性无关，$\vec{\alpha}_1,\dots,\vec{\alpha}_s,\vec{\beta}$ 线性相关

则 $\vec{\beta}$ 可由 $\vec{\alpha}_1,\dots,\vec{\alpha}_s$ 线性表示且方法唯一

$$
\sum_{i=1}^{s}k_i\vec{\alpha}_i+k\vec{\beta}=0
$$

可知 $k_i$，$k$ 不全为 0

若 $k=0$，则 $k_i$ 不全为 0，$\sum_{i=1}^{s}k_i\vec{\alpha}_i=0$ 矛盾，故 $k\neq 0$

则 $\vec{\beta}=\sum_{i=1}^{s}\left(-\frac{k_i}{k}\right)\vec{\alpha}_i$，令 $A=[\vec{\alpha}_1\ \cdots\ \vec{\alpha}_s]$

则 $\vec{\beta}=Ax$，又 $r(A)=s$，故 $x$ 只有唯一解。

### (8) 部分相关则整体相关

<1> 部分线性相关 $\Rightarrow$ 整体线性相关

整体线性无关 $\Rightarrow$ 部分线性无关

<2> 含 0 向量的向量组必线性相关

线性无关的向量组不含 0 向量

### (9) 增加分量不改变无关性

一个向量组线性无关，相同位置增加分量仍无关

一个向量组线性相关，相同位置减掉分量仍相关

## 4.3 向量组的秩

### 1\. 极大无关组

极大无关组：若向量组 $U$ 有一个部分组 $\vec{\alpha}_1,\dots,\vec{\alpha}_r$ 满足 (1) $\vec{\alpha}_1,\dots,\vec{\alpha}_r$ 线性无关，(2) $U$ 中任意向量 $\vec{\alpha}$ 都可由 $\vec{\alpha}_1,\dots,\vec{\alpha}_r$ 线性表示，则称 $\vec{\alpha}_1,\dots,\vec{\alpha}_r$ 为向量组 $U$ 的一个极大无关组

“极大”表明 $\vec{\alpha}_1,\dots,\vec{\alpha}_r$ 再添入一个向量后变为线性相关（$\vec{\alpha}$ 可由 $\vec{\alpha}_1,\dots,\vec{\alpha}_r$ 线性表示，则 $\sum_{i=1}^{r}k_i\vec{\alpha}_i-\vec{\alpha}=0$，即 $\vec{\alpha}_1,\dots,\vec{\alpha}_r,\vec{\alpha}$ 线性相关）

求一个向量组的极大无关组可将 $[\vec{\alpha}_1\ \vec{\alpha}_2\ \cdots\ \vec{\alpha}_n]$ 化成阶梯形矩阵，则所有首非零元所在的向量构成一个极大无关组，这是由于将所有首非零元所在向量提取后组成矩阵 $[\vec{\alpha}_1\ \cdots\ \vec{\alpha}_r]$，则一定列满秩，即线性无关，将任一向量放于右侧得 $[\vec{\alpha}_1\ \cdots\ \vec{\alpha}_r\ \vdots\ \vec{\alpha}]$，其秩一定不超过 $[\vec{\alpha}_1\ \cdots\ \vec{\alpha}_r]$ 的秩，即可线性表示，这个过程也可得到极大无关组的个数即为矩阵的秩，个数是唯一的。

极大无关组有如下性质

1. 极大无关组不唯一

2. 向量组与任意极大无关组等价

   任意两个极大无关组等价

3. 极大无关组所含向量个数相同

4. 零向量构成的向量组不含极大无关组

   任意非零向量组必有极大无关组

5. $n$ 维向量组 $\vec{\alpha}_1,\dots,\vec{\alpha}_n$ 线性无关，则为 $R^n$ 的一个极大无关组

### 2\. 向量组的秩

向量组的秩：向量组的极大无关组所含向量个数即为向量组的秩，仅含零向量的向量组秩为 0

$$
r(A)=A\ \text{的列秩}=A\ \text{的行秩}
$$

### 3\. 线性表示的个数关系

(Ⅰ) $\vec{\alpha}_1,\dots,\vec{\alpha}_s$ 可由 (Ⅱ) $\vec{\beta}_1,\dots,\vec{\beta}_r$ 线性表示，则

(1) $s>r$ 时 (Ⅰ) 线性相关

(2) (Ⅰ) 线性无关，$s\leq r$

证 由题 $A=BC_{rs}$，又 $C_{rs}x=0$ 为 $BC_{rs}x=0$ 即 $Ax=0$ 的解，又 $s>r$，故 $C_{rs}x=0$ 有非 0 解，即 $Ax=0$ 有非 0 解，即 (Ⅰ) 线性相关。(2) 为 (1) 的逆否命题。

### 4\. 等价的线性无关组所含向量个数相同

### 5\. 线性表示的秩不等式

(Ⅰ) 可由 (Ⅱ) 线性表示，$r(\text{Ⅰ})\leq r(\text{Ⅱ})$

(Ⅰ) 与 (Ⅱ) 等价，$r(\text{Ⅰ})=r(\text{Ⅱ})$

证 设 Ⅰ、Ⅱ 的极大无关组为 Ⅰ′、Ⅱ′，则 Ⅰ′ 可由 Ⅰ 线性表示，Ⅰ 可由 Ⅱ 线性表示，Ⅱ 可由 Ⅱ′ 线性表示，则 Ⅰ′ 可由 Ⅱ′ 线性表示，又 Ⅰ′ 线性无关，则 $r(\text{Ⅰ}')\leq r(\text{Ⅱ}')$，即 $r(\text{Ⅰ})\leq r(\text{Ⅱ})$。

### 6\. 矩阵和的秩不等式

$r(A+B)\leq r(A)+r(B)$

$$
r(AB)\leq\min\{r(A),r(B)\}
$$

$A$、$B$ 为方阵

证 (1) 设 $A$ 的列向量组的极大无关组为 $\vec{\alpha}_1,\dots,\vec{\alpha}_r$（$r(A)=r$），$B$ 的列向量组的极大无关组为 $\vec{\beta}_1,\dots,\vec{\beta}_s$（$r(B)=s$），则 $A+B$ 的列向量组的向量可由 $\vec{\alpha}_1,\dots,\vec{\alpha}_r$，$\vec{\beta}_1,\dots,\vec{\beta}_s$ 表示

$$
\begin{aligned}
r(A+B)&\leq r([\vec{\alpha}_1\ \cdots\ \vec{\alpha}_r,\vec{\beta}_1\ \cdots\ \vec{\beta}_s])\\
&\leq r+s=r(A)+r(B)
\end{aligned}
$$

(2) 由对称性，只需证 $r(AB)\leq r(A)$ 即得 $r(AB)\leq r(B)$

这是由于 $r(AB)=r(B^{T}A^{T})\leq r(B^{T})=r(B)$

矩阵 $AB$ 的第 $j$ 列为 $A[b_{1j}\ b_{2j}\ \cdots\ b_{nj}]^{T}$

$$
=b_{1j}\vec{\alpha}_1+b_{2j}\vec{\alpha}_2+\cdots+b_{nj}\vec{\alpha}_n
$$

则 $AB$ 的列向量组可由 $A$ 的列向量组线性表示，则 $r(AB)\leq r(A)$

## 4.4 线性方程组解的结构

### 1\. 基础解系

基础解系：若 $Ax=0$ 的一组解向量 $\vec{\xi}_1,\dots,\vec{\xi}_r$ 满足 (1) $\vec{\xi}_1,\dots,\vec{\xi}_r$ 线性无关，(2) 任一解可由 $\vec{\xi}_1,\dots,\vec{\xi}_r$ 线性表示，则 $\vec{\xi}_1,\dots,\vec{\xi}_r$ 为 $Ax=0$ 的一个基础解系

### 2\. 基础解系所含向量个数

设 $A_{m\times n}$，$r(A)=r<n$，则 $Ax=0$ 的基础解系含 $n-r$ 个向量，且任意 $n-r$ 个线性无关的向量都可作为基础解系

将 $A$ 化为简化行阶梯形矩阵，则将所有非主元的列通过移项到等号右边，这样非主元的未知数成为自由变量。假设一种情况，$A\simeq\begin{bmatrix}I&F\end{bmatrix}$，则化为 $x=\begin{bmatrix}-F\\I\end{bmatrix}$，下面为

单位矩阵，则线性无关，因而求得了一组基础解系

由于 $A$ 的秩固定，则基础解系的个数 $n-r$ 固定，对任意 $n-r$ 个解向量线性无关，则 $n-r+1$ 个解向量线性相关，则加上的 1 个向量可由 $n-r$ 个线性无关的向量线性表出，即得

### 3\. 非齐次方程组解的结构

$Ax=b$ 的任意一解 $x$ 可表示为

$$
x=\eta^{*}+\xi
$$

其中 $\eta^{*}$ 为 $Ax=b$ 的一个特解，$\xi$ 为 $Ax=0$ 的任一解

此即 $Ax=0$ 的所有解加上 $Ax=b$ 的一个特解即得 $Ax=b$ 的所有解。设 $A\eta^{*}=b$，$\eta^{*}$ 为特解，则对所有解 $x$，$Ax-A\eta^{*}=b-b$

即 $A(x-\eta^{*})=0$，即 $x-\eta^{*}$ 是 $Ax=0$ 的解。

又对 $Ax=0$ 的任一解 $\xi$，$A\eta^{*}+A\xi=b$，即 $A(\xi+\eta^{*})=b$。

即 $\eta^{*}+\xi$ 是 $Ax=b$ 的解。即得。

### 4\. 乘积为零矩阵的秩不等式

$A_{m\times n}$，$B_{n\times p}$，$AB=0$ 则 $r(A)+r(B)\leq n$

显然 $B$ 中每一列都是 $Ax=0$ 解，则 $B$ 的秩不能超过 $Ax=0$ 的基础解系的秩，即 $r(B)\leq n-r(A)$，即 $r(A)+r(B)\leq n$。

### 5\. 同解方程组的秩相等

$Ax=0$ 与 $Bx=0$ 同解，则 $r(A)=r(B)$

注意到同解则 $A$、$B$ 列数相同，行数不一定相同

同解则基础解系相同，则 $n-r(A)=n-r(B)$，故 $r(A)=r(B)$

### 6\. 方程组与其转置之积同解

实数范围内 $Ax=0$ 与 $A^{T}Ax=0$ 同解

(2) $r(A)=r(A^{T}A)=r(A^{T})=r(AA^{T})$

$Ax=0\Rightarrow A^{T}(Ax)=0$ 故 $Ax=0$ 的解是 $A^{T}Ax=0$ 的解。

$A^{T}Ax=0\Rightarrow x^{T}A^{T}Ax=0$ 即 $(Ax)^{T}Ax=0$ 注意到 $Ax$ 得到的是列向量，故 $(Ax)^{T}Ax$ 得到的是 $Ax$ 的所有元素的平方和，平方和等于 $0$，各元素都为 $0$，即 $Ax=0$。即得证。

(2) 由 (1) 可得 $r(A)=r(A^{T}A)$，将 $A$ 换为 $A^{T}$，则 $r(A^{T})=r((A^{T})^{T}A^{T})=r(AA^{T})$，又 $r(A)=r(A^{T})$，故 $r(A)=r(A^{T}A)=r(AA^{T})=r(A^{T})$。

### 7\. 伴随矩阵的秩

设 $A$ 为 $n$ 阶方阵（$n\geq 2$）

$$
r(A^{*})=
\begin{cases}
n, & r(A)=n\\
1, & r(A)=n-1\\
0, & r(A)\leq n-2
\end{cases}
$$

证 当 $r(A)=n$，则 $\lvert A\rvert\neq 0$，又 $\lvert A^{*}\rvert=\lvert A\rvert^{n-1}$，则 $\lvert A^{*}\rvert\neq 0$，故 $r(A^{*})=n$

当 $r(A)\leq n-2$，又 $A^{*}$ 的元素是 $A$ 的 $n-1$ 阶子式，全为 $0$，故 $A^{*}=0$，$r(A^{*})=0$

当 $r(A)=n-1$，由 $A^{*}A=\lvert A\rvert I=0$，由 4 得 $r(A^{*})+r(A)\leq n$

即 $r(A^{*})\leq 1$，又 $r(A)=n-1$，则 $A$ 的 $n-1$ 阶子式不全为 $0$，

则 $A^{*}\neq 0$，故 $r(A^{*})\neq 0$，故 $r(A^{*})=1$。
