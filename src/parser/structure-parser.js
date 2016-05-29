/**
 * @file Structure Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Debug, Log } from "../globals.js";
import Parser from "./parser.js";
import Structure from "../structure/structure.js";
import StructureBuilder from "../structure/structure-builder.js";
import {
	reorderAtoms, calculateChainnames, calculateBonds, calculateBondsBetween,
	calculateSecondaryStructure, assignSecondaryStructure, buildUnitcellAssembly
} from "../structure/structure-utils.js";


function StructureParser( streamer, params ){

    var p = params || {};

    this.firstModelOnly = p.firstModelOnly || false;
    this.asTrajectory = p.asTrajectory || false;
    this.cAlphaOnly = p.cAlphaOnly || false;
    this.reorderAtoms = p.reorderAtoms || false;
    this.dontAutoBond = p.dontAutoBond || false;
    this.doAutoSS = true;

    Parser.call( this, streamer, p );

    this.structure = new Structure( this.name, this.path );
    this.structureBuilder = new StructureBuilder( this.structure );

}

StructureParser.prototype = Object.assign( Object.create(

    Parser.prototype ), {

    constructor: StructureParser,
    type: "structure",

    __objName: "structure",

    _afterParse: function(){

        if( Debug ) Log.time( "StructureParser._afterParse" );

        var s = this.structure;
        s.refresh();

        if( this.reorderAtoms ){
            reorderAtoms( s );
        }

        // check for chain names
        calculateChainnames( s );

        if( !this.dontAutoBond ){
            calculateBonds( s );
        }else if( this.autoBondBetween ){
            calculateBondsBetween( s );
        }

        // TODO
        // check for secondary structure
        if( this.doAutoSS && s.helices.length === 0 && s.sheets.length === 0 ){
            calculateSecondaryStructure( s );
        }

        if( s.helices.length > 0 || s.sheets.length > 0 ){
            assignSecondaryStructure( s );
        }

        this._postProcess();

        if( s.unitcell ){
            buildUnitcellAssembly( s );
        }

        if( Debug ) Log.timeEnd( "StructureParser._afterParse" );
        if( Debug ) Log.log( this[ this.__objName ] );

    },

    _postProcess: function(){}

} );


export default StructureParser;
