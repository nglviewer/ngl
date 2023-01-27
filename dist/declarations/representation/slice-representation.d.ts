/**
 * @file Slice Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Representation, { RepresentationParameters } from './representation';
import Viewer from '../viewer/viewer';
import { Volume } from '../ngl';
/**
 * Slice representation parameter object. Extends {@link RepresentationParameters}
 *
 * @typedef {Object} SliceRepresentationParameters - slice representation parameters
 *
 * @property {String} filter - filter applied to map the volume data on the slice, one of "nearest", "linear", "cubic-bspline", "cubic-catmulrom", "cubic-mitchell".
 * @property {String} positionType - Meaning of the position value. Either "percent" od "coordinate".
 * @property {Number} position - position of the slice.
 * @property {String} dimension - one of "x", "y" or "z"
 * @property {String} thresholdType - Meaning of the threshold values. Either *value* for the literal value or *sigma* as a factor of the sigma of the data. For volume data only.
 * @property {Number} thresholdMin - Minimum value to be displayed. For volume data only.
 * @property {Number} thresholdMax - Maximum value to be displayed. For volume data only.
 * @property {Boolean} normalize - Flag indicating wheather to normalize the data in a slice when coloring.
 */
export interface SliceRepresentationParameters extends RepresentationParameters {
    filter: 'nearest' | 'linear' | 'cubic-bspline' | 'cubic-catmulrom' | 'cubic-mitchell';
    positionType: 'percent' | 'coordinate';
    position: number;
    dimension: 'x' | 'y' | 'z';
    thresholdType: 'value' | 'sigma';
    thresholdMin: number;
    thresholdMax: number;
    normalize: boolean;
}
/**
 * Slice representation
 */
declare class SliceRepresentation extends Representation {
    protected filter: 'nearest' | 'linear' | 'cubic-bspline' | 'cubic-catmulrom' | 'cubic-mitchell';
    protected positionType: 'percent' | 'coordinate';
    protected position: number;
    protected dimension: 'x' | 'y' | 'z';
    protected thresholdType: 'value' | 'sigma';
    protected thresholdMin: number;
    protected thresholdMax: number;
    protected normalize: boolean;
    protected volume: Volume;
    /**
     * Create Slice representation object
     * @param {Volume} surface - the volume to be represented
     * @param {Viewer} viewer - a viewer object
     * @param {SliceRepresentationParameters} params - slice representation parameters
     */
    constructor(volume: Volume, viewer: Viewer, params: Partial<SliceRepresentationParameters>);
    init(params: Partial<SliceRepresentationParameters>): void;
    attach(callback: () => void): void;
    create(): void;
}
export default SliceRepresentation;
