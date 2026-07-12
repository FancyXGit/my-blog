---
title: "面向对象"
publishDate: "2026-07-12"
updatedDate: "2026-07-12"
description: "关于封装，继承，多态"
seriesId: javase
orderInSeries: 1
tags: ["工作", "后端", "Java", "面向对象"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/javase/1/cover.webp"
    alt: "公路，山峰，湖泊，天空"
---

## 静态与动态绑定

- 静态绑定：编译时进行，编译器只看变量的引用类型
- 动态绑定：运行时进行，JVM根据对象在堆中的实际类型来调用方法

函数的重载overload是静态绑定。编译器根据传入参数的类型选择对应的函数  
`static`方法是静态绑定，仅根据引用类型来调用方法，编译器在编译时就确定了调用哪个方法。  
  
重写override是动态绑定，发生在运行时  
`final`, `private`和`static`方法不能被重写，因此它们是静态绑定的。

## 多态

多态的实现分两步

1. 编译时：编译器根据引用类型来选择方法
2. 运行时：JVM根据对象在堆中的实际类型来调用方法

例如

```java
public class Animal {
    public String show(Animal obj) {
        return "Animal : Animal";
    }
    public String show(Dog obj) {
        return "Animal : Dog";
    }
}

public class Dog extends Animal{
    @Override
    public String show(Animal obj) {
        return "Dog : Animal";
    }
    public String show(Puppy obj) { // Puppy 是 Dog 的子类，假设已定义
        return "Dog : Puppy";
    }
}

public class Puppy extends Dog{
}

public class Main {
    public static void main(String[] args) {
        Animal aRefDog = new Dog();
        Puppy p = new Puppy();

        System.out.println(aRefDog.show(p)); 
        
    }
}
```

执行`System.out.println(aRefDog.show(p));`发生如下几步

1. 编译时，`aRefDog`的引用类型是`Animal`，编译器在`Animal`类中查找`show`方法
2. 编译器由参数`p`类型是`Puppy`，没有对应的方法，就选择最接近的`show(Dog obj)`方法
3. 运行时，`aRefDog`的实际类型是`Dog`，JVM在`Dog`类中查找`show(Dog obj)`方法是否被重写
4. 没有重写，所以调用`Animal`类的`show(Dog obj)`方法，输出结果为`Animal : Dog`

## 类型转换

- 向上转型：子类引用转换为父类引用，可以直接赋值，无需强制转换
- 向下转型：父类引用转换为子类引用，需要强制转换。被转换的父类引用必须指向一个子类对象或者子类的子类对象，否则会抛出`ClassCastException`异常

逻辑如下：**必须保证引用类型对应的类所有方法都可以通过这个引用被调用**  

例如:  
`Animal aRefDog = new Dog();`  
`Dog d = (Dog) aRefDog;`  
必须保证`d`对应的`Dog`类的所有方法都可以通过`d`被调用

1. 编译时只看类型，子类引用可以直接转为父类引用，父类引用必须强制变成子类引用
2. 运行时，子类引用转父类引用无需检查，因为子类一定有父类的方法，不会报错。
3. 运行时，父类引用转子类引用需要检查，因为父类不一定有子类方法
