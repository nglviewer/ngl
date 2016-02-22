/**
 * @file Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.reorderAtoms = function( structure ){

    if( NGL.debug ) NGL.time( "NGL.reorderAtoms" );

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

    if( NGL.debug ) NGL.timeEnd( "NGL.reorderAtoms" );

};


NGL.StructureBuilder = function( structure ){

    var currentModelindex = null;
    var currentChainname = null;
    var currentResname = null;
    var currentResno = null;
    var currentHetero = null;

    var previousResname;
    var previousHetero

    var atomStore = structure.atomStore;
    var residueStore = structure.residueStore;
    var chainStore = structure.chainStore;
    var modelStore = structure.modelStore;

    var residueMap = structure.residueMap;

    var ai = -1;
    var ri = -1;
    var ci = -1;
    var mi = -1;

    function addResidueType( ri ){
        var count = residueStore.atomCount[ ri ];
        var offset = residueStore.atomOffset[ ri ];
        var atomTypeIdList = new Array( count );
        for( var i = 0; i < count; ++i ){
            atomTypeIdList[ i ] = atomStore.atomTypeId[ offset + i ];
        }
        residueStore.residueTypeId[ ri ] = residueMap.add(
            previousResname, atomTypeIdList, previousHetero
        );
    }

    this.addAtom = function( modelindex, chainname, resname, resno, hetero, sstruc ){

        var addModel = false;
        var addChain = false;
        var addResidue = false;

        if( currentModelindex !== modelindex ){
            addModel = true;
            addChain = true;
            addResidue = true;
            mi += 1;
            ci += 1;
            ri += 1;
        }else if( currentChainname !== chainname ){
            addChain = true;
            addResidue = true;
            ci += 1;
            ri += 1;
        }else if( currentResno !== resno || currentResname !== resname ){
            addResidue = true;
            ri += 1;
        }
        ai += 1;

        if( addModel ){
            modelStore.growIfFull();
            modelStore.chainOffset[ mi ] = ci;
            modelStore.chainCount[ mi ] = 0;
            modelStore.count += 1;
            chainStore.modelIndex[ ci ] = mi;
        }

        if( addChain ){
            chainStore.growIfFull();
            chainStore.setChainname( ci, chainname );
            chainStore.residueOffset[ ci ] = ri;
            chainStore.residueCount[ ci ] = 0;
            chainStore.count += 1;
            chainStore.modelIndex[ ci ] = mi;
            modelStore.chainCount[ mi ] += 1;
            residueStore.chainIndex[ ri ] = ci;
        }

        if( addResidue ){
            previousResname = currentResname;
            previousHetero = currentHetero;
            if( ri > 0 ) addResidueType( ri - 1 );
            residueStore.growIfFull();
            residueStore.resno[ ri ] = resno;
            if( sstruc !== undefined ){
                residueStore.sstruc[ ri ] = sstruc.charCodeAt( 0 );
            }
            residueStore.atomOffset[ ri ] = ai;
            residueStore.atomCount[ ri ] = 0;
            residueStore.count += 1;
            residueStore.chainIndex[ ri ] = ci;
            chainStore.residueCount[ ci ] += 1;
        }

        atomStore.count += 1;
        atomStore.residueIndex[ ai ] = ri;
        residueStore.atomCount[ ri ] += 1;

        currentModelindex = modelindex;
        currentChainname = chainname;
        currentResname = resname;
        currentResno = resno;
        currentHetero = hetero;

    };

    this.finalize = function(){
        previousResname = currentResname;
        previousHetero = currentHetero;
        addResidueType( ri );
    };

};


NGL.assignSecondaryStructure = function( structure ){

    if( NGL.debug ) NGL.time( "NGL.assignSecondaryStructure" );

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

    var helices = structure.helices || [];

    // helices.sort( function( h1, h2 ){

    //     var c1 = h1[ 0 ];
    //     var c2 = h2[ 0 ];
    //     var r1 = h1[ 1 ];
    //     var r2 = h2[ 1 ];

    //     if( c1 === c2 ){
    //         if( r1 === r2 ){
    //             return 0;
    //         }else{
    //             return r1 < r2 ? -1 : 1;
    //         }
    //     }else{
    //         var idx1 = NGL.binarySearchIndexOf( chainnamesSorted, c1 );
    //         var idx2 = NGL.binarySearchIndexOf( chainnamesSorted, c2 );
    //         return chainnamesIndex[ idx1 ] < chainnamesIndex[ idx2 ] ? -1 : 1;
    //     }

    // } );

    // var rp = structure.getResidueProxy();
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

                    // rp.index = j;

                    if( residueStore.resno[ j ] === helix[ 1 ] ){  // resnoBeg
                    // if( rp.resno === helix[ 1 ] ){  // resnoBeg
                        helixRun = true;
                    }

                    if( helixRun ){

                        residueStore.sstruc[ j ] = helix[ 4 ];
                        // rp.sstruc = helix[ 4 ];

                        if( residueStore.resno[ j ] === helix[ 3 ] ){  // resnoEnd
                        // if( rp.resno === helix[ 3 ] ){  // resnoEnd

                            helixRun = false
                            i += 1;

                            if( i < n ){
                                // must look at previous residues as
                                // residues may not be ordered by resno
                                // j = offset - 1;
                                --j;
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

    var sheets = structure.sheets || [];

    sheets.sort( function( s1, s2 ){

        var c1 = s1[ 0 ];
        var c2 = s2[ 0 ];

        if( c1 === c2 ) return 0;
        var idx1 = NGL.binarySearchIndexOf( chainnamesSorted, c1 );
        var idx2 = NGL.binarySearchIndexOf( chainnamesSorted, c2 );
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

                    // rp.index = j;

                    if( residueStore.resno[ j ] === sheet[ 1 ] ){  // resnoBeg
                    // if( rp.resno === sheet[ 1 ] ){  // resnoBeg
                        sheetRun = true;
                    }

                    if( sheetRun ){

                        residueStore.sstruc[ j ] = strandCharCode;
                        // rp.sstruc = "e";

                        if( residueStore.resno[ j ] === sheet[ 3 ] ){  // resnoEnd
                        // if( rp.resno === sheet[ 3 ] ){  // resnoEnd

                            sheetRun = false
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

    if( NGL.debug ) NGL.timeEnd( "NGL.assignSecondaryStructure" );

};


NGL.calculateSecondaryStructure = function(){

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
                // NGL.log( d )

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
    }

    var cgPolymer = function( p ){

        // FIXME helixbundle broken for polymers

        var localAngle = 20;
        var centerDist = 2.0;

        var helixbundle = new NGL.Helixbundle( p );

        var pos = helixbundle.position;
        var res = helixbundle.polymer.residues;

        var n = helixbundle.size;

        var c = new THREE.Vector3();
        var c2 = new THREE.Vector3();

        var i, d, r, r2;

        for( i = 0; i < n - 1; ++i ){

            r = res[ i ];
            r2 = res[ i + 1 ];
            c.fromArray( pos.center, i * 3 );
            c2.fromArray( pos.center, i * 3 + 3 );
            d = c.distanceTo( c2 );

            // NGL.log( r.ss, r2.ss, c.distanceTo( c2 ), pos.bending[ i ] )

            if( d < centerDist && d > 1.0 && pos.bending[ i ] < localAngle ){
                r.ss = "h";
                r2.ss = "h";
            }

        }

    }

    return function( structure ){

        if( NGL.debug ) NGL.time( "NGL.Structure.autoSS" );

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
            var prevSstruc = undefined;
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

        if( NGL.debug ) NGL.timeEnd( "NGL.Structure.autoSS" );

    }

}();


NGL.calculateChainnames = function( structure ){

    if( NGL.debug ) NGL.time( "NGL.calculateChainnames" );

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
            chainStore.residueOffset[ ci ] = rOffset;
            chainStore.residueCount[ ci ] = rCount;
            chainStore.count += 1;
            modelStore.chainCount[ mIndex ] += 1;
        }

        var ap1 = structure.getAtomProxy();
        var ap2 = structure.getAtomProxy();

        var i = 0;
        var mi = 0;
        var rStart = 0;
        var rEnd = 0;
        var chainData = [];

        structure.eachResidueN( 2, function( rp1, rp2 ){

            var newChain = false;

            var bbType1 = rp1.backboneType;
            var bbType2 = rp2.backboneType;
            var bbTypeUnk = NGL.UnknownBackboneType;

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

            if( rp2.index === residueStore.count - 1 ){
                newChain = true;
                rEnd = rp2.index;
            }

            if( newChain ){
                var j = i;
                var k = 0;
                var chainname = names[ j % n ];

                while( j >= n ){
                    j = Math.floor( j / n );
                    chainname += names[ j % n ];
                    k += 1;
                }

                chainData.push( {
                    mIndex: mi,
                    chainname: chainname,
                    rStart: rStart,
                    rCount: rEnd - rStart + 1
                } );

                i += 1;

                if( rp1.modelIndex !== rp2.modelIndex ){
                    i = 0;
                    mi += 1;
                }

                if( k >= 5 ){
                    NGL.warn( "out of chain names" );
                    i = 0;
                }

                rStart = rp2.index;
                rEnd = rp2.index;

            }

        } );

        //

        chainStore.count = 0;
        chainData.forEach( function( d ){
            addChain( d.mIndex, d.chainname, d.rStart, d.rCount );
        } );

        var chainOffset = 0;
        structure.eachModel( function( mp ){
            modelStore.chainOffset[ mp.index ] = chainOffset;
            chainOffset += modelStore.chainCount[ mp.index ];
        } );

    }

    if( NGL.debug ) NGL.timeEnd( "NGL.calculateChainnames" );

};


NGL.calculateBonds = function( structure ){

    if( NGL.debug ) NGL.time( "NGL.calculateBonds" );

    NGL.calculateBondsWithin( structure );
    NGL.calculateBondsBetween( structure );

    if( NGL.debug ) NGL.timeEnd( "NGL.calculateBonds" );

};


NGL.calculateResidueBonds = function( r ){

    // if( NGL.debug ) NGL.time( "NGL.calculateResidueBonds" );

    var structure = r.structure;
    var a1 = structure.getAtomProxy();
    var a2 = structure.getAtomProxy();

    var count = r.atomCount;
    var offset = r.atomOffset;
    var end = offset + count;
    var end1 = end - 1;

    if( count > 500 ){
        if( NGL.debug ) NGL.warn( "more than 500 atoms, skip residue for auto-bonding", r.qualifiedName() );
        return;
    }

    var atomIndices1 = [];
    var atomIndices2 = [];

    if( count > 50 ){

        var kdtree = new NGL.Kdtree( r, true );
        var radius = r.isCg() ? 1.2 : 2.3;

        for( var i = offset; i < end1; ++i ){
            a1.index = i;
            var maxd = a1.covalent + radius + 0.3;
            var nearestAtoms = kdtree.nearest(
                a1, Infinity, maxd * maxd
            );
            var m = nearestAtoms.length;
            for( var j = 0; j < m; ++j ){
                a2.index = nearestAtoms[ j ].index;
                if( a1.index < a2.index ){
                    if( a1.connectedTo( a2 ) ){
                        atomIndices1.push( a1.index - offset );
                        atomIndices2.push( a2.index - offset );
                    };
                }
            }
        }

    }else{

        for( var i = offset; i < end1; ++i ){
            a1.index = i;
            for( var j = i + 1; j <= end1; ++j ){
                a2.index = j;
                if( a1.connectedTo( a2 ) ){
                    atomIndices1.push( i - offset );
                    atomIndices2.push( j - offset );
                }
            }
        }

    }

    // if( NGL.debug ) NGL.timeEnd( "NGL.calculateResidueBonds" );

    return {
        atomIndices1: atomIndices1,
        atomIndices2: atomIndices2
    };

};


NGL.calculateBondsWithin = function( structure ){

    if( NGL.debug ) NGL.time( "NGL.calculateBondsWithin" );

    var bondStore = structure.bondStore;
    var a1 = structure.getAtomProxy();
    var a2 = structure.getAtomProxy();

    structure.eachResidue( function( r ){

        var count = r.atomCount;
        var offset = r.atomOffset;
        var end = offset + count;
        var end1 = end - 1;

        if( count > 500 ){
            NGL.warn( "more than 500 atoms, skip residue for auto-bonding", r.qualifiedName() );
            return;
        }

        var resname = r.resname;
        var equalAtomnames = false;

        var bonds = r.getBonds();

        var atomIndices1 = bonds.atomIndices1;
        var atomIndices2 = bonds.atomIndices2;
        var nn = atomIndices1.length;

        for( var i = 0; i < nn; ++i ){
            a1.index = atomIndices1[ i ] + offset;
            a2.index = atomIndices2[ i ] + offset;
            bondStore.addBond( a1, a2 );
        }

    } );

    if( NGL.debug ) NGL.timeEnd( "NGL.calculateBondsWithin" );

};


NGL.calculateBondsBetween = function( structure ){

    if( NGL.debug ) NGL.time( "NGL.calculateBondsBetween" );

    var bondStore = structure.bondStore;
    var backboneBondStore = structure.backboneBondStore;
    var backboneAtomSet = structure.getAtomSet( false );
    var ap1 = structure.getAtomProxy();
    var ap2 = structure.getAtomProxy();

    if( backboneBondStore.count === 0 ){
        backboneBondStore.resize( structure.residueStore.count );
    }

    structure.eachResidueN( 2, function( rp1, rp2 ){

        var bbType1 = rp1.backboneType;
        var bbType2 = rp2.backboneType;

        if( bbType1 !== NGL.UnknownBackboneType && bbType1 === bbType2 ){
            ap1.index = rp1.backboneEndAtomIndex;
            ap2.index = rp2.backboneStartAtomIndex;
            if( bondStore.addBondIfConnected( ap1, ap2 ) ){
                ap1.index = rp1.traceAtomIndex;
                ap2.index = rp2.traceAtomIndex;
                backboneBondStore.addBond( ap1, ap2 );
                backboneAtomSet.add_unsafe( ap1.index );
                backboneAtomSet.add_unsafe( ap2.index );
            }
        }

    } );

    structure.atomSetDict[ "backbone" ] = backboneAtomSet;

    if( NGL.debug ) NGL.timeEnd( "NGL.calculateBondsBetween" );

};


NGL.buildUnitcellAssembly = function( structure ){

    if( NGL.debug ) NGL.time( "NGL.buildUnitcellAssembly" );

    var uc = structure.unitcell;

    var centerFrac = structure.center.clone().applyMatrix4( uc.cartToFrac );
    var symopDict = NGL.getSymmetryOperations( uc.spacegroup );

    var positionFrac = new THREE.Vector3();
    var centerFracSymop = new THREE.Vector3();
    var positionFracSymop = new THREE.Vector3();

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

    var unitcellAssembly = new NGL.Assembly( "UNITCELL" );
    unitcellAssembly.addPart( getMatrixList() );

    var vec = new THREE.Vector3();
    var supercellAssembly = new NGL.Assembly( "SUPERCELL" );
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
    supercellAssembly.addPart( supercellMatrixList );

    structure.biomolDict[ "UNITCELL" ] = unitcellAssembly;
    structure.biomolDict[ "SUPERCELL" ] = supercellAssembly;

    if( NGL.debug ) NGL.timeEnd( "NGL.buildUnitcellAssembly" );

};


NGL.Assembly = function( name ){

    this.name = name || "";
    this.partList = []

};

NGL.Assembly.prototype = {

    constructor: NGL.Assembly,
    type: "Assembly",

    addPart: function( matrixList, chainList ){
        var part = new NGL.AssemblyPart( matrixList, chainList );
        this.partList.push( part );
        return part;
    },

    toJSON: function(){

        var output = {
            name: this.name,
            partList: new Array( this.partList.length )
        };

        this.partList.forEach( function( part, i ){
            output.partList[ i ] = part.toJSON()
        } );

        return output;

    },

    fromJSON: function( input ){

        this.name = input.name;
        this.partList = input.partList;

        this.partList.forEach( function( part, i ){
            this.partList[ i ] = new NGL.AssemblyPart().fromJSON( part );
        }.bind( this ) );

        return this;

    }

};


NGL.AssemblyPart = function( matrixList, chainList ){

    this.matrixList = matrixList || [];
    this.chainList = chainList || [];

};

NGL.AssemblyPart.prototype = {

    constructor: NGL.AssemblyPart,
    type: "AssemblyPart",

    getSelection: function(){
        if( this.chainList.length > 0 ){
            var sele = ":" + this.chainList.join( " OR :" );
            return new NGL.Selection( sele );
        }else{
            return new NGL.Selection( "" );
            // return null;
        }
    },

    getView: function( structure ){
        var selection = this.getSelection();
        if( selection ){
            return structure.getView( selection );
        }else{
            return structure;
        }
    },

    getInstanceList: function(){
        var instanceList = [];
        for ( var j = 0, jl = this.matrixList.length; j < jl; ++j ){
            instanceList.push( {
                id: j + 1,
                name: j,
                // assembly: name,
                matrix: this.matrixList[ j ]
            } );
        }
        return instanceList;
    },

    toJSON: function(){

        var output = {
            matrixList: this.matrixList,
            chainList: this.chainList
        };

        return output;

    },

    fromJSON: function( input ){

        this.matrixList = input.matrixList;
        this.chainList = input.chainList;

        return this;

    }

};


///////////
// Parser

NGL.WorkerRegistry.add( "parse", function( e, callback ){

    if( NGL.debug ) NGL.time( "WORKER parse" );

    var parser = NGL.fromJSON( e.data );

    parser.parse( function(){

        if( NGL.debug ) NGL.timeEnd( "WORKER parse" );

        // no need to return the streamer data
        parser.streamer.dispose();

        callback( parser.toJSON(), parser.getTransferable() );

    } );

} );


NGL.Parser = function( streamer, params ){

    var p = params || {};

    this.streamer = streamer;

    this.name = p.name;
    this.path = p.path;

};

NGL.Parser.prototype = {

    constructor: NGL.Parser,
    type: "",

    __objName: "",

    parse: function( callback ){

        var self = this;

        this.streamer.read( function(){
            self._beforeParse();
            self._parse( function(){
                self._afterParse();
                callback( self[ self.__objName ] );
            } );
        } );

        return this[ this.__objName ];

    },

    parseWorker: function( callback ){

        if( NGL.useWorker && typeof Worker !== "undefined" &&
            typeof importScripts !== 'function'
        ){

            var worker = new NGL.Worker( "parse" ).post(

                this.toJSON(),

                this.getTransferable(),

                function( e ){

                    worker.terminate();

                    this.fromJSON( e.data );
                    this._afterWorker( callback );

                }.bind( this ),

                function( e ){

                    console.warn(
                        "NGL.Parser.parseWorker error - trying without worker", e
                    );
                    worker.terminate();

                    this.parse( callback );

                }.bind( this )

            );

        }else{

            this.parse( callback );

        }

        return this[ this.__objName ];

    },

    _parse: function( callback ){

        NGL.warn( "NGL.Parser._parse not implemented" );
        callback();

    },

    _beforeParse: function(){},

    _afterParse: function(){

        if( NGL.debug ) NGL.log( this[ this.__objName ] );

    },

    _afterWorker: function( callback ){

        if( NGL.debug ) NGL.log( this[ this.__objName ] );
        callback( this[ this.__objName ] );

    },

    toJSON: function(){

        var type = this.type.substr( 0, 1 ).toUpperCase() +
                    this.type.substr( 1 );

        var output = {

            metadata: {
                version: 0.1,
                type: type + 'Parser',
                generator: type + 'ParserExporter'
            },

            streamer: this.streamer.toJSON(),
            name: this.name,
            path: this.path,

        }

        if( typeof this[ this.__objName ].toJSON === "function" ){

            output[ this.__objName ] = this[ this.__objName ].toJSON();

        }else{

            output[ this.__objName ] = this[ this.__objName ];

        }

        return output;

    },

    fromJSON: function( input ){

        this.streamer = NGL.fromJSON( input.streamer );
        this.name = input.name;
        this.path = input.path;

        if( typeof this[ this.__objName ].toJSON === "function" ){

            this[ this.__objName ].fromJSON( input[ this.__objName ] );

        }else{

            this[ this.__objName ] = input[ this.__objName ];

        }

        return this;

    },

    getTransferable: function(){

        var transferable = [];

        transferable = transferable.concat(
            this.streamer.getTransferable()
        );

        if( typeof this[ this.__objName ].toJSON === "function" ){

            transferable = transferable.concat(
                this[ this.__objName ].getTransferable()
            );

        }

        return transferable;

    }

};


////////////////////
// StructureParser

NGL.StructureParser = function( streamer, params ){

    var p = params || {};

    this.firstModelOnly = p.firstModelOnly || false;
    this.asTrajectory = p.asTrajectory || false;
    this.cAlphaOnly = p.cAlphaOnly || false;
    this.reorderAtoms = p.reorderAtoms || false;
    this.dontAutoBond = p.dontAutoBond || false;
    this.doAutoSS = true;

    NGL.Parser.call( this, streamer, p );

    this.structure = new NGL.Structure( this.name, this.path );
    this.structureBuilder = new NGL.StructureBuilder( this.structure );

};

NGL.StructureParser.prototype = NGL.createObject(

    NGL.Parser.prototype, {

    constructor: NGL.StructureParser,
    type: "structure",

    __objName: "structure",

    _afterParse: function(){

        if( NGL.debug ) NGL.time( "NGL.StructureParser._afterParse" );

        var s = this.structure;
        s.refresh();

        if( this.reorderAtoms ){
            NGL.reorderAtoms( s );
        }

        // check for chain names
        NGL.calculateChainnames( s );

        if( !this.dontAutoBond ){
            NGL.calculateBonds( s );
        }else if( this.autoBondBetween ){
            NGL.calculateBondsBetween( s );
        }

        // TODO
        // check for secondary structure
        if( this.doAutoSS && s.helices.length === 0 && s.sheets.length === 0 ){
            NGL.calculateSecondaryStructure( s );
        }

        if( s.helices.length > 0 || s.sheets.length > 0 ){
            NGL.assignSecondaryStructure( s );
        }

        this._postProcess();

        if( s.unitcell === undefined ){
            var bbSize = s.boundingBox.size();
            s.unitcell = new NGL.Unitcell(
                bbSize.x, bbSize.y, bbSize.z,
                90, 90, 90, "P 1"
            );
        }

        NGL.buildUnitcellAssembly( s );

        if( NGL.debug ) NGL.timeEnd( "NGL.StructureParser._afterParse" );
        if( NGL.debug ) NGL.log( this[ this.__objName ] );

    },

    _postProcess: function(){},

    toJSON: function(){

        var output = NGL.Parser.prototype.toJSON.call( this );

        output.firstModelOnly = this.firstModelOnly;
        output.asTrajectory = this.asTrajectory;
        output.cAlphaOnly = this.cAlphaOnly;
        output.reorderAtoms = this.reorderAtoms;
        output.dontAutoBond = this.dontAutoBond;
        output.doAutoSS = this.doAutoSS;

        return output;

    },

    fromJSON: function( input ){

        NGL.Parser.prototype.fromJSON.call( this, input );

        this.firstModelOnly = input.firstModelOnly;
        this.asTrajectory = input.asTrajectory;
        this.cAlphaOnly = input.cAlphaOnly;
        this.reorderAtoms = input.reorderAtoms;
        this.dontAutoBond = input.dontAutoBond;
        this.doAutoSS = input.doAutoSS;

        return this;

    },

} );


NGL.PdbParser = function( streamer, params ){

    NGL.StructureParser.call( this, streamer, params );

};

NGL.PdbParser.prototype = NGL.createObject(

    NGL.StructureParser.prototype, {

    constructor: NGL.PdbParser,
    type: "pdb",

    _parse: function( callback ){

        // http://www.wwpdb.org/documentation/file-format.php

        if( NGL.debug ) NGL.time( "NGL.PdbParser._parse " + this.name );

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

        var helixTypes = NGL.HelixTypes;

        var line, recordName;
        var serial, chainname, resno, resname,
            atomname, element, hetero, bfactor, altloc;

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

            for( var i = _i; i < _n; ++i ){

                line = lines[ i ];
                recordName = line.substr( 0, 6 );

                if( recordName === 'ATOM  ' || recordName === 'HETATM' ){

                    // http://www.wwpdb.org/documentation/file-format-content/format33/sect9.html#ATOM

                    if( pendingStart ){

                        if( asTrajectory ){

                            if( doFrames ){
                                currentFrame = new Float32Array( atoms.length * 3 );
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

                    if( isPqr ){

                        var ls = line.split( reWhitespace );
                        var dd = ls.length === 10 ? 1 : 0;

                        atomname = ls[ 2 ];
                        if( cAlphaOnly && atomname !== 'CA' ) continue;

                        var x = parseFloat( ls[ 6 - dd ] );
                        var y = parseFloat( ls[ 7 - dd ] );
                        var z = parseFloat( ls[ 8 - dd ] );

                    }else{

                        atomname = line.substr( 12, 4 ).trim();
                        if( cAlphaOnly && atomname !== 'CA' ) continue;

                        var x = parseFloat( line.substr( 30, 8 ) );
                        var y = parseFloat( line.substr( 38, 8 ) );
                        var z = parseFloat( line.substr( 46, 8 ) );

                    }

                    if( asTrajectory ){

                        var j = currentCoord * 3;

                        currentFrame[ j + 0 ] = x;
                        currentFrame[ j + 1 ] = y;
                        currentFrame[ j + 2 ] = z;

                        currentCoord += 1;

                        if( doFrames ) continue;

                    }

                    var element;

                    if( isPqr ){

                        serial = parseInt( ls[ 1 ] );
                        hetero = ( line[ 0 ] === 'H' ) ? 1 : 0;
                        chainname = dd ? "" : ls[ 4 ];
                        resno = parseInt( ls[ 5 - dd ] );
                        resname = ls[ 3 ];
                        bfactor = parseFloat( ls[ 9 - dd ] );  // charge FIXME should be its own field
                        altloc = "";

                    }else{

                        serial = parseInt( line.substr( 6, 5 ) );
                        element = line.substr( 76, 2 ).trim();
                        hetero = ( line[ 0 ] === 'H' ) ? 1 : 0;
                        chainname = line[ 21 ].trim();
                        resno = parseInt( line.substr( 22, 4 ) );
                        // icode = line[ 26 ];  // FIXME currently not supported
                        resname = line.substr( 17, 4 ).trim();
                        bfactor = parseFloat( line.substr( 60, 8 ) );
                        altloc = line[ 16 ].trim();

                    }

                    atomStore.growIfFull();
                    atomStore.atomTypeId[ idx ] = atomMap.add( atomname, element );

                    atomStore.x[ idx ] = x;
                    atomStore.y[ idx ] = y;
                    atomStore.z[ idx ] = z;
                    atomStore.serial[ idx ] = serial;
                    atomStore.bfactor[ idx ] = bfactor;
                    atomStore.altloc[ idx ] = altloc.charCodeAt( 0 );

                    sb.addAtom( modelIdx, chainname, resname, resno, hetero );

                    serialDict[ serial ] = idx;

                    idx += 1;

                }else if( recordName === 'CONECT' ){

                    var from = serialDict[ parseInt( line.substr( 6, 5 ) ) ];
                    var pos = [ 11, 16, 21, 26 ];

                    if( from === undefined ){
                        // NGL.log( "missing CONNECT serial" );
                        continue;
                    }

                    for( var j = 0; j < 4; ++j ){

                        var to = parseInt( line.substr( pos[ j ], 5 ) );
                        if( Number.isNaN( to ) ) continue;
                        to = serialDict[ to ];
                        if( to === undefined ){
                            // NGL.log( "missing CONNECT serial" );
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

                    var startChain = line[ 19 ].trim();
                    var startResi = parseInt( line.substr( 21, 4 ) );
                    var endChain = line[ 31 ].trim();
                    var endResi = parseInt( line.substr( 33, 4 ) );
                    var helixType = parseInt( line.substr( 39, 1 ) );
                    helixType = ( helixTypes[ helixType ] || helixTypes[""] ).charCodeAt( 0 );
                    helices.push([ startChain, startResi, endChain, endResi, helixType ]);

                }else if( recordName === 'SHEET ' ){

                    var startChain = line[ 21 ].trim();
                    var startResi = parseInt( line.substr( 22, 4 ) );
                    var endChain = line[ 32 ].trim();
                    var endResi = parseInt( line.substr( 33, 4 ) );
                    sheets.push([ startChain, startResi, endChain, endResi ]);

                }else if( recordName === 'REMARK' && line.substr( 7, 3 ) === '350' ){

                    if( line.substr( 11, 12 ) === "BIOMOLECULE:" ){

                        var name = line.substr( 23 ).trim();
                        if( /^(0|[1-9][0-9]*)$/.test( name ) ) name = "BU" + name;

                        currentBiomol = new NGL.Assembly( name );
                        biomolDict[ name ] = currentBiomol;

                    }else if( line.substr( 13, 5 ) === "BIOMT" ){

                        var ls = line.split( /\s+/ );

                        var row = parseInt( line[ 18 ] ) - 1;
                        var mat = ls[ 3 ].trim();

                        if( row === 0 ){
                            currentMatrix = new THREE.Matrix4();
                            currentPart.matrixList.push( currentMatrix );
                        }

                        var elms = currentMatrix.elements;

                        elms[ 4 * 0 + row ] = parseFloat( ls[ 4 ] );
                        elms[ 4 * 1 + row ] = parseFloat( ls[ 5 ] );
                        elms[ 4 * 2 + row ] = parseFloat( ls[ 6 ] );
                        elms[ 4 * 3 + row ] = parseFloat( ls[ 7 ] );

                    }else if(
                        line.substr( 11, 30 ) === 'APPLY THE FOLLOWING TO CHAINS:' ||
                        line.substr( 11, 30 ) === '                   AND CHAINS:'
                    ){

                        if( line.substr( 11, 5 ) === 'APPLY' ){
                            currentPart = currentBiomol.addPart();
                        }

                        line.substr( 41, 30 ).split( "," ).forEach( function( v ){
                            var c = v.trim();
                            if( c ) currentPart.chainList.push( c );
                        } );

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

                    var ls = line.split( /\s+/ );
                    var mat = ls[ 1 ].trim();

                    if( line[ 5 ] === "1" && mat === "1" ){

                        biomolDict[ "NCS" ] = {
                            matrixDict: {},
                            chainList: undefined
                        };
                        currentBiomol = biomolDict[ "NCS" ];

                    }

                    var row = parseInt( line[ 5 ] ) - 1;

                    if( row === 0 ){
                        currentBiomol.matrixDict[ mat ] = new THREE.Matrix4();
                    }

                    var elms = currentBiomol.matrixDict[ mat ].elements;

                    elms[ 4 * 0 + row ] = parseFloat( ls[ 2 ] );
                    elms[ 4 * 1 + row ] = parseFloat( ls[ 3 ] );
                    elms[ 4 * 2 + row ] = parseFloat( ls[ 4 ] );
                    elms[ 4 * 3 + row ] = parseFloat( ls[ 5 ] );

                }else if( line.substr( 0, 5 ) === 'ORIGX' ){

                    if( !unitcellDict.origx ){
                        unitcellDict.origx = new THREE.Matrix4();
                    }

                    var ls = line.split( /\s+/ );
                    var row = parseInt( line[ 5 ] ) - 1;
                    var elms = unitcellDict.origx.elements;

                    elms[ 4 * 0 + row ] = parseFloat( ls[ 1 ] );
                    elms[ 4 * 1 + row ] = parseFloat( ls[ 2 ] );
                    elms[ 4 * 2 + row ] = parseFloat( ls[ 3 ] );
                    elms[ 4 * 3 + row ] = parseFloat( ls[ 4 ] );

                }else if( line.substr( 0, 5 ) === 'SCALE' ){

                    if( !unitcellDict.scale ){
                        unitcellDict.scale = new THREE.Matrix4();
                    }

                    var ls = line.split( /\s+/ );
                    var row = parseInt( line[ 5 ] ) - 1;
                    var elms = unitcellDict.scale.elements;

                    elms[ 4 * 0 + row ] = parseFloat( ls[ 1 ] );
                    elms[ 4 * 1 + row ] = parseFloat( ls[ 2 ] );
                    elms[ 4 * 2 + row ] = parseFloat( ls[ 3 ] );
                    elms[ 4 * 3 + row ] = parseFloat( ls[ 4 ] );

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

                    var a = parseFloat( line.substr( 6, 9 ) );
                    var b = parseFloat( line.substr( 15, 9 ) );
                    var c = parseFloat( line.substr( 24, 9 ) );

                    var alpha = parseFloat( line.substr( 33, 7 ) );
                    var beta = parseFloat( line.substr( 40, 7 ) );
                    var gamma = parseFloat( line.substr( 47, 7 ) );

                    var sGroup = line.substr( 55, 11 ).trim();
                    var z = parseInt( line.substr( 66, 4 ) );

                    var box = new Float32Array( 9 );
                    box[ 0 ] = a;
                    box[ 4 ] = b;
                    box[ 8 ] = c;
                    boxes.push( box );

                    if( modelIdx === 0 ){
                        unitcellDict.a = a;
                        unitcellDict.b = b;
                        unitcellDict.c = c;
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
            s.unitcell = new NGL.Unitcell(
                unitcellDict.a, unitcellDict.b, unitcellDict.c,
                unitcellDict.alpha, unitcellDict.beta, unitcellDict.gamma,
                unitcellDict.spacegroup, unitcellDict.scale
            );
        }else{
            s.unitcell = undefined;  // triggers use of bounding box
        }

        if( NGL.debug ) NGL.timeEnd( "NGL.PdbParser._parse " + this.name );
        callback();

    }

} );


NGL.PqrParser = function( streamer, params ){

    NGL.StructureParser.call( this, streamer, params );

};

NGL.PqrParser.prototype = NGL.createObject(

    NGL.PdbParser.prototype, {

    constructor: NGL.PqrParser,
    type: "pqr",

} );


NGL.GroParser = function( streamer, params ){

    NGL.StructureParser.call( this, streamer, params );

    this.structure._doAutoSS = true;
    this.structure._doAutoChainName = true;

};

NGL.GroParser.prototype = NGL.createObject(

    NGL.StructureParser.prototype, {

    constructor: NGL.GroParser,
    type: "gro",

    _parse: function( callback ){

        // http://manual.gromacs.org/current/online/gro.html

        if( NGL.debug ) NGL.time( "NGL.GroParser._parse " + this.name );

        var s = this.structure;
        var sb = this.structureBuilder;

        var firstModelOnly = this.firstModelOnly;
        var asTrajectory = this.asTrajectory;
        var cAlphaOnly = this.cAlphaOnly;

        var frames = s.frames;
        var boxes = s.boxes;
        var doFrames = false;
        var currentFrame, currentCoord;

        var firstLines = this.streamer.peekLines( 3 );

        s.title = firstLines[ 0 ].trim();

        // determine number of decimal places
        var ndec = firstLines[ 2 ].length - firstLines[ 2 ].lastIndexOf( "." ) - 1;
        var lpos = 5 + ndec;
        var xpos = 20;
        var ypos = 20 + lpos;
        var zpos = 20 + 2 * lpos;

        //

        var atomname, resname, element, resno, serial;

        var atomCount = parseInt( firstLines[ 1 ] );
        var modelLineCount = atomCount + 3;

        var atomMap = s.atomMap;
        var atomStore = s.atomStore;
        atomStore.resize( atomCount );

        var idx = 0;
        var modelIdx = 0;
        var lineNo = 0;

        function _parseChunkOfLines( _i, _n, lines ){

            for( var i = _i; i < _n; ++i ){

                ++lineNo;
                var l = lineNo - 1;

                var line = lines[ i ];

                if( !line ) continue;

                if( l % modelLineCount === 0 ){

                    // NGL.log( "title", line )

                    if( asTrajectory ){

                        currentFrame = new Float32Array( atomCount * 3 );
                        frames.push( currentFrame );
                        currentCoord = 0;

                    }

                }else if( l % modelLineCount === 1 ){

                    // NGL.log( "atomCount", line )

                }else if( l % modelLineCount === modelLineCount - 1 ){

                    var str = line.trim().split( /\s+/ );
                    var box = new Float32Array( 9 );
                    box[ 0 ] = parseFloat( str[ 0 ] ) * 10;
                    box[ 4 ] = parseFloat( str[ 1 ] ) * 10;
                    box[ 8 ] = parseFloat( str[ 2 ] ) * 10;
                    boxes.push( box );

                    if( firstModelOnly ){

                        return true;

                    }

                    modelIdx += 1;

                }else{

                    atomname = line.substr( 10, 5 ).trim();
                    if( cAlphaOnly && atomname !== 'CA' ) continue;

                    var x = parseFloat( line.substr( xpos, lpos ) ) * 10;
                    var y = parseFloat( line.substr( ypos, lpos ) ) * 10;
                    var z = parseFloat( line.substr( zpos, lpos ) ) * 10;

                    if( asTrajectory ){

                        var j = currentCoord * 3;

                        currentFrame[ j + 0 ] = x;
                        currentFrame[ j + 1 ] = y;
                        currentFrame[ j + 2 ] = z;

                        currentCoord += 1;

                        if( l > modelLineCount ) continue;

                    }

                    resname = line.substr( 5, 5 ).trim();
                    resno = parseInt( line.substr( 0, 5 ) );
                    serial = parseInt( line.substr( 15, 5 ) );

                    atomStore.growIfFull();
                    atomStore.atomTypeId[ idx ] = atomMap.add( atomname );

                    atomStore.x[ idx ] = x;
                    atomStore.y[ idx ] = y;
                    atomStore.z[ idx ] = z;
                    atomStore.serial[ idx ] = serial;

                    sb.addAtom( modelIdx, "", resname, resno, 0, "l" );

                    idx += 1;

                }

            }

        }

        this.streamer.eachChunkOfLines( function( lines, chunkNo, chunkCount ){
            _parseChunkOfLines( 0, lines.length, lines );
        } );

        sb.finalize();

        s.unitcell = new NGL.Unitcell(
            boxes[ 0 ][ 0 ], boxes[ 0 ][ 4 ], boxes[ 0 ][ 8 ],
            90, 90, 90, "P 1"
        );

        if( NGL.debug ) NGL.timeEnd( "NGL.GroParser._parse " + this.name );
        callback();

    }

} );


NGL.CifParser = function( streamer, params ){

    NGL.StructureParser.call( this, streamer, params );

};

NGL.CifParser.prototype = NGL.createObject(

    NGL.StructureParser.prototype, {

    constructor: NGL.CifParser,
    type: "cif",


    _parse: function( callback ){

        // http://mmcif.wwpdb.org/

        NGL.time( "NGL.CifParser._parse " + this.name );

        var s = this.structure;
        var sb = this.structureBuilder;

        var firstModelOnly = this.firstModelOnly;
        var asTrajectory = this.asTrajectory;
        var cAlphaOnly = this.cAlphaOnly;

        var frames = s.frames;
        var boxes = s.boxes;
        var doFrames = false;
        var currentFrame, currentCoord;

        var title = s.title;
        var atoms = s.atoms;
        var bondSet = s.bondSet;

        var helixTypes = NGL.HelixTypes;

        var line, recordName;
        var altloc, serial, elem, chainname, resno, resname, atomname, element;

        s.hasConnect = false;

        //

        var reWhitespace = /\s+/;
        var reQuotedWhitespace = /'(.*?)'|"(.*?)"|(\S+)/g;
        var reDoubleQuote = /"/g;

        var cif = {};
        this.cif = cif;

        var pendingString = false;
        var currentString = null;
        var pendingValue = false;
        var pendingLoop = false;
        var loopPointers = [];
        var currentLoopIndex = null;
        var currentCategory = null;
        var currentName = null;
        var first = null;
        var pointerNames = [];

        var auth_asym_id, auth_seq_id,
            label_atom_id, label_comp_id, label_asym_id, label_alt_id,
            group_PDB, id, type_symbol, pdbx_PDB_model_num,
            Cartn_x, Cartn_y, Cartn_z, B_iso_or_equiv;

        var asymIdDict = {};
        this.asymIdDict = asymIdDict;

        //

        var atomMap = s.atomMap;
        var atomStore = s.atomStore;
        atomStore.resize( this.streamer.data.length / 100 );

        var idx = 0;
        var modelIdx = 0;
        var modelNum;

        function _parseChunkOfLines( _i, _n, lines ){

            for( var i = _i; i < _n; ++i ){

                line = lines[i].trim();

                if( ( !line && !pendingString ) || line[0]==="#" ){

                    // NGL.log( "NEW BLOCK" );

                    pendingString = false;
                    pendingLoop = false;
                    pendingValue = false;
                    loopPointers.length = 0;
                    currentLoopIndex = null;
                    currentCategory = null;
                    currentName = null;
                    first = null;
                    pointerNames.length = 0;

                }else if( line.substring( 0, 5 )==="data_" ){

                    var data = line.substring( 5 );

                    // NGL.log( "DATA", data );

                }else if( line[0]===";" ){

                    if( pendingString ){

                        // NGL.log( "STRING END", currentString );

                        if( pendingLoop ){

                            if( currentLoopIndex === loopPointers.length ){
                                currentLoopIndex = 0;
                            }
                            loopPointers[ currentLoopIndex ].push( currentString );
                            currentLoopIndex += 1;

                        }else{

                            cif[ currentCategory ][ currentName ] = currentString;

                        }

                        pendingString = false;
                        currentString = null;

                    }else{

                        // NGL.log( "STRING START" );

                        pendingString = true;
                        currentString = line.substring( 1 );

                    }

                }else if( line==="loop_" ){

                    // NGL.log( "LOOP START" );

                    pendingLoop = true;
                    loopPointers.length = 0;
                    pointerNames.length = 0;
                    currentLoopIndex = 0;

                }else if( line[0]==="_" ){

                    if( pendingLoop ){

                        // NGL.log( "LOOP KEY", line );

                        var ks = line.split(".");
                        var category = ks[ 0 ].substring( 1 );
                        var name = ks[ 1 ];

                        if( ks.length === 1 ){

                            name = false;
                            if( !cif[ category ] ) cif[ category ] = [];
                            loopPointers.push( cif[ category ] );

                        }else{

                            if( !cif[ category ] ) cif[ category ] = {};
                            if( cif[ category ][ name ] ){
                                NGL.warn( category, name, "already exists" );
                            }else{
                                cif[ category ][ name ] = [];
                                loopPointers.push( cif[ category ][ name ] );
                                pointerNames.push( name );
                            }

                        }

                        currentCategory = category;
                        currentName = name;
                        first = true;

                    }else{

                        var ls = line.match( reQuotedWhitespace );
                        var key = ls[ 0 ];
                        var value = ls[ 1 ];
                        var ks = key.split(".");
                        var category = ks[ 0 ].substring( 1 );
                        var name = ks[ 1 ];

                        if( ks.length === 1 ){

                            name = false;
                            if( !cif[ category ] ) cif[ category ] = [];
                            cif[ category ] = value

                        }else{

                            if( !cif[ category ] ) cif[ category ] = {};

                            if( cif[ category ][ name ] ){
                                NGL.warn( category, name, "already exists" );
                            }else{
                                cif[ category ][ name ] = value;
                            }

                        }

                        if( !value ) pendingValue = true;

                        currentCategory = category;
                        currentName = name;

                    }

                }else{

                    if( pendingString ){

                        // NGL.log( "STRING VALUE", line );

                        currentString += " " + line;

                    }else if( pendingLoop ){

                        // NGL.log( "LOOP VALUE", line );

                        if( currentCategory==="atom_site" ){

                            var nn = pointerNames.length;

                            var ls = line.split( reWhitespace );
                            var k;

                            if( first ){

                                var names = [
                                    "auth_asym_id", "auth_seq_id",
                                    "label_atom_id", "label_comp_id", "label_asym_id", "label_alt_id",
                                    "group_PDB", "id", "type_symbol", "pdbx_PDB_model_num",
                                    "Cartn_x", "Cartn_y", "Cartn_z", "B_iso_or_equiv"
                                ];

                                auth_asym_id = pointerNames.indexOf( "auth_asym_id" );
                                auth_seq_id = pointerNames.indexOf( "auth_seq_id" );
                                label_atom_id = pointerNames.indexOf( "label_atom_id" );
                                label_comp_id = pointerNames.indexOf( "label_comp_id" );
                                label_asym_id = pointerNames.indexOf( "label_asym_id" );
                                label_alt_id = pointerNames.indexOf( "label_alt_id" );
                                Cartn_x = pointerNames.indexOf( "Cartn_x" );
                                Cartn_y = pointerNames.indexOf( "Cartn_y" );
                                Cartn_z = pointerNames.indexOf( "Cartn_z" );
                                id = pointerNames.indexOf( "id" );
                                type_symbol = pointerNames.indexOf( "type_symbol" );
                                group_PDB = pointerNames.indexOf( "group_PDB" );
                                B_iso_or_equiv = pointerNames.indexOf( "B_iso_or_equiv" );
                                pdbx_PDB_model_num = pointerNames.indexOf( "pdbx_PDB_model_num" );

                                first = false;

                                modelNum = parseInt( ls[ pdbx_PDB_model_num ] );

                                if( asTrajectory ){
                                    currentFrame = [];
                                    currentCoord = 0;
                                }

                            }

                            //

                            var _modelNum = parseInt( ls[ pdbx_PDB_model_num ] );

                            if( modelNum !== _modelNum ){

                                if( asTrajectory ){

                                    if( modelIdx === 0 ){
                                        frames.push( new Float32Array( currentFrame ) );
                                    }

                                    currentFrame = new Float32Array( atoms.length * 3 );
                                    frames.push( currentFrame );
                                    currentCoord = 0;

                                }

                                modelIdx += 1;

                            }

                            modelNum = _modelNum;

                            if( firstModelOnly && modelIdx > 0 ) continue;

                            //

                            var atomname = ls[ label_atom_id ].replace( reDoubleQuote, '' );
                            if( cAlphaOnly && atomname !== 'CA' ) continue;

                            var x = parseFloat( ls[ Cartn_x ] );
                            var y = parseFloat( ls[ Cartn_y ] );
                            var z = parseFloat( ls[ Cartn_z ] );

                            if( asTrajectory ){

                                var j = currentCoord * 3;

                                currentFrame[ j + 0 ] = x;
                                currentFrame[ j + 1 ] = y;
                                currentFrame[ j + 2 ] = z;

                                currentCoord += 1;

                                if( modelIdx > 0 ) continue;

                            }

                            //

                            var resname = ls[ label_comp_id ];
                            var resno = parseInt( ls[ auth_seq_id ] );
                            var chainname = ls[ auth_asym_id ];
                            var hetero = ( ls[ group_PDB ][ 0 ] === 'H' ) ? 1 : 0;

                            //

                            var element = ls[ type_symbol ];
                            var altloc = ls[ label_alt_id ];
                            altloc = ( altloc === '.' ) ? '' : altloc;

                            atomStore.growIfFull();
                            atomStore.atomTypeId[ idx ] = atomMap.add( atomname, element );

                            atomStore.x[ idx ] = x;
                            atomStore.y[ idx ] = y;
                            atomStore.z[ idx ] = z;
                            atomStore.serial[ idx ] = parseInt( ls[ id ] );
                            atomStore.bfactor[ idx ] = parseFloat( ls[ B_iso_or_equiv ] );
                            atomStore.altloc[ idx ] = altloc.charCodeAt( 0 );

                            sb.addAtom( modelIdx, chainname, resname, resno, hetero );

                            // chainname mapping: label_asym_id -> auth_asym_id
                            asymIdDict[ ls[ label_asym_id ] ] = chainname;

                            idx += 1;

                        }else{

                            var ls = line.match( reQuotedWhitespace );
                            var nn = ls.length;

                            if( currentLoopIndex === loopPointers.length ){
                                currentLoopIndex = 0;
                            }/*else if( currentLoopIndex > loopPointers.length ){
                                NGL.warn( "cif parsing error, wrong number of loop data entries", nn, loopPointers.length );
                            }*/

                            for( var j = 0; j < nn; ++j ){
                                loopPointers[ currentLoopIndex + j ].push( ls[ j ] );
                            }

                            currentLoopIndex += nn;

                        }

                    }else if( line[0]==="'" && line.substring( line.length-1 )==="'" ){

                        // NGL.log( "NEWLINE STRING", line );

                        var str = line.substring( 1, line.length - 2 );

                        if( currentName === false ){
                            cif[ currentCategory ] = str;
                        }else{
                            cif[ currentCategory ][ currentName ] = str;
                        }

                    }else if( pendingValue ){

                        // NGL.log( "NEWLINE VALUE", line );

                        if( currentName === false ){
                            cif[ currentCategory ] = line.trim();
                        }else{
                            cif[ currentCategory ][ currentName ] = line.trim();
                        }

                    }else{

                        if( NGL.debug ) NGL.log( "NGL.CifParser._parse: unknown state", line );

                    }

                }


            }

        }

        function postProcess(){

            function _ensureArray( dict, field ){

                if( !Array.isArray( dict[ field ] ) ){
                    Object.keys( dict ).forEach( function( key ){
                        dict[ key ] = [ dict[ key ] ];
                    } );
                }

            }

            // get helices
            var sc = cif.struct_conf;

            if( sc ){

                var helices = s.helices;
                var helixTypes = NGL.HelixTypes;

                // ensure data is in lists
                _ensureArray( sc, "id" );

                for( var i = 0, il = sc.beg_auth_seq_id.length; i < il; ++i ){
                    var helixType = parseInt( sc.pdbx_PDB_helix_class[ i ] );
                    if( !Number.isNaN( helixType ) ){
                        helices.push( [
                            asymIdDict[ sc.beg_label_asym_id[ i ] ],
                            parseInt( sc.beg_auth_seq_id[ i ] ),
                            asymIdDict[ sc.end_label_asym_id[ i ] ],
                            parseInt( sc.end_auth_seq_id[ i ] ),
                            ( helixTypes[ helixType ] || helixTypes[""] ).charCodeAt( 0 )
                        ] );
                    }
                }

            }

            // get sheets
            var ssr = cif.struct_sheet_range;

            if( ssr ){

                var sheets = s.sheets;

                // ensure data is in lists
                _ensureArray( ssr, "id" );

                for( var i = 0, il = ssr.beg_auth_seq_id.length; i < il; ++i ){
                    sheets.push( [
                        asymIdDict[ ssr.beg_label_asym_id[ i ] ],
                        parseInt( ssr.beg_auth_seq_id[ i ] ),
                        asymIdDict[ ssr.end_label_asym_id[ i ] ],
                        parseInt( ssr.end_auth_seq_id[ i ] )

                    ] );
                }

            }

        }

        this.streamer.eachChunkOfLines( function( lines, chunkNo, chunkCount ){
            _parseChunkOfLines( 0, lines.length, lines );
        } );

        sb.finalize();

        if( cif.struct && cif.struct.title ){
            s.title = cif.struct.title.trim().replace( /^['"]+|['"]+$/g, "" );
        }

        postProcess();

        if( NGL.debug ) NGL.timeEnd( "NGL.CifParser._parse " + this.name );
        callback();

    },

    _postProcess: function(){

        if( NGL.debug ) NGL.time( "NGL.CifParser._postProcess" );

        var s = this.structure;
        var structure = this.structure;
        var cif = this.cif;
        var asymIdDict = this.asymIdDict;

        function _ensureArray( dict, field ){

            if( !Array.isArray( dict[ field ] ) ){
                Object.keys( dict ).forEach( function( key ){
                    dict[ key ] = [ dict[ key ] ];
                } );
            }

        }

        // biomol & ncs processing
        var operDict = {};
        var biomolDict = s.biomolDict;

        if( cif.pdbx_struct_oper_list ){

            var op = cif.pdbx_struct_oper_list;

            // ensure data is in lists
            _ensureArray( op, "id" );

            op.id.forEach( function( id, i ){

                var m = new THREE.Matrix4();
                var elms = m.elements;

                elms[  0 ] = parseFloat( op[ "matrix[1][1]" ][ i ] );
                elms[  1 ] = parseFloat( op[ "matrix[1][2]" ][ i ] );
                elms[  2 ] = parseFloat( op[ "matrix[1][3]" ][ i ] );

                elms[  4 ] = parseFloat( op[ "matrix[2][1]" ][ i ] );
                elms[  5 ] = parseFloat( op[ "matrix[2][2]" ][ i ] );
                elms[  6 ] = parseFloat( op[ "matrix[2][3]" ][ i ] );

                elms[  8 ] = parseFloat( op[ "matrix[3][1]" ][ i ] );
                elms[  9 ] = parseFloat( op[ "matrix[3][2]" ][ i ] );
                elms[ 10 ] = parseFloat( op[ "matrix[3][3]" ][ i ] );

                elms[  3 ] = parseFloat( op[ "vector[1]" ][ i ] );
                elms[  7 ] = parseFloat( op[ "vector[2]" ][ i ] );
                elms[ 11 ] = parseFloat( op[ "vector[3]" ][ i ] );

                m.transpose();

                operDict[ id ] = m;

            } );

        }

        if( cif.pdbx_struct_assembly_gen ){

            var gen = cif.pdbx_struct_assembly_gen;

            // ensure data is in lists
            _ensureArray( gen, "assembly_id" );

            var getMatrixDict = function( expr ){

                var matDict = {};

                var l = expr.replace( /[\(\)']/g, "" ).split( "," );

                l.forEach( function( e ){

                    if( e.indexOf( "-" ) !== -1 ){

                        var es = e.split( "-" );

                        var j = parseInt( es[ 0 ] );
                        var m = parseInt( es[ 1 ] );

                        for( ; j <= m; ++j ){

                            matDict[ j ] = operDict[ j ];

                        }

                    }else{

                        matDict[ e ] = operDict[ e ];

                    }

                } );

                return matDict;

            }

            gen.assembly_id.forEach( function( id, i ){

                var md = {};
                var oe = gen.oper_expression[ i ];

                if( oe.indexOf( ")(" ) !== -1 ){

                    oe = oe.split( ")(" );

                    var md1 = getMatrixDict( oe[ 0 ] );
                    var md2 = getMatrixDict( oe[ 1 ] );

                    Object.keys( md1 ).forEach( function( k1 ){

                        Object.keys( md2 ).forEach( function( k2 ){

                            var mat = new THREE.Matrix4();

                            mat.multiplyMatrices( md1[ k1 ], md2[ k2 ] );
                            md[ k1 + "x" + k2 ] = mat;

                        } );

                    } );

                }else{

                    md = getMatrixDict( oe );

                }

                var matrixList = [];
                for( var k in md ){
                    matrixList.push( md[ k ] );
                }

                var name = id;
                if( /^(0|[1-9][0-9]*)$/.test( name ) ) name = "BU" + name;

                var chainList = gen.asym_id_list[ i ].split( "," );
                for( var j = 0, jl = chainList.length; j < jl; ++j ){
                    chainList[ j ] = asymIdDict[ chainList[ j ] ];
                }

                if( biomolDict[ name ] === undefined ){
                    biomolDict[ name ] = new NGL.Assembly( name );
                }
                biomolDict[ name ].addPart( matrixList, chainList );

            } );

        }

        // non-crystallographic symmetry operations
        if( cif.struct_ncs_oper ){

            var op = cif.struct_ncs_oper;

            // ensure data is in lists
            _ensureArray( op, "id" );

            var md = {};

            biomolDict[ "NCS" ] = {

                matrixDict: md,
                chainList: undefined

            };

            op.id.forEach( function( id, i ){

                var m = new THREE.Matrix4();
                var elms = m.elements;

                elms[  0 ] = parseFloat( op[ "matrix[1][1]" ][ i ] );
                elms[  1 ] = parseFloat( op[ "matrix[1][2]" ][ i ] );
                elms[  2 ] = parseFloat( op[ "matrix[1][3]" ][ i ] );

                elms[  4 ] = parseFloat( op[ "matrix[2][1]" ][ i ] );
                elms[  5 ] = parseFloat( op[ "matrix[2][2]" ][ i ] );
                elms[  6 ] = parseFloat( op[ "matrix[2][3]" ][ i ] );

                elms[  8 ] = parseFloat( op[ "matrix[3][1]" ][ i ] );
                elms[  9 ] = parseFloat( op[ "matrix[3][2]" ][ i ] );
                elms[ 10 ] = parseFloat( op[ "matrix[3][3]" ][ i ] );

                elms[  3 ] = parseFloat( op[ "vector[1]" ][ i ] );
                elms[  7 ] = parseFloat( op[ "vector[2]" ][ i ] );
                elms[ 11 ] = parseFloat( op[ "vector[3]" ][ i ] );

                m.transpose();

                md[ id ] = m;

            } );

        }

        // cell
        var unitcellDict = {};

        if( cif.cell ){

            var cell = cif.cell;
            var symmetry = cif.symmetry || {};

            var a = parseFloat( cell.length_a );
            var b = parseFloat( cell.length_b );
            var c = parseFloat( cell.length_c );

            var alpha = parseFloat( cell.angle_alpha );
            var beta = parseFloat( cell.angle_beta );
            var gamma = parseFloat( cell.angle_gamma );

            var sGroup = symmetry[ "space_group_name_H-M" ];
            if( sGroup[0] === sGroup[ sGroup.length-1 ] &&
                ( sGroup[0] === "'" || sGroup[0] === '"' )
            ){
                sGroup = sGroup.substring( 1, sGroup.length-1 );
            }
            var z = parseInt( cell.Z_PDB );

            var box = new Float32Array( 9 );
            box[ 0 ] = a;
            box[ 4 ] = b;
            box[ 8 ] = c;
            structure.boxes.push( box );

            unitcellDict.a = a;
            unitcellDict.b = b;
            unitcellDict.c = c;
            unitcellDict.alpha = alpha;
            unitcellDict.beta = beta;
            unitcellDict.gamma = gamma;
            unitcellDict.spacegroup = sGroup;

        }

        // origx
        var origx = new THREE.Matrix4();

        if( cif.database_PDB_matrix ){

            var mat = cif.database_PDB_matrix;
            var elms = origx.elements;

            elms[  0 ] = parseFloat( mat[ "origx[1][1]" ] );
            elms[  1 ] = parseFloat( mat[ "origx[1][2]" ] );
            elms[  2 ] = parseFloat( mat[ "origx[1][3]" ] );

            elms[  4 ] = parseFloat( mat[ "origx[2][1]" ] );
            elms[  5 ] = parseFloat( mat[ "origx[2][2]" ] );
            elms[  6 ] = parseFloat( mat[ "origx[2][3]" ] );

            elms[  8 ] = parseFloat( mat[ "origx[3][1]" ] );
            elms[  9 ] = parseFloat( mat[ "origx[3][2]" ] );
            elms[ 10 ] = parseFloat( mat[ "origx[3][3]" ] );

            elms[  3 ] = parseFloat( mat[ "origx_vector[1]" ] );
            elms[  7 ] = parseFloat( mat[ "origx_vector[2]" ] );
            elms[ 11 ] = parseFloat( mat[ "origx_vector[3]" ] );

            origx.transpose();

            unitcellDict.origx = origx;

        }

        // scale
        var scale = new THREE.Matrix4();

        if( cif.atom_sites ){

            var mat = cif.atom_sites;
            var elms = scale.elements;

            elms[  0 ] = parseFloat( mat[ "fract_transf_matrix[1][1]" ] );
            elms[  1 ] = parseFloat( mat[ "fract_transf_matrix[1][2]" ] );
            elms[  2 ] = parseFloat( mat[ "fract_transf_matrix[1][3]" ] );

            elms[  4 ] = parseFloat( mat[ "fract_transf_matrix[2][1]" ] );
            elms[  5 ] = parseFloat( mat[ "fract_transf_matrix[2][2]" ] );
            elms[  6 ] = parseFloat( mat[ "fract_transf_matrix[2][3]" ] );

            elms[  8 ] = parseFloat( mat[ "fract_transf_matrix[3][1]" ] );
            elms[  9 ] = parseFloat( mat[ "fract_transf_matrix[3][2]" ] );
            elms[ 10 ] = parseFloat( mat[ "fract_transf_matrix[3][3]" ] );

            elms[  3 ] = parseFloat( mat[ "fract_transf_vector[1]" ] );
            elms[  7 ] = parseFloat( mat[ "fract_transf_vector[2]" ] );
            elms[ 11 ] = parseFloat( mat[ "fract_transf_vector[3]" ] );

            scale.transpose();

            unitcellDict.scale = scale;

        }

        if( unitcellDict.a !== undefined ){
            s.unitcell = new NGL.Unitcell(
                unitcellDict.a, unitcellDict.b, unitcellDict.c,
                unitcellDict.alpha, unitcellDict.beta, unitcellDict.gamma,
                unitcellDict.spacegroup, unitcellDict.scale
            );
        }else{
            s.unitcell = undefined;  // triggers use of bounding box
        }

        // add connections
        var sc = cif.struct_conn;

        if( sc ){

            // ensure data is in lists
            _ensureArray( sc, "id" );

            var reDoubleQuote = /"/g;
            var ap1 = s.getAtomProxy();
            var ap2 = s.getAtomProxy();
            var atomIndicesCache = {};

            for( var i = 0, il = sc.id.length; i < il; ++i ){

                // ignore:
                // hydrog - hydrogen bond
                // mismat - mismatched base pairs
                // saltbr - ionic interaction

                var conn_type_id = sc.conn_type_id[ i ]
                if( conn_type_id === "hydrog" ||
                    conn_type_id === "mismat" ||
                    conn_type_id === "saltbr" ) continue;

                // ignore bonds between symmetry mates
                if( sc.ptnr1_symmetry[ i ] !== "1_555" ||
                    sc.ptnr2_symmetry[ i ] !== "1_555" ) continue;

                // process:
                // covale - covalent bond
                // covale_base -
                //      covalent modification of a nucleotide base
                // covale_phosphate -
                //      covalent modification of a nucleotide phosphate
                // covale_sugar -
                //      covalent modification of a nucleotide sugar
                // disulf - disulfide bridge
                // metalc - metal coordination
                // modres - covalent residue modification

                var sele1 = (
                    sc.ptnr1_auth_seq_id[ i ] + ":" +
                    asymIdDict[ sc.ptnr1_label_asym_id[ i ] ] + "." +
                    sc.ptnr1_label_atom_id[ i ].replace( reDoubleQuote, '' )
                );
                var atomIndices1 = atomIndicesCache[ sele1 ];
                if( !atomIndices1 ){
                    var selection1 = new NGL.Selection( sele1 );
                    if( selection1.selection[ "error" ] ){
                        NGL.warn( "invalid selection for connection", sele1 );
                        continue;
                    }
                    atomIndices1 = s.getAtomIndices( selection1 );
                    atomIndicesCache[ sele1 ] = atomIndices1;
                }

                var sele2 = (
                    sc.ptnr2_auth_seq_id[ i ] + ":" +
                    asymIdDict[ sc.ptnr2_label_asym_id[ i ] ] + "." +
                    sc.ptnr2_label_atom_id[ i ].replace( reDoubleQuote, '' )
                );
                var atomIndices2 = atomIndicesCache[ sele2 ];
                if( !atomIndices2 ){
                    var selection2 = new NGL.Selection( sele2 );
                    if( selection2.selection[ "error" ] ){
                        NGL.warn( "invalid selection for connection", sele2 );
                        continue;
                    }
                    atomIndices2 = s.getAtomIndices( selection2 );
                    atomIndicesCache[ sele2 ] = atomIndices2;
                }

                // cases with more than one atom per selection
                // - #altloc1 to #altloc2
                // - #model to #model
                // - #altloc1 * #model to #altloc2 * #model

                var k = atomIndices1.length;
                var l = atomIndices2.length;

                if( k > l ){
                    var tmpA = k;
                    k = l;
                    l = tmpA;
                    var tmpB = atomIndices1;
                    atomIndices1 = atomIndices2;
                    atomIndices2 = tmpB;
                }

                // console.log( k, l );

                if( k === 0 || l === 0 ){
                    NGL.warn( "no atoms found for", sele1, sele2 );
                    continue;
                }

                for( var j = 0; j < l; ++j ){

                    ap1.index = atomIndices1[ j % k ];
                    ap2.index = atomIndices2[ j ];

                    if( ap1 && ap2 ){
                        s.bondStore.addBond( ap1, ap2 );
                    }else{
                        NGL.log( "atoms for connection not found" );
                    }

                }

            }

        }

        if( NGL.debug ) NGL.timeEnd( "NGL.CifParser._postProcess" );

    }

} );


NGL.SdfParser = function( streamer, params ){

    NGL.StructureParser.call( this, streamer, params );

};

NGL.SdfParser.prototype = NGL.createObject(

    NGL.StructureParser.prototype, {

    constructor: NGL.SdfParser,
    type: "sdf",

    _parse: function( callback ){

        // https://en.wikipedia.org/wiki/Chemical_table_file#SDF
        // http://download.accelrys.com/freeware/ctfile-formats/ctfile-formats.zip

        if( NGL.debug ) NGL.time( "NGL.SdfParser._parse " + this.name );

        var s = this.structure;
        var sb = this.structureBuilder;

        var firstModelOnly = this.firstModelOnly;
        var asTrajectory = this.asTrajectory;

        var headerLines = this.streamer.peekLines( 2 );

        s.id = headerLines[ 0 ].trim();
        s.title = headerLines[ 1 ].trim();

        var frames = s.frames;
        var boxes = s.boxes;
        var doFrames = false;
        var currentFrame, currentCoord;

        var atomMap = s.atomMap;
        var atomStore = s.atomStore;
        atomStore.resize( Math.round( this.streamer.data.length / 50 ) );

        var ap1 = s.getAtomProxy();
        var ap2 = s.getAtomProxy();

        var idx = 0;
        var lineNo = 0;
        var modelIdx = 0;
        var modelAtomIdxStart = 0;

        var atomCount, bondCount, atomStart, atomEnd, bondStart, bondEnd;

        function _parseChunkOfLines( _i, _n, lines ){

            for( var i = _i; i < _n; ++i ){

                var line = lines[ i ];

                if( line.substr( 0, 4 ) === "$$$$" ){

                    lineNo = -1;
                    ++modelIdx;
                    modelAtomIdxStart = atomStore.count;

                }

                if( lineNo === 3 ){

                    atomCount = parseInt( line.substr( 0, 3 ) );
                    bondCount = parseInt( line.substr( 3, 3 ) );

                    atomStart = 4;
                    atomEnd = atomStart + atomCount;
                    bondStart = atomEnd;
                    bondEnd = bondStart + bondCount;

                    if( asTrajectory ){

                        currentCoord = 0;
                        currentFrame = new Float32Array( atomCount * 3 );
                        frames.push( currentFrame );

                        if( modelIdx > 0 ) doFrames = true;

                    }

                }

                if( lineNo >= atomStart && lineNo < atomEnd ){

                    if( firstModelOnly && modelIdx > 0 ) continue;

                    var x = parseFloat( line.substr( 0, 10 ) );
                    var y = parseFloat( line.substr( 10, 10 ) );
                    var z = parseFloat( line.substr( 20, 10 ) );

                    if( asTrajectory ){

                        var j = currentCoord * 3;

                        currentFrame[ j + 0 ] = x;
                        currentFrame[ j + 1 ] = y;
                        currentFrame[ j + 2 ] = z;

                        currentCoord += 1;

                        if( doFrames ) continue;

                    }

                    var element = line.substr( 31, 3 ).trim();
                    var atomname = element + ( idx + 1 );

                    atomStore.growIfFull();
                    atomStore.atomTypeId[ idx ] = atomMap.add( atomname, element );

                    atomStore.x[ idx ] = x;
                    atomStore.y[ idx ] = y;
                    atomStore.z[ idx ] = z;
                    atomStore.serial[ idx ] = idx;

                    sb.addAtom( modelIdx, "", "HET", 1, 1 );

                    idx += 1;

                }

                if( lineNo >= bondStart && lineNo < bondEnd ){

                    if( firstModelOnly && modelIdx > 0 ) continue;
                    if( asTrajectory && modelIdx > 0 ) continue;

                    ap1.index = parseInt( line.substr( 0, 3 ) ) - 1 + modelAtomIdxStart;
                    ap2.index = parseInt( line.substr( 3, 3 ) ) - 1 + modelAtomIdxStart;
                    var order = parseInt( line.substr( 6, 3 ) );

                    s.bondStore.addBond( ap1, ap2, order );

                }

                ++lineNo;

            };

        };

        this.streamer.eachChunkOfLines( function( lines, chunkNo, chunkCount ){
            _parseChunkOfLines( 0, lines.length, lines );
        } );

        sb.finalize();

        s._dontAutoBond = true;
        s.unitcell = undefined;  // triggers use of bounding box

        if( NGL.debug ) NGL.timeEnd( "NGL.SdfParser._parse " + this.name );
        callback();

    }

} );


NGL.Mol2Parser = function( streamer, params ){

    NGL.StructureParser.call( this, streamer, params );

};

NGL.Mol2Parser.prototype = NGL.createObject(

    NGL.StructureParser.prototype, {

    constructor: NGL.Mol2Parser,
    type: "mol2",

    _parse: function( callback ){

        // http://www.tripos.com/data/support/mol2.pdf

        if( NGL.debug ) NGL.time( "NGL.Mol2Parser._parse " + this.name );

        var reWhitespace = /\s+/;

        var s = this.structure;
        var sb = this.structureBuilder;

        var firstModelOnly = this.firstModelOnly;
        var asTrajectory = this.asTrajectory;

        var frames = s.frames;
        var boxes = s.boxes;
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

                        var ls = line.split( reWhitespace );
                        numAtoms = parseInt( ls[ 0 ] );
                        // num_atoms [num_bonds [num_subst [num_feat [num_sets]]]]

                    }else if( moleculeLineNo === 2 ){

                        var molType = line;
                        // SMALL, BIOPOLYMER, PROTEIN, NUCLEIC_ACID, SACCHARIDE

                    }else if( moleculeLineNo === 3 ){

                        var chargeType = line;
                        // NO_CHARGES, DEL_RE, GASTEIGER, GAST_HUCK, HUCKEL,
                        // PULLMAN, GAUSS80_CHARGES, AMPAC_CHARGES,
                        // MULLIKEN_CHARGES, DICT_ CHARGES, MMFF94_CHARGES,
                        // USER_CHARGES

                    }else if( moleculeLineNo === 4 ){

                        var statusBits = line;

                    }else if( moleculeLineNo === 5 ){

                        var molComment = line;

                    }

                    ++moleculeLineNo;

                }else if( currentRecordType === atomRecordType ){

                    var ls = line.split( reWhitespace );

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

                    sb.addAtom( modelIdx, "", resname, resno, 1 );

                    idx += 1;

                }else if( currentRecordType === bondRecordType ){

                    if( firstModelOnly && modelIdx > 0 ) continue;
                    if( asTrajectory && modelIdx > 0 ) continue;

                    var ls = line.split( reWhitespace );

                    // ls[ 0 ] is bond id
                    ap1.index = parseInt( ls[ 1 ] ) - 1 + modelAtomIdxStart;
                    ap2.index = parseInt( ls[ 2 ] ) - 1 + modelAtomIdxStart;
                    var order = bondTypes[ ls[ 3 ] ];

                    s.bondStore.addBond( ap1, ap2, order );

                }

            };

        };

        this.streamer.eachChunkOfLines( function( lines, chunkNo, chunkCount ){
            _parseChunkOfLines( 0, lines.length, lines );
        } );

        sb.finalize();

        s._dontAutoBond = true;
        s.unitcell = undefined;  // triggers use of bounding box

        if( NGL.debug ) NGL.timeEnd( "NGL.Mol2Parser._parse " + this.name );
        callback();

    }

} );


NGL.MmtfParser = function( streamer, params ){

    NGL.StructureParser.call( this, streamer, params );

    this.dontAutoBond = true;
    this.autoBondBetween = true;
    this.doAutoSS = false;

};

NGL.MmtfParser.prototype = NGL.createObject(

    NGL.StructureParser.prototype, {

    constructor: NGL.MmtfParser,
    type: "mmtf",

    _parse: function( callback ){

        if( NGL.debug ) NGL.time( "NGL.MmtfParser._parse " + this.name );

        var s = this.structure;
        var sd = decodeMmtf( this.streamer.data );
        // console.log(sd)

        if( sd.numBonds === undefined ){
            sd.numBonds = 0;
        }

        s.bondStore.length = sd.bondStore.bondOrder.length;
        s.bondStore.count = sd.numBonds;
        s.bondStore.atomIndex1 = sd.bondStore.atomIndex1;
        s.bondStore.atomIndex2 = sd.bondStore.atomIndex2;
        s.bondStore.bondOrder = sd.bondStore.bondOrder;

        s.atomStore.length = sd.numAtoms;
        s.atomStore.count = sd.numAtoms;
        s.atomStore.residueIndex = sd.atomStore.groupIndex;
        s.atomStore.atomTypeId = new Uint16Array( sd.numAtoms );
        s.atomStore.x = sd.atomStore.xCoord;
        s.atomStore.y = sd.atomStore.yCoord;
        s.atomStore.z = sd.atomStore.zCoord;
        s.atomStore.serial = sd.atomStore.atomId;
        s.atomStore.bfactor = sd.atomStore.bFactor;
        s.atomStore.altloc = sd.atomStore.altLabel;

        s.residueStore.length = sd.numGroups;
        s.residueStore.count = sd.numGroups;
        s.residueStore.chainIndex = sd.groupStore.chainIndex;
        s.residueStore.residueTypeId = sd.groupStore.groupTypeId;
        s.residueStore.atomOffset = sd.groupStore.atomOffset;
        s.residueStore.atomCount = sd.groupStore.atomCount;
        s.residueStore.resno = sd.groupStore.groupNum;
        s.residueStore.sstruc = sd.groupStore.secStruct;

        s.chainStore.length = sd.numChains;
        s.chainStore.count = sd.numChains;
        s.chainStore.modelIndex = sd.chainStore.modelIndex;
        s.chainStore.residueOffset = sd.chainStore.groupOffset;
        s.chainStore.residueCount = sd.chainStore.groupCount;
        s.chainStore.chainname = sd.chainStore.chainName;

        s.modelStore.length = sd.numModels;
        s.modelStore.count = sd.numModels;
        s.modelStore.chainOffset = sd.modelStore.chainOffset;
        s.modelStore.chainCount = sd.modelStore.chainCount;

        if( NGL.debug ) console.time( "process map data" );

        var sstrucMap = {
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

        var groupTypeIdList = Object.keys( sd.groupMap )
            .map( function( id ){ return parseInt( id ); } )
            .sort( function( a, b ){ return a - b; } );

        for( var i = 0, il = groupTypeIdList.length; i < il; ++i ){
            var groupTypeId = groupTypeIdList[ i ];
            var groupType = sd.groupMap[ groupTypeId ];
            var atomTypeIdList = [];
            for( var j = 0, jl = groupType.atomInfo.length; j < jl; j+=2 ){
                var element = groupType.atomInfo[ j ].toUpperCase();
                var atomname = groupType.atomInfo[ j + 1 ];
                atomTypeIdList.push( s.atomMap.add( atomname, element ) );
            }
            s.residueMap.add( groupType.groupName, atomTypeIdList, groupType.hetFlag );
        }

        for( var i = 0, il = s.atomStore.count; i < il; ++i ){
            var residueIndex = s.atomStore.residueIndex[ i ];
            var residueType = s.residueMap.list[ s.residueStore.residueTypeId[ residueIndex ] ];
            var atomOffset = s.residueStore.atomOffset[ residueIndex ];
            s.atomStore.atomTypeId[ i ] = residueType.atomTypeIdList[ i - atomOffset ];
        }

        if( NGL.debug ) console.timeEnd( "process map data" );

        for( var i = 0, il = s.residueStore.count; i < il; ++i ){
            var sstruc = sstrucMap[ s.residueStore.sstruc[ i ] ];
            if( sstruc !== undefined ) s.residueStore.sstruc[ i ] = sstruc;
        }

        //

        if( sd.bioAssembly ){
            for( var k in sd.bioAssembly ){
                var tDict = {};  // assembly parts hashed by transformation matrix
                var bioAssem = sd.bioAssembly[ k ];
                for( var tk in bioAssem.transforms ){
                    var t = bioAssem.transforms[ tk ];
                    var part = tDict[ t.transformation ];
                    if( !part ){
                        part = {
                            matrix: new THREE.Matrix4().fromArray( t.transformation ),
                            chainList: t.chainId
                        };
                        tDict[ t.transformation ] = part;
                    }else{
                        // console.warn("chainList.concat");
                        part.chainList = part.chainList.concat( t.chainId );
                    }
                }
                var cDict = {};  // matrix lists hashed by chain list
                for( var pk in tDict ){
                    var p = tDict[ pk ];
                    var matrixList = cDict[ p.chainList ];
                    if( !matrixList ){
                        matrixList = [ p.matrix ];
                        cDict[ p.chainList ] = matrixList;
                    }else{
                        matrixList.push( p.matrix );
                    }
                }
                for( var ck in cDict ){
                    var matrixList = cDict[ ck ];
                    var chainList = ck.split( "," );
                    var assembly = new NGL.Assembly( bioAssem.id );
                    s.biomolDict[ "BU" + bioAssem.id ] = assembly;
                    assembly.addPart( matrixList, chainList );
                }
            }
        }

        if( sd.unitCell && Array.isArray( sd.unitCell ) && sd.unitCell[ 0 ] ){
            s.unitcell = new NGL.Unitcell(
                sd.unitCell[ 0 ], sd.unitCell[ 1 ], sd.unitCell[ 2 ],
                sd.unitCell[ 3 ], sd.unitCell[ 4 ], sd.unitCell[ 5 ],
                sd.spaceGroup
            );
        }else{
            s.unitcell = undefined;  // triggers use of bounding box
        }

        if( NGL.debug ) NGL.timeEnd( "NGL.MmtfParser._parse " + this.name );
        callback();

    }

} );


//////////////////////
// Trajectory parser

NGL.TrajectoryParser = function( streamer, params ){

    var p = params || {};

    NGL.Parser.call( this, streamer, p );

    this.frames = new NGL.Frames( this.name, this.path );

};

NGL.TrajectoryParser.prototype = NGL.createObject(

    NGL.Parser.prototype, {

    constructor: NGL.TrajectoryParser,
    type: "trajectory",

    __objName: "frames"

} );


NGL.DcdParser = function( streamer, params ){

    var p = params || {};

    NGL.TrajectoryParser.call( this, streamer, p );

};

NGL.DcdParser.prototype = NGL.createObject(

    NGL.TrajectoryParser.prototype, {

    constructor: NGL.DcdParser,
    type: "dcd",

    _parse: function( callback ){

        // http://www.ks.uiuc.edu/Research/vmd/plugins/molfile/dcdplugin.html

        // The DCD format is structured as follows
        //   (FORTRAN UNFORMATTED, with Fortran data type descriptions):
        // HDR     NSET    ISTRT   NSAVC   5-ZEROS NATOM-NFREAT    DELTA   9-ZEROS
        // `CORD'  #files  step 1  step    zeroes  (zero)          timestep  (zeroes)
        //                         interval
        // C*4     INT     INT     INT     5INT    INT             DOUBLE  9INT
        // ==========================================================================
        // NTITLE          TITLE
        // INT (=2)        C*MAXTITL
        //                 (=32)
        // ==========================================================================
        // NATOM
        // #atoms
        // INT
        // ==========================================================================
        // X(I), I=1,NATOM         (DOUBLE)
        // Y(I), I=1,NATOM
        // Z(I), I=1,NATOM
        // ==========================================================================

        if( NGL.debug ) NGL.time( "NGL.DcdParser._parse " + this.name );

        var bin = this.streamer.data;
        if( bin instanceof Uint8Array ){
            bin = bin.buffer;
        }
        var dv = new DataView( bin );

        var f = this.frames;
        var coordinates = f.coordinates;
        var boxes = f.boxes;
        var header = {};
        var nextPos = 0;

        // header block

        var intView = new Int32Array( bin, 0, 23 );
        var ef = intView[ 0 ] !== dv.getInt32( 0 );  // endianess flag
        // swap byte order when big endian (84 indicates little endian)
        if( intView[ 0 ] !== 84 ){
            var n = bin.byteLength;
            for( var i = 0; i < n; i+=4 ){
                dv.setFloat32( i, dv.getFloat32( i ), true );
            }
        }
        if( intView[ 0 ] !== 84 ){
            NGL.error( "dcd bad format, header block start" );
        }
        // format indicator, should read 'CORD'
        var formatString = String.fromCharCode(
            dv.getUint8( 4 ), dv.getUint8( 5 ),
            dv.getUint8( 6 ), dv.getUint8( 7 )
        );
        if( formatString !== "CORD" ){
            NGL.error( "dcd bad format, format string" );
        }
        var isCharmm = false;
        var extraBlock = false;
        var fourDims = false;
        // version field in charmm, unused in X-PLOR
        if( intView[ 22 ] !== 0 ){
            isCharmm = true;
            if( intView[ 12 ] !== 0 ) extraBlock = true;
            if( intView[ 13 ] === 1 ) fourDims = true;
        }
        header.NSET = intView[ 2 ];
        header.ISTART = intView[ 3 ];
        header.NSAVC = intView[ 4 ];
        header.NAMNF = intView[ 10 ];
        if( isCharmm ){
            header.DELTA = dv.getFloat32( 44, ef );
        }else{
            header.DELTA = dv.getFloat64( 44, ef );
        }
        if( intView[ 22 ] !== 84 ){
            NGL.error( "dcd bad format, header block end" );
        }
        nextPos = nextPos + 21 * 4 + 8;

        // title block

        var titleLength = dv.getInt32( nextPos, ef );
        var titlePos = nextPos + 1;
        if( ( titleLength - 4 ) % 80 !== 0 ){
            NGL.error( "dcd bad format, title block start" );
        }
        header.TITLE = NGL.Uint8ToString(
            new Uint8Array( bin, titlePos, titleLength )
        );
        if( dv.getInt32( titlePos + titleLength + 4 - 1, ef ) !== titleLength ){
            NGL.error( "dcd bad format, title block end" );
        }
        nextPos = nextPos + titleLength + 8;

        // natom block

        if( dv.getInt32( nextPos, ef ) !== 4 ){
            NGL.error( "dcd bad format, natom block start" );
        }
        header.NATOM = dv.getInt32( nextPos + 4, ef );
        if( dv.getInt32( nextPos + 8, ef ) !== 4 ){
            NGL.error( "dcd bad format, natom block end" );
        }
        nextPos = nextPos + 4 + 8;

        // fixed atoms block

        if( header.NAMNF > 0 ){
            // TODO read coordinates and indices of fixed atoms
            NGL.error( "dcd format with fixed atoms unsupported, aborting" );
            callback();
            return;
        }

        // frames

        var natom = header.NATOM;
        var natom4 = natom * 4;

        for( var i = 0, n = header.NSET; i < n; ++i ){

            if( extraBlock ){
                nextPos += 4;  // block start
                // unitcell: A, alpha, B, beta, gamma, C (doubles)
                var box = new Float32Array( 9 );
                box[ 0 ] = dv.getFloat64( nextPos        , ef );
                box[ 4 ] = dv.getFloat64( nextPos + 2 * 8, ef );
                box[ 8 ] = dv.getFloat64( nextPos + 5 * 8, ef );
                boxes.push( box );
                nextPos += 48;
                nextPos += 4;  // block end
            }

            // xyz coordinates
            var coord = new Float32Array( natom * 3 );
            for( var j = 0; j < 3; ++j ){
                if( dv.getInt32( nextPos, ef ) !== natom4 ){
                    NGL.error( "dcd bad format, coord block start", i, j );
                }
                nextPos += 4;  // block start
                var c = new Float32Array( bin, nextPos, natom );
                for( var k = 0; k < natom; ++k ){
                    coord[ 3 * k + j ] = c[ k ];
                }
                nextPos += natom4;
                if( dv.getInt32( nextPos, ef ) !== natom4 ){
                    NGL.error( "dcd bad format, coord block end", i, j );
                }
                nextPos += 4;  // block end
            }
            coordinates.push( coord );

            if( fourDims ){
                var bytes = dv.getInt32( nextPos, ef );
                nextPos += 4 + bytes + 4;  // block start + skip + block end
            }

        }

        // console.log( header );
        // console.log( header.TITLE );
        // console.log( "isCharmm", isCharmm, "extraBlock", extraBlock, "fourDims", fourDims );

        if( NGL.debug ) NGL.timeEnd( "NGL.DcdParser._parse " + this.name );
        callback();

    },

} );


//////////////////
// Volume parser

NGL.VolumeParser = function( streamer, params ){

    var p = params || {};

    NGL.Parser.call( this, streamer, p );

    this.volume = new NGL.Volume( this.name, this.path );

};

NGL.VolumeParser.prototype = NGL.createObject(

    NGL.Parser.prototype, {

    constructor: NGL.VolumeParser,
    type: "volume",

    __objName: "volume",

    _afterParse: function(){

        this.volume.setMatrix( this.getMatrix() );

    },

    getMatrix: function(){

        return new THREE.Matrix4();

    }

} );


NGL.MrcParser = function( streamer, params ){

    NGL.VolumeParser.call( this, streamer, params );

};

NGL.MrcParser.prototype = NGL.createObject(

    NGL.VolumeParser.prototype, {

    constructor: NGL.MrcParser,
    type: "mrc",

    _parse: function( callback ){

        // MRC
        // http://ami.scripps.edu/software/mrctools/mrc_specification.php
        // http://www2.mrc-lmb.cam.ac.uk/research/locally-developed-software/image-processing-software/#image
        // http://bio3d.colorado.edu/imod/doc/mrc_format.txt

        // CCP4 (MAP)
        // http://www.ccp4.ac.uk/html/maplib.html

        // MRC format does not use the skew transformation header records (words 25-37)
        // CCP4 format does not use the ORIGIN header records (words 50-52)

        if( NGL.debug ) NGL.time( "NGL.MrcParser._parse " + this.name );

        var bin = this.streamer.data;

        if( bin instanceof Uint8Array ){
            bin = bin.buffer;
        }

        var v = this.volume;
        var header = {};

        var intView = new Int32Array( bin, 0, 56 );
        var floatView = new Float32Array( bin, 0, 56 );

        var dv = new DataView( bin );

        // 53  MAP         Character string 'MAP ' to identify file type
        header.MAP = String.fromCharCode(
            dv.getUint8( 52 * 4 ), dv.getUint8( 52 * 4 + 1 ),
            dv.getUint8( 52 * 4 + 2 ), dv.getUint8( 52 * 4 + 3 )
        );

        // 54  MACHST      Machine stamp indicating machine type which wrote file
        //                 17 and 17 for big-endian or 68 and 65 for little-endian
        header.MACHST = [ dv.getUint8( 53 * 4 ), dv.getUint8( 53 * 4 + 1 ) ];

        // swap byte order when big endian
        if( header.MACHST[ 0 ] === 17 && header.MACHST[ 1 ] === 17 ){
            var n = bin.byteLength;
            for( var i = 0; i < n; i+=4 ){
                dv.setFloat32( i, dv.getFloat32( i ), true );
            }
        }

        header.NX = intView[ 0 ];  // NC - columns (fastest changing)
        header.NY = intView[ 1 ];  // NR - rows
        header.NZ = intView[ 2 ];  // NS - sections (slowest changing)

        // mode
        //  0 image : signed 8-bit bytes range -128 to 127
        //  1 image : 16-bit halfwords
        //  2 image : 32-bit reals
        //  3 transform : complex 16-bit integers
        //  4 transform : complex 32-bit reals
        //  6 image : unsigned 16-bit range 0 to 65535
        // 16 image: unsigned char * 3 (for rgb data, non-standard)
        //
        // Note: Mode 2 is the normal mode used in the CCP4 programs.
        //       Other modes than 2 and 0 may NOT WORK
        header.MODE = intView[ 3 ];

        // start
        header.NXSTART = intView[ 4 ];  // NCSTART - first column
        header.NYSTART = intView[ 5 ];  // NRSTART - first row
        header.NZSTART = intView[ 6 ];  // NSSTART - first section

        // intervals
        header.MX = intView[ 7 ];  // intervals along x
        header.MY = intView[ 8 ];  // intervals along y
        header.MZ = intView[ 9 ];  // intervals along z

        // cell length (Angstroms in CCP4)
        header.xlen = floatView[ 10 ];
        header.ylen = floatView[ 11 ];
        header.zlen = floatView[ 12 ];

        // cell angle (Degrees)
        header.alpha = floatView[ 13 ];
        header.beta  = floatView[ 14 ];
        header.gamma = floatView[ 15 ];

        // axis correspondence (1,2,3 for X,Y,Z)
        header.MAPC = intView[ 16 ];  // column
        header.MAPR = intView[ 17 ];  // row
        header.MAPS = intView[ 18 ];  // section

        // density statistics
        header.DMIN  = floatView[ 19 ];
        header.DMAX  = floatView[ 20 ];
        header.DMEAN = floatView[ 21 ];

        // space group number 0 or 1 (default=0)
        header.ISPG = intView[ 22 ];

        // number of bytes used for symmetry data (0 or 80)
        header.NSYMBT = intView[ 23 ];

        // Flag for skew transformation, =0 none, =1 if foll
        header.LSKFLG = intView[ 24 ];

        // 26-34  SKWMAT  Skew matrix S (in order S11, S12, S13, S21 etc) if
        //                LSKFLG .ne. 0.
        // 35-37  SKWTRN  Skew translation t if LSKFLG != 0.
        //                Skew transformation is from standard orthogonal
        //                coordinate frame (as used for atoms) to orthogonal
        //                map frame, as Xo(map) = S * (Xo(atoms) - t)

        // 38      future use       (some of these are used by the MSUBSX routines
        //  .          "              in MAPBRICK, MAPCONT and FRODO)
        //  .          "   (all set to zero by default)
        //  .          "
        // 52          "

        // 50-52 origin in X,Y,Z used for transforms
        header.originX = floatView[ 49 ];
        header.originY = floatView[ 50 ];
        header.originZ = floatView[ 51 ];

        // 53  MAP         Character string 'MAP ' to identify file type
        // => see top of this parser

        // 54  MACHST      Machine stamp indicating machine type which wrote file
        // => see top of this parser

        // Rms deviation of map from mean density
        header.ARMS = floatView[ 54 ];

        // 56      NLABL           Number of labels being used
        // 57-256  LABEL(20,10)    10  80 character text labels (ie. A4 format)

        v.header = header;

        // NGL.log( header )

        // FIXME depends on mode
        var data = new Float32Array(
            bin, 256 * 4 + header.NSYMBT,
            header.NX * header.NY * header.NZ
        );

        v.setData( data, header.NX, header.NY, header.NZ );

        if( NGL.debug ) NGL.timeEnd( "NGL.MrcParser._parse " + this.name );
        callback();

    },

    getMatrix: function(){

        var h = this.volume.header;

        var basisX = [
            h.xlen,
            0,
            0
        ];

        var basisY = [
            h.ylen * Math.cos( Math.PI / 180.0 * h.gamma ),
            h.ylen * Math.sin( Math.PI / 180.0 * h.gamma ),
            0
        ];

        var basisZ = [
            h.zlen * Math.cos( Math.PI / 180.0 * h.beta ),
            h.zlen * (
                    Math.cos( Math.PI / 180.0 * h.alpha )
                    - Math.cos( Math.PI / 180.0 * h.gamma )
                    * Math.cos( Math.PI / 180.0 * h.beta )
                ) / Math.sin( Math.PI / 180.0 * h.gamma ),
            0
        ];
        basisZ[ 2 ] = Math.sqrt(
            h.zlen * h.zlen * Math.sin( Math.PI / 180.0 * h.beta ) *
            Math.sin( Math.PI / 180.0 * h.beta ) - basisZ[ 1 ] * basisZ[ 1 ]
        );

        var basis = [ 0, basisX, basisY, basisZ ];
        var nxyz = [ 0, h.MX, h.MY, h.MZ ];
        var mapcrs = [ 0, h.MAPC, h.MAPR, h.MAPS ];

        var matrix = new THREE.Matrix4();

        matrix.set(

            basis[ mapcrs[1] ][0] / nxyz[ mapcrs[1] ],
            basis[ mapcrs[2] ][0] / nxyz[ mapcrs[2] ],
            basis[ mapcrs[3] ][0] / nxyz[ mapcrs[3] ],
            0,

            basis[ mapcrs[1] ][1] / nxyz[ mapcrs[1] ],
            basis[ mapcrs[2] ][1] / nxyz[ mapcrs[2] ],
            basis[ mapcrs[3] ][1] / nxyz[ mapcrs[3] ],
            0,

            basis[ mapcrs[1] ][2] / nxyz[ mapcrs[1] ],
            basis[ mapcrs[2] ][2] / nxyz[ mapcrs[2] ],
            basis[ mapcrs[3] ][2] / nxyz[ mapcrs[3] ],
            0,

            0, 0, 0, 1

        );

        matrix.multiply(
            new THREE.Matrix4().makeTranslation(
                h.NXSTART + h.originX,
                h.NYSTART + h.originY,
                h.NZSTART + h.originZ
            )
        );

        return matrix;

    }

} );


NGL.CubeParser = function( streamer, params ){

    // @author Johanna Tiemann <johanna.tiemann@googlemail.com>
    // @author Alexander Rose <alexander.rose@weirdbyte.de>

    NGL.VolumeParser.call( this, streamer, params );

};

NGL.CubeParser.prototype = NGL.createObject(

    NGL.VolumeParser.prototype, {

    constructor: NGL.CubeParser,
    type: "cube",

    _parse: function( callback ){

        // http://paulbourke.net/dataformats/cube/

        if( NGL.debug ) NGL.time( "NGL.CubeParser._parse " + this.name );

        var v = this.volume;
        var headerLines = this.streamer.peekLines( 6 );
        var header = {};
        var reWhitespace = /\s+/;
        var bohrToAngstromFactor = 0.529177210859;

        function headerhelper( k, l ) {
            var field = headerLines[ k ].trim().split( reWhitespace )[ l ];
            return parseFloat( field );
        }

        header.atomCount = Math.abs( headerhelper( 2, 0 ) ); //Number of atoms
        header.originX = headerhelper( 2, 1 ) * bohrToAngstromFactor; //Position of origin of volumetric data
        header.originY = headerhelper( 2, 2 ) * bohrToAngstromFactor;
        header.originZ = headerhelper( 2, 3 ) * bohrToAngstromFactor;
        header.NVX = headerhelper( 3, 0 ); //Number of voxels
        header.NVY = headerhelper( 4, 0 );
        header.NVZ = headerhelper( 5, 0 );
        header.AVX = headerhelper( 3, 1 ) * bohrToAngstromFactor; //Axis vector
        header.AVY = headerhelper( 4, 2 ) * bohrToAngstromFactor;
        header.AVZ = headerhelper( 5, 3 ) * bohrToAngstromFactor;

        var data = new Float32Array( header.NVX * header.NVY * header.NVZ );
        var count = 0;
        var lineNo = 0;

        function _parseChunkOfLines( _i, _n, lines ){

            for( var i = _i; i < _n; ++i ){

                var line = lines[ i ].trim();

                if( line !== "" && lineNo >= header.atomCount + 6 ){

                    line = line.split( reWhitespace );
                    for( var j = 0, lj = line.length; j < lj; ++j ){
                        if ( line.length !==1 ) {
                            data[ count ] = parseFloat( line[ j ] );
                            ++count;
                        };
                    };

                }

                ++lineNo;

            };

        };

        this.streamer.eachChunkOfLines( function( lines, chunkNo, chunkCount ){
            _parseChunkOfLines( 0, lines.length, lines );
        } );

        v.header = header;
        v.setData( data, header.NVZ, header.NVY, header.NVX );

        if( NGL.debug ) NGL.timeEnd( "NGL.CubeParser._parse " + this.name );
        callback();

    },

    getMatrix: function(){

        var h = this.volume.header;
        var matrix = new THREE.Matrix4();

        matrix.multiply(
            new THREE.Matrix4().makeRotationY( THREE.Math.degToRad( 90 ) )
        );

        matrix.multiply(
            new THREE.Matrix4().makeTranslation(
                -h.originZ, h.originY, h.originX
            )
        );

        matrix.multiply(
            new THREE.Matrix4().makeScale(
                -h.AVZ, h.AVY, h.AVX
            )
        );

        return matrix;

    }

} );


NGL.DxParser = function( streamer, params ){

    NGL.VolumeParser.call( this, streamer, params );

};

NGL.DxParser.prototype = NGL.createObject(

    NGL.VolumeParser.prototype, {

    constructor: NGL.DxParser,
    type: "dx",

    _parse: function( callback ){

        // http://www.poissonboltzmann.org/docs/file-format-info/

        if( NGL.debug ) NGL.time( "NGL.DxParser._parse " + this.name );

        var v = this.volume;
        var headerLines = this.streamer.peekLines( 30 );
        var headerInfo = this.parseHeaderLines( headerLines );
        var header = this.volume.header;
        var dataLineStart = headerInfo.dataLineStart;

        var reWhitespace = /\s+/;
        var size = header.nx * header.ny * header.nz;
        var data = new Float32Array( size );
        var count = 0;
        var lineNo = 0;

        function _parseChunkOfLines( _i, _n, lines ){

            for( var i = _i; i < _n; ++i ){

                if( count < size && lineNo > dataLineStart ){

                    var line = lines[ i ].trim();

                    if( line !== "" ){

                        var ls = line.split( reWhitespace );

                        for( var j = 0, lj = ls.length; j < lj; ++j ){
                            data[ count ] = parseFloat( ls[ j ] );
                            ++count;
                        };

                    }

                }

                ++lineNo;

            };

        };

        this.streamer.eachChunkOfLines( function( lines, chunkNo, chunkCount ){
            _parseChunkOfLines( 0, lines.length, lines );
        } );

        v.setData( data, header.nz, header.ny, header.nx );

        if( NGL.debug ) NGL.timeEnd( "NGL.DxParser._parse " + this.name );
        callback();

    },

    parseHeaderLines: function( headerLines ){

        var header = {};
        var reWhitespace = /\s+/;
        var n = headerLines.length;

        var dataLineStart = 0;
        var headerByteCount = 0;
        var deltaLineCount = 0;

        for( var i = 0; i < n; ++i ){

            var line = headerLines[ i ];

            if( line.startsWith( "object 1" ) ){

                var ls = line.split( reWhitespace );

                header.nx = parseInt( ls[ 5 ] );
                header.ny = parseInt( ls[ 6 ] );
                header.nz = parseInt( ls[ 7 ] );

            }else if( line.startsWith( "origin" ) ){

                var ls = line.split( reWhitespace );

                header.xmin = parseFloat( ls[ 1 ] );
                header.ymin = parseFloat( ls[ 2 ] );
                header.zmin = parseFloat( ls[ 3 ] );

            }else if( line.startsWith( "delta" ) ){

                var ls = line.split( reWhitespace );

                if( deltaLineCount === 0 ){
                    header.hx = parseFloat( ls[ 1 ] );
                }else if( deltaLineCount === 1 ){
                    header.hy = parseFloat( ls[ 2 ] );
                }else if( deltaLineCount === 2 ){
                    header.hz = parseFloat( ls[ 3 ] );
                }

                deltaLineCount += 1;

            }else if( line.startsWith( "object 3" ) ){

                dataLineStart = i;
                headerByteCount += line.length + 1;
                break;

            }

            headerByteCount += line.length + 1;

        }

        this.volume.header = header;

        return {
            dataLineStart: dataLineStart,
            headerByteCount: headerByteCount
        }

    },

    getMatrix: function(){

        var h = this.volume.header;
        var matrix = new THREE.Matrix4();

        matrix.multiply(
            new THREE.Matrix4().makeRotationY( THREE.Math.degToRad( 90 ) )
        );

        matrix.multiply(
            new THREE.Matrix4().makeTranslation(
                -h.zmin, h.ymin, h.xmin
            )
        );

        matrix.multiply(
            new THREE.Matrix4().makeScale(
                -h.hz, h.hy, h.hx
            )
        );

        return matrix;

    }

} );


NGL.DxbinParser = function( streamer, params ){

    NGL.DxParser.call( this, streamer, params );

};

NGL.DxbinParser.prototype = NGL.createObject(

    NGL.DxParser.prototype, {

    constructor: NGL.DxbinParser,
    type: "dxbin",

    _parse: function( callback ){

        // https://github.com/Electrostatics/apbs-pdb2pqr/issues/216

        if( NGL.debug ) NGL.time( "NGL.DxbinParser._parse " + this.name );

        var bin = this.streamer.data;
        if( bin instanceof Uint8Array ){
            bin = bin.buffer;
        }

        var headerLines = NGL.Uint8ToLines( new Uint8Array( bin, 0, 1000 ) );
        var headerInfo = this.parseHeaderLines( headerLines );
        var header = this.volume.header;
        var headerByteCount = headerInfo.headerByteCount;

        var size = header.nx * header.ny * header.nz;
        var dv = new DataView( bin );
        var data = new Float32Array( size );

        for( var i = 0; i < size; ++i ){
            data[ i ] = dv.getFloat64( i * 8 + headerByteCount, true );
        }

        this.volume.setData( data, header.nz, header.ny, header.nx );

        if( NGL.debug ) NGL.timeEnd( "NGL.DxbinParser._parse " + this.name );

        callback();

    }

} );


///////////////////
// Surface parser

NGL.SurfaceParser = function( streamer, params ){

    var p = params || {};

    NGL.Parser.call( this, streamer, p );

    this.loader = undefined;
    this.surface = new NGL.Surface( this.name, this.path );

};

NGL.SurfaceParser.prototype = NGL.createObject(

    NGL.Parser.prototype, {

    constructor: NGL.SurfaceParser,
    type: "surface",

    __objName: "surface",

    _parse: function( callback ){

        var text = NGL.Uint8ToString( this.streamer.data );
        var geometry = this.loader.parse( text );

        this.surface.fromGeometry( geometry );

        callback();

    }

} );


NGL.PlyParser = function( streamer, params ){

    var p = params || {};

    NGL.SurfaceParser.call( this, streamer, p );

    this.loader = new THREE.PLYLoader();

};

NGL.PlyParser.prototype = NGL.createObject(

    NGL.SurfaceParser.prototype, {

    constructor: NGL.PlyParser,
    type: "ply"

} );


NGL.ObjParser = function( streamer, params ){

    var p = params || {};

    NGL.SurfaceParser.call( this, streamer, p );

    this.loader = new THREE.OBJLoader();

};

NGL.ObjParser.prototype = NGL.createObject(

    NGL.SurfaceParser.prototype, {

    constructor: NGL.ObjParser,
    type: "obj"

} );


////////////////
// Text parser

NGL.TextParser = function( streamer, params ){

    var p = params || {};

    NGL.Parser.call( this, streamer, p );

    this.text = {

        name: this.name,
        path: this.path,
        data: ""

    };

};

NGL.TextParser.prototype = NGL.createObject(

    NGL.Parser.prototype, {

    constructor: NGL.TextParser,
    type: "text",

    __objName: "text",

    _parse: function( callback ){

        this.text.data = this.streamer.asText();

        callback();

    }

} );


///////////////
// Csv parser

NGL.CsvParser = function( streamer, params ){

    var p = params || {};

    NGL.Parser.call( this, streamer, p );

    this.table = {

        name: this.name,
        path: this.path,
        colNames: [],
        data: []

    };

};

NGL.CsvParser.prototype = NGL.createObject(

    NGL.Parser.prototype, {

    constructor: NGL.CsvParser,
    type: "csv",

    __objName: "table",

    _parse: function( callback ){

        var data = this.table.data;
        var reDelimiter = /\s*,\s*/;

        this.streamer.eachChunkOfLines( function( chunk, chunkNo, chunkCount ){

            var n = chunk.length;

            for( var i = 0; i < n; ++i ){

                var line = chunk[ i ].trim();
                var values = line.split( reDelimiter );

                if( chunkNo === 0 && i === 0 ){

                    this.table.colNames = values;

                }else if( line ){

                    data.push( values );

                }

            }

        }.bind( this ) );

        callback();

    }

} );


////////////////
// Json parser

NGL.JsonParser = function( streamer, params ){

    var p = params || {};

    NGL.Parser.call( this, streamer, p );

    this.json = {

        name: this.name,
        path: this.path,
        data: {}

    };

};

NGL.JsonParser.prototype = NGL.createObject(

    NGL.Parser.prototype, {

    constructor: NGL.JsonParser,
    type: "json",

    __objName: "json",

    _parse: function( callback ){

        // FIXME set xhr.responseType in streamer to "json"
        this.json.data = JSON.parse( this.streamer.asText() );

        callback();

    }

} );


////////////////
// Xml parser

NGL.XmlParser = function( streamer, params ){

    var p = params || {};

    NGL.Parser.call( this, streamer, p );

    this.xml = {

        name: this.name,
        path: this.path,
        data: {}

    };

};

NGL.XmlParser.prototype = NGL.createObject(

    NGL.Parser.prototype, {

    constructor: NGL.XmlParser,
    type: "xml",

    __objName: "xml",

    _parse: function( callback ){

        // https://github.com/segmentio/xml-parser
        // MIT license

        function parse( xml ){

            xml = xml.trim();

            // strip comments
            xml = xml.replace( /<!--[\s\S]*?-->/g, '' );

            return document();

            function document(){
                return {
                    declaration: declaration(),
                    root: tag()
                }
            }

            function declaration(){
                var m = match(/^<\?xml\s*/);
                if (!m) return;
                // tag
                var node = {
                    attributes: {}
                };
                // attributes
                while (!(eos() || is('?>'))) {
                    var attr = attribute();
                    if (!attr) return node;
                    node.attributes[attr.name] = attr.value;
                }
                match(/\?>\s*/);
                return node;
            }

            function tag(){
                var m = match(/^<([\w-:.]+)\s*/);
                if (!m) return;
                // name
                var node = {
                    name: m[1],
                    attributes: {},
                    children: []
                };
                // attributes
                while (!(eos() || is('>') || is('?>') || is('/>'))) {
                    var attr = attribute();
                    if (!attr) return node;
                    node.attributes[attr.name] = attr.value;
                }
                // self closing tag
                if (match(/^\s*\/>\s*/)) {
                    return node;
                }
                match(/\??>\s*/);
                // content
                node.content = content();
                // children
                var child;
                while (child = tag()) {
                    node.children.push(child);
                }
                // closing
                match(/^<\/[\w-:.]+>\s*/);
                return node;
            }

            function content(){
                var m = match(/^([^<]*)/);
                if (m) return m[1];
                return '';
            }

            function attribute(){
                var m = match(/([\w:-]+)\s*=\s*("[^"]*"|'[^']*'|\w+)\s*/);
                if (!m) return;
                return { name: m[1], value: strip(m[2]) }
            }

            function strip( val ){
                return val.replace(/^['"]|['"]$/g, '');
            }

            function match( re ){
                var m = xml.match(re);
                if (!m) return;
                xml = xml.slice(m[0].length);
                return m;
            }

            function eos(){
                return 0 == xml.length;
            }

            function is( prefix ){
                return 0 == xml.indexOf(prefix);
            }

        }

        this.xml.data = parse( this.streamer.asText() );

        callback();

    }

} );
