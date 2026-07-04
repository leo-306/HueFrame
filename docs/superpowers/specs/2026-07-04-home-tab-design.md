# HueFrame "首页" Tab —— 设计规范

> 参考设计稿：`~/Downloads/stitch_hueframe_photo_palette (1)/code.html` + `DESIGN.md`（Ethereal Botanical 设计系统，与项目现有 Tailwind 令牌一致）。

## 背景

底部导航现有三个 Tab：卡片 / 宫格 / 裁剪，`App.tsx` 默认启动落在"卡片" Tab 的空状态（`EmptyState`）。本轮新增"首页" Tab，作为应用默认启动页，展示品牌介绍、两个核心功能入口（色卡模式 / 切分模式）和三条产品特性说明。用户可以直接在首页卡片上传照片，上传后自动带着照片跳转到对应的功能 Tab，无需二次上传。

## 功能定位

"首页"是一个纯展示 + 快捷入口的 Tab，不维护自己的持久业务状态（不保存照片、不做处理）。它的价值是：让用户一进入应用就能看到产品定位介绍，并提供两个最短路径直接进入"卡片"或"宫格"的处理流程。

## 页面结构

复刻设计稿的三段式结构，顶部栏不用设计稿自带的（含汉堡菜单图标），继续用现有全局 `TopBar`（HueFrame 标题 + 语言切换）：

1. **Hero 文案区**：大标题"给照片，配一套颜色。" + 副标题"极简的照片色卡与切分工具，让每一份视觉表达都拥有呼吸感。"
2. **模式入口卡片**（Bento 双卡片，纵向堆叠，移动端单列）：
   - **色卡模式卡片**：`primary-container` 色调背景，标题"色卡模式"，说明"提取主色调，生成精致色卡，记录每一个瞬间的光影情绪。"，"进入工作流 →" 引导文案。
   - **切分模式卡片**：`secondary-container` 色调背景，标题"切分模式"，说明"九宫格切分，支持自定义间距，为社交平台打造平衡的视觉节奏。"，"开始排版 →" 引导文案。
   - 设计稿卡片背景用的是外链真实照片（mix-blend-multiply 叠加），项目内没有对应素材、也不引入外部图片依赖。改用图标替代：色卡模式卡片放一个调色板类图标（`Palette` from lucide-react），切分模式卡片放一个网格类图标（`Grid2x2` from lucide-react），图标风格与 `UploadZone`/`MultiUploadZone` 里 `ImagePlus` 图标的包裹样式（圆形容器 + 描边）保持一致。
3. **产品特性区**（三列，移动端单列纵向堆叠）：
   - 本地解析（`security` 图标语义 → lucide-react `ShieldCheck`）
   - 极致清新（`spa` 图标语义 → lucide-react `Leaf`）
   - 快速导出（`bolt` 图标语义 → lucide-react `Zap`）
   - 文案与设计稿一致。

## 上传与跳转行为（核心交互）

两张模式卡片都是可点击的隐藏文件上传入口（`<label>` 包裹一个 `sr-only` 的 `<input type="file" accept="image/*">`，视觉上是整张卡片可点击，不弹出二级页面）：

1. **色卡模式卡片**：用户选择文件后，直接复用 `App.tsx` 现有的 `handleFileSelected(file)` 处理管线（EXIF/取色/生成 `baseConfig`），然后把 `activeTab` 切换为 `'card'`。行为等同于用户在"卡片" Tab 的 `EmptyState` 重新上传了一张图。
2. **切分模式卡片**：用户选择文件后，把 `activeTab` 切换为 `'grid'`，并把该文件通过新增的 state（`gridInitialFile`）一路传给 `GridTool → GridSplitPanel`。`GridSplitPanel` 新增可选 prop `initialFile?: File`：组件内部用 `useEffect` 监听 `initialFile` 引用变化，一旦有值就调用现有的 `loadImage` 加载并 `setPhoto`，效果等同于用户在宫格 Tab 内部重新上传了一张图（不影响面板已有的行列/间距等其它状态初始值）。`GridTool` 需要新增同名 prop 透传给 `GridSplitPanel`（`GridCollagePanel` 不需要改动，因为 `GridTool` 默认展示"切分"子 Tab）。

这是单向、一次性的接力（与"宫格 → 卡片"的"生成色卡"接力模式一致）：跳转之后，首页自身没有需要保留的状态；宫格 Tab 内部原有的行列/间距等状态不受 `initialFile` 注入影响，只影响"当前正在编辑的照片"。

## 与现有 Tab 结构的整合

- `BottomNav` 的 `AppTab` 类型从 `'card' | 'grid' | 'crop'` 扩展为 `'home' | 'card' | 'grid' | 'crop'`，"首页"排在最前面、不禁用。
- `App.tsx` 的 `activeTab` 初始值从 `'card'` 改为 `'home'`——首页是应用默认启动页，之后可以随时通过底部"首页" Tab 返回，不是一次性引导页。
- "裁剪" Tab 继续保持禁用和占位渲染，不受本轮影响。

## 技术设计

### 新增文件

| 文件 | 职责 |
|---|---|
| `src/components/HomeTab.tsx` | 首页 Tab 的整体渲染：Hero 文案区 + 两张模式入口卡片 + 三条特性说明。对外暴露 `onSelectCardPhoto: (file: File) => void` 和 `onSelectGridPhoto: (file: File) => void` 两个回调。 |

### 修改文件

| 文件 | 改动 |
|---|---|
| `src/components/BottomNav.tsx` | `AppTab` 新增 `'home'`，`TABS` 数组新增 `{ id: 'home', label: '首页' }` 排在最前面。 |
| `src/App.tsx` | `activeTab` 初始值改为 `'home'`；新增 `gridInitialFile` state；渲染 `activeTab === 'home'` 分支挂载 `HomeTab`，两个回调分别接到 `handleFileSelected` + 切 `'card'`，和 `setGridInitialFile` + 切 `'grid'`；`GridTool` 渲染时传入 `initialFile={gridInitialFile}`。 |
| `src/components/grid/GridTool.tsx` | 新增可选 prop `initialFile?: File`，透传给 `GridSplitPanel`。 |
| `src/components/grid/GridSplitPanel.tsx` | 新增可选 prop `initialFile?: File`；新增 `useEffect`，监听 `initialFile` 变化，有值时 `loadImage` 并 `setPhoto`（与现有 `handleFileSelected` 内部逻辑一致，提取或并列均可，由实施阶段决定）。 |

### 视觉规范

沿用项目已有的 Ethereal Botanical Tailwind 令牌（`primary-container`、`secondary-container`、`on-surface-variant`、`outline-variant` 等，均已在 `tailwind.config`/`theme.css` 中定义，无需新增）。卡片圆角、间距、字重比照设计稿的 `rounded-xl`/`p-8`/`gap-gutter` 等比例，適配到项目现有的移动端单列窄屏布局（项目容器宽度是 `max-w-120`，设计稿是响应式桌面端布局，需要做移动端单列的适配裁剪，不是逐像素还原桌面版设计稿）。

### 测试策略

- `HomeTab.test.tsx`：渲染 Hero 文案、两张卡片标题/说明文案、三条特性说明；点击色卡模式卡片选择文件后触发 `onSelectCardPhoto`；点击切分模式卡片选择文件后触发 `onSelectGridPhoto`。
- `BottomNav.test.tsx`：新增断言"首页"选项存在且不禁用，四个 Tab 都渲染。
- `GridSplitPanel.test.tsx`：新增用例验证传入 `initialFile` 后组件自动加载该文件为当前照片（复用已有的 `installMockUploadImage` 测试工具）。
- `App.tsx` 集成走手动浏览器验证（项目里 `App.tsx` 一直没有专属单测，延续既有约定）。

## 明确不做的部分（本轮）

- 不引入设计稿里的汉堡菜单图标（无实际功能）。
- 不引入外部图片素材，卡片背景用色块 + 图标替代真实照片。
- 不新增"我的"Tab（设计稿有，但用户已确认沿用现有三个功能 Tab 结构，只新增"首页"）。
- 首页不做"仅首次访问显示"的引导页逻辑——首页是常驻 Tab。
- 首页不维护任何自己的业务状态（不保存照片、不做预览）。
