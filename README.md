# FancyXGit's Blog — fancyflow.top

个人博客源码:中文学习笔记(CS61C / CSAPP / 操作系统 / 金融等课程笔记)、日常想法与碎碎念,基于 [Astro](https://astro.build/) 构建,静态部署。

## 技术栈

- **Astro v5** 静态站点 + **pnpm**,TypeScript
- **TailwindCSS v3** + typography 插件;亮/暗主题通过 `<html data-theme>` 切换,全部颜色来自 `src/styles/global.css` 的 HSL 变量
- 内容集合(`post` / `note` / `series`)存于 `src/content/<collection>/`,schema 见 `src/content.config.ts`(Astro v5 glob loader);别名 `@/*` → `src/*`
- Markdown / MDX 渲染管线(`astro.config.ts` remark/rehype 插件):
  - **数学公式**:`remark-math` + `rehype-katex`(`$$...$$`、`\(...\)`)
  - **提示框 admonitions**:`:::tip | note | important | caution | warning`(`remark-admonitions`)
  - **阅读时间**:自动注入 `readingTime`
  - **正文图片优化**:`rehype-image-attrs` 自动加 `loading="lazy"` + `decoding="async"`
  - **代码高亮**:`rehype-pretty-code`,rose-pine(dark)/rose-pine-dawn(light)
- **搜索**:Pagefind,仅在首次打开搜索弹窗时按需加载
- **RSS / sitemap / robots.txt / webmanifest** 自动生成

## 常用命令

| 任务 | 命令 |
|---|---|
| 开发服务器 | `pnpm dev`(端口 **45873**) |
| 生产构建(含 Pagefind 搜索索引) | `pnpm build` —— 生命周期自动跑 `postbuild` |
| 快速本地构建(约 5s,跳过 Pagefind) | `pnpm build:fast` |
| 只重建搜索索引 | `pnpm postbuild` |
| 预览构建产物 | `pnpm preview` |
| 类型检查 | `pnpm check`(`astro check`) |
| Lint | `pnpm lint`(`biome lint .`) |
| 格式化 | `pnpm format`(JS/TS 用 Biome,.astro 用 Prettier) |

本地迭代建议:`pnpm dev` → `pnpm build:fast` → 发布前 `pnpm build`。

> 另见根目录 `AGENTS.md`(面向 AI/协作者的仓库说明)。

## 目录结构

```
src/
├── layouts/            # Base(外壳,sidebar slot)、BlogPost、Series
├── components/         # Search、Masthead、TOC、WebMentions、Header、note/… 等
├── content/
│   ├── post/           # 文章(.md/.mdx,路径即 slug)
│   ├── note/           # 短笔记
│   └── series/         # 系列描述(如 cs61c、csapp)
├── styles/global.css   # 主题变量、@font-face、代码样式旋钮
├── plugins/            # remark/rehype 自定义插件
├── site.config.ts      # 站点元数据 / 日期格式
└── content.config.ts   # 内容集合 schema
astro.config.ts         # 站点配置、渲染插件、集成
scripts/                # 构建/图片上传/社交卡生成脚本
public/                 # 静态资源、social-card.png
```

## 写作:内容集合

新增一篇文章就是往对应目录丢一个 `.md`/`.mdx` 文件,文件路径即 URL slug。

### post Frontmatter

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | ✓ | 标题,max 60 字符 |
| `description` | ✓ | SEO 描述 |
| `publishDate` | ✓ | 日期(支持 ISO 8601) |
| `updatedDate` | | 更新日期 |
| `tags` | | 标签数组,生成 `/tags/<tag>` 页 |
| `coverImage` | | `{ src: "…封面图 URL", alt: "…" }` 封面,顶部 16:9 |
| `ogImage` | | 自定义分享卡图片 URL;不填则用站点固定卡 |
| `draft` | | `true` 时从生产构建/列表/RSS 中剔除(默认 `false`) |
| `seriesId` / `orderInSeries` | | 归属系列及系列内顺序 |

### note Frontmatter

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | ✓ | 标题,max 60 字符 |
| `description` | | SEO 描述 |
| `publishDate` | ✓ | ISO 8601(需含时区偏移) |

### series Frontmatter

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` / `title` / `description` | ✓ | 系列标识、名称、简介 |
| `featured` | | 是否在首页突出展示 |
| `status` | | `OnGoing` / `Completed` / `Paused` / `Abandoned` |

示例:

```md
---
title: "lec17: Single-Cycle CPU"
description: "……"
publishDate: 2026-05-20T00:00:00+08:00
tags: ["cs61c", "risc-v"]
seriesId: cs61c
coverImage:
  src: https://cdn.fancyflow.top/image/post/study/cs61c/lec17/cover.webp
  alt: 封面
---

正文……

:::tip 提示
……
:::

$$
f(x) = \int_{-\infty}^{\infty} g(t)\,dt
$$
```

> 注意:`remark-linebreak-paragraph` 把“行末两个空格”的软换行渲染成独立段落(带段间距)。不需要该行为时从 `astro.config.ts` 的 `remarkPlugins` 里删掉即可。

## 图片

- **封面图与正文图都不存仓库**,统一放 **Cloudflare R2 + CDN**(`cdn.fancyflow.top`)
- 封面:顶部 16:9 容器 + 原生 `<img>`(`fetchpriority="high"`,构建不下载远程图)
- 正文 markdown 图:构建时由 `rehype-image-attrs` 自动加 `loading="lazy"` + `decoding="async"`,渲染时浏览器按需拉取
- 上传命令见 [R2 上传](#r2-上传);凭据放 `.env.r2`(已 gitignore,模板 `scripts/.env.r2.example`)

## 样式与主题

- 主题色与明暗全部走 CSS 变量(`--hue` / `--saturation` / `--bg-brightness` …)定义在 `src/styles/global.css`,亮暗各一组
- 代码高亮主题独立于页面主题:在 `astro.config.ts` 的 `rehype-pretty-code` 里配置(改主题需重启 dev server)
- 代码样式旋钮(统一字重、行内/块级代码配色等)都在 `global.css` 顶部注释里

## 字体

- **UI 字体**:自托管 **Sunghyun Sans**(SIL OFL 1.1)——仅 latin 子集的 woff2(`src/assets/fonts/SunghyunSans-*.latin.woff2`),中文字符回退系统字体
- **代码字体**:自托管 **Fira Code** 可变字体(`FiraCode-VF.woff2`),开启连字
- 字库随附 `OFL.txt`;改字体时同步更新 `global.css` 的 `@font-face` 与 `tailwind.config.ts` 的 `fontFamily`

## 搜索(Pagefind)

- 仅带 `data-pagefind-body` 的页面进入索引(post 页、note 页等)
- 完整 `pnpm build` 会自动跑 `pnpm postbuild` 生成 `dist/pagefind/`
- `pnpm build:fast` 不会生成索引;本地测搜索先跑 `pnpm postbuild`
- UI 与索引脚本在**首次打开搜索弹窗**时才按需加载,首页不预载

## 社交分享卡(fixed og image)

- 全站使用一张固定卡 `public/social-card.png`(1200×630)作为默认 `og:image`
- 改品牌后重绘:`node scripts/generate-social-card.mjs`(基于 satori + `src/assets/fonts/SunghyunSans-{Regular,Bold}.latin.ttf`),提交新的 PNG
- 单篇文章可写 `frontmatter.ogImage` 覆盖为自定义图片

## 部署

- `git push` → GitHub Actions SSH 到云服务器 → `git pull` → `pnpm build` → nginx → **fancyflow.top**
- `pnpm postbuild`(Pagefind)仅在 `pnpm build` 后由 pnpm 生命周期自动执行

## R2 上传

| 命令 | 用途 |
|---|---|
| `pnpm r2:upload` | 上传图片到 R2(同步到 `cdn.fancyflow.top`) |
| `pnpm r2:upload-png` | 仅 PNG |
| `pnpm r2:upload-file` | 上传指定文件 |

凭据在 `.env.r2`(gitignore,从 `scripts/.env.r2.example` 复制);详细说明见 `scripts/README-r2-upload.md`。

## License

基于 [Astro Citrus](https://github.com/ArtemKutsan/astro-citrus)(灵感来自 [Astro Theme Cactus](https://github.com/chrismwilliams/astro-theme-cactus))改造。MIT。
