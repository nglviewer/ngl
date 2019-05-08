/**
 * @file Selecting Behavior
 * @author Lily Wang <lily.wang@anu.edu.au>
 * @private
 */

import Stage from './stage'
import MouseObserver from './mouse-observer'
import Viewer from '../viewer/viewer'
import MouseControls from '../controls/mouse-controls'

class SelectingBehavior {
  viewer: Viewer
  mouse: MouseObserver
  controls: MouseControls

  constructor(readonly stage: Stage) {
    this.stage = stage
    this.mouse = stage.mouseObserver
    this.controls = stage.mouseControls

    // this.mouse.signals.clicked.add(this._onClick, this)
    this.mouse.signals.pressed.add(this._onPress, this)
    this.mouse.signals.draggedXY.add(this._onDragXY, this)
    this.mouse.signals.dropped.add(this._onDrop, this)
    // this.mouse.signals.doubleClicked.add(this._onDoubleClick, this)
  }

  // _onClick (x: number, y: number) {
  //   const pickingProxy = this.stage.pickingControls.pick(x, y)
  //   this.stage.signals.clicked.dispatch(pickingProxy)
  //   this.controls.run('clickPick', pickingProxy)
  // }

  _onPress(x: number, y: number) {
    this.controls.run('press', x, y)
  }

  _onDrop() {
    this.controls.run('drop')
  }

  _onDragXY(x1: number, y1: number) {
    // const sp = this.stage.getParameters() as any
    if (this.stage.dragSelection.isDown) {
      const x0 = this.stage.dragSelection.startPoint.x
      const y0 = this.stage.dragSelection.startPoint.y
      let pickedProxies = this.stage.pickingControls.pickAll(x0, y0, x1, y1)
      this.controls.run('dragXY', pickedProxies, x1, y1)
    }
  }

  // _onDoubleClick (x: number, y: number) {
  //   this.controls.run('doubleClick')
  // }

  dispose() {
    // this.mouse.signals.clicked.remove(this._onClick, this)
    this.mouse.signals.pressed.remove(this._onPress, this)
    this.mouse.signals.draggedXY.remove(this._onDragXY, this)
    this.mouse.signals.dropped.remove(this._onDrop, this)
    // this.mouse.signals.doubleClicked.remove(this._onDoubleClick, this)
  }
}

export default SelectingBehavior
