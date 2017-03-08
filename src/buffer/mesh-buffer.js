/**
 * @file Mesh Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import "../shader/Mesh.vert";
import "../shader/Mesh.frag";

import Buffer from "./buffer.js";


class MeshBuffer extends Buffer{

    /**
     * make mesh buffer
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.color - colors
     * @param  {Float32Array} data.index - triangle indices
     * @param  {Float32Array} data.normal - radii
     * @param  {BufferParameters} params - parameter object
     */
    constructor( data, params ){

        super( data, params );

        var d = data || {};

        this.addAttributes( {
            "normal": { type: "v3", value: d.normal },
        } );

        if( d.normal === undefined ){
            this.geometry.computeVertexNormals();
        }

    }

    get vertexShader (){ return "Mesh.vert"; }
    get fragmentShader (){ return "Mesh.frag"; }

}


export default MeshBuffer;
