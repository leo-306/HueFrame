import type { TemplateId } from '../templates/types'

const CARD_WIDTH = 800
const CLASSIC_STRIP_HEIGHT_RATIO = 0.375
const CLASSIC_INFO_HEIGHT_RATIO = 0.125

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
