/**
 * @file Slice Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import Representation from "./representation.js";
import ImageBuffer from "../buffer/image-buffer.js";


function SliceRepresentation( volume, viewer, params ){

    Representation.call( this, volume, viewer, params );

    this.volume = volume;

    this.build();

}

SliceRepresentation.prototype = Object.assign( Object.create(

    Representation.prototype ), {

    constructor: SliceRepresentation,

    type: "slice",

    parameters: Object.assign( {



    }, Representation.prototype.parameters, {

        colorScheme: {
            type: "select", update: "color", options: {
                "": "",
                "value": "value",
                "uniform": "uniform",
            }
        },

    } ),

    init: function( params ){

        var p = params || {};
        p.colorScheme = defaults( p.colorScheme, "uniform" );
        p.colorValue = defaults( p.colorValue, 0xDDDDDD );

        Representation.prototype.init.call( this, p );

    },

    attach: function( callback ){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );

        }, this );

        this.setVisibility( this.visible );

        callback();

    },

    create: function(){

        var v = this.volume;
        v.makeDataPosition();
        var dp = v.getDataPosition();

        function index( x, y, z, i ){
            return ( ( ( ( x * v.ny ) + y ) * v.nx ) + z ) * 3 + i;
        }

        var x = 30;
        var y = v.ny-1;
        var z = v.nz-1;

        var position = new Float32Array([
            dp[ index( x, 0, 0, 0 ) ], dp[ index( x, 0, 0, 1 ) ], dp[ index( x, 0, 0, 2 ) ],
            dp[ index( x, y, 0, 0 ) ], dp[ index( x, y, 0, 1 ) ], dp[ index( x, y, 0, 2 ) ],
            dp[ index( x, y, z, 0 ) ], dp[ index( x, y, z, 1 ) ], dp[ index( x, y, z, 2 ) ],
            dp[ index( x, y, 0, 0 ) ], dp[ index( x, y, 0, 1 ) ], dp[ index( x, y, 0, 2 ) ]
        ]);

        // var position = new Float32Array([
        //     -10, 10, 0,
        //     10, 10, 0,
        //     -10, -10, 0,
        //     10, -10, 0
        // ]);

        var width = v.ny;
        var height = v.nz
        var data = new Uint8Array( width * height * 4 );

        var x = 0;
        var y = 0;

        for ( var i = 0, il = data.length; i < il; i += 4 ) {

            data[ i     ] = 100;
            data[ i + 1 ] = 0;
            data[ i + 2 ] = 100;
            data[ i + 3 ] = 255;

            if( ++x === width ){
                x = 0;
                y++;
            }

        }
        console.log(data)

        var sliceBuffer = new ImageBuffer( position, data, width, height );

        this.bufferList.push( sliceBuffer );

    }

} );


export default SliceRepresentation;
