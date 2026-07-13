---
title: "Object"
publishDate: "2026-07-13"
updatedDate: "2026-07-13"
description: "关于Object类和方法"
seriesId: javase
orderInSeries: 2
tags: ["工作", "后端", "Java"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/javase/2/cover.webp"
    alt: "海滩"
---

## equals

`equals`方法在`Object`类中定义为比较两个对象的引用是否相等  
重写时必须遵循以下规则：

- 自反性：`x.equals(x)`必须返回true
- 对称性：`x.equals(y)`为true当且仅当`y.equals(x)`为true
- 传递性：`x.equals(y)`为true，`y.equals(z)`为true，则`x.equals(z)`必须为true
- 一致性：多次调用`x.equals(y)`必须始终返回true或始终返回false

实现`equals`方法时建议如下：

1. 显式参数为`Object otherObject`
2. 检查`this == otherObject`
3. 检查`otherObject`是否为null
4. 比较`this`和`otherObject`的类，分两种情况

- 如果子类改变了父类的`equals`方法，则父类必须使用`getClass()`来比较类
- 如果所有的子类相等性语义相同，则父类可以使用`instanceof`来比较类

5. 将`otherObject`强制转换为当前类类型，比较对应字段是否相等

:::tip
所有的子类相等性语义相同，例如`TreeSet`和`HashSet`两类只需元素相等就相等，即使类型不一致。此时二者父类`AbstractSet`的`equals`方法使用`instanceof`来比较类。
:::

常见的错误在于子类添加了新的字段，父类的`equals`方法使用`instanceof`来比较类 
由于子类要检查额外字段，必须将`otherObject`强制转换为子类类型，在此之前使用`instanceof`检查类型，传入的父类参数就不成立

```java
// 父类
class Employee {
    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Employee)) return false;
        // 检查剩余字段...
    }
}

// 子类（增加字段）
class Manager extends Employee {
    @Override
    public boolean equals(Object o) {
        if (!super.equals(o)) return false;      // 父类检查通过
        if (!(o instanceof Manager)) return false; // 关键检查，不通过
        // 检查子类剩余字段...
    }
}
```

此时`employee.equals(manager)`为true，但`manager.equals(employee)`为false，违反了对称性。

## hashCode

`hashCode`方法在`Object`类中定义为返回对象的哈希码，是由对象的内存地址计算得出的一个整数值。  
重写`equals`方法时，必须同时重写`hashCode`方法，以确保相等的对象具有相同的哈希码。  
可以使用`Objects.hash(Object... values)`方法来生成哈希码

```java
public class Person {
    private String name;
    private int age;
    private double salary;

    @Override
    public int hashCode() {
        // 直接把 equals 里用到的所有字段扔进去即可
        return Objects.hash(name, age, salary);
    }
}
```

`Objects.hash`调用`Arrays.hashCode`方法来计算哈希码，`Arrays.hashCode`方法将各元素的哈希值乘以31的幂次方后相加

```java
// Objects.hash(Object... values) 方法的实现
public static int hash(Object... values) {
        return Arrays.hashCode(values);
    }
```

```java
// Arrays.hashCode(Object[] a) 方法的实现
public static int hashCode(Object a[]) {
        if (a == null)
            return 0;
        int result = 1;
        for (Object element : a)
            result = 31 * result + (element == null ? 0 : element.hashCode());
        return result;
    }
```

## toString

`toString`方法在`Object`类中定义为返回对象的字符串表示形式，默认实现返回对象的 类名@哈希码  

```java
// Object.toString() 方法的实现
public String toString() {
        return getClass().getName() + "@" + Integer.toHexString(hashCode());
    }
```

- 当对象与字符串拼接时，`toString`方法会被自动调用。  
`"str" + obj`等价于`"str" + obj.toString()`

- 当对象被打印时，打印的就是`toString`方法的返回值
`System.out.println(obj)`等价于`System.out.println(obj.toString())`

建议恰当重写`toString`方法，以提供对象的有意义的字符串表示形式，便于调试和日志记录。
