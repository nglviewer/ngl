/**
 * @file Animation Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Stage from './stage'
import Viewer from '../viewer/viewer'
import Stats from '../viewer/stats'
import AnimationControls from '../controls/animation-controls'

class AnimationBehavior {
  viewer: Viewer
  animationControls: AnimationControls

  constructor (readonly stage: Stage) {
    this.viewer = stage.viewer
    this.animationControls = stage.animationControls

    this.viewer.signals.ticked.add(this._onTick, this)
  }

  _onTick (stats: Stats) {
    this.animationControls.run(stats)
  }

  dispose () {
    this.viewer.signals.ticked.remove(this._onTick, this)
  }
}

export default AnimationBehavior
