/**
 * @file Unitcell
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color, Vector3, Matrix4 } from '../../lib/three.es6.js'

import { defaults } from '../utils.js'
import { degToRad } from '../math/math-utils.js'
import {
  uniformArray, uniformArray3, centerArray3
} from '../math/array-utils.js'
import { UnitcellPicker } from '../utils/picker.js'

/**
 * Unitcell class
 */
class Unitcell {
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
  constructor (params) {
    const p = params || {}

    /**
     * @type {Number}
     */
    this.a = p.a || 1
    /**
     * @type {Number}
     */
    this.b = p.b || 1
    /**
     * @type {Number}
     */
    this.c = p.c || 1

    /**
     * @type {Number}
     */
    this.alpha = p.alpha || 90
    /**
     * @type {Number}
     */
    this.beta = p.beta || 90
    /**
     * @type {Number}
     */
    this.gamma = p.gamma || 90

    /**
     * @type {String}
     */
    this.spacegroup = p.spacegroup || 'P 1'
    /**
     * @type {Matrix4}
     */
    this.cartToFrac = p.cartToFrac || p.scale
    /**
     * @type {Matrix4}
     */
    this.fracToCart = new Matrix4()

    //

    const alphaRad = degToRad(this.alpha)
    const betaRad = degToRad(this.beta)
    const gammaRad = degToRad(this.gamma)
    const cosAlpha = Math.cos(alphaRad)
    const cosBeta = Math.cos(betaRad)
    const cosGamma = Math.cos(gammaRad)
    const sinBeta = Math.sin(betaRad)
    const sinGamma = Math.sin(gammaRad)

    /**
     * @type {Number}
     */
    this.volume = (
      this.a * this.b * this.c *
      Math.sqrt(
        1 - cosAlpha * cosAlpha - cosBeta * cosBeta - cosGamma * cosGamma +
        2.0 * cosAlpha * cosBeta * cosGamma
      )
    )

    //

    if (this.cartToFrac === undefined) {
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
      this.cartToFrac = new Matrix4().getInverse(this.fracToCart)
    } else {
      this.fracToCart.getInverse(this.cartToFrac)
    }
  }

  getPosition (structure) {
    const vertexPosition = new Float32Array(3 * 8)

    const uc = structure.unitcell
    const centerFrac = structure.center.clone()
            .applyMatrix4(uc.cartToFrac)
            .floor().multiplyScalar(2).addScalar(1)
    const v = new Vector3()

    let cornerOffset = 0
    function addCorner (x, y, z) {
      v.set(x, y, z)
        .multiply(centerFrac)
        .applyMatrix4(uc.fracToCart)
        .toArray(vertexPosition, cornerOffset)
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

    return vertexPosition
  }

  getCenter (structure) {
    return centerArray3(this.getPosition(structure))
  }

  getData (structure, params) {
    const p = params || {}
    const colorValue = defaults(p.colorValue, 'orange')
    const radius = defaults(p.radius, Math.cbrt(this.volume) / 200)

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
    function addEdge (a, b) {
      v.fromArray(vertexPosition, a * 3)
        .toArray(edgePosition1, edgeOffset)
      v.fromArray(vertexPosition, b * 3)
        .toArray(edgePosition2, edgeOffset)
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
