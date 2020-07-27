/**
 * @file Geometry Group
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Box3, BufferGeometry } from 'three'

class GeometryGroup {
  geometryList: BufferGeometry[]
  boundingBox: Box3

  constructor (geometryList: BufferGeometry[] = []) {
    this.geometryList = geometryList
  }

  computeBoundingBox () {
    if (!this.boundingBox) {
      this.boundingBox = new Box3()
    } else {
      this.boundingBox.empty()
    }

    this.geometryList.forEach(geo => {
      if (!geo.boundingBox) geo.computeBoundingBox()
      this.boundingBox.union(geo.boundingBox as Box3)
    })
  }
}

export default GeometryGroup
