/**
 * @file Dihedral Histogram Representation
 * @author Rudolfs Petrovs <rudolfs.petrovs@astx.com>
 * @private
 */
import { Color } from 'three';
import StructureRepresentation, { StructureRepresentationParameters } from './structure-representation';
import { Structure } from '../ngl';
import StructureView from '../structure/structure-view';
import Viewer from '../viewer/viewer';
declare type ColorDefinition = Color | string | number | undefined;
interface HistogramColorParameters {
    histogramBinBorderColor: ColorDefinition;
    adjacentBondArrowColor: ColorDefinition;
    distantBondArrowColor: ColorDefinition;
    frontHistogramColor: ColorDefinition;
    backHistogramColor: ColorDefinition;
    opaqueMiddleDiscColor: ColorDefinition;
}
interface HistogramInputData extends Partial<HistogramColorParameters> {
    atomQuad: (number | string)[];
    histogram360: number[];
}
interface HistogramData extends HistogramInputData {
    atomPositions: Float32Array;
    histogram360Scaled: number[];
}
/**
 * @typedef {Object} DihedralHistogramRepresentationParameters - dihedral representation parameters
 * @mixes RepresentationParameters
 * @mixes StructureRepresentationParameters
 *
 * @property {HistogramInputData[]} histogramsData
 * List of HistogramInputData objects, which properties specifies each particular
 * histogram, and can contain particular histogram-specific parameters.
 * Obligatory properties are:
 * atomQuad - Quadruplet of selection strings or atom indices
 * histogram360 - List of values, representing histogram from 0 to 360 degrees.
 * @property {Boolean} histogramBinBorderVisible - Display the lines that separate circular histogram bins
 * @property {Boolean} scaleBinToSectorArea - Should sector-based histogram bins'
 * area be proportional to the bins' value
 */
export interface DihedralHistogramRepresentationParameters extends StructureRepresentationParameters {
    histogramsData: HistogramInputData[];
    histogramBinBorderVisible: boolean;
    scaleBinToSectorArea: boolean;
}
/**
 * Dihedral Histogram representation object
 *
 * Reperesentation consists of several parts:
 * opaqueMiddleDisc - opaque disc in the middle of the dihedral between front and back histograms
 * frontHistogram - circular histogram from the adjacent bond viewpoint
 * backHistogram - circular histogram from the distant bond viewpoint
 * histogramBinBorder - lines, which separate histogram bins
 * bondArrows - lines, which show the actual angle on the histogram disc
 *
 * @param {Structure} structure - the structure to measure angles in
 * @param {Viewer} viewer - a viewer object
 * @param {DihedralHistogramRepresentationParameters} params - Dihedral histogram representation parameters
 */
declare class DihedralHistogramRepresentation extends StructureRepresentation {
    protected histogramsData: HistogramData[];
    protected histogramBinBorderVisible: boolean;
    protected histogramBinBorderWidth: number;
    protected histogramBinBorderColor: ColorDefinition;
    protected histogramBinBorderOpacity: number;
    protected bondArrowVisible: boolean;
    protected bondArrowWidth: number;
    protected bondArrowOpacity: number;
    protected adjacentBondArrowColor: ColorDefinition;
    protected distantBondArrowColor: ColorDefinition;
    protected histogramOpacity: number;
    protected frontHistogramColor: ColorDefinition;
    protected backHistogramColor: ColorDefinition;
    protected opaqueMiddleDiscVisible: boolean;
    protected opaqueMiddleDiscColor: ColorDefinition;
    protected opaqueMiddleDiscOpacity: number;
    protected scaleBinToSectorArea: boolean;
    constructor(structure: Structure, viewer: Viewer, params: DihedralHistogramRepresentationParameters);
    init(params: Partial<DihedralHistogramRepresentationParameters>): void;
    getHistogramBinBorderBufferParameters(): {
        clipNear: number;
        clipRadius: number;
        clipCenter: import("three").Vector3;
        flatShaded: boolean;
        opacity: number;
        depthWrite: boolean;
        side: import("../buffer/buffer").BufferSide;
        wireframe: boolean;
        roughness: number;
        metalness: number;
        diffuse: import("../types").GenericColor;
        diffuseInterior: boolean | undefined;
        useInteriorColor: boolean | undefined;
        interiorColor: import("../types").GenericColor;
        interiorDarkening: number;
        matrix: import("three").Matrix4;
        disablePicking: boolean;
    } & {
        [k: string]: any;
    };
    getBondArrowsBufferParameters(): {
        clipNear: number;
        clipRadius: number;
        clipCenter: import("three").Vector3;
        flatShaded: boolean;
        opacity: number;
        depthWrite: boolean;
        side: import("../buffer/buffer").BufferSide;
        wireframe: boolean;
        roughness: number;
        metalness: number;
        diffuse: import("../types").GenericColor;
        diffuseInterior: boolean | undefined;
        useInteriorColor: boolean | undefined;
        interiorColor: import("../types").GenericColor;
        interiorDarkening: number;
        matrix: import("three").Matrix4;
        disablePicking: boolean;
    } & {
        [k: string]: any;
    };
    getOpaqueMiddleDiscBufferParameters(): {
        clipNear: number;
        clipRadius: number;
        clipCenter: import("three").Vector3;
        flatShaded: boolean;
        opacity: number;
        depthWrite: boolean;
        side: import("../buffer/buffer").BufferSide;
        wireframe: boolean;
        roughness: number;
        metalness: number;
        diffuse: import("../types").GenericColor;
        diffuseInterior: boolean | undefined;
        useInteriorColor: boolean | undefined;
        interiorColor: import("../types").GenericColor;
        interiorDarkening: number;
        matrix: import("three").Matrix4;
        disablePicking: boolean;
    } & {
        [k: string]: any;
    };
    getHistogramBufferParameters(): {
        clipNear: number;
        clipRadius: number;
        clipCenter: import("three").Vector3;
        flatShaded: boolean;
        opacity: number;
        depthWrite: boolean;
        side: import("../buffer/buffer").BufferSide;
        wireframe: boolean;
        roughness: number;
        metalness: number;
        diffuse: import("../types").GenericColor;
        diffuseInterior: boolean | undefined;
        useInteriorColor: boolean | undefined;
        interiorColor: import("../types").GenericColor;
        interiorDarkening: number;
        matrix: import("three").Matrix4;
        disablePicking: boolean;
    } & {
        [k: string]: any;
    };
    createData(sview: StructureView): {
        bufferList: never[];
    } | undefined;
    setParameters(params: Partial<DihedralHistogramRepresentationParameters>): this;
    setVisibility(value: boolean, noRenderRequest?: boolean): this;
}
export default DihedralHistogramRepresentation;
