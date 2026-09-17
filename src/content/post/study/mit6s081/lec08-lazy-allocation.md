---
title: "懒分配"
publishDate: "2026-09-17"
updatedDate: "2026-09-17"
description: "懒分配的机制与实现实例，sbrk懒分配，.bss区懒分配，COW fork，Demand Paging，mmap"
seriesId: mit6s081
orderInSeries: 4
tags: ["学习", "MIT6.S081", "笔记", "操作系统"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/mit6s081/lec08/cover.webp"
    alt: "花朵与海洋"
---

## 页故障

懒分配的核心在于先记录内存需求，在真正需要使用时触发页故障，操作系统处理之后重新执行之前的指令  
这样实现了按需分配内存，应用程序无感

### 硬件机制

当RISC-V 产生页故障时，会在相应寄存器记录有关信息

- `scause`: 12 = 取指页故障，13 = load 页故障，15 = store 页故障
- `stval`: 出错的虚拟地址
- `sepc`: 故障指令本身的地址

### usertrap

同上节`ecall`，页故障在进入`trampoline.S`的`uservec()`之后进入`usertrap()`  
在`usertrap()`中寄存器`scause`被读取，只处理标记为13（load 页故障）和15（store 页故障）的故障  
此时就可以按照实际情况决定如何处理

```c
else if ((r_scause() == 15 || r_scause() == 13) &&
             vmfault(p->pagetable, p->sz, r_stval(),
                     (r_scause() == 13) ? 1 : 0) != 0)
```

## sbrk懒分配

当接收到用户程序`sbrk`系统调用时，不同于热分配的立刻`kalloc`内存，懒分配`sbrk`只是改变进程的`sz`即堆顶，其中的新页没有映射，也没有分配物理内存  
当用户读写新页时，会触发页故障，交由`usertrap()`处理，`usertrap()`调用`vmfault()`进行分配内存

### sbrk系统调用

```c
uint64
sys_sbrk(void)
{
  uint64 addr;
  int t, n;

  argint(0, &n);
  argint(1, &t);
  addr = myproc()->sz;

  if (t == SBRK_EAGER || n < 0) {
    if (growproc(n) < 0)          // 急切分配 / 收缩：走老路
      return -1;
  } else {
    // 懒分配：只加大内存尺寸，不分配物理页
    if (addr + n < addr)          // 溢出检查
      return -1;
    if (addr + n > TRAPFRAME)     // 不能顶到 trapframe / trampoline
      return -1;
    myproc()->sz += n;            // 只改账本
  }
  return addr;                    // 返回旧 sz（新堆的起始地址）
}
```

对比急切路径 `growproc`：它调用 `uvmalloc`，逐页 `kalloc` + `memset` + `mappages`，要多少内存立刻花多少

### vmfault

当用户读写新页时，会触发页故障，`usertrap()`调用`vmfault()`进行分配内存

```c
uint64
vmfault(pagetable_t pagetable, uint64 psz, uint64 va, int read)
{
  uint64 mem;

  if (va >= psz)                  // 地址必须已"申报"（在 p->sz 之内）
    return 0;
  va = PGROUNDDOWN(va);           // 按页对齐
  if (ismapped(pagetable, va))    // 不能已有 PTE
    return 0;
  mem = (uint64)kalloc();         // 现分配一页
  if (mem == 0)
    return 0;
  memset((void *)mem, 0, PGSIZE); // 清成 0（demand-zero 语义）
  if (mappages(pagetable, va, PGSIZE, mem, PTE_W | PTE_U | PTE_R) != 0) {
    kfree((void *)mem);
    return 0;
  }
  return mem;                     // 成功
}
```

`vmfault`检查发生页错误的用户虚拟地址是否合法，即

- 在进程的`sz`之内
- 不能之前被映射过

`ismapped`仅通过`walk()`设置不新分配逐级查找页表  
当页面存在页表中，而且`PTE_V`位为1时，返回该页已被映射

```c
int
ismapped(pagetable_t pagetable, uint64 va)
{
  pte_t *pte = walk(pagetable, va, 0);
  if (pte == 0)
    return 0;
  if (*pte & PTE_V)               // 只问"有没有物理页"，不问权限
    return 1;
  return 0;
}
```

通过如此检查可以方便将懒分配的页同guard page等区分开

| 地址状态 | `va >= psz` | `ismapped` | 结果 |
|---|---|---|---|
| sbrk 申报过、没碰过的页 | 否 | 否 | 分配零页 |
| `p->sz` 以上的地址 | 是 | — | 杀进程 |
| guard 页（有映射但无 `PTE_U`） | 否 | **是** | 杀进程（不会误分配） |
| COW 共享页（有映射但不可写） | 否 | 是 | 基线杀进程；COW 实现在此复制 |
| 普通已分配页 | 否 | 是 | 不会触发页故障 |

:::note
注意用户态guard页存在映射且有物理页，但是`PTE_U`为0  
内核页表中的guard页完全没有映射，不存在物理页对应
:::

### 其余修改

由于此前默认`sz`之下的所有页都已经分配了物理页，因此操作内存的相关函数需要修改适应  
查阅`defs.h`有关内存函数的声明，可以列举为下面几种

| 类别 | 函数 | 需要修改 |
| :--- | :--- | :--- |
| 建立映射 | `mappages` / `walk(alloc=1)` | 工具函数语义不变 |
| 查询翻译 | `walkaddr` / `walk` | 返回 0 从"错误"变成"还没分配" |
| 遍历释放 | `uvmunmap` / `uvmfree` / `uvmdealloc` | 遇到 V=0 从 panic 改成 continue |
| 遍历复制 | `uvmcopy` | 同上，改成 continue |

当内核写入用户空间时也需要检查页是否被映射，决定是否分配空间  
`copyout` / `copyin` / `copyinstr` 必须显式调用 `vmfault`  
用户读写文件时可能也需要检查，例如`read`传入的缓冲区地址是否已分配

## .bss区懒分配

.bss区是未初始化的全局变量和静态变量所在的段，编译器在编译时会将其大小记录在ELF文件中，但是空间大小为0  
XV6中，执行`exec()`时会调用`uvmalloc`分配.bss段的空间，并将其清零  
如果使用懒分配，只需要在物理内存分配一个全为0的页，然后将虚拟页中分配给.bss区的页全部映射到这个相同的物理页上即可，且全部标记为只读  
当用户程序第一次写入.bss区的某个变量时，会触发页故障，操作系统会分配一个新的物理页，设置为可读可写，并将该虚拟页映射到新的物理页上。此时应用程序就可以读写这个新的页面  
当`fork`时，子进程继承父进程的.bss区映射，仍然指向同一个物理页，并且标记为只读。需要写时另外分配新的物理页，与COW机制理念兼容

## COW fork

XV6的`fork`实现中，`fork`将父进程的物理内存重新复制一份给子进程。但是很多情况下`fork`会直接调用`exec`，导致物理内存白复制一份  
COW fork即为copy-on-write fork，当父进程调用`fork`时，父子进程共享同一份物理页，并且将这些页标记为只读。当父子进程中的任意一个尝试写入这些共享的页时，会触发页故障  
此时操作系统会分配一个新的物理页，复制原来的内容到新的物理页上，然后将该虚拟页映射到新的物理页上，并且标记为可读可写  
如此一来，对于不会写入的数据来说，父子进程共用一份物理页。`fork`的开销大大降低，而且在`exec`时并不会产生因为物理内存复制导致的性能浪费

实现COW fork需要注意如下几点

- 为了实现共享物理页，系统必须记录该物理页的引用计数。当某个进程释放该页时，引用计数减1，当引用计数为0时，才真正释放该物理页
- 需要在pte中新增表示cow的位，以将其与普通的只读页区分开来

## Demand Paging

XV6加载程序的方式是将程序的所有段（text、data、bss）一次性加载到内存中。对于大程序来说，可能会占用大量的内存空间，而其中有些段可能在程序运行过程中根本不会被访问到  
Demanding Paging在 `exec` 时只建立虚拟地址空间，比如为 text 和 data 分配好虚拟地址段，但对应的 PTE 不指向任何物理页，valid bit 设为 0  
当用户程序第一次加载时，位于地址 0 的第一条指令就会触发第一个 page fault，陷入内核，进入 page fault handler  
page fault handler 会根据 page fault 的地址，找到对应的段（text、data），然后从磁盘中加载对应的页到物理内存中，并更新 PTE，使其指向新的物理页，并将 valid bit 设为 1  
  
Demand Paging可能会遇到OOM的问题，当物理内存不足时，操作系统需要选择一个页进行换出  
常见的换出策略例如LRU(Least Recently Used)，但是注意例如.data区可写，所以需要把这个页记录到磁盘中的某个页，才能撤下虚拟内存  
因此pte中需要某个位标记该页是否被写过，即为dirty bit。现实中通常优先淘汰 non-dirty page，因为不需要写回，代价小  
还有一位为Access bit：该页被读或被写时置位，表示页被访问过（即为pgtbl lab里面第三道题目），用来实现决定哪个页需要被淘汰。操作系统定时清除所有页的Access bit，从而得知某些页在上一次清零过后没有被访问

## mmap

现代操作系统通常提供`mmap`系统调用，把文件的一部分或全部映射到进程的虚拟地址空间，之后程序就可以像访问内存一样，用普通的 `load`/`store` 指令来读写文件内容，而不需要显式调用 `read`/`write`  
如果采用eager策略，`mmap`会在调用时就把文件内容全部读入内存，映射到虚拟地址空间中，会大大增加内存占用  
实际操作系统几乎都采用 lazy 方式，调用`mmap`时不拷贝文件，内核记录文件内存映射关系在`VMA`(Virtual Memory Area)结构体中。用户读写内存触发异常，操作系统查`VMA`之后实际载入内存之中。之后程序就可以正常用 load/store 访问了
