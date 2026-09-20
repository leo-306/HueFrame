/**
 * 卡片底部「地点·日期」一行的字体。
 *
 * 这里刻意不使用 LXGW WenKai 等中文 Web 字体：fontsource 提供的 lxgw-wenkai
 * "latin" 子集实际是整包（6.9MB），为一行小字让每个用户在首屏都下载 7MB 并不划算。
 * 系统楷体在视觉上同样接近（macOS/iOS 的 Kaiti SC、Windows 的 KaiTi），
 * 无楷体的平台退到 CJK serif，观感依然成立。
 */
export const CARD_INFO_FONT_FAMILY =
  '"Kaiti SC", "Kaiti TC", STKaiti, KaiTi, 楷体, "Noto Serif CJK SC", serif'

/** 供 document.fonts.load 使用，系统字体会立即 resolve，不会拖住首次渲染。 */
export const CARD_INFO_FONT_LOAD = `500 32px ${CARD_INFO_FONT_FAMILY}`
