/**
 * @file Mouse Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { MouseActionPresets, MouseActionCallback } from './mouse-actions'
import Stage from '../stage/stage'
import MouseObserver from '../stage/mouse-observer'

export type MouseControlPreset = keyof typeof MouseActionPresets
export interface MouseControlsParams {
  preset?: MouseControlPreset
  disabled?: boolean
}

export type MouseActionType = ''|'scroll'|'drag'|'click'|'doubleClick'|'hover'|'clickPick'|'hoverPick'
export interface MouseAction {
  type: MouseActionType
  key: number
  button: number
  callback: MouseActionCallback
}

/**
 * Strings to describe mouse events (including optional keyboard modifiers).
 * Must contain an event type: "scroll", "drag", "click", "doubleClick",
 * "hover", "clickPick" or "hoverPick". Optionally contain one or more
 * (seperated by plus signs) keyboard modifiers: "alt", "ctrl", "meta" or
 * "shift". Can contain the mouse button performing the event: "left",
 * "middle" or "right". The type, key and button parts must be seperated by
 * dashes.
 *
 * @example
 * // triggered on scroll event (no key or button)
 * "scroll"
 *
 * @example
 * // triggered on scroll event while shift key is pressed
 * "scroll-shift"
 *
 * @example
 * // triggered on drag event with left mouse button
 * "drag-left"
 *
 * @example
 * // triggered on drag event with right mouse button
 * // while ctrl and shift keys are pressed
 * "drag-right-ctrl+shift"
 *
 * @typedef {String} TriggerString
 */

/**
 * Get event type, key and button
 * @param  {TriggerString} str - input trigger string
 * @return {Array} event type, key and button
 */
function triggerFromString (str: string) {
  const tokens = str.split(/[-+]/)

  let type = ''
  if (tokens.includes('scroll')) type = 'scroll'
  if (tokens.includes('drag')) type = 'drag'
  if (tokens.includes('click')) type = 'click'
  if (tokens.includes('doubleClick')) type = 'doubleClick'
  if (tokens.includes('hover')) type = 'hover'
  if (tokens.includes('clickPick')) type = 'clickPick'
  if (tokens.includes('hoverPick')) type = 'hoverPick'

  let key = 0
  if (tokens.includes('alt')) key += 1
  if (tokens.includes('ctrl')) key += 2
  if (tokens.includes('meta')) key += 4
  if (tokens.includes('shift')) key += 8

  let button = 0
  if (tokens.includes('left')) button += 1
  if (tokens.includes('right')) button += 2
  if (tokens.includes('middle')) button += 4

  return [ type, key, button ] as [ MouseActionType, number, number ]
}

/**
 * Mouse controls
 */
class MouseControls {
  actionList: MouseAction[] = []
  mouse: MouseObserver

  disabled: boolean  // Flag to disable all actions

  /**
   * @param {Stage} stage - the stage object
   * @param {Object} [params] - the parameters
   * @param {String} params.preset - one of "default", "pymol", "coot"
   * @param {String} params.disabled - flag to disable all actions
   */
  constructor (readonly stage: Stage, params: MouseControlsParams = {}) {
    this.mouse = stage.mouseObserver
    this.disabled = params.disabled || false
    this.preset(params.preset || 'default')
  }

  run (type: MouseActionType, ...args: any[]) {
    if (this.disabled) return

    const key = this.mouse.key || 0
    const button = this.mouse.buttons || 0

    this.actionList.forEach(a => {
      if (a.type === type && a.key === key && a.button === button) {
        (a.callback as any)(this.stage, ...args)  // TODO
      }
    })
  }

  /**
   * Add a new mouse action triggered by an event, key and button combination.
   * The {@link MouseActions} class provides a number of static methods for
   * use as callback functions.
   *
   * @example
   * // change ambient light intensity on mouse scroll
   * // while the ctrl and shift keys are pressed
   * stage.mouseControls.add( "scroll-ctrl+shift", function( stage, delta ){
   *     var ai = stage.getParameters().ambientIntensity;
   *     stage.setParameters( { ambientIntensity: Math.max( 0, ai + delta / 50 ) } );
   * } );
   *
   * @example
   * // Call the MouseActions.zoomDrag method on mouse drag events
   * // with left and right mouse buttons simultaneous
   * stage.mouseControls.add( "drag-left+right", MouseActions.zoomDrag );
   *
   * @param {TriggerString} triggerStr - the trigger for the action
   * @param {function(stage: Stage, ...args: Any)} callback - the callback function for the action
   * @return {undefined}
   */
  add (triggerStr: string, callback: MouseActionCallback) {
    const [ type, key, button ] = triggerFromString(triggerStr)

    this.actionList.push({ type, key, button, callback })
  }

  /**
   * Remove a mouse action. The trigger string can contain an asterix (*)
   * as a wildcard for any key or mouse button. When the callback function
   * is given, only actions that call that function are removed.
   *
   * @example
   * // remove actions triggered solely by a scroll event
   * stage.mouseControls.remove( "scroll" );
   *
   * @example
   * // remove actions triggered by a scroll event, including
   * // those requiring a key pressed or mouse button used
   * stage.mouseControls.remove( "scroll-*" );
   *
   * @example
   * // remove actions triggered by a scroll event
   * // while the shift key is pressed
   * stage.mouseControls.remove( "scroll-shift" );
   *
   * @param {TriggerString} triggerStr - the trigger for the action
   * @param {Function} [callback] - the callback function for the action
   * @return {undefined}
   */
  remove (triggerStr: string, callback: MouseActionCallback) {
    const wildcard = triggerStr.includes('*')
    const [ type, key, button ] = triggerFromString(triggerStr)

    const actionList = this.actionList.filter(function (a) {
      return !(
        (a.type === type || (wildcard && type === '')) &&
        (a.key === key || (wildcard && key === 0)) &&
        (a.button === button || (wildcard && button === 0)) &&
        (a.callback === callback || callback === undefined)
      )
    })

    this.actionList = actionList
  }

  /**
   * Set mouse action preset
   * @param  {String} name - one of "default", "pymol", "coot"
   * @return {undefined}
   */
  preset (name: MouseControlPreset) {
    this.clear()

    const list = MouseActionPresets[ name ] || []

    list.forEach(action => this.add(action[0], action[1]))
  }

  /**
   * Remove all mouse actions
   * @return {undefined}
   */
  clear () {
    this.actionList.length = 0
  }
}

export default MouseControls
