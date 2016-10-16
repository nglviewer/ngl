/**
 * @file Slice Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";

import { ColorMakerRegistry } from "../globals.js";
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

        filter: {
            type: "select", buffer: true, options: {
                "nearest": "nearest",
                "linear": "linear",
                "cubic-bspline": "cubic-bspline",
                "cubic-catmulrom": "cubic-catmulrom",
                "cubic-mitchell": "cubic-mitchell"
            }
        },
        position: {
            type: "range", step: 0.1, max: 100, min: 1,
            rebuild: true
        },
        dimension: {
            type: "select", rebuild: true, options: {
                "x": "x", "y": "y", "z": "z"
            }
        },
        thresholdType: {
            type: "select", rebuild: true, options: {
                "value": "value", "sigma": "sigma"
            }
        },
        thresholdMin: {
            type: "number", precision: 3, max: Infinity, min: -Infinity, rebuild: true
        },
        thresholdMax: {
            type: "number", precision: 3, max: Infinity, min: -Infinity, rebuild: true
        },

    }, Representation.prototype.parameters, {

        flatShaded: null,
        side: null,
        wireframe: null,
        linewidth: null,
        colorScheme: null,

        roughness: null,
        metalness: null,
        diffuse: null,

    } ),

    init: function( params ){

        var p = params || {};
        p.colorScheme = defaults( p.colorScheme, "value" );
        p.colorScale = defaults( p.colorScale, "Spectral" );

        Representation.prototype.init.call( this, p );

        this.colorScheme = "value";
        this.dimension = defaults( p.dimension, "x" );
        this.filter = defaults( p.filter, "cubic-bspline" );
        this.position = defaults( p.position, 30 );
        this.thresholdType = defaults( p.thresholdType, "sigma" );
        this.thresholdMin = defaults( p.thresholdMin, -Infinity );
        this.thresholdMax = defaults( p.thresholdMax, Infinity );

    },

    attach: function( callback ){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );

        }, this );

        this.setVisibility( this.visible );

        callback();

    },

    create: function(){

        var p = this.position;
        var v = this.volume;
        v.filterData( -Infinity, Infinity, false );
        var d = v.data;
        var m = v.matrix;

        function pos( dimLen ){
            return Math.round( ( dimLen  / 100 ) * ( p - 1 ) )
        }

        function index( x, y, z, i ){
            return ( z * v.ny * v.nx + y * v.nx + x ) * 3 + i;
        }

        var position = new Float32Array( 4 * 3 );
        var width, height;
        var x, y, z;

        var x0 = 0, y0 = 0, z0 = 0;
        var nx = v.nx, ny = v.ny, nz = v.nz;
        var vec = new Vector3();

        if( this.dimension === "x" ){

            x = pos( v.nx );
            y = v.ny-1;
            z = v.nz-1;

            width = v.nz;
            height = v.ny;

            x0 = x;
            nx = x0 + 1;

            vec.set( x, 0, 0 ).applyMatrix4( m ).toArray( position, 0 );
            vec.set( x, y, 0 ).applyMatrix4( m ).toArray( position, 3 );
            vec.set( x, 0, z ).applyMatrix4( m ).toArray( position, 6 );
            vec.set( x, y, z ).applyMatrix4( m ).toArray( position, 9 );

        }else if( this.dimension === "y" ){

            x = v.nx-1;
            y = pos( v.ny );
            z = v.nz-1;

            width = v.nz;
            height = v.nx;

            y0 = y;
            ny = y0 + 1;

            vec.set( 0, y, 0 ).applyMatrix4( m ).toArray( position, 0 );
            vec.set( x, y, 0 ).applyMatrix4( m ).toArray( position, 3 );
            vec.set( 0, y, z ).applyMatrix4( m ).toArray( position, 6 );
            vec.set( x, y, z ).applyMatrix4( m ).toArray( position, 9 );

        }else if( this.dimension === "z" ){

            x = v.nx-1;
            y = v.ny-1;
            z = pos( v.nz );

            width = v.nx;
            height = v.ny;

            z0 = z;
            nz = z0 + 1;

            vec.set( 0, 0, z ).applyMatrix4( m ).toArray( position, 0 );
            vec.set( 0, y, z ).applyMatrix4( m ).toArray( position, 3 );
            vec.set( x, 0, z ).applyMatrix4( m ).toArray( position, 6 );
            vec.set( x, y, z ).applyMatrix4( m ).toArray( position, 9 );

        }

        var i = 0;
        var data = new Uint8Array( width * height * 4 );

        var min, max;
        if( this.thresholdType === "sigma" ){
            min = v.getValueForSigma( this.thresholdMin );
            max = v.getValueForSigma( this.thresholdMax );
        }else{
            min = this.thresholdMin;
            max = this.thresholdMax;
        }

        var cp = this.getColorParams( { volume: v } );
        cp.domain = [ v.getDataMin(), v.getDataMax() ];
        var colorMaker = ColorMakerRegistry.getScheme( cp );
        var tmp = new Float32Array( 3 );

        for ( var iy = y0; iy < ny; ++iy ) {
            for ( var ix = x0; ix < nx; ++ix ) {
                for ( var iz = z0; iz < nz; ++iz ) {

                    var idx = index( ix, iy, iz, 0 ) / 3;
                    var val = d[ idx ];
                    colorMaker.volumeColorToArray( idx, tmp );
                    data[ i     ] = Math.round( tmp[ 0 ] * 255 );
                    data[ i + 1 ] = Math.round( tmp[ 1 ] * 255 );
                    data[ i + 2 ] = Math.round( tmp[ 2 ] * 255 );
                    data[ i + 3 ] = ( val > min && val < max ) ? 255 : 0;
                    i += 4;

                }
            }
        }

        var sliceBuffer = new ImageBuffer(
            position, data, width, height,
            this.getBufferParams( {
                filter: this.filter
            } )
        );

        this.bufferList.push( sliceBuffer );

    }

} );


export default SliceRepresentation;
