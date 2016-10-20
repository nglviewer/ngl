/**
 * @file Image Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import {
    Vector2, BufferAttribute, DataTexture,
    NormalBlending, NearestFilter, LinearFilter
} from "../../lib/three.es6.js";

import "../shader/Image.vert";
import "../shader/Image.frag";

import { defaults } from "../utils.js";
import Buffer from "./buffer.js";


var quadIndices = new Uint16Array([
    0, 1, 2,
    1, 3, 2
]);

var quadUvs = new Float32Array([
    0, 1,
    0, 0,
    1, 1,
    1, 0
]);


function ImageBuffer( position, data, width, height, params ){

    var p = params || {};

    this.size = 4;
    this.attributeSize = this.size;
    this.vertexShader = 'Image.vert';
    this.fragmentShader = 'Image.frag';

    Buffer.call( this, position, undefined, quadIndices, undefined, p );

    this.forceTransparent = true;
    this.filter = defaults( p.filter, "nearest" );

    this.tex = new DataTexture( data, width, height );
    this.tex.flipY = true;

    this.addUniforms( {
        "map": { value: null },
        "mapSize": { value: new Vector2( width, height ) }
    } );

    this.geometry.addAttribute( 'uv', new BufferAttribute( quadUvs, 2 ) );

}

ImageBuffer.prototype = Object.assign( Object.create(

    Buffer.prototype ), {

    constructor: ImageBuffer,

    parameters: Object.assign( {

        filter: { updateShader: true, uniform: true },

    }, Buffer.prototype.parameters ),

    getDefines: function( type ){

        var defines = Buffer.prototype.getDefines.call( this, type );

        if( this.filter.startsWith( "cubic" ) ){
            defines.CUBIC_INTERPOLATION = 1;
            if( this.filter.endsWith( "bspline" ) ){
                defines.BSPLINE_FILTER = 1;
            }else if( this.filter.endsWith( "catmulrom" ) ){
                defines.CATMULROM_FILTER = 1;
            }else if( this.filter.endsWith( "mitchell" ) ){
                defines.MITCHELL_FILTER = 1;
            }
        }

        return defines;

    },

    updateTexture: function(){

        var tex = this.tex;

        if( this.filter.startsWith( "cubic" ) ){

            tex.minFilter = NearestFilter;
            tex.magFilter = NearestFilter;

        }else if( this.filter === "linear" ){

            tex.minFilter = LinearFilter;
            tex.magFilter = LinearFilter;

        }else{  // this.filter === "nearest"

            tex.minFilter = NearestFilter;
            tex.magFilter = NearestFilter;

        }

        tex.needsUpdate = true;

    },

    makeMaterial: function(){

        Buffer.prototype.makeMaterial.call( this );

        this.updateTexture();

        var m = this.material;
        m.uniforms.map.value = this.tex;
        m.blending = NormalBlending;
        m.needsUpdate = true;

        var wm = this.wireframeMaterial;
        wm.uniforms.map.value = this.tex;
        wm.blending = NormalBlending;
        wm.needsUpdate = true;

        var pm = this.pickingMaterial;
        pm.uniforms.map.value = this.tex;
        pm.blending = NormalBlending;
        pm.needsUpdate = true;

    },

    setUniforms: function( data ){

        if( data && data.filter !== undefined ){

            this.updateTexture();
            data.map = this.tex;

        }

        Buffer.prototype.setUniforms.call( this, data );

    },

} );


export default ImageBuffer;
