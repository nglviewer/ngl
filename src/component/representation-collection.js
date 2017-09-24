/**
 * @file Component Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Collection from './collection.js'

class RepresentationCollection extends Collection {
  setParameters (params) {
    return this._invoke('setParameters', [ params ])
  }

  setColor (color) {
    return this._invoke('setColor', [ color ])
  }
}

export default RepresentationCollection
