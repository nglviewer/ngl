/**
 * @file Surface Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import MeshBuffer from "./mesh-buffer.js";


function SurfaceBuffer(){

    MeshBuffer.apply( this, arguments );

}

SurfaceBuffer.prototype = Object.assign( Object.create(

    MeshBuffer.prototype ), {

    constructor: SurfaceBuffer,

    type: "surface"

} );


export default SurfaceBuffer;
