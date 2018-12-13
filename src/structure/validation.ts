/**
 * @file Validation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Color } from 'three'

import { Debug, Log } from '../globals'
import { defaults } from '../utils'
import { ClashPicker } from '../utils/picker'
import { uniformArray3 } from '../math/array-utils'
import { guessElement } from '../structure/structure-utils'
import AtomProxy from '../proxy/atom-proxy'
import Structure from '../structure/structure'

function getNamedItem(a: NamedNodeMap, name: string) {
  const item = a.getNamedItem(name)
  return item !== null ? item.value : ''
}

function getSele (a: NamedNodeMap, atomname?: string, useAltcode = false) {
  const icode = getNamedItem(a, 'icode').trim()
  const chain = getNamedItem(a, 'chain').trim()
  const altcode = getNamedItem(a, 'altcode')
  let sele = getNamedItem(a, 'resnum')
  if (icode) sele += '^' + icode
  if (chain) sele += ':' + chain
  if (atomname) sele += '.' + atomname
  if (useAltcode && altcode.trim()) sele += '%' + altcode
  sele += '/' + (parseInt(getNamedItem(a, 'model')) - 1)
  return sele
}

function getResSele (a: NamedNodeMap) {
  const chain = getNamedItem(a, 'chain').trim()
  const rescode = getNamedItem(a, 'rescode')
  const resnum = getNamedItem(a, 'resnum')
  let sele = `[${rescode}]${resnum}`
  if (chain) sele += `:${chain}`
  return sele
}

function setBitDict (dict: { [k: string]: number }, key: string, bit: number) {
  if (dict[ key ] === undefined) {
    dict[ key ] = bit
  } else {
    dict[ key ] |= bit
  }
}

function hasAttrValue (attr: Attr|null, value: string) {
  return attr !== null && attr.value === value
}

function getAtomSele (ap: AtomProxy) {
  const icode = ap.inscode
  const chain = ap.chainname
  const atomname = ap.atomname
  const altcode = ap.altloc
  let sele = ap.resno + ''
  if (icode) sele += '^' + icode
  if (chain) sele += ':' + chain
  if (atomname) sele += '.' + atomname
  if (altcode) sele += '%' + altcode
  sele += '/' + ap.modelIndex
  return sele
}

function getProblemCount (clashDict: { [k: string]: { [k: string]: string } }, g: Element, ga: NamedNodeMap) {
  let geoProblemCount = 0

  const clashes = g.getElementsByTagName('clash')
  for (let j = 0, jl = clashes.length; j < jl; ++j) {
    if (clashDict[ getNamedItem(clashes[ j ].attributes, 'cid') ]) {
      geoProblemCount += 1
      break
    }
  }

  const angleOutliers = g.getElementsByTagName('angle-outlier')
  if (angleOutliers.length > 0) {
    geoProblemCount += 1
  }

  const bondOutliers = g.getElementsByTagName('bond-outlier')
  if (bondOutliers.length > 0) {
    geoProblemCount += 1
  }

  const planeOutliers = g.getElementsByTagName('plane-outlier')
  if (planeOutliers.length > 0) {
    geoProblemCount += 1
  }

  if (hasAttrValue(ga.getNamedItem('rota'), 'OUTLIER')) {
    geoProblemCount += 1
  }

  if (hasAttrValue(ga.getNamedItem('rama'), 'OUTLIER')) {
    geoProblemCount += 1
  }

  if (hasAttrValue(ga.getNamedItem('RNApucker'), 'outlier')) {
    geoProblemCount += 1
  }

  return geoProblemCount
}

class Validation {
  rsrzDict: { [k: string]: number } = {}
  rsccDict: { [k: string]: number } = {}
  /**
   * Random Coil Index (RCI) - evaluates the proximity of residue structural
   * and dynamic properties to the properties of flexible random coil regions
   * from NMR chemical shifts.
   *
   * Mark V. Berjanskii and David S. Wishart (2005)
   * A Simple Method To Predict Protein Flexibility Using Secondary Chemical Shifts
   * J. Am. Chem. Soc., 2005, 127 (43), pp 14970–14971
   * http://pubs.acs.org/doi/abs/10.1021/ja054842f
   *
   * Mark V. Berjanskii and David S. Wishart (2008)
   * Application of the random coil index to studying protein flexibility.
   * J Biomol NMR. 2008 Jan;40(1):31-48. Epub 2007 Nov 6.
   * http://www.springerlink.com/content/2966482w10306126/
   */
  rciDict: { [k: string]: number } = {}
  clashDict: { [k: string]: { [k: string]: string } } = {}
  clashArray: { [k: string]: string }[] = []
  geoDict: { [k: string]: number } = {}
  geoAtomDict: { [k: string]: { [k: string]: number } } = {}
  atomDict: { [k: string]: boolean|number } = {}
  clashSele = 'NONE'

  constructor (readonly name: string, readonly path: string) {}

  get type () { return 'validation' }

  fromXml (xml: XMLDocument) {
    if (Debug) Log.time('Validation.fromXml')

    const rsrzDict = this.rsrzDict
    const rsccDict = this.rsccDict
    const rciDict = this.rciDict
    const clashDict = this.clashDict
    const clashArray = this.clashArray
    const geoDict = this.geoDict
    const geoAtomDict = this.geoAtomDict
    const atomDict = this.atomDict

    const entries = xml.getElementsByTagName('Entry')
    if (entries.length === 1) {
      const chemicalShiftLists = entries[0].getElementsByTagName('chemical_shift_list')
      if (chemicalShiftLists.length === 1) {
        const randomCoilIndices = chemicalShiftLists[0].getElementsByTagName('random_coil_index')
        for (let j = 0, jl = randomCoilIndices.length; j < jl; ++j) {
          const rcia = randomCoilIndices[ j ].attributes
          const sele = getResSele(rcia)
          rciDict[ sele ] = parseFloat(getNamedItem(rcia, 'value'))
        }
      }
    }

    const groups = xml.getElementsByTagName('ModelledSubgroup')

    const _clashDict: { [k: string]: { [k: string]: string } } = {}
    const clashList: string[] = []

    if (Debug) Log.time('Validation.fromXml#clashDict')

    for (let i = 0, il = groups.length; i < il; ++i) {
      const g = groups[ i ]
      const ga = g.attributes

      const sele = getSele(ga)
      if (ga.getNamedItem('rsrz') !== null) {
        rsrzDict[ sele ] = parseFloat(getNamedItem(ga, 'rsrz'))
      }
      if (ga.getNamedItem('rscc') !== null) {
        rsccDict[ sele ] = parseFloat(getNamedItem(ga, 'rscc'))
      }
      const seleAttr = xml.createAttribute('sele')
      seleAttr.value = sele
      ga.setNamedItem(seleAttr)

      const clashes = g.getElementsByTagName('clash')

      for (let j = 0, jl = clashes.length; j < jl; ++j) {
        const ca = clashes[ j ].attributes
        const atom = getNamedItem(ca, 'atom')

        if (guessElement(atom) !== 'H') {
          const cid = getNamedItem(ca, 'cid')
          const atomSele = getSele(ga, atom, true)
          atomDict[ atomSele ] = true

          if (_clashDict[ cid ] === undefined) {
            _clashDict[ cid ] = {
              sele1: atomSele,
              res1: sele
            }
          } else {
            const c = _clashDict[ cid ]
            if (c.res1 !== sele) {
              c.sele2 = atomSele
              c.res2 = sele
              clashList.push(c.res1, sele)
              clashDict[ cid ] = c
              clashArray.push(c)
            }
          }
        }
      }
    }

    if (Debug) Log.timeEnd('Validation.fromXml#clashDict')

    for (let i = 0, il = groups.length; i < il; ++i) {
      const g = groups[ i ]
      const ga = g.attributes

      const sele = getNamedItem(ga, 'sele')
      const isPolymer = getNamedItem(ga, 'seq') !== '.'

      if (isPolymer) {
        const geoProblemCount = getProblemCount(clashDict, g, ga)
        if (geoProblemCount > 0) {
          geoDict[ sele ] = geoProblemCount
        }
      } else {
        const clashes = g.getElementsByTagName('clash')
        const mogBondOutliers = g.getElementsByTagName('mog-bond-outlier')
        const mogAngleOutliers = g.getElementsByTagName('mog-angle-outlier')

        if (mogBondOutliers.length > 0 || mogAngleOutliers.length > 0 || clashes.length > 0) {
          const atomDict = {}
          geoAtomDict[ sele ] = atomDict

          for (let j = 0, jl = clashes.length; j < jl; ++j) {
            const ca = clashes[ j ].attributes
            if (clashDict[ getNamedItem(ca, 'cid') ]) {
              setBitDict(atomDict, getNamedItem(ca, 'atom'), 1)
            }
          }

          for (let j = 0, jl = mogBondOutliers.length; j < jl; ++j) {
            const mbo = mogBondOutliers[ j ].attributes
            getNamedItem(mbo, 'atoms').split(',').forEach(function (atomname) {
              setBitDict(atomDict, atomname, 2)
            })
          }

          for (let j = 0, jl = mogAngleOutliers.length; j < jl; ++j) {
            const mao = mogAngleOutliers[ j ].attributes
            getNamedItem(mao, 'atoms').split(',').forEach(function (atomname) {
              setBitDict(atomDict, atomname, 4)
            })
          }
        }
      }
    }

    this.clashSele = clashList.length ? clashList.join(' OR ') : 'NONE'

    if (Debug) Log.timeEnd('Validation.fromXml')
  }

  getClashData (params: { color: number|string|Color, structure: Structure }) {
    if (Debug) Log.time('Validation.getClashData')

    const p = params || {}

    const s = p.structure
    const atomSet = s.atomSet!  // TODO
    const c = new Color(defaults(p.color, '#f0027f'))

    const ap1 = s.getAtomProxy()
    const ap2 = s.getAtomProxy()
    const vDir = new Vector3()
    const vPos1 = new Vector3()
    const vPos2 = new Vector3()

    const clashArray = this.clashArray
    const n = clashArray.length

    const position1 = new Float32Array(n * 3)
    const position2 = new Float32Array(n * 3)
    const color = uniformArray3(n, c.r, c.g, c.b) as Float32Array
    const radius = new Float32Array(n)
    const picking = new Float32Array(n)

    if (Debug) Log.time('Validation.getClashData#atomDict')

    const atomDict = this.atomDict

    s.eachAtom(function (ap) {
      const sele = getAtomSele(ap)
      if (atomDict[ sele ] === true) {
        atomDict[ sele ] = ap.index
      }
    })

    if (Debug) Log.timeEnd('Validation.getClashData#atomDict')

    let i = 0

    clashArray.forEach(function (c, idx) {
      ap1.index = atomDict[ c.sele1 ] as number  // TODO
      ap2.index = atomDict[ c.sele2 ] as number  // TODO

      if (ap1.index === undefined || ap2.index === undefined ||
          !atomSet.isSet(ap1.index, ap2.index)) return

      vDir.subVectors(ap2 as any, ap1 as any).setLength(ap1.vdw)  // TODO
      vPos1.copy(ap1 as any).add(vDir)  // TODO

      vDir.subVectors(ap1 as any, ap2 as any).setLength(ap2.vdw)  // TODO
      vPos2.copy(ap2 as any).add(vDir)  // TODO

      const dHalf = ap1.distanceTo(ap2) / 2
      const r1 = Math.sqrt(ap1.vdw * ap1.vdw - dHalf * dHalf)
      const r2 = Math.sqrt(ap2.vdw * ap2.vdw - dHalf * dHalf)

      vPos1.toArray(position1 as any, i * 3)  // TODO
      vPos2.toArray(position2 as any, i * 3)
      radius[ i ] = (r1 + r2) / 2
      picking[ i ] = idx

      ++i
    })

    if (Debug) Log.timeEnd('Validation.getClashData')

    return {
      position1: position1.subarray(0, i * 3),
      position2: position2.subarray(0, i * 3),
      color: color.subarray(0, i * 3),
      color2: color.subarray(0, i * 3),
      radius: radius.subarray(0, i),
      picking: new ClashPicker(picking.subarray(0, i), this, s)
    }
  }
}

export default Validation
