/**
 * @file Key Actions
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Stage from '../stage/stage'

export type KeyActionCallback = (stage: Stage) => void

/**
 * Key actions provided as static methods
 */
class KeyActions {
  /**
   * Stage auto view
   */
  static autoView (stage: Stage) {
    stage.autoView(1000)
  }

  /**
   * Toggle stage animations
   */
  static toggleAnimations (stage: Stage) {
    stage.animationControls.toggle()
  }

  /**
   * Toggle stage rocking
   */
  static toggleRock (stage: Stage) {
    stage.toggleRock()
  }

  /**
   * Toggle stage spinning
   */
  static toggleSpin (stage: Stage) {
    stage.toggleSpin()
  }

  /**
   * Toggle anti-aliasing
   */
  static toggleAntialiasing (stage: Stage) {
    const p = stage.getParameters()
    stage.setParameters({ sampleLevel: p.sampleLevel === -1 ? 0 : -1 })
  }
}

type KeyActionPreset = [ string, KeyActionCallback ][]
export const KeyActionPresets = {
  default: [
    [ 'i', KeyActions.toggleSpin ],
    [ 'k', KeyActions.toggleRock ],
    [ 'p', KeyActions.toggleAnimations ],
    [ 'a', KeyActions.toggleAntialiasing ],
    [ 'r', KeyActions.autoView ]
  ] as KeyActionPreset
}

export default KeyActions
