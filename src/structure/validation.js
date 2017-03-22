/**
 * @file Validation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Color } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import { uniformArray3 } from "../math/array-utils.js";
import { guessElement } from "../structure/structure-utils.js";
import Selection from "../selection.js";


function getSele( a, atomname, useAltcode ){
    const icode = a.icode.value;
    const chain = a.chain.value;
    const altcode = a.altcode.value;
    let sele = a.resnum.value;
    if( icode.trim() ) sele += "^" + icode;
    if( chain.trim() ) sele += ":" + chain;
    if( atomname ) sele += "." + atomname;
    if( useAltcode && altcode.trim() ) sele += "%" + altcode;
    sele += "/" + ( parseInt( a.model.value ) - 1 );
    return sele;
}

function setBitDict( dict, key, bit ){
    if( dict[ key ] === undefined ){
        dict[ key ] = bit;
    }else{
        dict[ key ] |= bit;
    }
}

function hasAttrValue( attr, value ){
    return attr !== undefined && attr.value === value;
}


class Validation{

    constructor( name, path ){

        this.name = name;
        this.path = path;

        this.rsrzDict = {};
        this.rsccDict = {};
        this.clashDict = {};
        this.geoDict = {};
        this.geoAtomDict = {};
        this.clashSele = "NONE";

    }

    fromXml( xml ){

        const rsrzDict = this.rsrzDict;
        const rsccDict = this.rsccDict;
        const clashDict = this.clashDict;
        const geoDict = this.geoDict;
        const geoAtomDict = this.geoAtomDict;

        const groups = xml.getElementsByTagName( "ModelledSubgroup" );

        let i, il, j, jl;

        for( i = 0, il = groups.length; i < il; ++i ){

            const g = groups[ i ];
            const ga = g.attributes;

            const sele = getSele( ga );

            const clashes = g.getElementsByTagName( "clash" );

            for( j = 0, jl = clashes.length; j < jl; ++j ){

                const ca = clashes[ j ].attributes;
                const cid = parseInt( ca.cid.value );

                if( clashDict[ cid ] === undefined ){
                    clashDict[ cid ] = {
                        mag: parseFloat( ca.clashmag.value ),
                        dist: parseFloat( ca.dist.value ),
                        sele1: getSele( ga, ca.atom.value, true ),
                        atom1: ca.atom.value,
                        res1: sele
                    };
                }else{
                    clashDict[ cid ].sele2 = getSele( ga, ca.atom.value, true );
                    clashDict[ cid ].atom2 = ca.atom.value;
                    clashDict[ cid ].res2 = sele;
                }

            }

        }

        for( i = 0, il = groups.length; i < il; ++i ){

            const g = groups[ i ];
            const ga = g.attributes;

            const sele = getSele( ga );
            if( ga.rsrz !== undefined ){
                rsrzDict[ sele ] = parseFloat( ga.rsrz.value );
            }
            if( ga.rscc !== undefined ){
                rsccDict[ sele ] = parseFloat( ga.rscc.value );
            }

            const isPolymer = ga.seq.value !== ".";
            const clashAtoms = [];
            let geoProblemCount = 0;

            const clashes = g.getElementsByTagName( "clash" );

            for( j = 0, jl = clashes.length; j < jl; ++j ){

                const ca = clashes[ j ].attributes;
                const cid = parseInt( ca.cid.value );

                if( clashDict[ cid ] !== undefined ){
                    const c = clashDict[ cid ];
                    if( c.res1 === c.res2 ||
                        c.atom1 === undefined ||
                        c.atom2 === undefined ||
                        guessElement( c.atom1 ) === "H" ||
                        guessElement( c.atom2 ) === "H"
                    ){
                        delete clashDict[ cid ];
                    }else{
                        clashAtoms.push( ca.atom.value );
                    }
                }

            }

            if( isPolymer ){

                if( clashAtoms.length > 0 ){
                    geoProblemCount += 1;
                }

                const angleOutliers = g.getElementsByTagName( "angle-outlier" );
                if( angleOutliers.length > 0 ){
                    geoProblemCount += 1;
                }

                const bondOutliers = g.getElementsByTagName( "bond-outlier" );
                if( bondOutliers.length > 0 ){
                    geoProblemCount += 1;
                }

                const planeOutliers = g.getElementsByTagName( "plane-outlier" );
                if( planeOutliers.length > 0 ){
                    geoProblemCount += 1;
                }

                if( hasAttrValue( ga.rota, "OUTLIER" ) ){
                    geoProblemCount += 1;
                }

                if( hasAttrValue( ga.rota, "OUTLIER" ) ){
                    geoProblemCount += 1;
                }

                if( hasAttrValue( ga.RNApucker, "outlier" ) ){
                    geoProblemCount += 1;
                }

                if( geoProblemCount > 0 ){
                    geoDict[ sele ] = geoProblemCount;
                }

            }else{

                const mogBondOutliers = g.getElementsByTagName( "mog-bond-outlier" );
                const mogAngleOutliers = g.getElementsByTagName( "mog-angle-outlier" );

                if( mogBondOutliers.length > 0 || mogAngleOutliers.length > 0 || clashes.length > 0 ){

                    const atomDict = {};
                    geoAtomDict[ sele ] = atomDict;

                    for( j = 0, jl = clashAtoms.length; j < jl; ++j ){
                        setBitDict( atomDict, clashAtoms[ j ], 1 );
                    }

                    for( j = 0, jl = mogBondOutliers.length; j < jl; ++j ){
                        const mbo = mogBondOutliers[ j ].attributes;
                        mbo.atoms.value.split( "," ).forEach( function( atomname ){
                            setBitDict( atomDict, atomname, 2 );
                        } );
                    }

                    for( j = 0, jl = mogAngleOutliers.length; j < jl; ++j ){
                        const mao = mogAngleOutliers[ j ].attributes;
                        mao.atoms.value.split( "," ).forEach( function( atomname ){
                            setBitDict( atomDict, atomname, 4 );
                        } );
                    }

                }

            }

        }

        const clashList = [];
        for( let k in clashDict ){
            const c = clashDict[ k ];
            clashList.push( c.res1, c.res2 );
        }

        this.clashSele = clashList.length ? clashList.join( " OR " ) : "NONE";

    }

    getClashData( params ){

        const p = params || {};

        const s = p.structure;
        const c = new Color( defaults( p.color, "#f0027f" ) );

        const ap1 = s.getAtomProxy();
        const ap2 = s.getAtomProxy();
        const vDir = new Vector3();
        const vPos1 = new Vector3();
        const vPos2 = new Vector3();

        const clashDict = this.clashDict;
        const n = Object.keys( clashDict ).length;

        const position1 = new Float32Array( n * 3 );
        const position2 = new Float32Array( n * 3 );
        const color = uniformArray3( n, c.r, c.g, c.b );
        const radius = new Float32Array( n );

        let i = 0;

        for( let k in clashDict ){

            const c = clashDict[ k ];
            ap1.index = s.getAtomIndices( new Selection( c.sele1 ) )[ 0 ];
            ap2.index = s.getAtomIndices( new Selection( c.sele2 ) )[ 0 ];

            if( ap1.index === undefined || ap2.index === undefined ) continue;

            vDir.subVectors( ap2, ap1 ).setLength( ap1.vdw );
            vPos1.copy( ap1 ).add( vDir );

            vDir.subVectors( ap1, ap2 ).setLength( ap2.vdw );
            vPos2.copy( ap2 ).add( vDir );

            const dHalf = ap1.distanceTo( ap2 ) / 2;
            const r1 = Math.sqrt( ap1.vdw * ap1.vdw - dHalf * dHalf );
            const r2 = Math.sqrt( ap2.vdw * ap2.vdw - dHalf * dHalf );

            vPos1.toArray( position1, i * 3 );
            vPos2.toArray( position2, i * 3 );
            radius[ i ] = ( r1 + r2 ) / 2;

            ++i;

        }

        return {
            position1: position1,
            position2: position2,
            color: color,
            color2: color,
            radius: radius
        };

    }

}


export default Validation;
