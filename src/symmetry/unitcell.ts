/**
 * @file Unitcell
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color, Vector3, Matrix4 } from 'three'

import { defaults } from '../utils'
import { degToRad } from '../math/math-utils'
import {
  uniformArray, uniformArray3, centerArray3
} from '../math/array-utils'
import { UnitcellPicker } from '../utils/picker'
import Structure from '../structure/structure'

export interface UnitcellParams {
  a: number
  b: number
  c: number
  alpha: number
  beta: number
  gamma: number
  spacegroup: string
  cartToFrac?: Matrix4
}

const DefaultBoxParams = {
  a: 1,
  b: 1,
  c: 1,
  alpha: 90,
  beta: 90,
  gamma: 90,
  spacegroup: 'P 1'
}

export interface UnitcellDataParams {
  colorValue?: string|number,
  radius?: number
}

/**
 * Unitcell class
 */
class Unitcell {
  a: number
  b: number
  c: number
  alpha: number
  beta: number
  gamma: number

  spacegroup: string

  cartToFrac = new Matrix4()
  fracToCart = new Matrix4()

  volume: number

  /**
   * @param  {Object} params - unitcell parameters
   * @param  {Number} params.a - length a
   * @param  {Number} params.b - length b
   * @param  {Number} params.c - length c
   * @param  {Number} params.alpha - angle alpha
   * @param  {Number} params.beta - angle beta
   * @param  {Number} params.gamma - angle gamma
   * @param  {String} params.spacegroup - spacegroup
   * @param  {Matrix4} [params.cartToFrac] - transformation matrix from
   *                                         cartesian to fractional coordinates
   * @param  {Matrix4} [params.scale] - alias for `params.cartToFrac`
   */
  constructor (params: UnitcellParams = DefaultBoxParams) {
    this.a = params.a
    this.b = params.b
    this.c = params.c
    this.alpha = params.alpha
    this.beta = params.beta
    this.gamma = params.gamma
    this.spacegroup = params.spacegroup

    const alphaRad = degToRad(this.alpha)
    const betaRad = degToRad(this.beta)
    const gammaRad = degToRad(this.gamma)
    const cosAlpha = Math.cos(alphaRad)
    const cosBeta = Math.cos(betaRad)
    const cosGamma = Math.cos(gammaRad)
    const sinBeta = Math.sin(betaRad)
    const sinGamma = Math.sin(gammaRad)

    this.volume = (
      this.a * this.b * this.c *
      Math.sqrt(
        1 - cosAlpha * cosAlpha - cosBeta * cosBeta - cosGamma * cosGamma +
        2.0 * cosAlpha * cosBeta * cosGamma
      )
    )

    if (params.cartToFrac === undefined) {
      // https://github.com/biojava/biojava/blob/master/biojava-structure/src/main/java/org/biojava/nbio/structure/xtal/CrystalCell.java

      const cStar = (this.a * this.b * sinGamma) / this.volume
      const cosAlphaStar = (
        (cosBeta * cosGamma - cosAlpha) / (sinBeta * sinGamma)
      )

      this.fracToCart.set(
        this.a, 0, 0, 0,
        this.b * cosGamma, this.b * sinGamma, 0, 0,
        this.c * cosBeta, -this.c * sinBeta * cosAlphaStar, 1.0 / cStar, 0,
        0, 0, 0, 1
      ).transpose()
      this.cartToFrac.getInverse(this.fracToCart)
    } else {
      this.cartToFrac.copy(params.cartToFrac)
      this.fracToCart.getInverse(this.cartToFrac)
    }
  }

  getPosition (structure: Structure): Float32Array {
    const vertexPosition = new Float32Array(3 * 8)

    if (structure.unitcell) {
      const uc = structure.unitcell
      const centerFrac = structure.center.clone().applyMatrix4(uc.cartToFrac).floor()
      const v = new Vector3()

      let cornerOffset = 0
      const addCorner = function (x: number, y: number, z: number) {
        v.set(x, y, z)
          .add(centerFrac)
          .applyMatrix4(uc.fracToCart)
          .toArray(vertexPosition as any, cornerOffset)
        cornerOffset += 3
      }
      addCorner(0, 0, 0)
      addCorner(1, 0, 0)
      addCorner(0, 1, 0)
      addCorner(0, 0, 1)
      addCorner(1, 1, 0)
      addCorner(1, 0, 1)
      addCorner(0, 1, 1)
      addCorner(1, 1, 1)
    }

    return vertexPosition
  }

  getCenter (structure: Structure) {
    return centerArray3(this.getPosition(structure))
  }

  getData (structure: Structure, params: UnitcellDataParams = {}) {
    const colorValue = defaults(params.colorValue, 'orange')
    const radius = defaults(params.radius, Math.cbrt(this.volume) / 200)

    const c = new Color(colorValue)
    const v = new Vector3()

    const vertexPosition = this.getPosition(structure)
    const vertexColor = uniformArray3(8, c.r, c.g, c.b)
    const vertexRadius = uniformArray(8, radius)

    const edgePosition1 = new Float32Array(3 * 12)
    const edgePosition2 = new Float32Array(3 * 12)
    const edgeColor = uniformArray3(12, c.r, c.g, c.b)
    const edgeRadius = uniformArray(12, radius)

    let edgeOffset = 0
    function addEdge (a: number, b: number) {
      v.fromArray(vertexPosition as any, a * 3)
        .toArray(edgePosition1 as any, edgeOffset)
      v.fromArray(vertexPosition as any, b * 3)
        .toArray(edgePosition2 as any, edgeOffset)
      edgeOffset += 3
    }
    addEdge(0, 1)
    addEdge(0, 2)
    addEdge(0, 3)
    addEdge(1, 4)
    addEdge(1, 5)
    addEdge(2, 6)
    addEdge(3, 5)
    addEdge(4, 7)
    addEdge(5, 7)
    addEdge(2, 4)
    addEdge(7, 6)
    addEdge(3, 6)

    const picker = new UnitcellPicker(this, structure)

    return {
      vertex: {
        position: vertexPosition,
        color: vertexColor,
        radius: vertexRadius,
        picking: picker
      },
      edge: {
        position1: edgePosition1,
        position2: edgePosition2,
        color: edgeColor,
        color2: edgeColor,
        radius: edgeRadius,
        picking: picker
      }
    }
  }
}

export default Unitcell
