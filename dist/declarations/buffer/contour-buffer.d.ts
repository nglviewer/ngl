/**
 * @file Contour Buffer
 * @author Fred ludlow <fred.ludlow@gmail.com>
 * @private
 */
import '../shader/Line.vert';
import '../shader/Line.frag';
import Buffer from './buffer';
/**
 * Contour buffer. A buffer that draws lines (instead of triangle meshes).
 */
declare class ContourBuffer extends Buffer {
    isLine: boolean;
    vertexShader: string;
    fragmentShader: string;
}
export default ContourBuffer;
