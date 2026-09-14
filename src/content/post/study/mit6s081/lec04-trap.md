---
title: "陷入"
publishDate: "2026-09-14"
updatedDate: "2026-09-14"
description: "trap机制，硬件处理trap，TRAMPOLINE 与 TRAPFRAME，系统调用"
seriesId: mit6s081
orderInSeries: 3
tags: ["学习", "MIT6.S081", "笔记", "操作系统", "系统调用"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/mit6s081/lec04/cover.webp"
    alt: "大树，草地与天空"
---

## 控制寄存器

trap 机制的核心是一组控制状态寄存器，它们不占用通用寄存器编号，用专门的指令读写  
本节涉及的六个寄存器都工作在S模式：`stvec`、`sepc`、`scause`、`stval`、`sscratch`、`sstatus`。用户模式不能读写它们

- `stvec`：保存 trap 处理程序的地址。硬件受理 trap 时把 `PC` 设为 `stvec`
- `sepc`：硬件受理 trap 时把当时的 `PC` 保存到 `sepc`。`sret`（从 trap 中返回）指令将 `sepc` 复制到 `pc` 中
- `scause`：放了一个数字，保存 trap 的原因
- `sscratch`：进入 trap 时的临时寄存器，用法详见trampoline部分
- `sstatus`：状态位。xv6 只使用其中三位
  - SIE（中断总开关）：控制设备/定时器中断是否被受理
  - SPIE：`sret` 后 `SIE` 的恢复值
  - SPP：记录 trap 发生前的特权级（1=内核，0=用户），`sret` 依据它决定返回哪个模式
- `stval`：trap 发生时的附加信息。对于 page fault，它保存了访问的虚拟地址

M 模式有一组功能对应的寄存器：`mstatus`、`mepc`、`mtvec`、`mcause`、`mscratch`。xv6 在启动阶段使用它们

## 硬件执行trap

当受理一个trap（包括设备中断和异常）时，硬件自动执行如下步骤

1. 判断`sstatus.SIE`是否启用了中断。若为0，则不受理，后续步骤全部不执行，直到 `SIE` 被重新置 1
2. 清除`sstatus.SIE`，禁止中断，防止嵌套
3. 将`pc`保存到`sepc`
4. 将当前模式（S模式或U模式）保存到`sstatus.SPP`
5. 将`scause`设置为 trap 的原因
6. 模式转为S模式
7. 将`pc`设置为`stvec`
8. 执行新的`pc`，跳转到`stvec`指向的 trap 处理程序

异常（ecall、页故障等）不经过第 1 步的 `SIE` 判断，一定受理。`SIE` 只影响中断  

:::note
硬件处理中断时

- 不切换页表，仍为用户页表，页表寄存器`satp`不变
- 不切换栈，仍为用户栈，`sp`不变
- 不保存除`pc`之外的寄存器

:::

由于设置了S模式，因此必须把`pc`设置为trap处理程序的地址，防止用户程序在S模式下运行

## 特殊页

用户态 trap 的处理有两个硬性约束：

1. trap 受理后，`PC` 已经跳到 `stvec`，但此时 `satp` 仍指向用户页表。除非内核代码在用户页表中也有映射，否则无法执行内核代码；而切换页表之后，`PC` 指向的下一条取指又必须在新页表中有效。这使得必须有一段内核代码在用户态和内核页表中都有映射，且映射到同一个位置。
2. 用户提供的用户栈`sp`不可信，需要独立的页面保存寄存器等数据

xv6 用两个特殊页面解决这两个问题：`TRAMPOLINE`（代码页）和 `TRAPFRAME`（数据页）

### TRAMPOLINE

`TRAMPOLINE` 是一个只读的内核代码页，映射在所有页表中，且固定位于虚拟地址空间的最高端(`MAXVA - PGSIZE`)  
该页没有 `PTE_U`，因此用户态不能读取或执行这一页  
它的内容就是`trampoline.S`编译出的机器码，包含 `uservec` 和 `userret` 两个入口  
这里便是trap受理后，硬件跳转到 `stvec` 的地址的地方。`stvec` 被设置为 `TRAMPOLINE` 的入口地址  

:::tip
同址映射的原因在于：切换内核页表发生在`TRAMPOLINE`中的`uservec`中，切换页表后，需要执行下一条指令。如果内核页表和用户页表中`TRAMPOLINE`的映射地址不同，那么下一条指令`pc + 4`之后在用户页表中正确，但是在内核页表就不知道指到哪里了
:::

### TRAPFRAME

`TRAPFRAME`映射于用户页表`TRAMPOLINE`的下方，大小为一页  
不同于`TRAMPOLINE`在所有页表中指向同一个物理页，`TRAPFRAME`是每个进程独有的，内核单独分配  
内核页表中没有映射`TRAPFRAME`，内核直接通过`p->trapframe`访问它的地址  
`TRAPFRAME`页内存放`struct trapframe`，保存了用户态的寄存器状态与系统信息

```c
struct trapframe {
  uint64 kernel_satp;   // 内核页表
  uint64 kernel_sp;     // 进程内核栈顶
  uint64 kernel_trap;   // usertrap()
  uint64 epc;           // 保存的用户程序计数器
  uint64 kernel_hartid; // 保存的内核 tp

  uint64 ra;
  // ... 中间寄存器省略 ...
  uint64 t6;
};
```

当进程被创建时，内核为其分配一页`TRAPFRAME`  
每次返回用户态前，都会设置`kernel_satp`，`kernel_sp`，`kernel_trap`，`kernel_hartid`

:::tip
当进程被创建初始化后，会从S模式转为U模式，设置上文说的几个值，然后开始执行
:::

## 用户态trap

### 总路径

1. 用户程序执行时，发生 trap (ecall、异常、中断等)，硬件执行跳转到`stvec`，即`TRAMPOLINE`的入口地址
2. 执行`trampoline.S`中的`uservec`，保存用户态寄存器到`TRAPFRAME`，切换页表到内核页表，调用`usertrap()`处理
3. `usertrap()`判断类型，调用相应函数处理
4. 处理完毕，`prepare_return()`布置返回所需的控制寄存器与 trapframe 字段，随后返回
5. `usertrap()`返回到`uservec`末尾也就是`userret`的入口，之后执行`userret`
6. `userret`切换页表到用户页表，恢复用户态寄存器
7. 执行`sret`返回用户态

### uservec

`uservec`是`trampoline.S`中定义的汇编函数

```asm
uservec:
    csrw sscratch, a0        # 暂存用户 a0，腾出一个可用寄存器
    li a0, TRAPFRAME         # a0 = 本进程 trapframe 虚拟地址
    sd ra, 40(a0)            # 保存 31 个通用寄存器
    ...
    sd t6, 280(a0)
    csrr t0, sscratch        # 取回用户 a0
    sd t0, 112(a0)           # 存入 trapframe->a0

    ld sp, 8(a0)             # kernel_sp → sp，切换到本进程内核栈
    ld tp, 32(a0)            # kernel_hartid → tp
    ld t0, 16(a0)            # kernel_trap（usertrap 地址）
    ld t1, 0(a0)             # kernel_satp（内核页表）

    sfence.vma zero, zero    # 确保上面的 store 已完成
    csrw satp, t1            # 切换到内核页表
    sfence.vma zero, zero    # 清掉 TLB 中残留的用户页表项

    jalr t0                  # 调用 usertrap；ra = 下一条指令（userret）
```

- 使用临时CSR寄存器`sscratch`保存用户态的`a0`，腾出一个寄存器用于保存`TRAPFRAME`的地址。之后将寄存器全部存入`TRAPFRAME`
- 读取`TRAPFRAME`中已经填好了的内核数据，切换到内核栈与内核页表，之后跳转到设置好的kernel_trap（即`usertrap()`）处理trap

要点：

- 所有对 trapframe 的读写都必须在 `csrw satp` 之前完成。因为内核页表不映射 `TRAPFRAME` 虚拟地址，一旦切换，`a0` 指向的地址就无法访问
- 用户 `sp` 从头到尾只被当作数据保存，从未被用作栈。真正使用的栈是从 trapframe 中读出的 `kernel_sp`

### usertrap

1. 判定 SPP 是否为 0，也就是必须是用户态进入，否则说明入口配置有误

```c
  int which_dev = 0;

  if ((r_sstatus() & SSTATUS_SPP) != 0)
    panic("usertrap: not from user mode");

```

2. 立即更换 trap 入口：从这一行`w_stvec((uint64)kernelvec)`起中断和异常由 `kernelvec` 处理。如果仍保留 `uservec`，内核态 trap 会再次进入 `uservec`，处理流程会彻底错乱

```c
  // 将中断和异常发送给 kerneltrap()，
  // 因为我们现在已在内核中。
  w_stvec((uint64)kernelvec); //DOC: kernelvec
```

3. 保存用户 PC：`p->trapframe->epc = r_sepc()`（trap.c:52）。之后会开中断并可能发生进程切换，`sepc`、`scause`、`sstatus` 都可能被新的 trap 覆盖，必须现在保存。

```c
  struct proc *p = myproc();

  // 保存用户程序计数器。
  p->trapframe->epc = r_sepc();
```

4. 按 scause 分发：
   - `scause == 8`：先检查 `killed`，然后`pc + 4`跳过 ecall 指令指向下一条，`intr_on()`开启中断，之后 `syscall()`执行系统调用
   - `devintr() != 0`：设备中断或定时器中断，设置局部变量`which_dev`
   - `scause == 15 || scause == 13` 且 `vmfault(...) != 0`（trap.c:71-74）：页故障，尝试按懒分配处理
   - 其他情况（trap.c:75-79）：打印信息，终止进程

```c
  if (r_scause() == 8) {
    // 系统调用

    if (killed(p))
      kexit(-1);

    // sepc 指向 ecall 指令，
    // 但我们希望返回到下一条指令。
    p->trapframe->epc += 4;

    // 中断会改变 sepc、scause 和 sstatus，
    // 所以只有在我们处理完这些寄存器后才启用中断。
    intr_on();

    syscall();
  } else if ((which_dev = devintr()) != 0) {
    // 正常
  } else if ((r_scause() == 15 || r_scause() == 13) &&
             vmfault(p->pagetable, p->sz, r_stval(),
                     (r_scause() == 13) ? 1 : 0) != 0) {
    // 惰性分配页面的缺页异常
  } else {
    printk("usertrap(): unexpected scause 0x%lx pid=%d\n", r_scause(), p->pid);
    printk("            sepc=0x%lx stval=0x%lx\n", r_sepc(), r_stval());
    setkilled(p);
  }

```

5. 进程已被杀则 `kexit(-1)`；若是定时器中断则 `yield()` 让出 CPU；调用 `prepare_return()`

```c
  if (killed(p))
    kexit(-1);

  // 如果这是定时器中断，就让出 CPU。
  if (which_dev == 2)
    yield();

  prepare_return();

  // 要切换到的用户页表，供 trampoline.S 使用
  uint64 satp = MAKE_SATP(p->pagetable);

  // 返回到 trampoline.S；satp 值放在 a0 中。
  return satp;
```

### prepare_return

这个函数为即将返回用户态做准备

```c
void
prepare_return(void)
{
  struct proc *p = myproc();

  // 我们即将把陷阱的目标从 kerneltrap() 切换到
  // usertrap()。因为从内核代码陷入到 usertrap 会是一场灾难，
  // 所以关闭中断。
  intr_off();

  // 将系统调用、中断和异常发送到 trampoline.S 中的 uservec
  uint64 trampoline_uservec = TRAMPOLINE + (uservec - trampoline);
  w_stvec(trampoline_uservec);

  // 设置 uservec 在进程下次陷入内核时所需的 trapframe 值。
  p->trapframe->kernel_satp = r_satp();         // 内核页表
  p->trapframe->kernel_sp = p->kstack + PGSIZE; // 进程的内核栈
  p->trapframe->kernel_trap = (uint64)usertrap;
  p->trapframe->kernel_hartid = r_tp(); // 用于 cpuid() 的 hartid

  // 设置 trampoline.S 的 sret 将用来进入用户空间的寄存器。

  unsigned long x = r_sstatus();
  x &= ~SSTATUS_SPP; // 清除 SPP 为 0，表示用户模式
  x |= SSTATUS_SPIE; // 在用户模式下启用中断
  w_sstatus(x);

  // 将 S Exception Program Counter 设置为保存的用户 pc。
  w_sepc(p->trapframe->epc);
}
```

函数操作两组数据，分别是硬件和内存数据

***硬件数据，供本次返回使用***

| 操作 | 对象 | 作用 |
|---|---|---|
| `intr_off()` | `sstatus.SIE` | 准备过程中不允许嵌套 trap |
| `w_stvec(uservec地址)` | `stvec` | 下次用户 trap 的入口 |
| `x &= ~SSTATUS_SPP` | `sstatus.SPP` | 置 0，`sret` 将返回用户模式 |
| `x \|= SSTATUS_SPIE` | `sstatus.SPIE` | 置 1，`sret` 后用户态中断开启 |
| `w_sepc(p->trapframe->epc)` | `sepc` | `sret` 的落点 |

***`trapframe` 数据，供下次进入内核时使用***

| 字段 | 值 |
|---|---|
| `kernel_satp` | `r_satp()` |
| `kernel_sp` | `p->kstack + PGSIZE` |
| `kernel_trap` | `usertrap` 地址 |
| `kernel_hartid` | `r_tp()` |

之后`prepare_return()`返回到`usertrap()`，`usertrap()`返回到`userret()`的入口

### userret

执行`userret()`时，`usertrap()`返回了用户页表地址，存储在`a0`中。`userret()`将其写入`satp`，切换到用户页表

```asm
.globl userret
userret:
        # usertrap() 返回这里，a0 = 用户进程的 satp。
        # 刷新指令缓存，防止本核此前执行过同一虚拟地址上的旧代码
        fence.i

        # 切回用户页表。与 uservec 同理，
        # 代码仍位于两张页表同址映射的 trampoline 页上
        sfence.vma zero, zero
        csrw satp, a0
        sfence.vma zero, zero

        # 用用户页表访问本进程的 trapframe
        li a0, TRAPFRAME

        # 恢复除 a0 之外的 30 个寄存器
        ld ra, 40(a0)
        # ... 中间寄存器省略 ...
        ld t6, 280(a0)

        # 最后恢复用户 a0：系统调用的返回值就在这里
        ld a0, 112(a0)

        # 返回用户态：PC←sepc，特权级←SPP，SIE←SPIE，SPIE←1
        # sepc 与 sstatus 已由 prepare_return() 设置
        sret
```
