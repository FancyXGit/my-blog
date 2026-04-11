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
