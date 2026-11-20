---
title: "欧氏空间"
publishDate: "2026-11-20"
description: "欧氏空间的内积与柯西不等式，范数、夹角与距离，标准正交基与 Gram–Schmidt 正交化，正交矩阵与正交变换。"
seriesId: linear-algebra
orderInSeries: 6
tags: ["学习", "线性代数", "笔记", "欧氏空间"]
---

## 5.2 欧氏空间基本概念

### 1\. 内积与欧氏空间

在实线性空间 $V$ 中任意向量 $\alpha$、$\beta$ 指定一个实数记作 $\langle\alpha,\beta\rangle$ 与之对应，并满足

(1) $\langle\alpha,\beta\rangle=\langle\beta,\alpha\rangle$

(2) $\langle\alpha+\beta,\gamma\rangle=\langle\alpha,\gamma\rangle+\langle\beta,\gamma\rangle$

(3) $\langle k\alpha,\beta\rangle=k\langle\alpha,\beta\rangle$

(4) $\langle\alpha,\alpha\rangle\ge 0$ 且 $\langle\alpha,\alpha\rangle=0\Leftrightarrow\alpha=0$

其中 $\alpha,\beta,\gamma\in V$，$k\in R$，则称 $\langle\alpha,\beta\rangle$ 为 $\alpha,\beta$ 的内积。定义了内积的实线性空间称为欧氏空间

对 $R^{n}$，定义 $\langle\alpha,\beta\rangle=\alpha^{T}\beta$

对 $R^{n\times n}$，定义 $\langle A,B\rangle=\sum\limits_{i=1}^{n}\sum\limits_{j=1}^{n}a_{ij}b_{ij}$

对 $C[a,b]$，定义 $\langle f,g\rangle=\int_{a}^{b}f(x)g(x)\,dx$

### 2\. Cauchy-Schwarz 不等式

设 $\alpha$，$\beta$ 是欧氏空间 $V$ 中任意向量

则

$$
\lvert\langle\alpha,\beta\rangle\rvert\le\sqrt{\langle\alpha,\alpha\rangle}\sqrt{\langle\beta,\beta\rangle}
$$

当仅当 $\alpha$、$\beta$ 线性相关时等号成立

证 当 $\alpha$、$\beta$ 线性相关时，则设 $\alpha=k\beta$，则

$$
\begin{aligned}
\lvert\langle\alpha,\beta\rangle\rvert&=\lvert k\langle\alpha,\alpha\rangle\rvert=\lvert k\rvert\,\lvert\langle\alpha,\alpha\rangle\rvert\\
\text{而}\quad\sqrt{\langle\alpha,\alpha\rangle}\sqrt{\langle\beta,\beta\rangle}
&=\sqrt{\langle\alpha,\alpha\rangle}\sqrt{k^{2}\langle\alpha,\alpha\rangle}=\lvert k\rvert\,\lvert\langle\alpha,\alpha\rangle\rvert
\end{aligned}
$$

比较知相等

当 $\alpha,\beta$ 线性无关时 则 $t\alpha+\beta\ne 0$ 故 $\langle t\alpha+\beta,t\alpha+\beta\rangle>0$

即

$$
\langle\alpha,\alpha\rangle t^{2}+2\langle\alpha,\beta\rangle t+\langle\beta,\beta\rangle>0
$$

由 $\Delta<0$ 得

$$
4(\langle\alpha,\beta\rangle)^{2}<4\langle\alpha,\alpha\rangle\langle\beta,\beta\rangle
$$

故

$$
\lvert\langle\alpha,\beta\rangle\rvert<\sqrt{\langle\alpha,\alpha\rangle}\sqrt{\langle\beta,\beta\rangle}
$$

### 3\. 范数

定义 $\sqrt{\langle\alpha,\alpha\rangle}$ 为 $\alpha$ 的范数，记为 $\lVert\alpha\rVert$，有如下 4 个性质

(1) $\lVert\alpha\rVert\ge 0$，且 $\lVert\alpha\rVert=0\Leftrightarrow\alpha=0$

(2) $\lVert k\alpha\rVert=\lvert k\rvert\,\lVert\alpha\rVert$

(3) $\lVert\alpha+\beta\rVert\le\lVert\alpha\rVert+\lVert\beta\rVert$

证 (1)(2) 显然，下证 (3)

$$
\begin{aligned}
\lVert\alpha+\beta\rVert^{2}&=\langle\alpha+\beta,\alpha+\beta\rangle\\
&=\langle\alpha,\alpha\rangle+2\langle\alpha,\beta\rangle+\langle\beta,\beta\rangle\\
&=\lVert\alpha\rVert^{2}+\lVert\beta\rVert^{2}+2\langle\alpha,\beta\rangle
\end{aligned}
$$

而由 Cauchy-Schwarz 不等式知 $\langle\alpha,\beta\rangle\le\lVert\alpha\rVert\lVert\beta\rVert$

故

$$
\begin{aligned}
\lVert\alpha+\beta\rVert^{2}&\le\lVert\alpha\rVert^{2}+\lVert\beta\rVert^{2}+2\lVert\alpha\rVert\lVert\beta\rVert\\
&=(\lVert\alpha\rVert+\lVert\beta\rVert)^{2}
\end{aligned}
$$

即 $\lVert\alpha+\beta\rVert\le\lVert\alpha\rVert+\lVert\beta\rVert$（范数非负）

### 4\. 夹角

非零向量 $\alpha,\beta$ 的夹角规定为

$$
\varphi=\arccos\frac{\langle\alpha,\beta\rangle}{\lVert\alpha\rVert\lVert\beta\rVert}\qquad(0\le\varphi\le\pi)
$$

若 $\langle\alpha,\beta\rangle=0$，则定义 $\alpha,\beta$ 正交或互相垂直，记作 $\alpha\perp\beta$

### 5\. 距离

定义 $\lVert\alpha-\beta\rVert$ 为 $\alpha$ 与 $\beta$ 的距离，记作 $d(\alpha,\beta)$

即 $d(\alpha,\beta)=\lVert\alpha-\beta\rVert$

### 6\. 正交向量组必线性无关

证 设 $\alpha_1,\dots,\alpha_n$ 两两正交，则不含 $0$ 向量

设 $k_1\alpha_1+\cdots+k_n\alpha_n=0$，$k_i\in R$

$\forall i$，等式两端同乘 $\alpha_i$，得 $k_i\lVert\alpha_i\rVert^{2}=0$，故 $k_i=0$

则 $\alpha_1,\dots,\alpha_n$ 线性无关

标准正交基性质 设 $\alpha_1,\dots,\alpha_n$ 为 $n$ 维欧氏空间 $V$ 的一组标准正交基，$\alpha,\beta$ 为任意向量

设 $\alpha=k_1\alpha_1+\cdots+k_n\alpha_n$，$\beta=w_1\alpha_1+\cdots+w_n\alpha_n$

则

(1) $k_i=\langle\alpha,\alpha_i\rangle$

(2) $\langle\alpha,\beta\rangle=\sum\limits_{i=1}^{n}k_iw_i$

(3) $\lVert\alpha\rVert=\sqrt{k_1^{2}+\cdots+k_n^{2}}$

(4) $d(\alpha,\beta)=\sqrt{(k_1-w_1)^{2}+\cdots+(k_n-w_n)^{2}}$

证 (1)

$$
\begin{aligned}
\langle\alpha,\alpha_i\rangle&=k_1\langle\alpha_1,\alpha_i\rangle+k_2\langle\alpha_2,\alpha_i\rangle+\cdots+k_i\langle\alpha_i,\alpha_i\rangle\\
&\quad+\cdots+k_n\langle\alpha_n,\alpha_i\rangle\\
&=k_i\lVert\alpha_i\rVert^{2}=k_i
\end{aligned}
$$

由此可求出标准正交基下的坐标

(2)

$$
\begin{aligned}
\langle\alpha,\beta\rangle&=k_1\alpha_1(w_1\alpha_1+\cdots+w_n\alpha_n)+\cdots\\
&\quad+k_n\alpha_n(w_1\alpha_1+\cdots+w_n\alpha_n)\\
&=k_1w_1\lVert\alpha_1\rVert^{2}+k_2w_2\lVert\alpha_2\rVert^{2}+\cdots+k_nw_n\lVert\alpha_n\rVert^{2}\\
&=\sum\limits_{i=1}^{n}k_iw_i
\end{aligned}
$$

(3)(4) 由 (2) 立即得到.

### 7\. Gram-Schmidt 正交化方法

设 $\alpha_1, \alpha_2 \cdots \alpha_n$ 是 $n$ 维欧氏空间 $V$ 的一个基

则 $\beta_1=\alpha_1$

$\vdots$

$$
\begin{aligned}
\beta_n=\alpha_n&-\frac{\langle\alpha_n,\beta_1\rangle}{\langle\beta_1,\beta_1\rangle}\beta_1\\
&\quad-\frac{\langle\alpha_n,\beta_2\rangle}{\langle\beta_2,\beta_2\rangle}\beta_2-\cdots\\
&\quad-\frac{\langle\alpha_n,\beta_{n-1}\rangle}{\langle\beta_{n-1},\beta_{n-1}\rangle}\beta_{n-1}
\end{aligned}
$$

为 $V$ 的一个正交基

令 $e_i=\frac{\beta_i}{\lVert\beta_i\rVert}$ 则得到标准正交基

证　由于任意 $n$ 个正交的向量都可作为 $V$ 的基，我们期待的是由 $\alpha_1 \cdots \alpha_n$ 通过一种方法得到一组特定的正交基，因而我们不妨先令 $\beta_1=\alpha_1$，考虑先将 $\beta_1, \alpha_2$ 正交化得到 $\beta_1, \beta_2$，再将 $\beta_1, \beta_2, \alpha_3$ 正交化得到 $\beta_1, \beta_2, \beta_3 \cdots$ 以此类推

① 由 $\beta_1, \alpha_2$ 得 $\beta_2$　设 $\beta_2=\alpha_2+k\beta_1$，由 $\beta_2 \perp \beta_1$ 得

$$
\langle\alpha_2,\beta_1\rangle+k\langle\beta_1,\beta_1\rangle=0
$$

故 $k=-\frac{\langle\alpha_2,\beta_1\rangle}{\langle\beta_1,\beta_1\rangle}$

故 $\beta_2=\alpha_2-\frac{\langle\alpha_2,\beta_1\rangle}{\langle\beta_1,\beta_1\rangle}\beta_1$，注意到此式即为 $\alpha_2$ 减去 $\frac{\langle\alpha_2,\beta_1\rangle}{\langle\beta_1,\beta_1\rangle}\beta_1$ 即为 $\alpha_2$ 减去 $\alpha_2$ 在 $\beta_1$ 上的投影，自然得到与 $\beta_1$ 正交的 $\beta_2$

② 由 $\beta_1, \beta_2, \alpha_3$ 得 $\beta_3$　设 $\beta_3=\alpha_3+k_1\beta_1+k_2\beta_2$

由 $\beta_3 \perp \beta_2$ 且 $\beta_3 \perp \beta_1$ 得

$$
\begin{aligned}
\langle\alpha_3,\beta_2\rangle+k_2\langle\beta_2,\beta_2\rangle&=0\\
\langle\alpha_3,\beta_1\rangle+k_1\langle\beta_1,\beta_1\rangle&=0
\end{aligned}
$$

得 $k_2=-\frac{\langle\alpha_3,\beta_2\rangle}{\langle\beta_2,\beta_2\rangle}$，$k_1=-\frac{\langle\alpha_3,\beta_1\rangle}{\langle\beta_1,\beta_1\rangle}$

即 $\beta_3=\alpha_3-\frac{\langle\alpha_3,\beta_1\rangle}{\langle\beta_1,\beta_1\rangle}\beta_1-\frac{\langle\alpha_3,\beta_2\rangle}{\langle\beta_2,\beta_2\rangle}\beta_2$

注意到此即 $\alpha_3$ 减去 $\alpha_3$ 在 $\beta_1$ 的投影与 $\alpha_3$ 在 $\beta_2$ 投影的和，由立体几何的结论可得自然是正交的

由上面可得 由 $\beta_1, \beta_2 \cdots \beta_{n-1}, \alpha_n$ 推 $\beta_n$，则 $\beta_n$ 即为 $\alpha_n$ 减去 $\alpha_n$ 在各个 $\beta_i$ 上的投影，即

$$
\begin{aligned}
\beta_n=\alpha_n&-\frac{\langle\alpha_n,\beta_1\rangle}{\langle\beta_1,\beta_1\rangle}\beta_1-\cdots\\
&\quad-\frac{\langle\alpha_n,\beta_{n-1}\rangle}{\langle\beta_{n-1},\beta_{n-1}\rangle}\beta_{n-1}
\end{aligned}
$$

下面我们证明上式，设 $\beta_n$ 为上式，即证 $\beta_n$ 与 $\beta_1, \beta_2 \cdots \beta_{n-1}$ 正交

### 8\. 正交矩阵

若实方阵 $A$ 满足 $A^{T}A=AA^{T}=I$（或 $A^{-1}=A^{T}$），则称 $A$ 为正交矩阵。有如下简单性质

#### (1) 行列式

(1) $\lvert A\rvert=\pm 1$

证　(1) $A^{T}A=I \Rightarrow \lvert A^{T}\rvert\lvert A\rvert=\lvert I\rvert \Rightarrow \lvert A\rvert^{2}=1 \Rightarrow \lvert A\rvert=\pm 1$

#### (2) 转置、逆与伴随

(2) $A^{T}$、$A^{-1}$、$A^{*}$ 均为正交矩阵

证　(2)

$$
\begin{aligned}
A^{T}(A^{T})^{T}&=A^{T}A=I\\
A^{-1}(A^{-1})^{T}&=A^{-1}(A^{T})^{-1}\\
&=(A^{T}A)^{-1}=I^{-1}=I\\
A^{*}(A^{*})^{T}&=A^{*}(A^{T})^{*}=(A^{T}A)^{*}=I^{*}=I
\end{aligned}
$$

#### (3) 乘积

(3) $A$、$B$ 为同阶正交矩阵，则 $AB$ 也为正交矩阵

证　(3) $AB(AB)^{T}=ABB^{T}A^{T}=AA^{T}=I$

### 9\. 正交矩阵的列向量刻画

实方阵 $A$ 为正交矩阵 $\Leftrightarrow$ $A$ 的列（行）向量组为标准正交向量组

证　将 $A$ 按列划分，由 $A^{T}A=I$ 得

$$
\begin{bmatrix}\alpha_1^{T}\\\alpha_2^{T}\\\vdots\\\alpha_n^{T}\end{bmatrix}
[\alpha_1\ \alpha_2\ \cdots\ \alpha_n]=
\begin{bmatrix}1&&&\\&1&&\\&&\ddots&\\&&&1\end{bmatrix}
$$

即

$$
\alpha_i^{T}\alpha_j=
\begin{cases}
1,&i=j\\
0,&i\neq j
\end{cases}
$$

又 $\alpha_i^{T}\alpha_j=\langle\alpha_i,\alpha_j\rangle$

此即 $\alpha_1 \cdots \alpha_n$ 正交，即证。

### 10\. 正交变换及其性质

设 $P$ 为 $n$ 阶正交矩阵，对 $x \in R^{n}$，称 $R^{n}$ 到 $R^{n}$ 的线性变换 $T$：$T(x)=Px$ 为 $R^{n}$ 上的正交变换，有如下性质

(1) $\langle Px_1,Px_2\rangle=\langle x_1,x_2\rangle$

(2) $\lVert Px_1\rVert=\lVert x_1\rVert$

由上知正交变换是一种等距变换

证　(1)

$$
\begin{aligned}
\langle Px_1,Px_2\rangle&=(Px_1)^{T}(Px_2)=x_1^{T}P^{T}Px_2=x_1^{T}x_2\\
&=\langle x_1,x_2\rangle
\end{aligned}
$$

(2) 由 (1) 易得
