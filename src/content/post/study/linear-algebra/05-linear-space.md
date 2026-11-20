---
title: "线性空间"
publishDate: "2026-11-20"
description: "线性空间的定义与八条运算律，子空间与生成空间，基、维数与坐标，过渡矩阵与坐标变换，子空间的和、直和与维数公式。"
seriesId: linear-algebra
orderInSeries: 5
tags: ["学习", "线性代数", "笔记", "线性空间"]
---

## 5.1 线性空间基本概念

### 1\. 线性空间的定义

线性空间：在数域 $F$ 上有一个非空集合 $V$，在 $V$ 的元素之间定义加法，在 $F$ 与 $V$ 元素之间定义数乘，使加法与数乘运算对 $V$ 封闭

且满足以下运算定律

(1) $\alpha+\beta=\beta+\alpha$

(2) $(\alpha+\beta)+\gamma=\alpha+(\beta+\gamma)$

(3) $V$ 中存在零元素，记为 $0$，使 $\alpha+0=\alpha$

(4) 任意元素 $\alpha$ 存在负元素 $-\alpha$，使 $\alpha+(-\alpha)=0$（零元素）

(5) $1\alpha=\alpha$

(6) $k(l\alpha)=(kl)\alpha$

(7) $k(\alpha+\beta)=k\alpha+k\beta$

(8) $(k+l)\alpha=k\alpha+l\alpha$

线性空间也称向量空间，元素称为向量。

例 在 $R^{+}$ 上定义线性空间，加法定义为 $\alpha+\beta=\alpha\beta$

数乘定义为 $k\alpha=\alpha^{k}$。验证其为线性空间

由 $\alpha+\beta=\alpha\beta\in R^{+}$，$k\alpha=\alpha^{k}\in R^{+}$ 知线性空间对加法与数乘封闭，下面只验证算律。

(1) $\alpha+\beta=\alpha\beta$，$\beta+\alpha=\beta\alpha=\alpha\beta$，故 $\alpha+\beta=\beta+\alpha$

(2) $(\alpha+\beta)+\gamma=(\alpha+\beta)\gamma=\alpha\beta\gamma$，$\alpha+(\beta+\gamma)=\alpha(\beta\gamma)=\alpha\beta\gamma$，故 $(\alpha+\beta)+\gamma=\alpha+(\beta+\gamma)$

(3) 零元素存在，为 $1$，$\forall\alpha\in R^{+}$，$\alpha+1=\alpha\cdot 1=\alpha$

(4) $\forall\alpha$，$(-\alpha)=\frac{1}{\alpha}\in R^{+}$，$\alpha+(-\alpha)=\alpha+\frac{1}{\alpha}=\alpha\cdot\frac{1}{\alpha}=1$，$1$ 为零元。

(5) $1\cdot\alpha=\alpha^{1}=\alpha$

(6) $k(l\alpha)=(l\alpha)^{k}=(\alpha^{l})^{k}=\alpha^{kl}$

$(kl)\alpha=\alpha^{kl}$ 故 $k(l\alpha)=(kl)\alpha$

(7) $k(\alpha+\beta)=k\cdot\alpha\beta=(\alpha\beta)^{k}=\alpha^{k}\beta^{k}$

$k\alpha+k\beta=\alpha^{k}+\beta^{k}=\alpha^{k}\cdot\beta^{k}=\alpha^{k}\beta^{k}$

故 $k(\alpha+\beta)=k\alpha+k\beta$

(8) $(k+l)\alpha=\alpha^{k+l}=\alpha^{k}\cdot\alpha^{l}=\alpha^{k}+\alpha^{l}=k\alpha+l\alpha$

注：此线性空间 $V$ 的元素全体构成 $R^{+}$。

### 2\. 线性空间的性质

1. 零元唯一

2. 元素的负元素唯一

3. $0\alpha=0$（零元素），$(-1)\alpha=-\alpha$，$k0=0$

4. $k\alpha=0\Leftrightarrow k=0$ 或 $\alpha=0$（零元素）


证 1\. $0_1+0_2=0_1$，$0_1+0_2=0_2$ 故 $0_1=0_2$

2\. 设 $\alpha+\beta=0$，$\alpha+\gamma=0$

则 $\beta=\beta+0=\beta+\alpha+\gamma=\alpha+\beta+\gamma=0+\gamma=\gamma$

3\. $\alpha+0\alpha=(1+0)\alpha=\alpha$，得 $0\alpha=0$

$\alpha+(-1)\alpha=(1-1)\alpha=0\alpha=0$ 故 $(-1)\alpha=-\alpha$

$k0=k[\alpha+(-1)\alpha]=k\alpha+(-k)\alpha=[k-k]\alpha=0\alpha=0$

4\. 若 $k=0$，则 $k\alpha=0$

若 $k\neq 0$ 则 $k^{-1}(k\alpha)=k^{-1}0=0$

$k^{-1}(k\alpha)=(k^{-1}k)\alpha=\alpha$

故 $\alpha=0$。

可由上题所讲到的线性空间验证（$\alpha+\beta=\alpha\beta$，$k\alpha=\alpha^{k}$）。

1. 零元唯一，为 $1$

2. 负元唯一，为 $\frac{1}{\alpha}$

3. $0\alpha=\alpha^{0}=1$，$(-1)\alpha=\alpha^{-1}=\frac{1}{\alpha}=(-\alpha)$

   $k\cdot 0=k\cdot 1=1^{k}=1=0$

4. $k\alpha=0$ 即 $\alpha^{k}=1$，故 $k=0$ 或 $\alpha=1$

### 3\. 子空间

子空间：设 $W$ 为线性空间 $V$ 的一个非空子集，若 $W$ 按照 $V$ 的线性运算也构成一个线性空间，则 $W$ 为 $V$ 的一个子空间

$W$ 为 $V$ 的子空间 $\Leftrightarrow$ $W$ 对 $V$ 的线性运算封闭

单个 $0$ 向量构成的线性空间为 $V$ 的子空间，称为零空间。

$\operatorname{span}\{\alpha_1,\dots,\alpha_m\}=\{k_1\alpha_1+\cdots+k_m\alpha_m\mid k_i\in F,\ i=1,2,\dots,m\}$

为 $\alpha_1,\alpha_2,\dots,\alpha_m$ 生成的 $V$ 的子空间。

$W$ 的 $0$ 元素也为 $V$ 中的零元素，$\alpha\in W$，$-\alpha\in W$，$\alpha+(-\alpha)=0_W$

又 $\alpha\in V$，$(-\alpha)\in V$，$\alpha+(-\alpha)=0_V$，故 $0_W=0_V$。

### 4\. 基

在线性空间中存在 $\alpha_1\ \cdots\ \alpha_m$ 满足

(1) $\alpha_1\ \cdots\ \alpha_m$ 线性无关

(2) $\forall\alpha$，$\alpha$ 可由 $\alpha_1\ \cdots\ \alpha_m$ 线性表示

则 $\alpha_1\ \cdots\ \alpha_m$ 为线性空间的基

维数：基中向量个数 $m$

坐标：$\forall\alpha$，$\alpha=k_1\alpha_1+k_2\alpha_2+\cdots+k_m\alpha_m$，则

$(k_1,k_2,\cdots,k_n)^{T}$ 为 $\alpha$ 在基下的坐标

说明：

(1) 基不唯一，但基中向量个数确定

(2) $n$ 维线性空间中任意 $n$ 个线性无关的向量可作为线性空间的基

(3) $\alpha$ 由基的表示唯一

(4) $V=\operatorname{span}\{\alpha_1\ \cdots\ \alpha_m\}$

### 5\. 过渡矩阵

设 $\alpha_1\ \cdots\ \alpha_n$ 与 $\beta_1\ \cdots\ \beta_n$ 为 $V$ 的两组基，则 $\beta_i$ 可由 $\alpha_i$ 线性表示

$$
\begin{aligned}
\beta_1&=a_{11}\alpha_1+a_{21}\alpha_2+\cdots+a_{n1}\alpha_n\\
\beta_2&=a_{12}\alpha_1+a_{22}\alpha_2+\cdots+a_{n2}\alpha_n\\
&\ \ \vdots\\
\beta_n&=a_{1n}\alpha_1+a_{2n}\alpha_2+\cdots+a_{nn}\alpha_n
\end{aligned}
$$

即

$$
[\beta_1\ \cdots\ \beta_n]=[\alpha_1\ \cdots\ \alpha_n]
\begin{bmatrix}
a_{11}&a_{12}&\cdots&a_{1n}\\
a_{21}&a_{22}&\cdots&a_{2n}\\
\vdots&\vdots&&\vdots\\
a_{n1}&a_{n2}&\cdots&a_{nn}
\end{bmatrix}
$$

此方阵即为过渡矩阵，$[\beta_1\ \cdots\ \beta_n]=[\alpha_1\ \cdots\ \alpha_n]A$

此为基变换公式

坐标变换公式 $\alpha_1\ \cdots\ \alpha_n$ 下坐标 $x$，$\beta_1\ \cdots\ \beta_n$ 下坐标 $y$

$$
[\beta_1\ \cdots\ \beta_n]=[\alpha_1\ \cdots\ \alpha_n]A
$$

则 $y=A^{-1}x$

已知 $\alpha_1\ \cdots\ \alpha_n$ 与 $\beta_1\ \cdots\ \beta_n$，求 $\alpha_1\ \cdots\ \alpha_n$ 到 $\beta_1\ \cdots\ \beta_n$ 的过渡矩阵

即求 $\beta_1\ \cdots\ \beta_n$ 如何用 $\alpha_1\ \cdots\ \alpha_n$ 线性表示，单独求出 $\beta_1\ \cdots\ \beta_n$ 用 $\alpha_1\ \cdots\ \alpha_n$ 线性表示的系数，即为过渡矩阵的每一列

设 $\alpha\in V$，$\alpha=[\alpha_1\ \cdots\ \alpha_n]x=[\beta_1\ \cdots\ \beta_n]y$

又 $[\beta_1\ \cdots\ \beta_n]=[\alpha_1\ \cdots\ \alpha_n]A$

故 $\alpha=[\alpha_1\ \cdots\ \alpha_n]Ay$，即 $x=Ay$，$y=A^{-1}x$

### 6\. 同构

设 $V_1$ 与 $V_2$ 为数域 $F$ 上的线性空间，$f$ 为 $V_1$ 到 $V_2$ 的一个映射

若

(1) $f$ 是 $V_1$ 到 $V_2$ 的双射（一一映射）

(2) $\forall\alpha,\beta\in V_1$，$f(\alpha+\beta)=f(\alpha)+f(\beta)$

(3) $\forall\alpha\in V_1$，$k\in F$，$f(k\alpha)=kf(\alpha)$

则 $f$ 为同构映射，$V_1$ 与 $V_2$ 同构

### 7\. 同构性质

(1) $f(0_1)=0_2$，$0_1\in V_1$，$0_2\in V_2$

(2) $\forall\alpha\in V_1$，$f(-\alpha)=-f(\alpha)$

(3) $\forall\alpha_i\in V_1$，$k_i\in F$

$$
f\left(\sum_{i=1}^{m}k_i\alpha_i\right)=\sum_{i=1}^{m}k_if(\alpha_i)
$$

(4) $\alpha_1\ \cdots\ \alpha_m$ 的像 $f(\alpha_1)\ \cdots\ f(\alpha_m)$ 线性关系一致

(5) $V_1$ 与 $V_1$ 同构

$V_1$ 与 $V_2$ 同构，则 $V_2$ 与 $V_1$ 同构

$V_1$ 与 $V_2$ 同构，$V_2$ 与 $V_3$ 同构，则 $V_1$ 与 $V_3$ 同构

(6) 同构 $\Leftrightarrow$ 维数相同

### 8\. 扩充原理

设 $\alpha_1,\alpha_2\ \cdots\ \alpha_r$ 是 $n$ 维线性空间 $V$ 中的一个线性无关向量组，$r<n$，则扩充可得 $V$ 的基

证 由前得 $V$ 与 $F^n$ 同构，取 $V$ 的一组基 $e_1\ \cdots\ e_n$，设 $\alpha_i$ 在这组基下坐标为 $x_i$，由 $\alpha_1\ \cdots\ \alpha_r$ 线性无关，得 $x_1\ \cdots\ x_r$ 线性无关，下面证明 $x_1\ \cdots\ x_r$ 可扩充为 $F^n$ 的基

设 $A=[x_1\ x_2\ \cdots\ x_r]$，则 $A$ 列满秩，可通过行变换化为秩标准形，即存在可逆矩阵 $P$，使

$$
A=P^{-1}\begin{bmatrix}I_r\\0_{(n-r)\times r}\end{bmatrix}
$$

令

$$
B=P^{-1}\begin{bmatrix}0_{r\times(n-r)}\\I_{n-r}\end{bmatrix}
$$

由于仅对 $\begin{bmatrix}A\\B\end{bmatrix}$ 作行变换 $A,B$ 不影响

则

$$
\begin{bmatrix}A\\B\end{bmatrix}
=P^{-1}\begin{bmatrix}I_r&0\\0&I_{n-r}\end{bmatrix}
=P^{-1}I_n=P^{-1}\ \text{满秩}
$$

即将 $[A]$ 扩充为 $\begin{bmatrix}A\\B\end{bmatrix}$ 仍列满秩，即证得 $x_1\ \cdots\ x_r$ 通过扩充得 $x_1\ \cdots\ x_n$ 为 $F^n$ 的基，坐标对应的 $\alpha_1\ \cdots\ \alpha_n$ 即为 $V$ 的基

### 9\. 子空间的交

若 $V_1$、$V_2$ 是 $V$ 的子空间，则它们的交 $V_1\cap V_2$ 也是 $V$ 的子空间

证 $0\in V$ 则 $0\in V_1$，且 $0\in V_2$，故 $0\in V_1\cap V_2$，则 $V_1\cap V_2\neq\varnothing$

设 $\alpha\in V_1$，$\alpha\in V_2$，$\beta\in V_1$，$\beta\in V_2$，则 $\alpha,\beta\in V_1\cap V_2$

则 $\alpha+\beta\in V_1$，$\alpha+\beta\in V_2$，故 $\alpha+\beta\in V_1\cap V_2$

$k\alpha\in V_1$，$k\alpha\in V_2$，故 $k\alpha\in V_1\cap V_2$

故 $V_1\cap V_2$ 也是 $V$ 的子空间，显然也是 $V_1$ 与 $V_2$ 的子空间

### 10\. 子空间的和

设 $V_1,V_2$ 为 $V$ 的子空间，则 $V$ 的子集 $\{\alpha+\beta\mid\alpha\in V_1,\beta\in V_2\}$ 也为 $V$ 的子空间，记作 $V_1+V_2$

证 $\alpha_1\in V_1$，$\beta_1\in V_2$，$\alpha_1+\alpha_2\in V_1$，$\beta_1+\beta_2\in V_2$

$\alpha_2\in V_1$，$\beta_2\in V_2$，$k\alpha_1\in V_1$，$k\beta_1\in V_2$

$\alpha_1+\beta_1\in V_1+V_2$，$\alpha_2+\beta_2\in V_1+V_2$

$(\alpha_1+\beta_1)+(\alpha_2+\beta_2)=(\alpha_1+\alpha_2)+(\beta_1+\beta_2)\in V_1+V_2$

$k(\alpha_1+\beta_1)=k\alpha_1+k\beta_1\in V_1+V_2$

故 $V_1+V_2$ 为 $V$ 的子空间

### 11\. 维数公式

$$
\dim(V_1)+\dim(V_2)=\dim(V_1+V_2)+\dim(V_1\cap V_2)
$$

$V_1$、$V_2$ 为 $V$ 的子空间

证 设 $\alpha_1\ \cdots\ \alpha_r$ 为 $V_1\cap V_2$ 的基

扩充得 $\alpha_1\ \cdots\ \alpha_r$，$\beta_{r+1}\ \cdots\ \beta_s$ 为 $V_1$ 的基

$\alpha_1\ \cdots\ \alpha_r$，$\gamma_1\ \cdots\ \gamma_t$ 为 $V_2$ 的基

则 $\dim(V_1)=s$，$\dim(V_2)=r+t$，$\dim(V_1\cap V_2)=r$

下面证明：$\alpha_1\ \cdots\ \alpha_r$，$\beta_{r+1}\ \cdots\ \beta_s$，$\gamma_1\ \cdots\ \gamma_t$ 为 $V_1+V_2$ 的基

显然 $\forall\alpha\in V_1+V_2$，$\alpha$ 可由 $\alpha_1\ \cdots\ \alpha_r$，$\beta_{r+1}\ \cdots\ \beta_s$，$\gamma_1\ \cdots\ \gamma_t$ 线性表出

令

$$
\begin{aligned}
&k_1\alpha_1+\cdots+k_r\alpha_r+l_{r+1}\beta_{r+1}+\cdots+l_s\beta_s\\
&\quad+p_1\gamma_1+\cdots+p_t\gamma_t=0
\end{aligned}
$$

令

$$
\theta=k_1\alpha_1+\cdots+k_r\alpha_r+l_{r+1}\beta_{r+1}+\cdots+l_s\beta_s\in V_1
$$

则 $\theta=-p_1\gamma_1-\cdots-p_t\gamma_t\in V_2$，故 $\theta\in V_1\cap V_2$

则 $\theta=w_1\alpha_1+\cdots+w_r\alpha_r$

$\therefore w_1\alpha_1+\cdots+w_r\alpha_r+p_1\gamma_1+\cdots+p_t\gamma_t=0$

又 $\alpha_1\ \cdots\ \alpha_r$，$\gamma_1\ \cdots\ \gamma_t$ 线性无关 $\therefore w_1=\cdots=w_r=p_1=\cdots=p_t=0$

故 $k_1\alpha_1+\cdots+k_r\alpha_r+l_{r+1}\beta_{r+1}+\cdots+l_s\beta_s=0$，又 $\alpha_1\ \cdots\ \alpha_r$，$\beta_{r+1}\ \cdots\ \beta_s$ 线性无关

故 $k_1=\cdots=k_r=l_{r+1}=\cdots=l_s=0=p_1=\cdots=p_t$

即 $\alpha_1\ \cdots\ \alpha_r$，$\beta_{r+1}\ \cdots\ \beta_s$，$\gamma_1\ \cdots\ \gamma_t$ 线性无关，证毕

### 12\. 子空间的直和

设 $V_1,V_2$ 为 $V$ 的子空间，若 $V_1+V_2$ 中每个向量 $\theta$ 的表示式 $\theta=\theta_1+\theta_2$，$\theta_1\in V_1$，$\theta_2\in V_2$ 唯一，则称 $V_1$ 与 $V_2$ 的直和，记作 $V_1\oplus V_2$

$$
V_1+V_2\ \text{为直和}\Leftrightarrow V_1\cap V_2=\{0\}\Leftrightarrow \dim V_1+\dim V_2=\dim(V_1+V_2)
$$

证 由上一命题，

$$
\begin{aligned}
\theta_1&=k_1\alpha_1+\cdots+k_r\alpha_r+w_1\beta_1+\cdots+w_s\beta_s\in V_1\\
\theta_2&=s_1\alpha_1+\cdots+s_r\alpha_r+\mu_1\gamma_1+\cdots+\mu_p\gamma_p\in V_2
\end{aligned}
$$

其中 $\alpha_1,\dots,\alpha_r$ 为 $V_1\cap V_2$ 的基

$$
\begin{aligned}
\theta_1+\theta_2&=(k_1+s_1)\alpha_1+\cdots+(k_r+s_r)\alpha_r\\
&\quad+w_1\beta_1+\cdots+w_s\beta_s+\mu_1\gamma_1+\cdots+\mu_p\gamma_p\in V_1+V_2
\end{aligned}
$$

易知 $w_1,\dots,w_s$，$\mu_1,\dots,\mu_p$ 固定，而 $k_1+s_1,\dots,k_r+s_r$ 只有值固定，则 $k_i,s_i$ 可任取 要使 $\theta=\theta_1+\theta_2$ 表达唯一，则 $V_1\cap V_2=\{0\}$

### 13\. 线性表示的等价判据

(补 4.3)

设 $(\mathrm{I})$，$(\mathrm{II})$ 为两向量组，则

(1) $(\mathrm{II})$ 可由 $(\mathrm{I})$ 线性表示 $\Leftrightarrow r(\mathrm{I})=r(\mathrm{I};\mathrm{II})$

(2) $(\mathrm{I})$ 与 $(\mathrm{II})$ 等价 则 $r(\mathrm{I})=r(\mathrm{II})=r(\mathrm{I};\mathrm{II})$

证：(1) 由 $(\mathrm{II})$ 由 $(\mathrm{I})$ 表示知 $(\mathrm{I};\mathrm{II})$ 也可由 $(\mathrm{I})$ 表示，则 $r(\mathrm{I};\mathrm{II})\le r(\mathrm{I})$

又 $(\mathrm{I})$ 可由 $(\mathrm{I};\mathrm{II})$ 表示，则 $r(\mathrm{I})\le r(\mathrm{I};\mathrm{II})$ 故 $r(\mathrm{I})=r(\mathrm{I};\mathrm{II})$

由 $r(\mathrm{I})=r(\mathrm{I};\mathrm{II})$ 知 $(\mathrm{I})$ 的极大无关组是 $(\mathrm{I};\mathrm{II})$ 的极大无关组，故 $(\mathrm{II})$ 可由 $(\mathrm{I})$ 线性表出

(2) 由 (1) 易得.
