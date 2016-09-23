/**
 * @file Structure Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import Parser from "./parser.js";
import Structure from "../structure/structure.js";
import StructureBuilder from "../structure/structure-builder.js";


function StructureParser( streamer, params ){

    var p = params || {};

    this.firstModelOnly = defaults( p.firstModelOnly, false );
    this.asTrajectory = defaults( p.asTrajectory, false );
    this.cAlphaOnly = defaults( p.cAlphaOnly, false );

    Parser.call( this, streamer, p );

    this.structure = new Structure( this.name, this.path );
    this.structureBuilder = new StructureBuilder( this.structure );

}

StructureParser.prototype = Object.assign( Object.create(

    Parser.prototype ), {

    constructor: StructureParser,
    type: "structure",

    __objName: "structure",

} );


export default StructureParser;
