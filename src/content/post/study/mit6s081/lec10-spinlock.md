---
title: "自旋锁"
publishDate: "2026-10-02"
updatedDate: "2026-10-02"
description: "XV6中自旋锁的机制"
seriesId: mit6s081
orderInSeries: 6
tags: ["学习", "MIT6.S081", "笔记", "操作系统", "并发"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/mit6s081/lec10/cover.webp"
    alt: "山川与湖泊"
---

## 自旋锁

自旋锁意味着当一个线程成功拿到锁之后，其他线程在尝试获取锁时会一直循环等待（自旋），直到锁被释放  
自旋锁适合于临界区很短的情况  
要设计自旋锁必须注意三种情况

- CPU并发访问，致使两个线程同时拿到锁： 由硬件原子指令解决
- 本CPU发生中断，致使在临界区之内执行危险操作，例如再次获取同一把锁，导致死锁： 进入临界区关闭中断
- 编译器和硬件重排： 可能导致临界区的指令被排到临界区外，导致不受锁保护

## 结构

```c
// kernel/spinlock.h
struct spinlock {
  uint locked;     // 0 = 空闲，非 0 = 被持有
  char *name;      // 调试用：锁的名字
  struct cpu *cpu; // 哪个 CPU 持有（调试 + holding 用）
};
```

自旋锁的核心字段便是`uint locked`，它表示锁的状态，0表示空闲，非0表示被持有

## 硬件基础

自旋锁的实现依赖于硬件的原子指令，XV6中使用RISC-V指令`amoswap.w rd, rs2, (rs1)`  
它把 `rs2` 写进内存，旧内存值写进 `rd`，整个读改写过程是原子的，即不可分割  

对于锁而言，每次尝试获取锁，线程都将`1`写入锁的`locked`字段，随后寄存器就能读取到锁的旧值

- 如果旧值为0，说明锁是空闲的，线程成功获取锁
- 如果旧值为1，说明锁已经被其他线程持有，线程将继续自旋等待

这样的实施非常巧妙，由于`amoswap`是原子操作，硬件会把多个 CPU 的 `amoswap` 排成一个顺序，两个线程同时尝试获取锁时，只有一个线程能够成功将旧值读为0并写入1，而另一个线程将读到1并继续自旋等待

## 获取与释放

### acquire

```c
void acquire(struct spinlock *lk) {
  push_off();                  // 先关中断
  if (holding(lk))
    panic("acquire");          // 重复拿锁 → 自死锁，报错
  while (__atomic_exchange_n(&lk->locked, 1, __ATOMIC_ACQUIRE) != 0)
    ;                          // 原子交换，旧值为 1 就继续转
  lk->cpu = mycpu();           // 记下持有者 CPU
}
```

`acquire`函数用于获取自旋锁，在关闭中断，检查是否已经持有锁后，使用核心的原子交换指令获取锁

`__atomic_exchange_n()`是GCC提供的原子操作函数，编译器在 RISC-V 上生成 `amoswap.w.aq`。其将常量`1`与`lk->locked`进行原子交换，并返回旧值  
读到的旧值便是锁的状态，当旧值为`0`时，说明锁是空闲的，线程成功获取锁；当旧值为`1`时，说明锁已经被其他线程持有，线程不停地在循环中检查锁的状态  
`__ATOMIC_ACQUIRE`禁止了编译器与硬件的随意重排，使得后面的访存（获取了锁之后就在临界区了）不许被提前到这次交换之前

### release

```c
void release(struct spinlock *lk) {
  if (!holding(lk))
    panic("release");                       // 不是自己拿的 → 报错
  lk->cpu = 0;                              // 先清持有者记录
  __atomic_store_n(&lk->locked, 0, __ATOMIC_RELEASE);  // 原子放锁
  pop_off();                                // 最后恢复中断
}
```

核心在于`__atomic_store_n()`函数，它将`0`写入锁的`locked`字段，表示锁被释放
使用`__ATOMIC_RELEASE`标志使得前面的访存（临界区的操作）不许被延迟到这次写入之后，保证了锁释放之前，临界区的操作已经完成  
当锁放开之后，开启中断

:::tip
`lk->cpu = 0` 必须在放锁前。锁一放开，别的 CPU 马上可能抢到并写入自己的记录，如果这时候才清，就会擦掉新持有者的信息
:::

`__atomic_store_n()`生成的汇编大致是：

```asm
fence rw, w      # 前面的读写必须先落实
sw zero, 0(s1)   # locked = 0
```

## 限制指令重排

编译器在编译时可能会对指令进行重排优化，硬件在执行时也可能会对指令进行乱序执行，这些都会导致临界区的指令被排到临界区外，导致不受锁保护

`__ATOMIC_ACQUIRE`与`__ATOMIC_RELEASE`是`C/C++`原子操作中用于控制内存顺序的常量，它们各自定义了特定的内存屏障和同步语义

- `__ATOMIC_ACQUIRE`：阻止代码向上提升，即该操作之后的内存访问不会被重排到它之前执行
- `__ATOMIC_RELEASE`: 阻止代码向下沉没，即该操作之前的内存访问不会被重排到它之后执行

可以简单的理解为，`__ATOMIC_ACQUIRE`之后的指令不会跑到前面，`__ATOMIC_RELEASE`之前的指令不会跑到后面（这里指令为内存仿写指令）  
一般而言，获取锁时使用`__ATOMIC_ACQUIRE`，释放锁时使用`__ATOMIC_RELEASE`，如此两个屏障使得临界区内的指令乖乖呆到临界区内，受锁的保护  

在`main()`函数中有类似应用

```c
volatile static int started = 0;
void main()
{
  if (cpuid() == 0) {
    // CPU0初始化
    __atomic_store_n(&started, 1, __ATOMIC_RELEASE);
  } else {
    while (__atomic_load_n(&started, __ATOMIC_ACQUIRE) == 0)
      ;
    // 其余CPU等待CPU0初始化完成后再执行
  }
}
```

`volatile`关键字使得每次访问都从内存中获取最新值，但是没有保证多线程的执行顺序    
如果没有`__ATOMIC_RELEASE`，CPU0的一系列初始化指令可能重排到`started = 1`之后，导致CPU0还未初始化完成其余CPU就执行了  
同理，如果没有`__ATOMIC_ACQUIRE`，其余CPU的初始化指令可能重排到`while`循环之前，导致其余CPU在CPU0还未初始化完成时就执行了  
两条`atomic`指令使得临界区稳定，作为两道屏障使用

## holding

```c
int holding(struct spinlock *lk) {
  return lk->locked && lk->cpu == mycpu();
}
```

`holding`判断该锁是否为当前CPU持有  

`acquire`中使用`holding`判断是否重复获取锁  
`release`中使用`holding`判断是否为当前CPU持有锁

## 中断与异常

### 分类

先分清异常和中断

| 类别 | 性质 | 例子 | 来源 |
|---|---|---|---|
| 异常 | 同步（指令自己引发） | 系统调用、缺页、非法指令 | 任何特权级 |
| 中断 | 异步（外部事件） | 定时器、串口、磁盘 | 随时可能来 |

运行过程中可能发生的中断和异常分为以下几种

- 定时器中断
- 设备中断
- 系统调用：只从用户态发起，内核态不会出现
- 缺页：内核态出现即为BUG

故当内核中关闭中断，即设置`sstatus.SIE = 0`，临界区应当线性执行，不会被打断或者被调度走

### push_off / pop_off

```c
// struct cpu 里有两个字段
int noff;    // push_off 嵌套了几层
int intena;  // 最外层 push_off 之前，中断本来是开的吗
```

```c
void push_off(void) {
  uint64 flags = rc_sstatus(SSTATUS_SIE);  // 一条 CSR 指令：读出旧值 + 清零 SIE
  int old = !!(flags & SSTATUS_SIE);
  if (mycpu()->noff == 0)
    mycpu()->intena = old;                 // 只有最外层记录原始状态
  mycpu()->noff += 1;
}

void pop_off(void) {
  struct cpu *c = mycpu();
  if (intr_get()) panic("pop_off - interruptible");
  if (c->noff < 1) panic("pop_off");
  c->noff -= 1;
  if (c->noff == 0 && c->intena)
    intr_on();                             // 层数归零且原来开着，才真的开
}
```

`push_off`和`pop_off`即为`acquire`和`release`中关闭和恢复中断的函数  
他们记录了嵌套层数`noff`，以及最外层关闭中断之前的状态`intena`，使得在嵌套多层锁的情况下，只有最外层的`pop_off`才会真正恢复中断状态，而且恢复的状态是最外层关闭中断之前的状态

| 场景 | noff | intena | 结果 |
|---|---|---|---|
| 普通 acquire / release | 0→1→0 | 1 | 出来时开中断 |
| 嵌套拿 A、B | 0→1→2→1→0 | 1 | 放完 B 仍关，放完 A 才开 |
| 在 trap 里（本来就关着） | 0→1→0 | 0 | 出来时保持关 |

不使用`intr_on`或者`intr_off`正是因为要考虑嵌套情况，不能中途放掉中断

:::note
xv6 的规则便是获取任何自旋锁都在本 CPU 关中断，这是一个保守的策略
:::

:::tip
必须先关中断再尝试获取锁，同理必须先释放锁再开中断
:::

## 总结

- 关中断保证本 CPU 不被打断
- 自旋锁保证别的 CPU 进不来，原子指令避免了竞争
- RELEASE / ACQUIRE 保证修改的顺序对外一致

三件事合起来，确保了临界区的安全性
