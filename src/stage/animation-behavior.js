/**
 * @file Animation Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

class AnimationBehavior {
  constructor (stage) {
    this.viewer = stage.viewer
    this.animationControls = stage.animationControls

    this.viewer.signals.ticked.add(this._onTick, this)
  }

  _onTick (stats) {
    this.animationControls.run(stats)
  }

  dispose () {
    this.viewer.signals.ticked.remove(this._onTick, this)
  }
}

export default AnimationBehavior
