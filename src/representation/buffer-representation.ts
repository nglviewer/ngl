/**
 * @file Buffer Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Representation, { RepresentationParameters } from './representation'
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
class BufferRepresentation extends Representation {
  buffer: Buffer[]
  /**
   * Create Buffer representation
   * @param {Buffer} buffer - a buffer object
   * @param {Viewer} viewer - a viewer object
   * @param {RepresentationParameters} params - representation parameters
   */
  constructor (buffer: Buffer|Buffer[], viewer: Viewer, params: Partial<RepresentationParameters>) {
    if (!Array.isArray(buffer)) {
      buffer = [ buffer ]
    }

    super(buffer, viewer, params)

    this.type = 'buffer'

    this.parameters = Object.assign({

    }, this.parameters, {

      colorScheme: null,
      colorScale: null,
      colorValue: null,
      colorDomain: null,
      colorMode: null

    })

    this.buffer = buffer

    this.init(params)
  }

  init (params: Partial<RepresentationParameters>) {
    super.init(params)

    this.build()
  }

  create () {
    this.bufferList.push.apply(this.bufferList, this.buffer)
  }

  attach (callback: ()=> void) {
    this.bufferList.forEach(buffer => {
      this.viewer.add(buffer)
      buffer.setParameters(this.getBufferParams())
    })
    this.setVisibility(this.visible)

    callback()
  }
}

export default BufferRepresentation
