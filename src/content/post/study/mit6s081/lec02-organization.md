---
title: "组织"
publishDate: "2026-09-05"
updatedDate: "2026-09-05"
description: "XV6系统组织设计，重点讨论系统启动流程"
tags: ["学习", "MIT6.S081", "笔记", "操作系统"]
seriesId: mit6s081
orderInSeries: 1
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/mit6s081/lec02/cover.webp"
    alt: "水下白沙"
---

## 模式

CPU在硬件层提供强隔离的模式，例如RISC-V提供三种模式

| 级别 | 名称 | 谁在用 |
|------|------|--------|
| 3    | M-mode（机器模式） | 上电引导代码、固件 |
| 1    | S-mode（监督者模式） | xv6 内核主体 |
| 0    | U-mode（用户模式） | 用户进程 |

这个状态通常存于CPU的某一个寄存器中，例如`00`表示U-mode，`01`表示S-mode，`11`表示M-mode  
CPU位于高权限级别时可以执行特定的特权指令

## 启动

:::warning
基于GITHUB仓库mit-pdos/xv6-riscv的RISC-V分支  
commit日期August 24, 2026 at 8:48 AM  
commit hash 为 35b0884  
[Commit地址](https://github.com/mit-pdos/xv6-riscv/commit/35b088427ef37611c38afdeed5a52a278cae38f9)  
与课本book-riscv-rev1不完全一致，主要区别在于第一个进程不使用`initcode.S`，仓库中没有这个文件
:::

### 上电

使用的XV6-RISCV运行在QEMU模拟器上  
编译内核时，内核相当于产出一个完整的大ELF可执行文件，其中kernel.ld指定`_entry`放置于`0x80000000`物理地址  
QEMU执行时，读取内核的ELF文件，默认从`0x80000000`开始执行，正好是`_entry`代码  
CPU 从 `_entry` 取第一条指令  

:::tip
此时CPU默认处于M-mode
:::

### 建栈

所有CPU都从`_entry`开始同步执行  
`_entry`主要作用在于为CPU指定栈空间  
栈空间的建立已在编译链接阶段完成，位于`kernel/start.c`中定义`char stack0[4096 * NCPU]`已经在静态区提前分配了栈空间  
`_entry`将每个CPU各自的`sp`栈指针设置为`sp = stack0 + ((hartid + 1) * 4096)`，其中`hartid`是CPU的编号  
`sp`指向所属栈中一个4096字节的空间顶部，随后向下增长  
`_entry`执行完毕`call start`

kernel/entry.S:7-19：

```assembly
_entry:
        # sp = stack0 + ((hartid + 1) * 4096)
        la sp, stack0           # sp 指向数组起始
        li a0, 1024*4           # a0 = 4096（每个 CPU 栈的大小）
        csrr a1, mhartid        # 读出自己是第几个 CPU
        addi a1, a1, 1
        mul a0, a0, a1
        add sp, sp, a0          # sp = stack0 + (hartid+1)*4096
        call start              # 跳进 C 代码
spin:
        j spin                  # 万一 start() 返回，就在这里死循环
```

### 准备

此时CPU处于M-mode，需要完成机器态才能做到事情，然后跳转到S-mode  
内容包括

> 设 mstatus.MPP=S、mepc=main、satp=0 关分页、委托中断/异常给 S、配 PMP 和时钟 timerinit()、把 hartid 存 tp；最后 mret 伪装修好"上次从 S 被调来"的现场

完成之后，CPU由M→S降级，随后跳转到`main()`函数

### main函数

每个CPU都会跳到`main()`函数执行，但是只有CPU0会做全套初始化，其余CPU自旋等待

kernel/main.c:10-45：

```c
void main()
{
  if (cpuid() == 0) {              // 只有 0 号 CPU 做全局初始化
    consoleinit();     // 控制台
    printkinit();
    kinit();           // 物理页分配器
    kvminit();         // 建内核页表
    kvminithart();     // 打开分页
    procinit();        // 进程表
    trapinit();        // trap 向量
    trapinithart();
    plicinit();        // 中断控制器
    binit(); iinit(); fileinit();  // 磁盘缓存/inode/文件表
    virtio_disk_init();// 模拟硬盘
    userinit();        // 第一个用户进程  ★
    __atomic_store_n(&started, 1, __ATOMIC_RELEASE);
  } else {
    while (started == 0) ;         // 其它核等 0 号核干完
    kvminithart(); trapinithart(); plicinithart();
  }
  scheduler();         // 进入调度器，不再返回 ★
}
```

注意从这开始才打开分页（kvminithart），此后虚拟地址才不等于物理地址

### 第一个进程

#### userinit()

CPU0在`main()`中调用`userinit()`创建第一个用户进程

kernel/proc.c:217-231：

```c
void userinit(void)
{
  struct proc *p;
  p = allocproc();       // 拿到一个 PCB
  initproc = p;
  p->cwd = namei("/");   // 工作目录设为根目录
  p->state = RUNNABLE;   // 标记为可运行，等待被调度
  release(&p->lock);
}
```

注意此时没有加载任何用户程序，它只靠 `allocproc()`（proc.c:109-150）创建了一个"骨架"进程  
`allocproc`设置`p->context.ra = (uint64)forkret`使得这个进程将来第一次被调度时，CPU 会从 `forkret` 开始执行
此时进程状态被标记为`RUNNABLE`

#### scheduler()

CPU0调用完`userinit()`与其余CPU一起进入`scheduler()`  
`scheduler()`是一个死循环，循环中不断寻找`RUNNABLE`状态的进程，找到后调用`swtch()`切换到该进程  
`swtch`（swtch.S）做的就是保存当前 CPU 的寄存器到 `c->context`，再从 `p->context` 恢复寄存器。而 `p->context` 里 `ra=forkret`、`sp`=内核栈顶，所以 CPU 一恢复，下一条要执行的指令就是 `forkret()`

#### forkret()

`forkret()` 用 `static first` 保证只执行一次  
`fsinit()` 初始化文件系统，然后 `kexec("/init")` 把 `/init` 的 ELF 读进当前进程页表，系统即将执行用户态的`/init`程序  
之后 `prepare_return()`等等，用 `sret` 完成 S→U，进入用户态

## /init

`/init` 是第一个用户进程  

- 在需要时创建标识符为0,1,2的三个文件描述符
- fork出一个子进程，子进程执行`/sh`
- 自己等待子进程结束，如果结束在死循环中再次fork出一个子进程执行`/sh`

user/init.c:14-53：

```c
int main(void)
{
  if (open("console", O_RDWR) < 0) {
    mknod("console", CONSOLE, 0);   // 需要则创建设备文件
    open("console", O_RDWR);        // 打开它
  }
  dup(0); dup(0);                   // 让它同时是 fd 0,1,2（标准输入/出/错）

  for (;;) {
    printf("init: starting sh\n");
    pid = fork();                    // 生出子进程
    if (pid == 0) {
      exec("sh", argv);              // 子进程变成 shell
      ...
    }
    wait(...);                       // 等 shell 退出；若 shell 挂了就重启它
  }
}
```

此刻系统启动完毕，shell进程已经运行，用户可以在shell中输入命令
