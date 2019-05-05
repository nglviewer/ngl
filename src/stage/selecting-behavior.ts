/**
 * @file Selecting Behavior
 * @author Lily Wang <lily.wang@anu.edu.au>
 * @private
 */

import Stage from './stage'
import MouseObserver from './mouse-observer'
import Viewer from '../viewer/viewer'
import MouseControls from '../controls/mouse-controls'

class PickingBehavior {
  viewer: Viewer
  mouse: MouseObserver
  controls: MouseControls

  constructor (readonly stage: Stage) {
    this.stage = stage
    this.mouse = stage.mouseObserver
    this.controls = stage.mouseControls

    this.mouse.signals.clicked.add(this._onClick, this)
    this.mouse.signals.dragged.add(this._onDragXY, this)
    this.mouse.signals.doubleClicked.add(this._onDoubleClick, this)
  }

  _onClick (x: number, y: number) {
    const pickingProxy = this.stage.pickingControls.pick(x, y)
    this.stage.signals.clicked.dispatch(pickingProxy)
    this.controls.run('clickPick', pickingProxy)
  }

  _onDragXY (x0: number, y0: number, x1: number, y1: number) {
    const pickedProxies = this.stage.pickingControls.pickAll(x0, y0, x1-x0, y1-y0)
    this.controls.run('select')

    
  }

  _onMouseDown (x: number, y: number) {

  }

  dispose () {
    this.mouse.signals.clicked.remove(this._onClick, this)
    this.mouse.signals.hovered.remove(this._onHover, this)
  }
}

export default PickingBehavior
