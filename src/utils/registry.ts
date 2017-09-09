/**
 * @file Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils'

function toLowerCaseString (value: string) {
  return defaults(value, '').toString().toLowerCase()
}

export default class Registry {
  name: string
  private _dict: {[k: string]: any}

  constructor (name: string) {
    this.name = name
    this._dict = {}
  }

  add (key: string, value: any) {
    this._dict[ toLowerCaseString(key) ] = value
  }

  get (key: string) {
    return this._dict[ toLowerCaseString(key) ]
  }

  get names () {
    return Object.keys(this._dict)
  }
}