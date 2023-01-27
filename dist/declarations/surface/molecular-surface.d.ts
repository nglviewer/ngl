/**
 * @file Molecular Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Worker from '../worker/worker';
import Surface, { SurfaceData } from './surface';
import { Structure } from '../ngl';
import { AtomData, RadiusParams } from '../structure/structure-data';
/**
 * Molecular surface parameter object.
 * @typedef {Object} MolecularSurfaceParameters - stage parameters
 * @property {String} type - "av" or "edt"
 * @property {Number} probeRadius - probe radius
 * @property {Number} scaleFactor - higher for better quality
 * @property {Integer} smooth - number of smoothing cycles to apply
 * @property {String} name - name for created surface
 */
export interface MolecularSurfaceParameters {
    type: 'av' | 'edt';
    probeRadius: number;
    scaleFactor: number;
    smooth: number;
    name: string;
    cutoff: number;
    contour: boolean;
    radiusParams: RadiusParams;
}
/**
 * Create Molecular surfaces
 */
declare class MolecularSurface {
    structure: Structure;
    worker: Worker | undefined;
    constructor(structure: Structure);
    _getAtomData(params: Partial<MolecularSurfaceParameters>): AtomData;
    _makeSurface(sd: SurfaceData, p: Partial<MolecularSurfaceParameters>): Surface;
    /**
     * Get molecular surface
     * @param {MolecularSurfaceParameters} params - parameters for surface creation
     * @return {Surface} the surface
     */
    getSurface(params: Partial<MolecularSurfaceParameters>): Surface;
    /**
     * Get molecular surface asynchronous
     * @param {MolecularSurfaceParameters} params - parameters for surface creation
     * @param {function(surface: Surface)} callback - function to be called after surface is created
     * @return {undefined}
     */
    getSurfaceWorker(params: MolecularSurfaceParameters, callback: (s: Surface) => void): void;
    /**
     * Cleanup
     * @return {undefined}
     */
    dispose(): void;
}
export default MolecularSurface;
