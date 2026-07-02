# HueFrame "卡片" Tab 重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 HueFrame 现有的单页 MVP 重构为"卡片 / 宫格 / 裁剪"三 Tab 结构中的"卡片" Tab，采用 Ethereal Botanical 设计系统，新增比例/留白/取色编辑/水印等能力，并把版式与滤镜相关的渲染逻辑重构为可扩展、可复用的结构。

**Architecture:** 保持现有"纯函数处理层 + React 编排层"的分层不变。新增的可复用计算逻辑（色彩数学、比例换算、取色占比、调色编辑）落在 `src/lib/`，与 React 无关、可独立单测；新增的 UI 控件（滤镜缩略图、比例选择、留白滑杆、调色列表、信息面板、底部导航、二级 Tab 容器、空状态、顶部栏）落在 `src/components/`。版式渲染函数（`classicStrip`/`magazineCover`）保持不知晓"留白"与"水印"这两个新概念——这两者被下沉到 `cardRenderer.ts` 的一个新合成函数里统一处理，避免在两个模板文件里重复实现。

**Tech Stack:** 沿用现有 React 18 + Vite + TypeScript + Vitest 技术栈，不引入新依赖（取色手动微调使用浏览器原生 `<input type="color">`，不引入第三方取色器库）。

---

## 前置说明

- 本计划承接设计文档 [2026-07-02-card-tab-redesign.md](../specs/2026-07-02-card-tab-redesign.md)，范围仅覆盖"卡片" Tab；"宫格""裁剪" Tab 在底部导航中以禁用态占位，不在本计划实现范围内。
- `CardConfig` 的新增字段（`marginPx`、`watermarkEnabled`）与 `PaletteEntry` 的新增字段（`percentage`）均设计为**可选字段**：这样现有测试文件里手写的 `CardConfig`/`PaletteEntry` 字面量无需逐一改动即可继续通过类型检查，同时不妨碍新功能读取这些字段（真实运行时数据始终会填充它们）。这也是设计文档里"数据结构支持未来按模板扩展"的第一步实践——字段可选意味着未来某个模板可以有、另一个模板可以没有，不强制所有版式共享同一份必填字段集。

---

## Task 1: 设计系统令牌（Ethereal Botanical）

**Files:**
- Create: `src/styles/theme.css`
- Modify: `src/index.css`
- Modify: `index.html`

- [ ] **Step 1: 创建设计令牌文件**

`src/styles/theme.css`:

```css
:root {
  --color-surface: #f9f9f8;
  --color-on-surface: #1a1c1c;
  --color-on-surface-variant: #434846;
  --color-outline: #737875;
  --color-outline-variant: #c3c7c4;
  --color-primary: #57605d;
  --color-on-primary: #ffffff;
  --color-primary-container: #e0e9e4;
  --color-on-primary-container: #606965;
  --color-surface-container: #eeeeed;
  --color-surface-container-high: #e8e8e7;
  --color-error: #ba1a1a;

  --font-headline: 'Libre Caslon Text', serif;
  --font-body: 'Inter', sans-serif;

  --radius-sm: 2px;
  --radius-default: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
}
```

- [ ] **Step 2: 替换全局基础样式**

用以下内容**完全替换** `src/index.css` 现有内容（现有内容是 Vite 脚手架自带的默认主题，与新设计系统无关）：

```css
@import './styles/theme.css';

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: var(--color-surface);
  color: var(--color-on-surface);
  font-family: var(--font-body);
}

h1,
h2,
h3 {
  font-family: var(--font-headline);
  font-weight: 400;
}
```

- [ ] **Step 3: 引入字体并修正页面标题**

用以下内容**完全替换** `index.html` 现有内容：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Libre+Caslon+Text:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <title>HueFrame</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: 验证构建无报错**

Run: `npm run build`
Expected: 构建成功，无 CSS 导入路径或 HTML 解析报错。

- [ ] **Step 5: 提交**

```bash
git add src/styles/theme.css src/index.css index.html
git commit -m "feat: adopt Ethereal Botanical design tokens and load brand fonts"
```

---

## Task 2: 提取共享色彩数学函数（colorMath.ts）

**Files:**
- Create: `src/lib/colorMath.ts`
- Test: `src/lib/colorMath.test.ts`
- Modify: `src/lib/colorNames.ts`
- Modify: `src/lib/photoPipeline.ts`

现有代码里 `colorNames.ts` 有一份 `distanceSquared`，`photoPipeline.ts` 有一份 `rgbToHex`，本任务把它们提取到共享文件，并新增 `hexToRgb`（调色 Tab 手动改色需要）。

- [ ] **Step 1: 写失败测试**

`src/lib/colorMath.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { distanceSquared, rgbToHex, hexToRgb } from './colorMath'

describe('distanceSquared', () => {
  it('returns 0 for identical colors', () => {
    expect(distanceSquared([10, 20, 30], [10, 20, 30])).toBe(0)
  })

  it('returns the sum of squared channel differences', () => {
    expect(distanceSquared([0, 0, 0], [1, 2, 3])).toBe(1 + 4 + 9)
  })
})

describe('rgbToHex', () => {
  it('converts RGB to a lowercase hex string', () => {
    expect(rgbToHex([230, 60, 80])).toBe('#e63c50')
  })

  it('pads single-digit hex values with a leading zero', () => {
    expect(rgbToHex([0, 5, 255])).toBe('#0005ff')
  })
})

describe('hexToRgb', () => {
  it('converts a hex string to RGB', () => {
    expect(hexToRgb('#e63c50')).toEqual([230, 60, 80])
  })

  it('is case-insensitive', () => {
    expect(hexToRgb('#E63C50')).toEqual([230, 60, 80])
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- colorMath`
Expected: FAIL，`Cannot find module './colorMath'`

- [ ] **Step 3: 实现共享色彩数学函数**

`src/lib/colorMath.ts`:

```typescript
import type { RGB } from './colorExtraction'

export function distanceSquared(a: RGB, b: RGB): number {
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return dr * dr + dg * dg + db * db
}

export function rgbToHex([r, g, b]: RGB): string {
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function hexToRgb(hex: string): RGB {
  const normalized = hex.replace('#', '')
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return [r, g, b]
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- colorMath`
Expected: PASS，6 个测试全部通过

- [ ] **Step 5: 重构 colorNames.ts 使用共享的 distanceSquared**

编辑 `src/lib/colorNames.ts`，删除文件内本地定义的 `distanceSquared` 函数（4 行），改为从 `colorMath.ts` 导入：

```typescript
import type { RGB } from './colorExtraction'
import { distanceSquared } from './colorMath'
```

删除原有的：

```typescript
function distanceSquared(a: RGB, b: RGB): number {
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return dr * dr + dg * dg + db * db
}
```

`nearestColorName` 函数体本身不需要改动，只是它引用的 `distanceSquared` 现在来自导入而非本地定义。

- [ ] **Step 6: 重构 photoPipeline.ts 使用共享的 rgbToHex**

编辑 `src/lib/photoPipeline.ts`，删除文件内本地定义的 `rgbToHex` 函数：

```typescript
function rgbToHex([r, g, b]: RGB): string {
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
```

调整顶部 import，从：

```typescript
import { extractPalette, type RGB } from './colorExtraction'
```

改为：

```typescript
import { extractPalette } from './colorExtraction'
import { rgbToHex } from './colorMath'
```

（`RGB` 类型不再被本文件直接使用，因此移除该具名导入。）

- [ ] **Step 7: 运行完整测试套件确认无回归**

Run: `npm run test`
Expected: 所有测试文件全部 PASS（现有 `colorNames.test.ts` 与 `photoPipeline.test.ts` 行为不变，只是内部实现改为调用共享函数）。

- [ ] **Step 8: 提交**

```bash
git add src/lib/colorMath.ts src/lib/colorMath.test.ts src/lib/colorNames.ts src/lib/photoPipeline.ts
git commit -m "refactor: extract shared color math (distanceSquared/rgbToHex) and add hexToRgb"
```

---

## Task 3: 比例换算（aspectRatio.ts）

**Files:**
- Create: `src/lib/aspectRatio.ts`
- Test: `src/lib/aspectRatio.test.ts`

- [ ] **Step 1: 写失败测试**

`src/lib/aspectRatio.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { ASPECT_RATIOS, dimensionsForAspectRatio } from './aspectRatio'

describe('dimensionsForAspectRatio', () => {
  it('returns a 4:5 portrait size for "4:5"', () => {
    const { width, height } = dimensionsForAspectRatio('4:5')
    expect(width).toBe(800)
    expect(height).toBe(1000)
  })

  it('returns a square size for "1:1"', () => {
    const { width, height } = dimensionsForAspectRatio('1:1')
    expect(width).toBe(800)
    expect(height).toBe(800)
  })

  it('returns a widescreen size for "16:9"', () => {
    const { width, height } = dimensionsForAspectRatio('16:9')
    expect(width).toBe(800)
    expect(height).toBe(450)
  })

  it('exposes all supported ratios in ASPECT_RATIOS', () => {
    expect(ASPECT_RATIOS).toEqual(['4:5', '1:1', '16:9'])
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- aspectRatio`
Expected: FAIL，`Cannot find module './aspectRatio'`

- [ ] **Step 3: 实现比例换算**

`src/lib/aspectRatio.ts`:

```typescript
export const ASPECT_RATIOS = ['4:5', '1:1', '16:9'] as const
export type AspectRatioId = (typeof ASPECT_RATIOS)[number]

const BASE_WIDTH = 800

const RATIO_FACTORS: Record<AspectRatioId, number> = {
  '4:5': 5 / 4,
  '1:1': 1,
  '16:9': 9 / 16,
}

/**
 * 固定宽度为 800px，按比例换算出对应高度，用于版式 Tab 的比例切换。
 */
export function dimensionsForAspectRatio(ratio: AspectRatioId): { width: number; height: number } {
  return {
    width: BASE_WIDTH,
    height: Math.round(BASE_WIDTH * RATIO_FACTORS[ratio]),
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- aspectRatio`
Expected: PASS，4 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/lib/aspectRatio.ts src/lib/aspectRatio.test.ts
git commit -m "feat: add aspect ratio to pixel-dimension conversion"
```

---

## Task 4: 取色占比计算（paletteWeights.ts）

**Files:**
- Create: `src/lib/paletteWeights.ts`
- Test: `src/lib/paletteWeights.test.ts`

调色 Tab 需要显示每个色块的占比 %。`color-thief-browser` 的公开 API 不返回权重，这里用"降采样 + 最近色归类"的方式自行计算：把照片缩到 40×40，每个像素归到欧氏距离最近的调色板颜色，统计各颜色命中的像素数占比。

- [ ] **Step 1: 写失败测试**

`src/lib/paletteWeights.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { computePalettePercentages } from './paletteWeights'

function createSplitCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 40
  canvas.height = 40
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgb(255,0,0)'
  ctx.fillRect(0, 0, 10, 40)
  ctx.fillStyle = 'rgb(0,0,255)'
  ctx.fillRect(10, 0, 30, 40)
  return canvas
}

describe('computePalettePercentages', () => {
  it('assigns higher percentage to the color covering more area', () => {
    const canvas = createSplitCanvas()
    const percentages = computePalettePercentages(canvas, [
      [255, 0, 0],
      [0, 0, 255],
    ])
    expect(percentages.length).toBe(2)
    expect(percentages[1]).toBeGreaterThan(percentages[0])
    expect(percentages[0] + percentages[1]).toBeCloseTo(100, 0)
  })

  it('returns 100 for a single-color palette', () => {
    const canvas = createSplitCanvas()
    const percentages = computePalettePercentages(canvas, [[255, 0, 0]])
    expect(percentages).toEqual([100])
  })

  it('returns an empty array for an empty palette', () => {
    const canvas = createSplitCanvas()
    expect(computePalettePercentages(canvas, [])).toEqual([])
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- paletteWeights`
Expected: FAIL，`Cannot find module './paletteWeights'`

- [ ] **Step 3: 实现取色占比计算**

`src/lib/paletteWeights.ts`:

```typescript
import type { RGB } from './colorExtraction'
import { distanceSquared } from './colorMath'

const SAMPLE_SIZE = 40

/**
 * 把图像降采样到 40×40，为每个像素找到欧氏距离最近的调色板颜色，
 * 统计各颜色命中像素数的占比（四舍五入到整数）。
 */
export function computePalettePercentages(
  source: HTMLCanvasElement | HTMLImageElement,
  palette: RGB[]
): number[] {
  if (palette.length === 0) return []

  const canvas = document.createElement('canvas')
  canvas.width = SAMPLE_SIZE
  canvas.height = SAMPLE_SIZE
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
  const counts = new Array(palette.length).fill(0)
  let totalPixels = 0

  for (let i = 0; i < data.length; i += 4) {
    const pixel: RGB = [data[i], data[i + 1], data[i + 2]]
    let bestIndex = 0
    let bestDist = distanceSquared(pixel, palette[0])
    for (let p = 1; p < palette.length; p++) {
      const dist = distanceSquared(pixel, palette[p])
      if (dist < bestDist) {
        bestDist = dist
        bestIndex = p
      }
    }
    counts[bestIndex] += 1
    totalPixels += 1
  }

  return counts.map((count) => Math.round((count / totalPixels) * 100))
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- paletteWeights`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/lib/paletteWeights.ts src/lib/paletteWeights.test.ts
git commit -m "feat: compute palette color percentages via nearest-color histogram"
```

---

## Task 5: 单色块手动调色（paletteEditing.ts）

**Files:**
- Create: `src/lib/paletteEditing.ts`
- Test: `src/lib/paletteEditing.test.ts`

- [ ] **Step 1: 写失败测试**

`src/lib/paletteEditing.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { updatePaletteEntryColor } from './paletteEditing'
import type { PaletteEntry } from '../templates/types'

function makeEntry(): PaletteEntry {
  return {
    rgb: [230, 60, 80],
    hex: '#e63c50',
    name: { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] },
    textColor: '#ffffff',
    percentage: 40,
  }
}

describe('updatePaletteEntryColor', () => {
  it('replaces rgb and hex with the new color', () => {
    const updated = updatePaletteEntryColor(makeEntry(), '#1e3ca0')
    expect(updated.hex).toBe('#1e3ca0')
    expect(updated.rgb).toEqual([30, 60, 160])
  })

  it('recomputes the nearest color name for the new color', () => {
    const updated = updatePaletteEntryColor(makeEntry(), '#1e3ca0')
    expect(updated.name.zh).not.toBe('绯樱')
  })

  it('recomputes the readable text color for the new background', () => {
    const updated = updatePaletteEntryColor(makeEntry(), '#141d1a')
    expect(updated.textColor).toBe('#ffffff')
  })

  it('preserves the original percentage', () => {
    const updated = updatePaletteEntryColor(makeEntry(), '#1e3ca0')
    expect(updated.percentage).toBe(40)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- paletteEditing`
Expected: FAIL，`Cannot find module './paletteEditing'`

- [ ] **Step 3: 实现单色块手动调色**

`src/lib/paletteEditing.ts`:

```typescript
import { hexToRgb } from './colorMath'
import { nearestColorName } from './colorNames'
import { pickReadableTextColor } from './contrastColor'
import type { PaletteEntry } from '../templates/types'

/**
 * 用户在调色 Tab 手动微调某个色块时调用：只替换这一个色块的颜色，
 * 保留原有占比不变，并重新计算色名与可读文字色。
 */
export function updatePaletteEntryColor(entry: PaletteEntry, newHex: string): PaletteEntry {
  const rgb = hexToRgb(newHex)
  return {
    ...entry,
    rgb,
    hex: newHex.toLowerCase(),
    name: nearestColorName(rgb),
    textColor: pickReadableTextColor(rgb),
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- paletteEditing`
Expected: PASS，4 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/lib/paletteEditing.ts src/lib/paletteEditing.test.ts
git commit -m "feat: add single-swatch manual color override"
```

---

## Task 6: 滤镜缩略图生成（filters.ts 扩展）

**Files:**
- Modify: `src/lib/filters.ts`
- Modify: `src/lib/filters.test.ts`

- [ ] **Step 1: 写失败测试**

在 `src/lib/filters.test.ts` 文件末尾（`describe('applyFilter', ...)` 代码块之后、文件顶部 import 之下新增），追加以下内容。完整文件变为：

```typescript
import { describe, it, expect } from 'vitest'
import { applyFilter, createFilterThumbnail, FILTERS } from './filters'
import { createTestPhoto } from '../../tests/testImage'

function createSolidCanvas(r: number, g: number, b: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 10
  canvas.height = 10
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(0, 0, 10, 10)
  return canvas
}

describe('applyFilter', () => {
  it('leaves pixels unchanged for the "none" filter', () => {
    const canvas = createSolidCanvas(100, 150, 200)
    applyFilter(canvas, 'none')
    const ctx = canvas.getContext('2d')!
    const pixel = ctx.getImageData(0, 0, 1, 1).data
    expect([pixel[0], pixel[1], pixel[2]]).toEqual([100, 150, 200])
  })

  it('warms up colors for the "warmFilm" filter', () => {
    const canvas = createSolidCanvas(100, 100, 100)
    applyFilter(canvas, 'warmFilm')
    const ctx = canvas.getContext('2d')!
    const pixel = ctx.getImageData(0, 0, 1, 1).data
    expect(pixel[0]).toBeGreaterThan(100)
    expect(pixel[2]).toBeLessThan(100)
  })

  it('exposes all filter names in FILTERS', () => {
    expect(FILTERS).toContain('none')
    expect(FILTERS).toContain('warmFilm')
    expect(FILTERS.length).toBeGreaterThanOrEqual(2)
  })
})

describe('createFilterThumbnail', () => {
  it('returns a canvas sized to the requested thumbnail size', () => {
    const photo = createTestPhoto(200, 100)
    const thumbnail = createFilterThumbnail(photo, 'none', 64)
    expect(thumbnail.width).toBe(64)
    expect(thumbnail.height).toBe(64)
  })

  it('applies the requested filter to the thumbnail pixels', () => {
    const photo = createTestPhoto(200, 100)
    const thumbnail = createFilterThumbnail(photo, 'warmFilm', 64)
    const ctx = thumbnail.getContext('2d')!
    const pixel = ctx.getImageData(32, 32, 1, 1).data
    // createTestPhoto 填充的是纯色 #888888（136,136,136），暖调滤镜应提升红色通道
    expect(pixel[0]).toBeGreaterThan(136)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- filters`
Expected: FAIL，`createFilterThumbnail is not a function` 或 `Cannot find export 'createFilterThumbnail'`

- [ ] **Step 3: 实现滤镜缩略图生成**

在 `src/lib/filters.ts` 文件末尾追加：

```typescript
/**
 * 生成指定滤镜应用后的缩略图（居中裁剪填满 size×size 正方形），
 * 用于滤镜选择器展示实时预览，而不只是文字按钮。
 */
export function createFilterThumbnail(
  photo: HTMLImageElement,
  filter: FilterName,
  size: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const scale = Math.max(size / photo.width, size / photo.height)
  const sw = size / scale
  const sh = size / scale
  const sx = (photo.width - sw) / 2
  const sy = (photo.height - sh) / 2
  ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, size, size)

  applyFilter(canvas, filter)
  return canvas
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- filters`
Expected: PASS，5 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/lib/filters.ts src/lib/filters.test.ts
git commit -m "feat: add filter thumbnail generation for live preview swatches"
```

---

## Task 7: 留白与水印合成（cardRenderer.ts 扩展）+ CardConfig 字段扩展

**Files:**
- Modify: `src/templates/types.ts`
- Modify: `src/lib/cardRenderer.ts`
- Modify: `src/lib/cardRenderer.test.ts`
- Modify: `src/components/CardPreview.tsx`

版式渲染函数（`classicStrip`/`magazineCover`）不感知"留白"和"水印"——这两者由 `cardRenderer.ts` 的新函数 `renderCardWithMargin` 统一处理：先在外层画布铺页面背景色，再把版式渲染进一个按留白缩小的内层画布，合成回外层留白位置；水印在合成之后画在外层画布的绝对右下角，与版式内容、留白大小无关。

- [ ] **Step 1: 扩展 CardConfig 与 PaletteEntry 类型**

编辑 `src/templates/types.ts`，把：

```typescript
export interface PaletteEntry {
  rgb: RGB
  hex: string
  name: ColorName
  textColor: '#ffffff' | '#000000'
}
```

改为：

```typescript
export interface PaletteEntry {
  rgb: RGB
  hex: string
  name: ColorName
  textColor: '#ffffff' | '#000000'
  percentage?: number
}
```

把：

```typescript
export interface CardConfig {
  photo: HTMLImageElement
  palette: PaletteEntry[]
  locationName: string
  capturedAtText: string
  titleFont: string
  width: number
  height: number
  colorNameLanguage: ColorNameLanguage
}
```

改为：

```typescript
export interface CardConfig {
  photo: HTMLImageElement
  palette: PaletteEntry[]
  locationName: string
  capturedAtText: string
  titleFont: string
  width: number
  height: number
  colorNameLanguage: ColorNameLanguage
  marginPx?: number
  watermarkEnabled?: boolean
}
```

- [ ] **Step 2: 写失败测试**

编辑 `src/lib/cardRenderer.test.ts`，在顶部 import 中加入 `renderCardWithMargin`：

```typescript
import { describe, it, expect } from 'vitest'
import { renderCardToCanvas, exportCanvasToBlob, renderCardWithMargin } from './cardRenderer'
import type { CardConfig } from '../templates/types'
import { renderClassicStrip } from '../templates/classicStrip'
import { createTestPhoto } from '../../tests/testImage'
```

在文件末尾（`describe('exportCanvasToBlob', ...)` 之后）追加：

```typescript
describe('renderCardWithMargin', () => {
  it('insets the template content by marginPx on all sides', () => {
    const config = { ...makeConfig(), marginPx: 40 }
    const canvas = document.createElement('canvas')
    canvas.width = config.width
    canvas.height = config.height
    const ctx = canvas.getContext('2d')!

    renderCardWithMargin(ctx, config, renderClassicStrip)

    const cornerPixel = ctx.getImageData(5, 5, 1, 1).data
    // 经典色带自身背景是 #faf7f2 (250,247,242)；留白区域应显示页面背景色
    // #f9f9f8 (249,249,248)，而不是版式内部绘制的内容——两者数值不同，
    // 足以区分"留白生效"与"留白未生效、版式直接铺满全图"两种情况。
    expect([cornerPixel[0], cornerPixel[1], cornerPixel[2]]).toEqual([249, 249, 248])
  })

  it('draws a HueFrame watermark in the bottom-right corner when enabled', () => {
    const withoutCanvas = document.createElement('canvas')
    withoutCanvas.width = 400
    withoutCanvas.height = 500
    renderCardWithMargin(withoutCanvas.getContext('2d')!, makeConfig(), renderClassicStrip)

    const withCanvas = document.createElement('canvas')
    withCanvas.width = 400
    withCanvas.height = 500
    renderCardWithMargin(withCanvas.getContext('2d')!, { ...makeConfig(), watermarkEnabled: true }, renderClassicStrip)

    const regionWithout = withoutCanvas.getContext('2d')!.getImageData(320, 460, 60, 20).data
    const regionWith = withCanvas.getContext('2d')!.getImageData(320, 460, 60, 20).data

    expect(Array.from(regionWith)).not.toEqual(Array.from(regionWithout))
  })

  it('does not throw when marginPx and watermarkEnabled are omitted', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 500
    const ctx = canvas.getContext('2d')!
    expect(() => renderCardWithMargin(ctx, makeConfig(), renderClassicStrip)).not.toThrow()
  })
})
```

- [ ] **Step 3: 运行测试确认失败**

Run: `npm run test -- cardRenderer`
Expected: FAIL，`renderCardWithMargin is not a function` 或 `Cannot find export 'renderCardWithMargin'`

- [ ] **Step 4: 实现留白与水印合成**

用以下内容**完全替换** `src/lib/cardRenderer.ts`：

```typescript
import type { CardConfig, TemplateRenderer } from '../templates/types'

const PAGE_BACKGROUND = '#f9f9f8'

/**
 * 把 CardConfig 合成进指定的 canvas 2D 上下文：
 * 1. 若设置了留白（marginPx），先铺页面背景色，再把版式渲染进按留白
 *    缩小后的内层画布，合成回留白位置——版式渲染函数本身不需要知道
 *    "留白"这个概念。
 * 2. 若开启水印，在合成之后于外层画布的绝对右下角画 "HueFrame" 字样，
 *    水印位置与留白大小、版式种类无关。
 */
export function renderCardWithMargin(
  ctx: CanvasRenderingContext2D,
  config: CardConfig,
  renderer: TemplateRenderer
): void {
  const { width, height } = config
  const marginPx = config.marginPx ?? 0

  if (marginPx > 0) {
    ctx.fillStyle = PAGE_BACKGROUND
    ctx.fillRect(0, 0, width, height)
  }

  const innerWidth = width - marginPx * 2
  const innerHeight = height - marginPx * 2
  const innerCanvas = document.createElement('canvas')
  innerCanvas.width = innerWidth
  innerCanvas.height = innerHeight
  const innerCtx = innerCanvas.getContext('2d')!
  renderer(innerCtx, { ...config, width: innerWidth, height: innerHeight })
  ctx.drawImage(innerCanvas, marginPx, marginPx)

  if (config.watermarkEnabled) {
    ctx.fillStyle = 'rgba(26, 28, 28, 0.55)'
    ctx.font = '12px Inter, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('HueFrame', width - 16, height - 16)
  }
}

/**
 * 用指定的版式渲染函数把 CardConfig 画进一个新建的 canvas（含留白与水印合成）。
 */
export function renderCardToCanvas(config: CardConfig, renderer: TemplateRenderer): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = config.width
  canvas.height = config.height
  const ctx = canvas.getContext('2d')!
  renderCardWithMargin(ctx, config, renderer)
  return canvas
}

/**
 * 把 canvas 导出为 PNG Blob，用于下载。
 */
export function exportCanvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('canvas.toBlob returned null'))
      }
    }, 'image/png')
  })
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npm run test -- cardRenderer`
Expected: PASS，5 个测试全部通过（2 个原有 + 3 个新增）

- [ ] **Step 6: 更新 CardPreview 使用合成函数**

编辑 `src/components/CardPreview.tsx`，改为：

```tsx
import { useEffect, useRef } from 'react'
import type { CardConfig, TemplateRenderer } from '../templates/types'
import { renderCardWithMargin } from '../lib/cardRenderer'

interface CardPreviewProps {
  config: CardConfig
  renderer: TemplateRenderer
  onReady?: (canvas: HTMLCanvasElement) => void
}

export function CardPreview({ config, renderer, onReady }: CardPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderCardWithMargin(ctx, config, renderer)
    onReady?.(canvas)
  }, [config, renderer, onReady])

  return <canvas ref={canvasRef} width={config.width} height={config.height} />
}
```

- [ ] **Step 7: 运行完整测试套件确认无回归**

Run: `npm run test`
Expected: 所有测试文件全部 PASS（`CardPreview.test.tsx` 现有测试只检查 canvas 尺寸，不受合成逻辑改动影响）。

- [ ] **Step 8: 提交**

```bash
git add src/templates/types.ts src/lib/cardRenderer.ts src/lib/cardRenderer.test.ts src/components/CardPreview.tsx
git commit -m "feat: add margin and watermark compositing shared by both templates"
```

---

## Task 8: 照片处理管线填充取色占比

**Files:**
- Modify: `src/lib/photoPipeline.ts`
- Modify: `src/lib/photoPipeline.test.ts`

- [ ] **Step 1: 写失败测试**

用以下内容**完全替换** `src/lib/photoPipeline.test.ts`：

```typescript
import { describe, it, expect, vi } from 'vitest'
import { buildCardConfig } from './photoPipeline'

vi.mock('./exifParser', () => ({
  parsePhotoMeta: vi.fn().mockResolvedValue({
    gps: { lat: 35.0116, lon: 135.7681 },
    capturedAt: new Date('2026-04-10T09:30:00'),
  }),
}))

vi.mock('./geocoding', () => ({
  resolveLocationName: vi.fn().mockResolvedValue('Kyoto, Japan'),
}))

vi.mock('./colorExtraction', () => ({
  extractPalette: vi.fn().mockResolvedValue([
    [230, 60, 80],
    [40, 160, 160],
  ]),
}))

vi.mock('./paletteWeights', () => ({
  computePalettePercentages: vi.fn().mockReturnValue([60, 40]),
}))

describe('buildCardConfig', () => {
  it('assembles a complete CardConfig from a photo image', async () => {
    const photo = new Image(200, 200)
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })

    const config = await buildCardConfig(file, photo, {
      width: 800,
      height: 1000,
      titleFont: 'serif',
      colorNameLanguage: 'zh',
    })

    expect(config.locationName).toBe('Kyoto, Japan')
    expect(config.capturedAtText).toContain('2026')
    expect(config.palette.length).toBe(2)
    expect(config.palette[0].hex).toMatch(/^#[0-9a-f]{6}$/i)
    expect(config.palette[0].percentage).toBe(60)
    expect(config.palette[1].percentage).toBe(40)
    expect(config.width).toBe(800)
    expect(config.height).toBe(1000)
    expect(config.colorNameLanguage).toBe('zh')
  })

  it('falls back to coordinate-derived location text when GPS is missing', async () => {
    const { parsePhotoMeta } = await import('./exifParser')
    vi.mocked(parsePhotoMeta).mockResolvedValueOnce({ gps: null, capturedAt: null })

    const photo = new Image(200, 200)
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })

    const config = await buildCardConfig(file, photo, {
      width: 800,
      height: 1000,
      titleFont: 'serif',
      colorNameLanguage: 'zh',
    })

    expect(config.locationName).toBe('未知地点')
    expect(config.capturedAtText).toBe('')
  })

  it('passes through colorNameLanguage "en" unchanged', async () => {
    const photo = new Image(200, 200)
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })

    const config = await buildCardConfig(file, photo, {
      width: 800,
      height: 1000,
      titleFont: 'serif',
      colorNameLanguage: 'en',
    })

    expect(config.colorNameLanguage).toBe('en')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- photoPipeline`
Expected: FAIL，`config.palette[0].percentage` 为 `undefined`，与期望的 `60` 不符

- [ ] **Step 3: 实现取色占比填充**

用以下内容**完全替换** `src/lib/photoPipeline.ts`：

```typescript
import { extractPalette } from './colorExtraction'
import { rgbToHex } from './colorMath'
import { nearestColorName } from './colorNames'
import { pickReadableTextColor } from './contrastColor'
import { parsePhotoMeta } from './exifParser'
import { resolveLocationName } from './geocoding'
import { computePalettePercentages } from './paletteWeights'
import type { CardConfig, ColorNameLanguage, PaletteEntry } from '../templates/types'

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export interface CardOptions {
  width: number
  height: number
  titleFont: string
  colorNameLanguage: ColorNameLanguage
}

/**
 * 整条处理管线：文件 → EXIF/GPS/取色/占比 → 组装成可直接传给版式渲染器的 CardConfig。
 * GPS 缺失时地点显示"未知地点"，拍摄时间缺失时留空，不阻塞主流程。
 */
export async function buildCardConfig(
  file: File,
  photo: HTMLImageElement,
  options: CardOptions
): Promise<CardConfig> {
  const [meta, rawPalette] = await Promise.all([parsePhotoMeta(file), extractPalette(photo, 6)])

  const locationName = meta.gps ? await resolveLocationName(meta.gps) : '未知地点'
  const capturedAtText = meta.capturedAt ? formatDate(meta.capturedAt) : ''
  const percentages = computePalettePercentages(photo, rawPalette)

  const palette: PaletteEntry[] = rawPalette.map((rgb, index) => ({
    rgb,
    hex: rgbToHex(rgb),
    name: nearestColorName(rgb),
    textColor: pickReadableTextColor(rgb),
    percentage: percentages[index],
  }))

  return {
    photo,
    palette,
    locationName,
    capturedAtText,
    titleFont: options.titleFont,
    width: options.width,
    height: options.height,
    colorNameLanguage: options.colorNameLanguage,
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- photoPipeline`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 运行完整测试套件确认无回归**

Run: `npm run test`
Expected: 所有测试文件全部 PASS

- [ ] **Step 6: 提交**

```bash
git add src/lib/photoPipeline.ts src/lib/photoPipeline.test.ts
git commit -m "feat: populate palette percentage in the photo processing pipeline"
```

---

## Task 9: FilterPicker 加入缩略图预览

**Files:**
- Modify: `src/components/FilterPicker.tsx`
- Modify: `src/components/FilterPicker.test.tsx`

- [ ] **Step 1: 写失败测试**

用以下内容**完全替换** `src/components/FilterPicker.test.tsx`：

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterPicker } from './FilterPicker'
import { createTestPhoto } from '../../tests/testImage'

describe('FilterPicker', () => {
  it('renders an option for each filter', () => {
    render(<FilterPicker selected="none" photo={createTestPhoto()} onSelect={vi.fn()} />)
    expect(screen.getByText('无滤镜')).toBeInTheDocument()
    expect(screen.getByText('暖调胶片')).toBeInTheDocument()
    expect(screen.getByText('冷调胶片')).toBeInTheDocument()
    expect(screen.getByText('复古正片')).toBeInTheDocument()
  })

  it('calls onSelect with the clicked filter name', () => {
    const onSelect = vi.fn()
    render(<FilterPicker selected="none" photo={createTestPhoto()} onSelect={onSelect} />)

    fireEvent.click(screen.getByText('暖调胶片'))

    expect(onSelect).toHaveBeenCalledWith('warmFilm')
  })

  it('renders a thumbnail canvas for each filter option', () => {
    const { container } = render(<FilterPicker selected="none" photo={createTestPhoto()} onSelect={vi.fn()} />)
    const canvases = container.querySelectorAll('canvas')
    expect(canvases.length).toBe(4)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- FilterPicker`
Expected: FAIL（`photo` 属性类型不匹配，或渲染时找不到 canvas 元素）

- [ ] **Step 3: 实现缩略图预览**

用以下内容**完全替换** `src/components/FilterPicker.tsx`：

```tsx
import { useEffect, useRef } from 'react'
import { FILTERS, createFilterThumbnail, type FilterName } from '../lib/filters'

const LABELS: Record<FilterName, string> = {
  none: '无滤镜',
  warmFilm: '暖调胶片',
  coolFilm: '冷调胶片',
  vintagePositive: '复古正片',
}

const THUMBNAIL_SIZE = 64

interface FilterThumbnailProps {
  photo: HTMLImageElement
  filter: FilterName
}

function FilterThumbnail({ photo, filter }: FilterThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const thumbnail = createFilterThumbnail(photo, filter, THUMBNAIL_SIZE)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(thumbnail, 0, 0)
  }, [photo, filter])

  return <canvas ref={canvasRef} width={THUMBNAIL_SIZE} height={THUMBNAIL_SIZE} />
}

interface FilterPickerProps {
  selected: FilterName
  photo: HTMLImageElement
  onSelect: (filter: FilterName) => void
}

export function FilterPicker({ selected, photo, onSelect }: FilterPickerProps) {
  return (
    <div>
      {FILTERS.map((filter) => (
        <button key={filter} onClick={() => onSelect(filter)} aria-pressed={selected === filter}>
          <FilterThumbnail photo={photo} filter={filter} />
          {LABELS[filter]}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- FilterPicker`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/components/FilterPicker.tsx src/components/FilterPicker.test.tsx
git commit -m "feat: render live filter thumbnails in FilterPicker"
```

---

## Task 10: 比例选择器与留白滑杆

**Files:**
- Create: `src/components/AspectRatioPicker.tsx`
- Test: `src/components/AspectRatioPicker.test.tsx`
- Create: `src/components/MarginSlider.tsx`
- Test: `src/components/MarginSlider.test.tsx`

- [ ] **Step 1: 写失败测试（AspectRatioPicker）**

`src/components/AspectRatioPicker.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AspectRatioPicker } from './AspectRatioPicker'

describe('AspectRatioPicker', () => {
  it('renders all three ratio options', () => {
    render(<AspectRatioPicker selected="4:5" onSelect={vi.fn()} />)
    expect(screen.getByText('4:5')).toBeInTheDocument()
    expect(screen.getByText('1:1')).toBeInTheDocument()
    expect(screen.getByText('16:9')).toBeInTheDocument()
  })

  it('calls onSelect with the clicked ratio', () => {
    const onSelect = vi.fn()
    render(<AspectRatioPicker selected="4:5" onSelect={onSelect} />)
    fireEvent.click(screen.getByText('1:1'))
    expect(onSelect).toHaveBeenCalledWith('1:1')
  })

  it('marks the selected ratio as pressed', () => {
    render(<AspectRatioPicker selected="16:9" onSelect={vi.fn()} />)
    expect(screen.getByText('16:9')).toHaveAttribute('aria-pressed', 'true')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- AspectRatioPicker`
Expected: FAIL，`Cannot find module './AspectRatioPicker'`

- [ ] **Step 3: 实现 AspectRatioPicker**

`src/components/AspectRatioPicker.tsx`:

```tsx
import { ASPECT_RATIOS, type AspectRatioId } from '../lib/aspectRatio'

interface AspectRatioPickerProps {
  selected: AspectRatioId
  onSelect: (ratio: AspectRatioId) => void
}

export function AspectRatioPicker({ selected, onSelect }: AspectRatioPickerProps) {
  return (
    <div>
      {ASPECT_RATIOS.map((ratio) => (
        <button key={ratio} onClick={() => onSelect(ratio)} aria-pressed={selected === ratio}>
          {ratio}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: 运行测试确认通过（AspectRatioPicker）**

Run: `npm run test -- AspectRatioPicker`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 写失败测试（MarginSlider）**

`src/components/MarginSlider.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MarginSlider } from './MarginSlider'

describe('MarginSlider', () => {
  it('displays the current margin value', () => {
    render(<MarginSlider valuePx={24} onChange={vi.fn()} />)
    expect(screen.getByText('24px')).toBeInTheDocument()
  })

  it('calls onChange with the new numeric value when moved', () => {
    const onChange = vi.fn()
    render(<MarginSlider valuePx={24} onChange={onChange} />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '48' } })
    expect(onChange).toHaveBeenCalledWith(48)
  })
})
```

- [ ] **Step 6: 运行测试确认失败**

Run: `npm run test -- MarginSlider`
Expected: FAIL，`Cannot find module './MarginSlider'`

- [ ] **Step 7: 实现 MarginSlider**

`src/components/MarginSlider.tsx`:

```tsx
interface MarginSliderProps {
  valuePx: number
  onChange: (valuePx: number) => void
  min?: number
  max?: number
}

export function MarginSlider({ valuePx, onChange, min = 0, max = 80 }: MarginSliderProps) {
  return (
    <div>
      <label htmlFor="margin-slider">留白 (Margin)</label>
      <input
        id="margin-slider"
        type="range"
        min={min}
        max={max}
        value={valuePx}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span>{valuePx}px</span>
    </div>
  )
}
```

- [ ] **Step 8: 运行测试确认通过（MarginSlider）**

Run: `npm run test -- MarginSlider`
Expected: PASS，2 个测试全部通过

- [ ] **Step 9: 提交**

```bash
git add src/components/AspectRatioPicker.tsx src/components/AspectRatioPicker.test.tsx src/components/MarginSlider.tsx src/components/MarginSlider.test.tsx
git commit -m "feat: add aspect ratio picker and margin slider for the layout tab"
```

---

## Task 11: 调色列表（PaletteList）

**Files:**
- Create: `src/components/PaletteList.tsx`
- Test: `src/components/PaletteList.test.tsx`

- [ ] **Step 1: 写失败测试**

`src/components/PaletteList.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PaletteList } from './PaletteList'
import type { PaletteEntry } from '../templates/types'

function makePalette(): PaletteEntry[] {
  return [
    {
      rgb: [230, 60, 80],
      hex: '#e63c50',
      name: { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] },
      textColor: '#ffffff',
      percentage: 60,
    },
    {
      rgb: [40, 160, 160],
      hex: '#28a0a0',
      name: { zh: '青碧', en: 'Cyan Jade', rgb: [40, 160, 160] },
      textColor: '#ffffff',
      percentage: 40,
    },
  ]
}

describe('PaletteList', () => {
  it('renders name, hex, and percentage for each color in Chinese by default', () => {
    render(<PaletteList palette={makePalette()} language="zh" onColorChange={vi.fn()} />)
    expect(screen.getByText('绯樱')).toBeInTheDocument()
    expect(screen.getByText('#E63C50')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('renders English color names when language is "en"', () => {
    render(<PaletteList palette={makePalette()} language="en" onColorChange={vi.fn()} />)
    expect(screen.getByText('Cherry Blush')).toBeInTheDocument()
  })

  it('calls onColorChange with the swatch index and new hex when a color input changes', () => {
    const onColorChange = vi.fn()
    render(<PaletteList palette={makePalette()} language="zh" onColorChange={onColorChange} />)

    const firstSwatch = screen.getByLabelText('edit-color-0')
    fireEvent.change(firstSwatch, { target: { value: '#123456' } })

    expect(onColorChange).toHaveBeenCalledWith(0, '#123456')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- PaletteList`
Expected: FAIL，`Cannot find module './PaletteList'`

- [ ] **Step 3: 实现调色列表**

`src/components/PaletteList.tsx`:

```tsx
import type { ColorNameLanguage, PaletteEntry } from '../templates/types'

interface PaletteListProps {
  palette: PaletteEntry[]
  language: ColorNameLanguage
  onColorChange: (index: number, newHex: string) => void
}

export function PaletteList({ palette, language, onColorChange }: PaletteListProps) {
  return (
    <ul>
      {palette.map((entry, index) => (
        <li key={index}>
          <input
            type="color"
            aria-label={`edit-color-${index}`}
            value={entry.hex}
            onChange={(e) => onColorChange(index, e.target.value)}
          />
          <span>{language === 'en' ? entry.name.en : entry.name.zh}</span>
          <span>{entry.hex.toUpperCase()}</span>
          {entry.percentage !== undefined && <span>{entry.percentage}%</span>}
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- PaletteList`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/components/PaletteList.tsx src/components/PaletteList.test.tsx
git commit -m "feat: add editable palette list with hex and percentage"
```

---

## Task 12: 信息面板（InfoPanel）

**Files:**
- Create: `src/components/InfoPanel.tsx`
- Test: `src/components/InfoPanel.test.tsx`

- [ ] **Step 1: 写失败测试**

`src/components/InfoPanel.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InfoPanel } from './InfoPanel'

describe('InfoPanel', () => {
  it('displays the current location and captured-at text', () => {
    render(
      <InfoPanel
        locationName="Kyoto, Japan"
        capturedAtText="2026-04-10"
        watermarkEnabled
        onLocationChange={vi.fn()}
        onCapturedAtChange={vi.fn()}
        onWatermarkToggle={vi.fn()}
      />
    )
    expect(screen.getByDisplayValue('Kyoto, Japan')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-04-10')).toBeInTheDocument()
  })

  it('calls onLocationChange when the location input is edited', () => {
    const onLocationChange = vi.fn()
    render(
      <InfoPanel
        locationName="Kyoto, Japan"
        capturedAtText="2026-04-10"
        watermarkEnabled
        onLocationChange={onLocationChange}
        onCapturedAtChange={vi.fn()}
        onWatermarkToggle={vi.fn()}
      />
    )
    fireEvent.change(screen.getByLabelText('地点'), { target: { value: 'Osaka, Japan' } })
    expect(onLocationChange).toHaveBeenCalledWith('Osaka, Japan')
  })

  it('calls onWatermarkToggle with the checkbox state', () => {
    const onWatermarkToggle = vi.fn()
    render(
      <InfoPanel
        locationName="Kyoto, Japan"
        capturedAtText="2026-04-10"
        watermarkEnabled={false}
        onLocationChange={vi.fn()}
        onCapturedAtChange={vi.fn()}
        onWatermarkToggle={onWatermarkToggle}
      />
    )
    fireEvent.click(screen.getByLabelText('HueFrame 水印'))
    expect(onWatermarkToggle).toHaveBeenCalledWith(true)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- InfoPanel`
Expected: FAIL，`Cannot find module './InfoPanel'`

- [ ] **Step 3: 实现信息面板**

`src/components/InfoPanel.tsx`:

```tsx
interface InfoPanelProps {
  locationName: string
  capturedAtText: string
  watermarkEnabled: boolean
  onLocationChange: (value: string) => void
  onCapturedAtChange: (value: string) => void
  onWatermarkToggle: (enabled: boolean) => void
}

export function InfoPanel({
  locationName,
  capturedAtText,
  watermarkEnabled,
  onLocationChange,
  onCapturedAtChange,
  onWatermarkToggle,
}: InfoPanelProps) {
  return (
    <div>
      <label htmlFor="location-input">地点</label>
      <input
        id="location-input"
        type="text"
        value={locationName}
        onChange={(e) => onLocationChange(e.target.value)}
      />

      <label htmlFor="captured-at-input">时间</label>
      <input
        id="captured-at-input"
        type="text"
        value={capturedAtText}
        onChange={(e) => onCapturedAtChange(e.target.value)}
      />

      <label htmlFor="watermark-toggle">HueFrame 水印</label>
      <input
        id="watermark-toggle"
        type="checkbox"
        checked={watermarkEnabled}
        onChange={(e) => onWatermarkToggle(e.target.checked)}
      />
    </div>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- InfoPanel`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/components/InfoPanel.tsx src/components/InfoPanel.test.tsx
git commit -m "feat: add info panel for editable location, date, and watermark toggle"
```

---

## Task 13: 底部导航（BottomNav）

**Files:**
- Create: `src/components/BottomNav.tsx`
- Test: `src/components/BottomNav.test.tsx`

设计文档把"宫格""裁剪"两个 Tab 的占位交互留给实施阶段决定：本任务采用**禁用态**（按钮存在但不可点击），不建占位页——避免让用户点进一个半成品页面产生错误预期，且实现成本最低。

- [ ] **Step 1: 写失败测试**

`src/components/BottomNav.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('renders all three tabs', () => {
    render(<BottomNav active="card" onSelect={vi.fn()} />)
    expect(screen.getByText('卡片')).toBeInTheDocument()
    expect(screen.getByText('宫格')).toBeInTheDocument()
    expect(screen.getByText('裁剪')).toBeInTheDocument()
  })

  it('disables the grid and crop tabs', () => {
    render(<BottomNav active="card" onSelect={vi.fn()} />)
    expect(screen.getByText('宫格')).toBeDisabled()
    expect(screen.getByText('裁剪')).toBeDisabled()
  })

  it('calls onSelect when the enabled card tab is clicked', () => {
    const onSelect = vi.fn()
    render(<BottomNav active="card" onSelect={onSelect} />)
    fireEvent.click(screen.getByText('卡片'))
    expect(onSelect).toHaveBeenCalledWith('card')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- BottomNav`
Expected: FAIL，`Cannot find module './BottomNav'`

- [ ] **Step 3: 实现底部导航**

`src/components/BottomNav.tsx`:

```tsx
export type AppTab = 'card' | 'grid' | 'crop'

interface TabOption {
  id: AppTab
  label: string
  disabled?: boolean
}

const TABS: TabOption[] = [
  { id: 'card', label: '卡片' },
  { id: 'grid', label: '宫格', disabled: true },
  { id: 'crop', label: '裁剪', disabled: true },
]

interface BottomNavProps {
  active: AppTab
  onSelect: (tab: AppTab) => void
}

export function BottomNav({ active, onSelect }: BottomNavProps) {
  return (
    <nav>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          disabled={tab.disabled}
          aria-pressed={active === tab.id}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- BottomNav`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/components/BottomNav.tsx src/components/BottomNav.test.tsx
git commit -m "feat: add bottom tab navigation with grid/crop tabs disabled"
```

---

## Task 14: 卡片二级 Tab 容器（CardTabs）

**Files:**
- Create: `src/components/CardTabs.tsx`
- Test: `src/components/CardTabs.test.tsx`

- [ ] **Step 1: 写失败测试**

`src/components/CardTabs.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardTabs } from './CardTabs'

describe('CardTabs', () => {
  it('renders all four sub-tab labels', () => {
    render(
      <CardTabs
        active="filter"
        onSelect={vi.fn()}
        filterPanel={<div>滤镜面板</div>}
        layoutPanel={<div>版式面板</div>}
        palettePanel={<div>调色面板</div>}
        infoPanel={<div>信息面板</div>}
      />
    )
    expect(screen.getByText('滤镜')).toBeInTheDocument()
    expect(screen.getByText('版式')).toBeInTheDocument()
    expect(screen.getByText('调色')).toBeInTheDocument()
    expect(screen.getByText('信息')).toBeInTheDocument()
  })

  it('only renders the panel for the active tab', () => {
    render(
      <CardTabs
        active="palette"
        onSelect={vi.fn()}
        filterPanel={<div>滤镜面板</div>}
        layoutPanel={<div>版式面板</div>}
        palettePanel={<div>调色面板</div>}
        infoPanel={<div>信息面板</div>}
      />
    )
    expect(screen.getByText('调色面板')).toBeInTheDocument()
    expect(screen.queryByText('滤镜面板')).not.toBeInTheDocument()
  })

  it('calls onSelect with the clicked sub-tab id', () => {
    const onSelect = vi.fn()
    render(
      <CardTabs
        active="filter"
        onSelect={onSelect}
        filterPanel={<div>滤镜面板</div>}
        layoutPanel={<div>版式面板</div>}
        palettePanel={<div>调色面板</div>}
        infoPanel={<div>信息面板</div>}
      />
    )
    fireEvent.click(screen.getByText('调色'))
    expect(onSelect).toHaveBeenCalledWith('palette')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- CardTabs`
Expected: FAIL，`Cannot find module './CardTabs'`

- [ ] **Step 3: 实现二级 Tab 容器**

`src/components/CardTabs.tsx`:

```tsx
import type { ReactNode } from 'react'

export type CardSubTab = 'filter' | 'layout' | 'palette' | 'info'

const SUB_TABS: { id: CardSubTab; label: string }[] = [
  { id: 'filter', label: '滤镜' },
  { id: 'layout', label: '版式' },
  { id: 'palette', label: '调色' },
  { id: 'info', label: '信息' },
]

interface CardTabsProps {
  active: CardSubTab
  onSelect: (tab: CardSubTab) => void
  filterPanel: ReactNode
  layoutPanel: ReactNode
  palettePanel: ReactNode
  infoPanel: ReactNode
}

const PANEL_KEYS: Record<CardSubTab, 'filterPanel' | 'layoutPanel' | 'palettePanel' | 'infoPanel'> = {
  filter: 'filterPanel',
  layout: 'layoutPanel',
  palette: 'palettePanel',
  info: 'infoPanel',
}

export function CardTabs(props: CardTabsProps) {
  const { active, onSelect } = props
  return (
    <div>
      <div>
        {SUB_TABS.map((tab) => (
          <button key={tab.id} aria-pressed={active === tab.id} onClick={() => onSelect(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div>{props[PANEL_KEYS[active]]}</div>
    </div>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- CardTabs`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/components/CardTabs.tsx src/components/CardTabs.test.tsx
git commit -m "feat: add card sub-tab container for filter/layout/palette/info panels"
```

---

## Task 15: 空状态与顶部栏

**Files:**
- Create: `src/components/EmptyState.tsx`
- Test: `src/components/EmptyState.test.tsx`
- Create: `src/components/TopBar.tsx`
- Test: `src/components/TopBar.test.tsx`

- [ ] **Step 1: 写失败测试（EmptyState）**

`src/components/EmptyState.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders the headline and format hint', () => {
    render(<EmptyState onFileSelected={vi.fn()} />)
    expect(screen.getByText('给照片，配一套颜色。')).toBeInTheDocument()
    expect(screen.getByText('本地解析支持 JPG / PNG / WEBP')).toBeInTheDocument()
  })

  it('forwards the selected file to onFileSelected via the upload zone', () => {
    const onFileSelected = vi.fn()
    render(<EmptyState onFileSelected={onFileSelected} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('upload-input')
    fireEvent.change(input, { target: { files: [file] } })

    expect(onFileSelected).toHaveBeenCalledWith(file)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- EmptyState`
Expected: FAIL，`Cannot find module './EmptyState'`

- [ ] **Step 3: 实现空状态**

`src/components/EmptyState.tsx`:

```tsx
import { UploadZone } from './UploadZone'

interface EmptyStateProps {
  onFileSelected: (file: File) => void
}

export function EmptyState({ onFileSelected }: EmptyStateProps) {
  return (
    <div>
      <h2>给照片，配一套颜色。</h2>
      <UploadZone onFileSelected={onFileSelected} />
      <p>本地解析支持 JPG / PNG / WEBP</p>
    </div>
  )
}
```

- [ ] **Step 4: 运行测试确认通过（EmptyState）**

Run: `npm run test -- EmptyState`
Expected: PASS，2 个测试全部通过

- [ ] **Step 5: 写失败测试（TopBar）**

`src/components/TopBar.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopBar } from './TopBar'

describe('TopBar', () => {
  it('renders the HueFrame title', () => {
    render(<TopBar language="zh" onLanguageChange={vi.fn()} />)
    expect(screen.getByText('HueFrame')).toBeInTheDocument()
  })

  it('forwards language selection via onLanguageChange', () => {
    const onLanguageChange = vi.fn()
    render(<TopBar language="zh" onLanguageChange={onLanguageChange} />)
    fireEvent.click(screen.getByText('English'))
    expect(onLanguageChange).toHaveBeenCalledWith('en')
  })
})
```

- [ ] **Step 6: 运行测试确认失败**

Run: `npm run test -- TopBar`
Expected: FAIL，`Cannot find module './TopBar'`

- [ ] **Step 7: 实现顶部栏**

`src/components/TopBar.tsx`:

```tsx
import { LanguagePicker } from './LanguagePicker'
import type { ColorNameLanguage } from '../templates/types'

interface TopBarProps {
  language: ColorNameLanguage
  onLanguageChange: (language: ColorNameLanguage) => void
}

export function TopBar({ language, onLanguageChange }: TopBarProps) {
  return (
    <header>
      <h1>HueFrame</h1>
      <LanguagePicker selected={language} onSelect={onLanguageChange} />
    </header>
  )
}
```

- [ ] **Step 8: 运行测试确认通过（TopBar）**

Run: `npm run test -- TopBar`
Expected: PASS，2 个测试全部通过

- [ ] **Step 9: 提交**

```bash
git add src/components/EmptyState.tsx src/components/EmptyState.test.tsx src/components/TopBar.tsx src/components/TopBar.test.tsx
git commit -m "feat: add empty state and top bar components"
```

---

## Task 16: App 组件整合与手动验证

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 整合所有组件，实现完整交互**

用以下内容**完全替换** `src/App.tsx`：

```tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TopBar } from './components/TopBar'
import { BottomNav, type AppTab } from './components/BottomNav'
import { EmptyState } from './components/EmptyState'
import { CardTabs, type CardSubTab } from './components/CardTabs'
import { FilterPicker } from './components/FilterPicker'
import { TemplatePicker, type TemplateId } from './components/TemplatePicker'
import { AspectRatioPicker } from './components/AspectRatioPicker'
import { MarginSlider } from './components/MarginSlider'
import { PaletteList } from './components/PaletteList'
import { InfoPanel } from './components/InfoPanel'
import { CardPreview } from './components/CardPreview'
import { ExportButton } from './components/ExportButton'
import { buildCardConfig } from './lib/photoPipeline'
import { applyFilter, type FilterName } from './lib/filters'
import { dimensionsForAspectRatio, type AspectRatioId } from './lib/aspectRatio'
import { updatePaletteEntryColor } from './lib/paletteEditing'
import { renderClassicStrip } from './templates/classicStrip'
import { renderMagazineCover } from './templates/magazineCover'
import type { CardConfig, ColorNameLanguage, PaletteEntry, TemplateRenderer } from './templates/types'

const RENDERERS: Record<TemplateId, TemplateRenderer> = {
  classicStrip: renderClassicStrip,
  magazineCover: renderMagazineCover,
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

function applyFilterToImage(photo: HTMLImageElement, filter: FilterName): Promise<HTMLImageElement> {
  const canvas = document.createElement('canvas')
  canvas.width = photo.naturalWidth
  canvas.height = photo.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(photo, 0, 0)
  applyFilter(canvas, filter)

  return new Promise((resolve) => {
    const filtered = new Image()
    filtered.onload = () => resolve(filtered)
    filtered.src = canvas.toDataURL()
  })
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('card')
  const [activeSubTab, setActiveSubTab] = useState<CardSubTab>('filter')

  // originalPhoto + baseConfig 保存取色/EXIF 等一次性处理结果（基于未加滤镜的原图，
  // 保证色卡反映照片真实色彩）；滤镜只影响展示用的 displayPhoto，不重新提取颜色。
  const [originalPhoto, setOriginalPhoto] = useState<HTMLImageElement | null>(null)
  const [baseConfig, setBaseConfig] = useState<CardConfig | null>(null)
  const [displayPhoto, setDisplayPhoto] = useState<HTMLImageElement | null>(null)

  // 调色/信息 Tab 的手动编辑覆盖值：未编辑时为 null，读取 baseConfig 里的自动识别结果。
  const [paletteOverride, setPaletteOverride] = useState<PaletteEntry[] | null>(null)
  const [locationOverride, setLocationOverride] = useState<string | null>(null)
  const [capturedAtOverride, setCapturedAtOverride] = useState<string | null>(null)

  const [template, setTemplate] = useState<TemplateId>('classicStrip')
  const [filter, setFilter] = useState<FilterName>('none')
  const [language, setLanguage] = useState<ColorNameLanguage>('zh')
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>('4:5')
  const [marginPx, setMarginPx] = useState(24)
  const [watermarkEnabled, setWatermarkEnabled] = useState(true)

  const [isProcessing, setIsProcessing] = useState(false)
  const [exportCanvas, setExportCanvas] = useState<HTMLCanvasElement | null>(null)

  const { width, height } = dimensionsForAspectRatio(aspectRatio)

  const config = useMemo(() => {
    if (!baseConfig || !displayPhoto) return null
    return {
      ...baseConfig,
      photo: displayPhoto,
      colorNameLanguage: language,
      width,
      height,
      marginPx,
      watermarkEnabled,
      palette: paletteOverride ?? baseConfig.palette,
      locationName: locationOverride ?? baseConfig.locationName,
      capturedAtText: capturedAtOverride ?? baseConfig.capturedAtText,
    }
  }, [
    baseConfig,
    displayPhoto,
    language,
    width,
    height,
    marginPx,
    watermarkEnabled,
    paletteOverride,
    locationOverride,
    capturedAtOverride,
  ])

  const handleFileSelected = useCallback(
    async (file: File) => {
      setIsProcessing(true)
      try {
        const photo = await loadImage(file)
        const cardConfig = await buildCardConfig(file, photo, {
          width,
          height,
          titleFont: 'Georgia, serif',
          colorNameLanguage: language,
        })
        setOriginalPhoto(photo)
        setBaseConfig(cardConfig)
        setPaletteOverride(null)
        setLocationOverride(null)
        setCapturedAtOverride(null)
      } finally {
        setIsProcessing(false)
      }
    },
    [language]
  )

  useEffect(() => {
    if (!originalPhoto) return
    let cancelled = false
    applyFilterToImage(originalPhoto, filter).then((filtered) => {
      if (!cancelled) setDisplayPhoto(filtered)
    })
    return () => {
      cancelled = true
    }
  }, [originalPhoto, filter])

  const handlePaletteColorChange = useCallback(
    (index: number, newHex: string) => {
      if (!config) return
      const current = paletteOverride ?? config.palette
      const updated = current.map((entry, i) => (i === index ? updatePaletteEntryColor(entry, newHex) : entry))
      setPaletteOverride(updated)
    },
    [config, paletteOverride]
  )

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <TopBar language={language} onLanguageChange={setLanguage} />

      {activeTab === 'card' && (
        <>
          {!baseConfig && <EmptyState onFileSelected={handleFileSelected} />}

          {isProcessing && <p>处理中…</p>}

          {config && (
            <>
              <CardPreview config={config} renderer={RENDERERS[template]} onReady={setExportCanvas} />

              <CardTabs
                active={activeSubTab}
                onSelect={setActiveSubTab}
                filterPanel={
                  originalPhoto && <FilterPicker selected={filter} photo={originalPhoto} onSelect={setFilter} />
                }
                layoutPanel={
                  <>
                    <TemplatePicker selected={template} onSelect={setTemplate} />
                    <AspectRatioPicker selected={aspectRatio} onSelect={setAspectRatio} />
                    <MarginSlider valuePx={marginPx} onChange={setMarginPx} />
                  </>
                }
                palettePanel={
                  <PaletteList
                    palette={config.palette}
                    language={language}
                    onColorChange={handlePaletteColorChange}
                  />
                }
                infoPanel={
                  <InfoPanel
                    locationName={config.locationName}
                    capturedAtText={config.capturedAtText}
                    watermarkEnabled={watermarkEnabled}
                    onLocationChange={setLocationOverride}
                    onCapturedAtChange={setCapturedAtOverride}
                    onWatermarkToggle={setWatermarkEnabled}
                  />
                }
              />

              <ExportButton canvas={exportCanvas} fileName="hueframe-card.png" />
            </>
          )}
        </>
      )}

      {activeTab !== 'card' && <p>敬请期待</p>}

      <BottomNav active={activeTab} onSelect={setActiveTab} />
    </div>
  )
}
```

- [ ] **Step 2: 运行完整测试套件确认无回归**

Run: `npm run test`
Expected: 所有测试文件全部 PASS

- [ ] **Step 3: 运行类型检查**

Run: `npx tsc -b --noEmit`
Expected: 无报错

- [ ] **Step 4: 启动开发服务器手动验证完整流程**

Run: `npm run dev`

在浏览器中打开输出的本地地址，手动执行：

1. 确认空状态展示"给照片，配一套颜色。"大标题、虚线上传区、"本地解析支持 JPG / PNG / WEBP"提示文字
2. 上传一张照片，确认出现短暂"处理中…"提示，随后显示照片+色卡预览、二级 Tab 组（滤镜/版式/调色/信息）、导出按钮
3. 切到"滤镜"Tab，确认 4 个滤镜按钮各自显示不同的缩略图预览；点击其中一个，确认主预览图颜色随之变化
4. 切到"版式"Tab：
   - 切换经典色带/杂志封面，确认主预览版式随之变化
   - 切换比例 4:5/1:1/16:9，确认主预览画布的宽高比随之变化，且不报错
   - 拖动留白滑杆，确认主预览四周出现可见留白，留白区域是页面背景色而非版式内容
5. 切到"调色"Tab，确认色块列表按占比从高到低排列（如果 UI 未强制排序，用取色管线返回的 dominance 顺序即视为按占比排列），每项显示色名、HEX、百分比；点击某个色块的取色器改变颜色，确认该色块的名称/HEX 更新、主预览对应色块也更新，其他色块不受影响
6. 切到"信息"Tab，手动编辑地点/时间文字，确认主预览底部文字随之更新；切换水印开关，确认主预览右下角 "HueFrame" 水印文字随之出现/消失
7. 切换中英文（顶部栏），确认调色 Tab 的色名语言随之切换，且不重新触发取色/EXIF 请求（网络面板无新增请求）
8. 确认底部导航"宫格""裁剪"按钮为禁用态、无法点击
9. 点击"导出图片"，确认浏览器下载一个 PNG 文件，打开后内容与预览一致（含当前的留白/水印设置）

Expected: 全流程无控制台报错，导出的 PNG 可正常打开且内容正确。

- [ ] **Step 5: 验证生产构建**

Run: `npm run build`
Expected: 构建成功，无报错。构建完成后删除产物：

```bash
rm -rf dist
```

- [ ] **Step 6: 提交**

```bash
git add src/App.tsx
git commit -m "feat: integrate card tab shell with filter/layout/palette/info sub-tabs"
```

---

## 完成标准

- [ ] 全部 16 个任务的 checkbox 均已勾选
- [ ] `npm run test` 全部通过
- [ ] `npx tsc -b --noEmit` 无报错
- [ ] `npm run build` 成功
- [ ] 手动验证：空状态 → 上传 → 滤镜缩略图切换 → 版式/比例/留白调整 → 调色列表编辑 → 信息编辑+水印开关 → 中英切换 → 导出 PNG，全流程符合 [设计文档](../specs/2026-07-02-card-tab-redesign.md) 描述
- [ ] 全部改动已通过独立 commit 提交，无遗留未提交文件（`git status` 为空）
