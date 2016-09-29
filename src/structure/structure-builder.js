/**
 * @file Structure Builder
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function StructureBuilder( structure ){

    var currentModelindex = null;
    var currentChainid = null;
    var currentResname = null;
    var currentResno = null;
    var currentInscode = null;
    var currentHetero = null;

    var previousResname;
    var previousHetero;

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

    this.addAtom = function( modelindex, chainname, chainid, resname, resno, hetero, sstruc, inscode ){

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
        }else if( currentChainid !== chainid ){
            addChain = true;
            addResidue = true;
            ci += 1;
            ri += 1;
        }else if( currentResno !== resno || currentResname !== resname || currentInscode !== inscode ){
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
            chainStore.setChainid( ci, chainid );
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
            if( inscode !== undefined ){
                residueStore.inscode[ ri ] = inscode.charCodeAt( 0 );
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
        currentChainid = chainid;
        currentResname = resname;
        currentResno = resno;
        currentInscode = inscode;
        currentHetero = hetero;

    };

    this.finalize = function(){
        previousResname = currentResname;
        previousHetero = currentHetero;
        if( ri > -1 ) addResidueType( ri );
    };

}


export default StructureBuilder;
