/**
 * @file Text Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color, CanvasTexture } from '../../lib/three.es6.js'

import '../shader/SDFFont.vert'
import '../shader/SDFFont.frag'

import { Browser, BufferRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import MappedQuadBuffer from './mappedquad-buffer.js'
import { IgnorePicker } from '../utils/picker.js'

const TextAtlasCache = {}

function getTextAtlas (params) {
  const hash = JSON.stringify(params)
  if (TextAtlasCache[ hash ] === undefined) {
    TextAtlasCache[ hash ] = new TextAtlas(params)
  }
  return TextAtlasCache[ hash ]
}

class TextAtlas {
  constructor (params) {
        // adapted from https://github.com/unconed/mathbox
        // MIT License Copyright (C) 2013+ Steven Wittens and contributors

    const p = Object.assign({}, params)

    this.font = defaults(p.font, [ 'sans-serif' ])
    this.size = defaults(p.size, 36)
    this.style = defaults(p.style, 'normal')
    this.variant = defaults(p.variant, 'normal')
    this.weight = defaults(p.weight, 'normal')
    this.outline = defaults(p.outline, 0)
    this.width = defaults(p.width, 2048)
    this.height = defaults(p.height, 2048)

    this.gamma = 1
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent
      if (ua.match(/Chrome/) && ua.match(/OS X/)) {
        this.gamma = 0.5
      }
    }

    this.mapped = {}
    this.scratchW = 0
    this.scratchH = 0
    this.currentX = 0
    this.currentY = 0

    this.build()
    this.populate()

    this.texture = new CanvasTexture(this.canvas2)
    this.texture.flipY = false
    this.texture.needsUpdate = true
  }

  build () {
        // Prepare line-height with room for outline and descenders/ascenders
    const lineHeight = this.size + 2 * this.outline + Math.round(this.size / 4)
    const maxWidth = this.width / 4

        // Prepare scratch canvas
    const canvas = document.createElement('canvas')
    canvas.width = maxWidth
    canvas.height = lineHeight

    const ctx = canvas.getContext('2d')
    ctx.font = this.style + ' ' + this.variant + ' ' + this.weight + ' ' + this.size + 'px ' + this.font
    ctx.fillStyle = '#FF0000'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.lineJoin = 'round'

    const colors = []
    const dilate = this.outline * 3
    for (let i = 0; i < dilate; ++i) {
            // 8 rgb levels = 1 step = .5 pixel increase
      const val = Math.max(0, -i * 8 + 128 - (!i) * 8)
      const hex = ('00' + val.toString(16)).slice(-2)
      colors.push('#' + hex + hex + hex)
    }
    const scratch = new Uint8Array(maxWidth * lineHeight * 2)

    this.canvas = canvas
    this.context = ctx
    this.lineHeight = lineHeight
    this.maxWidth = maxWidth
    this.colors = colors
    this.scratch = scratch

    this.data = new Uint8Array(this.width * this.height * 4)

    this.canvas2 = document.createElement('canvas')
    this.canvas2.width = this.width
    this.canvas2.height = this.height
    this.context2 = this.canvas2.getContext('2d')
  }

  map (text) {
    if (this.mapped[ text ] === undefined) {
      this.draw(text)

      if (this.currentX + this.scratchW > this.width) {
        this.currentX = 0
        this.currentY += this.scratchH
      }
      if (this.currentY + this.scratchH > this.height) {
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

  get (text) {
    return this.mapped[ text ] || this.placeholder
  }

  draw (text) {
    const h = this.lineHeight
    const o = this.outline
    const ctx = this.context
    const dst = this.scratch
    const max = this.maxWidth
    const colors = this.colors

        // Bottom aligned, take outline into account
    const x = o
    const y = h - this.outline

        // Measure text
    const m = ctx.measureText(text)
    const w = Math.min(max, Math.ceil(m.width + 2 * x + 1))

        // Clear scratch area
    ctx.clearRect(0, 0, w, h)

    let i, il, j, imageData, data

    if (this.outline === 0) {
      ctx.fillText(text, x, y)
      imageData = ctx.getImageData(0, 0, w, h)
      data = imageData.data

      j = 3  // Skip to alpha channel
      for (i = 0, il = data.length / 4; i < il; ++i) {
        dst[ i ] = data[ j ]
        j += 4
      }
    } else {
      ctx.globalCompositeOperation = 'source-over'
            // Draw strokes of decreasing width to create
            // nested outlines (absolute distance)
      for (i = o + 1; i > 0; --i) {
                // Eliminate odd strokes once past > 1px,
                // don't need the detail
        j = i > 1 ? i * 2 - 2 : i
        ctx.strokeStyle = colors[ j - 1 ]
        ctx.lineWidth = j
        ctx.strokeText(text, x, y)
      }
      ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = '#FF00FF'
      ctx.fillText(text, x, y)
      imageData = ctx.getImageData(0, 0, w, h)
      data = imageData.data

      j = 0
      const gamma = this.gamma
      for (i = 0, il = data.length / 4; i < il; ++i) {
                // Get value + mask
        const a = data[ j ]
        let mask = a ? data[ j + 1 ] / a : 1
        if (gamma === 0.5) {
          mask = Math.sqrt(mask)
        }
        mask = Math.min(1, Math.max(0, mask))

                // Blend between positive/outside and negative/inside
        const b = 256 - a
        const c = b + (a - b) * mask

                // Clamp (slight expansion to hide errors around the transition)
        dst[ i ] = Math.max(0, Math.min(255, c + 2))
        data[ j + 3 ] = dst[ i ]
        j += 4
      }
    }

    ctx.putImageData(imageData, 0, 0)
    this.scratchW = w
    this.scratchH = h
  }

  populate () {
        // Replacement Character
    this.placeholder = this.map(String.fromCharCode(0xFFFD))

        // Basic Latin
    for (let i = 0x0000; i < 0x007F; ++i) {
      this.map(String.fromCharCode(i))
    }

        // Latin-1 Supplement
    for (let i = 0x0080; i < 0x00FF; ++i) {
      this.map(String.fromCharCode(i))
    }

        // Greek and Coptic
    for (let i = 0x0370; i < 0x03FF; ++i) {
      this.map(String.fromCharCode(i))
    }

        // Cyrillic
    for (let i = 0x0400; i < 0x04FF; ++i) {
      this.map(String.fromCharCode(i))
    }

        // Angstrom Sign
    this.map(String.fromCharCode(0x212B))
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
 * @property {Boolean} sdf - use "signed distance field"-based rendering for sharper edges
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
 */

/**
 * Text buffer. Renders screen-aligned text strings.
 *
 * @example
 * var textBuffer = new TextBuffer( {
 *     position: new Float32Array( [ 0, 0, 0 ] ),
 *     color: new Float32Array( [ 1, 0, 0 ] ),
 *     size: new Float32Array( [ 2 ] ),
 *     text: [ "Hello" ]
 * } );
 */
class TextBuffer extends MappedQuadBuffer {
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.color - colors
     * @param  {Float32Array} data.size - sizes
     * @param  {String[]} data.text - text strings
     * @param  {TextBufferParameters} params - parameters object
     */
  constructor (data, params) {
    var d = data || {}
    var p = params || {}

    p.forceTransparent = true

    var n = d.position.length / 3
    var charCount = 0
    for (var i = 0; i < n; ++i) {
      charCount += d.text[ i ].length
    }

    var count = charCount
    if (p.showBackground) count += n

    super({
      position: new Float32Array(count * 3),
      color: new Float32Array(count * 3),
      picking: new IgnorePicker()
    }, p)

    this.fontFamily = defaults(p.fontFamily, 'sans-serif')
    this.fontStyle = defaults(p.fontStyle, 'normal')
    this.fontWeight = defaults(p.fontWeight, 'bold')
    this.fontSize = defaults(p.fontSize, 48)
    this.sdf = defaults(p.sdf, Browser === 'Chrome')
    this.xOffset = defaults(p.xOffset, 0.0)
    this.yOffset = defaults(p.yOffset, 0.0)
    this.zOffset = defaults(p.zOffset, 0.5)
    this.attachment = defaults(p.attachment, 'bottom-left')
    this.showBorder = defaults(p.showBorder, false)
    this.borderColor = defaults(p.borderColor, 'lightgrey')
    this.borderWidth = defaults(p.borderWidth, 0.15)
    this.showBackground = defaults(p.showBackground, false)
    this.backgroundColor = defaults(p.backgroundColor, 'lightgrey')
    this.backgroundMargin = defaults(p.backgroundMargin, 0.5)
    this.backgroundOpacity = defaults(p.backgroundOpacity, 1.0)

    this.text = d.text
    this.positionCount = n

    this.addUniforms({
      'fontTexture': { value: null },
      'xOffset': { value: this.xOffset },
      'yOffset': { value: this.yOffset },
      'zOffset': { value: this.zOffset },
      'ortho': { value: false },
      'showBorder': { value: this.showBorder },
      'borderColor': { value: new Color(this.borderColor) },
      'borderWidth': { value: this.borderWidth },
      'backgroundColor': { value: new Color(this.backgroundColor) },
      'backgroundOpacity': { value: this.backgroundOpacity }
    })

    this.addAttributes({
      'inputTexCoord': { type: 'v2', value: null },
      'inputSize': { type: 'f', value: null }
    })

    this.setAttributes(data)

    this.makeTexture()
    this.makeMapping()
  }

  get parameters () {
    return Object.assign({

      fontFamily: { uniform: true },
      fontStyle: { uniform: true },
      fontWeight: { uniform: true },
      fontSize: { uniform: true },
      sdf: { updateShader: true, uniform: true },
      xOffset: { uniform: true },
      yOffset: { uniform: true },
      zOffset: { uniform: true },
      showBorder: { uniform: true },
      borderColor: { uniform: true },
      borderWidth: { uniform: true },
      backgroundColor: { uniform: true },
      backgroundOpacity: { uniform: true }

    }, super.parameters, {

      flatShaded: undefined

    })
  }

  makeMaterial () {
    super.makeMaterial()

    const tex = this.texture

    const m = this.material
    m.extensions.derivatives = true
    m.lights = false
    m.uniforms.fontTexture.value = tex
    m.needsUpdate = true

    const wm = this.wireframeMaterial
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

  setAttributes (data) {
    let position, size, color
    let aPosition, inputSize, aColor

    const text = this.text
    const attributes = this.geometry.attributes

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
      if (this.showBackground) nChar += 1

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
      font: [ this.fontFamily ],
      style: this.fontStyle,
      weight: this.fontWeight,
      size: this.fontSize,
      outline: this.sdf ? 5 : 0
    })

    this.texture = this.textAtlas.texture
  }

  makeMapping () {
    const ta = this.textAtlas
    const text = this.text
    const attachment = this.attachment
    const margin = (ta.lineHeight * this.backgroundMargin * 0.1) - 10

    const inputTexCoord = this.geometry.attributes.inputTexCoord.array
    const inputMapping = this.geometry.attributes.mapping.array

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
        xadvance += c.w - 2 * ta.outline
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
      xShift += ta.outline
      yShift += ta.outline

            // background
      if (this.showBackground) {
        i = iCharAll * 2 * 4
        inputMapping[ i + 0 ] = -ta.lineHeight / 6 - xShift - margin  // top left
        inputMapping[ i + 1 ] = ta.lineHeight - yShift + margin
        inputMapping[ i + 2 ] = -ta.lineHeight / 6 - xShift - margin  // bottom left
        inputMapping[ i + 3 ] = 0 - yShift - margin
        inputMapping[ i + 4 ] = xadvance + ta.lineHeight / 6 - xShift + 2 * ta.outline + margin  // top right
        inputMapping[ i + 5 ] = ta.lineHeight - yShift + margin
        inputMapping[ i + 6 ] = xadvance + ta.lineHeight / 6 - xShift + 2 * ta.outline + margin  // bottom right
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

        const texWidth = ta.width
        const texHeight = ta.height

        const texCoords = [
          c.x / texWidth, c.y / texHeight,             // top left
          c.x / texWidth, (c.y + c.h) / texHeight,       // bottom left
          (c.x + c.w) / texWidth, c.y / texHeight,       // top right
          (c.x + c.w) / texWidth, (c.y + c.h) / texHeight  // bottom right
        ]
        inputTexCoord.set(texCoords, i)

        xadvance += c.w - 2 * ta.outline
      }
    }

    this.geometry.attributes.inputTexCoord.needsUpdate = true
    this.geometry.attributes.mapping.needsUpdate = true
  }

  getDefines (type) {
    const defines = super.getDefines(type)

    if (this.sdf) {
      defines.SDF = 1
    }

    return defines
  }

  setUniforms (data) {
    if (data && (
                data.fontFamily !== undefined ||
                data.fontStyle !== undefined ||
                data.fontWeight !== undefined ||
                data.fontSize !== undefined ||
                data.sdf !== undefined
            )
        ) {
      this.makeTexture()
      this.makeMapping()
      this.texture.needsUpdate = true
      data.fontTexture = this.texture
    }

    super.setUniforms(data)
  }

  set wireframe (value) {}
  get wireframe () { return false }

  get isText () { return true }
  get vertexShader () { return 'SDFFont.vert' }
  get fragmentShader () { return 'SDFFont.frag' }
}

BufferRegistry.add('text', TextBuffer)

export default TextBuffer
