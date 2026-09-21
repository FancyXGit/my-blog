---
title: "中断"
publishDate: "2026-09-21"
updatedDate: "2026-09-21"
description: "XV6中断实施机制，UART硬件基础，输入输出中断，时钟中断"
seriesId: mit6s081
orderInSeries: 5
tags: ["学习", "MIT6.S081", "笔记", "操作系统"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/mit6s081/lec09/cover.webp"
    alt: "海洋与列车"
---

## 驱动

驱动是操作系统内核用于控制管理硬件的代码，例如控制键盘，磁盘，网卡，显卡等  
驱动代码可分为两半

- 上半部分(top): 进程调用系统调用(`read` / `write`等)时，在该进程的内核线程里执行的驱动代码，可以sleep
- 下半部分(bottom): 设备中断到来时执行的驱动代码，无进程上下文，必须尽快做完并返回，不能sleep

## 硬件基础

### UART

UART 全称 Universal Asynchronous Receiver/Transmitter（通用异步收发器）。它是一块硬件，工作在 CPU 总线和一条串行线之间  

- CPU一侧：并行，一次读8位
- 串行线一侧：串行，一次传输1位

UART实施串行与并行之间的转换

:::tip
实施如此转换的原因是因为串行线通常很长，如果使用并行可能出现干扰与信号延迟（不同时到达）的问题
:::

下面是一个常见的UART用途

1. 键盘并行输入通过UART变为串行到达CPU的UART
2. CPU通过UART将串行数据变为并行进行处理
3. 处理完毕通过UART将并行数据变为串行发送
4. 串行数据到达UART后变为并行输出到屏幕

```txt
    终端设备（比如 VT100）                          主机（跑 xv6 的机器）
  ┌──────────────────────┐                   ┌──────────────────────┐
  │ 键盘 ──→ 终端UART TX ─┼──────────────────→┼─ RX 主机UART ──→ CPU  │
  │ 屏幕 ←── 终端UART RX ─┼←──────────────────┼─ TX 主机UART ←── CPU  │
  └──────────────────────┘                   └──────────────────────┘
                        两根信号线 + 一根地线（TX 与 RX 交叉）
```

### 终端

终端是一台只有键盘和显示能力的设备

- 敲键盘： 键盘将按键转换为ASCII码然后从自己的TX发送
- 显示： 终端从自己的RX接收ASCII码然后显示在屏幕上

:::tip
终端经典实物是 Teletype（`tty` 这个词的来源）和 DEC VT100。今天它们被终端模拟器取代  
xterm、PuTTY、minicom、Windows Terminal、VS Code 的集成终端。它们假装自己是一台VT100  
他们把键盘输入编码成字节交给程序，把程序输出的字节解释并画到窗口里
:::

下面显示了终端与主机的典型配置方式，当键盘上敲一个字，屏幕上显示时，实际发生了以下步骤

1. 终端把按键解释成ASCII 码（例如 `a` = 0x61），交给终端自己的 UART
2. 终端UART通过TX线一位一位发出去
3. 主机UART收到，放进接收缓存区，然后触发中断提醒CPU
4. CPU中断，调用中断处理函数
5. CPU执行回显，把0x61写到主机UART的TX寄存器
6. 主机 UART 通过 TX 线把 0x61 发回终端
7. 终端把 0x61 查字形、画在光标处，光标右移

字体渲染发生在终端一侧，终端将ASCII码变为点阵显示在屏幕上

### 内存映射

低位的物理地址被I/O设备占用，CPU访问这些地址时会被路由到I/O设备而不是内存  
XV6中将UART寄存器映射到固定地址`UART0`，通过偏移可以访问不同的寄存器  
UART硬件通过读写操作与某些寄存器位扩展寄存器，指的是读和写某个内存地址操作的对于寄存器可能不同  
下面是XV6用到的几个偏移寄存器

| 偏移 | 读 | 写 | 作用 |
|---|---|---|---|
| 0 | RHR | THR | 读=取一个收到的字节；写=发送一个字节 |
| 1 | IER | IER | 中断使能：bit0 接收、bit1 发送 |
| 2 | ISR / IIR | FCR | 读=中断状态（读一下即确认中断）；写=FIFO 控制（使能/清空） |
| 3 | LCR | LCR | 线路控制：字长、校验、DLAB |
| 5 | LSR | — | 线路状态：bit0 有输入待读；bit5 可发下一字节 |

FIFO指UART内部的先进先出缓冲区，入口和出口各一个

## 初始化

### 控制台缓冲区

`console.c`中定义的环形缓冲区宽128字节，运行时就已经在.bss区分配空间

```c
struct {
  struct spinlock lock;

  // input circular buffer
#define INPUT_BUF_SIZE 128
  char buf[INPUT_BUF_SIZE];
  uint r; // Read index
  uint w; // Write index
  uint e; // Edit index
} cons;
```

其有3个指针

- `e`: 编辑指针，收到字符`++`，退格`--`
- `w`: 提交指针，收到`\n`，缓冲区满等情况时将`w`设置为`e`
- `r`: 读取指针，读取时前进

初始时`e = w = r = 0`，缓冲区为空，始终保持`r <= w <= e`  
三个都是不回绕、不重置为 0的计数器（数组下标才做取模）

```txt
           0 ...... r ........... w .......... e ............ 127
         [ 已读/废弃 ]  [ 已提交可读 ]  [ 正在编辑区 ]
            r          w-r 字节        e-w 字节
```

- `0` - `r`： 已读被抛弃
- `r` - `w`： 已提交待读取
- `w` - `e`： 正在编辑

:::warning
注意上图0和127应该连在一起成环，仅仅为了方便起见将`r`、`w`、`e`置于0和127之间
:::

### uartinit

启动时CPU0调用`consoleinit()`，`consoleinit()`调用`uartinit()`，初始化UART，其实就是设置UART硬件寄存器的不同位  

`uartinit()`只是打开了UART设备内部的中断以及设置其他设置，中断送达CPU还需要下面几点

- `sstatus.SIE`，`sie.SEIE`被设置允许中断
- PLIC初始化

:::tip
`sie`是单独的一个控制寄存器（不同于`sstatus.SIE`），其中的某些位可以精细控制是否处理中断  
例如bit（E）专门针对例如UART的外部设备的中断；有一个bit（S）专门针对软件中断；还有一个bit（T）专门针对定时器中断
:::

### consoleinit

从`uartinit()`返回后，`consoleinit()`将`read/write`系统调用接到驱动函数上

```c
  // connect read and write system calls
  // to consoleread and consolewrite.
  devsw[CONSOLE].read = consoleread;
  devsw[CONSOLE].write = consolewrite;
```

`devsw`是函数指针数组，定义在`file.c`里面

```c
struct devsw {
  int (*read)(int, uint64, int);
  int (*write)(int, uint64, int);
};
extern struct devsw devsw[];
```

`CONSOLE`是一个宏，定义为1  
调用`read/write`等，通过`devsw[CONSOLE]`调用到对应函数

### plicinit

PLIC（Platform-Level Interrupt Controller，平台级中断控制器）是RISC-V 标准的中断控制器  
它负责收集所有外部设备中断（UART、virtio 磁盘等），按优先级仲裁后转发给某个CPU核的 M/S 模式  
具体流程是

1. PLIC通知有待处理的中断
2. 某一个CPU核接受中断，PLIC不会把中断送到其他CPU核
3. CPU核处理完毕通知PLIC
4. PLIC清除中断信息

:::note
所有的CPU都能收到中断，但是只有一个CPU会处理相应的中断
:::

`plicinit()`设置全局值，之后每个核分别执行`plicinithart()`，完成该核的PLIC初始化

### init.c

`user/init.c`负责将文件描述符`0`、`1`、`2`（标准输入、输出、错误）全部指向`CONSOLE`

由于所有进程由`shell` `fork` 出来，而`shell`来自于`init`，因此所有进程的标准输入输出都指向`CONSOLE`

```c
if (open("console", O_RDWR) < 0) {
    mknod("console", CONSOLE, 0);
    open("console", O_RDWR);
  }
  dup(0); // stdout
  dup(0); // stderr
```

## 输入

:::note
输入与输出都以用户态系统调用讲解
:::

### fileread

`read`系统调用最终抵达`fileread()`，`f`参数为根据用户提供的文件描述符查到的`file`结构体  
一般读取`stdin`，其文件为`CONSOLE`，其`f->type = FD_DEVICE`，因此走`FD_DEVICE`分支  

```c
else if (f->type == FD_DEVICE) {
    if (f->major < 0 || f->major >= NDEV || !devsw[f->major].read)
      return -1;
    r = devsw[f->major].read(1, addr, n);
  }
```

执行`devsw[f->major].read(1, addr, n)`，而`f->major`是`CONSOLE`  
在`consoleinit`中设置了`devsw[CONSOLE].read = consoleread`，因此最终执行`consoleread()`  

### consoleread

```c
target = n;
acquire(&cons.lock);
while (n > 0) {
  while (cons.r == cons.w) {              // 没有完整行可读
    if (killed(myproc())) { release; return -1; }
    sleep_prepare(&cons.r);               // 登记：我在等 &cons.r 这个事件
    release(&cons.lock);                  // 睡之前必须放锁！
    sleep();                              // 挂起，让出 CPU
    acquire(&cons.lock);                  // 醒来重新拿锁
  }
  c = cons.buf[cons.r++ % INPUT_BUF_SIZE];     // 取一个字节
  if (c == C('D')) {                            // Ctrl-D = EOF
    if (n < target) cons.r--;                   // 本次已读到数据 → 留到下次处理
    break;                                      // 否则返回 0
  }
  cbuf = c;
  either_copyout(..., &cbuf, 1);                // 拷到用户空间
  dst++; --n;
  if (c == '\n') break;                         // 整行取完
}
release(&cons.lock);
return target - n;                              // 实际读到的字节数
```

- 当用户没有敲入`\n`时，`cons.r == cons.w`成立，因此`consoleread()`会睡眠，等待唤醒
- 当用户敲入`\n`时，触发中断，`cons.w`被设置为`cons.e`，此时发送以下步骤

1. 中断相关函数将在`cons.r`上阻塞的`consoleread()`唤醒
2. 获取`cons.lock`锁
3. 检查while条件，发现不成立，跳出循环
4. 逐字节拷贝到用户空间，同时`cons.r++`，直到遇到`\n`或读到设定数量

:::tip
`cons.lock`是全局环形缓存区的锁，持有该锁时，其余想`acquire(&cons.lock)`的线程都会自旋等待  
`sleep_prepare(&cons.r)`在进程中标记，其余函数可以通过`wakeup(&cons.r)`唤醒该进程  
:::

:::note
在真正进入`sleep()`之前，必须先释放`cons.lock`，是因为中断函数写入缓冲区也需要获得`cons.lock`，如果不释放锁，中断函数就无法获得锁，`consoleread()`就永远睡不醒了  
在`sleep()`返回后，必须重新获得`cons.lock`，然后再次检查缓冲区。这是因为可能有其余函数在`sleep()`返回后，抢先获得了`cons.lock`，并读完了缓冲区。此时函数再次获得`cons.lock`检查条件为假，继续睡觉
:::

### (read)uartintr

触发中断时进入`usertrap()`函数，其调用`devintr()`检查是否为外部设备中断  
键盘输入为UART中断，`devintr()`调用`uartintr()`处理UART中断

```c
ReadReg(ISR);                       // 读一下，确认中断
if (ReadReg(LSR) & LSR_TX_IDLE)
  wakeup(&tx_chan);                 // 发送完成 → 唤醒写者（见输出部分）
while (1) {
  int c = uartgetc();               // 有字符返回字符，没有返回 -1
  if (c == -1) break;
  consoleintr(c);
}
```

通过循环调用`uartgetc()`，从UART的接收FIFO中取出一个字节，之后调用`consoleintr(c)`处理  

### consoleintr

```c
acquire(&cons.lock);
switch (c) {
case C('P'): procdump(); break;                        // Ctrl-P 打印进程表
case C('U'): 删到行首，cons.e-- + consputc(BACKSPACE); break;   // Ctrl-U 杀整行
case C('H'): case '\x7f': 删一个；break;                // 退格 / Delete
default:
  if (c != 0 && cons.e - cons.r < INPUT_BUF_SIZE) {    // 缓冲满就丢弃
    c = (c == '\r') ? '\n' : c;                        // 回车统一成换行
    consputc(c);                                       // 立即回显
    cons.buf[cons.e++ % INPUT_BUF_SIZE] = c;           // 存进缓冲
    if (c == '\n' || c == C('D') || cons.e - cons.r == INPUT_BUF_SIZE) {
      cons.w = cons.e;                                 // 交付整行
      wakeup(&cons.r);                                 // 唤醒读者
    }
  }
}
release(&cons.lock);
```

`consoleintr()`获取缓冲区锁后，处理特殊字符之后，将字符存入缓冲区  
读到整行之后设置`cons.w = cons.e`，并通过`wakeup(&cons.r)`唤醒在`cons.r`上阻塞的`consoleread()`

:::tip
`consputc(c)`立刻将打出的字符发送到终端显示，和`shell`的`read`系统调用无关
:::

:::note
前面提到的top/bottom在这里体现  

- top: `consoleread()`，在进程上下文中执行，可以sleep
- bottom: `consoleintr()`，在中断上下文中执行，不能sleep

:::

## 输出

### consolewrite

和`read`类似，`write`系统调用最终抵达`filewrite()`，走`FD_DEVICE`分支，执行`consolewrite()`  

```c
char buf[32];
while (i < n) {
  int nn = min(sizeof(buf), n - i);
  either_copyin(buf, user_src, src + i, nn);   // 用户指针不能直接解引用
  uartwrite(buf, nn);
  i += nn;
}
return i;
```

### uartwrite

`consolewrite()`将用户空间的内容分批拷贝到内核空间，然后调用`uartwrite()`发送到UART

```c
void uartwrite(char buf[], int n) {
  acquiresleep(&tx_lock);              // 串行化多个写者
  int i = 0;
  while (i < n) {
    sleep_prepare(&tx_chan);           // 先登记"我会等发送完成"
    if (ReadReg(LSR) & LSR_TX_IDLE) {  // 硬件能收吗
      WriteReg(THR, buf[i]);           // 能就写一个字节
      i += 1;
    } else {
      sleep();                         // 不能就睡，等中断叫
    }
  }
  releasesleep(&tx_lock);
}
```

`uartwrite`直接逐字节写硬件，两个关键变量

- `tx_lock`（睡眠锁）：保证多个写者的字节不交错，阻塞其他的`write`调用
- `tx_chan`（与`read`的`cons.r`类似）：发送完成事件的等待通道。当硬件忙时，写者睡在`tx_chan`上，等待中断唤醒

整个 `uartwrite` 期间都持有 `tx_lock`，因此只有当前写者写完了全部，才会轮到下一个写者

### (write)uartintr

:::note
UART在收到字符或者可以接受下一个发出字节时，会发出中断，处理函数都是同一个`uartintr`
:::

```c
void uartintr(void) {
  ReadReg(ISR);                        // 确认中断
  if (ReadReg(LSR) & LSR_TX_IDLE) {    // 是"发送完成"吗
    wakeup(&tx_chan);                  // 叫醒可能在 uartwrite 里睡的进程
  }
  while (1) {                          // 输入部分
    int c = uartgetc();
    if (c == -1) break;
    consoleintr(c);
  }
}
```

:::tip
关于锁的更多知识请看下一章
:::

## 定时器中断

进程不主动让出 CPU 时，需要被强制打断，给调度器换人的机会  
同时定时中断起到计时作用，内核维护一个递增的 ticks 计数器以记录时间

### 硬件

机器全局有一个不断递增的 time 计数器，再配每个核一个的阈值寄存器  
time 到达阈值时硬件抛定时器中断。处理完把阈值往后推，就形成周期中断  
在周期中断时，CPU可以调度其他进程

| 部件 | 范围 | 说明 |
|---|---|---|
| `time` | 全机共享 | 所有 CPU 读到同一个值，相当于一块共享秒表 |
| `stimecmp` | 每 CPU 一个 | 各 CPU 的"闹钟"，到点只有该 CPU 收到中断 |
| `ticks` | 内核里全局一个 | 由 CPU0 单独更新，把多个本地闹钟汇总成系统时钟 |

### 定时初始化

在`main()`之前的`start()`函数中调用`timerinit()`，设置好了计时器配置

```c
w_menvcfg(r_menvcfg() | MENVCFG_STCE);  // 打开 Sstc（否则写 stimecmp 非法）
w_mcounteren(r_mcounteren() | 2);       // 允许 S 模式读 time
w_stimecmp(r_time() + 1000000);         // 第一次定时：约 0.1 秒后（QEMU）
```

### 中断处理

定时器到点产生监督者定时器中断，`scause = 0x8000000000000005`
它和 UART 的外部中断同样走`devintr()`，分发到`clockintr()`

```c
else if (scause == 0x8000000000000005L) {
    // timer interrupt.
    clockintr();
    return 2;
  }
```

`clockintr()`由 CPU0 负责推进全局时钟`ticks`，并唤醒在`ticks`上睡的进程

```c
if (cpuid() == 0) {          // 只有 CPU0 推进全局时钟
  acquire(&tickslock);
  ticks++;
  wakeup(&ticks);            // 叫醒在等时间流逝的进程（如 sys_pause）
  release(&tickslock);
}
w_stimecmp(r_time() + 1000000);   // 每个 CPU 都安排自己的下一次
```

`devintr` 返回 2 后，两个 trap 入口决定是否让出 CPU：

```c
// usertrap（用户态被打断）
if (which_dev == 2) yield();

// kerneltrap（内核态被打断）
if (which_dev == 2 && myproc() != 0) yield();
```

内核并不是随时可被抢占：持自旋锁、关中断期间定时器中断会被挂起，直到开中断后才真正处理，所以内核临界区是安全的
