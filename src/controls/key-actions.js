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
   * Stage auto view
   * @param {Stage} stage - the stage
   * @return {undefined}
   */
  static autoView (stage) {
    stage.autoView(1000)
  }

  /**
   * Toggle stage animations
   * @param {Stage} stage - the stage
   * @return {undefined}
   */
  static toggleAnimations (stage) {
    stage.animationControls.toggle()
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
   * Toggle stage spinning
   * @param {Stage} stage - the stage
   * @return {undefined}
   */
  static toggleSpin (stage) {
    stage.toggleSpin()
  }
}

const KeyActionPresets = {
  default: [
    [ 'i', KeyActions.toggleSpin ],
    [ 'k', KeyActions.toggleRock ],
    [ 'p', KeyActions.toggleAnimations ],
    [ 'r', KeyActions.autoView ]
  ]
}

export default KeyActions

export {
  KeyActionPresets
}
