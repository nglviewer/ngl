/**
 * @file Selection Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color } from '../../lib/three.es6.js'

import { ColormakerRegistry } from '../globals.js'
import Selection from '../selection/selection.js'
import Colormaker from './colormaker.js'

/**
 * Color based on {@link Selection}
 */
class SelectionColormaker extends Colormaker {
  constructor (params) {
    super(params)

    const dataList = params.dataList || []

    this.colormakerList = []
    this.selectionList = []

    dataList.forEach(pair => {
      const [ scheme, sele, params = {} ] = pair

      if (ColormakerRegistry.hasScheme(scheme)) {
        Object.assign(params, {
          scheme: scheme,
          structure: this.structure
        })
      } else {
        Object.assign(params, {
          scheme: 'uniform',
          value: new Color(scheme).getHex()
        })
      }

      this.colormakerList.push(ColormakerRegistry.getScheme(params))
      this.selectionList.push(new Selection(sele))
    })
  }

  atomColor (a) {
    for (let i = 0, n = this.selectionList.length; i < n; ++i) {
      if (this.selectionList[ i ].test(a)) {
        return this.colormakerList[ i ].atomColor(a)
      }
    }

    return 0xFFFFFF
  }
}

export default SelectionColormaker
