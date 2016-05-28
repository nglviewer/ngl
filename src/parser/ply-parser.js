/**
 * @file Ply Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { ParserRegistry } from "../globals.js";
import SurfaceParser from "./surface-parser.js";


function PlyParser( streamer, params ){

    var p = params || {};

    SurfaceParser.call( this, streamer, p );

    this.loader = new THREE.PLYLoader();

}

PlyParser.prototype = Object.assign( Object.create(

    SurfaceParser.prototype ), {

    constructor: PlyParser,
    type: "ply"

} );

ParserRegistry.add( "ply", PlyParser );


export default PlyParser;
