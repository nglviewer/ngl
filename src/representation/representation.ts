/**
 * @file Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color, Vector3, Matrix4 } from 'three'

import { Debug, Log, ColormakerRegistry, ExtensionFragDepth } from '../globals'
import { defaults } from '../utils'
import Queue from '../utils/queue'
import Counter from '../utils/counter'
import Viewer from '../viewer/viewer'
import { BufferParameters, BufferSide, default as Buffer } from '../buffer/buffer';
import { ColormakerParameters, ColorMode } from '../color/colormaker';

export interface RepresentationParameters {
  name: string
  lazy: boolean,
  clipNear: number,
  clipRadius: number,
  clipCenter: Vector3,
  flatShaded: boolean,
  opacity: number,
  depthWrite: boolean,
  side: BufferSide,
  wireframe: boolean,
  colorScheme: string,
  colorScale: string | number[],
  colorReverse: boolean,
  colorValue: number,
  colorDomain: number[],
  colorMode: ColorMode,
  colorSpace: 'sRGB' | 'linear',
  roughness: number,
  metalness: number,
  diffuse: Color,
  diffuseInterior: boolean,
  useInteriorColor: boolean,
  interiorColor: Color,
  interiorDarkening: number,
  disablePicking: boolean,
  matrix: Matrix4
  quality: string,
  visible: boolean,
  color: number | string | Color,
  sphereDetail: number,
  radialSegments: number,
  openEnded: boolean
  disableImpostor: boolean
  [key: string]: any//boolean | number | undefined | Color | string | Vector3 | Matrix4 | number[]
}
/**
 * Representation parameter object.
 * @typedef {Object} RepresentationParameters - representation parameters
 * @property {Boolean} [lazy] - only build & update the representation when visible
 *                            otherwise defer changes until set visible again
 * @property {Integer} [clipNear] - position of camera near/front clipping plane
 *                                in percent of scene bounding box
 * @property {Integer} [clipRadius] - radius of clipping sphere
 * @property {Vector3} [clipCenter] - position of for spherical clipping
 * @property {Boolean} [flatShaded] - render flat shaded
 * @property {Float} [opacity] - translucency: 1 is fully opaque, 0 is fully transparent
 * @property {Boolean} [depthWrite] - depth write
 * @property {String} [side] - which triangle sides to render, "front" front-side,
 *                            "back" back-side, "double" front- and back-side
 * @property {Boolean} [wireframe] - render as wireframe
 * @property {String} [colorScheme] - color scheme
 * @property {String} [colorScale] - color scale, either a string for a
 *                                 predefined scale or an array of
 *                                 colors to be used as the scale
 * @property {Boolean} [colorReverse] - reverse color scale
 * @property {Color} [colorValue] - color value
 * @property {Integer[]} [colorDomain] - scale value range
 * @property {Integer} colorDomain.0 - min value
 * @property {Integer} colorDomain.1 - max value
 * @property {String} [colorMode] - color mode, one of rgb, hsv, hsl, hsi, lab, hcl
 * @property {Float} [roughness] - how rough the material is, between 0 and 1
 * @property {Float} [metalness] - how metallic the material is, between 0 and 1
 * @property {Color} [diffuse] - diffuse color for lighting
 * @property {Boolean} [diffuseInterior] - diffuse interior, i.e. ignore normal
 * @property {Boolean} [useInteriorColor] - use interior color
 * @property {Color} [interiorColor] - interior color
 * @property {Float} [interiorDarkening] - interior darkening: 0 no darking, 1 fully darkened
 * @property {Boolean} [disablePicking] - disable picking
 */

/**
 * Representation object
 * @interface
 * @param {Object} object - the object to be represented
 * @param {Viewer} viewer - a viewer object
 * @param {RepresentationParameters} [params] - representation parameters
 */
class Representation {
  parameters: any
  type: string
  viewer: Viewer
  tasks: Counter
  private queue: Queue<any>
  bufferList: Buffer[]

  lazy: boolean
  lazyProps: { build: boolean, bufferParams: BufferParameters | {}, what: {}}
  protected name: string
  protected clipNear: number
  protected clipRadius: number
  protected clipCenter: Vector3
  protected flatShaded: boolean
  protected opacity: number
  protected depthWrite: boolean
  protected side: BufferSide
  protected wireframe: boolean
  protected colorScheme: string
  protected colorScale: string | string[]
  protected colorReverse: boolean
  protected colorValue: number
  protected colorDomain: number[]
  protected colorMode: ColorMode
  protected roughness: number
  protected metalness: number
  protected diffuse: number
  protected diffuseInterior?: boolean
  protected useInteriorColor?: boolean
  protected interiorColor: number
  protected interiorDarkening: number
  protected disablePicking: boolean
  protected sphereDetail: number
  protected radialSegments: number
  protected openEnded: boolean
  protected disableImpostor: boolean
  protected disposed: boolean

  protected matrix: Matrix4

  private quality: string
  visible: boolean

  protected manualAttach: ()=> any

  protected toBePrepared: boolean

  [key: string]: any

  constructor (object: any, viewer: Viewer, params: Partial<RepresentationParameters>) {
    // eslint-disable-next-line no-unused-vars
    // const p = params || {}

    this.type = ''

    this.parameters = {

      lazy: {
        type: 'boolean'
      },

      clipNear: {
        type: 'range', step: 1, max: 100, min: 0, buffer: true
      },
      clipRadius: {
        type: 'number', precision: 1, max: 1000, min: 0, buffer: true
      },
      clipCenter: {
        type: 'vector3', precision: 1, buffer: true
      },
      flatShaded: {
        type: 'boolean', buffer: true
      },
      opacity: {
        type: 'range', step: 0.01, max: 1, min: 0, buffer: true
      },
      depthWrite: {
        type: 'boolean', buffer: true
      },
      side: {
        type: 'select',
        buffer: true,
        options: { front: 'front', back: 'back', double: 'double' }
      },
      wireframe: {
        type: 'boolean', buffer: true
      },

      colorScheme: {
        type: 'select',
        update: 'color',
        options: {}
      },
      colorScale: {
        type: 'select',
        update: 'color',
        options: ColormakerRegistry.getScales()
      },
      colorReverse: {
        type: 'boolean', update: 'color'
      },
      colorValue: {
        type: 'color', update: 'color'
      },
      colorDomain: {
        type: 'hidden', update: 'color'
      },
      colorMode: {
        type: 'select',
        update: 'color',
        options: ColormakerRegistry.getModes()
      },

      roughness: {
        type: 'range', step: 0.01, max: 1, min: 0, buffer: true
      },
      metalness: {
        type: 'range', step: 0.01, max: 1, min: 0, buffer: true
      },
      diffuse: {
        type: 'color', buffer: true
      },

      diffuseInterior: {
        type: 'boolean', buffer: true
      },
      useInteriorColor: {
        type: 'boolean', buffer: true
      },
      interiorColor: {
        type: 'color', buffer: true
      },
      interiorDarkening: {
        type: 'range', step: 0.01, max: 1, min: 0, buffer: true
      },

      matrix: {
        type: 'hidden', buffer: true
      },

      disablePicking: {
        type: 'boolean', rebuild: true
      }

    }

    /**
     * @type {Viewer}
     */
    this.viewer = viewer

    /**
     * Counter that keeps track of tasks related to the creation of
     * the representation, including surface calculations.
     * @type {Counter}
     */
    this.tasks = new Counter()

    /**
     * @type {Queue}
     * @private
     */
    this.queue = new Queue(this.make.bind(this))

    /**
     * @type {Array}
     * @private
     */
    this.bufferList = []

    if (this.parameters.colorScheme) {
      this.parameters.colorScheme.options = ColormakerRegistry.getSchemes()
    }

    this.toBePrepared = false
  }

  init (params: Partial<RepresentationParameters>) {
    const p = params || {}

    this.clipNear = defaults(p.clipNear, 0)
    this.clipRadius = defaults(p.clipRadius, 0)
    this.clipCenter = defaults(p.clipCenter, new Vector3())
    this.flatShaded = defaults(p.flatShaded, false)
    this.side = defaults(p.side, 'double')
    this.opacity = defaults(p.opacity, 1.0)
    this.depthWrite = defaults(p.depthWrite, true)
    this.wireframe = defaults(p.wireframe, false)

    this.setColor(p.color, p)

    this.colorScheme = defaults(p.colorScheme, 'uniform')
    this.colorScale = defaults(p.colorScale, '')
    this.colorReverse = defaults(p.colorReverse, false)
    this.colorValue = defaults(p.colorValue, 0x909090)
    this.colorDomain = defaults(p.colorDomain, undefined)
    this.colorMode = defaults(p.colorMode, 'hcl')

    this.visible = defaults(p.visible, true)
    this.quality = defaults(p.quality, undefined)

    this.roughness = defaults(p.roughness, 0.4)
    this.metalness = defaults(p.metalness, 0.0)
    this.diffuse = defaults(p.diffuse, 0xffffff)

    this.diffuseInterior = defaults(p.diffuseInterior, false)
    this.useInteriorColor = defaults(p.useInteriorColor, false)
    this.interiorColor = defaults(p.interiorColor, 0x222222)
    this.interiorDarkening = defaults(p.interiorDarkening, 0)

    this.lazy = defaults(p.lazy, false)
    this.lazyProps = {
      build: false,
      bufferParams: {},
      what: {}
    }

    this.matrix = defaults(p.matrix, new Matrix4())

    this.disablePicking = defaults(p.disablePicking, false)

    // handle common parameters when applicable

    const tp = this.parameters

    if (tp.sphereDetail === true) {
      tp.sphereDetail = {
        type: 'integer', max: 3, min: 0, rebuild: 'impostor'
      }
    }
    if (tp.radialSegments === true) {
      tp.radialSegments = {
        type: 'integer', max: 25, min: 5, rebuild: 'impostor'
      }
    }
    if (tp.openEnded === true) {
      tp.openEnded = {
        type: 'boolean', rebuild: 'impostor', buffer: true
      }
    }
    if (tp.disableImpostor === true) {
      tp.disableImpostor = {
        type: 'boolean', rebuild: true
      }
    }

    if (p.quality === 'low') {
      if (tp.sphereDetail) this.sphereDetail = 0
      if (tp.radialSegments) this.radialSegments = 5
    } else if (p.quality === 'medium') {
      if (tp.sphereDetail) this.sphereDetail = 1
      if (tp.radialSegments) this.radialSegments = 10
    } else if (p.quality === 'high') {
      if (tp.sphereDetail) this.sphereDetail = 2
      if (tp.radialSegments) this.radialSegments = 20
    } else {
      if (tp.sphereDetail) {
        this.sphereDetail = defaults(p.sphereDetail, 1)
      }
      if (tp.radialSegments) {
        this.radialSegments = defaults(p.radialSegments, 10)
      }
    }

    if (tp.openEnded) {
      this.openEnded = defaults(p.openEnded, true)
    }

    if (tp.disableImpostor) {
      this.disableImpostor = defaults(p.disableImpostor, false)
    }

  }

  getColorParams (p?: {[k: string]: any}): { scheme: string, [k: string]: any } & ColormakerParameters {
    return Object.assign({

      scheme: this.colorScheme,
      scale: this.colorScale,
      reverse: this.colorReverse,
      value: this.colorValue,
      domain: this.colorDomain,
      mode: this.colorMode,
      colorSpace: this.colorSpace,

    }, p)
  }

  getBufferParams (p: {[k: string]: any} = {}) {
    return Object.assign({

      clipNear: this.clipNear,
      clipRadius: this.clipRadius,
      clipCenter: this.clipCenter,
      flatShaded: this.flatShaded,
      opacity: this.opacity,
      depthWrite: this.depthWrite,
      side: this.side,
      wireframe: this.wireframe,

      roughness: this.roughness,
      metalness: this.metalness,
      diffuse: this.diffuse,

      diffuseInterior: this.diffuseInterior,
      useInteriorColor: this.useInteriorColor,
      interiorColor: this.interiorColor,
      interiorDarkening: this.interiorDarkening,

      matrix: this.matrix,

      disablePicking: this.disablePicking

    }, p)
  }

  setColor (value: number | string | Color | undefined , p?: Partial<RepresentationParameters>) {
    const types = Object.keys(ColormakerRegistry.getSchemes())

    if (typeof value === 'string' && types.includes(value.toLowerCase())) {
      if (p) {
        p.colorScheme = value
      } else {
        this.setParameters({ colorScheme: value })
      }
    } else if (value !== undefined) {
      let val = new Color(value as string).getHex() //TODO
      if (p) {
        p.colorScheme = 'uniform'
        p.colorValue = val
      } else {
        this.setParameters({
          colorScheme: 'uniform', colorValue: val
        })
      }
    }

    return this
  }

  // TODO
  prepare (cb: ()=> void) {

  }

  create () {
    // this.bufferList.length = 0;
  }

  update (what?: any) {
    this.build()
  }

  build (updateWhat?: {[k: string]: boolean}) {
    if (this.lazy && (!this.visible || !this.opacity)) {
      this.lazyProps.build = true
      return
    }

    if (!this.toBePrepared) {
      this.tasks.increment()
      this.make()
      return
    }

    // don't let tasks accumulate
    if (this.queue.length() > 0) {
      this.tasks.change(1 - this.queue.length())
      this.queue.kill()
    } else {
      this.tasks.increment()
    }

    this.queue.push(updateWhat || false)
  }

  make (updateWhat?: boolean, callback?: () => void) {
    if (Debug) Log.time('Representation.make ' + this.type)

    const _make = () => {
      if (updateWhat) {
        this.update(updateWhat)
        this.viewer.requestRender()
        this.tasks.decrement()
        if (callback) callback()
      } else {
        this.clear()
        this.create()
        if (!this.manualAttach && !this.disposed) {
          if (Debug) Log.time('Representation.attach ' + this.type)
          this.attach(() => {
            if (Debug) Log.timeEnd('Representation.attach ' + this.type)
            this.tasks.decrement()
            if (callback) callback()
          })
        }
      }

      if (Debug) Log.timeEnd('Representation.make ' + this.type)
    }

    if (this.toBePrepared) {
      this.prepare(_make)
    } else {
      _make()
    }
  }

  attach (callback: () => void) {
    this.setVisibility(this.visible)

    callback()
  }

  /**
   * Set the visibility of the representation
   * @param {Boolean} value - visibility flag
   * @param {Boolean} [noRenderRequest] - whether or not to request a re-render from the viewer
   * @return {Representation} this object
   */
  setVisibility (value: boolean, noRenderRequest?: boolean): Representation {
    this.visible = value

    if (this.visible && this.opacity) {
      const lazyProps = this.lazyProps
      const bufferParams = lazyProps.bufferParams
      const what = lazyProps.what

      if (lazyProps.build) {
        lazyProps.build = false
        this.build()
        return this
      } else if (Object.keys(bufferParams).length || Object.keys(what).length) {
        lazyProps.bufferParams = {}
        lazyProps.what = {}
        this.updateParameters(bufferParams, what)
      }
    }

    this.bufferList.forEach(function (buffer) {
      buffer.setVisibility(value)
    })

    if (!noRenderRequest) this.viewer.requestRender()

    return this
  }

  /**
   * Set the visibility of the representation
   * @param {RepresentationParameters} params - parameters object
   * @param {Object} [what] - buffer data attributes to be updated,
   *                        note that this needs to be implemented in the
   *                        derived classes. Generally it allows more
   *                        fine-grained control over updating than
   *                        forcing a rebuild.
   * @param {Boolean} what.position - update position data
   * @param {Boolean} what.color - update color data
   * @param {Boolean} [rebuild] - whether or not to rebuild the representation
   * @return {Representation} this object
   */
  setParameters (params: Partial<RepresentationParameters>, what:{[propName: string]: any} = {}, rebuild = false) {
    const p = params || {}
    const tp = this.parameters
    const bufferParams: BufferParameters = <any>{}

    if (!this.opacity && p.opacity !== undefined) {
      if (this.lazyProps.build) {
        this.lazyProps.build = false
        rebuild = true
      } else {
        Object.assign(bufferParams, this.lazyProps.bufferParams)
        Object.assign(what, this.lazyProps.what)
        this.lazyProps.bufferParams = {}
        this.lazyProps.what = {}
      }
    }

    this.setColor(p.color, p)

    for (let name in p) {
      if (p[ name ] === undefined) continue
      if (tp[ name ] === undefined) continue

      if (tp[ name ].int) p[ name ] = parseInt(p[ name ] as string)
      if (tp[ name ].float) p[ name ] = parseFloat(p[ name ] as string)

      // no value change
      if (p[ name ] === this[ name ] && (
        !p[ name ].equals || p[ name ].equals(this[ name ])
      )) continue

      if (this[ name ] && this[ name ].copy && p[ name ].copy) {
        this[ name ].copy(p[ name ])
      } else if (this[ name ] && this[ name ].set) {
        this[ name ].set(p[ name ])
      } else {
        this[ name ] = p[ name ]
      }

      // buffer param
      if (tp[ name ].buffer) {
        if (tp[ name ].buffer === true) {
          (bufferParams[ name as keyof BufferParameters ] as any) = p[ name ]
        } else {
          let key: (keyof BufferParameters) = tp[ name ].buffer;
          (bufferParams[ key ] as any) = p[ name ]
        }
      }

      // mark for update
      if (tp[ name ].update) {
        what[ tp[ name ].update ] = true
      }

      // mark for rebuild
      if (tp[ name ].rebuild &&
          !(tp[ name ].rebuild === 'impostor' &&
            ExtensionFragDepth && !this.disableImpostor)
      ) {
        rebuild = true
      }
    }

    //

    if (rebuild) {
      this.build()
    } else {
      this.updateParameters(bufferParams, what)
    }

    return this
  }

  updateParameters (bufferParams: BufferParameters | {} = {}, what?: any) {
    if (this.lazy && (!this.visible || !this.opacity) && bufferParams.hasOwnProperty('opacity') === false) {
      Object.assign(this.lazyProps.bufferParams, bufferParams)
      Object.assign(this.lazyProps.what, what)
      return
    }

    this.bufferList.forEach(function (buffer) {
      buffer.setParameters(bufferParams)
    })

    if (Object.keys(what).length) {
      this.update(what) // update buffer attribute
    }

    this.viewer.requestRender()
  }

  getParameters () {
    const params: Partial<RepresentationParameters> = {
      lazy: this.lazy,
      visible: this.visible,
      quality: this.quality
    }

    Object.keys(this.parameters).forEach(name => {
      if (this.parameters[ name ] !== null) {
        params[ name ] = this[ name ]
      }
    })

    return params
  }

  clear () {
    this.bufferList.forEach(buffer => {
      this.viewer.remove(buffer)
      buffer.dispose()
    })
    this.bufferList.length = 0

    this.viewer.requestRender()
  }

  dispose () {
    this.disposed = true
    this.queue.kill()
    this.tasks.dispose()
    this.clear()
  }
}

export default Representation
