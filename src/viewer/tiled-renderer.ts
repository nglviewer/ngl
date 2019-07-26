/**
 * @file Tiled Renderer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils'
import { Camera, WebGLRenderer } from 'three'
import Viewer from './viewer'

export interface TiledRendererParams {
  factor?: number
  antialias?: boolean
  onProgress?: Function
  onFinish?: Function
}

class TiledRenderer {
  canvas = document.createElement('canvas')

  private _width: number
  private _height: number
  private _n: number
  private _factor: number
  private _antialias: boolean
  private _viewerSampleLevel: number

  private _viewer: Viewer
  private _onProgress?: Function
  private _onFinish?: Function
  private _ctx: CanvasRenderingContext2D

  constructor(renderer: WebGLRenderer, camera: Camera, viewer: Viewer, params: TiledRendererParams) {
    this._viewer = viewer

    this._factor = defaults(params.factor, 2)
    this._antialias = defaults(params.antialias, false)

    this._onProgress = params.onProgress
    this._onFinish = params.onFinish

    if (this._antialias) this._factor *= 2
    this._n = this._factor * this._factor

    // canvas

    this._width = this._viewer.width
    this._height = this._viewer.height

    if (this._antialias) {
      this.canvas.width = this._width * this._factor / 2
      this.canvas.height = this._height * this._factor / 2
    } else {
      this.canvas.width = this._width * this._factor
      this.canvas.height = this._height * this._factor
    }

    this._ctx = this.canvas.getContext('2d')!

    this._viewerSampleLevel = viewer.sampleLevel
    this._viewer.setSampling(-1)
  }

  private _renderTile (i: number) {
    const viewer = this._viewer
    const width = this._width
    const height = this._height
    const factor = this._factor

    const x = i % factor
    const y = Math.floor(i / factor)

    const offsetX = x * width
    const offsetY = y * height

    viewer.camera.setViewOffset(
      width * factor,
      height * factor,
      offsetX,
      offsetY,
      width,
      height
    )

    viewer.render()

    if (this._antialias) {
        const w = Math.round((offsetX + width) / 2) - Math.round (offsetX / 2);
        const h = Math.round((offsetY + height) / 2) - Math.round (offsetY / 2);
      this._ctx.drawImage(
        viewer.renderer.domElement,
        Math.round(offsetX / 2),
        Math.round(offsetY / 2),
        w,
        h
      )
    } else {
      this._ctx.drawImage(
        viewer.renderer.domElement,
        Math.floor(offsetX),
        Math.floor(offsetY),
        Math.ceil(width),
        Math.ceil(height)
      )
    }

    if (typeof this._onProgress === 'function') {
      this._onProgress(i + 1, this._n, false)
    }
  }

  private _finalize () {
    this._viewer.setSampling(this._viewerSampleLevel)
    this._viewer.camera.view = null!  // TODO

    if (typeof this._onFinish === 'function') {
      this._onFinish(this._n + 1, this._n, false)
    }
  }

  render () {
    for (let i = 0; i <= this._n; ++i) {
      if (i === this._n) {
        this._finalize()
      } else {
        this._renderTile(i)
      }
    }
  }

  renderAsync () {
    let count = 0
    const n = this._n

    const fn = () => {
      if (count === n) {
        this._finalize()
      } else {
        this._renderTile(count)
      }
      count += 1
    }

    for (let i = 0; i <= n; ++i) {
      setTimeout(fn, 0)
    }
  }
}

export default TiledRenderer
