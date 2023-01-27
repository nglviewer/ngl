/**
 * @file Surface Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4, Vector3, Box3 } from 'three';
import Representation, { RepresentationParameters } from './representation';
import Volume from '../surface/volume';
import Surface from '../surface/surface';
import Viewer from '../viewer/viewer';
import { ColormakerParameters } from '../color/colormaker';
export declare type SurfaceDataFields = {
    position: boolean;
    color: boolean;
    index: boolean;
    normal: boolean;
    radius: boolean;
};
/**
 * Surface representation parameter object. Extends {@link RepresentationParameters}
 *
 * @typedef {Object} SurfaceRepresentationParameters - surface representation parameters
 *
 * @property {String} isolevelType - Meaning of the isolevel value. Either *value* for the literal value or *sigma* as a factor of the sigma of the data. For volume data only.
 * @property {Float} isolevel - The value at which to create the isosurface. For volume data only.
 * @property {Boolean} negateIsolevel - For volume data only.
 * @property {Boolean} isolevelScroll - For volume data only
 * @property {Integer} smooth - How many iterations of laplacian smoothing after surface triangulation. For volume data only.
 * @property {Boolean} background - Render the surface in the background, unlit.
 * @property {Boolean} opaqueBack - Render the back-faces (where normals point away from the camera) of the surface opaque, ignoring the transparency parameter.
 * @property {Integer} boxSize - Size of the box to triangulate volume data in. Set to zero to triangulate the whole volume. For volume data only.
 * @property {Boolean} useWorker - Weather or not to triangulate the volume asynchronously in a Web Worker. For volume data only.
 * @property {Boolean} wrap - Wrap volume data around the edges; use in conjuction with boxSize but not larger than the volume dimension. For volume data only.
 */
export interface SurfaceRepresentationParameters extends RepresentationParameters {
    isolevelType: 'value' | 'sigma';
    isolevel: number;
    smooth: number;
    background: boolean;
    opaqueBack: boolean;
    boxSize: number;
    useWorker: boolean;
    wrap: boolean;
}
/**
 * Surface representation
 */
/**
   * Create Surface representation object
   * @param {Surface|Volume} surface - the surface or volume to be represented
   * @param {Viewer} viewer - a viewer object
   * @param {SurfaceRepresentationParameters} params - surface representation parameters
   */
declare class SurfaceRepresentation extends Representation {
    protected surface: Surface | Volume | undefined;
    protected volume: Volume | undefined;
    protected boxCenter: Vector3;
    protected __boxCenter: Vector3;
    protected box: Box3;
    protected __box: Box3;
    protected _position: Vector3;
    protected isolevelType: 'value' | 'sigma';
    protected isolevel: number;
    protected negateIsolevel: boolean;
    protected isolevelScroll: boolean;
    protected smooth: number;
    protected background: boolean;
    protected opaqueBack: boolean;
    protected boxSize: number;
    protected inverseMatrix: Matrix4;
    protected colorVolume: Volume;
    protected contour: boolean;
    protected useWorker: boolean;
    protected wrap: boolean;
    protected __isolevel: number;
    protected __smooth: number;
    protected __contour: boolean;
    protected __wrap: boolean;
    protected __boxSize: number;
    setBox: () => void;
    constructor(surface: Surface, viewer: Viewer, params: Partial<SurfaceRepresentationParameters>);
    init(params: Partial<SurfaceRepresentationParameters>): void;
    attach(callback: () => void): void;
    prepare(callback: () => void): void;
    create(): void;
    update(what: SurfaceDataFields): void;
    /**
     * Set representation parameters
     * @alias SurfaceRepresentation#setParameters
     * @param {SurfaceRepresentationParameters} params - surface parameter object
     * @param {Object} [what] - buffer data attributes to be updated,
     *                        note that this needs to be implemented in the
     *                        derived classes. Generally it allows more
     *                        fine-grained control over updating than
     *                        forcing a rebuild.
     * @param {Boolean} what.position - update position data
     * @param {Boolean} what.color - update color data
     * @param {Boolean} [rebuild] - whether or not to rebuild the representation
     * @return {SurfaceRepresentation} this object
     */
    setParameters(params: Partial<SurfaceRepresentationParameters>, what?: SurfaceDataFields, rebuild?: boolean): this;
    getColorParams(): {
        [k: string]: any;
        scheme: string;
    } & ColormakerParameters;
    dispose(): void;
}
export default SurfaceRepresentation;
