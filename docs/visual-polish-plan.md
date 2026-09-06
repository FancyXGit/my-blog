# 阅读页视觉优化 — 实施计划与步骤

> 范围：**只优化文章阅读页**（`BlogPost.astro` / `Series.astro` 及其组件），不动首页、列表页、笔记卡片等布局。
> 状态标记：`[x] 已完成` / `[ ] 待办`。所有样式旋钮集中在 `src/styles/global.css` 的 `:root` 变量里。

## 决策记录（用户确认）

- 行内 code：**去掉黑框**；无底色、与正文同字号，用强调色文字区分（Fira Code 等宽字体）。
- 代码块：**整体配色太黑**，需要柔和化（含底部区域）。
- 中文字体：方案待定 —— 默认走**系统字体栈 + 收敛字距**（零体积）；可选后续自托管子集字体。
- 大屏布局：**正文适当加宽**；series 面板左侧**渐变背景铺满屏幕左侧、到正文处停止**（与现状渐变观感一致），面板与正文边界柔和过渡。
- 代码字体：自托管 **Fira Code 可变字体**（woff2）。

## 已完成

- [x] **代码字体 = Fira Code**
  - 文件：`src/assets/fonts/FiraCode-VF.woff2`（新增）；`global.css` 加 `@font-face`（`font-weight: 300 700`，`woff2-variations`）
  - `tailwind.config.ts` `fontFamily.mono` 首位 `"Fira Code"`
  - `global.css` 开启连字（`font-variant-ligatures: contextual`；`font-feature-settings: "liga","calt"`）
  - 粗细旋钮：`--code-font-weight`（当前用户偏好 `500`），作用于行内 + 代码块
- [x] **行内 code 去黑框**
  - `global.css` `:not(pre) > code`：去掉 bg/px/py/rounded/`0.875em` → 仅 `color: var(--code-inline-color)`
  - `tailwind.config.ts` prose `code`：`font-size: inherit; color: var(--code-inline-color); font-weight: var(--code-font-weight)`（无底色）
  - 新旋钮 `--code-inline-color`（现取 `--theme-accent-two`）
- [x] **封面图不再在构建时拉 CDN**
  - `Masthead.astro`：`<Image inferSize>`（构建下载远程图量尺寸）→ 纯 `<img>` + `aspect-[16/9]` 容器，绕过 astro:assets
  - 实测：全量 `pnpm build` 62s → ~14s
- [x] **`pnpm build:fast` 本地快速构建**
  - `scripts/build-fast.mjs` 跑 `astro build`，跳过 `postbuild`（pagefind）。动态 og 分享图链路已移除（见下文），不再有 `NO_OG` 逻辑
  - 实测 ~5s；`pnpm build`（正式/CI）行为不变（固定 social-card，无 satori 渲染）
  - 注意：`build:fast` 不会自动跑 `postbuild`（pagefind），本地测搜索请手动 `pnpm postbuild`
- [x] **行尾两空格换行 → 拆段（行间留空隙）**
  - 新增 `src/plugins/remark-linebreak-paragraph.ts`，在 `astro.config.ts` remarkPlugins 注册（放最后）
  - 效果：md 里“行尾两个空格”产生的软换行渲染为独立段落，行与行之间出现段距；自动折行与普通单换行不受影响
  - **全局行为**：47 篇、约 478 处两空格换行会变松；想恢复原样就从 `remarkPlugins` 数组删除该项即可
  - 构建时间几乎无影响（实测 build:fast ~5-6s）

## 待办

### A. 代码块视觉柔和化（消除“太黑 + 底部难看”）
- [ ] `global.css`：暗色下 `--code-bg`（现 `--theme-special` ≈ 黑 15% 叠底）改为带主题色调的深色面板 + `1px` 细边框 + 圆角；`pre` 上下 padding 统一、末行行高收尾干净
- [ ] `BlogPost.astro` copy 按钮（`src/layouts/BlogPost.astro:144` 起注入脚本）改为悬浮半透明胶囊，去掉黑底残留
- [ ] （可选）`astro.config.ts` rehype-pretty-code 主题从 rose-pine/dawn 换更柔和对比（GitHub / Catppuccin / One Dark / Tokyo Night）——需先与用户确认偏好

### B. 中文字体与字距
- [ ] `tailwind.config.ts` `fontFamily.sans` 追加系统 CJK 栈：`SFProRounded → "PingFang SC" → "Hiragino Sans GB" → "Source Han Sans SC" → "Noto Sans CJK SC" → "Microsoft YaHei UI" → "Microsoft YaHei" → sans-serif`
- [ ] `global.css`：`html { letter-spacing: 0.025em }` 收敛（中文 0.025em 显松散），阅读正文作用域内降到约 `0.012em`
- [ ] 需与用户确认是否接受“Windows/Mac 观感不同”的系统栈方案，或引入自托管中文字体子集

### C. 大屏阅读布局（正文加宽 + series 面板渐变）
- [ ] `Base.astro`：给 `BaseLayout` 增加可选 `layout="doc"`（仅 BlogPost/Series 使用）——外层去 `max-w-6xl` 居中限制改全宽、左侧栏贴左；普通页面保持现状
- [ ] 正文容器上限放宽（约 `56–60rem`，正文 ~700px 上下），右侧 TOC 保留
- [ ] `SeriesPanel.astro`：
  - 渐变背景层从**视口左缘**铺到正文起始处、整列通高，右缘对正文做淡出/`mask` 过渡（替代生硬 `border-r`）
  - 面板宽度 `w-72` → 约 `w-60/64`，视觉更轻
  - 删除 class 字符串中误写的一对反引号（`\`shadow-[…]\``，`SeriesPanel.astro:28`，无效 class）
- [ ] 移动端/中等屏行为不回归（面板折叠、fixed overlay 逻辑不变）

### D. TOC 滚动高亮（scroll-spy）
- [ ] `BlogPost.astro` / `TOC.astro`：IntersectionObserver（或 scroll 监听）跟踪正文 `h2/h3/h4`，当前所在章节链接高亮（`text-accent-two` + 半粗 + 左侧指示条），子级/末章兜底
- [ ] 验证正文 heading 自带 `id`；若缺补 rehype-slug 之类以保证锚点
- [ ] 点击锚点滚动的 offset 跟随 sticky header（`scroll-pt` 已设，确认够用）

### E. 杂项小优化（顺带）
- [ ] prose 标题前自动 `'#'` 前缀（`BlogPost.astro:76` `sm:prose-headings:before:content-['#']`）——是否移除需与用户确认
- [ ] blockquote 装饰引号当前用 `font-serif`=CascadiaCode（用法有误），换正规引号字形
- [ ] 表格圆角/斑马纹、正文图片样式与主题统一复核

## 验证步骤

1. `pnpm check` —— 0 error（早期 satori `VNode`→`ReactNode` 报错随动态 og 移除而消失）
2. `pnpm build:fast` —— 快速自测，确认无报错
3. `pnpm preview`（http://localhost:45873）肉眼比对：亮/暗两主题、1280 / 1920 宽屏、有无 series 面板两种情况
4. 正式发布前跑一次 `pnpm build`（连带 pagefind + og 图），确认线上产物正常后 `git push`
