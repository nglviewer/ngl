/**
 * @file STL Writer
 * @author Paul Pillot <paul.pillot@cimf.ca>
 * @private
 */
import Writer from './writer';
import Surface from '../surface/surface';
/**
 * Create an STL File from a surface Object (e.g. for 3D printing)
 *
 * @example
 * molsurf = new MolecularSurface(structure)
 * surf = molsurf.getSurface({type: 'av', probeRadius: 1.4})
 * stl = new StlWriter(surf)
 * stl.download('myFileName')
 */
export default class StlWriter extends Writer {
    readonly mimeType = "application/vnd.ms-pki.stl";
    readonly defaultName = "surface";
    readonly defaultExt = "stl";
    surface: any;
    /**
     * @param {Surface} surface - the surface to write out
     */
    constructor(surface: Surface);
    getData(): DataView;
}
