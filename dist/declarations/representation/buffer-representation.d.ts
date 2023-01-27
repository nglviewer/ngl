/**
 * @file Buffer Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
/// <reference types="node" />
import Representation, { RepresentationParameters } from './representation';
import Viewer from '../viewer/viewer';
/**
 * Representation for showing buffer objects. Good for efficiently showing
 * large amounts of geometric primitives e.g. spheres via {@link SphereBuffer}.
 * Smaller numbers of geometric primitives are more easily shown with help
 * from the {@link Shape} class.
 *
 * __Name:__ _buffer_
 *
 * @example
 * // add a single red sphere from a buffer to a shape instance
 * var shape = new NGL.Shape( "shape" );
 * var sphereBuffer = new NGL.SphereBuffer( {
 *     position: new Float32Array( [ 0, 0, 0 ] ),
 *     color: new Float32Array( [ 1, 0, 0 ] ),
 *     radius: new Float32Array( [ 1 ] )
 * } );
 * shape.addBuffer( sphereBuffer );
 * var shapeComp = stage.addComponentFromObject( shape );
 * shapeComp.addRepresentation( "buffer" );
 *
 * @example
 * // add a single red sphere from a buffer to a structure component instance
 * stage.loadFile( "rcsb://1crn" ).then( function( o ){
 *     var sphereBuffer = new NGL.SphereBuffer( {
 *         position: new Float32Array( [ 0, 0, 0 ] ),
 *         color: new Float32Array( [ 1, 0, 0 ] ),
 *         radius: new Float32Array( [ 1 ] )
 *     } );
 *     o.addBufferRepresentation( sphereBuffer, { opacity: 0.5 } );
 * } );
 */
declare class BufferRepresentation extends Representation {
    buffer: Buffer[];
    /**
     * Create Buffer representation
     * @param {Buffer} buffer - a buffer object
     * @param {Viewer} viewer - a viewer object
     * @param {RepresentationParameters} params - representation parameters
     */
    constructor(buffer: Buffer | Buffer[], viewer: Viewer, params: Partial<RepresentationParameters>);
    init(params: Partial<RepresentationParameters>): void;
    create(): void;
    attach(callback: () => void): void;
}
export default BufferRepresentation;
