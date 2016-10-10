/**
 * @file Structure Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Matrix4 } from "../../lib/three.es6.js";

import { Debug, Log } from "../globals.js";
import { binarySearchIndexOf } from "../utils.js";
import Helixbundle from "../geometry/helixbundle.js";
import Kdtree from "../geometry/kdtree.js";
import { getSymmetryOperations } from "../symmetry/symmetry-utils.js";
import Assembly from "../symmetry/assembly.js";

import { UnknownBackboneType } from "./structure-constants";


function reorderAtoms( structure ){

    if( Debug ) Log.time( "reorderAtoms" );

    var ap1 = structure.getAtomProxy();
    var ap2 = structure.getAtomProxy();

    function compareModelChainResno( index1, index2 ){
        ap1.index = index1;
        ap2.index = index2;
        if( ap1.modelindex < ap2.modelindex ){
            return -1;
        }else if( ap1.modelindex > ap2.modelindex ){
            return 1;
        }else{
            if( ap1.chainname < ap2.chainname ){
                return -1;
            }else if( ap1.chainname > ap2.chainname ){
                return 1;
            }else{
                if( ap1.resno < ap2.resno ){
                    return -1;
                }else if( ap1.resno > ap2.resno ){
                    return 1;
                }else{
                    return 0;
                }
            }
        }
    }

    structure.atomStore.sort( compareModelChainResno );

    if( Debug ) Log.timeEnd( "reorderAtoms" );

}


function assignSecondaryStructure( structure, secStruct ){

    if( !secStruct ) return;

    if( Debug ) Log.time( "assignSecondaryStructure" );

    var chainnames = [];
    structure.eachModel( function( mp ){
        mp.eachChain( function( cp ){
            chainnames.push( cp.chainname );
        } );
    } );

    var chainnamesSorted = chainnames.slice().sort();
    var chainnamesIndex = [];
    chainnamesSorted.forEach( function( c ){
        chainnamesIndex.push( chainnames.indexOf( c ) );
    } );

    // helix assignment

    var helices = secStruct.helices;

    helices = helices.filter( function( h ){
        return binarySearchIndexOf( chainnamesSorted, h[ 0 ] ) >= 0;
    } );

    helices.sort( function( h1, h2 ){

        var c1 = h1[ 0 ];
        var c2 = h2[ 0 ];
        var r1 = h1[ 1 ];
        var r2 = h2[ 1 ];

        if( c1 === c2 ){
            if( r1 === r2 ){
                return 0;
            }else{
                return r1 < r2 ? -1 : 1;
            }
        }else{
            var idx1 = binarySearchIndexOf( chainnamesSorted, c1 );
            var idx2 = binarySearchIndexOf( chainnamesSorted, c2 );
            return chainnamesIndex[ idx1 ] < chainnamesIndex[ idx2 ] ? -1 : 1;
        }

    } );

    var residueStore = structure.residueStore;

    structure.eachModel( function( mp ){

        var i = 0;
        var n = helices.length;
        if( n === 0 ) return;
        var helix = helices[ i ];
        var helixRun = false;
        var done = false;

        mp.eachChain( function( cp ){

            var chainChange = false;

            if( cp.chainname === helix[ 0 ] ){

                var count = cp.residueCount;
                var offset = cp.residueOffset;
                var end = offset + count;

                for( var j = offset; j < end; ++j ){

                    if( residueStore.resno[ j ] === helix[ 1 ] &&  // resnoBeg
                        residueStore.getInscode( j ) === helix[ 2 ]   // inscodeBeg
                    ){
                        helixRun = true;
                    }

                    if( helixRun ){

                        residueStore.sstruc[ j ] = helix[ 6 ];

                        if( residueStore.resno[ j ] === helix[ 4 ] &&  // resnoEnd
                            residueStore.getInscode( j ) === helix[ 5 ]   // inscodeEnd
                        ){

                            helixRun = false;
                            i += 1;

                            if( i < n ){
                                // must look at previous residues as
                                // residues may not be ordered by resno
                                j = offset - 1;
                                helix = helices[ i ];
                                chainChange = cp.chainname !== helix[ 0 ];
                            }else{
                                done = true;
                            }

                        }

                    }

                    if( chainChange || done ) return;

                }

            }

        } );

    } );

    // sheet assignment

    var sheets = secStruct.sheets;

    sheets = sheets.filter( function( s ){
        return binarySearchIndexOf( chainnamesSorted, s[ 0 ] ) >= 0;
    } );

    sheets.sort( function( s1, s2 ){

        var c1 = s1[ 0 ];
        var c2 = s2[ 0 ];

        if( c1 === c2 ) return 0;
        var idx1 = binarySearchIndexOf( chainnamesSorted, c1 );
        var idx2 = binarySearchIndexOf( chainnamesSorted, c2 );
        return chainnamesIndex[ idx1 ] < chainnamesIndex[ idx2 ] ? -1 : 1;

    } );

    var strandCharCode = "e".charCodeAt( 0 );
    structure.eachModel( function( mp ){

        var i = 0;
        var n = sheets.length;
        if( n === 0 ) return;
        var sheet = sheets[ i ];
        var sheetRun = false;
        var done = false;

        mp.eachChain( function( cp ){

            var chainChange = false;

            if( cp.chainname === sheet[ 0 ] ){

                var count = cp.residueCount;
                var offset = cp.residueOffset;
                var end = offset + count;

                for( var j = offset; j < end; ++j ){

                    if( residueStore.resno[ j ] === sheet[ 1 ] &&  // resnoBeg
                        residueStore.getInscode( j ) === sheet[ 2 ]   // inscodeBeg
                    ){
                        sheetRun = true;
                    }

                    if( sheetRun ){

                        residueStore.sstruc[ j ] = strandCharCode;

                        if( residueStore.resno[ j ] === sheet[ 4 ] &&  // resnoEnd
                            residueStore.getInscode( j ) === sheet[ 5 ]   // inscodeEnd
                        ){

                            sheetRun = false;
                            i += 1;

                            if( i < n ){
                                // must look at previous residues as
                                // residues may not be ordered by resno
                                j = offset - 1;
                                sheet = sheets[ i ];
                                chainChange = cp.chainname !== sheet[ 0 ];
                            }else{
                                done = true;
                            }

                        }

                    }

                    if( chainChange || done ) return;

                }

            }

        } );

    } );

    if( Debug ) Log.timeEnd( "assignSecondaryStructure" );

}


var calculateSecondaryStructure = function(){

    // Implementation for proteins based on "pv"
    //
    // assigns secondary structure information based on a simple and very fast
    // algorithm published by Zhang and Skolnick in their TM-align paper.
    // Reference:
    //
    // TM-align: a protein structure alignment algorithm based on the Tm-score
    // (2005) NAR, 33(7) 2302-2309

    var zhangSkolnickSS = function( polymer, i, distances, delta ){

        var structure = polymer.structure;
        var offset = polymer.residueIndexStart;
        var rp1 = structure.getResidueProxy();
        var rp2 = structure.getResidueProxy();
        var ap1 = structure.getAtomProxy();
        var ap2 = structure.getAtomProxy();

        for( var j = Math.max( 0, i - 2 ); j <= i; ++j ){

            for( var k = 2;  k < 5; ++k ){

                if( j + k >= polymer.residueCount ){
                    continue;
                }

                rp1.index = offset + j;
                rp2.index = offset + j + k;
                ap1.index = rp1.traceAtomIndex;
                ap2.index = rp2.traceAtomIndex;

                var d = ap1.distanceTo( ap2 );

                if( Math.abs( d - distances[ k - 2 ] ) > delta ){
                    return false;
                }

            }

        }

        return true;

    };

    var isHelical = function( polymer, i ){
        var helixDistances = [ 5.45, 5.18, 6.37 ];
        var helixDelta = 2.1;
        return zhangSkolnickSS( polymer, i, helixDistances, helixDelta );
    };

    var isSheet = function( polymer, i ){
        var sheetDistances = [ 6.1, 10.4, 13.0 ];
        var sheetDelta = 1.42;
        return zhangSkolnickSS( polymer, i, sheetDistances, sheetDelta );
    };

    var proteinPolymer = function( p ){
        var residueStore = p.residueStore;
        var offset = p.residueIndexStart;
        for( var i = 0, il = p.residueCount; i < il; ++i ){
            var sstruc = "c";
            if( isHelical( p, i ) ){
                sstruc = "h";
            }else if( isSheet( p, i ) ){
                sstruc = "s";
            }
            residueStore.sstruc[ offset + i ] = sstruc.charCodeAt( 0 );
        }
    };

    var cgPolymer = function( p ){

        var localAngle = 20;
        var centerDist = 2.0;

        var residueStore = p.residueStore;
        var offset = p.residueIndexStart;

        var helixbundle = new Helixbundle( p );
        var pos = helixbundle.position;

        var c1 = new Vector3();
        var c2 = new Vector3();

        for( var i = 0, il = p.residueCount; i < il; ++i ){

            c1.fromArray( pos.center, i * 3 );
            c2.fromArray( pos.center, i * 3 + 3 );
            var d = c1.distanceTo( c2 );

            if( d < centerDist && d > 1.0 && pos.bending[ i ] < localAngle ){
                residueStore.sstruc[ offset + i ] = "h".charCodeAt( 0 );
                residueStore.sstruc[ offset + i + 1 ] = "h".charCodeAt( 0 );
            }

        }

    };

    return function calculateSecondaryStructure( structure ){

        if( Debug ) Log.time( "calculateSecondaryStructure" );

        structure.eachPolymer( function( p ){

            // assign secondary structure
            if( p.residueCount < 4 ) return;
            if( p.isCg() ){
                cgPolymer( p );
            }else if( p.isProtein() ){
                proteinPolymer( p );
            }else{
                return;
            }

            // set lone secondary structure assignments to "c"
            var prevSstruc;
            var sstrucCount = 0;
            p.eachResidue( function( r ){
                if( r.sstruc === prevSstruc ){
                    sstrucCount += 1;
                }else{
                    if( sstrucCount === 1 ){
                        r.index -= 1;
                        r.sstruc = "c";
                    }
                    sstrucCount = 1;
                    prevSstruc = r.sstruc;
                }
            } );

        } );

        if( Debug ) Log.timeEnd( "calculateSecondaryStructure" );

    };

}();


function calculateChainnames( structure ){

    if( Debug ) Log.time( "calculateChainnames" );

    var doAutoChainName = true;
    structure.eachChain( function( c ){
        if( c.chainname ) doAutoChainName = false;
    } );

    if( doAutoChainName ){

        // var names = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        //             "abcdefghijklmnopqrstuvwxyz" +
        //             "0123456789";
        var names = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var n = names.length;

        var modelStore = structure.modelStore;
        var chainStore = structure.chainStore;
        var residueStore = structure.residueStore;

        var addChain = function( mIndex, chainname, rOffset, rCount ){
            var ci = chainStore.count;
            for( var i = 0; i < rCount; ++i ){
                residueStore.chainIndex[ rOffset + i ] = ci;
            }
            chainStore.growIfFull();
            chainStore.modelIndex[ ci ] = mIndex;
            chainStore.setChainname( ci, chainname );
            chainStore.setChainid( ci, chainname );
            chainStore.residueOffset[ ci ] = rOffset;
            chainStore.residueCount[ ci ] = rCount;
            chainStore.count += 1;
            modelStore.chainCount[ mIndex ] += 1;
        };

        var getName = function( i ){
            var j = i;
            var k = 0;
            var chainname = names[ j % n ];
            while( j >= n ){
                j = Math.floor( j / n );
                chainname += names[ j % n ];
                k += 1;
            }
            if( k >= 5 ){
                Log.warn( "chainname overflow" );
            }
            return chainname;
        };

        var ap1 = structure.getAtomProxy();
        var ap2 = structure.getAtomProxy();

        var i = 0;
        var mi = 0;
        var rStart = 0;
        var rEnd = 0;
        var chainData = [];

        if( residueStore.count === 1 ){

            chainData.push( {
                mIndex: 0,
                chainname: "A",
                rStart: 0,
                rCount: 1
            } );

        }else{

            structure.eachResidueN( 2, function( rp1, rp2 ){

                var newChain = false;

                var bbType1 = rp1.backboneType;
                var bbType2 = rp2.backboneType;
                var bbTypeUnk = UnknownBackboneType;

                rEnd = rp1.index;

                if( rp1.modelIndex !== rp2.modelIndex ){
                    newChain = true;
                }else if( rp1.moleculeType !== rp2.moleculeType ){
                    newChain = true;
                }else if( bbType1 !== bbTypeUnk && bbType1 === bbType2 ){
                    ap1.index = rp1.backboneEndAtomIndex;
                    ap2.index = rp2.backboneStartAtomIndex;
                    if( !ap1.connectedTo( ap2 ) ){
                        newChain = true;
                    }
                }

                // current chain goes to end of the structure
                if( !newChain && rp2.index === residueStore.count - 1 ){
                    newChain = true;
                    rEnd = rp2.index;
                }

                if( newChain ){

                    chainData.push( {
                        mIndex: mi,
                        chainname: getName( i ),
                        rStart: rStart,
                        rCount: rEnd - rStart + 1
                    } );

                    i += 1;

                    if( rp1.modelIndex !== rp2.modelIndex ){
                        i = 0;
                        mi += 1;
                    }

                    // new chain for the last residue of the structure
                    if( rp2.index === residueStore.count - 1 && rEnd !== rp2.index ){
                        chainData.push( {
                            mIndex: mi,
                            chainname: getName( i ),
                            rStart: residueStore.count - 1,
                            rCount: 1
                        } );
                    }

                    rStart = rp2.index;
                    rEnd = rp2.index;

                }

            } );

        }

        //

        chainStore.count = 0;
        chainData.forEach( function( d ){
            addChain( d.mIndex, d.chainname, d.rStart, d.rCount );
        } );

        var chainOffset = 0;
        structure.eachModel( function( mp ){
            modelStore.chainOffset[ mp.index ] = chainOffset;
            modelStore.chainCount[ mp.index ] -= 1;
            chainOffset += modelStore.chainCount[ mp.index ];
        } );

    }

    if( Debug ) Log.timeEnd( "calculateChainnames" );

}


function calculateBonds( structure ){

    if( Debug ) Log.time( "calculateBonds" );

    calculateBondsWithin( structure );
    calculateBondsBetween( structure );

    if( Debug ) Log.timeEnd( "calculateBonds" );

}


function calculateResidueBonds( r ){

    var structure = r.structure;
    var a1 = structure.getAtomProxy();
    var a2 = structure.getAtomProxy();

    var count = r.atomCount;
    var offset = r.atomOffset;
    var end = offset + count;
    var end1 = end - 1;

    if( count > 500 ){
        if( Debug ) Log.warn( "more than 500 atoms, skip residue for auto-bonding", r.qualifiedName() );
        return;
    }

    var i, j;
    var atomIndices1 = [];
    var atomIndices2 = [];
    var bondOrders = [];

    if( count > 50 ){

        var kdtree = new Kdtree( r, true );
        var radius = r.isCg() ? 1.2 : 2.3;

        for( i = offset; i < end1; ++i ){
            a1.index = i;
            var maxd = a1.covalent + radius + 0.3;
            var nearestAtoms = kdtree.nearest(
                a1, Infinity, maxd * maxd
            );
            var m = nearestAtoms.length;
            for( j = 0; j < m; ++j ){
                a2.index = nearestAtoms[ j ].index;
                if( a1.index < a2.index ){
                    if( a1.connectedTo( a2 ) ){
                        atomIndices1.push( a1.index - offset );
                        atomIndices2.push( a2.index - offset );
                        bondOrders.push( 1 );
                    }
                }
            }
        }

    }else{

        for( i = offset; i < end1; ++i ){
            a1.index = i;
            for( j = i + 1; j <= end1; ++j ){
                a2.index = j;
                if( a1.connectedTo( a2 ) ){
                    atomIndices1.push( i - offset );
                    atomIndices2.push( j - offset );
                    bondOrders.push( 1 );
                }
            }
        }

    }

    return {
        atomIndices1: atomIndices1,
        atomIndices2: atomIndices2,
        bondOrders: bondOrders
    };

}


function calculateAtomBondMap( structure ){

    if( Debug ) Log.time( "calculateAtomBondMap" );

    var atomBondMap = [];

    structure.eachBond( function( bp ){
        var ai1 = bp.atomIndex1;
        var ai2 = bp.atomIndex2;
        if( atomBondMap[ ai1 ] === undefined ) atomBondMap[ ai1 ] = [];
        atomBondMap[ ai1 ][ ai2 ] = bp.index;
    } );

    if( Debug ) Log.timeEnd( "calculateAtomBondMap" );

    return atomBondMap;

}


function calculateBondsWithin( structure, onlyAddRung ){

    if( Debug ) Log.time( "calculateBondsWithin" );

    var bondStore = structure.bondStore;
    var rungBondStore = structure.rungBondStore;
    var rungAtomSet = structure.getAtomSet( false );
    var a1 = structure.getAtomProxy();
    var a2 = structure.getAtomProxy();
    var bp = structure.getBondProxy();
    var atomBondMap = calculateAtomBondMap( structure );

    structure.eachResidue( function( r ){

        if( !onlyAddRung ){

            var count = r.atomCount;
            var offset = r.atomOffset;

            if( count > 500 ){
                Log.warn( "more than 500 atoms, skip residue for auto-bonding", r.qualifiedName() );
                return;
            }

            var bonds = r.getBonds();
            var atomIndices1 = bonds.atomIndices1;
            var atomIndices2 = bonds.atomIndices2;
            var bondOrders = bonds.bondOrders;
            var nn = atomIndices1.length;

            for( var i = 0; i < nn; ++i ){
                var ai1 = atomIndices1[ i ] + offset;
                var ai2 = atomIndices2[ i ] + offset;
                var tmp = atomBondMap[ ai1 ];
                if( tmp !== undefined && ( tmp = tmp[ ai2 ] ) !== undefined ){
                    bp.index = tmp;
                    var residueTypeBondIndex = r.residueType.getBondIndex( ai1, ai2 );
                    // overwrite residueType bondOrder with value from existing bond
                    bondOrders[ residueTypeBondIndex ] = bp.bondOrder;
                }else{
                    a1.index = ai1;
                    a2.index = ai2;
                    // only add bond if not already in bondStore
                    bondStore.addBond( a1, a2, bondOrders[ i ] );
                }
            }

        }

        // get RNA/DNA rung pseudo bonds
        var traceAtomIndex = r.residueType.traceAtomIndex;
        var rungEndAtomIndex = r.residueType.rungEndAtomIndex;
        if( traceAtomIndex !== -1 && rungEndAtomIndex !== -1 ){
            a1.index = r.traceAtomIndex;
            a2.index = r.rungEndAtomIndex;
            rungBondStore.addBond( a1, a2 );
            rungAtomSet.add_unsafe( a1.index );
            rungAtomSet.add_unsafe( a2.index );
        }

    } );

    structure.atomSetDict.rung = rungAtomSet;

    if( Debug ) Log.timeEnd( "calculateBondsWithin" );

}


function calculateBondsBetween( structure, onlyAddBackbone ){

    if( Debug ) Log.time( "calculateBondsBetween" );

    var bondStore = structure.bondStore;
    var backboneBondStore = structure.backboneBondStore;
    var backboneAtomSet = structure.getAtomSet( false );
    var ap1 = structure.getAtomProxy();
    var ap2 = structure.getAtomProxy();

    if( backboneBondStore.count === 0 ){
        backboneBondStore.resize( structure.residueStore.count );
    }

    function addBondIfConnected( rp1, rp2 ){
        var bbType1 = rp1.backboneType;
        var bbType2 = rp2.backboneType;
        if( bbType1 !== UnknownBackboneType && bbType1 === bbType2 ){
            ap1.index = rp1.backboneEndAtomIndex;
            ap2.index = rp2.backboneStartAtomIndex;
            if( ap1.connectedTo( ap2 ) ){
                if( !onlyAddBackbone ){
                    bondStore.addBond( ap1, ap2, 1 );  // assume single bond
                }
                ap1.index = rp1.traceAtomIndex;
                ap2.index = rp2.traceAtomIndex;
                backboneBondStore.addBond( ap1, ap2 );
                backboneAtomSet.add_unsafe( ap1.index );
                backboneAtomSet.add_unsafe( ap2.index );
            }
        }
    }

    structure.eachResidueN( 2, addBondIfConnected );

    var rp1 = structure.getResidueProxy();
    var rp2 = structure.getResidueProxy();

    // check for cyclic chains
    structure.eachChain( function( cp ){
        if( cp.residueCount === 0 ) return;
        rp1.index = cp.residueOffset;
        rp2.index = cp.residueOffset + cp.residueCount - 1;
        addBondIfConnected( rp2, rp1 );
    } );

    structure.atomSetDict.backbone = backboneAtomSet;

    if( Debug ) Log.timeEnd( "calculateBondsBetween" );

}


function buildUnitcellAssembly( structure ){

    if( !structure.unitcell ) return;

    if( Debug ) Log.time( "buildUnitcellAssembly" );

    var uc = structure.unitcell;

    var centerFrac = structure.center.clone().applyMatrix4( uc.cartToFrac );
    var symopDict = getSymmetryOperations( uc.spacegroup );

    var positionFrac = new Vector3();
    var centerFracSymop = new Vector3();
    var positionFracSymop = new Vector3();

    if( centerFrac.x > 1 ) positionFrac.x -= 1;
    if( centerFrac.x < 0 ) positionFrac.x += 1;
    if( centerFrac.y > 1 ) positionFrac.y -= 1;
    if( centerFrac.y < 0 ) positionFrac.y += 1;
    if( centerFrac.z > 1 ) positionFrac.z -= 1;
    if( centerFrac.z < 0 ) positionFrac.z += 1;

    function getMatrixList( shift ){

        var matrixList = [];

        Object.keys( symopDict ).forEach( function( name ){

            var m = symopDict[ name ].clone();

            centerFracSymop.copy( centerFrac ).applyMatrix4( m );
            positionFracSymop.setFromMatrixPosition( m );
            positionFracSymop.sub( positionFrac );

            if( centerFracSymop.x > 1 ) positionFracSymop.x -= 1;
            if( centerFracSymop.x < 0 ) positionFracSymop.x += 1;
            if( centerFracSymop.y > 1 ) positionFracSymop.y -= 1;
            if( centerFracSymop.y < 0 ) positionFracSymop.y += 1;
            if( centerFracSymop.z > 1 ) positionFracSymop.z -= 1;
            if( centerFracSymop.z < 0 ) positionFracSymop.z += 1;

            if( shift ) positionFracSymop.add( shift );

            m.setPosition( positionFracSymop );
            m.multiplyMatrices( uc.fracToCart, m );
            m.multiply( uc.cartToFrac );

            matrixList.push( m );

        } );

        return matrixList;

    }

    var unitcellAssembly = new Assembly( "UNITCELL" );
    var unitcellMatrixList = getMatrixList();
    var ncsMatrixList;
    if( structure.biomolDict.NCS ){
        ncsMatrixList = [ new Matrix4() ].concat(
            structure.biomolDict.NCS.partList[ 0 ].matrixList
        );
        var ncsUnitcellMatrixList = [];
        unitcellMatrixList.forEach( function( sm ){
            ncsMatrixList.forEach( function( nm ){
                ncsUnitcellMatrixList.push( sm.clone().multiply( nm ) );
            } );
        } );
        unitcellAssembly.addPart( ncsUnitcellMatrixList );
    }else{
        unitcellAssembly.addPart( unitcellMatrixList );
    }

    var vec = new Vector3();
    var supercellAssembly = new Assembly( "SUPERCELL" );
    var supercellMatrixList = Array.prototype.concat.call(
        getMatrixList(),                         // 555
        getMatrixList( vec.set(  1,  1,  1 ) ),  // 666
        getMatrixList( vec.set( -1, -1, -1 ) ),  // 444

        getMatrixList( vec.set(  1,  0,  0 ) ),  // 655
        getMatrixList( vec.set(  1,  1,  0 ) ),  // 665
        getMatrixList( vec.set(  1,  0,  1 ) ),  // 656
        getMatrixList( vec.set(  0,  1,  0 ) ),  // 565
        getMatrixList( vec.set(  0,  1,  1 ) ),  // 566
        getMatrixList( vec.set(  0,  0,  1 ) ),  // 556

        getMatrixList( vec.set( -1,  0,  0 ) ),  // 455
        getMatrixList( vec.set( -1, -1,  0 ) ),  // 445
        getMatrixList( vec.set( -1,  0, -1 ) ),  // 454
        getMatrixList( vec.set(  0, -1,  0 ) ),  // 545
        getMatrixList( vec.set(  0, -1, -1 ) ),  // 544
        getMatrixList( vec.set(  0,  0, -1 ) ),  // 554

        getMatrixList( vec.set(  1, -1, -1 ) ),  // 644
        getMatrixList( vec.set(  1,  1, -1 ) ),  // 664
        getMatrixList( vec.set(  1, -1,  1 ) ),  // 646
        getMatrixList( vec.set( -1,  1,  1 ) ),  // 466
        getMatrixList( vec.set( -1, -1,  1 ) ),  // 446
        getMatrixList( vec.set( -1,  1, -1 ) ),  // 464

        getMatrixList( vec.set(  0,  1, -1 ) ),  // 564
        getMatrixList( vec.set(  0, -1,  1 ) ),  // 546
        getMatrixList( vec.set(  1,  0, -1 ) ),  // 654
        getMatrixList( vec.set( -1,  0,  1 ) ),  // 456
        getMatrixList( vec.set(  1, -1,  0 ) ),  // 645
        getMatrixList( vec.set( -1,  1,  0 ) )   // 465
    );
    if( structure.biomolDict.NCS ){
        var ncsSupercellMatrixList = [];
        supercellMatrixList.forEach( function( sm ){
            ncsMatrixList.forEach( function( nm ){
                ncsSupercellMatrixList.push( sm.clone().multiply( nm ) );
            } );
        } );
        supercellAssembly.addPart( ncsSupercellMatrixList );
    }else{
        supercellAssembly.addPart( supercellMatrixList );
    }

    structure.biomolDict.UNITCELL = unitcellAssembly;
    structure.biomolDict.SUPERCELL = supercellAssembly;

    if( Debug ) Log.timeEnd( "buildUnitcellAssembly" );

}


var guessElement = function(){

    var elm1 = [ "H", "C", "O", "N", "S", "P" ];
    var elm2 = [ "NA", "CL" ];

    return function guessElement( atomName ){

        var at = atomName.trim().toUpperCase();
        if( parseInt( at.charAt( 0 ) ) ) at = at.substr( 1 );
        // parse again to check for a second integer
        if( parseInt( at.charAt( 0 ) ) ) at = at.substr( 1 );
        var n = at.length;

        if( n===0 ) return "";

        if( n===1 ) return at;

        if( n===2 ){

            if( elm2.indexOf( at )!==-1 ) return at;

            if( elm1.indexOf( at[0] )!==-1 ) return at[0];

        }

        if( n>=3 ){

            if( elm1.indexOf( at[0] )!==-1 ) return at[0];

        }

        return "";

    };

}();


/**
 * Assigns ResidueType bonds.
 * @param {Structure} structure - the structure object
 * @return {undefined}
 */
function assignResidueTypeBonds( structure ){

    // if( Debug ) Log.time( "assignResidueTypeBonds" );

    var bondHash = structure.bondHash;
    var countArray = bondHash.countArray;
    var offsetArray = bondHash.offsetArray;
    var indexArray = bondHash.indexArray;
    var bp = structure.getBondProxy();

    structure.eachResidue( function( rp ){

        var residueType = rp.residueType;
        if( residueType.bonds !== undefined ) return;

        var atomOffset = rp.atomOffset;
        var atomIndices1 = [];
        var atomIndices2 = [];
        var bondOrders = [];
        var bondDict = {};

        rp.eachAtom( function( ap ){

            var index = ap.index;
            var offset = offsetArray[ index ];
            var count = countArray[ index ];
            for( var i = 0, il = count; i < il; ++i ){
                bp.index = indexArray[ offset + i ];
                var idx1 = bp.atomIndex1;
                var idx2 = bp.atomIndex2;
                if( idx1 > idx2 ){
                    var tmp = idx2;
                    idx2 = idx1;
                    idx1 = tmp;
                }
                var hash = idx1 + "|" + idx2;
                if( bondDict[ hash ] === undefined ){
                    bondDict[ hash ] = true;
                    atomIndices1.push( idx1 - atomOffset );
                    atomIndices2.push( idx2 - atomOffset );
                    bondOrders.push( bp.bondOrder );
                }
            }

        } );

        residueType.bonds = {
            atomIndices1: atomIndices1,
            atomIndices2: atomIndices2,
            bondOrders: bondOrders
        };

    } );

    // if( Debug ) Log.timeEnd( "assignResidueTypeBonds" );

}


export {
	reorderAtoms,
	assignSecondaryStructure,
	calculateSecondaryStructure,
	calculateChainnames,
	calculateBonds,
	calculateResidueBonds,
	calculateBondsWithin,
	calculateBondsBetween,
	buildUnitcellAssembly,
    guessElement,
    assignResidueTypeBonds
};
