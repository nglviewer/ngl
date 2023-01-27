/**
 * @file Base Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import BallAndStickRepresentation, { BallAndStickRepresentationParameters } from './ballandstick-representation';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import { AtomDataFields, AtomDataParams, BondDataFields, BondDataParams, BondData, AtomData } from '../structure/structure-data';
/**
 * Base representation. Show cylinders for RNA/DNA ladders.
 *
 * __Name:__ _base_
 *
 * @example
 * stage.loadFile( "rcsb://1d66" ).then( function( o ){
 *     o.addRepresentation( "cartoon", { sele: "nucleic" } );
 *     o.addRepresentation( "base", { color: "resname" } );
 *     o.autoView( "nucleic" );
 * } );
 */
declare class BaseRepresentation extends BallAndStickRepresentation {
    /**
     * @param  {Structure} structure - the structure object
     * @param  {Viewer} viewer - the viewer object
     * @param  {BallAndStickRepresentationParameters} params - parameters object
     */
    constructor(structure: Structure, viewer: Viewer, params: Partial<BallAndStickRepresentationParameters>);
    init(params: Partial<BallAndStickRepresentationParameters>): void;
    getAtomData(sview: StructureView, what?: AtomDataFields, params?: AtomDataParams): AtomData;
    getBondData(sview: StructureView, what?: BondDataFields, params?: BondDataParams): BondData;
}
export default BaseRepresentation;
