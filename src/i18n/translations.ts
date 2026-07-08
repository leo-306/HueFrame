export type UiLocale = 'zh' | 'en'

export interface Translations {
  topBar: {
    title: string
    back: string
    cardTool: string
    gridTool: string
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
    colorNameLanguage: string
    colorPercentage: string
    moveUp: string
    moveDown: string
    colorEditor: string
    reextractColors: string
    reextractingColors: string
    spacingAndWhitespace: string
    cardPadding: string
    swatchGap: string
    swatchRadius: string
    decrease: string
    increase: string
  }
  emptyState: {
    heading: string
    headingHighlight: string
    supportedFormats: string
    gridSplitHeading: string
    gridSplitHeadingHighlight: string
    gridCollageHeading: string
    gridCollageHeadingHighlight: string
  }
  uploadZone: {
    prompt: string
  }
  multiUploadZone: {
    prompt: string
  }
  exportButton: {
    export: string
    saveAlbum: string
  }
  filterPicker: {
    none: string
    warmFilm: string
    coolFilm: string
    vintagePositive: string
    monochrome: string
    softFade: string
    vivid: string
    tealOrange: string
  }
  templatePicker: {
    classicStrip: string
    magazineCover: string
    previousTemplate: string
    nextTemplate: string
    viewAllTemplates: string
    closeTemplatePicker: string
  }
  marginSlider: {
    label: string
  }
  layoutControls: {
    template: string
    aspectRatio: string
  }
  infoPanel: {
    location: string
    capturedAt: string
    watermark: string
    watermarkOpacity: string
  }
  homeTab: {
    heading: string
    headingHighlight: string
    subheading: string
    subheadingHighlight: string
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
    title: string
    advanced: string
    customRows: string
    customCols: string
    clampHint: string
  }
  gridPanel: {
    overflowHint: string
    export: string
    generateCard: string
    gapHorizontal: string
    gapVertical: string
    imagePadding: string
    randomRotate: string
    resetRotation: string
    cellRotation: string
    cellCoord: string
    rotationTip: string
    rotationHint: string
  }
  common: {
    processing: string
    imageLoadFailed: string
    comingSoon: string
    reupload: string
    unknownLocation: string
  }
}

export const zh: Translations = {
  topBar: {
    title: '映色格',
    back: '返回首页',
    cardTool: '色卡卡片',
    gridTool: '图片切分',
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
    colorNameLanguage: '色名语言',
    colorPercentage: '占比',
    moveUp: '上移',
    moveDown: '下移',
    colorEditor: '颜色编辑',
    reextractColors: '从图片重新提取',
    reextractingColors: '正在重新提取',
    spacingAndWhitespace: '间距与留白',
    cardPadding: '卡片内边距',
    swatchGap: '色块间距',
    swatchRadius: '色块圆角',
    decrease: '减少',
    increase: '增加',
  },
  emptyState: {
    heading: '给照片，配一套颜色',
    headingHighlight: '颜色',
    supportedFormats: '本地解析支持 JPG / PNG / WEBP / HEIF / HEIC',
    gridSplitHeading: '上传照片，切出节奏',
    gridSplitHeadingHighlight: '切出节奏',
    gridCollageHeading: '上传多张，拼出灵感',
    gridCollageHeadingHighlight: '拼出灵感',
  },
  uploadZone: {
    prompt: '上传一张照片开始',
  },
  multiUploadZone: {
    prompt: '上传多张照片开始',
  },
  exportButton: {
    export: '导出图片',
    saveAlbum: '保存到相册',
  },
  filterPicker: {
    none: '无滤镜',
    warmFilm: '暖调胶片',
    coolFilm: '冷调胶片',
    vintagePositive: '复古正片',
    monochrome: '黑白纪实',
    softFade: '柔雾',
    vivid: '鲜艳',
    tealOrange: '青橙电影',
  },
  templatePicker: {
    classicStrip: '经典色带',
    magazineCover: '杂志封面',
    previousTemplate: '上一个模板',
    nextTemplate: '下一个模板',
    viewAllTemplates: '查看全部模板',
    closeTemplatePicker: '关闭模板选择',
  },
  marginSlider: {
    label: '留白 (Margin)',
  },
  layoutControls: {
    template: '全部模板',
    aspectRatio: '比例 (Aspect Ratio)',
  },
  infoPanel: {
    location: '地点',
    capturedAt: '时间',
    watermark: 'HueFrame 水印',
    watermarkOpacity: '水印透明度',
  },
  homeTab: {
    heading: '给照片，配一套颜色',
    headingHighlight: '颜色',
    subheading: '极简的照片色卡与切分工具，让每一份视觉表达都拥有呼吸感',
    subheadingHighlight: '呼吸感',
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
    title: '宫格布局',
    advanced: '高级设置',
    customRows: '自定义行数',
    customCols: '自定义列数',
    clampHint: '已调整为 1-10 之间',
  },
  gridPanel: {
    overflowHint: '仅使用前 {count} 张',
    export: '导出图片',
    generateCard: '导入到色卡',
    gapHorizontal: '横向间距',
    gapVertical: '纵向间距',
    imagePadding: '图片留白',
    randomRotate: '随机旋转',
    resetRotation: '重置旋转',
    cellRotation: '旋转',
    cellCoord: '第{row}行第{col}列',
    rotationTip: '操作提示',
    rotationHint: '点击网格中的单元格，可单独调整其旋转角度',
  },
  common: {
    processing: '处理中…',
    imageLoadFailed: '图片解析失败，请确认文件有效或换一张图片重试。',
    comingSoon: '敬请期待',
    reupload: '重新上传',
    unknownLocation: '未知地点',
  },
}

export const en: Translations = {
  topBar: {
    title: 'HUEFRAME',
    back: 'Back to home',
    cardTool: 'Palette Card',
    gridTool: 'Image Split',
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
    colorNameLanguage: 'Color-name language',
    colorPercentage: 'Share',
    moveUp: 'Move up',
    moveDown: 'Move down',
    colorEditor: 'Color editing',
    reextractColors: 'Extract from image again',
    reextractingColors: 'Extracting colors',
    spacingAndWhitespace: 'Spacing and whitespace',
    cardPadding: 'Card padding',
    swatchGap: 'Swatch gap',
    swatchRadius: 'Swatch radius',
    decrease: 'Decrease ',
    increase: 'Increase ',
  },
  emptyState: {
    heading: 'A palette for your photo',
    headingHighlight: 'palette',
    supportedFormats: 'Local parsing supports JPG / PNG / WEBP / HEIF / HEIC',
    gridSplitHeading: 'Upload a photo to split',
    gridSplitHeadingHighlight: 'split',
    gridCollageHeading: 'Upload photos to collage',
    gridCollageHeadingHighlight: 'collage',
  },
  uploadZone: {
    prompt: 'Upload a photo to start',
  },
  multiUploadZone: {
    prompt: 'Upload multiple photos to start',
  },
  exportButton: {
    export: 'Export Image',
    saveAlbum: 'Save to Photos',
  },
  filterPicker: {
    none: 'None',
    warmFilm: 'Warm Film',
    coolFilm: 'Cool Film',
    vintagePositive: 'Vintage Positive',
    monochrome: 'Monochrome',
    softFade: 'Soft Fade',
    vivid: 'Vivid',
    tealOrange: 'Teal & Orange',
  },
  templatePicker: {
    classicStrip: 'Classic Strip',
    magazineCover: 'Magazine Cover',
    previousTemplate: 'Previous template',
    nextTemplate: 'Next template',
    viewAllTemplates: 'View all templates',
    closeTemplatePicker: 'Close template picker',
  },
  marginSlider: {
    label: 'Margin',
  },
  layoutControls: {
    template: 'All templates',
    aspectRatio: 'Aspect Ratio',
  },
  infoPanel: {
    location: 'Location',
    capturedAt: 'Time',
    watermark: 'HueFrame Watermark',
    watermarkOpacity: 'Watermark opacity',
  },
  homeTab: {
    heading: 'A palette for your photo',
    headingHighlight: 'palette',
    subheading: 'A minimalist palette and grid-splitting tool that gives every visual story room to breathe',
    subheadingHighlight: 'breathe',
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
    title: 'Grid Layout',
    advanced: 'Advanced',
    customRows: 'Custom Rows',
    customCols: 'Custom Cols',
    clampHint: 'Adjusted to between 1-10',
  },
  gridPanel: {
    overflowHint: 'Only using the first {count} photos',
    export: 'Export Image',
    generateCard: 'Open in Card Tab',
    gapHorizontal: 'Horizontal Gap',
    gapVertical: 'Vertical Gap',
    imagePadding: 'Image Padding',
    randomRotate: 'Random Rotate',
    resetRotation: 'Reset Rotation',
    cellRotation: 'Rotation',
    cellCoord: 'Row {row}, Col {col}',
    rotationTip: 'Tip',
    rotationHint: 'Click a cell in the grid to adjust its rotation angle',
  },
  common: {
    processing: 'Processing…',
    imageLoadFailed: 'Could not process this image. Check the file or try another image.',
    comingSoon: 'Coming soon',
    reupload: 'Replace',
    unknownLocation: 'Unknown Location',
  },
}

export const TRANSLATIONS: Record<UiLocale, Translations> = { zh, en }
