/**
 * @file Selection Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color } from 'three'

import { ColormakerRegistry } from '../globals'
import Selection from '../selection/selection'
import Colormaker, { ColormakerParameters } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'
import Structure from '../structure/structure'

export type SelectionSchemeData = [ any, string, ColormakerParameters|undefined ]

/**
 * Color based on {@link Selection}
 */
class SelectionColormaker extends Colormaker {
  colormakerList: any[] = []  // TODO
  selectionList: Selection[] = []

  constructor (params: { structure: Structure, dataList: SelectionSchemeData[] } & Partial<ColormakerParameters>) {
    super(params)

    const dataList = params.dataList || []

    dataList.forEach((data: SelectionSchemeData) => {
      const [ scheme, sele, params = {} ] = data

      if (ColormakerRegistry.hasScheme(scheme)) {
        Object.assign(params, {
          scheme: scheme,
          structure: this.parameters.structure
        })
      } else {
        Object.assign(params, {
          scheme: 'uniform',
          value: new Color(scheme).getHex()
        })
      }

      this.colormakerList.push(ColormakerRegistry.getScheme(params as { scheme: string } & ColormakerParameters))
      this.selectionList.push(new Selection(sele))
    })
  }

  // NOT NEEDED @manageColor
  atomColor (a: AtomProxy) {
    for (let i = 0, n = this.selectionList.length; i < n; ++i) {
      const test = this.selectionList[ i ].test
      if (test && test(a)) {
        return this.colormakerList[ i ].atomColor(a)
      }
    }

    return 0xFFFFFF
  }
}

export default SelectionColormaker
