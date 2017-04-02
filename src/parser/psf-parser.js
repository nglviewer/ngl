/**
 * @file Psf Parser
 * @author Stefan Doerr <stefdoerr@gmail.com>
 * @private
 */


import { Matrix4 } from "../../lib/three.es6.js";

import { Debug, Log, ParserRegistry } from "../globals.js";
import StructureParser from "./structure-parser.js";
import Unitcell from "../symmetry/unitcell.js";
import Assembly from "../symmetry/assembly.js";


function PsfParser( streamer, params ){

    StructureParser.call( this, streamer, params );

}

PsfParser.prototype = Object.assign( Object.create(

    StructureParser.prototype ), {

    constructor: PsfParser,
    type: "psf",

    _parse: function( callback ){

        // http://www.ks.uiuc.edu/Training/Tutorials/namd/namd-tutorial-win-html/node24.html

        if( Debug ) Log.time( "PsfParser._parse " + this.name );

        var s = this.structure;
        var sb = this.structureBuilder;

        var line;
        var serial, chainname, resno, resname, inscode, atomname;

        var serialDict = {};
        var unitcellDict = {};
        var bondDict = {};

        s.hasConnect = false;

        var atomMap = s.atomMap;
        var atomStore = s.atomStore;
        atomStore.resize( Math.round( this.streamer.data.length / 80 ) );

        var ap1 = s.getAtomProxy();
        var ap2 = s.getAtomProxy();

        var idx = 0;
        var modelIdx = 0;
        var pendingStart = true;

        var residins_regex = /(\d+)([a-zA-Z])/;

        function _parseChunkOfLines( _i, _n, lines ){

            var j;
            var section = '';

            for( var i = _i; i < _n; ++i ){

                line = lines[ i ];

                if (line.trim().length == 0) {
                    section = ''
                }
                
                if (section === 'atoms'){
                    pendingStart = false;
                    atominfo = line.split(' ');

                    var element;
                    serial = parseInt(atominfo[0]);
                    chainname = atominfo[1].trim();
                    if (residins_regex.test(atominfo[2])){
                        var matches = residins_regex.exec(atominfo[2]);
                        resno = parseInt(matches[0]);
                        inscode = matches[1];
                    }else {
                        resno = parseInt(atominfo[2]);
                        inscode = '';
                    }
                    resname = atominfo[3].trim();
                    atomname = atominfo[4].trim();
                    element = atominfo[5].trim();

                    atomStore.growIfFull();
                    atomStore.atomTypeId[idx] = atomMap.add(atomname, element);
                    atomStore.serial[idx] = serial;
                    atomStore.bfactor[idx] = 0;
                    atomStore.altloc[idx] = NaN;
                    atomStore.occupancy[idx] = 0;

                    sb.addAtom(modelIdx, chainname, resname, resno, 0, undefined, inscode);

                    serialDict[serial] = idx;
                    idx += 1;
                }else if (section === 'bonds'){
                    var bondlist = line.split(' ');
                    var bondIndex = {};
                    for (j = 0; j < bondlist.length; j=j+2){
                        var from = parseInt(bondlist[j]) - 1;
                        var to = parseInt(bondlist[j+1]) - 1;

                        if( from < to ){
                            ap1.index = from;
                            ap2.index = to;
                        }else{
                            ap1.index = to;
                            ap2.index = from;
                        }

                        // interpret records where a bond is given multiple times as double/triple bonds
                        if( bondIndex[ to ] !== undefined ){
                            s.bondStore.bondOrder[ bondIndex[ to ] ] += 1;
                        }else{
                            var hash = ap1.index + "|" + ap2.index;
                            if( bondDict[ hash ] === undefined ){
                                bondDict[ hash ] = true;
                                bondIndex[ to ] = s.bondStore.count;
                                s.bondStore.addBond( ap1, ap2, 1 );  // start/assume with single bond
                            }
                        }
                    }
                    s.hasConnect = true;
                }

                if (line.includes('!NATOM')) {
                    section = 'atoms'
                } else if (line.includes('!NBOND')) {
                    section = 'bonds'
                }
            }
        }

        this.streamer.eachChunkOfLines( function( lines/*, chunkNo, chunkCount*/ ){
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

        if( Debug ) Log.timeEnd( "PsfParser._parse " + this.name );
        callback();

    }

} );

ParserRegistry.add( "psf", PsfParser );

export default PsfParser;

