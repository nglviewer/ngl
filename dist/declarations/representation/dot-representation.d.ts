/**
 * @file Dot Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Representation, { RepresentationParameters } from './representation';
import FilteredVolume from '../surface/filtered-volume';
import SphereBuffer from '../buffer/sphere-buffer';
import PointBuffer from '../buffer/point-buffer';
import Surface from '../surface/surface';
import Viewer from '../viewer/viewer';
export interface DotDataFields {
    color?: boolean;
    radius?: boolean;
    scale?: boolean;
}
/**
 * Dot representation parameter object. Extends {@link RepresentationParameters}
 *
 * @typedef {Object} DotRepresentationParameters - dot representation parameters
 *
 * @property {String} thresholdType - Meaning of the threshold values. Either *value* for the literal value or *sigma* as a factor of the sigma of the data. For volume data only.
 * @property {Number} thresholdMin - Minimum value to be displayed. For volume data only.
 * @property {Number} thresholdMax - Maximum value to be displayed. For volume data only.
 * @property {Number} thresholdOut - Show only values falling outside of the treshold minumum and maximum. For volume data only.
 */
export interface DotRepresentationParameters extends RepresentationParameters {
    thresholdType: 'value' | 'value' | 'sigma' | 'sigma';
    thresholdMin: number;
    thresholdMax: number;
    thresholdOut: boolean;
    dotType: '' | 'sphere' | 'point';
    radiusType: '' | 'value' | 'abs-value' | 'value-min' | 'deviation' | 'size' | 'radius';
    radius: number;
    scale: number;
    sphereDetail: number;
    disableImpostor: boolean;
    pointSize: number;
    sizeAttenuation: boolean;
    sortParticles: boolean;
    useTexture: boolean;
    alphaTest: number;
    forceTransparent: boolean;
    edgeBleach: number;
}
/**
 * Dot representation
 */
declare class DotRepresentation extends Representation {
    protected thresholdType: 'value' | 'value' | 'sigma' | 'sigma';
    protected thresholdMin: number;
    protected thresholdMax: number;
    protected thresholdOut: boolean;
    protected dotType: '' | 'sphere' | 'point';
    protected radiusType: '' | 'value' | 'abs-value' | 'value-min' | 'deviation' | 'size' | 'radius';
    protected radius: number;
    protected scale: number;
    protected sphereDetail: number;
    protected disableImpostor: boolean;
    protected pointSize: number;
    protected sizeAttenuation: boolean;
    protected sortParticles: boolean;
    protected useTexture: boolean;
    protected alphaTest: number;
    protected forceTransparent: boolean;
    protected edgeBleach: number;
    protected surface: Surface | undefined;
    protected volume: FilteredVolume | undefined;
    protected dotBuffer: SphereBuffer | PointBuffer;
    /**
     * Create Dot representation object
     * @param {Surface|Volume} surface - the surface or volume to be represented
     * @param {Viewer} viewer - a viewer object
     * @param {DotRepresentationParameters} params - dot representation parameters
     */
    constructor(surface: Surface, viewer: Viewer, params: Partial<DotRepresentationParameters>);
    init(params: Partial<DotRepresentationParameters>): void;
    attach(callback: () => void): void;
    create(): void;
    update(what?: DotDataFields): void;
    setParameters(params: Partial<DotRepresentationParameters>, what: DotDataFields | undefined, rebuild: boolean): this;
}
export default DotRepresentation;
