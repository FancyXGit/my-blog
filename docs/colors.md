# 博客色彩体系技术文档

> 站点：fancyflow.top · Astro v5 + Tailwind v3 · 主题通过 `<html data-theme="light|dark">` 切换
> 最后更新对应配色：浅色 = **薰衣草 `#B79CE0` + 雾霾蓝 `#A3C6E1`**（冷色系）

---

## 1. 整体架构（四层）

```
① HSL 原语（global.css 顶部，浅/深两套）
        │  定义 --hue/--saturation/--bg-*/--fg-* / --theme-accent-* / --theme-link …
        ▼
② 派生变量（global.css 中段 :root 共用）
        │  --theme-bg / --theme-fg → 灰阶 --theme-color-900…50
        │  --theme-special* / --code-*（代码块 chrome）
        ▼
③ Tailwind 色名映射（tailwind.config.ts colors）
        │  bgColor / textColor / accent-base / accent-one / accent-two /
        │  link / accent / quote / lightest| lighter| light / special-* / color-50…900
        ▼
④ 组件里用类名（text-accent-base、hover:text-accent-two …）
```

- **改一处、处处生效**：③④ 全部指向变量，所以绝大多数可见色只改 ① 里的几行即可。
- **深浅两套独立**：① 在浅色 `:root[data-theme="light"]` 与深色 `:root[data-theme="dark"]` 各有独立值，改浅色不影响深色。
- **不随变量走的部分**（顶部光斑、语法高亮、admonition、状态徽章等）见第 5 节。

---

## 2. 色值源头与当前值

### 2.1 文件位置

| 层 | 文件 | 行 |
|---|---|---|
| HSL 原语（浅色） | `src/styles/global.css` | `:root, :root[data-theme="light"]` 块 |
| HSL 原语（深色） | `src/styles/global.css` | `:root[data-theme="dark"]` 块 |
| 派生灰阶 / code 变量 | `src/styles/global.css` | 公共 `:root` |
| Tailwind 色名映射 | `tailwind.config.ts` | `theme.extend.colors` |

### 2.2 浅色主题当前值（2026-09 定版）

| 变量 | 浅色当前值 | ≈Hex | 用途 |
|---|---|---|---|
| `--hue` | `210deg` | — | 底色文字/灰阶的通用色相 |
| `--saturation` | `12%` | — | 灰阶通用饱和度 |
| `--bg-saturation` | `4%`（浅色） | — | 页面"纸色"接近纯白；色相仍 210 保持轻微冷调（去蓝，避免吃淡紫光斑） |
| `--bg-brightness` | `96%` | — | 页面底色亮度（近白） |
| `--theme-accent-base` | `206deg 45% 42%` | `#3A709A` | 标题 / TOC active / 胶囊按钮（雾霾蓝主） |
| `--theme-accent-one` | `206deg 50% 50%` | `#4088BF` | 渐变起点（品牌名 / Read Blog 按钮） |
| `--theme-accent-two` | `268deg 45% 56%` | `#9064C4` | 点缀 / hover / 行内代码 / 脚注（中紫） |
| `--theme-accent-chip` | `268deg 45% 52%` | `#7C46B9` | TAG 胶囊 / 脚注 chip 填充底（深底白字，浅色专用；深色回退 = accent-two） |
| `--theme-link` | `206deg 60% 38%` | `#2F6F9E` | 正文外链、社交图标 hover |

> accent 存成 **HSL 三通道**（`h  s%  l%`）而不是成品色，是为了让 Tailwind 的透明度修饰符
> （`bg-accent-base/5`、`from-accent-two/85` 等）继续有效。若改成纯 hex 会破坏 `/alpha`。

### 2.3 HSL 记法速查

`色相(0–360°) 浓度% 亮度%`，色相大致对应：`0=红 30=橙 60=黄 120=绿 160=青绿/薄荷 195=青 206=雾霾蓝 240=蓝紫 280=紫 330=粉`。
数字越大越亮/越深可现场微调（改 `global.css` 后 `pnpm dev` 会热更新）。

---

## 3. Tailwind 色名映射（tailwind.config.ts）

组件里实际可用的主题类名：

| 类名 | 指向 | 常见用途 |
|---|---|---|
| `bgColor` / `textColor` | `--theme-bg` / `--theme-text` | 页面底、主文字 |
| `color-50 … 900` | `--theme-color-*` 灰阶 | 卡片底、边框、斑马纹、hover 底 |
| `accent-base` `accent-one` `accent-two` `accent-chip` | 三个 accent 变量 + chip 填充变量 | 标题/按钮/hover/装饰 + 胶囊底 |
| `link` | `--theme-link` | 外链 |
| `accent` | `--theme-color-600` | 中性强调 |
| `quote` | `--theme-text` | 引用 |
| `lightest` `lighter` `light` | 灰阶 350/400/450 | 次级文字、TOC 条目 |
| `special-lightest/lighter/light` | `--theme-special-*` | 常作"白卡"、反白块 |

---

## 4. 全站颜色控制地图（改哪 → 影响什么）

### 4.1 核心变量联动（改 2.2 一张表即可全动）

| 可见元素 | 控制点 | 位置示例 |
|---|---|---|
| 正文 h1–h6 标题 | `prose-headings:text-accent-base` → `--theme-accent-base` | `BlogPost.astro`、`Series.astro`；`tailwind.config.ts` typography |
| 文章/页面大标题 `.title` | 工具类 `.title` → accent-base | `tailwind.config.ts:31`；`Masthead.astro` |
| 标题前 `#` 装饰、脚注 chip、行内 code | accent-two（`--code-inline-color`） | `global.css:202`；`tailwind.config.ts` typography |
| 导航 Home/About…、移动菜单 | 容器 `text-accent-two` 继承 | `Header.astro`（hover 只下划线） |
| Series 胶囊按钮、标签 Badge、RSS 图标 | accent-base / accent-one / accent-two | `Header.astro`、`Badge.astro`、posts/notes 列表页 |
| FancyXGit 品牌渐变 / hero 标题 / Read Blog | `from-accent-one to-accent-two`（标题是 two→one→two） | `Header.astro:35`、`index.astro:34/44/51` |
| 正文外链 | `link` = `--theme-link` | `tailwind.config.ts` typography |
| 悬停高亮 | 多数 `hover:text-accent-two`（导航下划线、胶囊 `hover:bg-accent-base/10`、社交 `hover:text-link`） | SeriesPanel / TOC / Paginator / Search / ThemeToggle / 返回顶部 |
| TOC 默认→hover→active | light → accent-two → accent-base(+10% 底) | `TOCHeading.astro` |
| 表格斑马纹/表头、卡片底、边框、分隔线 | `color-50~250` 灰阶 | 各组件 + typography |
| 代码块底色 chrome | `--code-bg/--code-title-bg/--code-inline-color` | `global.css` 公共 `:root` |
| 深浅模式 meta 回填 | `--theme-bg` | `BaseHead.astro`、`ThemeProvider.astro` |

### 4.2 不随变量走的可见色（需单独改）

| 元素 | 机制 | 位置 |
|---|---|---|
| **顶部 aurora 光斑 / Series Panel 渐变** | 硬编码 Tailwind 任意值 `[#…]` | 见第 6 节清单 |
| 代码语法高亮 | rehype-pretty-code `rose-pine` / `rose-pine-dawn` | `astro.config.ts` |
| admonition 提示框 | `blue.400 / lime.500 / purple.400 / orange.400 / red.500` | `tailwind.config.ts` typography `.aside*` |
| 系列状态徽章 | `green/blue/amber/gray-*-500` | `series/[...page].astro` |
| Draft 标识、正文 `<mark>` | `text-red-500`、`bg-transparent` | `Masthead.astro`、`PostPreview.astro`、`global.css` |
| 图片放大遮罩 | `rgba(2,6,23,.78)` 等 | `global.css` |
| webmanifest 壳色 | `#2bbc8a` / `#1d1f21` | `astro.config.ts` |
| Music 播放器 | APlayer `theme:"#2bbc8a"` | `SimpleAPlayer.astro` |

---

## 5. 深浅模式差异

- **自动切换**（走 CSS 变量，无需 `dark:`）：底色、文字灰阶、accent 三色、外链、quote、代码块 chrome、meta 主题色。
- **需要 `dark:` 变体**：aurora 光斑透明度（`dark:opacity-5/10`，Series Panel 为 `dark:opacity-0`）、首页 hero 渐变透明度、主题切换图标、系列状态徽章的 `dark:text-*`。
- 改动**只动浅色**时，一般只需改 `global.css` 浅色块 + 涉及 `dark:` 变体之外的 class。

---

## 6. 顶部光斑 / Series Panel 渐变改法

光斑是**纯色名替换**（结构不动）。当前 token→新色：

| 原 token | 现类内任意值 |
|---|---|
| `cyan-300` | `[#B79CE0]`（薰衣草） |
| `sky-300` | `[#A3C6E1]`（雾霾蓝） |
| `indigo-300` | `[#87ADD1]`（雾霾蓝深一档） |

**只出现在这 3 个 token 的文件（全站仅 56 处，可安全全库替换）**：
`src/pages/index.astro`、`src/layouts/Base.astro`、`src/layouts/BlogPost.astro`、
`src/layouts/Series.astro`、`src/pages/notes/[...slug].astro`、
`src/components/layout/Header.astro`、`src/components/SeriesPanel.astro`

渐变写法速记：`from-X via-Y to-transparent` = 从 X 过渡到 Y 再淡出；`to-Z` = 到实色 Z。
Series Panel 那条 = `from-[#B79CE0] via-[#A3C6E1] to-[#87ADD1]`（上薰衣草 → 下深雾霾）。

---

## 7. 快速换色流程

1. `pnpm dev` → `http://localhost:45873`（`global.css` 改完热更新）
2. 只换文字级主题 → 改第 2.2 表里 accent/link 的 HSL（`global.css` 浅色块）
3. 只换顶部氛围色 → 全库替换第 6 节 token 的任意值
4. 预览满意 → `pnpm build:fast`（跳过 Pagefind，~5s）
5. 发布前完整构建 → `pnpm build`（会跑 Pagefind）

> 提示：既想改浅色又不影响深色，记得只编辑 `[data-theme="light"]` 块。

---

## 8. 已知坑（源自代码审计）

- `tailwind.config.ts` 与 safelist 引用了不存在的 `--theme-color-950`（灰阶最大只到 900）——任何 `*-color-950` 无效。
- `hover:text-bg-accent-base/90` 是非法类（`BlogPost.astro`、`Series.astro` 移动端浮钮），hover 实际不生效。
- 桌面导航当前页只有 `aria-current`，无可见高亮样式。
- 品牌名 class 内混入字面量 `'max-[320px]:hidden'` 等死字符串（`Header.astro:35`、`SeriesPanel.astro:28`），不影响样式但属脏数据。
- 全站无 `::selection` / scrollbar / 全局 focus 自定义，浅色文字选中高亮为浏览器默认。
