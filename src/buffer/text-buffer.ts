/**
 * @file Text Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

// @ts-ignore: unused import Vector3, Matrix4 required for declaration only
import { Color, CanvasTexture, Vector3, Matrix4 } from 'three'

import '../shader/SDFFont.vert'
import '../shader/SDFFont.frag'

import { BufferRegistry } from '../globals'
import { createParams } from '../utils'
import MappedQuadBuffer from './mappedquad-buffer'
import { IgnorePicker } from '../utils/picker'
import { edt } from '../utils/edt'
import { BufferDefaultParameters, BufferParameterTypes, BufferData, BufferTypes } from './buffer'

const TextAtlasCache: { [k: string]: TextAtlas } = {}

function getTextAtlas (params: Partial<TextAtlasParams>) {
  const hash = JSON.stringify(params)
  if (TextAtlasCache[ hash ] === undefined) {
    TextAtlasCache[ hash ] = new TextAtlas(params)
  }
  return TextAtlasCache[ hash ]
}

type TextFonts = 'sans-serif'|'monospace'|'serif'
type TextStyles = 'normal'|'italic'
type TextVariants = 'normal'
type TextWeights = 'normal'|'bold'

export const TextAtlasDefaultParams = {
  font: 'sans-serif' as TextFonts,
  size: 36,
  style: 'normal' as TextStyles,
  variant: 'normal' as TextVariants,
  weight: 'normal' as TextWeights,
  outline: 3,
  width: 1024,
  height: 1024
}
export type TextAtlasParams = typeof TextAtlasDefaultParams

export type TextAtlasMap = { x: number, y: number, w: number, h: number }

export class TextAtlas {
  parameters: TextAtlasParams

  gamma = 1
  mapped: { [k: string]: TextAtlasMap } = {}
  scratchW = 0
  scratchH = 0
  currentX = 0
  currentY = 0

  cutoff = 0.25
  padding: number
  radius: number

  gridOuter: Float64Array
  gridInner: Float64Array
  f: Float64Array
  d: Float64Array
  z: Float64Array
  v: Int16Array

  paddedSize: number
  middle: number

  texture: CanvasTexture
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D

  lineHeight: number
  maxWidth: number
  colors: string[]
  scratch: Uint8Array
  canvas2: HTMLCanvasElement
  context2: CanvasRenderingContext2D
  data: Uint8Array

  placeholder: TextAtlasMap

  constructor (params: Partial<TextAtlasParams> = {}) {
    this.parameters = createParams(params, TextAtlasDefaultParams)
    const p = this.parameters

    this.radius = p.size / 8
    this.padding = p.size / 3

    // Prepare line-height with room for outline and descenders/ascenders
    const lineHeight = this.lineHeight = p.size + 2 * p.outline + Math.round(p.size / 4)
    const maxWidth = this.maxWidth = p.width / 4

    // Prepare scratch canvas
    const canvas = this.canvas = document.createElement('canvas')
    canvas.width = maxWidth
    canvas.height = lineHeight

    const ctx = this.context = this.canvas.getContext('2d')!
    ctx.font = `${p.style} ${p.variant} ${p.weight} ${p.size}px ${p.font}`
    ctx.fillStyle = 'black'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.lineJoin = 'round'

    // temporary arrays for the distance transform
    this.gridOuter = new Float64Array(lineHeight * maxWidth)
    this.gridInner = new Float64Array(lineHeight * maxWidth)
    this.f = new Float64Array(Math.max(lineHeight, maxWidth))
    this.d = new Float64Array(Math.max(lineHeight, maxWidth))
    this.z = new Float64Array(Math.max(lineHeight, maxWidth) + 1)
    this.v = new Int16Array(Math.max(lineHeight, maxWidth))

    //
    this.data = new Uint8Array(p.width * p.height * 4)
    this.canvas2 = document.createElement('canvas')
    this.canvas2.width = p.width
    this.canvas2.height = p.height
    this.context2 = this.canvas2.getContext('2d')!

    // Replacement Character
    this.placeholder = this.map(String.fromCharCode(0xFFFD))

    // Basic Latin (subset)
    for (let i = 0x0020; i <= 0x007E; ++i) {
      this.map(String.fromCharCode(i))
    }

    // TODO: to slow to always prepare them
    // // Latin-1 Supplement (subset)
    // for (let i = 0x00A1; i <= 0x00FF; ++i) {
    //   this.map(String.fromCharCode(i))
    // }

    // Degree sign
    this.map(String.fromCharCode(0x00B0))

    // // Greek and Coptic (subset)
    // for (let i = 0x0391; i <= 0x03C9; ++i) {
    //   this.map(String.fromCharCode(i))
    // }

    // // Cyrillic (subset)
    // for (let i = 0x0400; i <= 0x044F; ++i) {
    //   this.map(String.fromCharCode(i))
    // }

    // Angstrom Sign
    this.map(String.fromCharCode(0x212B))

    this.texture = new CanvasTexture(this.canvas2)
    this.texture.flipY = false
    this.texture.needsUpdate = true
  }

  map (text: string) {
    const p = this.parameters

    if (this.mapped[ text ] === undefined) {
      this.draw(text)

      if (this.currentX + this.scratchW > p.width) {
        this.currentX = 0
        this.currentY += this.scratchH
      }
      if (this.currentY + this.scratchH > p.height) {
        console.warn('canvas to small')
      }

      this.mapped[ text ] = {
        x: this.currentX,
        y: this.currentY,
        w: this.scratchW,
        h: this.scratchH
      }

      this.context2.drawImage(
        this.canvas,
        0, 0,
        this.scratchW, this.scratchH,
        this.currentX, this.currentY,
        this.scratchW, this.scratchH
      )

      this.currentX += this.scratchW
    }

    return this.mapped[ text ]
  }

  get (text: string) {
    return this.mapped[ text ] || this.placeholder
  }

  draw (text: string) {
    const p = this.parameters

    const h = this.lineHeight
    const o = p.outline
    const ctx = this.context
    // const dst = this.scratch
    const max = this.maxWidth
    // const colors = this.colors

    // Bottom aligned, take outline into account
    const x = o
    const y = h - p.outline

    // Measure text
    const m = ctx.measureText(text)
    const w = Math.min(max, Math.ceil(m.width + 2 * x + 1))

    const n = w * h

    // Clear scratch area
    ctx.clearRect(0, 0, w, h)

    // Draw text
    ctx.fillText(text, x, y)

    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data

    for (let i = 0; i < n; i++) {
        const a = imageData.data[i * 4 + 3] / 255; // alpha value
        this.gridOuter[i] = a === 1 ? 0 : a === 0 ? Number.MAX_SAFE_INTEGER : Math.pow(Math.max(0, 0.5 - a), 2);
        this.gridInner[i] = a === 1 ? Number.MAX_SAFE_INTEGER : a === 0 ? 0 : Math.pow(Math.max(0, a - 0.5), 2);
    }

    edt(this.gridOuter, w, h, this.f, this.d, this.v, this.z);
    edt(this.gridInner, w, h, this.f, this.d, this.v, this.z);

    for (let i = 0; i < n; i++) {
        const d = this.gridOuter[i] - this.gridInner[i];
        data[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(255 - 255 * (d / this.radius + this.cutoff))));
    }

    ctx.putImageData(imageData, 0, 0)
    this.scratchW = w
    this.scratchH = h
  }
}

/**
 * Text buffer parameter object.
 * @typedef {Object} TextBufferParameters - text buffer parameters
 *
 * @property {Float} opacity - translucency: 1 is fully opaque, 0 is fully transparent
 * @property {Integer} clipNear - position of camera near/front clipping plane
 *                                in percent of scene bounding box
 * @property {String} labelType - type of the label, one of:
 *                                 "atomname", "atomindex", "occupancy", "bfactor",
 *                                 "serial", "element", "atom", "resname", "resno",
 *                                 "res", "text", "qualified". When set to "text", the
 *                                 `labelText` list is used.
 * @property {String[]} labelText - list of label strings, must set `labelType` to "text"
 *                                   to take effect
 * @property {String} fontFamily - font family, one of: "sans-serif", "monospace", "serif"
 * @property {String} fontStyle - font style, "normal" or "italic"
 * @property {String} fontWeight - font weight, "normal" or "bold"
 * @property {Float} xOffset - offset in x-direction
 * @property {Float} yOffset - offset in y-direction
 * @property {Float} zOffset - offset in z-direction (i.e. in camera direction)
 * @property {String} attachment - attachment of the label, one of:
 *                                 "bottom-left", "bottom-center", "bottom-right",
 *                                 "middle-left", "middle-center", "middle-right",
 *                                 "top-left", "top-center", "top-right"
 * @property {Boolean} showBorder - show border/outline
 * @property {Color} borderColor - color of the border/outline
 * @property {Float} borderWidth - width of the border/outline
 * @property {Boolean} showBackground - show background rectangle
 * @property {Color} backgroundColor - color of the background
 * @property {Float} backgroundMargin - width of the background
 * @property {Float} backgroundOpacity - opacity of the background
 * @property {Boolean} fixedSize - show text with a fixed pixel size
 */

export interface TextBufferData extends BufferData {
  size: Float32Array
  text: string[]
}

type TextAttachments = 'bottom-left'|'bottom-center'|'bottom-right'|'middle-left'|'middle-center'|'middle-right'|'top-left'|'top-center'|'top-right'

export const TextBufferDefaultParameters = Object.assign({
  fontFamily: 'sans-serif' as TextFonts,
  fontStyle: 'normal' as TextStyles,
  fontWeight: 'bold' as TextWeights,
  fontSize: 36,
  xOffset: 0.0,
  yOffset: 0.0,
  zOffset: 0.5,
  attachment: 'bottom-left' as TextAttachments,
  showBorder: false,
  borderColor: 'lightgrey' as number|string,
  borderWidth: 0.15,
  showBackground: false,
  backgroundColor: 'lightgrey' as number|string,
  backgroundMargin: 0.5,
  backgroundOpacity: 1.0,
  forceTransparent: true,
  fixedSize: false
}, BufferDefaultParameters)
export type TextBufferParameters = typeof TextBufferDefaultParameters

const TextBufferParameterTypes = Object.assign({
  fontFamily: { uniform: true },
  fontStyle: { uniform: true },
  fontWeight: { uniform: true },
  fontSize: { uniform: true },
  xOffset: { uniform: true },
  yOffset: { uniform: true },
  zOffset: { uniform: true },
  showBorder: { uniform: true },
  borderColor: { uniform: true },
  borderWidth: { uniform: true },
  backgroundColor: { uniform: true },
  backgroundOpacity: { uniform: true },
  fixedSize: { updateShader: true }
}, BufferParameterTypes)

function getCharCount (data: TextBufferData, params: Partial<TextBufferParameters>) {
  const n = data.position!.length / 3
  let charCount = 0
  for (let i = 0; i < n; ++i) {
    charCount += data.text[ i ].length
  }
  if (params.showBackground) charCount += n

  return charCount
}

/**
 * Text buffer. Renders screen-aligned text strings.
 *
 * @example
 * var textBuffer = new TextBuffer({
 *   position: new Float32Array([ 0, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   size: new Float32Array([ 2 ]),
 *   text: [ "Hello" ]
 * });
 */
class TextBuffer extends MappedQuadBuffer {
  parameterTypes = TextBufferParameterTypes
  get defaultParameters() { return TextBufferDefaultParameters }
  parameters: TextBufferParameters

  alwaysTransparent = true
  hasWireframe = false
  isText = true
  vertexShader = 'SDFFont.vert'
  fragmentShader = 'SDFFont.frag'

  text: string[]
  positionCount: number
  texture: CanvasTexture
  textAtlas: TextAtlas

  /**
   * @param  {Object} data - attribute object
   * @param  {Float32Array} data.position - positions
   * @param  {Float32Array} data.color - colors
   * @param  {Float32Array} data.size - sizes
   * @param  {String[]} data.text - text strings
   * @param  {TextBufferParameters} params - parameters object
   */
  constructor (data: TextBufferData, params: Partial<TextBufferParameters> = {}) {
    super({
      position: new Float32Array(getCharCount(data, params) * 3),
      color: new Float32Array(getCharCount(data, params) * 3),
      picking: new IgnorePicker()
    }, params)

    this.text = data.text
    this.positionCount = data.position!.length / 3

    this.addUniforms({
      'fontTexture': { value: null },
      'xOffset': { value: this.parameters.xOffset },
      'yOffset': { value: this.parameters.yOffset },
      'zOffset': { value: this.parameters.zOffset },
      'ortho': { value: false },
      'showBorder': { value: this.parameters.showBorder },
      'borderColor': { value: new Color(this.parameters.borderColor as number) },
      'borderWidth': { value: this.parameters.borderWidth },
      'backgroundColor': { value: new Color(this.parameters.backgroundColor as number) },
      'backgroundOpacity': { value: this.parameters.backgroundOpacity },
      'canvasHeight': { value: 1.0 },
      'pixelRatio': { value: 1.0 }
    })

    this.addAttributes({
      'inputTexCoord': { type: 'v2', value: null },
      'inputSize': { type: 'f', value: null }
    })

    this.setAttributes(data)

    this.makeTexture()
    this.makeMapping()
  }

  makeMaterial () {
    super.makeMaterial()

    const tex = this.texture

    const m = this.material
    m.transparent = true
    m.extensions.derivatives = true
    m.lights = false
    m.uniforms.fontTexture.value = tex
    m.needsUpdate = true

    const wm = this.wireframeMaterial
    wm.transparent = true
    wm.extensions.derivatives = true
    wm.lights = false
    wm.uniforms.fontTexture.value = tex
    wm.needsUpdate = true

    const pm = this.pickingMaterial
    pm.extensions.derivatives = true
    pm.lights = false
    pm.uniforms.fontTexture.value = tex
    pm.needsUpdate = true
  }

  setAttributes (data: Partial<TextBufferData> = {}) {
    let position, size, color
    let aPosition, inputSize, aColor

    const text = this.text
    const attributes = this.geometry.attributes as any  // TODO

    if (data.position) {
      position = data.position
      aPosition = attributes.position.array
      attributes.position.needsUpdate = true
    }

    if (data.size) {
      size = data.size
      inputSize = attributes.inputSize.array
      attributes.inputSize.needsUpdate = true
    }

    if (data.color) {
      color = data.color
      aColor = attributes.color.array
      attributes.color.needsUpdate = true
    }

    const n = this.positionCount

    let j, o
    let iCharAll = 0
    let txt, iChar, nChar

    for (let v = 0; v < n; ++v) {
      o = 3 * v
      txt = text[ v ]
      nChar = txt.length
      if (this.parameters.showBackground) nChar += 1

      for (iChar = 0; iChar < nChar; ++iChar, ++iCharAll) {
        for (let m = 0; m < 4; m++) {
          j = iCharAll * 4 * 3 + (3 * m)

          if (position) {
            aPosition[ j ] = position[ o ]
            aPosition[ j + 1 ] = position[ o + 1 ]
            aPosition[ j + 2 ] = position[ o + 2 ]
          }

          if (size) {
            inputSize[ (iCharAll * 4) + m ] = size[ v ]
          }

          if (color) {
            aColor[ j ] = color[ o ]
            aColor[ j + 1 ] = color[ o + 1 ]
            aColor[ j + 2 ] = color[ o + 2 ]
          }
        }
      }
    }
  }

  makeTexture () {
    this.textAtlas = getTextAtlas({
      font: this.parameters.fontFamily,
      style: this.parameters.fontStyle,
      weight: this.parameters.fontWeight,
      size: this.parameters.fontSize
    })

    this.texture = this.textAtlas.texture
  }

  makeMapping () {
    const ta = this.textAtlas
    const text = this.text
    const attachment = this.parameters.attachment
    const margin = (ta.lineHeight * this.parameters.backgroundMargin * 0.1) - 10

    const attribs = this.geometry.attributes as any  // TODO
    const inputTexCoord = attribs.inputTexCoord.array
    const inputMapping = attribs.mapping.array

    const n = this.positionCount
    let iCharAll = 0
    let c, i, txt, xadvance, iChar, nChar, xShift, yShift

    for (let v = 0; v < n; ++v) {
      txt = text[ v ]
      xadvance = 0
      nChar = txt.length

      // calculate width
      for (iChar = 0; iChar < nChar; ++iChar) {
        c = ta.get(txt[ iChar ])
        xadvance += c.w - 2 * ta.parameters.outline
      }

      // attachment
      if (attachment.startsWith('top')) {
        yShift = ta.lineHeight / 1.25
      } else if (attachment.startsWith('middle')) {
        yShift = ta.lineHeight / 2.5
      } else {
        yShift = 0  // "bottom"
      }
      if (attachment.endsWith('right')) {
        xShift = xadvance
      } else if (attachment.endsWith('center')) {
        xShift = xadvance / 2
      } else {
        xShift = 0  // "left"
      }
      xShift += ta.parameters.outline
      yShift += ta.parameters.outline

      // background
      if (this.parameters.showBackground) {
        i = iCharAll * 2 * 4
        inputMapping[ i + 0 ] = -ta.lineHeight / 6 - xShift - margin  // top left
        inputMapping[ i + 1 ] = ta.lineHeight - yShift + margin
        inputMapping[ i + 2 ] = -ta.lineHeight / 6 - xShift - margin  // bottom left
        inputMapping[ i + 3 ] = 0 - yShift - margin
        inputMapping[ i + 4 ] = xadvance + ta.lineHeight / 6 - xShift + 2 * ta.parameters.outline + margin  // top right
        inputMapping[ i + 5 ] = ta.lineHeight - yShift + margin
        inputMapping[ i + 6 ] = xadvance + ta.lineHeight / 6 - xShift + 2 * ta.parameters.outline + margin  // bottom right
        inputMapping[ i + 7 ] = 0 - yShift - margin
        inputTexCoord[ i + 0 ] = 10
        inputTexCoord[ i + 2 ] = 10
        inputTexCoord[ i + 4 ] = 10
        inputTexCoord[ i + 6 ] = 10
        iCharAll += 1
      }

      xadvance = 0

      for (iChar = 0; iChar < nChar; ++iChar, ++iCharAll) {
        c = ta.get(txt[ iChar ])
        i = iCharAll * 2 * 4

        inputMapping[ i + 0 ] = xadvance - xShift  // top left
        inputMapping[ i + 1 ] = c.h - yShift
        inputMapping[ i + 2 ] = xadvance - xShift  // bottom left
        inputMapping[ i + 3 ] = 0 - yShift
        inputMapping[ i + 4 ] = xadvance + c.w - xShift  // top right
        inputMapping[ i + 5 ] = c.h - yShift
        inputMapping[ i + 6 ] = xadvance + c.w - xShift  // bottom right
        inputMapping[ i + 7 ] = 0 - yShift

        const texWidth = ta.parameters.width
        const texHeight = ta.parameters.height

        const texCoords = [
          c.x / texWidth, c.y / texHeight,             // top left
          c.x / texWidth, (c.y + c.h) / texHeight,       // bottom left
          (c.x + c.w) / texWidth, c.y / texHeight,       // top right
          (c.x + c.w) / texWidth, (c.y + c.h) / texHeight  // bottom right
        ]
        inputTexCoord.set(texCoords, i)

        xadvance += c.w - 2 * ta.parameters.outline
      }
    }

    attribs.inputTexCoord.needsUpdate = true
    attribs.mapping.needsUpdate = true
  }

  getDefines (type: BufferTypes) {
    const defines = super.getDefines(type)

    if (this.parameters.fixedSize) {
      defines.FIXED_SIZE = 1
    }

    return defines
  }

  setUniforms (data: any) {  // TODO
    if (data && (
      data.fontFamily !== undefined ||
      data.fontStyle !== undefined ||
      data.fontWeight !== undefined ||
      data.fontSize !== undefined
    )) {
      this.makeTexture()
      this.makeMapping()
      this.texture.needsUpdate = true
      data.fontTexture = this.texture
    }

    super.setUniforms(data)
  }
}

BufferRegistry.add('text', TextBuffer)

export default TextBuffer
