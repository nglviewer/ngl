/**
 * @file Pdb Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Debug, Log } from "../globals.js";
import StructureParser from "./structure-parser.js";
import Unitcell from "../symmetry/unitcell.js";
import Assembly from "../symmetry/assembly.js";


// PDB helix record encoding
var HelixTypes = {
    1: "h",  // Right-handed alpha (default)
    2: "h",  // Right-handed omega
    3: "i",  // Right-handed pi
    4: "h",  // Right-handed gamma
    5: "g",  // Right-handed 310
    6: "h",  // Left-handed alpha
    7: "h",  // Left-handed omega
    8: "h",  // Left-handed gamma
    9: "h",  // 27 ribbon/helix
    10: "h",  // Polyproline
    "": "h",
};


function PdbParser( streamer, params ){

    StructureParser.call( this, streamer, params );

}

PdbParser.prototype = Object.assign( Object.create(

    StructureParser.prototype ), {

    constructor: PdbParser,
    type: "pdb",

    _parse: function( callback ){

        // http://www.wwpdb.org/documentation/file-format.php

        if( Debug ) Log.time( "PdbParser._parse " + this.name );

        var isPqr = this.type === "pqr";
        var reWhitespace = /\s+/;

        var s = this.structure;
        var sb = this.structureBuilder;

        var firstModelOnly = this.firstModelOnly;
        var asTrajectory = this.asTrajectory;
        var cAlphaOnly = this.cAlphaOnly;

        var frames = s.frames;
        var boxes = s.boxes;
        var doFrames = false;
        var currentFrame, currentCoord;

        var id = s.id;
        var title = s.title;

        var atoms = s.atoms;
        var bondSet = s.bondSet;
        var helices = s.helices;
        var sheets = s.sheets;
        var biomolDict = s.biomolDict;
        var currentBiomol;
        var currentPart;
        var currentMatrix;

        var line, recordName;
        var serial, chainname, resno, resname, occupancy,
            inscode, atomname, element, hetero, bfactor, altloc;

        var startChain, startResi, startIcode;
        var endChain, endResi, endIcode;

        var serialDict = {};
        var unitcellDict = {};

        s.hasConnect = false;

        var atomMap = s.atomMap;
        var atomStore = s.atomStore;
        atomStore.resize( Math.round( this.streamer.data.length / 80 ) );

        var ap1 = s.getAtomProxy();
        var ap2 = s.getAtomProxy();

        var idx = 0;
        var modelIdx = 0;
        var pendingStart = true;

        function _parseChunkOfLines( _i, _n, lines ){

            var j, jl;

            for( var i = _i; i < _n; ++i ){

                line = lines[ i ];
                recordName = line.substr( 0, 6 );

                if( recordName === 'ATOM  ' || recordName === 'HETATM' ){

                    // http://www.wwpdb.org/documentation/file-format-content/format33/sect9.html#ATOM
                    // PQR: Field_name Atom_number Atom_name Residue_name Chain_ID Residue_number X Y Z Charge Radius

                    if( pendingStart ){

                        if( asTrajectory ){

                            if( doFrames ){
                                currentFrame = new Float32Array( atomStore.count * 3 );
                                frames.push( currentFrame );
                            }else{
                                currentFrame = [];
                            }
                            currentCoord = 0;

                        }else{

                            if( !firstModelOnly ) serialDict = {};

                        }

                    }

                    pendingStart = false;

                    if( firstModelOnly && modelIdx > 0 ) continue;

                    var x, y, z, ls, dd;

                    if( isPqr ){

                        ls = line.split( reWhitespace );
                        dd = ls.length === 10 ? 1 : 0;

                        atomname = ls[ 2 ];
                        if( cAlphaOnly && atomname !== 'CA' ) continue;

                        x = parseFloat( ls[ 6 - dd ] );
                        y = parseFloat( ls[ 7 - dd ] );
                        z = parseFloat( ls[ 8 - dd ] );

                    }else{

                        atomname = line.substr( 12, 4 ).trim();
                        if( cAlphaOnly && atomname !== 'CA' ) continue;

                        x = parseFloat( line.substr( 30, 8 ) );
                        y = parseFloat( line.substr( 38, 8 ) );
                        z = parseFloat( line.substr( 46, 8 ) );

                    }

                    if( asTrajectory ){

                        j = currentCoord * 3;

                        currentFrame[ j + 0 ] = x;
                        currentFrame[ j + 1 ] = y;
                        currentFrame[ j + 2 ] = z;

                        currentCoord += 1;

                        if( doFrames ) continue;

                    }

                    var element;

                    if( isPqr ){

                        serial = parseInt( ls[ 1 ] );
                        element = "";
                        hetero = ( line[ 0 ] === 'H' ) ? 1 : 0;
                        chainname = dd ? "" : ls[ 4 ];
                        resno = parseInt( ls[ 5 - dd ] );
                        inscode = "";
                        resname = ls[ 3 ];
                        bfactor = parseFloat( ls[ 9 - dd ] );  // charge FIXME should be its own field
                        altloc = "";
                        occupancy = 0.0;
                        // FIXME radius field not supported

                    }else{

                        serial = parseInt( line.substr( 6, 5 ) );
                        element = line.substr( 76, 2 ).trim();
                        hetero = ( line[ 0 ] === 'H' ) ? 1 : 0;
                        chainname = line[ 21 ].trim();
                        resno = parseInt( line.substr( 22, 4 ) );
                        inscode = line[ 26 ].trim();
                        resname = line.substr( 17, 4 ).trim();
                        bfactor = parseFloat( line.substr( 60, 6 ) );
                        altloc = line[ 16 ].trim();
                        occupancy = parseFloat( line.substr( 54, 6 ) );

                    }

                    atomStore.growIfFull();
                    atomStore.atomTypeId[ idx ] = atomMap.add( atomname, element );

                    atomStore.x[ idx ] = x;
                    atomStore.y[ idx ] = y;
                    atomStore.z[ idx ] = z;
                    atomStore.serial[ idx ] = serial;
                    atomStore.bfactor[ idx ] = isNaN( bfactor ) ? 0 : bfactor;
                    atomStore.altloc[ idx ] = altloc.charCodeAt( 0 );
                    atomStore.occupancy[ idx ] = isNaN( occupancy ) ? 0 : occupancy;

                    sb.addAtom( modelIdx, chainname, resname, resno, hetero, undefined, inscode );

                    serialDict[ serial ] = idx;

                    idx += 1;

                }else if( recordName === 'CONECT' ){

                    var from = serialDict[ parseInt( line.substr( 6, 5 ) ) ];
                    var pos = [ 11, 16, 21, 26 ];

                    if( from === undefined ){
                        // Log.log( "missing CONNECT serial" );
                        continue;
                    }

                    for( j = 0; j < 4; ++j ){

                        var to = parseInt( line.substr( pos[ j ], 5 ) );
                        if( Number.isNaN( to ) ) continue;
                        to = serialDict[ to ];
                        if( to === undefined ){
                            // Log.log( "missing CONNECT serial" );
                            continue;
                        }/*else if( to < from ){
                            // likely a duplicate in standard PDB format
                            // but not necessarily, so better remove duplicates
                            // in a pass after parsing (and auto bonding)
                            continue;
                        }*/

                        ap1.index = from;
                        ap2.index = to;

                        s.bondStore.addBond( ap1, ap2 );

                    }

                    s.hasConnect = true;

                }else if( recordName === 'HELIX ' ){

                    startChain = line[ 19 ].trim();
                    startResi = parseInt( line.substr( 21, 4 ) );
                    startIcode = line[ 25 ].trim();
                    endChain = line[ 31 ].trim();
                    endResi = parseInt( line.substr( 33, 4 ) );
                    endIcode = line[ 37 ].trim();
                    var helixType = parseInt( line.substr( 39, 1 ) );
                    helixType = ( HelixTypes[ helixType ] || HelixTypes[""] ).charCodeAt( 0 );
                    helices.push( [
                        startChain, startResi, startIcode,
                        endChain, endResi, endIcode,
                        helixType
                    ] );

                }else if( recordName === 'SHEET ' ){

                    startChain = line[ 21 ].trim();
                    startResi = parseInt( line.substr( 22, 4 ) );
                    startIcode = line[ 26 ].trim();
                    endChain = line[ 32 ].trim();
                    endResi = parseInt( line.substr( 33, 4 ) );
                    endIcode = line[ 37 ].trim();
                    sheets.push( [
                        startChain, startResi, startIcode,
                        endChain, endResi, endIcode
                    ] );

                }else if( recordName === 'REMARK' && line.substr( 7, 3 ) === '350' ){

                    if( line.substr( 11, 12 ) === "BIOMOLECULE:" ){

                        var name = line.substr( 23 ).trim();
                        if( /^(0|[1-9][0-9]*)$/.test( name ) ) name = "BU" + name;

                        currentBiomol = new Assembly( name );
                        biomolDict[ name ] = currentBiomol;

                    }else if( line.substr( 13, 5 ) === "BIOMT" ){

                        var biomt = line.split( /\s+/ );
                        var row = parseInt( line[ 18 ] ) - 1;
                        var mat = biomt[ 3 ].trim();

                        if( row === 0 ){
                            currentMatrix = new THREE.Matrix4();
                            currentPart.matrixList.push( currentMatrix );
                        }

                        var biomtElms = currentMatrix.elements;

                        biomtElms[ 4 * 0 + row ] = parseFloat( biomt[ 4 ] );
                        biomtElms[ 4 * 1 + row ] = parseFloat( biomt[ 5 ] );
                        biomtElms[ 4 * 2 + row ] = parseFloat( biomt[ 6 ] );
                        biomtElms[ 4 * 3 + row ] = parseFloat( biomt[ 7 ] );

                    }else if(
                        line.substr( 11, 30 ) === 'APPLY THE FOLLOWING TO CHAINS:' ||
                        line.substr( 11, 30 ) === '                   AND CHAINS:'
                    ){

                        if( line.substr( 11, 5 ) === 'APPLY' ){
                            currentPart = currentBiomol.addPart();
                        }

                        var chainList = line.substr( 41, 30 ).split( "," );
                        for( j, jl = chainList.length; j < jl; ++j ){
                            var c = chainList[ j ].trim();
                            if( c ) currentPart.chainList.push( c );
                        }

                    }

                }else if( recordName === 'HEADER' ){

                    id = line.substr( 62, 4 );

                }else if( recordName === 'TITLE ' ){

                    title += line.substr( 10, 70 ) + "\n";

                }else if( recordName === 'MODEL ' ){

                    pendingStart = true;

                }else if( recordName === 'ENDMDL' || line.substr( 0, 3 ) === 'END' ){

                    if( pendingStart ) continue;

                    if( asTrajectory && !doFrames ){

                        frames.push( new Float32Array( currentFrame ) );
                        doFrames = true;

                    }

                    modelIdx += 1;
                    pendingStart = true;

                }else if( recordName === 'MTRIX ' ){

                    var ncs = line.split( /\s+/ );
                    var ncsMat = ncs[ 1 ].trim();

                    if( line[ 5 ] === "1" && ncsMat === "1" ){
                        var ncsName = "NCS";
                        currentBiomol = new Assembly( ncsName );
                        biomolDict[ ncsName ] = currentBiomol;
                        currentPart = currentBiomol.addPart();
                    }

                    var ncsRow = parseInt( line[ 5 ] ) - 1;

                    if( ncsRow === 0 ){
                        currentMatrix = new THREE.Matrix4();
                        currentPart.matrixList.push( currentMatrix );
                    }

                    var ncsElms = currentMatrix.elements;

                    ncsElms[ 4 * 0 + ncsRow ] = parseFloat( ncs[ 2 ] );
                    ncsElms[ 4 * 1 + ncsRow ] = parseFloat( ncs[ 3 ] );
                    ncsElms[ 4 * 2 + ncsRow ] = parseFloat( ncs[ 4 ] );
                    ncsElms[ 4 * 3 + ncsRow ] = parseFloat( ncs[ 5 ] );

                }else if( line.substr( 0, 5 ) === 'ORIGX' ){

                    if( !unitcellDict.origx ){
                        unitcellDict.origx = new THREE.Matrix4();
                    }

                    var orgix = line.split( /\s+/ );
                    var origxRow = parseInt( line[ 5 ] ) - 1;
                    var origxElms = unitcellDict.origx.elements;

                    origxElms[ 4 * 0 + origxRow ] = parseFloat( orgix[ 1 ] );
                    origxElms[ 4 * 1 + origxRow ] = parseFloat( orgix[ 2 ] );
                    origxElms[ 4 * 2 + origxRow ] = parseFloat( orgix[ 3 ] );
                    origxElms[ 4 * 3 + origxRow ] = parseFloat( orgix[ 4 ] );

                }else if( line.substr( 0, 5 ) === 'SCALE' ){

                    if( !unitcellDict.scale ){
                        unitcellDict.scale = new THREE.Matrix4();
                    }

                    var scale = line.split( /\s+/ );
                    var scaleRow = parseInt( line[ 5 ] ) - 1;
                    var scaleElms = unitcellDict.scale.elements;

                    scaleElms[ 4 * 0 + scaleRow ] = parseFloat( scale[ 1 ] );
                    scaleElms[ 4 * 1 + scaleRow ] = parseFloat( scale[ 2 ] );
                    scaleElms[ 4 * 2 + scaleRow ] = parseFloat( scale[ 3 ] );
                    scaleElms[ 4 * 3 + scaleRow ] = parseFloat( scale[ 4 ] );

                }else if( recordName === 'CRYST1' ){

                    // CRYST1   55.989   55.989   55.989  90.00  90.00  90.00 P 1           1
                    //  7 - 15       Real(9.3)      a (Angstroms)
                    // 16 - 24       Real(9.3)      b (Angstroms)
                    // 25 - 33       Real(9.3)      c (Angstroms)
                    // 34 - 40       Real(7.2)      alpha         alpha (degrees).
                    // 41 - 47       Real(7.2)      beta          beta (degrees).
                    // 48 - 54       Real(7.2)      gamma         gamma (degrees).
                    // 56 - 66       LString        sGroup        Space group.
                    // 67 - 70       Integer        z             Z value.

                    var aLength = parseFloat( line.substr( 6, 9 ) );
                    var bLength = parseFloat( line.substr( 15, 9 ) );
                    var cLength = parseFloat( line.substr( 24, 9 ) );

                    var alpha = parseFloat( line.substr( 33, 7 ) );
                    var beta = parseFloat( line.substr( 40, 7 ) );
                    var gamma = parseFloat( line.substr( 47, 7 ) );

                    var sGroup = line.substr( 55, 11 ).trim();
                    var zValue = parseInt( line.substr( 66, 4 ) );

                    var box = new Float32Array( 9 );
                    box[ 0 ] = aLength;
                    box[ 4 ] = bLength;
                    box[ 8 ] = cLength;
                    boxes.push( box );

                    if( modelIdx === 0 ){
                        unitcellDict.a = aLength;
                        unitcellDict.b = bLength;
                        unitcellDict.c = cLength;
                        unitcellDict.alpha = alpha;
                        unitcellDict.beta = beta;
                        unitcellDict.gamma = gamma;
                        unitcellDict.spacegroup = sGroup;
                    }

                }

            }

        }

        this.streamer.eachChunkOfLines( function( lines, chunkNo, chunkCount ){
            _parseChunkOfLines( 0, lines.length, lines );
        } );

        sb.finalize();

        if( unitcellDict.a !== undefined ){
            s.unitcell = new Unitcell(
                unitcellDict.a, unitcellDict.b, unitcellDict.c,
                unitcellDict.alpha, unitcellDict.beta, unitcellDict.gamma,
                unitcellDict.spacegroup, unitcellDict.scale
            );
        }else{
            s.unitcell = undefined;
        }

        if( Debug ) Log.timeEnd( "PdbParser._parse " + this.name );
        callback();

    }

} );


export default PdbParser;

export {
    HelixTypes
};
