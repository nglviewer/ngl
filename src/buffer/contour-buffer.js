/**
 * @file Contour Buffer
 * @author Fred ludlow <fred.ludlow@gmail.com>
 * @private
 */

import "../shader/Line.vert";
import "../shader/Line.frag";

import Buffer from "./buffer.js";


class ContourBuffer extends Buffer{

    setAttributes( data ){

        var attributes = this.geometry.attributes;

        if( data.color ){
            attributes.color.array.set( data.color );
            attributes.color.needsUpdate = true;
        }

        if( data.index ){
            attributes.index.array.set( data.index );
            attributes.index.needsUpdate = true;
        }

    }

    get line (){ return true; }
    get vertexShader (){ return "Line.vert"; }
    get fragmentShader (){ return "Line.frag"; }

}


export default ContourBuffer;
