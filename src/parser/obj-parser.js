/**
 * @file Obj Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import SurfaceParser from "./surface-parser.js";


function ObjParser( streamer, params ){

    var p = params || {};

    SurfaceParser.call( this, streamer, p );

    this.loader = new THREE.OBJLoader();

}

ObjParser.prototype = Object.assign( Object.create(

    SurfaceParser.prototype ), {

    constructor: ObjParser,
    type: "obj"

} );


export default ObjParser;
