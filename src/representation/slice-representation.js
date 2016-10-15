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

        position: {
            type: "integer", precision: 1, max: 100, min: 1,
            rebuild: true
        },
        thresholdType: {
            type: "select", rebuild: true, options: {
                "value": "value", "sigma": "sigma"
            }
        },
        thresholdMin: {
            type: "number", precision: 3, max: Infinity, min: -Infinity, rebuild: true
        },

    } ),

    init: function( params ){

        var p = params || {};
        p.colorScheme = defaults( p.colorScheme, "value" );

        Representation.prototype.init.call( this, p );

        this.colorScheme = "value";
        this.dimension = "x";
        this.position = defaults( p.position, 30 );
        this.thresholdType = defaults( p.thresholdType, "sigma" );
        this.thresholdMin = defaults( p.thresholdMin, -Infinity );

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
        var dc = v.getDataColor( this.getColorParams() );
        var d = v.data;

        function index( x, y, z, i ){
            return ( z * v.ny * v.nx + y * v.nx + x ) * 3 + i;
        }

        var x = this.position;
        var y = v.ny-1;
        var z = v.nz-1;

        var position = new Float32Array([
            dp[ index( x, 0, 0, 0 ) ], dp[ index( x, 0, 0, 1 ) ], dp[ index( x, 0, 0, 2 ) ],
            dp[ index( x, y, 0, 0 ) ], dp[ index( x, y, 0, 1 ) ], dp[ index( x, y, 0, 2 ) ],
            dp[ index( x, 0, z, 0 ) ], dp[ index( x, 0, z, 1 ) ], dp[ index( x, 0, z, 2 ) ],
            dp[ index( x, y, z, 0 ) ], dp[ index( x, y, z, 1 ) ], dp[ index( x, y, z, 2 ) ]
        ]);

        var i = 0;
        var data = new Uint8Array( v.ny * v.nz * 4 );

        var min;
        if( this.thresholdType === "sigma" ){
            min = v.getValueForSigma( this.thresholdMin );
        }else{
            min = this.thresholdMin;
        }

        for ( var iy = 0; iy < v.ny; ++iy ) {
            for ( var iz = 0; iz < v.nz; ++iz ) {

                data[ i     ] = Math.round( dc[ index( x, iy, iz, 0 ) ] * 255 );
                data[ i + 1 ] = Math.round( dc[ index( x, iy, iz, 1 ) ] * 255 );
                data[ i + 2 ] = Math.round( dc[ index( x, iy, iz, 2 ) ] * 255 );
                data[ i + 3 ] = d[ index( x, iy, iz, 0 ) / 3 ] > min ? 255 : 0;

                i += 4;

            }
        }

        var sliceBuffer = new ImageBuffer( position, data, v.nz, v.ny );

        this.bufferList.push( sliceBuffer );

    }

} );


export default SliceRepresentation;
