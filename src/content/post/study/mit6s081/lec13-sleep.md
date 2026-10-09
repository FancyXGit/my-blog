---
title: "睡眠"
publishDate: "2026-10-09"
updatedDate: "2026-10-09"
description: "XV6的sleep与wakeup机制，睡眠锁"
seriesId: mit6s081
orderInSeries: 8
tags: ["学习", "MIT6.S081", "笔记", "操作系统", "并发"]
coverImage:
    src: "https://cdn.fancyflow.top/image/post/study/mit6s081/lec13/cover.webp"
    alt: "樱花"
---

## 睡眠与唤醒机制

当进程需要等待某个条件时，例如磁盘I/O完成，某个资源可用时，可以使用睡眠机制让出CPU。当条件满足时，再由别的进程唤醒。核心函数是`sleep_prepare()`、`sleep()`和`wakeup()`  
`sleep_prepare()`函数将进程的睡眠状态联系于某个变量`chan`中，这个变量由进程自己选取。随后调用`sleep()`真正进入睡眠，本质上就是把进程状态设置为`SLEEPING`，调用`sched()`让出CPU。`wakeup()`函数则是遍历所有进程，找到所有系在`chan`上的进程，将其状态有条件地设置为`RUNNABLE`，等待调度器调度运行

### sleep_prepare

```c
// Register current process as waiting for wakeups on chan.
void
sleep_prepare(void *chan)
{
  struct proc *p = myproc();

  acquire(&p->lock);
  if (chan == 0)
    panic("sleep_prepare: zero chan");
  p->chan = chan;
  release(&p->lock);
}
```

`sleep_prepare()`做的事情非常简单，就是将`chan`记录到进程结构体中的`p->chan`字段中。函数只执行登记，没有进行睡眠，状态仍然是`RUNNING`

### sleep

```c
// Put the thread to sleep.  Assumes sleep_prepare() was called before.
// If the channel registered by sleep_prepare() has been woken up in
// the meantime, do not go to sleep, and instead return immediately.
void
sleep(void)
{
  struct proc *p = myproc();

  acquire(&p->lock);
  if (p->chan != 0) {
    p->state = SLEEPING;
    sched();
  }
  release(&p->lock);
}
```

`sleep()`函数假设`sleep_prepare()`已经被调用过了。当检查到`p->chan`不为`0`时，说明进程需要睡眠，设置状态，之后调用`sched()`让出CPU  

### wakeup

```c
void wakeup(void *chan) {
  struct proc *p;

  for (p = proc; p < &proc[NPROC]; p++) {   // 暴力扫描整个进程表
    acquire(&p->lock);
    if (p->chan == chan) {
      p->chan = 0;                          // 无条件清票据
      if (p->state == SLEEPING)             // 只有真睡下才改状态
        p->state = RUNNABLE;
    }
    release(&p->lock);
  }
}
```

一次`wakeup`会命中通道上所有进程，即广播。它简单将对应`SLEEPING`进程的状态设置为`RUNNABLE`，使之可以被调度器调度运行，同时还将`p->chan`清零

### 防丢唤醒

```c
int n = 0;                 // 共享：缓冲区里有几个数据

// 进程1
if (n == 0) {              // 检查条件
    sleep_prepare(chan);   // 登记等待：p->chan = chan
    // 此处可能被唤醒
    sleep();               // 睡
}

// 进程2
n = 1;                     // 条件变真
wakeup(chan);              // 通知
```

简单的睡眠实现可能类似上面这样，进程1登记之后直接睡了，进程2唤醒进程1  
这样会出现丢唤醒的问题，假如进程1的`sleep_prepare`和`sleep`之间的时间间隔内，进程2执行`wakeup`，如果`sleep`是无条件直接睡眠，那么在睡眠期间进程1永远也不会被唤醒。解决方法的重点在于`sleep`函数，当`p->chan`为`0`时直接返回，不进入睡眠状态

### 范式

XV6中通用的睡眠写法如下

```c
// 睡觉侧
acquire(&条件锁);
while (条件不满足) {          // 必须用循环！
    sleep_prepare(chan);      // 先登记
    release(&条件锁);          // 再放条件锁（自旋锁不能跨睡眠持有）
    sleep();
    acquire(&条件锁);          // 醒来重拿
}
// 条件满足，操作资源
release(&条件锁);

// 唤醒侧
acquire(&条件锁);
修改条件;
wakeup(chan);                 // 必须持条件锁
release(&条件锁);
```

要求是睡眠端和唤醒端需要能够持有同一把锁，使得一个时间端之内，只能有一个进程唤醒，或者一个进程切换自身状态进入睡眠  
下面是几个注意点

1. 睡眠侧在循环条件前先持有锁，之后登记睡眠通道，在`sleep`之前释放锁。这是由于`sleep`函数中的`sched`函数要求不得持有`p->lock`以外的锁，以避免死锁。此外，唤醒侧也需要持有同样的锁，如果带锁睡觉唤醒侧就无法唤醒，永远死锁。
2. 被唤醒之后再次尝试持有锁，然后再循环一遍检查条件。这是因为可能有多个进程在同一个通道上睡眠，唤醒之后只有一个进程能够持有锁，之后检查条件通过，跳出，再释放锁，其余进程再次获取锁，再检查新的条件，如果满足同前面跳出，不满足继续进行睡眠，使得进程一个一个地释放。本质原因在于`wakeup`是广播唤醒，而资源可能只够一个或者部分进程使用
3. 将睡眠侧条件判断与`sleep_prepare`用锁包裹，使得判断条件与通道通道成为原子性操作，条件不通过的进程必定登记了通道。若将`release(&条件锁)`放在`sleep_prepare`之前，可能出现`release`之后，唤醒测直接`wakeup`，此时睡眠测还没有执行`sleep_prepare`，之后睡眠测继续执行`sleep`，就会出现丢唤醒问题
4. 唤醒侧必须持有锁，保证了睡觉和唤醒两个动作互相不交错。若唤醒侧不持锁，那么睡眠侧的锁根本挡不住唤醒
5. `sleep`函数，当`p->chan`为`0`时直接返回，解决了`sleep_prepare`和`sleep`之间时间来唤醒时候的丢唤醒问题

## 管道

管道是上述睡眠机制的实施范例

### 结构

管道的核心是一个环形缓冲区与两个不回绕的递增读写计数器

```c
#define PIPESIZE 512
struct pipe {
  struct spinlock lock;
  char data[PIPESIZE];
  uint nread;    // 累计读
  uint nwrite;   // 累计写
  int readopen;
  int writeopen;
};
```

它拥有两个独立的等待通道

- 读：当缓冲区空时睡眠，由写者在写完时唤醒
- 写：当缓冲区满时睡眠，由读者在读走时唤醒

读写只允许一次一个进程进入，其余进程自旋等待。睡眠用于本身缓冲区空或者满的情况

### pipewrite

```c
acquire(&pi->lock);
while (i < n) {
  if (pi->readopen == 0 || killed(pr)) { release(&pi->lock); return -1; }
  if (pi->nwrite == pi->nread + PIPESIZE) {   // 满
    wakeup(&pi->nread);                       // 先叫醒读者来排水
    sleep_prepare(&pi->nwrite);
    release(&pi->lock);
    sleep();
    acquire(&pi->lock);
  } else {
    char ch;
    if (copyin(pr->pagetable, pr->sz, &ch, addr + i, 1) == -1) { ... }
    pi->data[pi->nwrite++ % PIPESIZE] = ch;
    i++;
  }
}
wakeup(&pi->nread);                            // 写完通知读者
release(&pi->lock);
```

与上文论述一致，当缓冲区满时，写者不能再写，进入睡眠  
当从睡眠中唤醒，重新拿到锁，进入`else`分支，此后一直持有锁，一次写入一个字节，不断循环，直到写完或者缓冲区又满了，两种情况都会唤醒读者，然后释放锁。保证了管道读写的互斥性

### piperead

```c
acquire(&pi->lock);
while (pi->nread == pi->nwrite && pi->writeopen) {   // 空且写端还开
  if (killed(pr)) { release(&pi->lock); return -1; }
  sleep_prepare(&pi->nread);
  release(&pi->lock);
  sleep();
  acquire(&pi->lock);
}
for (i = 0; i < n; i++) {
  if (pi->nread == pi->nwrite) break;
  ch = pi->data[pi->nread % PIPESIZE];
  if (copyout(...) == -1) { ... }
  pi->nread++;
}
wakeup(&pi->nwrite);                                 // 读走通知写者
release(&pi->lock);
```

`piperead`与`pipewrite`是对称关系

## 睡眠锁

```c
struct sleeplock {
  uint locked;        // Is the lock held?
  struct spinlock lk; // spinlock protecting this sleep lock

  // For debugging:
  char *name; // Name of lock.
  int pid;    // Process holding lock
};
```

```c
void acquiresleep(struct sleeplock *lk)
{
  acquire(&lk->lk);
  while (lk->locked) {
    sleep_prepare(lk);
    release(&lk->lk);
    sleep();
    acquire(&lk->lk);
  }
  lk->locked = 1;
  lk->pid = myproc()->pid;
  release(&lk->lk);
}
```

```c
void releasesleep(struct sleeplock *lk)
{
  acquire(&lk->lk);
  lk->locked = 0;
  lk->pid = 0;
  wakeup(lk);
  release(&lk->lk);
}
```

睡眠锁便是睡眠范例的直接应用，自旋锁便是睡眠锁的保护锁。原理与上文一致，这里不再次赘述

## wait/exit/kill

- `wait`：父进程等待子进程退出，收集子进程的退出状态
- `exit`：子进程退出，醒父进程，设置自己状态为`ZOMBIE`
- `kill`：杀死进程，设置标志位`killed`

### wait

子进程退出后变成`ZOMBIE`，等父进程`wait`处理  
全局自旋锁`wait_lock`保护父子关系  

```C
int kwait(uint64 addr)
{
  acquire(&wait_lock);
  for (;;) {
    havekids = 0;
    for (pp = proc; pp < &proc[NPROC]; pp++) {
      if (pp->parent == p) {
        acquire(&pp->lock);
        havekids = 1;
        if (pp->state == ZOMBIE) {
          pid = pp->pid;
          if (addr != 0) copyout(..., &pp->xstate, ...);
          pp->parent = 0;
          freeproc(pp);
          release(&pp->lock); release(&wait_lock);
          return pid;                    // 收一个就返回
        }
        release(&pp->lock);
      }
    }
  if (!havekids || killed(p)) { release(&wait_lock); return -1; }
  sleep_prepare(p);                    // 通道 = 父进程自己
  release(&wait_lock);
  sleep();
  acquire(&wait_lock);
  }
}
```

`kwait`在持有`wait_lock`的情况下，遍历所有进程，找到所有子进程，如果没有子进程或者自己被杀死，直接退出  
如果找到了一个状态为`ZOMBIE`的子进程，释放子进程再释放锁之后返回子进程`pid`退出  
如果有子进程但是没有`ZOMBIE`，则登记睡眠通道为父进程自己，释放锁，进入睡眠。被唤醒之后重新获取锁，继续循环  
一次`kwait`只会收一个子进程，之后返回。若父进程想收所有子进程，需要循环调用`kwait`

### exit

```c
void
kexit(int status)
{
  // 前面是相关清理操作，比如关文件
  acquire(&wait_lock);
  reparent(p);              // 孩子过继给 init，并 wakeup(initproc)
  wakeup(p->parent);        // 唤醒可能在 wait 中睡的父进程
  acquire(&p->lock);
  p->xstate = status;
  p->state = ZOMBIE;        // 必须在 p->lock 下设
  release(&wait_lock);
  sched();                  // 永不返回
  panic("zombie exit");
}
```

`kexit`把自己的子进程托管给init进程，然后唤醒父进程，之后设置自己的状态  
整个过程中都持有`wait_lock`锁，让父进程被叫醒后自旋等待状态被改好

### kill

```c
int kkill(int pid)
{
  // 用循环找到对应进程，下面是循环体内部的
  acquire(&p->lock);
  if (p->pid == pid) {
    p->killed = 1;
    if (p->state == SLEEPING)
      p->state = RUNNABLE;      // 直接改状态，没有 wakeup
    release(&p->lock);
    return 0;
  }
  // 之后处理没找的，释放锁
}
```

`kill`设置标志位`killed`为`1`，如果进程处于睡眠状态，直接将其状态改为`RUNNABLE`，使得进程下次被调度之后的某个时机被杀死  
不使用`wakeup`的原因在于

1. `kill`不需要唤醒所有睡眠在同一通道的进程，只需要唤醒一个进程即可
2. 持`p->lock`时调`wakeup`会再次`acquire(&p->lock)`同一把锁，死锁

`kill`是惰性的，`kkill`不负责杀死进程。进程下一次进入内核、准备返回用户态时被杀死。具体位于`usertrap`的出口

```c
if (killed(p))
    kexit(-1);
```

调用`kexit`杀死进程
