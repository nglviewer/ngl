/**
 * @file Line Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation';
import WideLineBuffer from '../buffer/wideline-buffer';
import { AtomPicker } from '../utils/picker';
import { Structure, Volume } from '../ngl';
import StructureView from '../structure/structure-view';
import Viewer from '../viewer/viewer';
import AtomProxy from '../proxy/atom-proxy';
import Surface from '../surface/surface';
import { BondDataFields, BondDataParams } from '../structure/structure-data';
export interface LineRepresentationParameters extends StructureRepresentationParameters {
    multipleBond: 'off' | 'symmetric' | 'offset';
    bondSpacing: number;
    linewidth: number;
    lines: boolean;
    crosses: 'off' | 'all' | 'lone';
    crossSize: number;
}
export interface CrossData {
    position1?: Float32Array;
    position2?: Float32Array;
    color?: Float32Array;
    color2?: Float32Array;
    picking?: AtomPicker;
}
/**
 * Line representation
 */
declare class LineRepresentation extends StructureRepresentation {
    protected multipleBond: 'off' | 'symmetric' | 'offset';
    protected bondSpacing: number;
    protected linewidth: number;
    protected lines: boolean;
    protected crosses: 'off' | 'all' | 'lone';
    protected crossSize: number;
    /**
     * Create Line representation object
     * @param {Structure} structure - the structure to be represented
     * @param {Viewer} viewer - a viewer object
     * @param {RepresentationParameters} params - representation parameters, plus the properties listed below
     * @property {String} multipleBond - one off "off", "symmetric", "offset"
     * @param {Float} params.bondSpacing - spacing for multiple bond rendering
     * @param {Integer} params.linewidth - width of lines
     * @param {Boolean} params.lines - render bonds as lines
     * @param {String} params.crosses - render atoms as crosses: "off", "all" or "lone" (default)
     * @param {Float} params.crossSize - size of cross
     * @param {null} params.flatShaded - not available
     * @param {null} params.side - not available
     * @param {null} params.wireframe - not available
     * @param {null} params.roughness - not available
     * @param {null} params.metalness - not available
     * @param {null} params.diffuse - not available
     */
    constructor(structure: Structure, viewer: Viewer, params: Partial<LineRepresentationParameters>);
    init(params: Partial<LineRepresentationParameters>): void;
    getAtomRadius(atom: AtomProxy): number;
    getBondParams(what: any, params?: Partial<LineRepresentationParameters>): {
        what: BondDataFields | undefined;
        colorParams: {
            structure: Structure;
            scheme: string;
            volume?: Volume | undefined;
            surface?: Surface | undefined;
            data?: import("../color/colormaker").ColorData | undefined;
            scale: string | string[];
            mode: import("../color/colormaker").ColorMode;
            domain: number[];
            value: number;
            reverse: boolean;
        };
        radiusParams: {
            type: "" | "data" | "size" | "explicit" | "vdw" | "covalent" | "sstruc" | "bfactor";
            scale: number;
            size: number;
            data: {
                [k: number]: number;
            };
        };
    } & BondDataParams;
    _crossData(what: any, sview: StructureView): CrossData | undefined;
    createData(sview: StructureView): {
        bufferList: WideLineBuffer[];
    };
    updateData(what: any, data: StructureRepresentationData): void;
    setParameters(params: Partial<LineRepresentationParameters>): this;
}
export default LineRepresentation;
