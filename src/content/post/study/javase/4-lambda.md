---
title: "Lambda"
publishDate: "2026-07-15"
updatedDate: "2026-07-15"
description: "Lambda表达式，函数式接口，方法引用"
seriesId: javase
orderInSeries: 4
tags: ["工作", "后端", "Java"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/javase/4/cover.webp"
    alt: "奶牛小狗"
---

## Lambda表达式

Lambda不是函数，而是对象  
`(a, b) -> a.length() - b.length()`本身没有类型。当作为参数传递，编译器根据上下文将它转化为某个函数式接口的实例对象  
函数式接口是只包含一个抽象方法的接口  

例如

```java
List<String> words = Arrays.asList("apple", "pie", "banana");

words.sort((a, b) -> a.length() - b.length());
```

此时编译器将`(a, b) -> a.length() - b.length()`转化为`Comparator<String>`的实例对象

```java
// 等效的匿名内部类
words.sort(new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
});
```

:::tip
与真正的匿名内部类不同，lambda 使用 invokedynamic，性能更好，不会生成额外的 .class 文件
:::

## 函数式接口

`java.util.function`包中提供了大量的函数式接口  
一个函数式接口描述了一种函数，可以将对应的Lambda表达式转化为该函数式接口的实例对象  
例如`Consumer<T>`表示一个接受一个参数并且没有返回值的函数  

```java
Consumer<String> printer = s -> System.out.println(s);
```

这个语句等价为

```java
Consumer<String> printer = new Consumer<String>() {
    @Override
    public void accept(String s) {
        System.out.println(s);
    }
};
```

:::tip
注意到Lambda转为函数式接口和作为参数传入时，编译器的处理并无太大区别
:::

## 方法引用

方法引用是lambda表达式的一种简写形式，它允许你直接引用一个已存在的方法  
方法引用可以分为四种类型：

| 方法引用类型 | 具体示例（方法引用） | 等价的 Lambda 表达式 |
| :--- | :--- | :--- |
| **静态方法引用** | `Math::max` | `(a, b) -> Math.max(a, b)` |
| **特定对象的实例方法引用** | `System.out::println` | `(s) -> System.out.println(s)` |
| **特定类的任意对象实例方法引用** | `String::length` | `(s) -> s.length()` |
| **构造方法引用** | `ArrayList::new` | `() -> new ArrayList<>()` |

- `this::instanceMethod` 等价于`(args) -> this.instanceMethod(args)`
- `super::instanceMethod` 等价于`(args) -> super.instanceMethod(args)`

## 闭包

Lambda 可以访问外部局部变量，但该变量必须是 effectively final（实际上不可变）  
lambda 捕获外部局部变量时，存的是该 变量的值副本（如果是引用类型，这个值就是引用地址）。这样设计避免了因修改变量本身而造成的语义混乱，因此要求变量必须是 effectively final  
但是对于实例字段，Lambda只捕获了 `this` 引用，字段修改不受限制  
对于引用类型的局部变量，Lambda捕获的是引用的副本，修改引用指向的对象不受限制，但不能修改引用本身

:::note
Lambda 表达式内部 `this` 指向的是外层类的实例，而匿名内部类中 this 指向匿名内部类本身
:::
