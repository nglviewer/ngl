/**
 * @file Ply Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import SurfaceParser from './surface-parser';
/**
 * PLYLoader
 * @class
 * @private
 * @author Wei Meng / http://about.me/menway
 *
 * @description
 * A THREE loader for PLY ASCII files (known as the Polygon File Format or the Stanford Triangle Format).
 *
 * Limitations: ASCII decoding assumes file is UTF-8.
 *
 * @example
 * var loader = new THREE.PLYLoader();
 * loader.load('./models/ply/ascii/dolphins.ply', function (geometry) {
 *     scene.add( new THREE.Mesh( geometry ) );
 * } );
 *
 * // If the PLY file uses non standard property names, they can be mapped while
 * // loading. For example, the following maps the properties
 * // “diffuse_(red|green|blue)” in the file to standard color names.
 *
 * loader.setPropertyNameMapping( {
 *     diffuse_red: 'red',
 *     diffuse_green: 'green',
 *     diffuse_blue: 'blue'
 * } );
 *
 */
export interface _PLYLoader {
    propertyNameMapping: {
        [k: string]: string;
    };
}
declare class PlyParser extends SurfaceParser {
    get type(): string;
    getLoader(): _PLYLoader;
}
export default PlyParser;
