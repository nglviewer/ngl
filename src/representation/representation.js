/**
 * @file Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color, Vector3, Matrix4 } from '../../lib/three.es6.js'

import { Debug, Log, ColormakerRegistry, ExtensionFragDepth } from '../globals.js'
import { defaults } from '../utils.js'
import Queue from '../utils/queue.js'
import Counter from '../utils/counter.js'

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
  constructor (object, viewer, params) {
    // eslint-disable-next-line no-unused-vars
    const p = params || {}

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
  }

  init (params) {
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

  getColorParams (p) {
    return Object.assign({

      scheme: this.colorScheme,
      scale: this.colorScale,
      reverse: this.colorReverse,
      value: this.colorValue,
      domain: this.colorDomain,
      mode: this.colorMode

    }, p)
  }

  getBufferParams (p) {
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

      matrix: this.matrix,

      disablePicking: this.disablePicking

    }, p)
  }

  setColor (value, p) {
    const types = Object.keys(ColormakerRegistry.getSchemes())

    if (typeof value === 'string' && types.includes(value.toLowerCase())) {
      if (p) {
        p.colorScheme = value
      } else {
        this.setParameters({ colorScheme: value })
      }
    } else if (value !== undefined) {
      value = new Color(value).getHex()
      if (p) {
        p.colorScheme = 'uniform'
        p.colorValue = value
      } else {
        this.setParameters({
          colorScheme: 'uniform', colorValue: value
        })
      }
    }

    return this
  }

  // TODO
  // get prepare(){ return false; }

  create () {

    // this.bufferList.length = 0;

  }

  update () {
    this.build()
  }

  build (updateWhat) {
    if (this.lazy && !this.visible) {
      this.lazyProps.build = true
      return
    }

    if (!this.prepare) {
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

  make (updateWhat, callback) {
    if (Debug) Log.time('Representation.make ' + this.type)

    const _make = function () {
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
          this.attach(function () {
            if (Debug) Log.timeEnd('Representation.attach ' + this.type)
            this.tasks.decrement()
            if (callback) callback()
          }.bind(this))
        }
      }

      if (Debug) Log.timeEnd('Representation.make ' + this.type)
    }.bind(this)

    if (this.prepare) {
      this.prepare(_make)
    } else {
      _make()
    }
  }

  attach (callback) {
    this.setVisibility(this.visible)

    callback()
  }

  /**
   * Set the visibility of the representation
   * @param {Boolean} value - visibility flag
   * @param {Boolean} [noRenderRequest] - whether or not to request a re-render from the viewer
   * @return {Representation} this object
   */
  setVisibility (value, noRenderRequest) {
    this.visible = value

    if (this.visible) {
      const lazyProps = this.lazyProps
      const bufferParams = lazyProps.bufferParams
      const what = lazyProps.what

      if (lazyProps.build) {
        lazyProps.build = false
        this.build()
        return
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
  setParameters (params, what, rebuild) {
    const p = params || {}
    const tp = this.parameters

    this.setColor(p.color, p)

    what = what || {}
    rebuild = rebuild || false

    const bufferParams = {}

    for (let name in p) {
      if (p[ name ] === undefined) continue
      if (tp[ name ] === undefined) continue

      if (tp[ name ].int) p[ name ] = parseInt(p[ name ])
      if (tp[ name ].float) p[ name ] = parseFloat(p[ name ])

      // no value change
      if (p[ name ] === this[ name ] && (
          !p[ name ].equals || p[ name ].equals(this[ name ])
        )
      ) continue

      if (this[ name ] && this[ name ].set) {
        this[ name ].set(p[ name ])
      } else {
        this[ name ] = p[ name ]
      }

      // buffer param
      if (tp[ name ].buffer) {
        if (tp[ name ].buffer === true) {
          bufferParams[ name ] = p[ name ]
        } else {
          bufferParams[ tp[ name ].buffer ] = p[ name ]
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

  updateParameters (bufferParams, what) {
    if (this.lazy && !this.visible) {
      Object.assign(this.lazyProps.bufferParams, bufferParams)
      Object.assign(this.lazyProps.what, what)
      return
    }

    this.bufferList.forEach(function (buffer) {
      buffer.setParameters(bufferParams)
    })

    if (Object.keys(what).length) {
      this.update(what)  // update buffer attribute
    }

    this.viewer.requestRender()
  }

  getParameters () {
    const params = {
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
