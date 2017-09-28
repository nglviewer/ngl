/**
 * @file Geometry Group
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Box3 } from '../../lib/three.es6.js'

class GeometryGroup {
  constructor (geometryList) {
    this.geometryList = geometryList
    this.boundingBox = null
  }

  computeBoundingBox () {
    if (!this.boundingBox) {
      this.boundingBox = new Box3()
    } else {
      this.boundingBox.empty()
    }

    this.geometryList.forEach(geo => {
      if (!geo.boundingBox) geo.computeBoundingBox()
      this.boundingBox.union(geo.boundingBox)
    })
  }
}

export default GeometryGroup
