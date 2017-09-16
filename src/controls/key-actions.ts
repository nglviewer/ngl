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
   * @param {Stage} stage - the stage
   * @return {undefined}
   */
  static autoView (stage: Stage) {
    stage.autoView(1000)
  }

  /**
   * Toggle stage animations
   * @param {Stage} stage - the stage
   * @return {undefined}
   */
  static toggleAnimations (stage: Stage) {
    stage.animationControls.toggle()
  }

  /**
   * Toggle stage rocking
   * @param {Stage} stage - the stage
   * @return {undefined}
   */
  static toggleRock (stage: Stage) {
    stage.toggleRock()
  }

  /**
   * Toggle stage spinning
   * @param {Stage} stage - the stage
   * @return {undefined}
   */
  static toggleSpin (stage: Stage) {
    stage.toggleSpin()
  }
}

type KeyActionPreset = [ string, KeyActionCallback ][]
export const KeyActionPresets = {
  default: [
    [ 'i', KeyActions.toggleSpin ],
    [ 'k', KeyActions.toggleRock ],
    [ 'p', KeyActions.toggleAnimations ],
    [ 'r', KeyActions.autoView ]
  ] as KeyActionPreset
}

export default KeyActions
