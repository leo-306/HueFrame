# HueFrame MVP 基线 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建一个纯前端照片色卡拼贴工具的 MVP：上传照片 → 提取主色调 → 识别地点/时间 → 应用滤镜 → 用 2 套版式渲染成可导出的色卡拼贴图。

**Architecture:** React + Vite 单页应用，无后端。核心数据流是单向管线：`File → HTMLImageElement → { colors, exif, location } → CardConfig → <canvas> 渲染 → PNG 导出`。每个处理步骤是独立的纯函数模块，互不依赖 React，方便单独测试；React 组件只负责编排调用和展示状态。

**Tech Stack:** React 18、Vite、TypeScript、color-thief-browser（取色）、exifr（EXIF/GPS/HEIC 解析）、Vitest（单元测试）、Nominatim（逆地理编码，免费公共 API，失败时降级为经纬度文本）。

---

## 文件结构

```
hueframe/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx                    # React 入口
│   ├── App.tsx                     # 顶层编排：上传 → 处理 → 预览 → 导出
│   ├── lib/
│   │   ├── colorExtraction.ts      # 取色引擎（封装 color-thief-browser + 色名匹配）
│   │   ├── colorExtraction.test.ts
│   │   ├── colorNames.ts           # 中文色名表 + 最近色匹配
│   │   ├── colorNames.test.ts
│   │   ├── exifParser.ts           # 封装 exifr：GPS 坐标 + 拍摄时间提取
│   │   ├── exifParser.test.ts
│   │   ├── geocoding.ts            # GPS → 地名（Nominatim），带降级
│   │   ├── geocoding.test.ts
│   │   ├── filters.ts              # 滤镜：Canvas 像素级颜色变换
│   │   ├── filters.test.ts
│   │   ├── contrastColor.ts        # WCAG 对比度计算，取文字色
│   │   ├── contrastColor.test.ts
│   │   └── cardRenderer.ts         # 把 CardConfig 渲染进 <canvas>，支持导出 PNG
│   ├── templates/
│   │   ├── types.ts                # CardConfig、Template 接口定义
│   │   ├── classicStrip.ts         # 版式一：经典色带
│   │   └── magazineCover.ts        # 版式二：杂志封面
│   ├── components/
│   │   ├── UploadZone.tsx          # 拖拽/点击上传照片
│   │   ├── FilterPicker.tsx        # 滤镜选择器
│   │   ├── TemplatePicker.tsx      # 版式选择器
│   │   ├── LanguagePicker.tsx      # 色名中英切换
│   │   ├── CardPreview.tsx         # 渲染 canvas 预览
│   │   └── ExportButton.tsx        # 导出 PNG 按钮
│   └── types.ts                    # 全局共享类型：PhotoMeta、RGB 等
└── tests/
    └── setup.ts                    # Vitest + jsdom 环境配置
```

---

## Task 1: 项目脚手架

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `tests/setup.ts`

- [ ] **Step 1: 初始化 Vite + React + TypeScript 项目**

Run:
```bash
npm create vite@latest . -- --template react-ts
```

当提示目录非空时选择继续（当前目录已有 `docs/`，Vite 只会添加自己的文件，不会覆盖）。

- [ ] **Step 2: 安装依赖**

```bash
npm install color-thief-browser exifr
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: 配置 Vitest**

编辑 `vite.config.ts`：

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
})
```

创建 `tests/setup.ts`：

```typescript
import '@testing-library/jest-dom'
```

在 `package.json` 的 `scripts` 中加入：

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 验证脚手架跑通**

Run: `npm run dev`
Expected: 终端输出本地开发服务器地址（如 `http://localhost:5173/`），无报错。

按 Ctrl+C 停止开发服务器。

Run: `npm run test`
Expected: `No test files found` 或类似提示（此时还没有测试文件，属正常现象）。

- [ ] **Step 5: 提交**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.node.json index.html src/ tests/ .gitignore
git commit -m "chore: scaffold Vite + React + TypeScript project with Vitest"
```

---

## Task 2: 取色引擎

**Files:**
- Create: `src/lib/colorExtraction.ts`
- Test: `src/lib/colorExtraction.test.ts`

- [ ] **Step 1: 写失败测试**

`src/lib/colorExtraction.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { extractPalette } from './colorExtraction'

function createSolidColorCanvas(r: number, g: number, b: number, size = 50): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(0, 0, size, size)
  return canvas
}

describe('extractPalette', () => {
  it('extracts a dominant color close to the solid fill color', async () => {
    const canvas = createSolidColorCanvas(200, 50, 50)
    const palette = await extractPalette(canvas, 5)

    expect(palette.length).toBeGreaterThan(0)
    const [r, g, b] = palette[0]
    // 允许量化误差
    expect(r).toBeGreaterThan(150)
    expect(g).toBeLessThan(100)
    expect(b).toBeLessThan(100)
  })

  it('returns the requested number of colors at most', async () => {
    const canvas = createSolidColorCanvas(10, 20, 30)
    const palette = await extractPalette(canvas, 3)
    expect(palette.length).toBeLessThanOrEqual(3)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- colorExtraction`
Expected: FAIL，报错 `Cannot find module './colorExtraction'` 或 `extractPalette is not a function`

- [ ] **Step 3: 实现取色引擎**

`src/lib/colorExtraction.ts`:

```typescript
import ColorThief from 'color-thief-browser'

export type RGB = [number, number, number]

const colorThief = new ColorThief()

/**
 * 从图像元素（canvas/img）提取主色调列表，按占比排序。
 */
export async function extractPalette(
  source: HTMLCanvasElement | HTMLImageElement,
  colorCount = 6
): Promise<RGB[]> {
  if (source instanceof HTMLImageElement && !source.complete) {
    await new Promise<void>((resolve, reject) => {
      source.addEventListener('load', () => resolve(), { once: true })
      source.addEventListener('error', () => reject(new Error('image failed to load')), { once: true })
    })
  }

  const palette = colorThief.getPalette(source, colorCount)
  return palette as RGB[]
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- colorExtraction`
Expected: PASS，2 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/lib/colorExtraction.ts src/lib/colorExtraction.test.ts
git commit -m "feat: add color extraction engine using color-thief-browser"
```

---

## Task 3: 中文色名匹配

**Files:**
- Create: `src/lib/colorNames.ts`
- Test: `src/lib/colorNames.test.ts`

- [ ] **Step 1: 写失败测试**

`src/lib/colorNames.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { nearestColorName } from './colorNames'

describe('nearestColorName', () => {
  it('matches a pure red to a red-family Chinese name', () => {
    const result = nearestColorName([230, 30, 30])
    expect(result.zh).toBeTruthy()
    expect(result.en).toBeTruthy()
  })

  it('matches a pure blue to a blue-family Chinese name', () => {
    const result = nearestColorName([20, 40, 200])
    expect(result.zh).toBeTruthy()
  })

  it('returns the same name for identical colors', () => {
    const a = nearestColorName([100, 150, 200])
    const b = nearestColorName([100, 150, 200])
    expect(a.zh).toBe(b.zh)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- colorNames`
Expected: FAIL，`Cannot find module './colorNames'`

- [ ] **Step 3: 实现色名匹配**

`src/lib/colorNames.ts`:

```typescript
import type { RGB } from './colorExtraction'

export interface ColorName {
  zh: string
  en: string
  rgb: RGB
}

// 中国传统色 + 常用色名参考表（节选，可持续扩充）
const COLOR_TABLE: ColorName[] = [
  { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] },
  { zh: '朱砂', en: 'Cinnabar', rgb: [200, 40, 30] },
  { zh: '橘橙', en: 'Tangerine', rgb: [235, 130, 40] },
  { zh: '姜黄', en: 'Turmeric', rgb: [220, 170, 30] },
  { zh: '橄榄', en: 'Olive', rgb: [110, 120, 50] },
  { zh: '竹青', en: 'Bamboo Green', rgb: [90, 150, 90] },
  { zh: '青碧', en: 'Cyan Jade', rgb: [40, 160, 160] },
  { zh: '群青', en: 'Ultramarine', rgb: [30, 60, 200] },
  { zh: '藏青', en: 'Navy', rgb: [20, 30, 90] },
  { zh: '藕荷', en: 'Lotus Mauve', rgb: [180, 140, 180] },
  { zh: '黛紫', en: 'Dusk Violet', rgb: [90, 50, 110] },
  { zh: '象牙白', en: 'Ivory', rgb: [240, 235, 220] },
  { zh: '墨灰', en: 'Ink Grey', rgb: [70, 70, 75] },
  { zh: '玄黑', en: 'Deep Black', rgb: [20, 20, 25] },
]

function distanceSquared(a: RGB, b: RGB): number {
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return dr * dr + dg * dg + db * db
}

/**
 * 在参考色表中找到与输入 RGB 欧氏距离最近的色名。
 */
export function nearestColorName(rgb: RGB): ColorName {
  let best = COLOR_TABLE[0]
  let bestDist = distanceSquared(rgb, best.rgb)

  for (const candidate of COLOR_TABLE.slice(1)) {
    const dist = distanceSquared(rgb, candidate.rgb)
    if (dist < bestDist) {
      best = candidate
      bestDist = dist
    }
  }

  return best
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- colorNames`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/lib/colorNames.ts src/lib/colorNames.test.ts
git commit -m "feat: add Chinese color name matching by nearest RGB distance"
```

---

## Task 4: WCAG 对比度取字色

**Files:**
- Create: `src/lib/contrastColor.ts`
- Test: `src/lib/contrastColor.test.ts`

- [ ] **Step 1: 写失败测试**

`src/lib/contrastColor.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { pickReadableTextColor } from './contrastColor'

describe('pickReadableTextColor', () => {
  it('picks white text on a dark background', () => {
    expect(pickReadableTextColor([20, 20, 30])).toBe('#ffffff')
  })

  it('picks black text on a light background', () => {
    expect(pickReadableTextColor([245, 240, 230])).toBe('#000000')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- contrastColor`
Expected: FAIL，`Cannot find module './contrastColor'`

- [ ] **Step 3: 实现对比度计算**

`src/lib/contrastColor.ts`:

```typescript
import type { RGB } from './colorExtraction'

function relativeLuminance([r, g, b]: RGB): number {
  const toLinear = (channel: number) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const [rl, gl, bl] = [toLinear(r), toLinear(g), toLinear(b)]
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 根据 WCAG 相对亮度公式，选出与背景色对比度最高的文字色（黑或白）。
 */
export function pickReadableTextColor(background: RGB): '#ffffff' | '#000000' {
  const bgLuminance = relativeLuminance(background)
  const whiteContrast = contrastRatio(bgLuminance, 1.0)
  const blackContrast = contrastRatio(bgLuminance, 0.0)
  return whiteContrast >= blackContrast ? '#ffffff' : '#000000'
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- contrastColor`
Expected: PASS，2 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/lib/contrastColor.ts src/lib/contrastColor.test.ts
git commit -m "feat: add WCAG contrast-based text color picker"
```

---

## Task 5: EXIF 解析（GPS + 拍摄时间）

**Files:**
- Create: `src/lib/exifParser.ts`
- Test: `src/lib/exifParser.test.ts`

- [ ] **Step 1: 写失败测试**

`src/lib/exifParser.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { parsePhotoMeta } from './exifParser'
import * as exifr from 'exifr'

vi.mock('exifr', () => ({
  parse: vi.fn(),
}))

describe('parsePhotoMeta', () => {
  it('returns GPS coordinates and capture time when present', async () => {
    vi.mocked(exifr.parse).mockResolvedValue({
      latitude: 35.0116,
      longitude: 135.7681,
      DateTimeOriginal: new Date('2026-04-10T09:30:00'),
    })

    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })
    const meta = await parsePhotoMeta(file)

    expect(meta.gps).toEqual({ lat: 35.0116, lon: 135.7681 })
    expect(meta.capturedAt).toEqual(new Date('2026-04-10T09:30:00'))
  })

  it('returns null gps and capturedAt when EXIF has no data', async () => {
    vi.mocked(exifr.parse).mockResolvedValue(undefined)

    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })
    const meta = await parsePhotoMeta(file)

    expect(meta.gps).toBeNull()
    expect(meta.capturedAt).toBeNull()
  })

  it('returns null values when exifr throws', async () => {
    vi.mocked(exifr.parse).mockRejectedValue(new Error('parse failed'))

    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })
    const meta = await parsePhotoMeta(file)

    expect(meta.gps).toBeNull()
    expect(meta.capturedAt).toBeNull()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- exifParser`
Expected: FAIL，`Cannot find module './exifParser'`

- [ ] **Step 3: 实现 EXIF 解析**

`src/lib/exifParser.ts`:

```typescript
import * as exifr from 'exifr'

export interface PhotoMeta {
  gps: { lat: number; lon: number } | null
  capturedAt: Date | null
}

/**
 * 解析照片文件的 GPS 坐标与拍摄时间。exifr 原生支持 JPEG/HEIC。
 * 解析失败或字段缺失时返回 null，不抛异常，交给调用方决定兜底策略。
 */
export async function parsePhotoMeta(file: File): Promise<PhotoMeta> {
  try {
    const data = await exifr.parse(file, { gps: true, pick: ['DateTimeOriginal', 'latitude', 'longitude'] })

    if (!data) {
      return { gps: null, capturedAt: null }
    }

    const gps =
      typeof data.latitude === 'number' && typeof data.longitude === 'number'
        ? { lat: data.latitude, lon: data.longitude }
        : null

    const capturedAt = data.DateTimeOriginal instanceof Date ? data.DateTimeOriginal : null

    return { gps, capturedAt }
  } catch {
    return { gps: null, capturedAt: null }
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- exifParser`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/lib/exifParser.ts src/lib/exifParser.test.ts
git commit -m "feat: add EXIF GPS and capture time parsing via exifr"
```

---

## Task 6: 地点识别（GPS 反查地名，带降级）

**Files:**
- Create: `src/lib/geocoding.ts`
- Test: `src/lib/geocoding.test.ts`

- [ ] **Step 1: 写失败测试**

`src/lib/geocoding.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveLocationName } from './geocoding'

describe('resolveLocationName', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns a place name when the geocoding API succeeds', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        address: { city: 'Kyoto', country: 'Japan' },
      }),
    } as Response)

    const name = await resolveLocationName({ lat: 35.0116, lon: 135.7681 })
    expect(name).toBe('Kyoto, Japan')
  })

  it('falls back to coordinate text when the API call fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network error'))

    const name = await resolveLocationName({ lat: 35.0116, lon: 135.7681 })
    expect(name).toBe('35.0116, 135.7681')
  })

  it('falls back to coordinate text when the API returns a non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)

    const name = await resolveLocationName({ lat: 1.5, lon: 2.5 })
    expect(name).toBe('1.5000, 2.5000')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- geocoding`
Expected: FAIL，`Cannot find module './geocoding'`

- [ ] **Step 3: 实现地点识别**

`src/lib/geocoding.ts`:

```typescript
export interface Coordinates {
  lat: number
  lon: number
}

function formatCoordinateFallback({ lat, lon }: Coordinates): string {
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
}

/**
 * 用 Nominatim（OpenStreetMap 免费逆地理编码服务）把坐标转换为地名。
 * 网络失败或响应异常时，降级返回格式化的经纬度文本，不抛异常。
 */
export async function resolveLocationName(coords: Coordinates): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}&format=json`

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return formatCoordinateFallback(coords)
    }

    const data = await response.json()
    const city = data.address?.city ?? data.address?.town ?? data.address?.village
    const country = data.address?.country

    if (city && country) {
      return `${city}, ${country}`
    }
    if (country) {
      return country
    }

    return formatCoordinateFallback(coords)
  } catch {
    return formatCoordinateFallback(coords)
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- geocoding`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/lib/geocoding.ts src/lib/geocoding.test.ts
git commit -m "feat: add reverse geocoding via Nominatim with coordinate fallback"
```

---

## Task 7: 滤镜引擎

**Files:**
- Create: `src/lib/filters.ts`
- Test: `src/lib/filters.test.ts`

- [ ] **Step 1: 写失败测试**

`src/lib/filters.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { applyFilter, FILTERS } from './filters'

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
    // 暖色滤镜应提升红色通道、压低蓝色通道
    expect(pixel[0]).toBeGreaterThan(100)
    expect(pixel[2]).toBeLessThan(100)
  })

  it('exposes all filter names in FILTERS', () => {
    expect(FILTERS).toContain('none')
    expect(FILTERS).toContain('warmFilm')
    expect(FILTERS.length).toBeGreaterThanOrEqual(2)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- filters`
Expected: FAIL，`Cannot find module './filters'`

- [ ] **Step 3: 实现滤镜引擎**

`src/lib/filters.ts`:

```typescript
export const FILTERS = ['none', 'warmFilm', 'coolFilm', 'vintagePositive'] as const
export type FilterName = (typeof FILTERS)[number]

type ChannelTransform = (r: number, g: number, b: number) => [number, number, number]

const clamp = (value: number) => Math.max(0, Math.min(255, value))

const TRANSFORMS: Record<FilterName, ChannelTransform> = {
  none: (r, g, b) => [r, g, b],
  // 暖调胶片：提升红色，压低蓝色，模拟暖色调相机发色
  warmFilm: (r, g, b) => [clamp(r * 1.15 + 10), clamp(g * 1.03), clamp(b * 0.85)],
  // 冷调胶片：提升蓝色，压低红色
  coolFilm: (r, g, b) => [clamp(r * 0.9), clamp(g * 1.02), clamp(b * 1.15 + 8)],
  // 复古正片：整体降低对比度并轻微偏黄绿
  vintagePositive: (r, g, b) => [clamp(r * 0.95 + 15), clamp(g * 0.97 + 10), clamp(b * 0.85)],
}

/**
 * 原地修改 canvas 的像素数据，应用指定滤镜的颜色变换。
 */
export function applyFilter(canvas: HTMLCanvasElement, filter: FilterName): void {
  const ctx = canvas.getContext('2d')!
  const transform = TRANSFORMS[filter]
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = imageData

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = transform(data[i], data[i + 1], data[i + 2])
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }

  ctx.putImageData(imageData, 0, 0)
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- filters`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/lib/filters.ts src/lib/filters.test.ts
git commit -m "feat: add canvas-based color filter engine with 4 presets"
```

---

## Task 8: 版式类型定义 + 经典色带版式

**Files:**
- Create: `src/templates/types.ts`
- Create: `src/templates/classicStrip.ts`
- Test: `src/templates/classicStrip.test.ts`

- [ ] **Step 1: 定义共享类型**

`src/templates/types.ts`:

```typescript
import type { RGB } from '../lib/colorExtraction'
import type { ColorName } from '../lib/colorNames'

export interface PaletteEntry {
  rgb: RGB
  hex: string
  name: ColorName
  textColor: '#ffffff' | '#000000'
}

export type ColorNameLanguage = 'zh' | 'en'

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

export type TemplateRenderer = (ctx: CanvasRenderingContext2D, config: CardConfig) => void
```

- [ ] **Step 2: 写失败测试**

`src/templates/classicStrip.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { renderClassicStrip } from './classicStrip'
import type { CardConfig } from './types'

function makeConfig(): CardConfig {
  const photo = new Image(200, 200)
  return {
    photo,
    palette: [
      { rgb: [230, 60, 80], hex: '#e63c50', name: { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] }, textColor: '#ffffff' },
      { rgb: [40, 160, 160], hex: '#28a0a0', name: { zh: '青碧', en: 'Cyan Jade', rgb: [40, 160, 160] }, textColor: '#ffffff' },
    ],
    locationName: 'Kyoto, Japan',
    capturedAtText: '2026-04-10',
    titleFont: 'serif',
    width: 800,
    height: 1000,
    colorNameLanguage: 'zh',
  }
}

describe('renderClassicStrip', () => {
  it('draws without throwing and fills the canvas background', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!

    expect(() => renderClassicStrip(ctx, makeConfig())).not.toThrow()

    const pixel = ctx.getImageData(10, 10, 1, 1).data
    // 背景不应保持透明/全零
    expect(pixel[3]).toBeGreaterThan(0)
  })

  it('does not throw when colorNameLanguage is "en"', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!
    const config = { ...makeConfig(), colorNameLanguage: 'en' as const }

    expect(() => renderClassicStrip(ctx, config)).not.toThrow()
  })
})
```

- [ ] **Step 3: 运行测试确认失败**

Run: `npm run test -- classicStrip`
Expected: FAIL，`Cannot find module './classicStrip'`

- [ ] **Step 4: 实现经典色带版式**

`src/templates/classicStrip.ts`:

```typescript
import type { TemplateRenderer } from './types'

/**
 * 经典色带版式：照片占上半部分，下半部分是等分色块条，
 * 每块标注色名与 HEX 值，底部居中显示地点与时间。
 */
export const renderClassicStrip: TemplateRenderer = (ctx, config) => {
  const { photo, palette, locationName, capturedAtText, width, height } = config

  ctx.fillStyle = '#faf7f2'
  ctx.fillRect(0, 0, width, height)

  const photoHeight = height * 0.6
  ctx.drawImage(photo, 0, 0, width, photoHeight)

  const stripTop = photoHeight
  const stripHeight = height * 0.3
  const swatchWidth = width / palette.length

  palette.forEach((entry, index) => {
    const x = index * swatchWidth
    ctx.fillStyle = entry.hex
    ctx.fillRect(x, stripTop, swatchWidth, stripHeight)

    ctx.fillStyle = entry.textColor
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    const displayName = config.colorNameLanguage === 'en' ? entry.name.en : entry.name.zh
    ctx.fillText(displayName, x + swatchWidth / 2, stripTop + stripHeight - 30)
    ctx.font = '12px monospace'
    ctx.fillText(entry.hex.toUpperCase(), x + swatchWidth / 2, stripTop + stripHeight - 12)
  })

  ctx.fillStyle = '#333333'
  ctx.font = `18px ${config.titleFont}`
  ctx.textAlign = 'center'
  ctx.fillText(`${locationName}  ·  ${capturedAtText}`, width / 2, height - 20)
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npm run test -- classicStrip`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add src/templates/types.ts src/templates/classicStrip.ts src/templates/classicStrip.test.ts
git commit -m "feat: add card config types and classic color-strip template"
```

---

## Task 9: 杂志封面版式

**Files:**
- Create: `src/templates/magazineCover.ts`
- Test: `src/templates/magazineCover.test.ts`

- [ ] **Step 1: 写失败测试**

`src/templates/magazineCover.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { renderMagazineCover } from './magazineCover'
import type { CardConfig } from './types'

function makeConfig(): CardConfig {
  const photo = new Image(200, 200)
  return {
    photo,
    palette: [
      { rgb: [230, 60, 80], hex: '#e63c50', name: { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] }, textColor: '#ffffff' },
      { rgb: [40, 160, 160], hex: '#28a0a0', name: { zh: '青碧', en: 'Cyan Jade', rgb: [40, 160, 160] }, textColor: '#ffffff' },
      { rgb: [220, 170, 30], hex: '#dcaa1e', name: { zh: '姜黄', en: 'Turmeric', rgb: [220, 170, 30] }, textColor: '#000000' },
    ],
    locationName: 'Kyoto, Japan',
    capturedAtText: '2026-04-10',
    titleFont: 'serif',
    width: 800,
    height: 1000,
    colorNameLanguage: 'zh',
  }
}

describe('renderMagazineCover', () => {
  it('draws without throwing and covers the full canvas with the photo', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!

    expect(() => renderMagazineCover(ctx, makeConfig())).not.toThrow()

    const pixel = ctx.getImageData(400, 500, 1, 1).data
    expect(pixel[3]).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- magazineCover`
Expected: FAIL，`Cannot find module './magazineCover'`

- [ ] **Step 3: 实现杂志封面版式**

`src/templates/magazineCover.ts`:

```typescript
import type { TemplateRenderer } from './types'

/**
 * 杂志封面版式：照片铺满全画布，顶部大标题（地点名），
 * 底部一条小色卡角标，模拟杂志封面排版感。
 */
export const renderMagazineCover: TemplateRenderer = (ctx, config) => {
  const { photo, palette, locationName, capturedAtText, width, height } = config

  ctx.drawImage(photo, 0, 0, width, height)

  // 顶部渐变遮罩，保证标题可读
  const topGradient = ctx.createLinearGradient(0, 0, 0, height * 0.25)
  topGradient.addColorStop(0, 'rgba(0,0,0,0.55)')
  topGradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = topGradient
  ctx.fillRect(0, 0, width, height * 0.25)

  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 48px ${config.titleFont}`
  ctx.textAlign = 'left'
  ctx.fillText(locationName.toUpperCase(), 32, 70)

  ctx.font = '16px sans-serif'
  ctx.fillText(capturedAtText, 32, 100)

  // 底部色卡角标
  const swatchSize = 36
  const swatchGap = 8
  const totalWidth = palette.length * swatchSize + (palette.length - 1) * swatchGap
  const startX = width - totalWidth - 24
  const swatchY = height - swatchSize - 24

  palette.forEach((entry, index) => {
    const x = startX + index * (swatchSize + swatchGap)
    ctx.fillStyle = entry.hex
    ctx.fillRect(x, swatchY, swatchSize, swatchSize)
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'
    ctx.strokeRect(x, swatchY, swatchSize, swatchSize)
  })
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- magazineCover`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/templates/magazineCover.ts src/templates/magazineCover.test.ts
git commit -m "feat: add magazine cover template"
```

---

## Task 10: 卡片渲染器（组装 CardConfig 并导出 PNG）

**Files:**
- Create: `src/lib/cardRenderer.ts`
- Test: `src/lib/cardRenderer.test.ts`

- [ ] **Step 1: 写失败测试**

`src/lib/cardRenderer.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { renderCardToCanvas, exportCanvasToBlob } from './cardRenderer'
import type { CardConfig } from '../templates/types'
import { renderClassicStrip } from '../templates/classicStrip'

function makeConfig(): CardConfig {
  const photo = new Image(200, 200)
  return {
    photo,
    palette: [
      { rgb: [230, 60, 80], hex: '#e63c50', name: { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] }, textColor: '#ffffff' },
    ],
    locationName: 'Kyoto, Japan',
    capturedAtText: '2026-04-10',
    titleFont: 'serif',
    width: 400,
    height: 500,
    colorNameLanguage: 'zh',
  }
}

describe('renderCardToCanvas', () => {
  it('returns a canvas sized to the config dimensions', () => {
    const canvas = renderCardToCanvas(makeConfig(), renderClassicStrip)
    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(500)
  })
})

describe('exportCanvasToBlob', () => {
  it('resolves with a PNG blob', async () => {
    const canvas = renderCardToCanvas(makeConfig(), renderClassicStrip)
    const blob = await exportCanvasToBlob(canvas)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/png')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- cardRenderer`
Expected: FAIL，`Cannot find module './cardRenderer'`

- [ ] **Step 3: 实现卡片渲染器**

`src/lib/cardRenderer.ts`:

```typescript
import type { CardConfig, TemplateRenderer } from '../templates/types'

/**
 * 用指定的版式渲染函数把 CardConfig 画进一个新建的 canvas。
 */
export function renderCardToCanvas(config: CardConfig, renderer: TemplateRenderer): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = config.width
  canvas.height = config.height
  const ctx = canvas.getContext('2d')!
  renderer(ctx, config)
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

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- cardRenderer`
Expected: PASS，2 个测试全部通过

- [ ] **Step 5: 运行全部单元测试确认无回归**

Run: `npm run test`
Expected: 所有测试文件全部 PASS

- [ ] **Step 6: 提交**

```bash
git add src/lib/cardRenderer.ts src/lib/cardRenderer.test.ts
git commit -m "feat: add card renderer that composes template output to canvas/PNG"
```

---

## Task 11: 全局类型与照片处理管线整合

**Files:**
- Create: `src/types.ts`
- Create: `src/lib/photoPipeline.ts`
- Test: `src/lib/photoPipeline.test.ts`

- [ ] **Step 1: 定义全局共享类型**

`src/types.ts`:

```typescript
export type { RGB } from './lib/colorExtraction'
export type { PhotoMeta } from './lib/exifParser'
export type { CardConfig, PaletteEntry, TemplateRenderer } from '../templates/types'
```

- [ ] **Step 2: 写失败测试**

`src/lib/photoPipeline.test.ts`:

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

- [ ] **Step 3: 运行测试确认失败**

Run: `npm run test -- photoPipeline`
Expected: FAIL，`Cannot find module './photoPipeline'`

- [ ] **Step 4: 实现照片处理管线**

`src/lib/photoPipeline.ts`:

```typescript
import { extractPalette, type RGB } from './colorExtraction'
import { nearestColorName } from './colorNames'
import { pickReadableTextColor } from './contrastColor'
import { parsePhotoMeta } from './exifParser'
import { resolveLocationName } from './geocoding'
import type { CardConfig, ColorNameLanguage, PaletteEntry } from '../templates/types'

function rgbToHex([r, g, b]: RGB): string {
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

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
 * 整条处理管线：文件 → EXIF/GPS/取色 → 组装成可直接传给版式渲染器的 CardConfig。
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

  const palette: PaletteEntry[] = rawPalette.map((rgb) => ({
    rgb,
    hex: rgbToHex(rgb),
    name: nearestColorName(rgb),
    textColor: pickReadableTextColor(rgb),
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

- [ ] **Step 5: 运行测试确认通过**

Run: `npm run test -- photoPipeline`
Expected: PASS，2 个测试全部通过

- [ ] **Step 6: 提交**

```bash
git add src/types.ts src/lib/photoPipeline.ts src/lib/photoPipeline.test.ts
git commit -m "feat: add photo processing pipeline that assembles CardConfig"
```

---

## Task 12: UploadZone 组件

**Files:**
- Create: `src/components/UploadZone.tsx`
- Test: `src/components/UploadZone.test.tsx`

- [ ] **Step 1: 写失败测试**

`src/components/UploadZone.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UploadZone } from './UploadZone'

describe('UploadZone', () => {
  it('calls onFileSelected when a file is chosen via the input', () => {
    const onFileSelected = vi.fn()
    render(<UploadZone onFileSelected={onFileSelected} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('upload-input') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    expect(onFileSelected).toHaveBeenCalledWith(file)
  })

  it('renders prompt text when no file is selected', () => {
    render(<UploadZone onFileSelected={vi.fn()} />)
    expect(screen.getByText(/上传一张照片/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- UploadZone`
Expected: FAIL，`Cannot find module './UploadZone'`

- [ ] **Step 3: 实现 UploadZone 组件**

`src/components/UploadZone.tsx`:

```tsx
interface UploadZoneProps {
  onFileSelected: (file: File) => void
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelected(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      onFileSelected(file)
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{ border: '2px dashed #ccc', padding: '2rem', textAlign: 'center' }}
    >
      <p>上传一张照片开始</p>
      <input data-testid="upload-input" type="file" accept="image/*" onChange={handleChange} />
    </div>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- UploadZone`
Expected: PASS，2 个测试全部通过

- [ ] **Step 5: 提交**

```bash
git add src/components/UploadZone.tsx src/components/UploadZone.test.tsx
git commit -m "feat: add photo upload zone component"
```

---

## Task 13: TemplatePicker、FilterPicker 与 LanguagePicker 组件

**Files:**
- Create: `src/components/TemplatePicker.tsx`
- Create: `src/components/FilterPicker.tsx`
- Create: `src/components/LanguagePicker.tsx`
- Test: `src/components/TemplatePicker.test.tsx`
- Test: `src/components/FilterPicker.test.tsx`
- Test: `src/components/LanguagePicker.test.tsx`

- [ ] **Step 1: 写失败测试（TemplatePicker）**

`src/components/TemplatePicker.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TemplatePicker, type TemplateId } from './TemplatePicker'

describe('TemplatePicker', () => {
  it('renders both template options', () => {
    render(<TemplatePicker selected="classicStrip" onSelect={vi.fn()} />)
    expect(screen.getByText('经典色带')).toBeInTheDocument()
    expect(screen.getByText('杂志封面')).toBeInTheDocument()
  })

  it('calls onSelect with the clicked template id', () => {
    const onSelect = vi.fn()
    render(<TemplatePicker selected="classicStrip" onSelect={onSelect} />)

    fireEvent.click(screen.getByText('杂志封面'))

    expect(onSelect).toHaveBeenCalledWith('magazineCover' as TemplateId)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- TemplatePicker`
Expected: FAIL，`Cannot find module './TemplatePicker'`

- [ ] **Step 3: 实现 TemplatePicker**

`src/components/TemplatePicker.tsx`:

```tsx
export type TemplateId = 'classicStrip' | 'magazineCover'

interface Option {
  id: TemplateId
  label: string
}

const OPTIONS: Option[] = [
  { id: 'classicStrip', label: '经典色带' },
  { id: 'magazineCover', label: '杂志封面' },
]

interface TemplatePickerProps {
  selected: TemplateId
  onSelect: (id: TemplateId) => void
}

export function TemplatePicker({ selected, onSelect }: TemplatePickerProps) {
  return (
    <div>
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          aria-pressed={selected === option.id}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: 运行测试确认通过（TemplatePicker）**

Run: `npm run test -- TemplatePicker`
Expected: PASS

- [ ] **Step 5: 写失败测试（FilterPicker）**

`src/components/FilterPicker.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterPicker } from './FilterPicker'

describe('FilterPicker', () => {
  it('renders an option for each filter', () => {
    render(<FilterPicker selected="none" onSelect={vi.fn()} />)
    expect(screen.getByText('无滤镜')).toBeInTheDocument()
    expect(screen.getByText('暖调胶片')).toBeInTheDocument()
    expect(screen.getByText('冷调胶片')).toBeInTheDocument()
    expect(screen.getByText('复古正片')).toBeInTheDocument()
  })

  it('calls onSelect with the clicked filter name', () => {
    const onSelect = vi.fn()
    render(<FilterPicker selected="none" onSelect={onSelect} />)

    fireEvent.click(screen.getByText('暖调胶片'))

    expect(onSelect).toHaveBeenCalledWith('warmFilm')
  })
})
```

- [ ] **Step 6: 运行测试确认失败**

Run: `npm run test -- FilterPicker`
Expected: FAIL，`Cannot find module './FilterPicker'`

- [ ] **Step 7: 实现 FilterPicker**

`src/components/FilterPicker.tsx`:

```tsx
import { FILTERS, type FilterName } from '../lib/filters'

const LABELS: Record<FilterName, string> = {
  none: '无滤镜',
  warmFilm: '暖调胶片',
  coolFilm: '冷调胶片',
  vintagePositive: '复古正片',
}

interface FilterPickerProps {
  selected: FilterName
  onSelect: (filter: FilterName) => void
}

export function FilterPicker({ selected, onSelect }: FilterPickerProps) {
  return (
    <div>
      {FILTERS.map((filter) => (
        <button key={filter} onClick={() => onSelect(filter)} aria-pressed={selected === filter}>
          {LABELS[filter]}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 8: 运行测试确认通过（FilterPicker）**

Run: `npm run test -- FilterPicker`
Expected: PASS

- [ ] **Step 9: 写失败测试（LanguagePicker）**

`src/components/LanguagePicker.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguagePicker } from './LanguagePicker'

describe('LanguagePicker', () => {
  it('renders both language options with Chinese selected by default', () => {
    render(<LanguagePicker selected="zh" onSelect={vi.fn()} />)
    const zhButton = screen.getByText('中文')
    const enButton = screen.getByText('English')
    expect(zhButton).toBeInTheDocument()
    expect(enButton).toBeInTheDocument()
    expect(zhButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onSelect with "en" when English is clicked', () => {
    const onSelect = vi.fn()
    render(<LanguagePicker selected="zh" onSelect={onSelect} />)

    fireEvent.click(screen.getByText('English'))

    expect(onSelect).toHaveBeenCalledWith('en')
  })
})
```

- [ ] **Step 10: 运行测试确认失败**

Run: `npm run test -- LanguagePicker`
Expected: FAIL，`Cannot find module './LanguagePicker'`

- [ ] **Step 11: 实现 LanguagePicker**

`src/components/LanguagePicker.tsx`:

```tsx
import type { ColorNameLanguage } from '../templates/types'

const LABELS: Record<ColorNameLanguage, string> = {
  zh: '中文',
  en: 'English',
}

interface LanguagePickerProps {
  selected: ColorNameLanguage
  onSelect: (language: ColorNameLanguage) => void
}

export function LanguagePicker({ selected, onSelect }: LanguagePickerProps) {
  return (
    <div>
      {(Object.keys(LABELS) as ColorNameLanguage[]).map((language) => (
        <button key={language} onClick={() => onSelect(language)} aria-pressed={selected === language}>
          {LABELS[language]}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 12: 运行测试确认通过（LanguagePicker）**

Run: `npm run test -- LanguagePicker`
Expected: PASS

- [ ] **Step 13: 提交**

```bash
git add src/components/TemplatePicker.tsx src/components/TemplatePicker.test.tsx src/components/FilterPicker.tsx src/components/FilterPicker.test.tsx src/components/LanguagePicker.tsx src/components/LanguagePicker.test.tsx
git commit -m "feat: add template, filter, and color-name language picker components"
```

---

## Task 14: CardPreview 与 ExportButton 组件

**Files:**
- Create: `src/components/CardPreview.tsx`
- Create: `src/components/ExportButton.tsx`
- Test: `src/components/CardPreview.test.tsx`
- Test: `src/components/ExportButton.test.tsx`

- [ ] **Step 1: 写失败测试（CardPreview）**

`src/components/CardPreview.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CardPreview } from './CardPreview'
import type { CardConfig } from '../templates/types'
import { renderClassicStrip } from '../templates/classicStrip'

function makeConfig(): CardConfig {
  const photo = new Image(200, 200)
  return {
    photo,
    palette: [
      { rgb: [230, 60, 80], hex: '#e63c50', name: { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] }, textColor: '#ffffff' },
    ],
    locationName: 'Kyoto, Japan',
    capturedAtText: '2026-04-10',
    titleFont: 'serif',
    width: 400,
    height: 500,
    colorNameLanguage: 'zh',
  }
}

describe('CardPreview', () => {
  it('renders a canvas element sized to the config', () => {
    const { container } = render(<CardPreview config={makeConfig()} renderer={renderClassicStrip} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas?.width).toBe(400)
    expect(canvas?.height).toBe(500)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- CardPreview`
Expected: FAIL，`Cannot find module './CardPreview'`

- [ ] **Step 3: 实现 CardPreview**

`src/components/CardPreview.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import type { CardConfig, TemplateRenderer } from '../templates/types'

interface CardPreviewProps {
  config: CardConfig
  renderer: TemplateRenderer
}

export function CardPreview({ config, renderer }: CardPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderer(ctx, config)
  }, [config, renderer])

  return <canvas ref={canvasRef} width={config.width} height={config.height} />
}
```

- [ ] **Step 4: 运行测试确认通过（CardPreview）**

Run: `npm run test -- CardPreview`
Expected: PASS

- [ ] **Step 5: 写失败测试（ExportButton）**

`src/components/ExportButton.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExportButton } from './ExportButton'

describe('ExportButton', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:mock'), revokeObjectURL: vi.fn() })
  })

  it('triggers canvas.toBlob when clicked', () => {
    const canvas = document.createElement('canvas')
    const toBlobSpy = vi.spyOn(canvas, 'toBlob').mockImplementation((cb) => {
      cb!(new Blob(['fake'], { type: 'image/png' }))
    })

    render(<ExportButton canvas={canvas} fileName="card.png" />)
    fireEvent.click(screen.getByText('导出图片'))

    expect(toBlobSpy).toHaveBeenCalled()
  })
})
```

- [ ] **Step 6: 运行测试确认失败**

Run: `npm run test -- ExportButton`
Expected: FAIL，`Cannot find module './ExportButton'`

- [ ] **Step 7: 实现 ExportButton**

`src/components/ExportButton.tsx`:

```tsx
import { exportCanvasToBlob } from '../lib/cardRenderer'

interface ExportButtonProps {
  canvas: HTMLCanvasElement | null
  fileName: string
}

export function ExportButton({ canvas, fileName }: ExportButtonProps) {
  const handleExport = async () => {
    if (!canvas) return
    const blob = await exportCanvasToBlob(canvas)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={handleExport} disabled={!canvas}>
      导出图片
    </button>
  )
}
```

- [ ] **Step 8: 运行测试确认通过（ExportButton）**

Run: `npm run test -- ExportButton`
Expected: PASS

- [ ] **Step 9: 提交**

```bash
git add src/components/CardPreview.tsx src/components/CardPreview.test.tsx src/components/ExportButton.tsx src/components/ExportButton.test.tsx
git commit -m "feat: add card preview canvas and PNG export button"
```

---

## Task 15: App 组件整合与手动验证

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 实现 App 组件，编排完整流程**

`src/App.tsx`:

```tsx
import { useCallback, useMemo, useRef, useState } from 'react'
import { UploadZone } from './components/UploadZone'
import { TemplatePicker, type TemplateId } from './components/TemplatePicker'
import { FilterPicker } from './components/FilterPicker'
import { LanguagePicker } from './components/LanguagePicker'
import { CardPreview } from './components/CardPreview'
import { ExportButton } from './components/ExportButton'
import { buildCardConfig } from './lib/photoPipeline'
import { applyFilter, type FilterName } from './lib/filters'
import { renderClassicStrip } from './templates/classicStrip'
import { renderMagazineCover } from './templates/magazineCover'
import type { CardConfig, ColorNameLanguage, TemplateRenderer } from './templates/types'

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

export default function App() {
  // baseConfig 保存取色/EXIF 等一次性处理结果，colorNameLanguage 独立成 state
  // 是因为切换语言只需要换文字、不需要重跑取色和 EXIF 解析。
  const [baseConfig, setBaseConfig] = useState<CardConfig | null>(null)
  const [template, setTemplate] = useState<TemplateId>('classicStrip')
  const [filter, setFilter] = useState<FilterName>('none')
  const [language, setLanguage] = useState<ColorNameLanguage>('zh')
  const [isProcessing, setIsProcessing] = useState(false)
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const config = useMemo(
    () => (baseConfig ? { ...baseConfig, colorNameLanguage: language } : null),
    [baseConfig, language]
  )

  const handleFileSelected = useCallback(async (file: File) => {
    setIsProcessing(true)
    try {
      const photo = await loadImage(file)

      const filterCanvas = document.createElement('canvas')
      filterCanvas.width = photo.naturalWidth
      filterCanvas.height = photo.naturalHeight
      const filterCtx = filterCanvas.getContext('2d')!
      filterCtx.drawImage(photo, 0, 0)
      applyFilter(filterCanvas, filter)

      const filteredPhoto = new Image()
      filteredPhoto.src = filterCanvas.toDataURL()
      await new Promise<void>((resolve) => {
        filteredPhoto.onload = () => resolve()
      })

      const cardConfig = await buildCardConfig(file, filteredPhoto, {
        width: 800,
        height: 1000,
        titleFont: 'Georgia, serif',
        colorNameLanguage: language,
      })
      setBaseConfig(cardConfig)
    } finally {
      setIsProcessing(false)
    }
  }, [filter, language])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h1>HueFrame</h1>
      <UploadZone onFileSelected={handleFileSelected} />

      {isProcessing && <p>处理中…</p>}

      {config && (
        <>
          <FilterPicker selected={filter} onSelect={setFilter} />
          <TemplatePicker selected={template} onSelect={setTemplate} />
          <LanguagePicker selected={language} onSelect={setLanguage} />
          <CardPreview config={config} renderer={RENDERERS[template]} />
          <ExportButton canvas={exportCanvasRef.current} fileName="hueframe-card.png" />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 启动开发服务器手动验证完整流程**

Run: `npm run dev`

在浏览器中打开输出的本地地址，手动执行：
1. 上传一张本地照片（建议用带 EXIF GPS 信息的手机拍摄照片，若没有则用任意 JPEG，验证"未知地点"兜底路径）
2. 确认预览区域出现色卡拼贴图，包含照片、色块、色名、地点/时间文字
3. 切换"暖调胶片"等滤镜，确认预览图片颜色随之变化
4. 切换"杂志封面"版式，确认排版切换
5. 切换语言为 English，确认色卡上的色名从中文（如"绯樱"）变为英文（如"Cherry Blush"），且切换过程不重新请求 EXIF/地理编码（网络面板中无新增请求）
6. 点击"导出图片"，确认浏览器下载了一个 PNG 文件，且打开后内容与预览一致

Expected: 全流程无控制台报错，导出的 PNG 可正常打开且内容正确。

- [ ] **Step 3: 运行完整测试套件确认无回归**

Run: `npm run test`
Expected: 所有测试文件全部 PASS

- [ ] **Step 4: 提交**

```bash
git add src/App.tsx
git commit -m "feat: wire up full photo-to-card pipeline in App component"
```

---

## 完成标准

- [ ] 全部 15 个任务的 checkbox 均已勾选
- [ ] `npm run test` 全部通过
- [ ] 手动验证：上传照片 → 预览色卡（2 套版式可切换、4 种滤镜可切换、中英色名可切换）→ 导出 PNG 成功
- [ ] 全部改动已通过独立 commit 提交，无遗留未提交文件（`git status` 为空）
