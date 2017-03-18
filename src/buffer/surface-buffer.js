/**
 * @file Surface Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import MeshBuffer from "./mesh-buffer.js";


class SurfaceBuffer extends MeshBuffer{

	get type (){ return "surface"; }

}


export default SurfaceBuffer;
