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


class ImageBuffer extends Buffer{

    constructor( position, data, width, height, params ){

        var p = params || {};

        super( { position, index: quadIndices }, p );

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

    get parameters (){

        return Object.assign( {

            filter: { updateShader: true, uniform: true }

        }, super.parameters );

    }

    getDefines( type ){

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

    }

    updateTexture(){

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

    }

    makeMaterial(){

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

    }

    setUniforms( data ){

        if( data && data.filter !== undefined ){

            this.updateTexture();
            data.map = this.tex;

        }

        super.setUniforms( data );

    }

    get vertexShader (){ return "Image.vert"; }
    get fragmentShader (){ return "Image.frag"; }

}


export default ImageBuffer;
