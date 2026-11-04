---
title: "变换"
publishDate: "2026-11-04"
updatedDate: "2026-11-04"
description: "齐次坐标、Rodrigues 旋转公式、视图变换，以及正交投影与透视投影矩阵的推导"
seriesId: games101
orderInSeries: 1
tags: ["学习", "笔记", "GAMES101", "图形学", "变换"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/games101/lec01/cover.webp"
    alt: "蓝天，草地与大树"
---

## 齐次坐标

常见的二维仿射变换包括缩放、旋转和平移。缩放和旋转可以写成 $2\times2$ 矩阵，平移需要额外加一个向量，两者无法合并成同一次矩阵乘法。  
齐次坐标在普通坐标后补一个分量，把平移也写进矩阵。二维点记作 $(x,y,1)^T$，二维向量记作 $(x,y,0)^T$。  
齐次坐标 $(x,y,w)^T$ 与 $(kx,ky,kw)^T$ 表示同一个位置，其中 $k\neq0$。计算结束后除以 $w$，得到普通笛卡尔坐标。  

二维平移、缩放和旋转分别写成

$$
\begin{aligned}
T(t_x,t_y)&=
\begin{bmatrix}
1&0&t_x\\
0&1&t_y\\
0&0&1
\end{bmatrix}\\
S(s_x,s_y)&=
\begin{bmatrix}
s_x&0&0\\
0&s_y&0\\
0&0&1
\end{bmatrix}\\
R(\theta)&=
\begin{bmatrix}
\cos\theta&-\sin\theta&0\\
\sin\theta&\cos\theta&0\\
0&0&1
\end{bmatrix}
\end{aligned}
$$

其中 $R(\theta)$ 表示逆时针旋转 $\theta$。  
平移量放在第三列。点的 $w=1$，平移会改变点的位置；向量的 $w=0$，平移不改变向量。  
两个点相加得到 $w=2$，除以 $w$ 后是中点；点减点得到 $w=0$，结果是向量。  

多个变换按矩阵乘法组合。$p'=TRSp$ 表示先缩放、再旋转、再平移。矩阵乘法从右往左作用，交换顺序会得到不同的结果。  
三维情形使用 $4\times4$ 矩阵，点记作 $(x,y,z,1)^T$，向量记作 $(x,y,z,0)^T$。平移量位于第四列，旋转是左上角的 $3\times3$ 块。  
透视投影会用到 $w\neq1$ 的齐次坐标。投影矩阵把 $w$ 写成视深的函数，除法把远处点的横向坐标压小。  

## 三维旋转

绕单位轴 $\hat n$ 旋转角度 $\theta$ 的变换可以用一个矩阵表示，这个矩阵称为 Rodrigues 旋转矩阵。  
把向量 $v$ 分解为平行于轴的分量 $v_\parallel$ 和垂直于轴的分量 $v_\perp$：

$$
v_\parallel=(\hat n\cdot v)\hat n,\qquad v_\perp=v-v_\parallel
$$

旋转时 $v_\parallel$ 保持不变，$v_\perp$ 在垂直于 $\hat n$ 的平面内转动。转动后的垂直分量为

$$
v_\perp'=\cos\theta\,v_\perp+\sin\theta\,(\hat n\times v)
$$

其中 $\hat n\times v=\hat n\times v_\perp$，它的长度等于 $|v_\perp|$，方向由右手定则确定。  
把两个分量相加，得到

$$
v'=v_\parallel+\cos\theta\,v_\perp+\sin\theta\,(\hat n\times v)
$$

代入 $v_\parallel=(\hat n\cdot v)\hat n=\hat n\hat n^Tv$ 和 $v_\perp=(I-\hat n\hat n^T)v$，整理成矩阵形式：

$$
v'=\left(\cos\theta\,I+(1-\cos\theta)\hat n\hat n^T+\sin\theta\,[\hat n]_\times\right)v
$$

其中

$$
[\hat n]_\times=
\begin{bmatrix}
0&-\hat n_z&\hat n_y\\
\hat n_z&0&-\hat n_x\\
-\hat n_y&\hat n_x&0
\end{bmatrix}
$$

是叉乘对应的反对称矩阵，$[\hat n]_\times v=\hat n\times v$。  
于是

$$
R(\hat n,\theta)=\cos\theta\,I+(1-\cos\theta)\hat n\hat n^T+\sin\theta\,[\hat n]_\times
$$

取 $\hat n=(0,0,1)$ 时，$R$ 退化为二维旋转矩阵的 $3\times3$ 形式；取 $\theta=0$ 时，$R=I$。  

## 视图变换

视图变换把世界坐标中的点变换到相机坐标，使相机位于原点、看向 $-Z$、上方向为 $+Y$。  
相机由位置 $e$、看向方向 $g$、上方向 $t$ 确定。  

![相机的位置、朝向与上方向](https://cdn.fancyflow.top/image/post/study/games101/lec01/camera-model.webp)

直接写世界坐标到相机坐标的矩阵并不方便，平移和三个轴的旋转混在一起，矩阵元素不容易直接看出。  
相机坐标到世界坐标的矩阵可以直接由相机的位置和三个轴写出。先写这个方向的矩阵，再求逆，就得到视图变换。  

### 相机基向量

相机坐标系的三个轴在世界坐标中表示为

$$
\hat w=-\frac{g}{|g|},\qquad
\hat u=\frac{g\times t}{|g\times t|},\qquad
\hat v=\hat w\times\hat u
$$

$\hat w$ 指向相机后方，因为相机看向 $-Z$；$\hat u$ 指向相机右方；$\hat v$ 指向相机上方。  
$\hat u$ 由 $g\times t$ 得到，因此 $\hat u$ 与 $g$ 垂直；$\hat v$ 再由 $\hat w\times\hat u$ 得到，三个轴构成右手正交基。  
当 $g$ 与 $t$ 平行时，$g\times t=0$，相机姿态退化，需要换一个上方向。  

### 先写相机到世界

相机坐标中的点 $(x_c,y_c,z_c)$ 在世界坐标中表示为

$$
p=e+x_c\hat u+y_c\hat v+z_c\hat w
$$

写成齐次矩阵：

$$
M_{c2w}=
\begin{bmatrix}
\hat u_x&\hat v_x&\hat w_x&e_x\\
\hat u_y&\hat v_y&\hat w_y&e_y\\
\hat u_z&\hat v_z&\hat w_z&e_z\\
0&0&0&1
\end{bmatrix}
$$

矩阵的前三列是相机三个轴在世界坐标中的方向，第四列是相机位置。  

### 求逆得到视图矩阵

视图变换需要反方向的矩阵，对 $M_{c2w}$ 求逆。  
三个轴两两垂直且长度为 1，所以 $R=[\hat u\ \hat v\ \hat w]$ 是正交矩阵，满足 $R^TR=I$，因此 $R^{-1}=R^T$。  
对分块矩阵

$$
\begin{bmatrix}R&e\\0&1\end{bmatrix}^{-1}
=
\begin{bmatrix}R^T&-R^Te\\0&1\end{bmatrix}
$$

得到

$$
M_{view}=
\begin{bmatrix}
\hat u_x&\hat u_y&\hat u_z&-\hat u\cdot e\\
\hat v_x&\hat v_y&\hat v_z&-\hat v\cdot e\\
\hat w_x&\hat w_y&\hat w_z&-\hat w\cdot e\\
0&0&0&1
\end{bmatrix}
$$

这个矩阵等价于先用 $T(-e)$ 把相机移到原点，再用 $R^T$ 旋转坐标轴。  
平移项是 $-\hat u\cdot e$ 这样的点积，不能直接把 $e$ 的分量取负。  

### 验证

把相机位置 $e$ 代入，得到 $(0,0,0)^T$。  
把 $e+g$ 代入，旋转部分得到 $-\hat w=(0,0,-1)^T$，说明视线方向映射到相机坐标的 $-Z$。  
把 $e+t$ 代入，若 $t$ 与 $g$ 垂直，结果为 $(0,1,0)^T$，说明上方向映射到 $+Y$。  

## 正交投影

投影变换把相机空间中的可视区域映射到归一化设备坐标（NDC），NDC 的范围是 $[-1,1]^3$。  
正交投影的视锥体是长方体，平行线投影后仍然平行，物体的大小不随距离改变。  
透视投影的视锥体是棱锥台，平行线在投影后可能相交，远处的物体看起来更小。棱锥台是棱锥被平行于底面的平面截去顶部后剩下的部分。  

![透视投影与正交投影的视锥体](https://cdn.fancyflow.top/image/post/study/games101/lec01/perspective-vs-ortho.webp)

相机看向 $-Z$，近平面位于 $z=-n$，远平面位于 $z=-f$，其中 $n,f>0$ 且 $f>n$。  
长方体的左右、下上边界分别为 $l,r,b,t$，因此 $x\in[l,r]$，$y\in[b,t]$，$z\in[-f,-n]$。  

![正交变换：先平移，再缩放](https://cdn.fancyflow.top/image/post/study/games101/lec01/ortho-transform.webp)

正交投影分两步。先把长方体中心平移到原点，再沿三个轴缩放到 $[-1,1]$。  
中心为

$$
c=\left(\frac{l+r}{2},\frac{b+t}{2},-\frac{n+f}{2}\right)
$$

平移矩阵为 $T(-c)$，缩放因子为

$$
\begin{aligned}
s_x&=\frac{2}{r-l}\\
s_y&=\frac{2}{t-b}\\
s_z&=\frac{2}{n-f}
\end{aligned}
$$

$s_z$ 的分母 $n-f$ 是负数，因此 $z$ 轴在映射时翻转。  
组合得到

$$
M_{ortho}=
\begin{bmatrix}
\dfrac{2}{r-l}&0&0&-\dfrac{r+l}{r-l}\\
0&\dfrac{2}{t-b}&0&-\dfrac{t+b}{t-b}\\
0&0&\dfrac{2}{n-f}&\dfrac{n+f}{n-f}\\
0&0&0&1
\end{bmatrix}
$$

代入 $x=r$ 得到 $1$，代入 $x=l$ 得到 $-1$；代入 $z=-n$ 得到 $-1$，代入 $z=-f$ 得到 $1$。  
近平面映射到 $-1$，远平面映射到 $+1$，这个约定会沿用到透视投影。  

## 透视投影

透视投影的视锥体是一个棱锥台。近平面位于 $z=-n$，远平面位于 $z=-f$，近平面是 $x,y\in[-n,n]$ 的正方形，对应 $90^\circ$ 的视场角。  
视场角是相机在垂直方向上能看到的张角。视锥体内的点沿穿过相机的射线投影到近平面，近平面上的点保持不动，远平面上的点被缩放到近平面的大小。  

![透视投影把视锥体压成长方体](https://cdn.fancyflow.top/image/post/study/games101/lec01/perspective-transform.webp)

目标是把视锥体映射到 $[-1,1]^3$，近平面映射到 $z=-1$，远平面映射到 $z=+1$。  
整个过程分成两步：先把视锥体挤压成长方体，近平面和远平面的 $z$ 坐标保持不变；再用正交矩阵把长方体映射到 $[-1,1]^3$。  

### 第一步：挤压视锥体

设视锥体内一点为 $(x,y,z)$，其中 $z<0$。穿过该点和相机的射线与近平面交于

$$
\begin{aligned}
x_p&=\frac{n}{-z}x\\
y_p&=\frac{n}{-z}y
\end{aligned}
$$

![相似三角形给出近平面上的投影坐标](https://cdn.fancyflow.top/image/post/study/games101/lec01/perspective-divide-z.webp)

图中 $z$ 标为正距离；本文的相机坐标中 $z<0$，所以分母写成 $-z$。  
挤压把点映射到 $(x_p,y_p,z_{sq})$。横向坐标乘以 $n/(-z)$，纵向坐标同理；$z_{sq}$ 只要求近平面和远平面上的 $z$ 坐标保持不变。  
用齐次坐标表示，令 $w=-z$。$w$ 是正数，远处的点 $w$ 更大，除以 $w$ 后横向坐标更小。  
挤压矩阵的前两行给出 $x_{clip}=nx$、$y_{clip}=ny$，第四行为 $[0,0,-1,0]$。设第三行为 $[0,0,A,B]$，则

$$
z_{sq}=\frac{Az+B}{-z}
$$

近平面 $z=-n$ 挤压后仍为 $-n$，远平面 $z=-f$ 挤压后仍为 $-f$，代入得到

$$
\begin{aligned}
\frac{-An+B}{n}&=-n\\
\frac{-Af+B}{f}&=-f
\end{aligned}
$$

两式分别化为 $-An+B=-n^2$ 和 $-Af+B=-f^2$。相减得 $A(n-f)=n^2-f^2$，因此 $A=n+f$；回代得 $B=nf$。  
挤压矩阵为

$$
M_{squish}=
\begin{bmatrix}
n&0&0&0\\
0&n&0&0\\
0&0&n+f&nf\\
0&0&-1&0
\end{bmatrix}
$$

这里只固定了近平面和远平面的 $z$，内部点的 $z$ 会被第三行重新映射。挤压后的形状是 $x,y\in[-n,n]$、$z\in[-f,-n]$ 的长方体。  

### 第二步：正交映射

对上一步得到的长方体套用正交矩阵，取 $l=b=-n$、$r=t=n$：

$$
M_{ortho}=
\begin{bmatrix}
\dfrac{1}{n}&0&0&0\\
0&\dfrac{1}{n}&0&0\\
0&0&\dfrac{2}{n-f}&\dfrac{n+f}{n-f}\\
0&0&0&1
\end{bmatrix}
$$

它的 $z$ 行把 $[-f,-n]$ 映射到 $[-1,1]$：

$$
z_{ndc}=\frac{2}{n-f}z_{sq}+\frac{n+f}{n-f}
$$

代入 $z_{sq}=-n$ 得到 $-1$，代入 $z_{sq}=-f$ 得到 $+1$。$2/(n-f)$ 是负数，$z$ 轴在这里翻转。  

### 第三步：合并矩阵

透视矩阵是两步矩阵的乘积：

$$
M_{persp}=M_{ortho}M_{squish}
$$

合并时，$M_{ortho}$ 的平移项乘的是挤压后的 $w=-z$，不能当作常数 $1$。因此 $z$ 分量为

$$
z_{clip}
=\frac{2}{n-f}\bigl((n+f)z+nf\bigr)
+\frac{n+f}{n-f}(-z)
=\frac{(n+f)z+2nf}{n-f}
$$

除以 $w=-z$ 后得到

$$
z_{ndc}
=\frac{(n+f)z+2nf}{(n-f)(-z)}
$$

$M_{ortho}$ 的最后一行是 $[0,0,0,1]$，$w$ 在矩阵乘法中原样保留。  
因此“先乘两个矩阵、再统一除以 $w$”与“先除以 $w$ 得到 $z_{sq}$、再做正交映射”结果相同。  

横向坐标的 $n$ 在合并时约掉：挤压给出 $x_{clip}=nx$，正交矩阵的 $x$ 缩放是 $1/n$，最终 $x_{clip}=x$。  
除以 $w=-z$ 后，$x_{ndc}=x/(-z)$。近平面上的 $x\in[-n,n]$ 因此落到 $[-1,1]$。  
合并后的矩阵为

$$
M_{persp}=
\begin{bmatrix}
1&0&0&0\\
0&1&0&0\\
0&0&-\dfrac{f+n}{f-n}&-\dfrac{2nf}{f-n}\\
0&0&-1&0
\end{bmatrix}
$$

代入近平面上的点 $(x,y,-n,1)$，得到 $(x,y,-n,n)$，除以 $w=n$ 后为 $(x/n,y/n,-1)$。  
代入远平面上的点 $(x,y,-f,1)$，第三行给出 $z_{clip}=f$，除以 $w=f$ 后为 $z_{ndc}=1$。  

### 一般形式

当近平面是 $x\in[l,r]$、$y\in[b,t]$ 的矩形时，挤压矩阵的横向缩放仍是 $n$，正交矩阵的横向缩放变为 $2/(r-l)$ 和 $2/(t-b)$。  
合并后得到

$$
M_{persp}=
\begin{bmatrix}
\dfrac{2n}{r-l}&0&\dfrac{r+l}{r-l}&0\\
0&\dfrac{2n}{t-b}&\dfrac{t+b}{t-b}&0\\
0&0&-\dfrac{f+n}{f-n}&-\dfrac{2nf}{f-n}\\
0&0&-1&0
\end{bmatrix}
$$

第一、二行的第三列来自正交矩阵的平移项与 $w=-z$ 的乘积，用来处理近平面中心不在原点的情况。  
设垂直视场角为 $\alpha$，宽高比为 $a$，则 $t=n\tan(\alpha/2)$、$r=at$、$b=-t$、$l=-r$。代入后可以得到用视场角和宽高比表示的投影矩阵。  

## 变换管线

渲染管线把模型坐标依次变换到世界坐标、相机坐标、裁剪空间：

$$
p_{clip}=M_{persp}M_{view}M_{model}p_{model}
$$

矩阵乘法从右往左作用：$M_{model}$ 把模型坐标变换到世界坐标，$M_{view}$ 把世界坐标变换到相机坐标，$M_{persp}$ 把视锥体映射到裁剪空间。  
裁剪空间仍然是齐次坐标，再除以 $w$ 得到 NDC；视口变换再把 NDC 映射到屏幕像素坐标。  
