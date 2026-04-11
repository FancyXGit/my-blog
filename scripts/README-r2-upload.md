# 图片 -> WebP -> R2 使用说明

这个目录下的 `upload-png-to-r2.cjs` 脚本用于：
1. 批量读取 PNG/JPG/JPEG 图片
2. 压缩为同名 WebP（仅扩展名改为 `.webp`）
3. 上传到 Cloudflare R2
4. 输出每张图的公网 URL

## 1) 先配置 R2 参数

在项目根目录创建 `.env.r2`（可由 `scripts/.env.r2.example` 复制而来），填入：

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=https://img.example.com

# 可选
R2_REGION=auto
R2_PREFIX=
WEBP_QUALITY=82
WEBP_EFFORT=5
```

字段说明：
- `R2_ACCOUNT_ID`: Cloudflare 账户 ID
- `R2_ACCESS_KEY_ID`: R2 API Access Key ID
- `R2_SECRET_ACCESS_KEY`: R2 API Secret Access Key
- `R2_BUCKET`: 桶名
- `R2_PUBLIC_BASE_URL`: 访问图片的自定义域名（或 R2 公开域名）
- `R2_PREFIX`: 可选，上传 key 前缀（例如 `blog`，则路径会是 `blog/xxx.webp`）

## 2) 运行方式

直接运行：

```bash
pnpm run r2:upload-png -- public/images
```

传多个文件：

```bash
pnpm run r2:upload-png -- public/images/a.png public/images/b.jpg public/images/c.jpeg
```

控制压缩参数：

```bash
pnpm run r2:upload-png -- public/images --quality 78 --effort 6
```

可选参数：
- `--quality, -q`: WebP 质量，范围 `1-100`，越高越清晰但体积越大
- `--effort, -e`: 编码强度，范围 `0-6`，越高通常体积更小但更慢
- `--no-recursive`: 目录模式下不递归子目录

支持输入格式：
- `.png`
- `.jpg`
- `.jpeg`

## 3) 关于“尽量清晰 + 尽量小”

你的目标是合理的：例如 10MB 风景图，常见情况下压到 1MB 左右是有机会的。

建议从下面这组参数开始：

```bash
--quality 76 --effort 6
```

如果你觉得画质仍然足够：
- 再尝试 `--quality 72`

如果细节丢失（草地、树叶、云层纹理明显变糊）：
- 提升到 `--quality 80` 或 `--quality 82`

经验值（仅供参考，实际取决于图片内容）：
- 风景/摄影图：`quality 72-82`
- UI 截图/文字图：`quality 82-92`（文字边缘更敏感）

## 4) 建议的实战流程（追求小体积）

1. 先跑一轮：`--quality 76 --effort 6`
2. 看脚本输出的 URL，打开原图和 WebP 对比（建议 100% 缩放）
3. 若观感差异不明显，再降到 `72`
4. 若出现模糊，再回到 `80` 或 `82`

> 说明：脚本当前不会“自动保证小于某个体积阈值”。
> 如果你想要“目标 1MB 自动调质量”的模式，可以后续再加一个 `--target-kb` 自动二分质量的版本。

## 5) 输出与进度

脚本会对每张图输出：
- 压缩后体积（KB）
- 上传进度（百分比）
- 上传完成后的 URL

最后会汇总打印所有 URL，方便直接复制到文章。

---

# 任意文件直传 R2 使用说明

这个目录下的 `upload-file-to-r2.cjs` 脚本用于：
1. 上传任意文件或目录到 Cloudflare R2
2. 自动根据扩展名推断 `Content-Type`
3. 输出每个文件的公网 URL

这个脚本不会转码或压缩文件，按原始内容上传。

## 1) 配置

同样使用项目根目录的 `.env.r2`（可由 `scripts/.env.r2.example` 复制）：

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=https://img.example.com

# 可选
R2_REGION=auto
R2_PREFIX=
```

字段说明与上文一致。

## 2) 运行方式

上传目录（默认递归）：

```bash
node scripts/upload-file-to-r2.cjs public/files
```

等价的 pnpm 方式：

```bash
pnpm run r2:upload-file -- public/files
```

上传单个或多个文件：

```bash
node scripts/upload-file-to-r2.cjs music/song.mp3 public/docs/guide.pdf
```

不递归目录：

```bash
node scripts/upload-file-to-r2.cjs public/files --no-recursive
```

指定统一 Content-Type（覆盖自动推断）：

```bash
node scripts/upload-file-to-r2.cjs public/music/lyrics --content-type "text/plain; charset=utf-8"
```

设置缓存头：

```bash
node scripts/upload-file-to-r2.cjs public/assets --cache-control "public, max-age=31536000, immutable"
```

查看帮助：

```bash
node scripts/upload-file-to-r2.cjs --help
```

## 3) 参数说明

- `--no-recursive`: 目录模式下不递归子目录
- `--content-type <type>`: 手动指定上传时的 Content-Type
- `--cache-control <value>`: 设置对象的 Cache-Control
- `--help, -h`: 打印帮助

## 4) MIME 自动识别

脚本内置了常见扩展名映射，例如：
- 文本类：`.txt` `.md` `.json` `.xml` `.lrc` `.ttml`
- 音频视频：`.mp3` `.wav` `.ogg` `.mp4` `.webm`
- 图片：`.png` `.jpg` `.jpeg` `.webp` `.gif` `.svg` `.ico`
- 字体：`.woff` `.woff2` `.ttf`

未命中映射时，默认使用 `application/octet-stream`。

## 5) 上传后路径规则

对象 key 规则：
- 基于你传入文件相对于项目根目录的路径
- 如果设置 `R2_PREFIX=blog`，则会变成 `blog/<相对路径>`

例如上传 `public/music/lyrics/a.lrc`：
- 未设置 `R2_PREFIX` -> key 是 `public/music/lyrics/a.lrc`
- 设置 `R2_PREFIX=blog` -> key 是 `blog/public/music/lyrics/a.lrc`

最终 URL 由 `R2_PUBLIC_BASE_URL + key` 组成，脚本会在每个文件上传完成后打印 `URL:`。

---

# 统一上传脚本（推荐）

如果你希望一个命令完成“图片转 WebP + 其他文件原样上传”，使用：

```bash
pnpm run r2:upload -- <file-or-dir>
```

示例：

```bash
pnpm run r2:upload -- public
pnpm run r2:upload -- public/images public/music/lyrics
pnpm run r2:upload -- public --quality 78 --effort 6
pnpm run r2:upload -- public/files --cache-control "public, max-age=31536000, immutable"
```

行为规则：
- 图片（`.png` `.jpg` `.jpeg` `.webp`）会先压缩并转换成 `.webp` 后上传
- 其他文件原样上传

可选参数：
- `--quality, -q`: 图片转 WebP 质量（`1-100`，默认 `82`）
- `--effort, -e`: 图片转 WebP 编码强度（`0-6`，默认 `5`）
- `--no-recursive`: 目录模式下不递归子目录
- `--content-type <type>`: 非图片文件统一指定 Content-Type
- `--cache-control <value>`: 设置对象的 Cache-Control
- `--help, -h`: 打印帮助
