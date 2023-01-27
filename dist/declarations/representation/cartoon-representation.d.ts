/**
 * @file Cartoon Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Spline from '../geometry/spline';
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import Polymer from '../proxy/polymer';
import AtomProxy from '../proxy/atom-proxy';
import StructureView from '../structure/structure-view';
import Buffer from '../buffer/buffer';
export interface CartoonRepresentationParameters extends StructureRepresentationParameters {
    aspectRatio: number;
    subdiv: number;
    radialSegments: number;
    tension: number;
    capped: boolean;
    smoothSheet: boolean;
}
/**
 * Cartoon representation. Show a thick ribbon that
 * smoothly connecting backbone atoms in polymers.
 *
 * __Name:__ _cartoon_
 *
 * @example
 * stage.loadFile( "rcsb://1crn" ).then( function( o ){
 *     o.addRepresentation( "cartoon" );
 *     o.autoView();
 * } );
 */
declare class CartoonRepresentation extends StructureRepresentation {
    protected aspectRatio: number;
    protected tension: number;
    protected capped: boolean;
    protected smoothSheet: boolean;
    protected subdiv: number;
    /**
     * Create Cartoon representation object
     * @param {Structure} structure - the structure to be represented
     * @param {Viewer} viewer - a viewer object
     * @param {StructureRepresentationParameters} params - representation parameters
     */
    constructor(structure: Structure, viewer: Viewer, params: Partial<CartoonRepresentationParameters>);
    init(params: Partial<CartoonRepresentationParameters>): void;
    getSplineParams(params?: Partial<CartoonRepresentationParameters>): {
        subdiv: number;
        tension: number;
        directional: boolean;
        smoothSheet: boolean;
    } & Partial<CartoonRepresentationParameters>;
    getSpline(polymer: Polymer): Spline;
    getAspectRatio(polymer: Polymer): number;
    getAtomRadius(atom: AtomProxy): number;
    createData(sview: StructureView): {
        bufferList: Buffer[];
        polymerList: Polymer[];
    };
    updateData(what: any, data: StructureRepresentationData): void;
    setParameters(params: Partial<CartoonRepresentationParameters>): this;
}
export default CartoonRepresentation;
