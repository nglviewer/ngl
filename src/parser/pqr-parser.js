/**
 * @file Pqr Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import StructureParser from "./structure-parser.js";
import PdbParser from "./pdb-parser.js";


function PqrParser( streamer, params ){

    StructureParser.call( this, streamer, params );

    // http://www.poissonboltzmann.org/docs/file-format-info/

}

PqrParser.prototype = Object.assign( Object.create(

    PdbParser.prototype ), {

    constructor: PqrParser,
    type: "pqr",

} );


export default PqrParser;
