/**
 * @file Key Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { KeyActionPresets, KeyActionCallback } from './key-actions'
import Stage from '../stage/stage'

export type KeyControlPreset = keyof typeof KeyActionPresets
export interface KeyControlsParams {
  preset?: KeyControlPreset
  disabled?: boolean
}

export interface KeyAction {
  key: string,
  callback: KeyActionCallback
}

/**
 * Mouse controls
 */
class KeyControls {
  actionList: KeyAction[] = []

  disabled: boolean  // Flag to disable all actions

  /**
   * @param {Stage} stage - the stage object
   * @param {Object} [params] - the parameters
   * @param {String} params.preset - one of "default"
   * @param {String} params.disabled - flag to disable all actions
   */
  constructor (readonly stage: Stage, params: KeyControlsParams = {}) {
    this.disabled = params.disabled || false
    this.preset(params.preset || 'default')
  }

  run (key: string) {
    if (this.disabled) return

    this.actionList.forEach(a => {
      if (a.key === key) {
        a.callback(this.stage)
      }
    })
  }

  /**
   * Add a key action triggered by pressing the given character.
   * The {@link KeyActions} class provides a number of static methods for
   * use as callback functions.
   *
   * @example
   * // call KeyActions.toggleRock when "k" is pressed
   * stage.keyControls.remove( "k", KeyActions.toggleRock );
   *
   * @param {Char} char - the key/character
   * @param {Function} callback - the callback function for the action
   * @return {undefined}
   */
  add (char: string, callback: KeyActionCallback) {
    this.actionList.push({ key: char, callback })
  }

  /**
   * Remove a key action. When the callback function
   * is given, only actions that call that function are removed.
   *
   * @example
   * // remove all actions triggered by pressing "k"
   * stage.keyControls.remove( "k" );
   *
   * @example
   * // remove action `toggleRock` triggered by pressing "k"
   * stage.keyControls.remove( "k", toggleRock );
   *
   * @param {Char} char - the key/character
   * @param {Function} [callback] - the callback function for the action
   * @return {undefined}
   */
  remove (char: string, callback: KeyActionCallback) {

    const actionList = this.actionList.filter(function (a) {
      return !(
        (a.key === char) &&
        (a.callback === callback || callback === undefined)
      )
    })

    this.actionList = actionList
  }

  /**
   * Set key action preset
   * @param  {String} name - one of "default"
   * @return {undefined}
   */
  preset (name: KeyControlPreset) {
    this.clear()

    const list = KeyActionPresets[ name ] || []

    list.forEach(action => this.add(action[0], action[1]))
  }

  /**
   * Remove all key actions
   * @return {undefined}
   */
  clear () {
    this.actionList.length = 0
  }
}

export default KeyControls
