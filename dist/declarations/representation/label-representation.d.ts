/**
 * @file Label Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { LabelType } from '../utils/label-factory';
import StructureRepresentation, { StructureRepresentationData } from './structure-representation';
import TextBuffer from '../buffer/text-buffer';
import { RepresentationParameters } from './representation';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import { GenericColor } from '../types';
export interface TextDataField {
    position?: boolean;
    color?: boolean;
    radius?: boolean;
    text?: boolean;
}
/**
 * Label representation parameter object. Extends {@link RepresentationParameters} and
 * {@link StructureRepresentationParameters}.
 *
 * @typedef {Object} LabelRepresentationParameters - label representation parameters
 *
 * @property {Integer} clipNear - position of camera near/front clipping plane
 *                                in percent of scene bounding box
 * @property {Float} opacity - translucency: 1 is fully opaque, 0 is fully transparent
 * @property {String} labelType - type of the label, one of:
 *                                 "atomname", "atomindex", "occupancy", "bfactor",
 *                                 "serial", "element", "atom", "resname", "resno",
 *                                 "res", "text", "qualified". When set to "text", the
 *                                 `labelText` list is used.
 * @property {String[]} labelText - list of label strings, must set `labelType` to "text"
 *                                   to take effect
 * @property {String} labelFormat - sprintf-js format string, any attribute of
 *                                  {@link  AtomProxy} can be used
 * @property {String} labelGrouping - grouping of the label, one of:
 *                                 "atom", "residue".
 * @property {String} fontFamily - font family, one of: "sans-serif", "monospace", "serif"
 * @property {String} fontStyle - font style, "normal" or "italic"
 * @property {String} fontWeight - font weight, "normal" or "bold"
 * @property {Float} xOffset - offset in x-direction
 * @property {Float} yOffset - offset in y-direction
 * @property {Float} zOffset - offset in z-direction (i.e. in camera direction)
 * @property {String} attachment - attachment of the label, one of:
 *                                 "bottom-left", "bottom-center", "bottom-right",
 *                                 "middle-left", "middle-center", "middle-right",
 *                                 "top-left", "top-center", "top-right"
 * @property {Boolean} showBorder - show border/outline
 * @property {Color} borderColor - color of the border/outline
 * @property {Float} borderWidth - width of the border/outline
 * @property {Boolean} showBackground - show background rectangle
 * @property {Color} backgroundColor - color of the background
 * @property {Float} backgroundMargin - width of the background
 * @property {Float} backgroundOpacity - opacity of the background
 * @property {Boolean} fixedSize - show text with a fixed pixel size
 */
export interface LabelRepresentationParameters extends RepresentationParameters {
    labelType: LabelType;
    labelText: string[];
    labelFormat: string;
    labelGrouping: 'atom' | 'residue';
    fontFamily: 'sans-serif' | 'monospace' | 'serif';
    fontStyle: 'normal' | 'italic';
    fontWeight: 'normal' | 'bold';
    xOffset: number;
    yOffset: number;
    zOffset: number;
    attachment: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'top-left' | 'top-center' | 'top-right';
    showBorder: boolean;
    borderColor: GenericColor;
    borderWidth: number;
    showBackground: boolean;
    backgroundColor: GenericColor;
    backgroundMargin: number;
    backgroundOpacity: number;
    fixedSize: boolean;
}
/**
 * Label representation
 */
declare class LabelRepresentation extends StructureRepresentation {
    protected labelType: LabelType;
    protected labelText: string[];
    protected labelFormat: string;
    protected labelGrouping: 'atom' | 'residue';
    protected fontFamily: 'sans-serif' | 'monospace' | 'serif';
    protected fontStyle: 'normal' | 'italic';
    protected fontWeight: 'normal' | 'bold';
    protected xOffset: number;
    protected yOffset: number;
    protected zOffset: number;
    protected attachment: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'top-left' | 'top-center' | 'top-right';
    protected showBorder: boolean;
    protected borderColor: GenericColor;
    protected borderWidth: number;
    protected showBackground: boolean;
    protected backgroundColor: GenericColor;
    protected backgroundMargin: number;
    protected backgroundOpacity: number;
    protected fixedSize: boolean;
    /**
     * Create Label representation object
     * @param {Structure} structure - the structure to be represented
     * @param {Viewer} viewer - a viewer object
     * @param {LabelRepresentationParameters} params - label representation parameters
     */
    constructor(structure: Structure, viewer: Viewer, params: Partial<LabelRepresentationParameters>);
    init(params: Partial<LabelRepresentationParameters>): void;
    getTextData(sview: StructureView, what?: TextDataField): {
        position: Float32Array;
        size: Float32Array;
        color: Float32Array;
        text: string[];
    };
    createData(sview: StructureView): {
        bufferList: TextBuffer[];
    };
    updateData(what: TextDataField, data: StructureRepresentationData): void;
    getAtomRadius(): number;
}
export default LabelRepresentation;
