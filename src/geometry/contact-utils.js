/**
 * @file Contact Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";

import { radToDeg } from "../math/math-utils.js";
import Contact from "./contact.js";
import Selection from "../selection.js";


function polarContacts( structure, maxDistance, maxAngle ){

    maxDistance = maxDistance || 3.5;
    maxAngle = maxAngle || 40;

    var donorSelection = new Selection(
        "( ARG and ( .NE or .NH1 or .NH2 ) ) or " +
        "( ASP and .ND2 ) or " +
        "( GLN and .NE2 ) or " +
        "( HIS and ( .ND1 or .NE2 ) ) or " +
        "( LYS and .NZ ) or " +
        "( SER and .OG ) or " +
        "( THR and .OG1 ) or " +
        "( TRP and .NE1 ) or " +
        "( TYR and .OH ) or " +
        "( PROTEIN and .N )"
    );

    var acceptorSelection = new Selection(
        "( ASN and .OD1 ) or " +
        "( ASP and ( OD1 or .OD2 ) ) or " +
        "( GLN and .OE1 ) or " +
        "( GLU and ( .OE1 or .OE2 ) ) or " +
        "( HIS and ( .ND1 or .NE2 ) ) or " +
        "( SER and .OG ) or " +
        "( THR and .OG1 ) or " +
        "( TYR and .OH ) or " +
        "( PROTEIN and .O )"
    );

    var donorView = structure.getView( donorSelection );
    var acceptorView = structure.getView( acceptorSelection );

    var contact = new Contact( donorView, acceptorView );
    var data = contact.within( maxDistance );
    var bondStore = data.bondStore;

    var ap1 = structure.getAtomProxy();
    var ap2 = structure.getAtomProxy();
    var atomCA = structure.getAtomProxy();
    var atomC = structure.getAtomProxy();
    var rp = structure.getResidueProxy();
    var rpPrev = structure.getResidueProxy();
    var v1 = new Vector3();
    var v2 = new Vector3();

    var checkAngle = function( atom1, atom2, oName, cName ){

        var atomO, atomN;

        if( atom1.atomname === oName ){
            atomO = atom1;
            atomN = atom2;
        }else{
            atomO = atom2;
            atomN = atom1;
        }

        rp.index = atomO.residueIndex;
        var atomC = rp.getAtomIndexByName( cName );

        v1.subVectors( atomC, atomO );
        v2.subVectors( atomC, atomN );

        return radToDeg( v1.angleTo( v2 ) ) < maxAngle;

    };

    for( var i = 0, il = bondStore.count; i < il; ++i ){

        ap1.index = bondStore.atomIndex1[ i ];
        ap2.index = bondStore.atomIndex2[ i ];

        if( ( ap1.atomname === "O" && ap2.atomname === "N" ) ||
            ( ap1.atomname === "N" && ap2.atomname === "O" )
        ){

            // ignore backbone to backbone contacts
            data.bondSet.flip_unsafe( i );
            continue;

        }else if( ap1.atomname === "N" || ap2.atomname === "N" ){

            var atomN, atomX;

            if( ap1.atomname === "N" ){
                atomN = ap1;
                atomX = ap2;
            }else{
                atomN = ap2;
                atomX = ap1;
            }

            rp.index = atomN.residueIndex;
            atomCA.index = rp.getAtomIndexByName( "CA" );
            if( atomCA.index === undefined ) continue;

            var prevRes = rp.getPreviousConnectedResidue( rpPrev );
            if( prevRes === undefined ) continue;

            atomC.index = prevRes.getAtomIndexByName( "C" );
            if( atomC.index === undefined ) continue;

            v1.subVectors( atomN, atomC );
            v2.subVectors( atomN, atomCA );
            v1.add( v2 ).multiplyScalar( 0.5 );
            v2.subVectors( atomX, atomN );

            if( radToDeg( v1.angleTo( v2 ) ) > maxAngle ){
                data.bondSet.flip_unsafe( i );
            }

        }else if(
            ( ap1.atomname === "OH" && ap1.resname === "TYR" ) ||
            ( ap2.atomname === "OH" && ap2.resname === "TYR" )
        ){

            if( !checkAngle( ap1, ap2, "OH", "CZ" ) ){
                data.bondSet.flip_unsafe( i );
            }

        }

    }

    return {
        atomSet: data.atomSet,
        bondSet: data.bondSet,
        bondStore: data.bondStore
    };

}


function polarBackboneContacts( structure, maxDistance, maxAngle ){

    maxDistance = maxDistance || 3.5;
    maxAngle = maxAngle || 40;

    var donorSelection = new Selection(
        "( PROTEIN and .N )"
    );

    var acceptorSelection = new Selection(
        "( PROTEIN and .O )"
    );

    var donorView = structure.getView( donorSelection );
    var acceptorView = structure.getView( acceptorSelection );

    var contact = new Contact( donorView, acceptorView );
    var data = contact.within( maxDistance );
    var bondStore = data.bondStore;

    var ap1 = structure.getAtomProxy();
    var ap2 = structure.getAtomProxy();
    var atomCA = structure.getAtomProxy();
    var atomC = structure.getAtomProxy();
    var rp = structure.getResidueProxy();
    var rpPrev = structure.getResidueProxy();
    var v1 = new Vector3();
    var v2 = new Vector3();

    for( var i = 0, il = bondStore.count; i < il; ++i ){

        ap1.index = bondStore.atomIndex1[ i ];
        ap2.index = bondStore.atomIndex2[ i ];

        var atomN, atomO;

        if( ap1.atomname === "N" ){
            atomN = ap1;
            atomO = ap2;
        }else{
            atomN = ap2;
            atomO = ap1;
        }

        rp.index = atomN.residueIndex;

        atomCA.index = rp.getAtomIndexByName( "CA" );
        if( atomCA.index === undefined ) continue;

        var prevRes = rp.getPreviousConnectedResidue( rpPrev );
        if( prevRes === undefined ) continue;

        atomC.index = prevRes.getAtomIndexByName( "C" );
        if( atomC.index === undefined ) continue;

        v1.subVectors( atomN, atomC );
        v2.subVectors( atomN, atomCA );
        v1.add( v2 ).multiplyScalar( 0.5 );
        v2.subVectors( atomO, atomN );

        // Log.log( radToDeg( v1.angleTo( v2 ) ) );

        if( radToDeg( v1.angleTo( v2 ) ) > maxAngle ){
            data.bondSet.flip_unsafe( i );
        }

    }

    return {
        atomSet: data.atomSet,
        bondSet: data.bondSet,
        bondStore: data.bondStore
    };

}


export {
	polarContacts,
	polarBackboneContacts
};
