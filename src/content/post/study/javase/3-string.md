---
title: "String"
publishDate: "2026-07-14"
updatedDate: "2026-07-14"
description: "String类的实现机制"
seriesId: javase
orderInSeries: 3
tags: ["工作", "后端", "Java"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/javase/3/cover.webp"
    alt: "白墙与绿叶"
---

## 不可变

`String`类的不可变体现在2点

- `String`的值`private final byte[] value`通过`private`和`final`修饰
- `String`类没有提供修改`value`的方法，类似修改的方法都是返回一个新的`String`对象

:::tip
`private final byte[] value`中的`final`相当于`char* const value`，即`value`指针不可变，但指针指向的内容是可变的。具体使得数组内容不变是通过`private`和`String`类没有提供修改`value`的方法来实现的。
:::

## 字符串常量池

一个JVM级别的哈希表，表中指向缓存堆中的唯一字符串对象  
常量池中的字符串是唯一的，存储的是完整的`String`对象  
进入常量池的方式

- 源代码中的字面量`"Hello"`
- 可计算的字符串表达式`"Hel" + "lo"`，编译器会在编译期将其计算为`"Hello"`，并放入常量池中
- 显示调用`intern()`方法

`new String()`、`StringBuilder.toString()`、从文件/网络读取的字符串等所有运行时动态创建的对象不会自动进池

:::tip
下文所说的"常量池创建对象"指的是堆中新建`String`对象，并将其引用放入常量池哈希表中
:::

## 创建String

```java
String s = "abc";
```

- 若池中无`"abc"`

1. 常量池中创建`"abc"`对象
2. 返回对池中`"abc"`对象的引用

- 若池中有`"abc"`

直接返回对池中`"abc"`对象的引用

```java
String s = new String("abc");
```

- 若池中无`"abc"`

1. 常量池中创建`"abc"`对象
2. 依据方法`public String(String original)`堆中新建一个`abc`对象
3. 返回对堆中新建`abc`对象的引用

- 若池中有`"abc"`

1. 依据方法`public String(String original)`堆中新建一个`abc`对象
2. 返回对堆中新建`abc`对象的引用

```java
String s = new String(new char[]{'a','b','c'});
```

不在字符串常量池中创建对象，直接在堆中新建对象，返回引用

## intern()

`intern()`返回字符串在常量池中的引用  
在JDK7之后，如果常量池中没有该字符串，会**直接把当前字符串对象的引用放入常量池中**，而不是创建一个新的对象  
如果池中已有内容相同的字符串，则直接返回池中已有引用；没有时才将当前对象放入

## 编译器常量折叠

仅由字面量和编译期常量变量组成的表达式，在编译时就会被计算成单一字面量，写入字节码  
由此产生的字符串直接指向常量池中的同一个对象，不会在运行时生成 `StringBuilder` 拼接  
常量变量定义：`final` 修饰，且使用常量表达式初始化  
常量变量：  

```java
final String a = "hello";          // 字面量
final String b = a + " world";     // 常量表达式
final String c = "hello" + 1;      // 也是常量表达式
```

非常量变量：

```java
final String d = new String("hello");    // new 不是常量表达式
final String e = someMethod();           // 方法调用不是常量表达式
final String f; f = "hello";             // 空 final
```

## StringBuilder StringBuffer

`StringBuilder`和`StringBuffer`都是可变的字符序列，区别在于`StringBuffer`是线程安全的，`StringBuilder`是非线程安全的  
执行`String`类拼接的时候，例如`str1 + str2`，编译器会将其转换为`StringBuilder`的拼接方式，调用`StringBuilder.append()`方法，最后调用`StringBuilder.toString()`方法返回一个新的`String`对象

:::note
JAVA8及之前使用`StringBuilder`，JAVA9之后使用`StringConcatFactory`，在运行时动态生成拼接代码
:::
