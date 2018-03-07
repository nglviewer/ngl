/**
 * @file Annotation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector2, Vector3 } from 'three'

import { defaults } from '../utils'
import { smoothstep } from '../math/math-utils'
import Stage from '../stage/stage'
import Viewer from '../viewer/viewer'
import Component from './component'

export interface AnnotationParams {
  offsetX?: number
  offsetY?: number
  visible?: boolean
}

/**
 * Annotation HTML element floating on top of a position rendered in 3d
 */
export default class Annotation {
  offsetX: number
  offsetY: number
  visible: boolean

  stage: Stage
  viewer: Viewer
  element: HTMLElement

  private _viewerPosition: Vector3
  private _canvasPosition: Vector2
  private _cameraPosition: Vector3
  private _clientRect: ClientRect

  /**
   * @param {Component} component - the associated component
   * @param {Vector3} position - position in 3d
   * @param {String|Element} content - HTML content
   * @param {Object} [params] - parameters
   * @param {Integer} params.offsetX - 2d offset in x direction
   * @param {Integer} params.offsetY - 2d offset in y direction
   * @param {Boolean} params.visible - visibility flag
   */
  constructor (readonly component: Component, readonly position: Vector3, content: string|HTMLElement, params: AnnotationParams = {}) {
    this.offsetX = defaults(params.offsetX, 0)
    this.offsetY = defaults(params.offsetY, 0)
    this.visible = defaults(params.visible, true)

    this.stage = component.stage
    this.viewer = component.stage.viewer

    this._viewerPosition = new Vector3()
    this._updateViewerPosition()
    this._canvasPosition = new Vector2()
    this._cameraPosition = new Vector3()

    this.element = document.createElement('div')
    Object.assign(this.element.style, {
      display: 'block',
      position: 'absolute',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      left: '-10000px'
    })

    this.viewer.wrapper.appendChild(this.element)
    this.setContent(content)
    this.updateVisibility()
    this.viewer.signals.rendered.add(this._update, this)
    this.component.signals.matrixChanged.add(this._updateViewerPosition, this)
  }

  /**
   * Set HTML content of the annotation
   * @param {String|Element} value - HTML content
   * @return {undefined}
   */
  setContent (value: string|HTMLElement) {
    const displayValue = this.element.style.display
    if (displayValue === 'none') {
      this.element.style.left = '-10000px'
      this.element.style.display = 'block'
    }

    if (value instanceof HTMLElement) {
      this.element.appendChild(value)
    } else {
      const content = document.createElement('div')
      content.innerText = value
      Object.assign(content.style, {
        backgroundColor: 'rgba( 0, 0, 0, 0.6 )',
        color: 'lightgrey',
        padding: '8px',
        fontFamily: 'sans-serif',
      })
      this.element.appendChild(content)
    }

    this._clientRect = this.element.getBoundingClientRect()

    if (displayValue === 'none') {
      this.element.style.display = displayValue
    }
  }

  /**
   * Set visibility of the annotation
   * @param {Boolean} value - visibility flag
   * @return {undefined}
   */
  setVisibility (value: boolean) {
    this.visible = value
    this.updateVisibility()
  }

  getVisibility () {
    return this.visible && this.component.parameters.visible
  }

  updateVisibility () {
    this.element.style.display = this.getVisibility() ? 'block' : 'none'
  }

  _updateViewerPosition () {
    this._viewerPosition
      .copy(this.position)
      .applyMatrix4(this.component.matrix)
  }

  _update () {
    if (!this.getVisibility()) return

    const s = this.element.style
    const cp = this._canvasPosition
    const vp = this._viewerPosition
    const cr = this._clientRect

    this._cameraPosition.copy(vp)
      .add(this.viewer.translationGroup.position)
      .applyMatrix4(this.viewer.rotationGroup.matrix)
      .sub(this.viewer.camera.position)

    if (this._cameraPosition.z < 0) {
      s.display = 'none'
      return
    } else {
      s.display = 'block'
    }

    const depth = this._cameraPosition.length()
    const fog = this.viewer.scene.fog as any  // TODO

    s.opacity = (1 - smoothstep(fog.near, fog.far, depth)).toString()
    s.zIndex = (Math.round((fog.far - depth) * 100)).toString()

    this.stage.viewerControls.getPositionOnCanvas(vp, cp)

    s.bottom = (this.offsetX + cp.y + cr.height / 2) + 'px'
    s.left = (this.offsetY + cp.x - cr.width / 2) + 'px'
  }

  /**
   * Safely remove the annotation
   * @return {undefined}
   */
  dispose () {
    this.viewer.wrapper.removeChild(this.element)
    this.viewer.signals.ticked.remove(this._update, this)
    this.component.signals.matrixChanged.remove(this._updateViewerPosition, this)
  }
}