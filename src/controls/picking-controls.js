/**
 * @file Picking Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import PickingProxy from './picking-proxy.js'

/**
 * Picking controls
 */
class PickingControls {
  constructor (stage/*, params */) {
    this.stage = stage
    this.viewer = stage.viewer
  }

  /**
   * get picking data
   * @param {Number} x - canvas x coordinate
   * @param {Number} y - canvas y coordinate
   * @return {PickingProxy|undefined} picking proxy
   */
  pick (x, y) {
    const pickingData = this.viewer.pick(x, y)

    if (pickingData.picker &&
        pickingData.picker.type !== 'ignore' &&
        pickingData.pid !== undefined
    ) {
      const pickerArray = pickingData.picker.array
      if (pickerArray && pickingData.pid >= pickerArray.length) {
        console.error('pid >= picker.array.length')
      } else {
        return new PickingProxy(pickingData, this.stage)
      }
    }
  }
}

export default PickingControls
