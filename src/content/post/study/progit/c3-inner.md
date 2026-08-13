---
title: "对象原理"
publishDate: "2026-08-13"
updatedDate: "2026-08-13"
description: "Git内部对象原理"
seriesId: progit
orderInSeries: 3
tags: ["Git"]
---

## .git目录

执行`git init`后，Git会在当前目录下创建一个.git目录，用于存储Git的所有数据和配置

```txt

.git/
├── config                 # 文件：包含项目特有的配置选项
├── description            # 文件：仅供 GitWeb 程序使用，我们无需关心
├── HEAD                   # 文件：【核心】指向目前被检出的分支
├── index                  # 文件：【核心】保存暂存区信息（执行 git add 后生成）
├── hooks/                 # 目录：包含客户端或服务端的钩子脚本（hook scripts）
├── info/                  # 目录：包含一个全局性排除（global exclude）文件
├── objects/               # 目录：【核心】存储所有数据内容（Blob、Tree、Commit 等对象）
│   ├── <前2位哈希>/       # 子目录：对象存储的物理位置（松散对象）
│   │   └── <后38位哈希>   # 文件：经过 Zlib 压缩的 Git 对象
│   └── pack/              # 子目录：经 git gc 打包后的对象和索引
│       ├── *.pack
│       └── *.idx
└── refs/                  # 目录：【核心】存储指向数据（分支、远程仓库和标签等）的提交对象指针
    ├── heads/             # 子目录：本地分支引用（如 master、feature）
    │   └── <分支名>       # 文件：内容为 40 位提交哈希
    ├── remotes/           # 子目录：远程仓库引用（如 origin/main）
    │   └── <远程名>/
    │       └── <分支名>
    └── tags/              # 子目录：标签引用（轻量标签与附注标签）
        └── <标签名>       # 文件：内容为提交或对象哈希

```

## Blob对象

Git将文件内容存储为Blob对象并计算其SHA-1哈希值作为唯一标识  
Blob对象只包含文件内容，不包含文件名或其他元数据  
Blob对象存储在.git/objects目录下，其SHA-1哈希值的前两位作为子目录，后38位作为文件名  
  
使用 `git hash-object -w <file>` 可将文件内容存入对象数据库

```powershell
# 写入内容为 "version 1" 的文件test.txt
git hash-object -w test.txt
# 输出：e32092a...

# 追加 "version 2" 后再次写入
git hash-object -w test.txt
# 输出：7834af9...
```

创建完成之后可以在.git/objects目录下面找到e3/2092a...与78/34af9...两个文件，分别对应两个版本的test.txt内容  
使用`git cat-file -p <SHA-1>`可以查看Blob对象的内容

```powershell
git cat-file -p e32092a
# 输出: version 1
```

## 树对象

树对象对应当前项目切片下的目录结构  
树对象存储了子树对象和Blob对象的引用信息，包括模式，类型，文件名以及对应的SHA-1哈希值  
  
使用`git write-tree`可以将当前暂存区的内容写入一个树对象

```powershell
# 将blob对象文件名记为test.txt添加到暂存区
git update-index --add --cacheinfo 100644 e32092a test.txt
# 将新文件new.txt添加到暂存区
git update-index --add new.txt
# 生成树结构
git write-tree
# 输出：13697ff...

git cat-file -p 13697ff
# 输出：
# 100644 blob 1271944... new.txt
# 100644 blob e32092a... test.txt
```

Tree 对象是递归构建的: 执行 git read-tree --prefix=bak <树哈希>，暂存区会记录 bak/test.txt 的路径，再次 write-tree 将自动生成包含 bak/ 子树的根树对象

## Commit对象

使用 `git commit-tree <TreeHash>` 可手工生成提交对象（不依赖 git commit）：

```powershell
$OutputEncoding = [System.Text.Encoding]::UTF8; "first commit`n" | git commit-tree c403552
# 输出：9616b474...
git cat-file -p 9616b47
# 输出：
# tree c403552...
# author ...
# committer ...
# 
# first commit
```

通过 -p 参数串联提交链，使得构建的commit有父提交，实现一条提交历史链：

```powershell
$OutputEncoding = [System.Text.Encoding]::UTF8; "second commit`n" | git commit-tree 13697ff -p 9616b474
```

此时执行`git log --stat`，Git 会自动递归遍历 parent 链，并实时比对相邻 Tree 的差异，输出文件变更统计。这说明 Git 存储的是完整快照，而差异是现场计算得出的

## Blob, Tree, Commit对象之间的关系

Commit对象有如下组成

- tree: 指向一个Tree对象，表示当前提交的目录结构
- parent: 指向一个或多个父Commit对象，形成提交历史链
- author: 提交作者信息
- committer: 提交者信息
- message: 提交信息备注

Tree只指向Blob和Tree对象，形成目录结构；Blob只包含文件内容；他们关系如下

```txt
Commit (提交对象)
  └── Tree (根目录树)
        ├── Blob (文件内容) 或
        └── Tree (子目录树)
              └── Blob (文件内容)
```

- Commit 变更：若文件内容改变 → Blob 哈希变 → Tree 哈希变 → Commit 哈希变。
- Commit 复用：若只更改提交备注，仅 Commit 哈希改变，Tree 与 Blob 完全复用

## Blob存储机制

Blob 对象在磁盘上的物理生成过程，遵循以下 4 个步骤

1. 构造头部

Git构造一个包含类型和长度的头部  
例如：`what is up, doc?` 长度为 16，头部为 "blob 16\0"，头部blob指明类型

2. 拼接载荷

将头部和文件原始内容拼接在一起，形成完整的字节流
例如：`blob 16\0what is up, doc?`

3. 计算SHA-1哈希值

对字节流进行 SHA-1 哈希计算，得到 40 位哈希值（如 bd9dbf...）

4. Zlib 压缩与入库

使用 Zlib 算法压缩字节流得到二进制数据  
取哈希前 2 位创建子目录，后 38 位作为文件名  
将压缩后的二进制数据写入该文件  

:::note
当执行 git cat-file 时，Git 会解压文件并重新计算 SHA-1，若与路径名不符则立即报 corrupt  
这是GIT防篡改机制，历史记录不允许随意修改
:::

## git add与git commit底层

### git add

1. 调用 git hash-object -w test.txt。把文件内容压缩成 Blob 对象，存入 .git/objects，并拿到对应的 40 位哈希值(比如 e32092...)
2. 调用 git update-index。把拿到的 Blob 哈希值，连同文件名、文件模式（如 100644）写入 .git/index（暂存区）文件中

### git commit

1. 调用 git write-tree。读取当前 .git/index（暂存区）里的所有路径清单，生成一个完整的 Tree 对象（根目录树），并返回该树的哈希值
2. 调用 git commit-tree <树哈希> -p <父哈希>。把上一步得到的树哈希、当前的 HEAD（父提交）、作者信息、时间戳以及你的备注（-m）打包在一起，生成一个新的 Commit 对象
3. 调用 git update-ref。把当前所在的分支（比如 master）的指针，从旧的提交哈希，更新为新生成的 Commit 对象哈希

:::warning
上述所谓“调用”实际为等价于，Git执行时并不会真正fork出hash-object等子进程
:::
