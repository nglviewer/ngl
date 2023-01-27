import MeasurementRepresentation, { MeasurementRepresentationParameters, LabelDataField } from './measurement-representation';
import MeshBuffer from '../buffer/mesh-buffer';
import TextBuffer from '../buffer/text-buffer';
import WideLineBuffer from '../buffer/wideline-buffer';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import { StructureRepresentationData } from './structure-representation';
/**
 * @typedef {Object} AngleRepresentationParameters - angle representation parameters
 * @mixes RepresentationParameters
 * @mixes StructureRepresentationParameters
 * @mixes MeasurementRepresentationParameters
 *
 * @property {String} atomTriple - list of triplets of selection strings
 *                                 or atom indices
 * @property {Boolean} vectorVisible - Indicate the 3 points for each angle by drawing lines 1-2-3
 * @property {Boolean} arcVisible - Show the arc outline for each angle
 * @property {Number}  lineOpacity - opacity for the line part of the representation
 * @property {Number} linewidth - width for line part of representation
 * @property {Boolean} sectorVisible - Show the filled arc for each angle
 */
export interface AngleRepresentationParameters extends MeasurementRepresentationParameters {
    atomTriple: (number | string)[][];
    vectorVisible: boolean;
    arcVisible: boolean;
    lineOpacity: number;
    lineWidth: number;
    sectorVisible: boolean;
}
/**
 * Angle representation object
 *
 * Reperesentation consists of four parts, visibility can be set for each
 * label - the text label with the angle size
 * vectors - lines joining the three points
 * sector - triangles representing the angle
 * arc - line bordering the sector
 *
 * @param {Structure} structure - the structure to measure angles in
 * @param {Viewer} viewer - a viewer object
 * @param {AngleRepresentationParameters} params - angle representation parameters
 */
declare class AngleRepresentation extends MeasurementRepresentation {
    protected atomTriple: (number | string)[][];
    protected vectorVisible: boolean;
    protected arcVisible: boolean;
    protected lineOpacity: number;
    protected lineWidth: number;
    protected sectorVisible: boolean;
    protected vectorBuffer: WideLineBuffer;
    arcLength: number;
    sectorLength: number;
    arcBuffer: WideLineBuffer;
    sectorBuffer: MeshBuffer;
    constructor(structure: Structure, viewer: Viewer, params: Partial<AngleRepresentationParameters>);
    init(params: Partial<AngleRepresentationParameters>): void;
    createData(sview: StructureView): {
        bufferList: (MeshBuffer | TextBuffer | WideLineBuffer)[];
    } | undefined;
    updateData(what: LabelDataField & {
        color?: boolean;
    }, data: StructureRepresentationData): void;
    setParameters(params: Partial<AngleRepresentationParameters>): this;
    setVisibility(value: boolean, noRenderRequest?: boolean): this;
}
export default AngleRepresentation;
