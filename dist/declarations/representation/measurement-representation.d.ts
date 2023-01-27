/**
 * @file Measurement Representation
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */
import { Vector3, Matrix4 } from 'three';
import StructureRepresentation, { StructureRepresentationParameters } from './structure-representation';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import { LabelRepresentationParameters } from './label-representation';
import TextBuffer from '../buffer/text-buffer';
import { GenericColor } from '../types';
export interface LabelDataField {
    position?: boolean;
    labelColor?: boolean;
    labelSize?: boolean;
    radius?: boolean;
    labelText?: boolean;
}
/**
 * Measurement representation parameter object.
 * @typedef {Object} MeasurementRepresentationParameters - measurement representation parameters
 * @mixes RepresentationParameters
 * @mixes StructureRepresentationParameters
 *
 * @property {Float} labelSize - size of the distance label
 * @property {Color} labelColor - color of the distance label
 * @property {Boolean} labelVisible - visibility of the distance label
 * @property {Float} labelZOffset - offset in z-direction (i.e. in camera direction)
 */
export interface MeasurementRepresentationParameters extends StructureRepresentationParameters {
    labelVisible: boolean;
    labelSize: number;
    labelColor: GenericColor;
    labelType: 'atomname' | 'atomindex' | 'occupancy' | 'bfactor' | 'serial' | 'element' | 'atom' | 'resname' | 'resno' | 'res' | 'text' | 'qualified';
    labelText: string;
    labelFormat: string;
    labelGrouping: 'atom' | 'residue';
    labelFontFamily: 'sans-serif' | 'monospace' | 'serif';
    labelFontStyle: 'normal' | 'italic';
    labelFontWeight: 'normal' | 'bold';
    labelsdf: boolean;
    labelXOffset: number;
    labelYOffset: number;
    labelZOffset: number;
    labelAttachment: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'top-left' | 'top-center' | 'top-right';
    labelBorder: boolean;
    labelBorderColor: GenericColor;
    labelBorderWidth: number;
    labelBackground: boolean;
    labelBackgroundColor: GenericColor;
    labelBackgroundMargin: number;
    labelBackgroundOpacity: number;
    labelFixedSize: boolean;
    lineOpacity: number;
    linewidth: number;
}
/**
 * Measurement representation
 * @interface
 */
declare abstract class MeasurementRepresentation extends StructureRepresentation {
    protected n: number;
    protected labelVisible: boolean;
    protected labelSize: number;
    protected labelColor: GenericColor;
    protected labelType: 'atomname' | 'atomindex' | 'occupancy' | 'bfactor' | 'serial' | 'element' | 'atom' | 'resname' | 'resno' | 'res' | 'text' | 'qualified';
    protected labelText: string;
    protected labelFormat: string;
    protected labelGrouping: 'atom' | 'residue';
    protected labelFontFamily: 'sans-serif' | 'monospace' | 'serif';
    protected labelFontStyle: 'normal' | 'italic';
    protected labelFontWeight: 'normal' | 'bold';
    protected labelsdf: boolean;
    protected labelXOffset: number;
    protected labelYOffset: number;
    protected labelZOffset: number;
    protected labelAttachment: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'top-left' | 'top-center' | 'top-right';
    protected labelBorder: boolean;
    protected labelBorderColor: GenericColor;
    protected labelBorderWidth: number;
    protected labelBackground: boolean;
    protected labelBackgroundColor: GenericColor;
    protected labelBackgroundMargin: number;
    protected labelBackgroundOpacity: number;
    protected labelFixedSize: boolean;
    protected lineOpacity: number;
    protected linewidth: number;
    protected lineVisible: boolean;
    protected textBuffer: TextBuffer;
    /**
     * Handles common label settings and position logic for
     * distance, angle and dihedral representations
     */
    constructor(structure: Structure, viewer: Viewer, params: Partial<MeasurementRepresentationParameters>);
    init(params: Partial<MeasurementRepresentationParameters>): void;
    update(what: LabelDataField): void;
    updateData(what: LabelDataField & {
        [k: string]: any;
    }, data: any): void;
    setParameters(params: Partial<MeasurementRepresentationParameters>, what?: LabelDataField, rebuild?: boolean): this;
    setVisibility(value: boolean, noRenderRequest?: boolean): this;
    getLabelBufferParams(params?: Partial<LabelRepresentationParameters>): {
        clipNear: number;
        clipRadius: number;
        clipCenter: Vector3;
        flatShaded: boolean;
        opacity: number;
        depthWrite: boolean;
        side: import("../buffer/buffer").BufferSide;
        wireframe: boolean;
        roughness: number;
        metalness: number;
        diffuse: GenericColor;
        diffuseInterior: boolean | undefined;
        useInteriorColor: boolean | undefined;
        interiorColor: GenericColor;
        interiorDarkening: number;
        matrix: Matrix4;
        disablePicking: boolean;
    } & {
        [k: string]: any;
    };
    getAtomRadius(): number;
}
/**
 * MeasurementRepresentations take atom[Pair|Triple|Quad] parameters.
 *
 * Parses nested array of either integer atom indices or selection
 * expressions into a flat array of coordinates.
 *
 * @param  {Structure} sview The structure to which the atoms refer
 * @param  {Array} atoms Nested array of atom pairs|triples|quads as
 *   Integer indices or selection expressions
 * @return {Float32Array} Flattened array of position coordinates
 */
declare function parseNestedAtoms(sview: StructureView, atoms: (number | string)[][]): Float32Array;
declare function calcArcPoint(out: Float32Array, center: Float32Array, v1: Float32Array, v2: Float32Array, angle: number): void;
export { MeasurementRepresentation as default, calcArcPoint, parseNestedAtoms };
