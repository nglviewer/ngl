/**
 * @file Validation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Color } from '../../lib/three.es6.js'

import { Debug, Log } from '../globals.js'
import { defaults } from '../utils.js'
import { ClashPicker } from '../utils/picker.js'
import { uniformArray3 } from '../math/array-utils.js'
import { guessElement } from '../structure/structure-utils.js'

function getSele (a, atomname, useAltcode) {
  const icode = a.icode.value
  const chain = a.chain.value
  const altcode = a.altcode.value
  let sele = a.resnum.value
  if (icode.trim()) sele += '^' + icode
  if (chain.trim()) sele += ':' + chain
  if (atomname) sele += '.' + atomname
  if (useAltcode && altcode.trim()) sele += '%' + altcode
  sele += '/' + (parseInt(a.model.value) - 1)
  return sele
}

function setBitDict (dict, key, bit) {
  if (dict[ key ] === undefined) {
    dict[ key ] = bit
  } else {
    dict[ key ] |= bit
  }
}

function hasAttrValue (attr, value) {
  return attr !== undefined && attr.value === value
}

function getAtomSele (ap) {
  const icode = ap.inscode
  const chain = ap.chainname
  const atomname = ap.atomname
  const altcode = ap.altloc
  let sele = ap.resno
  if (icode) sele += '^' + icode
  if (chain) sele += ':' + chain
  if (atomname) sele += '.' + atomname
  if (altcode) sele += '%' + altcode
  sele += '/' + ap.modelIndex
  return sele
}

function getProblemCount (clashDict, g, ga) {
  let geoProblemCount = 0

  const clashes = g.getElementsByTagName('clash')
  for (let j = 0, jl = clashes.length; j < jl; ++j) {
    if (clashDict[ clashes[ j ].attributes.cid.value ]) {
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

  if (hasAttrValue(ga.rota, 'OUTLIER')) {
    geoProblemCount += 1
  }

  if (hasAttrValue(ga.rama, 'OUTLIER')) {
    geoProblemCount += 1
  }

  if (hasAttrValue(ga.RNApucker, 'outlier')) {
    geoProblemCount += 1
  }

  return geoProblemCount
}

class Validation {
  constructor (name, path) {
    this.name = name
    this.path = path

    this.rsrzDict = {}
    this.rsccDict = {}
    this.clashDict = {}
    this.clashArray = []
    this.geoDict = {}
    this.geoAtomDict = {}
    this.atomDict = {}
    this.clashSele = 'NONE'
  }

  get type () { return 'validation' }

  fromXml (xml) {
    if (Debug) Log.time('Validation.fromXml')

    const rsrzDict = this.rsrzDict
    const rsccDict = this.rsccDict
    const clashDict = this.clashDict
    const clashArray = this.clashArray
    const geoDict = this.geoDict
    const geoAtomDict = this.geoAtomDict
    const atomDict = this.atomDict

    const groups = xml.getElementsByTagName('ModelledSubgroup')

    const _clashDict = {}
    const clashList = []

    if (Debug) Log.time('Validation.fromXml#clashDict')

    for (let i = 0, il = groups.length; i < il; ++i) {
      const g = groups[ i ]
      const ga = g.attributes

      const sele = getSele(ga)
      if (ga.rsrz !== undefined) {
        rsrzDict[ sele ] = parseFloat(ga.rsrz.value)
      }
      if (ga.rscc !== undefined) {
        rsccDict[ sele ] = parseFloat(ga.rscc.value)
      }
      ga.sele = sele

      const clashes = g.getElementsByTagName('clash')

      for (let j = 0, jl = clashes.length; j < jl; ++j) {
        const ca = clashes[ j ].attributes
        const atom = ca.atom.value

        if (guessElement(atom) !== 'H') {
          const cid = ca.cid.value
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

      const sele = ga.sele
      const isPolymer = ga.seq.value !== '.'

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
            if (clashDict[ ca.cid.value ]) {
              setBitDict(atomDict, ca.atom.value, 1)
            }
          }

          for (let j = 0, jl = mogBondOutliers.length; j < jl; ++j) {
            const mbo = mogBondOutliers[ j ].attributes
            mbo.atoms.value.split(',').forEach(function (atomname) {
              setBitDict(atomDict, atomname, 2)
            })
          }

          for (let j = 0, jl = mogAngleOutliers.length; j < jl; ++j) {
            const mao = mogAngleOutliers[ j ].attributes
            mao.atoms.value.split(',').forEach(function (atomname) {
              setBitDict(atomDict, atomname, 4)
            })
          }
        }
      }
    }

    this.clashSele = clashList.length ? clashList.join(' OR ') : 'NONE'

    if (Debug) Log.timeEnd('Validation.fromXml')
  }

  getClashData (params) {
    if (Debug) Log.time('Validation.getClashData')

    const p = params || {}

    const s = p.structure
    const atomSet = s.atomSet
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
    const color = uniformArray3(n, c.r, c.g, c.b)
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
      ap1.index = atomDict[ c.sele1 ]
      ap2.index = atomDict[ c.sele2 ]

      if (ap1.index === undefined || ap2.index === undefined ||
                !atomSet.isSet(ap1.index, ap2.index)) return

      vDir.subVectors(ap2, ap1).setLength(ap1.vdw)
      vPos1.copy(ap1).add(vDir)

      vDir.subVectors(ap1, ap2).setLength(ap2.vdw)
      vPos2.copy(ap2).add(vDir)

      const dHalf = ap1.distanceTo(ap2) / 2
      const r1 = Math.sqrt(ap1.vdw * ap1.vdw - dHalf * dHalf)
      const r2 = Math.sqrt(ap2.vdw * ap2.vdw - dHalf * dHalf)

      vPos1.toArray(position1, i * 3)
      vPos2.toArray(position2, i * 3)
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
