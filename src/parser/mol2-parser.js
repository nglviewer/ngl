/**
 * @file Mol2 Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Debug, Log, ParserRegistry } from "../globals.js";
import {
    assignResidueTypeBonds,
    calculateChainnames, calculateSecondaryStructure,
    calculateBondsBetween, calculateBondsWithin
} from "../structure/structure-utils.js";
import StructureParser from "./structure-parser.js";


function Mol2Parser( streamer, params ){

    StructureParser.call( this, streamer, params );

}

Mol2Parser.prototype = Object.assign( Object.create(

    StructureParser.prototype ), {

    constructor: Mol2Parser,
    type: "mol2",

    _parse: function(){

        // http://www.tripos.com/data/support/mol2.pdf

        if( Debug ) Log.time( "Mol2Parser._parse " + this.name );

        var reWhitespace = /\s+/;

        var s = this.structure;
        var sb = this.structureBuilder;

        var firstModelOnly = this.firstModelOnly;
        var asTrajectory = this.asTrajectory;

        var frames = s.frames;
        var doFrames = false;
        var currentFrame, currentCoord;

        var atomMap = s.atomMap;
        var atomStore = s.atomStore;
        atomStore.resize( Math.round( this.streamer.data.length / 60 ) );

        var idx = 0;
        var moleculeLineNo = 0;
        var modelAtomIdxStart = 0;
        var modelIdx = -1;
        var numAtoms = 0;

        var currentRecordType = 0;
        var moleculeRecordType = 1;
        var atomRecordType = 2;
        var bondRecordType = 3;

        var ap1 = s.getAtomProxy();
        var ap2 = s.getAtomProxy();

        var bondTypes = {
            "1": 1,
            "2": 2,
            "3": 3,
            "am": 1,  // amide
            "ar": 1,  // aromatic
            "du": 1,  // dummy
            "un": 1,  // unknown
            "nc": 0,  // not connected
        };

        function _parseChunkOfLines( _i, _n, lines ){

            var ls;

            for( var i = _i; i < _n; ++i ){

                var line = lines[ i ].trim();

                if( line === "" || line[ 0 ] === "#" ) continue;

                if( line[ 0 ] === "@" ){

                    if( line === "@<TRIPOS>MOLECULE" ){

                        currentRecordType = moleculeRecordType;
                        moleculeLineNo = 0;

                        ++modelIdx;

                    }else if( line === "@<TRIPOS>ATOM" ){

                        currentRecordType = atomRecordType;
                        modelAtomIdxStart = atomStore.count;

                        if( asTrajectory ){

                            currentCoord = 0;
                            currentFrame = new Float32Array( numAtoms * 3 );
                            frames.push( currentFrame );

                            if( modelIdx > 0 ) doFrames = true;

                        }

                    }else if( line === "@<TRIPOS>BOND" ){

                        currentRecordType = bondRecordType;

                    }else{

                        currentRecordType = 0;

                    }

                }else if( currentRecordType === moleculeRecordType ){

                    if( moleculeLineNo === 0 ){

                        s.title = line;
                        s.id = line;

                    }else if( moleculeLineNo === 1 ){

                        ls = line.split( reWhitespace );
                        numAtoms = parseInt( ls[ 0 ] );
                        // num_atoms [num_bonds [num_subst [num_feat [num_sets]]]]

                    }else if( moleculeLineNo === 2 ){

                        // var molType = line;
                        // SMALL, BIOPOLYMER, PROTEIN, NUCLEIC_ACID, SACCHARIDE

                    }else if( moleculeLineNo === 3 ){

                        // var chargeType = line;
                        // NO_CHARGES, DEL_RE, GASTEIGER, GAST_HUCK, HUCKEL,
                        // PULLMAN, GAUSS80_CHARGES, AMPAC_CHARGES,
                        // MULLIKEN_CHARGES, DICT_ CHARGES, MMFF94_CHARGES,
                        // USER_CHARGES

                    }else if( moleculeLineNo === 4 ){

                        // var statusBits = line;

                    }else if( moleculeLineNo === 5 ){

                        // var molComment = line;

                    }

                    ++moleculeLineNo;

                }else if( currentRecordType === atomRecordType ){

                    ls = line.split( reWhitespace );

                    if( firstModelOnly && modelIdx > 0 ) continue;

                    var x = parseFloat( ls[ 2 ] );
                    var y = parseFloat( ls[ 3 ] );
                    var z = parseFloat( ls[ 4 ] );

                    if( asTrajectory ){

                        var j = currentCoord * 3;

                        currentFrame[ j + 0 ] = x;
                        currentFrame[ j + 1 ] = y;
                        currentFrame[ j + 2 ] = z;

                        currentCoord += 1;

                        if( doFrames ) continue;

                    }

                    var serial = ls[ 0 ];
                    var atomname = ls[ 1 ];
                    var element = ls[ 5 ].split( "." )[ 0 ];
                    var resno = ls[ 6 ] ? parseInt( ls[ 6 ] ) : 1;
                    var resname = ls[ 7 ] ? ls[ 7 ] : "";
                    var bfactor = ls[ 8 ] ? parseFloat( ls[ 8 ] ) : 0.0;

                    atomStore.growIfFull();
                    atomStore.atomTypeId[ idx ] = atomMap.add( atomname, element );

                    atomStore.x[ idx ] = x;
                    atomStore.y[ idx ] = y;
                    atomStore.z[ idx ] = z;
                    atomStore.serial[ idx ] = serial;
                    atomStore.bfactor[ idx ] = bfactor;

                    sb.addAtom( modelIdx, "", "", resname, resno, 1 );

                    idx += 1;

                }else if( currentRecordType === bondRecordType ){

                    if( firstModelOnly && modelIdx > 0 ) continue;
                    if( asTrajectory && modelIdx > 0 ) continue;

                    ls = line.split( reWhitespace );

                    // ls[ 0 ] is bond id
                    ap1.index = parseInt( ls[ 1 ] ) - 1 + modelAtomIdxStart;
                    ap2.index = parseInt( ls[ 2 ] ) - 1 + modelAtomIdxStart;
                    var order = bondTypes[ ls[ 3 ] ];

                    s.bondStore.addBond( ap1, ap2, order );

                }

            }

        }

        this.streamer.eachChunkOfLines( function( lines/*, chunkNo, chunkCount*/ ){
            _parseChunkOfLines( 0, lines.length, lines );
        } );

        sb.finalize();
        s.finalizeAtoms();
        calculateChainnames( s );
        calculateBondsWithin( s, true );
        calculateBondsBetween( s, true );
        s.finalizeBonds();
        assignResidueTypeBonds( s );
        calculateSecondaryStructure( s );

        if( Debug ) Log.timeEnd( "Mol2Parser._parse " + this.name );

    }

} );

ParserRegistry.add( "mol2", Mol2Parser );


export default Mol2Parser;
