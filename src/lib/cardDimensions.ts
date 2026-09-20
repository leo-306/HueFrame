import type { TemplateId } from '../templates/types'

const CARD_WIDTH = 800
const CLASSIC_STRIP_HEIGHT_RATIO = 0.375
const CLASSIC_INFO_HEIGHT_RATIO = 0.125

/** 固定 800×1000 画布的版式（其余按照片比例推导高度）。 */
const FIXED_PORTRAIT_TEMPLATES: ReadonlySet<TemplateId> = new Set<TemplateId>([
  'editorialFrame',
  'polaroidJournal',
  'pantoneCard',
  'colorAnnotation',
  'designerSpec',
  'heroHex',
  'bandList',
  'colorSpectrum',
])

export function photoHeightForWidth(photoWidth: number, photoHeight: number, targetWidth: number): number {
  if (photoWidth <= 0 || photoHeight <= 0) return targetWidth
  return Math.round(targetWidth * (photoHeight / photoWidth))
}

export function dimensionsForTemplate(
  template: TemplateId,
  photoWidth: number,
  photoHeight: number,
  marginPx: number
): { width: number; height: number } {
  if (FIXED_PORTRAIT_TEMPLATES.has(template)) {
    return { width: CARD_WIDTH, height: 1000 }
  }
  if (template === 'colorArchive') {
    return { width: CARD_WIDTH, height: 896 }
  }

  const innerWidth = CARD_WIDTH - marginPx * 2
  const renderedPhotoHeight = photoHeightForWidth(photoWidth, photoHeight, innerWidth)
  const templateHeight =
    template === 'classicStrip'
      ? renderedPhotoHeight +
        Math.round(innerWidth * CLASSIC_STRIP_HEIGHT_RATIO) +
        Math.round(innerWidth * CLASSIC_INFO_HEIGHT_RATIO)
      : renderedPhotoHeight

  return {
    width: CARD_WIDTH,
    height: templateHeight + marginPx * 2,
  }
}
