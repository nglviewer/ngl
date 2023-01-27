/**
 * @file Backbone Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import BallAndStickRepresentation, { BallAndStickRepresentationParameters } from './ballandstick-representation';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import AtomProxy from '../proxy/atom-proxy';
import StructureView from '../structure/structure-view';
import { AtomDataFields, AtomDataParams, BondDataFields, BondDataParams, BondData, AtomData } from '../structure/structure-data';
/**
 * Backbone representation. Show cylinders (or lines) connecting .CA (protein)
 * or .C4'/.C3' (RNA/DNA) of polymers.
 *
 * __Name:__ _backbone_
 *
 * @example
 * stage.loadFile( "rcsb://1sfi" ).then( function( o ){
 *     o.addRepresentation( "backbone" );
 *     o.autoView();
 * } );
 */
declare class BackboneRepresentation extends BallAndStickRepresentation {
    /**
     * @param  {Structure} structure - the structure object
     * @param  {Viewer} viewer - the viewer object
     * @param  {BallAndStickRepresentationParameters} params - parameters object
     */
    constructor(structure: Structure, viewer: Viewer, params: Partial<BallAndStickRepresentationParameters>);
    init(params: Partial<BallAndStickRepresentationParameters>): void;
    getAtomRadius(atom: AtomProxy): number;
    getAtomData(sview: StructureView, what?: AtomDataFields, params?: Partial<AtomDataParams>): AtomData;
    getBondData(sview: StructureView, what?: BondDataFields, params?: Partial<BondDataParams>): BondData;
}
export default BackboneRepresentation;
