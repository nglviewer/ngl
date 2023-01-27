/**
 * @file Principal Axes
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Matrix4, Quaternion } from 'three';
import { Matrix } from './matrix-utils';
import Structure from '../structure/structure';
/**
 * Principal axes
 */
declare class PrincipalAxes {
    begA: Vector3;
    endA: Vector3;
    begB: Vector3;
    endB: Vector3;
    begC: Vector3;
    endC: Vector3;
    center: Vector3;
    vecA: Vector3;
    vecB: Vector3;
    vecC: Vector3;
    normVecA: Vector3;
    normVecB: Vector3;
    normVecC: Vector3;
    /**
     * @param  {Matrix} points - 3 by N matrix
     */
    constructor(points: Matrix);
    /**
     * Get the basis matrix descriping the axes
     * @param  {Matrix4} [optionalTarget] - target object
     * @return {Matrix4} the basis
     */
    getBasisMatrix(optionalTarget?: Matrix4): Matrix4;
    /**
     * Get a quaternion descriping the axes rotation
     * @param  {Quaternion} [optionalTarget] - target object
     * @return {Quaternion} the rotation
     */
    getRotationQuaternion(optionalTarget?: Quaternion): Quaternion;
    /**
     * Get the scale/length for each dimension for a box around the axes
     * to enclose the atoms of a structure
     * @param  {Structure|StructureView} structure - the structure
     * @return {{d1a: Number, d2a: Number, d3a: Number, d1b: Number, d2b: Number, d3b: Number}} scale
     */
    getProjectedScaleForAtoms(structure: Structure): {
        d1a: number;
        d2a: number;
        d3a: number;
        d1b: number;
        d2b: number;
        d3b: number;
    };
}
export default PrincipalAxes;
