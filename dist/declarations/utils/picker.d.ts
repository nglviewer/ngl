/**
 * @file Picker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3 } from 'three';
import { ArrowPrimitive, BoxPrimitive, ConePrimitive, CylinderPrimitive, EllipsoidPrimitive, OctahedronPrimitive, SpherePrimitive, TetrahedronPrimitive, TorusPrimitive, PointPrimitive, WidelinePrimitive } from '../geometry/primitive';
import { Contacts } from '../chemistry/interactions/contact';
import { TypedArray } from '../types';
import Component from '../component/component';
import { Shape, Structure, Volume } from '../ngl';
import BondStore from '../store/bond-store';
import Validation from '../structure/validation';
import PrincipalAxes from '../math/principal-axes';
import Surface from '../surface/surface';
import Unitcell from '../symmetry/unitcell';
import BondProxy from '../proxy/bond-proxy';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Picker class
 * @interface
 */
declare class Picker {
    array: number[] | TypedArray | undefined;
    /**
     * @param  {Array|TypedArray} [array] - mapping
     */
    constructor(array?: number[] | TypedArray);
    get type(): string;
    get data(): {};
    /**
     * Get the index for the given picking id
     * @param  {Integer} pid - the picking id
     * @return {Integer} the index
     */
    getIndex(pid: number): number;
    /**
     * Get object data
     * @abstract
     * @param  {Integer} pid - the picking id
     * @return {Object} the object data
     */
    getObject(pid: number): {};
    _applyTransformations(vector: Vector3, instance: any, component: Component): Vector3;
    /**
     * Get object position
     * @abstract
     * @param  {Integer} pid - the picking id
     * @return {Vector3} the object position
     */
    _getPosition(pid: number): Vector3;
    /**
     * Get position for the given picking id
     * @param  {Integer} pid - the picking id
     * @param  {Object} instance - the instance that should be applied
     * @param  {Component} component - the component of the picked object
     * @return {Vector3} the position
     */
    getPosition(pid: number, instance: any, component: Component): Vector3;
}
/**
 * Shape picker class
 * @interface
 */
declare class ShapePicker extends Picker {
    shape: Shape;
    /**
     * @param  {Shape} shape - shape object
     */
    constructor(shape: Shape);
    get primitive(): any;
    get data(): Shape;
    get type(): any;
    getObject(pid: number): any;
    _getPosition(pid: number): any;
}
declare class CylinderPicker extends ShapePicker {
    get primitive(): typeof CylinderPrimitive;
}
declare class ArrowPicker extends ShapePicker {
    get primitive(): typeof ArrowPrimitive;
}
declare class AtomPicker extends Picker {
    structure: Structure;
    constructor(array: Float32Array, structure: Structure);
    get type(): string;
    get data(): Structure;
    getObject(pid: number): AtomProxy;
    _getPosition(pid: number): Vector3;
}
declare class AxesPicker extends Picker {
    axes: PrincipalAxes;
    constructor(axes: PrincipalAxes);
    get type(): string;
    get data(): PrincipalAxes;
    getObject(): {
        axes: PrincipalAxes;
    };
    _getPosition(): Vector3;
}
declare class BondPicker extends Picker {
    structure: Structure;
    bondStore: BondStore;
    constructor(array: number[] | TypedArray | undefined, structure: Structure, bondStore?: BondStore);
    get type(): string;
    get data(): Structure;
    getObject(pid: number): BondProxy;
    _getPosition(pid: number): Vector3;
}
declare class ContactPicker extends Picker {
    contacts: Contacts;
    structure: Structure;
    constructor(array: number[] | TypedArray | undefined, contacts: Contacts, structure: Structure);
    get type(): string;
    get data(): Contacts;
    getObject(pid: number): {
        center1: Vector3;
        center2: Vector3;
        atom1: AtomProxy;
        atom2: AtomProxy;
        type: string;
    };
    _getPosition(pid: number): Vector3;
}
declare class ConePicker extends ShapePicker {
    get primitive(): typeof ConePrimitive;
}
declare class ClashPicker extends Picker {
    validation: Validation;
    structure: Structure;
    constructor(array: number[] | TypedArray | undefined, validation: Validation, structure: Structure);
    get type(): string;
    get data(): Validation;
    getObject(pid: number): {
        validation: Validation;
        index: number;
        clash: {
            [k: string]: string;
        };
    };
    _getAtomProxyFromSele(sele: string): AtomProxy;
    _getPosition(pid: number): Vector3;
}
declare class DistancePicker extends BondPicker {
    get type(): string;
}
declare class EllipsoidPicker extends ShapePicker {
    get primitive(): typeof EllipsoidPrimitive;
}
declare class OctahedronPicker extends ShapePicker {
    get primitive(): typeof OctahedronPrimitive;
}
declare class BoxPicker extends ShapePicker {
    get primitive(): typeof BoxPrimitive;
}
declare class IgnorePicker extends Picker {
    get type(): string;
}
export interface MeshData {
    name: string | undefined;
    serial: number;
    index: Uint32Array | Uint16Array | number[];
    normal?: Float32Array | number[];
    position: Float32Array | number[];
    color: Float32Array | number[];
}
declare class MeshPicker extends ShapePicker {
    mesh: MeshData;
    __position: Vector3;
    constructor(shape: Shape, mesh: MeshData);
    get type(): string;
    getObject(): {
        shape: Shape;
        name: string | undefined;
        serial: number;
    };
    _getPosition(): Vector3;
}
declare class SpherePicker extends ShapePicker {
    get primitive(): typeof SpherePrimitive;
}
declare class SurfacePicker extends Picker {
    surface: Surface;
    constructor(array: number[] | TypedArray | undefined, surface: Surface);
    get type(): string;
    get data(): Surface;
    getObject(pid: number): {
        surface: Surface;
        index: number;
    };
    _getPosition(): Vector3;
}
declare class TetrahedronPicker extends ShapePicker {
    get primitive(): typeof TetrahedronPrimitive;
}
declare class TorusPicker extends ShapePicker {
    get primitive(): typeof TorusPrimitive;
}
declare class UnitcellPicker extends Picker {
    unitcell: Unitcell;
    structure: Structure;
    constructor(unitcell: Unitcell, structure: Structure);
    get type(): string;
    get data(): Unitcell;
    getObject(): {
        unitcell: Unitcell;
        structure: Structure;
    };
    _getPosition(): Vector3;
}
declare class UnknownPicker extends Picker {
    get type(): string;
}
declare class VolumePicker extends Picker {
    volume: Volume;
    constructor(array: TypedArray, volume: Volume);
    get type(): string;
    get data(): Volume;
    getObject(pid: number): {
        volume: Volume;
        index: number;
        value: number;
    };
    _getPosition(pid: number): Vector3;
}
declare class SlicePicker extends VolumePicker {
    get type(): string;
}
declare class PointPicker extends ShapePicker {
    get primitive(): typeof PointPrimitive;
}
declare class WidelinePicker extends ShapePicker {
    get primitive(): typeof WidelinePrimitive;
}
export { Picker, ShapePicker, ArrowPicker, AtomPicker, AxesPicker, BondPicker, BoxPicker, ConePicker, ContactPicker, CylinderPicker, ClashPicker, DistancePicker, EllipsoidPicker, IgnorePicker, OctahedronPicker, MeshPicker, SlicePicker, SpherePicker, SurfacePicker, TetrahedronPicker, TorusPicker, UnitcellPicker, UnknownPicker, VolumePicker, PointPicker, WidelinePicker };
