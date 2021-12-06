/**
 * @file Principal Axes
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Matrix4, Quaternion } from 'three'

import {
    Matrix, meanRows, subRows, transpose, multiplyABt, svd
} from './matrix-utils'
import { projectPointOnVector } from './vector-utils'
import Structure from '../structure/structure'
import AtomProxy from '../proxy/atom-proxy'

const negateVector = new Vector3(-1, -1, -1)
const tmpMatrix = new Matrix4()

/**
 * Principal axes
 */
class PrincipalAxes {
  begA: Vector3
  endA: Vector3
  begB: Vector3
  endB: Vector3
  begC: Vector3
  endC: Vector3

  center: Vector3

  vecA: Vector3
  vecB: Vector3
  vecC: Vector3

  normVecA: Vector3
  normVecB: Vector3
  normVecC: Vector3

  /**
   * @param  {Matrix} points - 3 by N matrix
   */
  constructor (points: Matrix) {
    // console.time( "PrincipalAxes" );

    const n = points.rows
    const n3 = n / 3
    const pointsT = new Matrix(n, 3)
    const A = new Matrix(3, 3)
    const W = new Matrix(1, 3)
    const U = new Matrix(3, 3)
    const V = new Matrix(3, 3)

        // calculate
    const mean = meanRows(points)
    subRows(points, mean)
    transpose(pointsT, points)
    multiplyABt(A, pointsT, pointsT)
    svd(A, W, U, V)

    // console.log( points, pointsT, mean )
    // console.log( n, A, W, U, V );

    // center
    const vm = new Vector3(mean[0], mean[1], mean[2])

    // normalized
    const van = new Vector3(U.data[0], U.data[3], U.data[6])
    const vbn = new Vector3(U.data[1], U.data[4], U.data[7])
    const vcn = new Vector3(U.data[2], U.data[5], U.data[8])

    // scaled
    const va = van.clone().multiplyScalar(Math.sqrt(W.data[0] / n3))
    const vb = vbn.clone().multiplyScalar(Math.sqrt(W.data[1] / n3))
    const vc = vcn.clone().multiplyScalar(Math.sqrt(W.data[2] / n3))

    // points
    this.begA = vm.clone().sub(va)
    this.endA = vm.clone().add(va)
    this.begB = vm.clone().sub(vb)
    this.endB = vm.clone().add(vb)
    this.begC = vm.clone().sub(vc)
    this.endC = vm.clone().add(vc)

    //

    this.center = vm

    this.vecA = va
    this.vecB = vb
    this.vecC = vc

    this.normVecA = van
    this.normVecB = vbn
    this.normVecC = vcn

    // console.timeEnd( "PrincipalAxes" );
  }

  /**
   * Get the basis matrix descriping the axes
   * @param  {Matrix4} [optionalTarget] - target object
   * @return {Matrix4} the basis
   */
  getBasisMatrix (optionalTarget = new Matrix4()) {
    const basis = optionalTarget

    basis.makeBasis(this.normVecB, this.normVecA, this.normVecC)
    if (basis.determinant() < 0) {
      basis.scale(negateVector)
    }

    return basis
  }

  /**
   * Get a quaternion descriping the axes rotation
   * @param  {Quaternion} [optionalTarget] - target object
   * @return {Quaternion} the rotation
   */
  getRotationQuaternion (optionalTarget = new Quaternion()) {
    const q = optionalTarget
    q.setFromRotationMatrix(this.getBasisMatrix(tmpMatrix))

    return q.inverse()
  }

  /**
   * Get the scale/length for each dimension for a box around the axes
   * to enclose the atoms of a structure
   * @param  {Structure|StructureView} structure - the structure
   * @return {{d1a: Number, d2a: Number, d3a: Number, d1b: Number, d2b: Number, d3b: Number}} scale
   */
  getProjectedScaleForAtoms (structure: Structure) {
    let d1a = -Infinity
    let d1b = -Infinity
    let d2a = -Infinity
    let d2b = -Infinity
    let d3a = -Infinity
    let d3b = -Infinity

    const p = new Vector3()
    const t = new Vector3()

    const center = this.center
    const ax1 = this.normVecA
    const ax2 = this.normVecB
    const ax3 = this.normVecC

    structure.eachAtom(function (ap: AtomProxy) {
      projectPointOnVector(p.copy(ap as any), ax1, center)  // TODO
      const dp1 = t.subVectors(p, center).normalize().dot(ax1)
      const dt1 = p.distanceTo(center)
      if (dp1 > 0) {
        if (dt1 > d1a) d1a = dt1
      } else {
        if (dt1 > d1b) d1b = dt1
      }

      projectPointOnVector(p.copy(ap as any), ax2, center)
      const dp2 = t.subVectors(p, center).normalize().dot(ax2)
      const dt2 = p.distanceTo(center)
      if (dp2 > 0) {
        if (dt2 > d2a) d2a = dt2
      } else {
        if (dt2 > d2b) d2b = dt2
      }

      projectPointOnVector(p.copy(ap as any), ax3, center)
      const dp3 = t.subVectors(p, center).normalize().dot(ax3)
      const dt3 = p.distanceTo(center)
      if (dp3 > 0) {
        if (dt3 > d3a) d3a = dt3
      } else {
        if (dt3 > d3b) d3b = dt3
      }
    })

    return {
      d1a: d1a,
      d2a: d2a,
      d3a: d3a,
      d1b: -d1b,
      d2b: -d2b,
      d3b: -d3b
    }
  }
}

export default PrincipalAxes
