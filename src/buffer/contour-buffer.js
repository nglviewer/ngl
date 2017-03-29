/**
 * @file Contour Buffer
 * @author Fred ludlow <fred.ludlow@gmail.com>
 * @private
 */

import "../shader/Line.vert";
import "../shader/Line.frag";

import Buffer from "./buffer.js";


class ContourBuffer extends Buffer{

    get line (){ return true; }
    get vertexShader (){ return "Line.vert"; }
    get fragmentShader (){ return "Line.frag"; }

}


export default ContourBuffer;
