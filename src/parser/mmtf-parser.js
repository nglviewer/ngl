/**
 * @file Mmtf Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4 } from "../../lib/three.es6.js";

import { Debug, Log, ParserRegistry } from "../globals.js";
import StructureParser from "./structure-parser.js";
import {
    buildUnitcellAssembly, calculateBondsBetween, calculateBondsWithin
} from "../structure/structure-utils.js";
import { ChemCompHetero } from "../structure/structure-constants.js";
import Entity from "../structure/entity.js";
import Unitcell from "../symmetry/unitcell.js";
import Assembly from "../symmetry/assembly.js";

import { decodeMsgpack, decodeMmtf } from "../../lib/mmtf.es6.js";


var SstrucMap = {
    "0": "i".charCodeAt( 0 ),  // pi helix
    "1": "s".charCodeAt( 0 ),  // bend
    "2": "h".charCodeAt( 0 ),  // alpha helix
    "3": "e".charCodeAt( 0 ),  // extended
    "4": "g".charCodeAt( 0 ),  // 3-10 helix
    "5": "b".charCodeAt( 0 ),  // bridge
    "6": "t".charCodeAt( 0 ),  // turn
    "7": "l".charCodeAt( 0 ),  // coil
    "-1": "".charCodeAt( 0 )   // NA
};


function MmtfParser( streamer, params ){

    StructureParser.call( this, streamer, params );

}

MmtfParser.prototype = Object.assign( Object.create(

    StructureParser.prototype ), {

    constructor: MmtfParser,
    type: "mmtf",

    _parse: function(){

        // https://github.com/rcsb/mmtf

        if( Debug ) Log.time( "MmtfParser._parse " + this.name );

        var i, il, j, jl, groupData;

        var s = this.structure;
        var sd = decodeMmtf( decodeMsgpack( this.streamer.data ) );

        // structure header
        var headerFields = [
            "depositionDate", "releaseDate", "resolution",
            "rFree", "rWork", "experimentalMethods"
        ];
        headerFields.forEach( function( name ){
            if( sd[ name ] !== undefined ){
                s.header[ name ] = sd[ name ];
            }
        } );

        var numBonds, numAtoms, numGroups, numChains, numModels;
        var chainsPerModel;

        s.id = sd.structureId;
        s.title = sd.title;

        if( this.firstModelOnly || this.asTrajectory ){

            numModels = 1;
            numChains = sd.chainsPerModel[ 0 ];

            numGroups = 0;
            for( i = 0, il = numChains; i < il; ++i ){
                numGroups += sd.groupsPerChain[ i ];
            }

            numAtoms = 0;
            for( i = 0, il = numGroups; i < il; ++i ){
                groupData = sd.groupList[ sd.groupTypeList[ i ] ];
                numAtoms += groupData.atomNameList.length;
            }

            numBonds = sd.numBonds;

            chainsPerModel = [ numChains ];

        }else{

            numBonds = sd.numBonds;
            numAtoms = sd.numAtoms;
            numGroups = sd.numGroups;
            numChains = sd.numChains;
            numModels = sd.numModels;

            chainsPerModel = sd.chainsPerModel;

        }

        numBonds += numGroups;  // add numGroups to have space for polymer bonds

        //

        if( this.asTrajectory ){

            for( i = 0, il = sd.numModels; i < il; ++i ){

                var frame = new Float32Array( numAtoms * 3 );
                var frameAtomOffset = numAtoms * i;

                for( j = 0; j < numAtoms; ++j ){
                    var j3 = j * 3;
                    var offset = j + frameAtomOffset;
                    frame[ j3     ] = sd.xCoordList[ offset ];
                    frame[ j3 + 1 ] = sd.yCoordList[ offset ];
                    frame[ j3 + 2 ] = sd.zCoordList[ offset ];
                }

                s.frames.push( frame );

            }

        }

        // bondStore
        var bAtomIndex1 = new Uint32Array( numBonds );
        var bAtomIndex2 = new Uint32Array( numBonds );
        var bBondOrder = new Uint8Array( numBonds );

        var aGroupIndex = new Uint32Array( numAtoms );

        var gChainIndex = new Uint32Array( numGroups );
        var gAtomOffset = new Uint32Array( numGroups );
        var gAtomCount = new Uint16Array( numGroups );

        var cModelIndex = new Uint16Array( numChains );
        var cGroupOffset = new Uint32Array( numChains );
        var cGroupCount = new Uint32Array( numChains );

        var mChainOffset = new Uint32Array( numModels );
        var mChainCount = new Uint32Array( numModels );

        // set-up model-chain relations
        var chainOffset = 0;
        for( i = 0, il = numModels; i < il; ++i ){
            var modelChainCount = chainsPerModel[ i ];
            mChainOffset[ i ] = chainOffset;
            mChainCount[ i ] = modelChainCount;
            for( j = 0; j < modelChainCount; ++j ){
                cModelIndex[ j + chainOffset ] = i;
            }
            chainOffset += modelChainCount;
        }

        // set-up chain-residue relations
        var groupsPerChain = sd.groupsPerChain;
        var groupOffset = 0;
        for( i = 0, il = numChains; i < il; ++i ){
            var chainGroupCount = groupsPerChain[ i ];
            cGroupOffset[ i ] = groupOffset;
            cGroupCount[ i ] = chainGroupCount;
            for( j = 0; j < chainGroupCount; ++j ){
                gChainIndex[ j + groupOffset ] = i;
            }
            groupOffset += chainGroupCount;
        }

        //////
        // get data from group map

        var atomOffset = 0;
        var bondOffset = 0;

        for( i = 0, il = numGroups; i < il; ++i ){

            groupData = sd.groupList[ sd.groupTypeList[ i ] ];
            var groupAtomCount = groupData.atomNameList.length;

            var groupBondAtomList = groupData.bondAtomList;
            var groupBondOrderList = groupData.bondOrderList;

            for( j = 0, jl = groupBondOrderList.length; j < jl; ++j ){
                bAtomIndex1[ bondOffset ] = atomOffset + groupBondAtomList[ j * 2 ];
                bAtomIndex2[ bondOffset ] = atomOffset + groupBondAtomList[ j * 2 + 1 ];
                bBondOrder[ bondOffset ] = groupBondOrderList[ j ];
                bondOffset += 1;
            }

            //

            gAtomOffset[ i ] = atomOffset;
            gAtomCount[ i ] = groupAtomCount;

            for( j = 0; j < groupAtomCount; ++j ){
                aGroupIndex[ atomOffset ] = i;
                atomOffset += 1;
            }

        }

        // extra bonds

        var bondAtomList = sd.bondAtomList;
        if( bondAtomList ){

            if( sd.bondOrderList ){
                bBondOrder.set( sd.bondOrderList, bondOffset );
            }

            for( i = 0, il = bondAtomList.length; i < il; i += 2 ){
                var atomIndex1 = bondAtomList[ i ];
                var atomIndex2 = bondAtomList[ i + 1 ];
                if( atomIndex1 < numAtoms && atomIndex2 < numAtoms ){
                    bAtomIndex1[ bondOffset ] = atomIndex1;
                    bAtomIndex2[ bondOffset ] = atomIndex2;
                    bondOffset += 1;
                }
            }

        }

        //

        s.bondStore.length = bBondOrder.length;
        s.bondStore.count = bondOffset;
        s.bondStore.atomIndex1 = bAtomIndex1;
        s.bondStore.atomIndex2 = bAtomIndex2;
        s.bondStore.bondOrder = bBondOrder;

        s.atomStore.length = numAtoms;
        s.atomStore.count = numAtoms;
        s.atomStore.residueIndex = aGroupIndex;
        s.atomStore.atomTypeId = new Uint16Array( numAtoms );
        s.atomStore.x = sd.xCoordList.subarray( 0, numAtoms );
        s.atomStore.y = sd.yCoordList.subarray( 0, numAtoms );
        s.atomStore.z = sd.zCoordList.subarray( 0, numAtoms );
        s.atomStore.serial = sd.atomIdList.subarray( 0, numAtoms );
        s.atomStore.bfactor = sd.bFactorList.subarray( 0, numAtoms );
        s.atomStore.altloc = sd.altLocList.subarray( 0, numAtoms );
        s.atomStore.occupancy = sd.occupancyList.subarray( 0, numAtoms );

        s.residueStore.length = numGroups;
        s.residueStore.count = numGroups;
        s.residueStore.chainIndex = gChainIndex;
        s.residueStore.residueTypeId = sd.groupTypeList;
        s.residueStore.atomOffset = gAtomOffset;
        s.residueStore.atomCount = gAtomCount;
        s.residueStore.resno = sd.groupIdList.subarray( 0, numGroups );
        s.residueStore.sstruc = sd.secStructList.subarray( 0, numGroups );
        s.residueStore.inscode = sd.insCodeList.subarray( 0, numGroups );

        s.chainStore.length = numChains;
        s.chainStore.count = numChains;
        s.chainStore.entityIndex = new Uint16Array( numChains );
        s.chainStore.modelIndex = cModelIndex;
        s.chainStore.residueOffset = cGroupOffset;
        s.chainStore.residueCount = cGroupCount;
        s.chainStore.chainname = sd.chainNameList.subarray( 0, numChains * 4 );
        s.chainStore.chainid = sd.chainIdList.subarray( 0, numChains * 4 );

        s.modelStore.length = numModels;
        s.modelStore.count = numModels;
        s.modelStore.chainOffset = mChainOffset;
        s.modelStore.chainCount = mChainCount;

        //

        var groupTypeDict = {};
        for( i = 0, il = sd.groupList.length; i < il; ++i ){
            var groupType = sd.groupList[ i ];
            var atomTypeIdList = [];
            for( j = 0, jl = groupType.atomNameList.length; j < jl; ++j ){
                var element = groupType.elementList[ j ].toUpperCase();
                var atomname = groupType.atomNameList[ j ];
                atomTypeIdList.push( s.atomMap.add( atomname, element ) );
            }
            var chemCompType = groupType.chemCompType.toUpperCase();
            var hetFlag = ChemCompHetero.includes( chemCompType );

            var numGroupBonds = groupType.bondOrderList.length;
            var atomIndices1 = new Array( numGroupBonds );
            var atomIndices2 = new Array( numGroupBonds );
            for( j = 0; j < numGroupBonds; ++j ){
                atomIndices1[ j ] = groupType.bondAtomList[ j * 2 ];
                atomIndices2[ j ] = groupType.bondAtomList[ j * 2 + 1 ];
            }
            var bonds = {
                atomIndices1: atomIndices1,
                atomIndices2: atomIndices2,
                bondOrders: groupType.bondOrderList
            };

            groupTypeDict[ i ] = s.residueMap.add(
                groupType.groupName, atomTypeIdList, hetFlag, chemCompType, bonds
            );
        }

        for( i = 0, il = numGroups; i < il; ++i ){
            s.residueStore.residueTypeId[ i ] = groupTypeDict[ s.residueStore.residueTypeId[ i ] ];
        }

        for( i = 0, il = s.atomStore.count; i < il; ++i ){
            var residueIndex = s.atomStore.residueIndex[ i ];
            var residueType = s.residueMap.list[ s.residueStore.residueTypeId[ residueIndex ] ];
            var resAtomOffset = s.residueStore.atomOffset[ residueIndex ];
            s.atomStore.atomTypeId[ i ] = residueType.atomTypeIdList[ i - resAtomOffset ];
        }

        if( sd.secStructList ){
            var secStructLength = sd.secStructList.length;
            for( i = 0, il = s.residueStore.count; i < il; ++i ){
                // with ( i % secStructLength ) secStruct entries are reused
                var sstruc = SstrucMap[ s.residueStore.sstruc[ i % secStructLength ] ];
                if( sstruc !== undefined ) s.residueStore.sstruc[ i ] = sstruc;
            }
        }

        //

        if( sd.entityList ){
            sd.entityList.forEach( function( e, i ){
                s.entityList[ i ] = new Entity(
                    s, i, e.description, e.type, e.chainIndexList
                );
            } );
        }

        if( sd.bioAssemblyList ){
            sd.bioAssemblyList.forEach( function( _assembly, k ){
                var id = k + 1;
                var assembly = new Assembly( id );
                s.biomolDict[ "BU" + id ] = assembly;
                var chainToPart = {};
                _assembly.transformList.forEach( function( _transform ){
                    var matrix = new Matrix4().fromArray( _transform.matrix ).transpose();
                    var chainList = _transform.chainIndexList.map( function( chainIndex ){
                        var chainname = "";
                        for( var k = 0; k < 4; ++k ){
                            var code = sd.chainNameList[ chainIndex * 4 + k ];
                            if( code ){
                                chainname += String.fromCharCode( code );
                            }else{
                                break;
                            }
                        }
                        return chainname;
                    } );
                    var part = chainToPart[ chainList ];
                    if( part ){
                        part.matrixList.push( matrix );
                    }else{
                        chainToPart[ chainList ] = assembly.addPart( [ matrix ], chainList );
                    }
                } );
            } );
        }

        if( sd.ncsOperatorList ){
            var ncsName = "NCS";
            var ncsAssembly = new Assembly( ncsName );
            var ncsPart = ncsAssembly.addPart();
            sd.ncsOperatorList.forEach( function( _operator ){
                var matrix = new Matrix4().fromArray( _operator ).transpose();
                ncsPart.matrixList.push( matrix );
            } );
            if( ncsPart.matrixList.length > 0 ){
                s.biomolDict[ ncsName ] = ncsAssembly;
            }
        }

        if( sd.unitCell && Array.isArray( sd.unitCell ) && sd.unitCell[ 0 ] ){
            s.unitcell = new Unitcell(
                sd.unitCell[ 0 ], sd.unitCell[ 1 ], sd.unitCell[ 2 ],
                sd.unitCell[ 3 ], sd.unitCell[ 4 ], sd.unitCell[ 5 ],
                sd.spaceGroup
            );
        }else{
            s.unitcell = undefined;
        }

        if( Debug ) Log.timeEnd( "MmtfParser._parse " + this.name );

        // calculate backbone bonds
        calculateBondsBetween( s, true );

        // calculate rung bonds
        calculateBondsWithin( s, true );

        s.finalizeAtoms();
        s.finalizeBonds();

        buildUnitcellAssembly( s );

    }

} );

ParserRegistry.add( "mmtf", MmtfParser );


export default MmtfParser;
