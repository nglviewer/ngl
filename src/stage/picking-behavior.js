/**
 * @file Picking Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

class PickingBehavior {
  constructor (stage) {
    this.stage = stage
    this.mouse = stage.mouseObserver
    this.controls = stage.mouseControls

    this.mouse.signals.clicked.add(this._onClick, this)
    this.mouse.signals.hovered.add(this._onHover, this)
  }

  _onClick (x, y) {
    const pickingProxy = this.stage.pickingControls.pick(x, y)
    this.stage.signals.clicked.dispatch(pickingProxy)
    this.controls.run('clickPick', pickingProxy)
  }

  _onHover (x, y) {
    const pickingProxy = this.stage.pickingControls.pick(x, y)
    if (pickingProxy && this.mouse.down.equals(this.mouse.position)) {
      this.stage.transformComponent = pickingProxy.component
      this.stage.transformAtom = pickingProxy.atom
    }
    this.stage.signals.hovered.dispatch(pickingProxy)
    this.controls.run('hoverPick', pickingProxy)
  }

  dispose () {
    this.mouse.signals.clicked.remove(this._onClick, this)
    this.mouse.signals.hovered.remove(this._onHover, this)
  }
}

export default PickingBehavior
