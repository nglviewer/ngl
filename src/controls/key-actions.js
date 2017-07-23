/**
 * @file Key Actions
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

/**
 * Key actions provided as static methods
 */
class KeyActions {
  /**
   * Toggle stage spinning
   * @param {Stage} stage - the stage
   * @return {undefined}
   */
  static toggleSpin (stage) {
    stage.toggleSpin()
  }

  /**
   * Toggle stage rocking
   * @param {Stage} stage - the stage
   * @return {undefined}
   */
  static toggleRock (stage) {
    stage.toggleRock()
  }

  /**
   * Toggle stage animations
   * @param {Stage} stage - the stage
   * @return {undefined}
   */
  static toggleAnimations (stage) {
    stage.animationControls.toggle()
  }
}

const KeyActionPresets = {
  default: [
    [ 'i', KeyActions.toggleSpin ],
    [ 'k', KeyActions.toggleRock ],
    [ 'p', KeyActions.toggleAnimations ]
  ]
}

export default KeyActions

export {
  KeyActionPresets
}
