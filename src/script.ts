/**
 * @file Script
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Signal } from 'signals'

import { Log } from './globals'
import Stage from './stage/stage'

export interface ScriptSignals {
  elementAdded: Signal
  elementRemoved: Signal
  nameChanged: Signal
}

/**
 * Script class
 */
class Script {
  readonly signals: ScriptSignals = {
    elementAdded: new Signal(),
    elementRemoved: new Signal(),
    nameChanged: new Signal()
  }

  readonly dir: string
  readonly fn: Function

  readonly type = 'Script'

  /**
   * Create a script instance
   * @param {String} functionBody - the function source
   * @param {String} name - name of the script
   * @param {String} path - path of the script
   */
  constructor (functionBody: string, readonly name: string, readonly path: string) {
    this.dir = path.substring(0, path.lastIndexOf('/') + 1)

    try {
      /* eslint-disable no-new-func */
      this.fn = new Function('stage', '__name', '__path', '__dir', functionBody)
    } catch (e) {
      Log.error('Script compilation failed', e)
      this.fn = function () {}
    }
  }

  /**
   * Execute the script
   * @param  {Stage} stage - the stage context
   * @return {Promise} - resolve when script finished running
   */
  run (stage: Stage) {
    return new Promise((resolve, reject) => {
      try {
        this.fn.apply(null, [ stage, this.name, this.path, this.dir ])
        resolve()
      } catch (e) {
        Log.error('Script.fn', e)
        reject(e)
      }
    })
  }
}

export default Script
