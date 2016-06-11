/**
 * @file Structure Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Debug, Log } from "../globals.js";
import { defaults } from "../utils.js";
import Parser from "./parser.js";
import Structure from "../structure/structure.js";
import StructureBuilder from "../structure/structure-builder.js";
import {
	reorderAtoms, calculateChainnames, calculateBonds, calculateBondsBetween,
	calculateSecondaryStructure, assignSecondaryStructure, buildUnitcellAssembly
} from "../structure/structure-utils.js";


function StructureParser( streamer, params ){

    var p = params || {};

    this.firstModelOnly = defaults( p.firstModelOnly, false );
    this.asTrajectory = defaults( p.asTrajectory, false );
    this.cAlphaOnly = defaults( p.cAlphaOnly, false );
    this.reorderAtoms = defaults( p.reorderAtoms, false );
    this.dontAutoBond = defaults( p.dontAutoBond, false );
    this.autoBondBetween = defaults( p.autoBondBetween, false );
    this.doAutoSS = defaults( p.doAutoSS, true );

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
