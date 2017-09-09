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

  readonly name: string
  readonly path: string
  readonly dir: string

  readonly fn: Function

  readonly type = 'Script'

  /**
   * Create a script instance
   * @param {String} functionBody - the function source
   * @param {String} name - name of the script
   * @param {String} path - path of the script
   */
  constructor (functionBody: string, name: string, path: string) {
    this.name = name
    this.path = path
    this.dir = path.substring(0, path.lastIndexOf('/') + 1)

    try {
      /* eslint-disable no-new-func */
      this.fn = new Function(
        'stage', 'panel',
        '__name__', '__path__', '__dir__',
        functionBody
      )
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
  call (stage: Stage) {
    const panel = {
      add: (...elements: any[]) => {
        this.signals.elementAdded.dispatch(elements)
      },

      remove: (...elements: any[]) => {
        this.signals.elementRemoved.dispatch(elements)
      },

      setName: (value: string) => {
        this.signals.nameChanged.dispatch(value)
      }
    }

    return new Promise((resolve, reject) => {
      const args = [
        stage, panel,
        this.name, this.path, this.dir
      ]

      try {
        this.fn.apply(null, args)
        resolve()
      } catch (e) {
        Log.error('Script.fn', e)
        reject(e)
      }
    })
  }
}

export default Script
