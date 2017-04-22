/**
 * @file Buffer Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Representation from "./representation.js";


/**
 * Representation for showing buffer objects
 */
class BufferRepresentation extends Representation{

    /**
     * Create Buffer representation
     * @param {SphereBuffer|CylinderBuffer} buffer - a buffer object
     * @param {Viewer} viewer - a viewer object
     * @param {RepresentationParameters} params - representation parameters
     */
    constructor( buffer, viewer, params ){

        if( !Array.isArray( buffer ) ){
            buffer = [ buffer ];
        }

        super( buffer, viewer, params );

        this.type = "buffer";

        this.parameters = Object.assign( {

        }, this.parameters, {

            colorScheme: null,
            colorScale: null,
            colorValue: null,
            colorDomain: null,
            colorMode: null

        } )

        this.buffer = buffer;

        this.init( params );

    }

    init( params ){

        super.init( params );

        this.build();

    }

    create(){

        this.bufferList.push.apply( this.bufferList, this.buffer );

    }

    attach( callback ){

        this.bufferList.forEach( buffer => {
            this.viewer.add( buffer );
            buffer.setParameters( this.getBufferParams() );
        } );
        this.setVisibility( this.visible );

        callback();

    }

}


export default BufferRepresentation;
