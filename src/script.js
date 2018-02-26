/**
 * @file Script
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Signal from '../lib/signals.es6.js'

import { Log } from './globals.js'

/**
 * Script class
 */
class Script {
  /**
   * Create a script instance
   * @param {String} functionBody - the function source
   * @param {String} name - name of the script
   * @param {String} path - path of the script
   */
  constructor (functionBody, name, path) {
    this.signals = {
      elementAdded: new Signal(),
      elementRemoved: new Signal(),
      nameChanged: new Signal()
    }

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
   * Object type
   * @readonly
   */
  get type () { return 'Script' }

  /**
   * Execute the script
   * @param  {Stage} stage - the stage context
   * @return {Promise} - resolve when script finished running
   */
  call (stage) {
    var panel = {
      add: function (/* element */) {
        this.signals.elementAdded.dispatch(arguments)
      }.bind(this),

      remove: function (/* element */) {
        this.signals.elementRemoved.dispatch(arguments)
      }.bind(this),

      setName: function (value) {
        this.signals.nameChanged.dispatch(value)
      }.bind(this)
    }

    return new Promise((resolve, reject) => {
      var args = [
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
