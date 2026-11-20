---
title: "线性变换"
publishDate: "2026-11-20"
description: "线性变换的定义与基本性质，核与值域、秩加零度定理，可逆线性变换的等价条件，线性变换的矩阵表示与相似关系。"
seriesId: linear-algebra
orderInSeries: 7
tags: ["学习", "线性代数", "笔记", "线性变换"]
---

## 8.1 线性变换及其运算

### 1\. 线性变换

设 $T: V \to W$ 是从线性空间 $V \to W$ 的映射，且 $\forall \alpha, \beta \in V$，$k \in F$，有

(1) $T(\alpha+\beta)=T(\alpha)+T(\beta)$

(2) $T(k\alpha)=kT(\alpha)$

则称 $T$ 是 $V$ 到 $W$ 的一个线性变换

$V$ 到 $W$ 的线性变换全体记作 $\mathcal{L}(V,W)$

$V$ 到 $V$ 的线性变换全体记作 $\mathcal{L}(V)$，若 $T \in \mathcal{L}(V)$，称 $T$ 为 $V$ 上的线性算子

同构为特殊的线性变换

### 2\. 线性变换的基本性质

设 $T \in \mathcal{L}(V,W)$ 则

(1) $T(0)=0$

(2) $T(-\alpha)=-T(\alpha)$

(3) $T(k_1\alpha_1+\cdots+k_m\alpha_m)=k_1T(\alpha_1)+\cdots+k_mT(\alpha_m)$

(4) $T$ 把 $V$ 中线性相关向量组映射为 $W$ 中线性相关向量组

证　(1)(2) 由 $T(k\alpha)=kT(\alpha)$ 令 $k=0,-1$ 立刻得到　(3) 由 $T(\alpha+\beta)=T(\alpha)+T(\beta)$ 及 $T(k\alpha)=kT(\alpha)$ 得到

(4) 设 $\alpha_1 \cdots \alpha_n \in V$ 线性相关，则存在不全为 $0$ 的 $k_1 \cdots k_n$ 使 $k_1\alpha_1+\cdots+k_n\alpha_n=0$，则

$$
T(k_1\alpha_1+\cdots+k_n\alpha_n)=k_1T(\alpha_1)+\cdots+k_nT(\alpha_n)=0
$$

即 $T(\alpha_1) \cdots T(\alpha_n)$ 线性相关

注意　线性无关不一定映射为线性无关，如零映射

### 3\. 核与值域

设 $T\in\mathcal{L}(V,W)$，称 $V$ 为 $T$ 的定义域

核/零空间：$\ker(T)=\{\alpha\mid \alpha\in V,\ T(\alpha)=0\}$

值域：$R(T)=\{T(\alpha)\mid \alpha\in V\}$

#### (1) 核是子空间

$\ker(T)$ 是 $V$ 中映射为 $W$ 中 $0$ 的全体，是 $V$ 的子空间

证 （1）设 $\alpha,\beta\in V$，$T(\alpha)=0$，$T(\beta)=0$，则 $T(\alpha+\beta)=T(\alpha)+T(\beta)=0$

故 $\alpha+\beta\in\ker(T)$；$T(k\alpha)=kT(\alpha)=0$，故 $k\alpha\in\ker(T)$

则 $\ker(T)$ 为 $V$ 的子空间

#### (2) 值域是子空间

$R(T)$ 是 $V$ 向 $W$ 映射的像的全体，是 $W$ 的子空间

证 (2)设 $\alpha,\beta\in V$，$T(\alpha)\in R(T)$，$T(\beta)\in R(T)$，则 $T(\alpha)+T(\beta)=T(\alpha+\beta)\in R(T)$

$kT(\alpha)=T(k\alpha)\in R(T)$

则 $R(T)$ 是 $W$ 的子空间

### 4\. 秩加零度定理

记 $\dim\ker(T)=\operatorname{nullity}(T)$，$\dim R(T)=\operatorname{rank}(T)$

则 $\operatorname{nullity}(T)+\operatorname{rank}(T)=\dim(V)$，$T\in\mathcal{L}(V,W)$

证 设 $1\le \operatorname{nullity}(T)=m<n$

取 $\ker(T)$ 的一组基 $e_1,\dots,e_m$，扩充为 $V$ 的基 $e_1,\dots,e_m,e_{m+1},\dots,e_n$

下面证明 $T(e_{m+1}),\dots,T(e_n)$ 是 $R(T)$ 的一组基

设 $\alpha\in V$，则 $\alpha=x_1e_1+\cdots+x_ne_n$，令 $\beta=T(\alpha)\in W$

则 $\beta=T(\alpha)=x_{m+1}T(e_{m+1})+\cdots+x_nT(e_n)$

即 $\forall \beta\in R(T)$ 都可由 $T(e_{m+1}),\dots,T(e_n)$ 线性表示，下证其线性无关 设 $\lambda_{m+1}T(e_{m+1})+\cdots+\lambda_nT(e_n)=0$

则 $T(\lambda_{m+1}e_{m+1}+\cdots+\lambda_ne_n)=0$，故 $\lambda_{m+1}e_{m+1}+\cdots+\lambda_ne_n\in\ker(T)$

则 $\lambda_{m+1}e_{m+1}+\cdots+\lambda_ne_n=\lambda_1e_1+\cdots+\lambda_me_m$，由 $e_1,\dots,e_n$ 线性无关

知 $\lambda_1=\cdots=\lambda_m=\lambda_{m+1}=\cdots=\lambda_n=0$ 故 $T(e_{m+1}),\dots,T(e_n)$ 线性无关

则 $\dim(V)=n$，$\dim\ker(T)=\operatorname{nullity}(T)=m$，$\operatorname{rank}(T)=n-m$

即 $\operatorname{nullity}(T)+\operatorname{rank}(T)=\dim(V)$

### 5\. 单射的等价条件

设 $T\in\mathcal{L}(V,W)$ 则下列条件等价

(1)$T$ 为单射

(2)$\ker(T)=\{0\}$

(3)$T$ 将 $V$ 中线性无关组映射为线性无关组

(4)$\operatorname{rank}(T)=\dim(V)$

证：用循环证法

(1)$\Rightarrow$（2）由 $T(0)=0$ 知 $\ker(T)=\{0\}$

(2)$\Rightarrow$（3）设 $\alpha_1,\dots,\alpha_m\in V$ 且线性无关，令 $k_1T(\alpha_1)+\cdots+k_mT(\alpha_m)=0$

则 $T(k_1\alpha_1+\cdots+k_m\alpha_m)=0$，则 $k_1\alpha_1+\cdots+k_m\alpha_m\in\ker(T)$

即 $k_1\alpha_1+\cdots+k_m\alpha_m=0$，故 $k_1=\cdots=k_m=0$ 即 $T(\alpha_1),\dots,T(\alpha_m)$ 线性无关

(3)$\Rightarrow$（1）若 $\alpha,\beta\in V$，$\alpha\ne\beta$，则 $\alpha-\beta$ 线性无关，故 $T(\alpha-\beta)$ 线性无关

故 $T(\alpha)\ne T(\beta)$，即 $T$ 为单射

(3)$\Rightarrow$（4）由秩加零度定理知（2）$\Leftrightarrow$（4）

### 6\. 映射的乘积

设 $T_2:U\to V$，$T_1:V\to W$ 定义 $T_1T_2:U\to W$ 为 $T_1T_2(\alpha)=T_1[T_2(\alpha)]$

（映射的乘积）若 $T_1,T_2$ 是线性变换，则 $T_1T_2$ 为线性变换

注：对任意映射 $(T_1T_2)T_3=T_1(T_2T_3)$

证 设 $T_1\in\mathcal{L}(V\to W)$，$T_2\in\mathcal{L}(U\to V)$，令 $\alpha,\beta\in U$

$$
\begin{aligned}
T_1T_2(\alpha+\beta)&=T_1[T_2(\alpha+\beta)]=T_1[T_2(\alpha)+T_2(\beta)]\\
&=T_1[T_2(\alpha)]+T_1[T_2(\beta)]=T_1T_2(\alpha)+T_1T_2(\beta)
\end{aligned}
$$

$$
\begin{aligned}
T_1T_2(k\alpha)&=T_1[T_2(k\alpha)]=T_1[kT_2(\alpha)]\\
&=k\,T_1[T_2(\alpha)]=kT_1T_2(\alpha)
\end{aligned}
$$

### 7\. 可逆映射

设 $T:V\to W$ 若 $\exists S:W\to V$ 使

$TS=I_W$，$ST=I_V$

则 $S$ 为 $T$ 的可逆映射，记 $S$ 为 $T^{-1}$

设 $T\in\mathcal{L}(V,W)$ 则 $T^{-1}\in\mathcal{L}(W,V)$

证 $\forall\alpha,\beta\in W$，$k\in F$ 有

$$
\begin{aligned}
T^{-1}(\alpha+\beta)&=T^{-1}[(TT^{-1})\alpha+(TT^{-1})\beta]=T^{-1}[T(T^{-1}(\alpha)+T^{-1}(\beta))]\\
&=T^{-1}T(T^{-1}(\alpha)+T^{-1}(\beta))=T^{-1}(\alpha)+T^{-1}(\beta)
\end{aligned}
$$

$$
\begin{aligned}
T^{-1}(k\alpha)&=T^{-1}[TT^{-1}(k\alpha)]=T^{-1}[T(kT^{-1}(\alpha))]=T^{-1}T[kT^{-1}(\alpha)]\\
&=kT^{-1}(\alpha).
\end{aligned}
$$

### 8\. 可逆的充要条件

$T\in\mathcal{L}(V,W)$ 则 $T$ 可逆 $\Leftrightarrow \ker(T)=\{0\}$ 且 $R(T)=W$

证 必要性 若 $T$ 可逆，$\forall\alpha\in\ker(T)$，$T(\alpha)=0$，$T^{-1}T(\alpha)=T^{-1}(0)=0$

即 $\alpha=0$ 故 $\ker(T)=\{0\}$；$\forall\beta\in W$，设 $T^{-1}(\beta)=\gamma\in V$

$TT^{-1}(\beta)=T(\gamma)$ 即 $\beta=T(\gamma)\in R(T)$ 故 $W\subseteq R(T)$

又 $R(T)\subseteq W$ 则 $R(T)=W$

充分性 $\ker(T)=\{0\}$，则 $T$ 为单射 故 $\forall\beta\in W$，有唯一 $\alpha\in V$

$\beta=T(\alpha)$ 定义映射 $S(\beta)=\alpha$，则 $S=T^{-1}$

### 9\. 同维空间上可逆的等价条件

设 $\dim(V)=\dim(W)=n$，$T\in\mathcal{L}(V,W)$，则下面条件等价

(1)$T$ 可逆

(2)$T$ 为单射

(3)$T$ 为满射

(4)$\operatorname{rank}(T)=n$

(5)$\operatorname{nullity}(T)=0$

证 只证（2）$\Leftrightarrow$（3）设 $T$ 为单射 则 $\operatorname{nullity}(T)=0$ 故 $\operatorname{rank}(T)=n$，则 $\operatorname{rank}(T)=\dim(W)$ 故 $R(T)=W$ 即 $T$ 为满射

设 $T$ 为满射，则 $R(T)=W$ 故 $\operatorname{rank}(T)=\dim W=n$ 则 $T$ 为单射

### 10\. 线性变换的和与数乘

设 $T_1,T_2,T\in\mathcal{L}(V,W)$，$k\in F$ 定义

加法 $(T_1+T_2)(\alpha)=T_1(\alpha)+T_2(\alpha)$

数乘 $(kT_1)(\alpha)=kT_1(\alpha)$

易得为线性变换

## 8.2 线性变换的矩阵表示

### 1\. 线性变换的矩阵

设 $\dim V=n$，$\dim W=m$，基分别为 $B$ 和 $B'$

$$
B=\{\alpha_1\ \cdots\ \alpha_n\},\quad B'=\{\beta_1\ \cdots\ \beta_m\}
$$

则

$$
T[\alpha_1\ \cdots\ \alpha_n]=[\beta_1\ \cdots\ \beta_m]A_{m\times n}
$$

称 $A$ 为 $T$ 的矩阵（在给定基 $B,B'$ 下）

### 2\. 坐标变换

设 $\alpha=[\alpha_1\ \cdots\ \alpha_n]x\in V$，$T(\alpha)=[\beta_1\ \cdots\ \beta_m]y\in W$

则 $y=Ax$

证

$$
\begin{aligned}
T(\alpha)&=T([\alpha_1\ \cdots\ \alpha_n]x)=T[\alpha_1\ \cdots\ \alpha_n]x\\
&=[\beta_1\ \cdots\ \beta_m]Ax
\end{aligned}
$$

即 $y=Ax$

### 3\. 线性变换与矩阵的对应

$\mathcal{L}(V,W)$ 全体构成一个线性空间，与 $F^{m\times n}$ 存在关系

(1) 和对应矩阵的和

(2) 数乘对应矩阵的数乘

(3) 乘积对应矩阵的乘积

证　(1) 设 $T_1,T_2\in \mathcal{L}(V,W)$，$V$ 的基为 $\alpha_1\cdots\alpha_n$；$W$ 的基 $\beta_1\cdots\beta_m$

$$
\begin{aligned}
T_1[\alpha_1\ \cdots\ \alpha_n]&=[\beta_1\ \cdots\ \beta_m]A_1\\
T_2[\alpha_1\ \cdots\ \alpha_n]&=[\beta_1\ \cdots\ \beta_m]A_2
\end{aligned}
$$

则

$$
\begin{aligned}
(T_1+T_2)[\alpha_1\ \cdots\ \alpha_n]&=T_1[\alpha_1\ \cdots\ \alpha_n]\\
&\quad +T_2[\alpha_1\ \cdots\ \alpha_n]\\
&=[\beta_1\ \cdots\ \beta_m]A_1+[\beta_1\ \cdots\ \beta_m]A_2\\
&=[\beta_1\ \cdots\ \beta_m](A_1+A_2)
\end{aligned}
$$

(2) $T_1[\alpha_1\ \cdots\ \alpha_n]=[\beta_1\ \cdots\ \beta_m]A_1$

$$
\begin{aligned}
(kT_1)[\alpha_1\ \cdots\ \alpha_n]&=T_1(k[\alpha_1\ \cdots\ \alpha_n])=kT_1[\alpha_1\ \cdots\ \alpha_n]\\
&=[\beta_1\ \cdots\ \beta_m](kA)
\end{aligned}
$$

(3) 设 $T_2\in \mathcal{L}(V,N)$，$T_1\in \mathcal{L}(N,M)$

$V$ 基 $\alpha_1\cdots\alpha_m$；$N$ 基 $\beta_1\cdots\beta_n$；$M$ 基 $\gamma_1\cdots\gamma_t$

$$
\begin{aligned}
T_2[\alpha_1\ \cdots\ \alpha_m]&=[\beta_1\ \cdots\ \beta_n]A_2\\
T_1[\beta_1\ \cdots\ \beta_n]&=[\gamma_1\ \cdots\ \gamma_t]A_1
\end{aligned}
$$

则

$$
\begin{aligned}
T_1T_2[\alpha_1\ \cdots\ \alpha_m]&=T_1(T_2[\alpha_1\ \cdots\ \alpha_m])\\
&=T_1([\beta_1\ \cdots\ \beta_n]A_2)\\
&=T_1[\beta_1\ \cdots\ \beta_n]A_2=[\gamma_1\ \cdots\ \gamma_t](A_1A_2)
\end{aligned}
$$

### 4\. 线性变换空间与矩阵空间同构

线性空间 $\mathcal{L}(V,W)$ 与 $F^{m\times n}$ 同构

$T\in \mathcal{L}(V,W)$ 对应矩阵 $A$ 则

(1) $R(T)$ 与 $A$ 的列空间同构，$\operatorname{rank}(T)=r(A)$

(2) $\operatorname{Ker}(T)$ 与 $Ax=0$ 的解空间同构，$\operatorname{nullity}(T)=n-r(A)$

证　(1) 由坐标变换知 $y=Ax$ 则 $R(T)$ 中向量的坐标为 $Ax$，即任意 $R(T)$ 中向量与 $Ax$ 对应；反过来，$Ax$ 也是某向量的坐标，故 $R(T)$ 与 $A$ 的列空间同构

(2) $\ker(T)$ 中向量对应为 $0$，则 $y=0$ 故 $Ax=0$

故 $\ker(T)$ 与 $Ax=0$ 的解空间同构

### 5\. 不同基下矩阵相似

线性算子 $T$ 在不同基下的矩阵相似

即证　设 $T\in \mathcal{L}(V)$，$B=\{\alpha_1\cdots\alpha_n\}$ 与 $B'=\{\beta_1\cdots\beta_n\}$ 是 $V$ 的两个基，$T$ 在 $B,B'$ 下矩阵为 $A,D$；$B$ 到 $B'$ 过渡矩阵为 $C$

则 $D=C^{-1}AC$

证　$T[\alpha_1\ \cdots\ \alpha_n]=[\alpha_1\ \cdots\ \alpha_n]A$；$T[\beta_1\ \cdots\ \beta_n]=[\beta_1\ \cdots\ \beta_n]D$

$[\beta_1\ \cdots\ \beta_n]=[\alpha_1\ \cdots\ \alpha_n]C$，则

$$
\begin{aligned}
T[\beta_1\ \cdots\ \beta_n]&=T([\alpha_1\ \cdots\ \alpha_n]C)\\
&=T[\alpha_1\ \cdots\ \alpha_n]C=[\alpha_1\ \cdots\ \alpha_n]AC
\end{aligned}
$$

又

$$
\begin{aligned}
T[\beta_1\ \cdots\ \beta_n]&=[\beta_1\ \cdots\ \beta_n]D\\
&=[\alpha_1\ \cdots\ \alpha_n]CD
\end{aligned}
$$

故 $AC=CD$ 即 $D=C^{-1}AC$
