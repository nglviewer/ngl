/**
 * @file Picking Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Matrix4, Vector2 } from 'three';
import Stage from '../stage/stage';
import MouseObserver from '../stage/mouse-observer';
import { Picker } from '../utils/picker';
import ViewerControls from './viewer-controls';
import Shape from '../geometry/shape';
import Structure from '../structure/structure';
import BondProxy from '../proxy/bond-proxy';
import AtomProxy from '../proxy/atom-proxy';
import Surface from '../surface/surface';
import Volume from '../surface/volume';
import Unitcell from '../symmetry/unitcell';
import Component from '../component/component';
export interface ShapePrimitive {
    name: string;
    shape: Shape;
}
/**
 * Picking data object.
 * @typedef {Object} PickingData - picking data
 * @property {Number} [pid] - picking id
 * @property {Object} [instance] - instance data
 * @property {Integer} instance.id - instance id
 * @property {String|Integer} instance.name - instance name
 * @property {Matrix4} instance.matrix - transformation matrix of the instance
 * @property {Picker} [picker] - picker object
 */
export interface InstanceData {
    id: number;
    name: number | string;
    matrix: Matrix4;
}
export interface PickingData {
    pid: number;
    instance: InstanceData;
    picker: Picker;
}
/**
 * Picking proxy class.
 */
declare class PickingProxy {
    readonly stage: Stage;
    pid: number;
    picker: Picker;
    instance: InstanceData;
    controls: ViewerControls;
    mouse: MouseObserver;
    /**
     * Create picking proxy object
     * @param  {PickingData} pickingData - picking data
     * @param  {Stage} stage - stage object
     */
    constructor(pickingData: PickingData, stage: Stage);
    /**
     * Kind of the picked data
     * @type {String}
     */
    get type(): string;
    /**
     * If the `alt` key was pressed
     * @type {Boolean}
     */
    get altKey(): boolean;
    /**
     * If the `ctrl` key was pressed
     * @type {Boolean}
     */
    get ctrlKey(): boolean;
    /**
     * If the `meta` key was pressed
     * @type {Boolean}
     */
    get metaKey(): boolean;
    /**
     * If the `shift` key was pressed
     * @type {Boolean}
     */
    get shiftKey(): boolean;
    /**
     * Position of the mouse on the canvas
     * @type {Vector2}
     */
    get canvasPosition(): Vector2;
    /**
     * The component the picked data is part of
     * @type {Component}
     */
    get component(): Component;
    /**
     * The picked object data
     * @type {Object}
     */
    get object(): {};
    /**
     * The 3d position in the scene of the picked object
     * @type {Vector3}
     */
    get position(): Vector3;
    /**
     * The atom of a picked bond that is closest to the mouse
     * @type {AtomProxy}
     */
    get closestBondAtom(): AtomProxy | undefined;
    /**
     * Close-by atom
     * @type {AtomProxy}
     */
    get closeAtom(): AtomProxy | undefined;
    /**
     * @type {Object}
     */
    get arrow(): ShapePrimitive;
    /**
     * @type {AtomProxy}
     */
    get atom(): AtomProxy;
    /**
     * @type {Object}
     */
    get axes(): {} | undefined;
    /**
     * @type {BondProxy}
     */
    get bond(): BondProxy;
    /**
     * @type {Object}
     */
    get box(): ShapePrimitive;
    /**
     * @type {Object}
     */
    get cone(): ShapePrimitive;
    /**
     * @type {Object}
     */
    get clash(): {
        clash: {
            sele1: string;
            sele2: string;
        };
    };
    /**
     * @type {BondProxy}
     */
    get contact(): {
        type: string;
        atom1: AtomProxy;
        atom2: AtomProxy;
    };
    /**
     * @type {Object}
     */
    get cylinder(): ShapePrimitive;
    /**
     * @type {BondProxy}
     */
    get distance(): BondProxy;
    /**
     * @type {Object}
     */
    get ellipsoid(): ShapePrimitive;
    /**
     * @type {Object}
     */
    get octahedron(): ShapePrimitive;
    /**
     * @type {Object}
     */
    get point(): ShapePrimitive;
    /**
     * @type {Object}
     */
    get mesh(): {
        name: string;
        shape: Shape;
        serial: number;
    };
    /**
     * @type {Object}
     */
    get slice(): {
        volume: Volume;
        value: number;
    };
    /**
     * @type {Object}
     */
    get sphere(): ShapePrimitive;
    /**
     * @type {Object}
     */
    get tetrahedron(): ShapePrimitive;
    /**
     * @type {Object}
     */
    get torus(): ShapePrimitive;
    /**
     * @type {Object}
     */
    get surface(): {
        surface: Surface;
        index: number;
    };
    /**
     * @type {Object}
     */
    get unitcell(): {
        unitcell: Unitcell;
        structure: Structure;
    };
    /**
     * @type {Object}
     */
    get unknown(): {} | undefined;
    /**
     * @type {Object}
     */
    get volume(): {
        volume: Volume;
        value: number;
    };
    /**
     * @type {Object}
     */
    get wideline(): ShapePrimitive;
    _objectIfType(type: string): {} | undefined;
    getLabel(): string;
}
export default PickingProxy;
