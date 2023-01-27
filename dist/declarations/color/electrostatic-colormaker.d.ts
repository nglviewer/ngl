/**
 * @file Atomindex Colormaker
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3 } from 'three';
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
import SpatialHash from '../geometry/spatial-hash';
/**
 * Color a surface by electrostatic charge. This is a highly approximate
 * calculation! The partial charges are CHARMM with hydrogens added to heavy
 * atoms and hydrogen positions generated for amides.
 *
 * __Name:__ _electrostatic_
 *
 * @example
 * stage.loadFile( "rcsb://3dqb" ).then( function( o ){
 *     o.addRepresentation( "surface", { colorScheme: "electrostatic" } );
 *     o.autoView();
 * } );
 */
declare class ElectrostaticColormaker extends Colormaker {
    scale: ColormakerScale;
    hHash: SpatialHash;
    hash: SpatialHash;
    charges: Float32Array;
    hStore: {
        x: Float32Array;
        y: Float32Array;
        z: Float32Array;
        count: number;
    };
    atomProxy: AtomProxy;
    delta: Vector3;
    hCharges: number[];
    constructor(params: StuctureColormakerParams);
    positionColor(v: Vector3): number;
}
export default ElectrostaticColormaker;
