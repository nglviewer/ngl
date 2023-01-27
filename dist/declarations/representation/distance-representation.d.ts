/**
 * @file Distance Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */
import BitArray from '../utils/bitarray';
import MeasurementRepresentation, { MeasurementRepresentationParameters } from './measurement-representation';
import BondStore from '../store/bond-store';
import TextBuffer from '../buffer/text-buffer';
import WideLineBuffer from '../buffer/wideline-buffer';
import Viewer from '../viewer/viewer';
import { Structure } from '../ngl';
import StructureView from '../structure/structure-view';
import { BondDataFields, BondDataParams, BondData } from '../structure/structure-data';
import { StructureRepresentationData } from './structure-representation';
import CylinderGeometryBuffer from '../buffer/cylindergeometry-buffer';
/**
 * Distance representation parameter object.
 * @typedef {Object} DistanceRepresentationParameters - distance representation parameters
 * @mixes RepresentationParameters
 * @mixes StructureRepresentationParameters
 * @mixes MeasurementRepresentationParameters
 *
 * @property {String} labelUnit - distance unit (e.g. "angstrom" or "nm"). If set, a distance
 *                                symbol is appended to the label (i.e. 'nm' or '\u00C5'). In case of 'nm', the
 *                                distance value is computed in nanometers instead of Angstroms.
 * @property {Array[]} atomPair - list of pairs of selection strings (see {@link Selection})
 *                                or pairs of atom indices. Using atom indices is much more
 *                                efficient when the representation is updated often, e.g. by
 *                                changing the selection or the atom positions, as there
 *                                are no selection strings to be evaluated.
 */
export interface DistanceRepresentationParameters extends MeasurementRepresentationParameters {
    labelUnit: string;
    atomPair: AtomPair;
    useCylinder: boolean;
}
export declare type AtomPair = (number | string)[][];
/**
 * Distance representation
 */
declare class DistanceRepresentation extends MeasurementRepresentation {
    protected labelUnit: string;
    protected atomPair: AtomPair;
    protected useCylinder: boolean;
    protected distanceBuffer: WideLineBuffer | CylinderGeometryBuffer;
    /**
     * Create Distance representation object
     * @example
     * stage.loadFile( "rcsb://1crn" ).then( function( o ){
     *     o.addRepresentation( "cartoon" );
     *     // either give selections (uses first selected atom) ...
     *     var atomPair = [ [ "1.CA", "4.CA" ], [ "7.CA", "13.CA" ] ];
     *     // or atom indices
     *     var atomPair = [ [ 8, 28 ], [ 173, 121 ] ];
     *     o.addRepresentation( "distance", { atomPair: atomPair } );
     *     stage.autoView();
     * } );
     * @param {Structure} structure - the structure to be represented
     * @param {Viewer} viewer - a viewer object
     * @param {DistanceRepresentationParameters} params - distance representation parameters
     */
    constructor(structure: Structure, viewer: Viewer, params: Partial<DistanceRepresentationParameters>);
    init(params: Partial<DistanceRepresentationParameters>): void;
    getDistanceData(sview: StructureView, atomPair: AtomPair): {
        text: any[];
        position: Float32Array;
        bondSet: BitArray;
        bondStore: BondStore;
    };
    getBondData(sview: StructureView, what: BondDataFields, params: BondDataParams): BondData;
    createData(sview: StructureView): {
        bondSet: BitArray;
        bondStore: BondStore;
        position: Float32Array;
        bufferList: (TextBuffer | CylinderGeometryBuffer | WideLineBuffer)[];
    } | undefined;
    updateData(what: BondDataFields, data: StructureRepresentationData): void;
    setParameters(params: Partial<DistanceRepresentationParameters>): this;
}
export default DistanceRepresentation;
