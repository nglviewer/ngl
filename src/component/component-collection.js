/**
 * @file Component Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Collection from './collection.js'

class ComponentCollection extends Collection {
  addRepresentation (name, params) {
    return this._invoke('addRepresentation', [ name, params ])
  }

  autoView (duration) {
    return this._invoke('autoView', [ duration ])
  }
}

export default ComponentCollection
