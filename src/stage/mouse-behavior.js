/**
 * @file Mouse Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

class MouseBehavior {
  constructor (stage/*, params */) {
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

  _onScroll (delta) {
    this.controls.run('scroll', delta)
  }

  _onDrag (dx, dy) {
    this.controls.run('drag', dx, dy)
  }

  _onClick (x, y) {
    this.controls.run('click', x, y)
  }

  _onDblclick (x, y) {
    this.controls.run('doubleClick', x, y)
  }

  _onHover (x, y) {
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
