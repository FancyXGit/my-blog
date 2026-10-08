---
title: "调度"
publishDate: "2026-10-08"
updatedDate: "2026-10-08"
description: "XV6线程调度原理与机制"
seriesId: mit6s081
orderInSeries: 7
tags: ["学习", "MIT6.S081", "笔记", "操作系统", "并行"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/mit6s081/lec11/cover.webp"
    alt: "四叶草与鹅卵石"
---

## CPU栈与进程栈

在静态区中已经提前分配好了CPU栈(`start.c`)。最开始时，CPU跑在各自的CPU栈上。`entry.S`中设置了各CPU的`sp`指针指向对应的CPU栈

```c
// entry.S needs one stack per CPU.
__attribute__((aligned(16))) char stack0[4096 * NCPU];
```

XV6为每个进程槽（共64个）分配了一个进程栈，每个进程栈之间用`guard page`隔开。`guard page`的`PTE_V`标记为0（没有映射），访问时表示栈溢出，会报错  
进程栈供进程进入内核时内核代码使用，位于内核页表中，与用户页表的用户栈完全不同  
内核进程栈的分配发生于`main()`函数中的`kvminit()`步骤，最终调用`proc_mapstacks()`函数为每个进程槽分配空间并映射到页表中  

```c
// Allocate a page for each process's kernel stack.
// Map it high in memory, followed by an invalid
// guard page.
void
proc_mapstacks(pagetable_t kpgtbl)
{
  struct proc *p;

  for (p = proc; p < &proc[NPROC]; p++) {
    char *pa = kalloc();
    if (pa == 0)
      panic("kalloc");
    uint64 va = KSTACK((int)(p - proc));  // 一次下降2页，但是只分配一页
    kvmmap(kpgtbl, va, (uint64)pa, PGSIZE, PTE_R | PTE_W);
  }
}
```

CPU栈与进程栈的关系在于，最开始CPU跑在CPU栈上，在`scheduler()`函数死循环中不断寻找可以运行的进程  
当找到时，CPU执行`swtch`函数，将`sp`切换到对应的进程栈上面，执行相应进程内核代码  
当在用户态程序中遇到中断或异常时，如果判断要执行线程切换，CPU会再次执行`swtch`函数，将`sp`切换回CPU栈上，接着走`scheduler()`函数

## 线程切换工具

:::warning
由于XV6中没有支持一个进程多线程的机制，一个进程就对应一个线程，所以所以前文对'进程切换'和'线程切换'之间的区别做了简化。本笔记进程切换和线程切换指的就是同一件事。严格来说，进入内核后，先由进程1的内核线程 `swtch` 到调度器线程，再由调度器线程 `swtch` 到进程 2 的内核线程
:::

### context结构体

`context`结构体用于保存线程的上下文，本质上就是保存了`callee-saved`寄存器的值以及`ra`，`sp`寄存器

```c
// kernel/proc.h
// Saved registers for kernel context switches.
struct context {
  uint64 ra;
  uint64 sp;
  // callee-saved
  uint64 s0, s1, ..., s11;
};
```

它被放置于两种地方，CPU自己的结构体，以及进程的结构体

- 进程的 `struct proc` 里：`struct context context; // swtch() here to run process`
- CPU 的 `struct cpu` 里：`struct context context; // swtch() here to enter scheduler()`

### swtch

`swtch`函数是执行线程切换的核心，由于要操纵寄存器所以使用汇编直接编写  
函数原型

```c
void swtch(struct context *old, struct context *new);
```

```asm
.globl swtch
swtch:
        sd ra, 0(a0)      # old->ra  = ra
        sd sp, 8(a0)      # old->sp  = sp
        sd s0, 16(a0)
        ...
        sd s11, 104(a0)

        ld ra, 0(a1)      # ra = new->ra
        ld sp, 8(a1)      # sp = new->sp     ← 换栈！
        ld s0, 16(a1)
        ...
        ld s11, 104(a1)

        ret               # = jalr x0, 0(ra)
```

其做的工作，就是把当前寄存器组(也就是`context`结构体里面的成员)存到`old`里面，然后把`new`结构体中的字段加载到寄存器中  
注意`sp`与`ra`的值也被设置为`new`结构体中的值，这样在`ret`指令执行时，就会跳转到`new->ra`指向的地址继续执行，并且使用`new->sp`作为栈指针。如此实现了栈切换与指令跳转

:::tip
`swtch`函数只保存了`callee-saved`寄存器的值，是因为其本质上是函数调用，在调用前，临时寄存器的值已经被编译器自动保存到栈上了，某一次返回到`swtch`下一条指令时（不一定是该次调用的`swtch`返回，往往会直接跳转到别的地方去），自动恢复了需要的临时寄存器的值  
`uservec`与之不同，当中断或者异常发生时硬件立刻执行对应步骤然后跳转到故障处理程序，编译器没有进行保存临时寄存器，为了使得恢复时程序正常运行，必须将全部寄存器存进`trapframe`
:::

## 线程切换过程

线程切换常见的场景是定时器中断时，CPU从一个线程切换到另一个线程，下面以此为例子讲解

### 陷入内核

触发定时器中断，进入`usertrap()`函数，`devintr()`判断为时钟中断，`which_dev`设置为`2`，之后调用`yield()`函数

```c
if (which_dev == 2)
    yield();
```

:::note
此时CPU跑在进程的对应内核进程栈上面
:::

### yield

```c
// Give up the CPU for one scheduling round.
void
yield(void)
{
  struct proc *p = myproc();
  acquire(&p->lock);
  p->state = RUNNABLE;
  sched();
  release(&p->lock);
}
```

`yield`函数将进程状态设为`RUNNABLE`，然后执行`sched()`函数，在`sched()`函数中真正发生线程的切换，做四项检查，然后 `swtch`：

```c
void sched(void) {
  int intena;
  struct proc *p = myproc();

  if (!holding(&p->lock))  panic("sched p->lock");      // 必须持有 p->lock
  if (mycpu()->noff != 1)  panic("sched locks");        // 不能持有别的锁
  if (p->state == RUNNING) panic("sched RUNNING");      // 状态必须已改
  if (intr_get())          panic("sched interruptible");// 中断必须关

  intena = mycpu()->intena;
  swtch(&p->context, &mycpu()->context);   // 保存上下文，切到调度器
  mycpu()->intena = intena;
}
```

其将旧的进程上下文保存到`p->context`里面，然后加载CPU结构体中提前保存的`mycpu()->context`  
CPU结构体中保存的数据实际上会使得其`ret`的时候跳转到`scheduler()`里`swtch`的下一行，`sp`换成CPU栈  
关于为什么`mycpu()->context`里面存了这些东西请看下文

:::note
此时跑在CPU栈中
:::

### scheduler

`scheduler()`函数是调度器的核心，死循环中反复执行下面的循环不断寻找`RUNNABLE`状态的进程，然后执行`swtch`切换到该进程

```c
for (p = proc; p < &proc[NPROC]; p++) {
  acquire(&p->lock);
  if (p->state == RUNNABLE) {
    p->state = RUNNING;
    c->proc = p;
    swtch(&c->context, &p->context);   // 切到下一个进程
    mycpu()->intena = 0;
    c->proc = 0;
    found = 1;
  }
  release(&p->lock);                   // 注意这个释放
}
```

在这里的`swtch`函数中，旧的CPU上下文保存到`mycpu()->context`里面，里面`ra`的值实际为`scheduler()`函数中`swtch`的下一行，`sp`的值为CPU栈。因此下次进程再次调度时，`sched`函数中切换的`mycpu()->context`便是已经存好了的  
注意到`yield`中获取的线程锁，`scheduler`中才释放。这样是使得进程切换的过程中，在临界区，也就是改变了`proc->state`为`RUNNABLE`但是还没有切换到调度器线程中时，其他CPU不会调度到该进程上来。否则两个CPU同时读写进程栈，造成混乱  
下面是临界区保护的不变性

1. 进程 `RUNNING`：寄存器在 CPU 里、`c->proc` 指向它；
2. 进程 `RUNNABLE`：`p->context` 存着寄存器、没有 CPU 在它的栈上、没有 `c->proc` 指向它；

持 `p->lock` 时上述不变式常为假，锁把"中间态"藏起来

### 返回

当找到到`RUNNABLE`状态的进程后，执行`swtch(&c->context, &p->context)`，CPU上下文切换到该进程的内核栈上，继续执行该进程的内核代码  
之后与常规系统调用一致，正常返回到用户态程序中

```c
prepare_return();
uint64 satp = MAKE_SATP(p->pagetable);
return satp;    // 交给 trampoline.S 的 userret，执行 sret 回用户态
```

对于之前挂起的进程而言，`p->context`在调度过程中在`sched`函数被保存  
对于新进程，是`allocproc()` 手工伪造的：`ra = forkret`、`sp = 栈顶`。所以它第一次被调度，不是回到某个`sched`，而是"返回"到 `forkret`

```c
void forkret(void) {
  struct proc *p = myproc();

  // Still holding p->lock from scheduler.
  release(&p->lock);        // ← forkret 存在的意义：释放调度器交接过来的锁
  ...
  prepare_return();         // 模仿 usertrap 的返回，回到用户态
  ...
  // 这里直接调用userret
}
```

`forkret`与一般进程返回不同，它直接调用`trampoline.S`中的`userret`函数返回

## mycpu与myproc

### mycpu

```c
struct cpu {
  struct proc *proc;      // 本 CPU 当前运行的进程，或 null
  struct context context; // swtch() here to enter scheduler()
  int noff;               // push_off() 嵌套深度
  int intena;             // push_off 之前中断是否开着
};
extern struct cpu cpus[NCPU];   // NCPU = 8
```

各CPU依照`hart_id`索引到`cpus`数组中，由`cpuid()`函数返回当前CPU的索引。`cpuid()`函数通过读取`tp`寄存器的值来获取当前CPU的索引，`tp`寄存器在启动时被设置为CPU的索引值

```c
int cpuid()
{
  int id = r_tp();
  return id;
}
```

`mycpu()`函数返回当前CPU的结构体指针

```c
struct cpu *mycpu(void)
{
  int id = cpuid();
  struct cpu *c = &cpus[id];
  return c;
}
```

`cpu`结构体中的`proc`字段只在调度器`scheduler()`中被设置为当前运行的进程，其他时候为`0`

```c
c->proc = 0;        // 进入循环前 / 进程让出后
...
c->proc = p;        // 选中进程、swtch 之前
```

### myproc

`cpu->proc`的唯一的读者是`myproc()`函数，它返回CPU当前运行的进程指针。需要关闭中断的原因在于，若在 `mycpu()` 返回 `c` 之后、读取 `c->proc` 之前发生中断并触发调度，当前线程可能被迁到另一个 CPU，`c` 就指向了错误的 CPU，读到的 `proc` 也不对，所以必须关中断

```c
struct proc *myproc(void) {
  push_off();
  struct cpu *c = mycpu();
  struct proc *p = c->proc;
  pop_off();
  return p;
}
```

### tp

`tp`寄存器在启动时被设置为CPU的索引值。RISC-V 给每核一个`mhartid`，但它是机器模式 CSR，S模式读不了。于是 xv6 在启动早期把它抄进 `tp`（x4）  
内核态中，`tp`寄存器一定为当前CPU的索引值，这是由以下保证的

1. 返回用户态前， `prepare_return()` 函数中设置了`trapframe->kernel_hartid`为当前的`tp`值
2. 用户态进入内核态时，将`tp`寄存器设置为`trapframe->kernel_hartid`
3. 在返回用户态之后，进入内核态之前，用户态程序中`trapframe->kernel_hartid`的`PTE_U`标记为0，用户态程序无法修改该值。且进程会一直运行在同一个核上面，如果要切换核，必须走一遍完整的调度流程，避免不了进入内核态

由此，无论用户态程序如何修改`tp`寄存器的值，进入内核时`tp`的值已经被管理好且准确
