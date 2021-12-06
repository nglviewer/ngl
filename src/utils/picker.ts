/**
 * @file Picker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { PickerRegistry } from '../globals'
import { calculateMeanVector3 } from '../math/vector-utils'
import Selection from '../selection/selection'
import {
  ArrowPrimitive, BoxPrimitive, ConePrimitive, CylinderPrimitive,
  EllipsoidPrimitive, OctahedronPrimitive, SpherePrimitive,
  TetrahedronPrimitive, TorusPrimitive, PointPrimitive, WidelinePrimitive
} from '../geometry/primitive'
import { contactTypeName, Contacts } from '../chemistry/interactions/contact'
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
class Picker {
  array: number[]|TypedArray|undefined
  /**
   * @param  {Array|TypedArray} [array] - mapping
   */
  constructor (array?: number[]|TypedArray) {
    this.array = array
  }

  get type () { return '' }
  get data () { return {} }

  /**
   * Get the index for the given picking id
   * @param  {Integer} pid - the picking id
   * @return {Integer} the index
   */
  getIndex (pid: number) {
    return this.array ? this.array[ pid ] : pid
  }

  /**
   * Get object data
   * @abstract
   * @param  {Integer} pid - the picking id
   * @return {Object} the object data
   */
  getObject (pid: number) {
    return {}
  }

  _applyTransformations (vector: Vector3, instance: any, component: Component) {
    if (instance) {
      vector.applyMatrix4(instance.matrix)
    }
    if (component) {
      vector.applyMatrix4(component.matrix)
    }
    return vector
  }

  /**
   * Get object position
   * @abstract
   * @param  {Integer} pid - the picking id
   * @return {Vector3} the object position
   */
  _getPosition (pid: number) {
    return new Vector3()
  }

  /**
   * Get position for the given picking id
   * @param  {Integer} pid - the picking id
   * @param  {Object} instance - the instance that should be applied
   * @param  {Component} component - the component of the picked object
   * @return {Vector3} the position
   */
  getPosition (pid: number, instance: any, component: Component) {
    return this._applyTransformations(
      this._getPosition(pid), instance, component
    )
  }
}

/**
 * Shape picker class
 * @interface
 */
class ShapePicker extends Picker {
  shape: Shape
  /**
   * @param  {Shape} shape - shape object
   */
  constructor (shape: Shape) {
    super()
    this.shape = shape
  }

  get primitive (): any { return }

  get data () { return this.shape }
  get type () { return this.primitive.type }

  getObject (pid: number) {
    return this.primitive.objectFromShape(this.shape, this.getIndex(pid))
  }

  _getPosition (pid: number) {
    return this.primitive.positionFromShape(this.shape, this.getIndex(pid))
  }
}

//

class CylinderPicker extends ShapePicker {
  get primitive () { return CylinderPrimitive }
}

class ArrowPicker extends ShapePicker {
  get primitive () { return ArrowPrimitive }
}

class AtomPicker extends Picker {
  structure: Structure
  constructor (array: Float32Array, structure: Structure) {
    super(array)
    this.structure = structure
  }

  get type () { return 'atom' }
  get data () { return this.structure }

  getObject (pid: number): AtomProxy {
    return this.structure.getAtomProxy(this.getIndex(pid))
  }

  _getPosition (pid: number) {
    return new Vector3().copy(this.getObject(pid) as any)
  }
}

class AxesPicker extends Picker {
  axes: PrincipalAxes
  constructor (axes: PrincipalAxes) {
    super()
    this.axes = axes
  }

  get type () { return 'axes' }
  get data () { return this.axes }

  getObject (/* pid */) {
    return {
      axes: this.axes
    }
  }

  _getPosition (/* pid */) {
    return this.axes.center.clone()
  }
}

class BondPicker extends Picker {
  structure: Structure
  bondStore: BondStore
  constructor (array: number[]|TypedArray|undefined, structure: Structure, bondStore: BondStore) {
    super(array)
    this.structure = structure
    this.bondStore = bondStore || structure.bondStore
  }

  get type () { return 'bond' }
  get data () { return this.structure }

  getObject (pid: number): BondProxy {
    const bp = this.structure.getBondProxy(this.getIndex(pid))
    bp.bondStore = this.bondStore
    return bp
  }

  _getPosition (pid: number) {
    const b = this.getObject(pid)
    return new Vector3()
      .copy(b.atom1 as any)
      .add(b.atom2 as any)
      .multiplyScalar(0.5)
  }
}

class ContactPicker extends Picker {
  contacts: Contacts
  structure: Structure
  constructor (array: number[]|TypedArray|undefined, contacts: Contacts, structure: Structure) {
    super(array)
    this.contacts = contacts
    this.structure = structure
  }

  get type () { return 'contact' }
  get data () { return this.contacts }

  getObject (pid: number) {
    const idx = this.getIndex(pid)
    const { features, contactStore } = this.contacts
    const { centers, atomSets } = features
    const { x, y, z } = centers
    const { index1, index2, type } = contactStore
    const k = index1[idx]
    const l = index2[idx]
    return {
      center1: new Vector3(x[k], y[k], z[k]),
      center2: new Vector3(x[l], y[l], z[l]),
      atom1: this.structure.getAtomProxy(atomSets[k][0]),
      atom2: this.structure.getAtomProxy(atomSets[l][0]),
      type: contactTypeName(type[idx])
    }
  }

  _getPosition (pid: number) {
    const { center1, center2 } = this.getObject(pid)
    return new Vector3().addVectors(center1, center2).multiplyScalar(0.5)
  }
}

class ConePicker extends ShapePicker {
  get primitive () { return ConePrimitive }
}

class ClashPicker extends Picker {
  validation: Validation
  structure: Structure
  constructor (array: number[]|TypedArray|undefined, validation: Validation, structure: Structure) {
    super(array)
    this.validation = validation
    this.structure = structure
  }

  get type () { return 'clash' }
  get data () { return this.validation }

  getObject (pid: number) {
    const val = this.validation
    const idx = this.getIndex(pid)
    return {
      validation: val,
      index: idx,
      clash: val.clashArray[ idx ]
    }
  }

  _getAtomProxyFromSele (sele: string) {
    const selection = new Selection(sele)
    const idx = this.structure.getAtomIndices(selection)![ 0 ]
    return this.structure.getAtomProxy(idx)
  }

  _getPosition (pid: number) {
    const clash = this.getObject(pid).clash
    const ap1 = this._getAtomProxyFromSele(clash.sele1)
    const ap2 = this._getAtomProxyFromSele(clash.sele2)
    return new Vector3().copy(ap1 as any).add(ap2 as any).multiplyScalar(0.5)
  }
}

class DistancePicker extends BondPicker {
  get type () { return 'distance' }
}

class EllipsoidPicker extends ShapePicker {
  get primitive () { return EllipsoidPrimitive }
}

class OctahedronPicker extends ShapePicker {
  get primitive () { return OctahedronPrimitive }
}

class BoxPicker extends ShapePicker {
  get primitive () { return BoxPrimitive }
}

class IgnorePicker extends Picker {
  get type () { return 'ignore' }
}

export interface MeshData {
  name: string|undefined
  serial: number
  index: Uint32Array|Uint16Array|number[]
  normal?: Float32Array|number[]
  position: Float32Array|number[]
  color: Float32Array|number[]
}
class MeshPicker extends ShapePicker {
  mesh: MeshData
  __position: Vector3

  constructor (shape: Shape, mesh: MeshData) {
    super(shape)
    this.mesh = mesh
  }

  get type () { return 'mesh' }

  getObject (/* pid */) {
    const m = this.mesh
    return {
      shape: this.shape,
      name: m.name,
      serial: m.serial
    }
  }

  _getPosition (/* pid */) {
    if (!this.__position) {
      this.__position = calculateMeanVector3(this.mesh.position as any)
    }
    return this.__position
  }
}

class SpherePicker extends ShapePicker {
  get primitive () { return SpherePrimitive }
}

class SurfacePicker extends Picker {
  surface: Surface
  constructor (array: number[]|TypedArray|undefined, surface: Surface) {
    super(array)
    this.surface = surface
  }

  get type () { return 'surface' }
  get data () { return this.surface }

  getObject (pid: number) {
    return {
      surface: this.surface,
      index: this.getIndex(pid)
    }
  }

  _getPosition (/* pid */) {
    return this.surface.center.clone()
  }
}

class TetrahedronPicker extends ShapePicker {
  get primitive () { return TetrahedronPrimitive }
}

class TorusPicker extends ShapePicker {
  get primitive () { return TorusPrimitive }
}

class UnitcellPicker extends Picker {
  unitcell: Unitcell
  structure: Structure

  constructor (unitcell: Unitcell, structure: Structure) {
    super()
    this.unitcell = unitcell
    this.structure = structure
  }

  get type () { return 'unitcell' }
  get data () { return this.unitcell }

  getObject (/* pid */) {
    return {
      unitcell: this.unitcell,
      structure: this.structure
    }
  }

  _getPosition (/* pid */) {
    return this.unitcell.getCenter(this.structure)
  }
}

class UnknownPicker extends Picker {
  get type () { return 'unknown' }
}

class VolumePicker extends Picker {
  volume: Volume
  constructor (array: TypedArray, volume: Volume) {
    super(array)
    this.volume = volume
  }

  get type () { return 'volume' }
  get data () { return this.volume }

  getObject (pid: number) {
    const vol = this.volume
    const idx = this.getIndex(pid)
    return {
      volume: vol,
      index: idx,
      value: vol.data[ idx ]
    }
  }

  _getPosition (pid: number) {
    const dp = this.volume.position
    const idx = this.getIndex(pid)
    return new Vector3(
      dp[ idx * 3 ],
      dp[ idx * 3 + 1 ],
      dp[ idx * 3 + 2 ]
    )
  }
}

class SlicePicker extends VolumePicker {
  get type () { return 'slice' }
}

class PointPicker extends ShapePicker {
  get primitive () { return PointPrimitive }
}

class WidelinePicker extends ShapePicker {
  get primitive () { return WidelinePrimitive }
}

PickerRegistry.add('arrow', ArrowPicker)
PickerRegistry.add('box', BoxPicker)
PickerRegistry.add('cone', ConePicker)
PickerRegistry.add('cylinder', CylinderPicker)
PickerRegistry.add('ellipsoid', EllipsoidPicker)
PickerRegistry.add('octahedron', OctahedronPicker)
PickerRegistry.add('sphere', SpherePicker)
PickerRegistry.add('tetrahedron', TetrahedronPicker)
PickerRegistry.add('torus', TorusPicker)
PickerRegistry.add('point', PointPicker)
PickerRegistry.add('wideline', WidelinePicker)

export {
  Picker,
  ShapePicker,
  ArrowPicker,
  AtomPicker,
  AxesPicker,
  BondPicker,
  BoxPicker,
  ConePicker,
  ContactPicker,
  CylinderPicker,
  ClashPicker,
  DistancePicker,
  EllipsoidPicker,
  IgnorePicker,
  OctahedronPicker,
  MeshPicker,
  SlicePicker,
  SpherePicker,
  SurfacePicker,
  TetrahedronPicker,
  TorusPicker,
  UnitcellPicker,
  UnknownPicker,
  VolumePicker,
  PointPicker,
  WidelinePicker
}
