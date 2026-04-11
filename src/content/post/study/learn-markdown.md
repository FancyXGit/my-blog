---
title: "学习MARKDOWN格式"
publishDate: "2026-04-08"
updatedDate: "2026-04-08"
description: "这是我学习MARKDOWN格式的笔记"
tags: ["学习", "MARKDOWN", "笔记"]
coverImage: 
    src: "https://cdn.fancyflow.top/image/post/study/learn-markdown-cover.webp"
    alt: "雪山"
---

## 1.标题

在MARKDOWN中，标题使用#符号表示，#的数量表示标题的级别。

```md
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
```

# 一级标题

## 二级标题

### 三级标题

#### 四级标题

## 2.换行

在MARKDOWN中，换行使用两个或多个空格加回车符表示。

```md
这是第一行。(两个空格)  
这是第二行。
```

这是第一行。  
这是第二行。

## 3.强调

在MARKDOWN中，强调使用*或_符号表示，单个符号表示斜体，两个符号表示加粗，三个符号表示加粗并且斜体。

```md
*斜体*
**加粗**
***加粗并且斜体***
```

*斜体*  
**加粗**  
***加粗并且斜体***

## 4.列表

在MARKDOWN中，列表分为无序列表和有序列表。

### 无序列表

无序列表使用-、+或*符号表示。

```md
- 项目 1
- 项目 2
  - 子项目
    - 子子项目
```

- 项目 1
- 项目 2
  - 子项目
    - 子子项目

```md
+ 项目 1
+ 项目 2
  + 子项目
```

+ 项目 1
+ 项目 2
  + 子项目

### 有序列表

有序列表使用数字加点符号表示。

```md
1. 第一项
2. 第二项
3. 第三项
```

1. 第一项
2. 第二项
3. 第三项

## 5.引用

在MARKDOWN中，引用使用>符号表示。

```md
> 这是一段引用
> 可以写多行
```

> 这是一段引用  
> 可以写多行

## 6.代码

在MARKDOWN中，代码分为行内代码和代码块。

### 行内代码

行内代码使用`符号表示。

```md
在C++中，`std::cout`用于输出。
```

在C++中，`std::cout`用于输出。

### 代码块

代码块使用三个`符号表示。

```md
(START)    ```cpp
(LINE1)    #include <iostream>
(LINE2)    int main() {
(LINE3)        std::cout << "Hello, World!" << std::endl;
(LINE4)        return 0;
(LINE5)    }
(ENDLN)    ```
```

```cpp
#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

## 7.链接

在MARKDOWN中，链接使用 文本(方括号[]) 加 链接地址(圆括号()) 表示。

```md
这是[GITHUB](https://www.github.com)链接。
```

这是[GITHUB](https://www.github.com)链接。

## 8.图片

在MARKDOWN中，图片使用 感叹号(!) 加 描述文本（方括号[]） 图片地址(圆括号()) 表示。

```md
![Sekiro: Shadows Die Twice宣传图](https://cdn.fancyflow.top/image/post/study/learn-markdown-sekrio.webp)
```

![Sekiro: Shadows Die Twice宣传图](https://cdn.fancyflow.top/image/post/study/learn-markdown-sekrio.webp)

## 9.分割线

在MARKDOWN中，分割线使用三个或以上的-、*或_符号表示。

```md
---

上面和下面都是分割线

---
```

---

上面和下面都是分割线

---

## 10.表格

在MARKDOWN中，表格使用 | 符号表示。

```md
| 列1   | 列2   | 列3   |
| ----- | ----- | ----- |
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |
```

| 列1   | 列2   | 列3   |
| ----- | ----- | ----- |
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |

## 11.任务列表

在MARKDOWN中，任务列表使用 - [ ] 或 - [x] 符号表示。

```md
- [ ] 任务1
- [x] 任务2
- [ ] 任务3
```

- [ ] 任务1
- [x] 任务2
- [ ] 任务3

## 12.转义字符

在MARKDOWN中，转义字符使用反斜杠\符号表示。

```md
这是几个转义字符：\* \_ \`。
```

这是几个转义字符：\* \_ \`。

## 13.数学公式

在MARKDOWN中，数学公式使用美元符号$表示。

```md
这是一个行内公式：$E=mc^2$。  
这是一个块级公式：
$$f(x) = \int_{-\infty}^{\infty} g(t) dt$$
```

这是一个行内公式：$E=mc^2$。  
这是一个块级公式：
$$f(x) = \int_{-\infty}^{\infty} g(t) dt$$
