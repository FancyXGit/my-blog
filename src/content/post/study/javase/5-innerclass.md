---
title: "内部类"
publishDate: "2026-07-16"
updatedDate: "2026-07-16"
description: "内部类原理"
seriesId: javase
orderInSeries: 5
tags: ["工作", "后端", "Java"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/javase/5/cover.webp"
    alt: "雪山与湖泊"
---

## 内部类

内部类就是定义在类中或者方法中的类  
内部类可以分为以下几种  

- 成员内部类：定义在某个类的内部。成员内部类可以访问外部类的成员，包括私有成员
- 静态内部类：定义在某个类的内部且有`static`修饰。静态内部类不能访问外部类的非静态成员
- 局部内部类：定义在某个方法的内部。局部内部类只能访问外部类的成员和方法的局部变量（局部变量必须是`final`或者是effectively final）
- 匿名内部类：没有名字的局部内部类，一次性使用

内部类是编译时期的，编译器会将内部类编译为独立的class文件，例如  

- `Outer$Inner.class`：成员内部类
- `Outer$1.class`：匿名内部类
- `Outer$1Local.class`：局部内部类

## 外部类引用

非静态内部类会持有一个对外部类的引用`this$0`  
内部类通过`this$0`访问外部类的成员，例如  

```java
public class Outer {
    private String name = "Outer";
    public class Inner {
        public void print() { System.out.println(name); }
    }
}
```

编译后成为

```java
class Outer$Inner {
    final Outer this$0;  // 编译器插入的字段

    public Outer$Inner(Outer outer) {  // 构造器参数多了一个
        this.this$0 = outer;
    }

    public void print() {
        System.out.println(this$0.name);
    }
}
```

:::note
非静态内部类由于需要持有外部类的引用，所以创建非静态内部类必须持有外部类的实例对象  
静态内部类不持有外部类的引用，所以不需要外部类的实例对象，但是也不能访问外部类的非静态成员
:::

## 访问私有成员

内部类可以访问外部类的私有成员  
但是JVM并不允许直接访问私有成员，所以编译器会在外部类生成一个桥接方法来访问私有成员，例如  

```java
// 编译器在 Outer 中生成的方法
static String access$000(Outer obj) { return obj.name; }
static void access$100(Outer obj, String v) { obj.name = v; }
```

访问外部字段`name`实际执行的是 `this$0.access$000(this$0)`  

:::warning
代码规范：程序员不得在源代码中直接引用编译器生成的合成类，例如显式调用`Outer.access$000()`
:::

## 局部变量捕获

```java
public void test() {
    int count = 10;
    Runnable r = new Runnable() {
        public void run() { System.out.println(count); }
    };
}
```

编译时在匿名内部类里生成字段 val$count，并在构造时传入该值

```java
class Outer$1 implements Runnable {
    final int val$count;
    Outer$1(int count) { this.val$count = count; }
    public void run() { System.out.println(val$count); }
}
```

因为是值副本，如果原变量可以修改，就会出现语义混乱，所以要求 effectively final

## 私有内部类

私有是成员的概念，对于任何一个成员无论什么属性，该成员的类都应该可以访问  
因此外部类可以访问私有内部类的成员  

:::tip
Java语言规范（JLS）规定的实际边界是：private 的访问权限是“顶级外部类（Top-Level Class）”的整个大括号内部
:::

如果内部类被定义为私有，但是JVM没有私有类的概念，所以编译器会将私有内部类的访问权限改为**包访问权限**
同时内部类会生成一个私有构造器，例如`private Outer$Inner(Outer outer)`  
为了使得外部类能够访问私有内部类的构造器，同时别的类不能访问，编译器会在内部类生成一个包可见的构造器  

```java
Outer$Inner(Outer outer, Outer$1 x1) { this(outer); }
```

这个构造器比私有构造器多了一个参数，类型是 `Outer$1`。这是一个合成的空类（没有实际用处，仅用于区分签名）  
这个包可见构造器内部会调用那个私有构造器  
由于`Outer$1` 这个类没有公开的实例，外部代码无法构造它，所以外部代码也就无法调用这个包可见构造  
外部类中的调用`new Inner()`会被编译器改写为`new Outer$Inner(this, null)`

:::note
冲突点在于：编译之后所有的类都是平等的，而且最少是包可见。但是私有内部类需要保持仅外部类可访问，而其他类不可访问
:::
