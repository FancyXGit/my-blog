---
title: "矩阵"
publishDate: "2026-11-20"
description: "矩阵的加法、数乘与乘法，转置与逆矩阵，伴随矩阵求逆，初等变换与初等矩阵，收在矩阵的秩与秩不等式的性质上。"
seriesId: linear-algebra
orderInSeries: 2
tags: ["学习", "线性代数", "笔记", "矩阵"]
---

## 2.1 矩阵及其运算

### 1\. 非零矩阵之积可为零矩阵

乘得零矩阵，两矩阵皆可非 $0$

### 2\. 矩阵加法的运算律

$A+B=B+A$

$$
\begin{aligned}
(A+B)+C&=A+(B+C)\\
A+O&=A\\
A+(-A)&=O
\end{aligned}
$$

### 3\. 数乘的运算律

$1A=A$

$$
\begin{aligned}
k(lA)&=(kl)A\\
(k+l)A&=kA+lA\\
k(A+B)&=kA+kB
\end{aligned}
$$

### 4\. 乘法的运算律与单位矩阵

$I_mA_{m\times n}=A_{m\times n}I_n=A_{m\times n}$

$$
\begin{aligned}
(AB)C&=A(BC)\\
(kA)B&=A(kB)=k(AB)\\
A(B+C)&=AB+AC\\
(A+B)C&=AC+BC
\end{aligned}
$$

乘法不满足交换律

$A^{k}A^{l}=A^{k+l}$，$(A^{k})^{l}=A^{kl}$

### 5\. 转置的运算律

$(A^{T})^{T}=A$

$$
\begin{aligned}
(A+B)^{T}&=A^{T}+B^{T}\\
(kA)^{T}&=kA^{T}\\
(AB)^{T}&=B^{T}A^{T}
\end{aligned}
$$

### 6\. 行列式的性质

$\det(A^{T})=\det(A)$

$$
\begin{aligned}
\det(kA)&=k^{n}\det(A)\\
\det(AB)&=\det(A)\cdot\det(B)
\end{aligned}
$$

注意 $\det(A+B)\neq\det(A)+\det(B)$

## 2.2 逆矩阵

### 1\. 伴随矩阵与逆矩阵的关系

$AA^{*}=A^{*}A=\det(A)E$，即 $AA^{*}=A^{*}A=\lvert A\rvert E$

$$
A^{*}=\det(A)A^{-1}
$$

即 $A^{*}=\lvert A\rvert A^{-1}$

### 2\. 伴随矩阵的行列式

$\det(A^{*})=\det^{n-1}(A)$

即 $\lvert A^{*}\rvert=\lvert A\rvert^{n-1}$

又 $\lvert A^{*}\rvert=\lvert A\rvert^{n}\lvert A^{-1}\rvert$

则 $\lvert A^{-1}\rvert=\frac{1}{\lvert A\rvert}$

### 3\. 逆矩阵的运算性质

#### 逆的逆

$(A^{-1})^{-1}=A$

证 $A^{-1}\cdot A=E$ 得 $(A^{-1})^{-1}=A$

#### 转置的逆

$(A^{T})^{-1}=(A^{-1})^{T}$

证 设 $A^{T}\cdot X=E$

则 $(A^{T}\cdot X)^{T}=X^{T}(A^{T})^{T}=X^{T}A=E^{T}=E$

又 $X^{T}\cdot A\cdot A^{-1}=X^{T}(A\cdot A^{-1})=X^{T}=EA^{-1}=A^{-1}$

则 $(X^{T})^{T}=X=(A^{-1})^{T}$

又由定义：$X=(A^{T})^{-1}$ ∴ $(A^{T})^{-1}=(A^{-1})^{T}$

#### 数乘的逆

$$
(kA)^{-1}=\frac{1}{k}A^{-1}
$$

证：$kA\cdot X=E$

$$
\begin{aligned}
A\cdot X&=\frac{1}{k}E\\
A^{-1}\cdot A\cdot X&=A^{-1}\cdot\frac{1}{k}E=\frac{1}{k}A^{-1}\\
X&=\frac{1}{k}A^{-1}
\end{aligned}
$$

由定义：$X=(kA)^{-1}$ ∴ $(kA)^{-1}=\frac{1}{k}A^{-1}$

#### 乘积的逆

$$
(AB)^{-1}=B^{-1}A^{-1}
$$

证：$ABX=E$

$$
\begin{aligned}
A^{-1}ABX&=A^{-1}E=A^{-1}\\
BX&=A^{-1}\\
B^{-1}BX&=B^{-1}A^{-1}\\
X&=B^{-1}A^{-1}
\end{aligned}
$$

由定义：$X=(AB)^{-1}$

∴ $(AB)^{-1}=(B^{-1}A^{-1})$

### 4\. 伴随矩阵的性质

#### (1) 伴随矩阵的逆

(1) $(A^{*})^{-1}=(A^{-1})^{*}=\frac{A}{\lvert A\rvert}$

证：$(A^{*})^{-1}\cdot A^{*}=E$

$$
\begin{aligned}
(A^{*})^{-1}\cdot\lvert A\rvert A^{-1}&=E\\
(A^{*})^{-1}\cdot\lvert A\rvert\cdot A^{-1}\cdot A&=E\cdot A=A\\
(A^{*})^{-1}&=\frac{A}{\lvert A\rvert}
\end{aligned}
$$

$$
(A^{-1})^{*}\cdot A^{-1}=\lvert A^{-1}\rvert E
$$

$$
\begin{aligned}
(A^{-1})^{*}&=\lvert A^{-1}\rvert EA=\lvert A^{-1}\rvert A\\
&=A\cdot\frac{1}{\lvert A\rvert}=\frac{A}{\lvert A\rvert}
\end{aligned}
$$

∴ $(A^{*})^{-1}=(A^{-1})^{*}=\frac{A}{\lvert A\rvert}$

#### (2) A 与 A* 的关系

(2) $A=\lvert A\rvert(A^{*})^{-1}$，$A^{*}=\lvert A\rvert A^{-1}$

证：由 (1) $(A^{*})^{-1}=\frac{A}{\lvert A\rvert}$ 知 $A=\lvert A\rvert(A^{*})^{-1}$

(1) 中两边取逆矩阵得

$$
[(A^{*})^{-1}]^{-1}=A^{*}=\left(\frac{A}{\lvert A\rvert}\right)^{-1}=\lvert A\rvert A^{-1}
$$

#### (3) 数乘的伴随

(3) $(kA)^{*}=k^{n-1}A^{*}$

证：$(kA)^{*}\cdot kA=\lvert kA\rvert E$

$$
\begin{aligned}
(kA)^{*}\cdot kA&=\lvert kA\rvert E\\
&=k^{n}\lvert A\rvert E
\end{aligned}
$$

$$
\begin{aligned}
\therefore (kA)^{*}&=k^{n}\lvert A\rvert E\cdot A^{-1}=k^{n}\lvert A\rvert\cdot A^{-1}\\
&=k^{n-1}A^{*}
\end{aligned}
$$

#### (4) 伴随的行列式

(4) $\lvert A^{*}\rvert=\lvert A\rvert^{n-1}$

证：由 $A\cdot A^{*}=\lvert A\rvert E$

得

$$
\begin{aligned}
\lvert A\cdot A^{*}\rvert&=\lvert A\rvert\cdot\lvert A^{*}\rvert=\bigl\lvert\lvert A\rvert E\bigr\rvert=\lvert A\rvert^{n}\\
\lvert A^{*}\rvert&=\lvert A\rvert^{n-1}
\end{aligned}
$$

#### (5) 伴随的伴随

(5) $(A^{*})^{*}=\lvert A\rvert^{n-2}A$

证：$(A^{*})^{*}\cdot A^{*}=\lvert A^{*}\rvert E$

$$
\begin{aligned}
(A^{*})^{*}&=\lvert A^{*}\rvert E\cdot(A^{*})^{-1}\\
&=\lvert A\rvert^{n-1}\cdot\frac{A}{\lvert A\rvert}\\
&=\lvert A\rvert^{n-2}A
\end{aligned}
$$

#### (6) 乘积的伴随

(6) $(AB)^{*}=B^{*}A^{*}$

证：$(AB)^{*}AB=\lvert AB\rvert E=\lvert A\rvert\lvert B\rvert E$

$$
\begin{aligned}
(AB)^{*}A&=\lvert A\rvert\lvert B\rvert B^{-1}=\lvert A\rvert\cdot B^{*}\\
(AB)^{*}&=\lvert A\rvert\cdot B^{*}A^{-1}=B^{*}A^{*}
\end{aligned}
$$

## 2.4 初等变换与初等矩阵

1. 矩阵的初等行（列）变换可由左（右）乘初等矩阵得到

   且 $(P_{ij})^{-1}=P_{ij}$，$\left(P_{i}(k)\right)^{-1}=P_{i}\left(\frac{1}{k}\right)$，$\left(P_{ij}(k)\right)^{-1}=P_{ij}(-k)$

2. 任意非零矩阵可通过初等行变换变为阶梯形矩阵，再由初等行变换变为简化行阶梯形矩阵，再由列变换变为等价标准形

   即

   $$
   \begin{bmatrix}I&O\\O&O\end{bmatrix}
   $$

3. 简化行阶梯形矩阵若为方阵且 $\det\neq 0$，则为单位矩阵

   设 $A$ 为非零矩阵，$A$ 的简化行阶梯形矩阵为 $B$，则 $P_{m}P_{m-1}\cdots P_{1}A=B$

   得若 $\lvert A\rvert\neq 0$ 则 $\lvert B\rvert\neq 0$。由于阶梯形矩阵只能水平走多格，竖直一次走一格，在方阵中，若水平走了多格，会导致主对角线出现 0 元素使 $\lvert B\rvert=0$，故只能水平一次走 1 格，故每个主对角线元素都是首非 0 元素，上方元素全为 0，则为单位矩阵。也就是说，非 0 方阵 $A$ 仅需（$\det A\neq 0$）经过行变化就可变为单位矩阵。

4. 任意可逆矩阵可化为多个初等矩阵之积，且可经过行变化变为同阶单位矩阵。

   这提供了一种求逆矩阵的方法。构造矩阵 $[A\mid I]$，对 $A$ 作初等行变化，则 $A$ 与 $I$ 互不干扰，由 $P_{m}P_{m-1}\cdots P_{1}A=I$ 得 $PA=I$，则 $P=A^{-1}$。对 $[A\mid I]$ 作 $P$ 的行变化，则 $A$ 变为 $PA$ 即 $I$，$I$ 变为 $PI=A^{-1}I=A^{-1}$

   即

   $$
   [A\mid I]\xrightarrow{\text{行变换}}[I\mid A^{-1}]
   $$

5. $A\cong B\Leftrightarrow\exists P,Q$ 可逆，$PAQ=B$

## 2.5 矩阵的秩

1. 若 $r(A)=r$，则至少有 1 个 $r$ 阶子式不为 0，且所有 $r+1$ 阶子式都为 0

   若所有 $r+1$ 阶子式为 0，则所有 $r+2$ 阶子式也为 0（按行列式展开，$r+2$ 阶化为 $r+1$ 阶子式）

2. 阶梯形矩阵的秩等于非 0 行个数，亦即首非 0 元个数

3. 矩阵的初等变换不改变秩

4. 若 $r(A)=r$，则 $\exists P,Q$ 可逆 使

   $$
   PAQ=\begin{bmatrix}I_{r}&O\\O&O\end{bmatrix}
   $$

   （秩标准形）

   且

   $$
   A=\left(P^{-1}\begin{bmatrix}I_{r}\\O\end{bmatrix}\right)\left(\begin{bmatrix}I_{r}&O\end{bmatrix}Q^{-1}\right)=GH
   $$

   $G$ 为行满秩，$H$ 为列满秩

   此为满秩分解。

