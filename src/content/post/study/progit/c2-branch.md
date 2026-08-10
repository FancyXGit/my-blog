---
title: "分支"
publishDate: "2026-08-10"
updatedDate: "2026-08-10"
description: "Git分支与提交的原理，merge与rebase的作用"
seriesId: progit
orderInSeries: 2
tags: ["Git"]
---

## Commit与Branch

- Commit

Commit是Git每次提交保存的全量快照，包含了所有文件的状态。每个Commit都有一个唯一的SHA-1哈希值作为标识。  
Commit会指向它的父Commit，形成一条提交历史链。  
Git不保存文件差异，而是保存每次提交的完整快照

- Branch

Branch是指向某个Commit的指针  
创建branch: 创建一个新的指针，指向当前的commit  
切换branch: 将HEAD指针移动到指定的branch上

- HEAD

HEAD是一个特殊指针，指向当前所在的分支

## Merge

`git merge <branch>`将指定分支合并到当前所在分支上面  

考虑下面指令

```bash
git checkout main
git merge feature
```

- feature分支在main之后

![merge时feature分支在main之后](https://cdn.fancyflow.top/image/post/study/progit/2/merge-after.webp)

此时merge直接将main指针修改为和feature指向的commit一致，执行merge后如下图

![执行merge后](https://cdn.fancyflow.top/image/post/study/progit/2/merge-after-result.webp)

- feature分支在main之前

![merge时feature分支在main之前](https://cdn.fancyflow.top/image/post/study/progit/2/merge-before.webp)

执行merge之后什么也没变，因为main分支已经包含了feature分支的所有提交

- feature分支和main分支各自有新的提交

![merge时feature分支和main分支各自有新的提交](https://cdn.fancyflow.top/image/post/study/progit/2/merge-both.webp)

此时git会创建一个新的commit，作为main分支和feature分支的共同父节点，然后将main指针指向这个新的commit

![执行merge后](https://cdn.fancyflow.top/image/post/study/progit/2/merge-both-result.webp)

如果此时执行`git checkout feature`，然后执行`git merge main`，则对应feature分支在main之前的情况，执行merge之后什么也没变

- 出现冲突

如果合并出现冲突，Git会提示冲突文件，并将冲突标记写入文件中

```txt
<<<<<<< HEAD:index.html
<div id="footer">contact : email.support@github.com</div>
=======
<div id="footer">
please contact us at support@github.com
</div>
>>>>>>> feature:index.html
```

需要删除<<<<<<<<、=======、>>>>>>>标记，并手动修改文件内容，解决冲突后执行`git add <file>`，然后执行`git commit`完成合并

## Rebase

- 基础

rebase是将一个分支的提交应用到另一个分支的最前端，形成一条新的提交历史链。

![rebase之前](https://cdn.fancyflow.top/image/post/study/progit/2/rebase-before.webp)

执行rebase之后，可以看到git将C3复制了一个新的C3'，其父节点是main指向的commit，然后feature分支指向了新的C3'  
整个历史记录变成了一条直线，避免了merge产生的分叉

![rebase之后](https://cdn.fancyflow.top/image/post/study/progit/2/rebase-after.webp)

C3之后会被GC回收掉

- 解决冲突

rebase同样也可能产生冲突，解决冲突与merge稍有不同

- 先修改冲突文件
- 执行`git add <file>`，将冲突文件标记为已解决
- 执行`git rebase --continue`，继续rebase操作

## 准则

1. 公共分支使用`git merge --no-ff feature`
2. 私有分支使用`git pull --rebase origin main`

:::tip
`git pull --rebase origin main`将主分支上面的最新修改置于你当前分支的修改之前，就好像你是基于主分支的最新修改开始开发的一样。
:::
