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


class PointBuffer extends Buffer{

    /**
     * make point buffer
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.color - colors
     * @param  {BufferParameters} params - parameter object
     */
    constructor( data, params ){

        var p = params || {};

        super( data, p );

        this.pointSize = defaults( p.pointSize, 1 );
        this.sizeAttenuation = defaults( p.sizeAttenuation, true );
        this.sortParticles = defaults( p.sortParticles, false );
        this.alphaTest = defaults( p.alphaTest, 0.5 );
        this.useTexture = defaults( p.useTexture, false );
        this.forceTransparent = defaults( p.forceTransparent, false );
        this.edgeBleach = defaults( p.edgeBleach, 0.0 );

        this.addUniforms( {
            "size": { value: this.pointSize },
            "canvasHeight": { value: 1.0 },
            "pixelRatio": { value: 1.0 },
            "map": { value: null },
        } );

    }

    get parameters (){

        return Object.assign( {

            pointSize: { uniform: "size" },
            sizeAttenuation: { updateShader: true },
            sortParticles: {},
            alphaTest: { updateShader: true },
            useTexture: { updateShader: true },
            forceTransparent: {},
            edgeBleach: { uniform: true }

        }, super.parameters );

    }

    makeMaterial(){

        super.makeMaterial();

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

    }

    makeTexture(){

        if( this.tex ) this.tex.dispose();
        this.tex = makePointTexture( { delta: this.edgeBleach } );

    }

    getDefines( type ){

        var defines = super.getDefines( type );

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

    }

    setUniforms( data ){

        if( data && data.edgeBleach !== undefined ){

            this.makeTexture();
            data.map = this.tex;

        }

        super.setUniforms( data );

    }

    dispose(){

        super.dispose();

        if( this.tex ) this.tex.dispose();

    }

    get point (){ return true; }
    get vertexShader (){ return "Point.vert"; }
    get fragmentShader (){ return "Point.frag"; }

}


export default PointBuffer;
