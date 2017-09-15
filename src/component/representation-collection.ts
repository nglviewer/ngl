/**
 * @file Component Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color } from 'three'

import RepresentationElement from './representation-element'
import Collection from './collection.js'

class RepresentationCollection extends Collection<RepresentationElement> {
  setParameters (params: any) {
    return this.forEach((repr) => repr.setParameters(params))
  }

  setVisibility (value: boolean) {
    return this.forEach((repr) => repr.setVisibility(value))
  }

  setSelection (string: string) {
    return this.forEach((repr) => repr.setSelection(string))
  }

  setColor (color: number|string|Color) {
    return this.forEach((repr) => repr.setColor(color))
  }
}

export default RepresentationCollection
