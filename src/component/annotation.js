/**
 * @file Annotation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from '../../lib/three.es6.js'

import { defaults } from '../utils.js'
import { smoothstep } from '../math/math-utils.js'

/**
 * Annotation HTML element floating on top of a position rendered in 3d
 */
class Annotation {
    /**
     * @param {Component} component - the associated component
     * @param {Vector3} position - position in 3d
     * @param {String|Element} content - HTML content
     * @param {Object} [params] - parameters
     * @param {Integer} params.offsetX - 2d offset in x direction
     * @param {Integer} params.offsetY - 2d offset in y direction
     * @param {Boolean} params.visible - visibility flag
     */
  constructor (component, position, content, params) {
    const p = params || {}

    this.offsetX = defaults(p.offsetX, 0)
    this.offsetY = defaults(p.offsetY, 0)
    this.visible = defaults(p.visible, true)

    this.component = component
    this.stage = component.stage
    this.viewer = this.stage.viewer
    this.position = position

    this._viewerPosition = new Vector3()
    this._updateViewerPosition()
    this._canvasPosition = new Vector3()
    this._cameraPosition = new Vector3()

    this.element = document.createElement('div')
    Object.assign(this.element.style, {
      display: 'block',
      position: 'fixed',
      zIndex: 1 + (parseInt(this.viewer.container.style.zIndex) || 0),
      pointerEvents: 'none',
      backgroundColor: 'rgba( 0, 0, 0, 0.6 )',
      color: 'lightgrey',
      padding: '8px',
      fontFamily: 'sans-serif',
      left: '-10000px'
    })

    this.viewer.container.appendChild(this.element)
    this.setContent(content)
    this.updateVisibility()
    this.viewer.signals.ticked.add(this._update, this)
    this.component.signals.matrixChanged.add(this._updateViewerPosition, this)
  }

    /**
     * Set HTML content of the annotation
     * @param {String|Element} value - HTML content
     * @return {undefined}
     */
  setContent (value) {
    const displayValue = this.element.style.display
    if (displayValue === 'none') {
      this.element.style.left = '-10000px'
      this.element.style.display = 'block'
    }

    if (value instanceof window.Element) {
      this.element.innerHTML = ''
      this.element.appendChild(value)
    } else {
      this.element.innerHTML = value
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
  setVisibility (value) {
    this.visible = value
    this.updateVisibility()
  }

  getVisibility () {
    return this.visible && this.component.visible
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

    s.opacity = 1 - smoothstep(
            this.viewer.scene.fog.near,
            this.viewer.scene.fog.far,
            this._cameraPosition.length()
        )

    this.stage.viewerControls.getPositionOnCanvas(vp, cp)

    s.bottom = (this.offsetX + cp.y + cr.height / 2) + 'px'
    s.left = (this.offsetY + cp.x - cr.width / 2) + 'px'
  }

    /**
     * Safely remove the annotation
     * @return {undefined}
     */
  dispose () {
    this.viewer.container.removeChild(this.element)
    this.viewer.signals.ticked.remove(this._update, this)
    this.component.signals.matrixChanged.remove(this._updateViewerPosition, this)
  }
}

export default Annotation
