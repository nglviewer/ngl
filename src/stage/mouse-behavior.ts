/**
 * @file Mouse Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Stage from './stage'
import MouseObserver from './mouse-observer'
import Viewer from '../viewer/viewer'
import MouseControls from '../controls/mouse-controls'

class MouseBehavior {
  viewer: Viewer
  mouse: MouseObserver
  controls: MouseControls
  domElement: HTMLCanvasElement

  constructor (readonly stage: Stage) {
    this.stage = stage
    this.mouse = stage.mouseObserver
    this.controls = stage.mouseControls

    this.mouse.signals.moved.add(this._onMove, this)
    this.mouse.signals.scrolled.add(this._onScroll, this)
    this.mouse.signals.dragged.add(this._onDrag, this)
    this.mouse.signals.clicked.add(this._onClick, this)
    this.mouse.signals.hovered.add(this._onHover, this)
    this.mouse.signals.doubleClicked.add(this._onDblclick, this)
  }

  _onMove (/* x, y */) {
    this.stage.tooltip.style.display = 'none'
  }

  _onScroll (delta: number) {
    this.controls.run('scroll', delta)
  }

  _onDrag (dx: number, dy: number) {
    this.controls.run('drag', dx, dy)
  }

  _onClick (x: number, y: number) {
    this.controls.run('click', x, y)
  }

  _onDblclick (x: number, y: number) {
    this.controls.run('doubleClick', x, y)
  }

  _onHover (x: number, y: number) {
    this.controls.run('hover', x, y)
  }

  dispose () {
    this.mouse.signals.moved.remove(this._onMove, this)
    this.mouse.signals.scrolled.remove(this._onScroll, this)
    this.mouse.signals.dragged.remove(this._onDrag, this)
    this.mouse.signals.clicked.remove(this._onClick, this)
    this.mouse.signals.hovered.remove(this._onHover, this)
  }
}

export default MouseBehavior
