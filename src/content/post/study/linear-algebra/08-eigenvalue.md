---
title: "特征值与矩阵对角化"
publishDate: "2026-11-20"
description: "特征值与特征向量的定义和求法，特征多项式与重数，相似矩阵的性质与可对角化的条件，实对称矩阵特征向量的正交性与可对角化证明。"
seriesId: linear-algebra
orderInSeries: 8
tags: ["学习", "线性代数", "笔记", "特征值"]
---

## 6.1 矩阵的特征值与特征向量

### 1\. 特征值与特征向量

设 $A_{n\times n}$ 若 $\exists\lambda\in\mathbb{C}$ 及非零列向量 $x\in\mathbb{C}^n$ 有 $Ax=\lambda x$ 则称 $\lambda$ 为 $A$ 的一个特征值，$x$ 为 $A$ 对应于 $\lambda$ 的特征向量

### 2\. 特征方程与特征多项式

特征方程：$\lvert A-\lambda I\rvert=0$

特征多项式：$f(\lambda)=\lvert A-\lambda I\rvert$

特征空间：记作 $V_\lambda$，$(A-\lambda I)x=0$ 的解空间

代数重数：$\lambda_i$ 是 $\lvert A-\lambda I\rvert=0$ 的几重根

几何重数：$(A-\lambda_i I)x=0$ 解空间的维数

求特征值与特征向量

1. 由 $Ax=\lambda x$ 得 $(A-\lambda I)x=0$ 有非零解

   故先求 $\lvert A-\lambda I\rvert=0$ 的所有解

2. 对一个 $\lambda_i$ 求 $(A-\lambda_i I)x=0$ 的基础解系

### 3\. 特征值的和与积

设 $A_{n\times n}$ 的全部特征值为 $\lambda_1\cdots\lambda_n$ 则

(1) $\lambda_1\lambda_2\cdots\lambda_n=\lvert A\rvert$

(2) $\lambda_1+\lambda_2+\cdots+\lambda_n=\operatorname{tr}(A)$

证　由 $\lvert A+\lambda I\rvert=0$ 的 $n$ 个根为 $\lambda_1\cdots\lambda_n$ 知，且最高次为 $n$ 次

$$
\begin{aligned}
\lvert\lambda I-A\rvert&=(\lambda-\lambda_1)(\lambda-\lambda_2)\cdots(\lambda-\lambda_n)\\
&=\lambda^n-(\lambda_1+\cdots+\lambda_n)\lambda^{n-1}+\cdots+(-1)^n\lambda_1\cdots\lambda_n
\end{aligned}
$$

又可证

$$
\lvert\lambda I-A\rvert=\lambda^n-(a_{11}+\cdots+a_{nn})\lambda^{n-1}+\cdots+(-1)^n\lvert A\rvert
$$

故 $\lambda_1\cdots\lambda_n=\lvert A\rvert$，$\lambda_1+\cdots+\lambda_n=\operatorname{tr}(A)$

### 4\. 转置、逆与多项式的特征值

设 $x$ 为 $A$ 对应特征值 $\lambda$ 的特征向量（暂且记为 $A\to\lambda\to x$）

#### (1) 转置

(1) $A^{T}\to\lambda\to y$

证 (1) $\lvert A-\lambda I\rvert=0\Leftrightarrow\lvert(A-\lambda I)^{T}\rvert=0\Leftrightarrow\lvert A^{T}-\lambda I\rvert=0$

即 $\lambda$ 是 A 的特征值，则 $\lambda$ 也为 $A^{T}$ 的特征值，反之一样

但注意特征向量不一样.

#### (2) 逆与伴随

(2) $A^{-1}\to\frac{1}{\lambda}\to x$，$A^{*}\to\frac{\lvert A\rvert}{\lambda}\to x$

证 (2) $Ax=\lambda x$，则 $A^{-1}x=\frac{1}{\lambda}x$

即 $A^{-1}\to\frac{1}{\lambda}\to x$，注意 $\frac{1}{\lambda}$ 对应 $A^{-1}$ 的特征向量也为 $\lambda$ 对应 A 的.

$A^{-1}x=\frac{1}{\lambda}x$ 则 $\lvert A\rvert A^{-1}x=A^{*}x=\frac{\lvert A\rvert}{\lambda}x$

即 $A^{*}\to\frac{\lvert A\rvert}{\lambda}\to x$

#### (3) 幂与多项式

(3) $A^{m}\to\lambda^{m}\to x$，令 $f(x)=a_mx^m+a_{m-1}x^{m-1}+\cdots+a_1x+a_0$

$f(A)\to f(\lambda)\to x$

证 (3) $Ax=\lambda x$，$A^{2}x=A(\lambda x)=\lambda(Ax)=\lambda(\lambda x)=\lambda^{2}x$，

$A^{3}x=A(A^{2}x)=A(\lambda^{2}x)=\lambda^{2}(Ax)=\lambda^{2}(\lambda x)=\lambda^{3}x\cdots$

得 $A^{m}x=\lambda^{m}x$

即 $A^{m}\to\lambda^{m}\to x$，特征向量相同

将上述结果乘系数相加得 $f(A)\to f(\lambda)\to x$.

### 5\. 不同特征值的特征向量线性无关

设 $\lambda_1,\lambda_2\cdots\lambda_m$ 是 A 的互不相同特征值，对应的基础解系分别为 $\alpha_{11},\alpha_{12}\cdots\alpha_{1k_1}$；$\alpha_{21},\alpha_{22}\cdots\alpha_{2k_2}$；$\cdots\cdots$；$\alpha_{m1}\cdots\alpha_{mk_m}$

则 $\alpha_{11},\cdots\alpha_{1k_1}$；$\cdots\cdots$；$\alpha_{m1}\cdots\alpha_{mk_m}$ 线性无关.

证 先证从各基础解系中取一个得 $\alpha_1,\alpha_2\cdots\alpha_m$ 线性无关

设 $k_1\alpha_1+k_2\alpha_2+\cdots+k_m\alpha_m=0$

用 A 左乘得 $\lambda_1k_1\alpha_1+\lambda_2k_2\alpha_2+\cdots+\lambda_mk_m\alpha_m=0$

$\vdots$

得 $\lambda_1^{m}k_1\alpha_1+\lambda_2^{m}k_2\alpha_2+\cdots+\lambda_m^{m}k_m\alpha_m=0$

即

$$
[k_1\alpha_1\ k_2\alpha_2\ \cdots\ k_m\alpha_m]
\begin{bmatrix}
1&\lambda_1&\cdots&\lambda_1^{m}\\
1&\lambda_2&\cdots&\lambda_2^{m}\\
\vdots&\vdots&&\vdots\\
1&\lambda_m&\cdots&\lambda_m^{m}
\end{bmatrix}=0
$$

由此范德蒙德行列式不为 $0$，故 $[k_1\alpha_1\cdots k_m\alpha_m]=0$

即 $k_i\alpha_i=0$，又 $\alpha_i\neq 0$，则 $k_i=0$

即 $\alpha_1\cdots\alpha_m$ 线性无关

现就 $m=2$ 时进一步证明 $\alpha_{11}\cdots\alpha_{1k_1}$；$\alpha_{21}\cdots\alpha_{2k_2}$ 线性无关

设 $t_{11}\alpha_{11}+\cdots+t_{1k_1}\alpha_{1k_1}+t_{21}\alpha_{21}+\cdots+t_{2k_2}\alpha_{2k_2}=0$

1. 若 $t_{11}=\cdots=t_{1k_1}=0$，则由 $\alpha_{21}\cdots\alpha_{2k_2}$ 线性无关得

   $t_{21}=\cdots=t_{2k_2}=0$，故 $\alpha_{11},\cdots,\alpha_{1k_1}$；$\alpha_{21}\cdots\alpha_{2k_2}$ 线性无关

2. $t_{21}=\cdots=t_{2k_2}=0$ 与 1\. 一致

3. $t_{11}\cdots t_{1k_1}$；$t_{21}\cdots t_{2k_2}$ 中若存在不为 $0$ 的数

   则 $x_1=t_{11}\alpha_{11}+\cdots+t_{1k_1}\alpha_{1k_1}$

   $x_2=t_{21}\alpha_{21}+\cdots+t_{2k_2}\alpha_{2k_2}$

   得 $x_1$、$x_2$ 也是 A 对应 $\lambda_1$、$\lambda_2$ 的特征向量

   又由上文 $x_1$、$x_2$ 线性无关，这里导出 $x_1+x_2=0$ 矛盾

   故 $t_{11}=\cdots=t_{1k_1}=t_{21}=\cdots=t_{2k_2}=0$

   即 $\alpha_{11}\cdots\alpha_{1k_1}$；$\alpha_{21}\cdots\alpha_{2k_2}$ 线性无关.

### 6\. 几何重数不超过代数重数

任何特征值的几何重数 $\le$ 代数重数

证 设 $\dim V_{\lambda_1}=r$，取 $V_{\lambda_1}$ 的基 $\alpha_1\cdots\alpha_r$，扩充为 $C^{n}$ 的基 $\alpha_1\cdots\alpha_r,\alpha_{r+1}\cdots\alpha_n$ 令 $P=[\alpha_1\cdots\alpha_r\ \alpha_{r+1}\cdots\alpha_n]$

则 P 可逆且

$$
\begin{aligned}
P^{-1}AP&=P^{-1}[A\alpha_1\cdots A\alpha_r\ A\alpha_{r+1}\cdots A\alpha_n]\\
&=[\lambda_1P^{-1}\alpha_1\cdots\lambda_1P^{-1}\alpha_r\ P^{-1}A\alpha_{r+1}\cdots P^{-1}A\alpha_n]
\end{aligned}
$$

又 $I=P^{-1}P=[P^{-1}\alpha_1\cdots P^{-1}\alpha_r,\ P^{-1}\alpha_{r+1}\cdots P^{-1}\alpha_n]$

故 $P^{-1}\alpha_i=\varepsilon_i$，$i=1,\dots,r$.

故 $P^{-1}AP=[\lambda_1\varepsilon_1,\lambda_2\varepsilon_2\cdots\lambda_r\varepsilon_r,\ P^{-1}A\alpha_{r+1}\cdots P^{-1}A\alpha_n]$

可以改写为

$$
P^{-1}AP=
\begin{bmatrix}
\lambda_1I_r&B\\
0&C
\end{bmatrix}
$$

又相似矩阵具有相同的特征多项式（证：设 $B=M^{-1}AM$，

$Bx=\lambda x\Rightarrow (M^{-1}AM)x=\lambda x\Rightarrow A(Mx)=\lambda(Mx)$）

故

$$
\begin{aligned}
\lvert \lambda I-A\rvert&=
\begin{vmatrix}
\lambda I_r-\lambda_1I_r&-B\\
0&\lambda I_{n-r}-C
\end{vmatrix}\\
&=(\lambda-\lambda_1)^{r}\lvert \lambda I_{n-r}-C\rvert
\end{aligned}
$$

注意到 $\lvert \lambda I_{n-r}-C\rvert=0$ 可以有零次以外的解

故代数重数 $\ge$ 几何重数.

## 6.2 相似矩阵与对角化

### 1\. 相似与对角化的定义

A、B 都为 $n$ 阶方阵

相似：设存在 P 可逆使 $P^{-1}AP=B$ 则称 A 与 B 相似，记作 $A\sim B$

对角化：若 A 与对角矩阵相似，则称 A 可对角化

性质 (1) $A\sim B$ 则 $B\sim A$

(2) $A\sim B$，$B\sim C$ 则 $A\sim C$

(3) $A\sim A$

### 2\. 相似矩阵的性质

设 A 与 B 相似则

#### (1) 行列式相同

(1) $\lvert A\rvert=\lvert B\rvert$

证 (1) 由 $P^{-1}AP=B$ 得 $\lvert P^{-1}AP\rvert=\lvert P^{-1}\rvert\lvert A\rvert\lvert P\rvert=\lvert A\rvert\lvert P^{-1}P\rvert=\lvert A\rvert=\lvert B\rvert$.

#### (2) 秩相同

(2) $r(A)=r(B)$

证 (2) 由 $P^{-1}AP=B$ 得 A 与 B 等价，故 $r(A)=r(B)$

#### (3) 逆矩阵相似

(3) A、B 可逆，则 $A^{-1}$ 与 $B^{-1}$ 相似

证 (3) $P^{-1}AP=B$ 则 $(P^{-1}AP)^{-1}=P^{-1}A^{-1}P=B^{-1}$ 即 $A^{-1}$ 与 $B^{-1}$ 相似

#### (4) 特征多项式相同

(4) A、B 有相同的特征多项式.

证 (4) $\lvert \lambda I-A\rvert=\lvert P^{-1}\rvert\lvert \lambda I-A\rvert\lvert P\rvert=\lvert \lambda PP^{-1}-P^{-1}AP\rvert$

$=\lvert \lambda I-B\rvert$.

### 3\. 可对角化的条件

(1)（充要）有 $n$ 个线性无关的特征向量

(2)（充分）有 $n$ 个不同的特征值

(3)（充要）几何重数等于代数重数.

证 (1) 设 $P^{-1}AP=D$，D 为对角矩阵

则 $AP=PD$，记 $P=[x_1\cdots x_n]$

则 $AP=A[x_1\cdots x_n]=[Ax_1\cdots Ax_n]$

$$
=PD=[x_1\cdots x_n]
\begin{bmatrix}
\lambda_1&&\\
&\ddots&\\
&&\lambda_n
\end{bmatrix}
=[\lambda_1x_1\cdots\lambda_nx_n]
$$

故 $Ax_i=\lambda_i x_i$ 注意到 $x_i$ 是 $A$ 的特征值 $\lambda_i$ 对应特征向量

又 $P$ 可逆，则 $x_1\cdots x_n$ 线性无关.

(2) 当有 $n$ 个不同特征值，则每个特征值又对应 1 个特征向量，由定理 6.1.5 得，各特征向量线性无关，共 $n$ 个，满足条件(1)

(3) 由于需要有 $n$ 个线性无关特征向量，则几何重数之和应为 $n$，又代数重数之和为 $n$，几何重数 $\leqslant$ 代数重数，故各几何重数 $=$ 各代数重数

### 4\. 实对称矩阵的特征值均为实数

证 设 $x\in C^n,\lambda\in C,Ax=\lambda x$ 取共轭得 $A\bar{x}=\bar{\lambda}\bar{x}$

转置得 $\bar{x}^{T}A=\bar{\lambda}\bar{x}^{T}$ 用 $x$ 右乘得 $\bar{x}^{T}Ax=\bar{\lambda}\bar{x}^{T}x$

又 $Ax=\lambda x$ 故 $\lambda\bar{x}^{T}x=\bar{\lambda}\bar{x}^{T}x$ 即 $(\lambda-\bar{\lambda})\bar{x}^{T}x=0$

又

$$
\bar{x}^{T}x=(\bar{x}_1\ \cdots\ \bar{x}_n)\begin{bmatrix}x_1\\ \vdots\\ x_n\end{bmatrix}=\lvert x_1\rvert^2+\cdots+\lvert x_n\rvert^2>0
$$

故 $\lambda=\bar{\lambda}$ 即 $\lambda$ 为实数

### 7\. 实对称矩阵的相异特征值对应特征向量正交

证 设 $Ax_1=\lambda_1x_1$，$Ax_2=\lambda_2x_2$

由 $Ax_1=\lambda_1x_1$ 转置得 $x_1^{T}A^{T}=\lambda_1x_1^{T}=x_1^{T}A$

右乘 $x_2$ 得 $x_1^{T}Ax_2=\lambda_1x_1^{T}x_2$ 即 $\lambda_2x_1^{T}x_2=\lambda_1x_1^{T}x_2$

即 $(\lambda_2-\lambda_1)x_1^{T}x_2=0$ 又 $\lambda_1\neq\lambda_2$ 故 $x_1^{T}x_2=0$

即 $x_1,x_2$ 正交.

### 8\. 实对称矩阵必可对角化

证 设 $P_{n\times n}$ 用数学归纳法证 $n=1$ 时成立 设 $n=1$ 时成立

看 $n$ 阶的情况：

设 $A\to\lambda_1\to\alpha_1$，$\lVert\alpha_1\rVert=1$，将 $\alpha_1$ 扩充得 $R^n$ 标准正交基 $\alpha_1,\alpha_2\cdots\alpha_n$ 令 $P_1=[\alpha_1\ \alpha_2\ \cdots\ \alpha_n]$

则 $P_1$ 为正交矩阵 又 $A\alpha_1=\lambda_1\alpha_1$

故

$$
\begin{aligned}
AP_1&=[A\alpha_1\ A\alpha_2\ \cdots\ A\alpha_n]=[\lambda_1\alpha_1\ \cdots\ A\alpha_n]\\
&=[\alpha_1\ \cdots\ \alpha_n]
\begin{bmatrix}
\lambda_1&b_{12}&\cdots&b_{1n}\\
0&b_{22}&\cdots&b_{2n}\\
\vdots&\vdots&&\vdots\\
0&b_{n2}&\cdots&b_{nn}
\end{bmatrix}\\
&=P_1\begin{bmatrix}\lambda_1&\beta^{T}\\0&A_1\end{bmatrix}
\end{aligned}
$$

$\beta^{T}$ 为 $n-1$ 维行向量，$A_1$ 为 $(n-1)\times(n-1)$ 矩阵

用 $P_1^{T}$ 右乘，且 $P_1^{T}P_1=I$ 得

$$
A=P_1\begin{bmatrix}\lambda_1&\beta^{T}\\0&A_1\end{bmatrix}P_1^{T}
$$

转置，且 $A^{T}=A$ 得

$$
A=P_1\begin{bmatrix}\lambda_1&0\\\beta&A_1^{T}\end{bmatrix}P_1^{T}
$$

故 $\beta=0$，$A_1=A_1^{T}$ 由假设 $n-1$ 阶实对称矩阵可对角化

故

$$
P_2^{-1}A_1P_2=P_2^{T}A_1P_2=\operatorname{diag}(\lambda_2\cdots\lambda_n)
$$

令

$$
P=P_1\begin{bmatrix}1&0\\0&P_2\end{bmatrix}
$$

则 $P$ 正交（为 2 正交矩阵之积）

且

$$
\begin{aligned}
P^{T}AP&=\begin{bmatrix}1&0\\0&P_2^{T}\end{bmatrix}P_1^{T}AP_1\begin{bmatrix}1&0\\0&P_2\end{bmatrix}\\
&=\begin{bmatrix}1&0\\0&P_2^{T}\end{bmatrix}\begin{bmatrix}\lambda_1&0\\0&A_1\end{bmatrix}\begin{bmatrix}1&0\\0&P_2\end{bmatrix}\\
&=\begin{bmatrix}\lambda_1&0\\0&P_2^{T}A_1P_2\end{bmatrix}
\end{aligned}
$$

即 $A$ 可对角化 即证.
