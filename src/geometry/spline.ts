/**
 * @file Spline
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { ColormakerRegistry } from '../globals'
import { AtomPicker } from '../utils/picker'
import RadiusFactory, { RadiusParams } from '../utils/radius-factory'
import { copyArray } from '../math/array-utils'
import { spline } from '../math/math-utils'
import Polymer from '../proxy/polymer';
import AtomProxy from '../proxy/atom-proxy';
import { ColormakerParameters } from '../color/colormaker';
import { NumberArray } from '../types';

export class Interpolator {
  
  m: number
  tension: number
  dt: number
  delta: number
  vec1: Vector3
  vec2: Vector3
  vDir: Vector3 
  vTan: Vector3
  vNorm: Vector3
  vBin: Vector3
  m2: number

  constructor (m: number, tension: number) {
    this.m = m
    this.tension = tension
    this.dt = 1.0 / this.m
    this.delta = 0.0001

    this.vec1 = new Vector3()
    this.vec2 = new Vector3()

    this.vDir = new Vector3()
    this.vTan = new Vector3()
    this.vNorm = new Vector3()
    this.vBin = new Vector3()
  
    this.m2 = Math.ceil(this.m / 2)
  }

  private interpolateToArr (v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3, t: number, arr: Float32Array, offset: number) {
    arr[ offset + 0 ] = spline(v0.x, v1.x, v2.x, v3.x, t, this.tension)
    arr[ offset + 1 ] = spline(v0.y, v1.y, v2.y, v3.y, t, this.tension)
    arr[ offset + 2 ] = spline(v0.z, v1.z, v2.z, v3.z, t, this.tension)
  }

  private interpolateToVec (v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3, t: number, vec: Vector3) {
    vec.x = spline(v0.x, v1.x, v2.x, v3.x, t, this.tension)
    vec.y = spline(v0.y, v1.y, v2.y, v3.y, t, this.tension)
    vec.z = spline(v0.z, v1.z, v2.z, v3.z, t, this.tension)
  }

  private interpolatePosition (v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3, pos: Float32Array, offset: number) {
    for (var j = 0; j < this.m; ++j) {
      var l = offset + j * 3
      var d = this.dt * j
      this.interpolateToArr(v0, v1, v2, v3, d, pos, l)
    }
  }

  private interpolateTangent (v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3, tan: Float32Array, offset: number) {
    for (var j = 0; j < this.m; ++j) {
      var d = this.dt * j
      var d1 = d - this.delta
      var d2 = d + this.delta
      var l = offset + j * 3
      // capping as a precaution
      if (d1 < 0) d1 = 0
      if (d2 > 1) d2 = 1
      //
      this.interpolateToVec(v0, v1, v2, v3, d1, this.vec1)
      this.interpolateToVec(v0, v1, v2, v3, d2, this.vec2)
      //
      this.vec2.sub(this.vec1).normalize()
      this.vec2.toArray(tan as any, l)
    }
  }

  private vectorSubdivide (interpolationFn: (v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3, array: Float32Array, offset: number) => void,
                            iterator: AtomIterator, array: Float32Array, offset: number, isCyclic: boolean) {
    let v0: Vector3
    let v1 = <Vector3>iterator.next()
    let v2 = <Vector3>iterator.next()
    let v3 = <Vector3>iterator.next()
    //
    const n = iterator.size
    const n1 = n - 1
    let k = offset || 0
    for (let i = 0; i < n1; ++i) {
      v0 = v1
      v1 = v2
      v2 = v3
      v3 = <Vector3>iterator.next()
      interpolationFn.apply(this, [v0, v1, v2, v3, array, k])
      k += 3 * this.m
    }
    if (isCyclic) {
      v0 = <Vector3>iterator.get(n - 2)
      v1 = <Vector3>iterator.get(n - 1)
      v2 = <Vector3>iterator.get(0)
      v3 = <Vector3>iterator.get(1)
      interpolationFn.apply(this, [v0, v1, v2, v3, array, k])
      k += 3 * this.m
    }
  }

  //

  public getPosition (iterator: AtomIterator, array: Float32Array, offset: number, isCyclic: boolean) {
    iterator.reset()
    this.vectorSubdivide(this.interpolatePosition, iterator, array, offset, isCyclic)
    var n1 = iterator.size - 1
    var k = n1 * this.m * 3
    if (isCyclic) k += this.m * 3
    var v = iterator.get(isCyclic ? 0 : n1)
    array[ k ] = v.x
    array[ k + 1 ] = v.y
    array[ k + 2 ] = v.z
  }

  public getTangent (iterator: AtomIterator, array: Float32Array, offset: number, isCyclic: boolean) {
    iterator.reset()
    this.vectorSubdivide(this.interpolateTangent, iterator, array, offset, isCyclic)
    const n1 = iterator.size - 1
    let k = n1 * this.m * 3
    if (isCyclic) k += this.m * 3
    copyArray(array, array, k - 3, k, 3)
  }

  private interpolateNormalDir (u0: Vector3, u1: Vector3, u2: Vector3, u3: Vector3,
                                v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3,
                                tan: Float32Array, norm: Float32Array, bin: Float32Array,
                                offset: number, shift: boolean) {
    for (let j = 0; j < this.m; ++j) {
      let l = offset + j * 3
      if (shift) l += this.m2 * 3
      const d = this.dt * j
      this.interpolateToVec(u0, u1, u2, u3, d, this.vec1)
      this.interpolateToVec(v0, v1, v2, v3, d, this.vec2)
      this.vDir.subVectors(this.vec2, this.vec1).normalize()
      this.vTan.fromArray(tan as any, l)
      this.vBin.crossVectors(this.vDir, this.vTan).normalize()
      this.vBin.toArray(bin as any, l)
      this.vNorm.crossVectors(this.vTan, this.vBin).normalize()
      this.vNorm.toArray(norm as any, l)
    }
  }

  private interpolateNormal (vDir: Vector3, tan: Float32Array, norm: Float32Array, bin: Float32Array, offset: number) {
    for (var j = 0; j < this.m; ++j) {
      var l = offset + j * 3
      vDir.copy(this.vNorm)
      this.vTan.fromArray(tan as any, l)
      this.vBin.crossVectors(vDir, this.vTan).normalize()
      this.vBin.toArray(bin as any, l)
      this.vNorm.crossVectors(this.vTan, this.vBin).normalize()
      this.vNorm.toArray(norm as any, l)
    }
  }

  public getNormal (size: number, tan: Float32Array, norm: Float32Array, bin: Float32Array, offset: number, isCyclic: boolean) {
    this.vNorm.set(0, 0, 1)
    const n = size
    const n1 = n - 1
    let k = offset || 0
    for (var i = 0; i < n1; ++i) {
      this.interpolateNormal(this.vDir, tan, norm, bin, k)
      k += 3 * this.m
    }
    if (isCyclic) {
      this.interpolateNormal(this.vDir, tan, norm, bin, k)
      k += 3 * this.m
    }
    this.vBin.toArray(bin as any, k)
    this.vNorm.toArray(norm as any, k)
  }

  public getNormalDir (iterDir1: AtomIterator, iterDir2: AtomIterator, tan: Float32Array, norm: Float32Array, bin: Float32Array, offset: number, isCyclic: boolean, shift: boolean) {
    iterDir1.reset()
    iterDir2.reset()
    //
    const vSub1 = new Vector3()
    const vSub2 = new Vector3()
    const vSub3 = new Vector3()
    const vSub4 = new Vector3()
    //
    const d1v1 = new Vector3()
    const d1v2 = new Vector3().copy(<Vector3>iterDir1.next())
    const d1v3 = new Vector3().copy(<Vector3>iterDir1.next())
    const d1v4 = new Vector3().copy(<Vector3>iterDir1.next())
    const d2v1 = new Vector3()
    const d2v2 = new Vector3().copy(<Vector3>iterDir2.next())
    const d2v3 = new Vector3().copy(<Vector3>iterDir2.next())
    const d2v4 = new Vector3().copy(<Vector3>iterDir2.next())
    //
    this.vNorm.set(0, 0, 1)
    let n = iterDir1.size
    let n1 = n - 1
    let k = offset || 0
    for (var i = 0; i < n1; ++i) {
      d1v1.copy(d1v2)
      d1v2.copy(d1v3)
      d1v3.copy(d1v4)
      d1v4.copy(<Vector3>iterDir1.next())
      d2v1.copy(d2v2)
      d2v2.copy(d2v3)
      d2v3.copy(d2v4)
      d2v4.copy(<Vector3>iterDir2.next())
      //
      if (i === 0) {
        vSub1.subVectors(d2v1, d1v1)
        vSub2.subVectors(d2v2, d1v2)
        if (vSub1.dot(vSub2) < 0) {
          vSub2.multiplyScalar(-1)
          d2v2.addVectors(d1v2, vSub2)
        }
        vSub3.subVectors(d2v3, d1v3)
        if (vSub2.dot(vSub3) < 0) {
          vSub3.multiplyScalar(-1)
          d2v3.addVectors(d1v3, vSub3)
        }
      } else {
        vSub3.copy(vSub4)
      }
      vSub4.subVectors(d2v4, d1v4)
      if (vSub3.dot(vSub4) < 0) {
        vSub4.multiplyScalar(-1)
        d2v4.addVectors(d1v4, vSub4)
      }
      this.interpolateNormalDir(
        d1v1, d1v2, d1v3, d1v4,
        d2v1, d2v2, d2v3, d2v4,
        tan, norm, bin, k, shift
      )
      k += 3 * this.m
    }
    if (isCyclic) {
      d1v1.copy(<Vector3>iterDir1.get(n - 2))
      d1v2.copy(<Vector3>iterDir1.get(n - 1))
      d1v3.copy(<Vector3>iterDir1.get(0))
      d1v4.copy(<Vector3>iterDir1.get(1))
      d2v1.copy(<Vector3>iterDir2.get(n - 2))
      d2v2.copy(<Vector3>iterDir2.get(n - 1))
      d2v3.copy(<Vector3>iterDir2.get(0))
      d2v4.copy(<Vector3>iterDir2.get(1))
      //
      vSub3.copy(vSub4)
      vSub4.subVectors(d2v4, d1v4)
      if (vSub3.dot(vSub4) < 0) {
        vSub4.multiplyScalar(-1)
        d2v4.addVectors(d1v4, vSub4)
      }
      this.interpolateNormalDir(
        d1v1, d1v2, d1v3, d1v4,
        d2v1, d2v2, d2v3, d2v4,
        tan, norm, bin, k, shift
      )
      k += 3 * this.m
    }
    if (shift) {
      // FIXME shift requires data from one this.more preceeding residue
      this.vBin.fromArray(bin as any, this.m2 * 3)
      this.vNorm.fromArray(norm as any, this.m2 * 3)
      for (var j = 0; j < this.m2; ++j) {
        this.vBin.toArray(bin as any, j * 3)
        this.vNorm.toArray(norm as any, j * 3)
      }
    } else {
      this.vBin.toArray(bin as any, k)
      this.vNorm.toArray(norm as any, k)
    }
  }

  //

  private interpolateColor (item1: AtomProxy, item2: AtomProxy, colFn: (...arg: any[]) => void, col: any, offset: number) {
    var j, l
    for (j = 0; j < this.m2; ++j) {
      l = offset + j * 3
      colFn.apply(this, [item1, col, l]) // itemColorToArray
    }
    for (j = this.m2; j < this.m; ++j) {
      l = offset + j * 3
      colFn.apply(this, [item2, col, l]) // itemColorToArray
    }
  }

  public getColor (iterator: AtomIterator, colFn: (...arg: any[]) => void, col: any, offset: number, isCyclic: boolean) {
    iterator.reset()
    iterator.next() // first element not needed
    let i0: AtomProxy
    let i1 = <AtomProxy>iterator.next()
    //
    var n = iterator.size
    var n1 = n - 1
    var k = offset || 0
    for (var i = 0; i < n1; ++i) {
      i0 = i1
      i1 = <AtomProxy>iterator.next()
      this.interpolateColor(i0, i1, colFn, col, k)
      k += 3 * this.m
    }
    if (isCyclic) {
      i0 = <AtomProxy>iterator.get(n - 1)
      i1 = <AtomProxy>iterator.get(0)
      this.interpolateColor(i0, i1, colFn, col, k)
      k += 3 * this.m
    }
    //
    col[ k ] = col[ k - 3 ]
    col[ k + 1 ] = col[ k - 2 ]
    col[ k + 2 ] = col[ k - 1 ]
  }

  //

  private interpolatePicking (item1: AtomProxy, item2: AtomProxy, pickFn: (item: AtomProxy) => number, pick: Float32Array, offset: number) {
    var j
    for (j = 0; j < this.m2; ++j) {
      pick[ offset + j ] = pickFn.apply(this, [item1])
    }
    for (j = this.m2; j < this.m; ++j) {
      pick[ offset + j ] = pickFn.apply(this, [item2])
    }
  }

  public getPicking (iterator: AtomIterator, pickFn: (item: AtomProxy) => number, pick: Float32Array, offset: number, isCyclic: boolean) {
    iterator.reset()
    iterator.next() // first element not needed
    let i0: AtomProxy
    let i1 = <AtomProxy>iterator.next()
    //
    const n = iterator.size
    const n1 = n - 1
    let k = offset || 0
    for (var i = 0; i < n1; ++i) {
      i0 = i1
      i1 = <AtomProxy>iterator.next()
      this.interpolatePicking(i0, i1, pickFn, pick, k)
      k += this.m
    }
    if (isCyclic) {
      i0 = <AtomProxy>iterator.get(n - 1)
      i1 = <AtomProxy>iterator.get(0)
      this.interpolatePicking(i0, i1, pickFn, pick, k)
      k += this.m
    }
    //
    pick[ k ] = pick[ k - 1 ]
  }

  //

  private interpolateSize (item1: AtomProxy, item2: AtomProxy, sizeFn: (item: AtomProxy) => number, size: Float32Array, offset: number) {
    const s1: number = sizeFn.apply(this, [item1])
    const s2: number = sizeFn.apply(this, [item2])
    for (let j = 0; j < this.m; ++j) {
      // linear interpolation
      let t = j / this.m
      size[ offset + j ] = (1 - t) * s1 + t * s2
    }
  }

  public getSize (iterator: AtomIterator, sizeFn: (item: AtomProxy) => number, size: Float32Array, offset: number, isCyclic: boolean) {
    iterator.reset()
    iterator.next() // first element not needed
    let i0: AtomProxy
    let i1: AtomProxy = <AtomProxy>iterator.next()
    //
    const n = iterator.size
    const n1 = n - 1
    let k = offset || 0
    for (var i = 0; i < n1; ++i) {
      i0 = i1
      i1 = <AtomProxy>iterator.next()
      this.interpolateSize(i0, i1, sizeFn, size, k)
      k += this.m
    }
    if (isCyclic) {
      i0 = <AtomProxy>iterator.get(n - 1)
      i1 = <AtomProxy>iterator.get(0)
      this.interpolateSize(i0, i1, sizeFn, size, k)
      k += this.m
    }
    //
    size[ k ] = size[ k - 1 ]
  }
}

export interface SplineParameters {
  directional?: boolean
  positionIterator?: boolean
  subdiv?: number
  smoothSheet?: boolean
  tension?: number
}
export interface AtomIterator {
  size: number,
  next: () => AtomProxy | Vector3,
  get: (idx: number) => AtomProxy | Vector3,
  reset: () => void
}
class Spline {

  polymer: Polymer
  size: number
  directional: boolean
  positionIterator: any
  subdiv: number
  smoothSheet: boolean
  tension: number
  interpolator: Interpolator

  constructor (polymer: Polymer, params?: SplineParameters) {
    this.polymer = polymer
      this.size = polymer.residueCount

      var p = params || {}
      this.directional = p.directional || false
      this.positionIterator = p.positionIterator || false
      this.subdiv = p.subdiv || 1
      this.smoothSheet = p.smoothSheet || false

      if (!p.tension) {
        this.tension = this.polymer.isNucleic() ? 0.5 : 0.9
      } else {
        this.tension = p.tension
      }

      this.interpolator = new Interpolator(this.subdiv, this.tension)
  }

  getAtomIterator (type: string, smooth?: boolean): AtomIterator {
    const polymer = this.polymer
    const structure = polymer.structure
    const n = polymer.residueCount

    let i = 0
    let j = -1

    const cache = [
      structure.getAtomProxy(),
      structure.getAtomProxy(),
      structure.getAtomProxy(),
      structure.getAtomProxy()
    ]

    const cache2 = [
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3()
    ]

    function next () {
      var atomProxy = get(j)
      j += 1
      return atomProxy
    }

    var apPrev = structure.getAtomProxy()
    var apNext = structure.getAtomProxy()

    function get (idx: number) {
      var atomProxy = cache[ i % 4 ]
      atomProxy.index = polymer.getAtomIndexByType(idx, type) as number
      if (smooth && idx > 0 && idx < n && atomProxy.sstruc === 'e') {
        var vec = cache2[ i % 4 ]
        apPrev.index = polymer.getAtomIndexByType(idx + 1, type) as number
        apNext.index = polymer.getAtomIndexByType(idx - 1, type) as number
        vec.addVectors(apPrev as any, apNext as any)
          .add(atomProxy as any).add(atomProxy as any)
          .multiplyScalar(0.25)
        i += 1
        return vec
      }
      i += 1
      return atomProxy
    }

    function reset () {
      i = 0
      j = -1
    }

    return {
      size: n,
      next: next,
      get: get,
      reset: reset
    }
  }

  getSubdividedColor (params: {scheme: string, [k: string]: any } & ColormakerParameters) {
    var m = this.subdiv
    var polymer = this.polymer
    var n = polymer.residueCount
    var n1 = n - 1
    var nCol = n1 * m * 3 + 3
    if (polymer.isCyclic) nCol += m * 3

    var col = new Float32Array(nCol)
    var iterator = this.getAtomIterator('trace')

    var p = params || {}
    p.structure = polymer.structure

    var colormaker = ColormakerRegistry.getScheme(p)

    function colFn (item: AtomProxy, array: NumberArray, offset: number) {
      colormaker.atomColorToArray(item, array, offset)
    }

    this.interpolator.getColor(
      iterator, colFn, col, 0, polymer.isCyclic
    )

    return {
      'color': col
    }
  }
  
  getSubdividedPicking () {
    var m = this.subdiv
    var polymer = this.polymer
    var n = polymer.residueCount
    var n1 = n - 1
    var nCol = n1 * m + 1
    if (polymer.isCyclic) nCol += m

    var structure = polymer.structure
    var iterator = this.getAtomIterator('trace')
    var pick = new Float32Array(nCol)

    function pickFn (item: AtomProxy) {
      return item.index
    }

    this.interpolator.getPicking(
      iterator, pickFn, pick, 0, polymer.isCyclic
    )

    return {
      'picking': new AtomPicker(pick, structure)
    }
  }

  getSubdividedPosition () {
    var pos = this.getPosition()

    return {
      'position': pos
    }
  }
  
  getSubdividedOrientation () {
    const tan = this.getTangent()
    const normals = this.getNormals(tan)

    return {
      'tangent': tan,
      'normal': normals.normal,
      'binormal': normals.binormal
    }
  }

  getSubdividedSize (params: RadiusParams) {
    var m = this.subdiv
    var polymer = this.polymer
    var n = polymer.residueCount
    var n1 = n - 1
    var nSize = n1 * m + 1
    if (polymer.isCyclic) nSize += m

    var size = new Float32Array(nSize)
    var iterator = this.getAtomIterator('trace')

    var radiusFactory = new RadiusFactory(params)

    function sizeFn (item: AtomProxy) {
      return radiusFactory.atomRadius(item)
    }

    this.interpolator.getSize(
      iterator, sizeFn, size, 0, polymer.isCyclic
    )

    return {
      'size': size
    }
  }

  getPosition () {
    const m = this.subdiv
    const polymer = this.polymer
    const n = polymer.residueCount
    const n1 = n - 1
    let nPos = n1 * m * 3 + 3
    if (polymer.isCyclic) nPos += m * 3

    const pos = new Float32Array(nPos)
    const iterator = this.positionIterator || this.getAtomIterator('trace', this.smoothSheet)

    this.interpolator.getPosition(iterator, pos, 0, polymer.isCyclic)

    return pos
  }

  getTangent () {
    const m = this.subdiv
    const polymer = this.polymer
    const n = this.size
    const n1 = n - 1
    let nTan = n1 * m * 3 + 3
    if (polymer.isCyclic) nTan += m * 3

    const tan = new Float32Array(nTan)
    const iterator = this.positionIterator || this.getAtomIterator('trace', this.smoothSheet)

    this.interpolator.getTangent(iterator, tan, 0, polymer.isCyclic)

    return tan
  }

  getNormals (tan: Float32Array) {
    const m = this.subdiv
    const polymer = this.polymer
    const isProtein = polymer.isProtein()
    const n = this.size
    const n1 = n - 1
    let nNorm = n1 * m * 3 + 3
    if (polymer.isCyclic) nNorm += m * 3

    const norm = new Float32Array(nNorm)
    const bin = new Float32Array(nNorm)

    if (this.directional && !this.polymer.isCg()) {
      const iterDir1 = this.getAtomIterator('direction1')
      const iterDir2 = this.getAtomIterator('direction2')
      this.interpolator.getNormalDir(
        iterDir1, iterDir2, tan, norm, bin, 0, polymer.isCyclic, isProtein
      )
    } else {
      this.interpolator.getNormal(
        n, tan, norm, bin, 0, polymer.isCyclic
      )
    }

    return {
      'normal': norm,
      'binormal': bin
    }
  }

}

export default Spline
