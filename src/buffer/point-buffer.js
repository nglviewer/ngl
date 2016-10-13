/**
 * @file Point Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { DataTexture, NormalBlending } from "../../lib/three.es6.js";

import "../shader/Point.vert";
import "../shader/Point.frag";

import { defaults } from "../utils.js";
import Buffer from "./buffer.js";


function makePointTexture( params ){

    var p = Object.assign( {}, params );

    var width = defaults( p.width, 256 );
    var height = defaults( p.height, 256 );
    var center = [ width / 2, height / 2 ];
    var radius = Math.min( width / 2, height / 2 );
    var delta = defaults( p.delta, 1 / ( radius + 1 ) ) * radius;

    //

    function clamp( value, min, max ){
        return Math.min( Math.max( value, min ), max );
    }

    function distance( x0, y0, x1, y1 ){
        var dx = x1 - x0, dy = y1 - y0;
        return Math.sqrt( dx * dx + dy * dy );
    }

    function smoothStep( edge0, edge1, x ){
        // Scale, bias and saturate x to 0..1 range
        x = clamp( ( x - edge0 ) / ( edge1 - edge0 ), 0, 1 );
        // Evaluate polynomial
        return x * x * ( 3 - 2 * x );
    }

    //

    var x = 0;
    var y = 0;
    var data = new Uint8Array( width * height * 4 );

    for ( var i = 0, il = data.length; i < il; i += 4 ) {

        var dist = distance( x, y, center[ 0 ], center[ 1 ] );
        var value = 1 - smoothStep( radius - delta, radius, dist );

        data[ i     ] = value * 255;
        data[ i + 1 ] = value * 255;
        data[ i + 2 ] = value * 255;
        data[ i + 3 ] = value * 255;

        if( ++x === width ){
            x = 0;
            y++;
        }

    }

    var tex = new DataTexture( data, width, height );
    tex.needsUpdate = true;

    return tex;

}


function PointBuffer( position, color, params ){

    var p = params || {};

    this.point = true;
    this.pointSize = defaults( p.pointSize, 1 );
    this.sizeAttenuation = defaults( p.sizeAttenuation, true );
    this.sortParticles = defaults( p.sortParticles, false );
    this.alphaTest = defaults( p.alphaTest, 0.5 );
    this.useTexture = defaults( p.useTexture, false );
    this.forceTransparent = defaults( p.forceTransparent, false );
    this.edgeBleach = defaults( p.edgeBleach, 0.0 );

    this.size = position.length / 3;
    this.attributeSize = this.size;
    this.vertexShader = 'Point.vert';
    this.fragmentShader = 'Point.frag';

    Buffer.call( this, position, color, undefined, undefined, p );

    this.addUniforms( {
        "size": { value: this.pointSize },
        "canvasHeight": { value: 1.0 },
        "pixelRatio": { value: 1.0 },
        "map": { value: null },
    } );

}

PointBuffer.prototype = Object.assign( Object.create(

    Buffer.prototype ), {

    constructor: PointBuffer,

    parameters: Object.assign( {

        pointSize: { uniform: "size" },
        sizeAttenuation: { updateShader: true },
        sortParticles: {},
        alphaTest: { updateShader: true },
        useTexture: { updateShader: true },
        forceTransparent: {},
        edgeBleach: { uniform: true },

    }, Buffer.prototype.parameters ),

    makeMaterial: function(){

        Buffer.prototype.makeMaterial.call( this );

        this.makeTexture();

        this.material.uniforms.map.value = this.tex;
        this.material.blending = NormalBlending;
        this.material.needsUpdate = true;

        this.wireframeMaterial.uniforms.map.value = this.tex;
        this.wireframeMaterial.blending = NormalBlending;
        this.wireframeMaterial.needsUpdate = true;

        this.pickingMaterial.uniforms.map.value = this.tex;
        this.pickingMaterial.blending = NormalBlending;
        this.pickingMaterial.needsUpdate = true;

    },

    makeTexture: function(){

        if( this.tex ) this.tex.dispose();
        this.tex = makePointTexture( { delta: this.edgeBleach } );

    },

    getDefines: function( type ){

        var defines = Buffer.prototype.getDefines.call( this, type );

        if( this.sizeAttenuation ){
            defines.USE_SIZEATTENUATION = 1;
        }

        if( this.useTexture ){
            defines.USE_MAP = 1;
        }

        if( this.alphaTest > 0 && this.alphaTest <= 1 ){
            defines.ALPHATEST = this.alphaTest.toPrecision( 2 );
        }

        return defines;

    },

    setUniforms: function( data ){

        if( data && data.edgeBleach !== undefined ){

            this.makeTexture();
            data.map = this.tex;

        }

        Buffer.prototype.setUniforms.call( this, data );

    },

    dispose: function(){

        Buffer.prototype.dispose.call( this );

        if( this.tex ) this.tex.dispose();

    }

} );


export default PointBuffer;
