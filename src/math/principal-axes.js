/**
 * @file Principal Axes
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Matrix4, Quaternion } from "../../lib/three.es6.js";

import {
    Matrix, mean_rows, sub_rows, transpose, multiply_ABt, svd
} from "./matrix-utils.js";
import { projectPointOnVector } from "./vector-utils.js";


const negateVector = new Vector3( -1, -1, -1 );
const tmpMatrix = new Matrix4();


class PrincipalAxes {

    constructor( points ){

        // console.time( "PrincipalAxes" );

        const n = points.rows;
        const n3 = n / 3;
        const pointsT = new Matrix( n, 3 );
        const A = new Matrix( 3, 3 );
        const W = new Matrix( 1, 3 );
        const U = new Matrix( 3, 3 );
        const V = new Matrix( 3, 3 );

        // calculate
        const mean = mean_rows( points );
        sub_rows( points, mean );
        transpose( pointsT, points );
        multiply_ABt( A, pointsT, pointsT );
        svd( A, W, U, V );

        // console.log( points, pointsT, mean )
        // console.log( n, A, W, U, V );

        // center
        const vm = new Vector3( mean[0], mean[1], mean[2] );

        // normalized
        const van = new Vector3( U.data[0], U.data[3], U.data[6] );
        const vbn = new Vector3( U.data[1], U.data[4], U.data[7] );
        const vcn = new Vector3( U.data[2], U.data[5], U.data[8] );

        // scaled
        const va = van.clone().multiplyScalar( Math.sqrt( W.data[0] / n3 ) );
        const vb = vbn.clone().multiplyScalar( Math.sqrt( W.data[1] / n3 ) );
        const vc = vcn.clone().multiplyScalar( Math.sqrt( W.data[2] / n3 ) );

        // points
        this.begA = vm.clone().sub( va );
        this.endA = vm.clone().add( va );
        this.begB = vm.clone().sub( vb );
        this.endB = vm.clone().add( vb );
        this.begC = vm.clone().sub( vc );
        this.endC = vm.clone().add( vc );

        //

        this.center = vm;

        this.vecA = va;
        this.vecB = vb;
        this.vecC = vc;

        this.normVecA = van;
        this.normVecB = vbn;
        this.normVecC = vcn;

        // console.timeEnd( "PrincipalAxes" );

    }

    getBasisMatrix( optionalTarget ){

        const basis = optionalTarget || new Matrix4();

        basis.makeBasis( this.normVecB, this.normVecA, this.normVecC );
        if( basis.determinant() < 0 ){
            basis.scale( negateVector );
        }

        return basis;

    }

    getRotationQuaternion( optionalTarget ){

        const q = optionalTarget || new Quaternion();
        q.setFromRotationMatrix( this.getBasisMatrix( tmpMatrix ) );

        return q.inverse();

    }

    getProjectedScaleForAtoms( structure ){

        let d1a = -Infinity;
        let d1b = -Infinity;
        let d2a = -Infinity;
        let d2b = -Infinity;
        let d3a = -Infinity;
        let d3b = -Infinity;

        const p = new Vector3();
        const t = new Vector3();

        const center = this.center;
        const ax1 = this.normVecA;
        const ax2 = this.normVecB;
        const ax3 = this.normVecC;

        structure.eachAtom( function( ap ){

            projectPointOnVector( p.copy( ap ), ax1, center );
            const dp1 = t.subVectors( p, center ).normalize().dot( ax1 );
            const dt1 = p.distanceTo( center );
            if( dp1 > 0 ){
                if( dt1 > d1a ) d1a = dt1;
            }else{
                if( dt1 > d1b ) d1b = dt1;
            }

            projectPointOnVector( p.copy( ap ), ax2, center );
            const dp2 = t.subVectors( p, center ).normalize().dot( ax2 );
            const dt2 = p.distanceTo( center );
            if( dp2 > 0 ){
                if( dt2 > d2a ) d2a = dt2;
            }else{
                if( dt2 > d2b ) d2b = dt2;
            }

            projectPointOnVector( p.copy( ap ), ax3, center );
            const dp3 = t.subVectors( p, center ).normalize().dot( ax3 );
            const dt3 = p.distanceTo( center );
            if( dp3 > 0 ){
                if( dt3 > d3a ) d3a = dt3;
            }else{
                if( dt3 > d3b ) d3b = dt3;
            }

        } );

        return {
            d1a: d1a, d2a: d2a, d3a: d3a,
            d1b: -d1b, d2b: -d2b, d3b: -d3b
        };

    }

}


export default PrincipalAxes;
