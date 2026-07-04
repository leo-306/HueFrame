export type UiLocale = 'zh' | 'en'

export interface Translations {
  topBar: {
    title: string
  }
  bottomNav: {
    home: string
    card: string
    grid: string
    crop: string
  }
  cardTabs: {
    filter: string
    layout: string
    palette: string
    info: string
  }
  emptyState: {
    heading: string
    supportedFormats: string
  }
  uploadZone: {
    prompt: string
  }
  multiUploadZone: {
    prompt: string
  }
  exportButton: {
    export: string
  }
  filterPicker: {
    none: string
    warmFilm: string
    coolFilm: string
    vintagePositive: string
  }
  templatePicker: {
    classicStrip: string
    magazineCover: string
  }
  marginSlider: {
    label: string
  }
  infoPanel: {
    location: string
    capturedAt: string
    watermark: string
  }
  homeTab: {
    heading: string
    subheading: string
    cardEyebrow: string
    cardTitle: string
    cardDescription: string
    cardAction: string
    gridEyebrow: string
    gridTitle: string
    gridDescription: string
    gridAction: string
    localTitle: string
    localDescription: string
    freshTitle: string
    freshDescription: string
    fastTitle: string
    fastDescription: string
  }
  gridTool: {
    split: string
    collage: string
  }
  gridSizePicker: {
    customRows: string
    customCols: string
    clampHint: string
  }
  gridPanel: {
    overflowHint: string
    export: string
    generateCard: string
  }
  common: {
    processing: string
    comingSoon: string
    unknownLocation: string
  }
}

export const zh: Translations = {
  topBar: {
    title: 'HueFrame',
  },
  bottomNav: {
    home: '首页',
    card: '卡片',
    grid: '宫格',
    crop: '裁剪',
  },
  cardTabs: {
    filter: '滤镜',
    layout: '版式',
    palette: '调色',
    info: '信息',
  },
  emptyState: {
    heading: '给照片，配一套颜色。',
    supportedFormats: '本地解析支持 JPG / PNG / WEBP',
  },
  uploadZone: {
    prompt: '上传一张照片开始',
  },
  multiUploadZone: {
    prompt: '上传多张照片开始',
  },
  exportButton: {
    export: '导出图片',
  },
  filterPicker: {
    none: '无滤镜',
    warmFilm: '暖调胶片',
    coolFilm: '冷调胶片',
    vintagePositive: '复古正片',
  },
  templatePicker: {
    classicStrip: '经典色带',
    magazineCover: '杂志封面',
  },
  marginSlider: {
    label: '留白 (Margin)',
  },
  infoPanel: {
    location: '地点',
    capturedAt: '时间',
    watermark: 'HueFrame 水印',
  },
  homeTab: {
    heading: '给照片，配一套颜色。',
    subheading: '极简的照片色卡与切分工具，让每一份视觉表达都拥有呼吸感。',
    cardEyebrow: 'Creative Tool',
    cardTitle: '色卡模式',
    cardDescription: '提取主色调，生成精致色卡，记录每一个瞬间的光影情绪。',
    cardAction: '进入工作流',
    gridEyebrow: 'Visual Layout',
    gridTitle: '切分模式',
    gridDescription: '九宫格切分，支持自定义间距，为社交平台打造平衡的视觉节奏。',
    gridAction: '开始排版',
    localTitle: '本地解析',
    localDescription: '照片仅在设备本地进行解析，无需上传服务器。我们尊重并保护您的每一份视觉隐私。',
    freshTitle: '极致清新',
    freshDescription: '遵循"留白"设计哲学，去除一切不必要的干扰。专注于色彩本身，享受纯粹的创作过程。',
    fastTitle: '快速导出',
    fastDescription: '优化导出算法，一键保存至系统相册。无论是色卡还是九宫格，瞬间即可分享您的灵感。',
  },
  gridTool: {
    split: '切分',
    collage: '拼图',
  },
  gridSizePicker: {
    customRows: '自定义行数',
    customCols: '自定义列数',
    clampHint: '已调整为 1-6 之间',
  },
  gridPanel: {
    overflowHint: '仅使用前 {count} 张',
    export: '导出图片',
    generateCard: '生成色卡',
  },
  common: {
    processing: '处理中…',
    comingSoon: '敬请期待',
    unknownLocation: '未知地点',
  },
}

export const en: Translations = {
  topBar: {
    title: 'HueFrame',
  },
  bottomNav: {
    home: 'Home',
    card: 'Card',
    grid: 'Grid',
    crop: 'Crop',
  },
  cardTabs: {
    filter: 'Filter',
    layout: 'Layout',
    palette: 'Palette',
    info: 'Info',
  },
  emptyState: {
    heading: 'A palette for your photo.',
    supportedFormats: 'Local parsing supports JPG / PNG / WEBP',
  },
  uploadZone: {
    prompt: 'Upload a photo to start',
  },
  multiUploadZone: {
    prompt: 'Upload multiple photos to start',
  },
  exportButton: {
    export: 'Export Image',
  },
  filterPicker: {
    none: 'None',
    warmFilm: 'Warm Film',
    coolFilm: 'Cool Film',
    vintagePositive: 'Vintage Positive',
  },
  templatePicker: {
    classicStrip: 'Classic Strip',
    magazineCover: 'Magazine Cover',
  },
  marginSlider: {
    label: 'Margin',
  },
  infoPanel: {
    location: 'Location',
    capturedAt: 'Time',
    watermark: 'HueFrame Watermark',
  },
  homeTab: {
    heading: 'A palette for your photo.',
    subheading: 'A minimalist palette and grid-splitting tool that gives every visual story room to breathe.',
    cardEyebrow: 'Creative Tool',
    cardTitle: 'Palette Mode',
    cardDescription: 'Extract dominant colors and generate a refined palette card that captures the mood of every moment.',
    cardAction: 'Enter Workflow',
    gridEyebrow: 'Visual Layout',
    gridTitle: 'Split Mode',
    gridDescription: 'Split into a grid with custom spacing to create a balanced visual rhythm for social platforms.',
    gridAction: 'Start Layout',
    localTitle: 'Local Processing',
    localDescription: 'Photos are processed entirely on your device, never uploaded to a server. We respect and protect your visual privacy.',
    freshTitle: 'Pure & Fresh',
    freshDescription: 'Following a "negative space" design philosophy, we remove every unnecessary distraction so you can focus on color and enjoy a pure creative process.',
    fastTitle: 'Fast Export',
    fastDescription: 'An optimized export pipeline saves straight to your photo library. Share your palette or grid the moment inspiration strikes.',
  },
  gridTool: {
    split: 'Split',
    collage: 'Collage',
  },
  gridSizePicker: {
    customRows: 'Custom Rows',
    customCols: 'Custom Cols',
    clampHint: 'Adjusted to between 1-6',
  },
  gridPanel: {
    overflowHint: 'Only using the first {count} photos',
    export: 'Export Image',
    generateCard: 'Generate Card',
  },
  common: {
    processing: 'Processing…',
    comingSoon: 'Coming soon',
    unknownLocation: 'Unknown Location',
  },
}

export const TRANSLATIONS: Record<UiLocale, Translations> = { zh, en }
