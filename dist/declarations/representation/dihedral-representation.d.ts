import MeasurementRepresentation, { MeasurementRepresentationParameters, LabelDataField } from './measurement-representation';
import MeshBuffer from '../buffer/mesh-buffer';
import TextBuffer from '../buffer/text-buffer';
import WideLineBuffer from '../buffer/wideline-buffer';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import { StructureRepresentationData } from './structure-representation';
/**
 * @typedef {Object} DihedralRepresentationParameters - dihedral representation parameters
 * @mixes RepresentationParameters
 * @mixes StructureRepresentationParameters
 * @mixes MeasurementRepresentationParameters
 *
 * @property {String} atomQuad - list of quadruplets of selection strings
 *                               or atom indices
 * @property {Boolean} extendLine - Extend lines in planes
 * @property {Number} lineOpacity - Opacity for the line part of the representation
 * @property {Boolean} lineVisible - Display the line part of the representation
 * @property {Number} linewidth - width for line part of representation
 * @property {Boolean} planeVisible - Display the two planes corresponding to dihedral
 * @property {Boolean} sectorVisible - Display the filled arc for each angle
 */
export interface DihedralRepresentationParameters extends MeasurementRepresentationParameters {
    atomQuad: (number | string)[][];
    extendLine: boolean;
    lineOpacity: number;
    lineVisible: boolean;
    linewidth: number;
    planeVisible: boolean;
    sectorVisible: boolean;
}
/**
 * Dihedral representation object
 *
 * Reperesentation consists of three parts, visibility can be set for each
 * label - text label indicating dihedral angle
 * line - line indicating four positions that define the dihedral
 * sector - filled arc section
 *
 * @param {Structure} structure - the structure to measure angles in
 * @param {Viewer} viewer - a viewer object
 * @param {AngleRepresentationParameters} params - angle representation parameters
 */
declare class DihedralRepresentation extends MeasurementRepresentation {
    protected atomQuad: (number | string)[][];
    protected extendLine: boolean;
    protected lineOpacity: number;
    protected lineVisible: boolean;
    protected linewidth: number;
    protected planeVisible: boolean;
    protected sectorVisible: boolean;
    protected lineLength: number;
    protected planeLength: number;
    protected sectorLength: number;
    protected lineBuffer: WideLineBuffer;
    protected planeBuffer: MeshBuffer;
    protected sectorBuffer: MeshBuffer;
    constructor(structure: Structure, viewer: Viewer, params: Partial<DihedralRepresentationParameters>);
    init(params: Partial<DihedralRepresentationParameters>): void;
    createData(sview: StructureView): {
        bufferList: (MeshBuffer | TextBuffer | WideLineBuffer)[];
    } | undefined;
    updateData(what: LabelDataField & {
        color?: boolean;
    }, data: StructureRepresentationData): void;
    setParameters(params: Partial<DihedralRepresentationParameters>): this;
    setVisibility(value: boolean, noRenderRequest?: boolean): this;
}
export default DihedralRepresentation;
