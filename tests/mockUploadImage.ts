import { vi } from 'vitest'
import { Image as CanvasImage, createCanvas } from 'canvas'

/**
 * jsdom 的原生 Image 从不真正解码图片（onload 不触发，naturalWidth 恒为 0，
 * 见 tests/testImage.ts 里的说明）。组件内部若走"用户上传文件 -> new Image()
 * -> onload"这条真实交互路径（而不是像 createTestPhoto() 那样直接把现成图片
 * 当 prop 传入），测试就必须把全局 Image 替换成 node-canvas 的 Image 类——
 * 它能真正解码图片数据，drawImage 也能正确识别它（不像自定义包装类会被
 * node-canvas 拒绝）。src 被赋值为 blob: URL 时，忽略该值，改为加载一张预先
 * 准备好的假 PNG Buffer，因为 jsdom 环境本来就不支持
 * URL.createObjectURL/blob: 协议解码。
 *
 * `canvas`'s Image class 把 `src` 声明为普通 property（由原型上的原生
 * accessor 支持），所以 TS 不允许子类把它重写成 get/set 对。在构造函数里为
 * 每个实例单独定义 accessor 可以绕开这个静态检查，同时仍然委托给真正的
 * （按实例区分的）原生 accessor 做存储，并把每次赋值都重定向到假 buffer。
 * 每个 MockImage 实例互相独立，能正确处理并发多图加载（Promise.all）。
 */
const FAKE_IMAGE_BUFFER = createCanvas(4, 4).toBuffer('image/png')

const nativeSrcDescriptor = Object.getOwnPropertyDescriptor(CanvasImage.prototype, 'src')!

class MockImage extends CanvasImage {
  constructor() {
    super()
    Object.defineProperty(this, 'src', {
      get: () => nativeSrcDescriptor.get!.call(this),
      set: () => nativeSrcDescriptor.set!.call(this, FAKE_IMAGE_BUFFER),
    })
  }
}

/**
 * 在 beforeEach 里调用，把全局 Image/URL 替换成上传流程测试可用的假实现；
 * 返回的函数在 afterEach 里调用以还原全局状态。
 */
export function installMockUploadImage(): () => void {
  vi.stubGlobal('Image', MockImage)
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn().mockReturnValue('blob:mock'),
    revokeObjectURL: vi.fn(),
  })
  return () => vi.unstubAllGlobals()
}
