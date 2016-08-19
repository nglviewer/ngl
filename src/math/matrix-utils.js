/**
 * @file Matrix Utils
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * svd methods from Eugene Zatepyakin / http://inspirit.github.io/jsfeat/
 */


import { Vector3 } from "../../lib/three.es6.js";
import { v3new, v3cross } from "./vector-utils.js";


function Matrix( columns, rows ){

    this.cols = columns;
    this.rows = rows;
    this.size = this.cols * this.rows;

    this.data = new Float32Array( this.size );

}

Matrix.prototype = {

    copyTo: function( matrix ){
        matrix.data.set( this.data );
    }

};


function transpose( At, A ){
    var i=0,j=0,nrows=A.rows,ncols=A.cols;
    var Ai=0,Ati=0,pAt=0;
    var ad=A.data,atd=At.data;

    for (; i < nrows; Ati += 1, Ai += ncols, i++) {
        pAt = Ati;
        for (j = 0; j < ncols; pAt += nrows, j++) atd[pAt] = ad[Ai+j];
    }
}


// C = A * B
function multiply( C, A, B ){
    var i=0,j=0,k=0;
    var Ap=0,pA=0,pB=0,p_B=0,Cp=0;
    var ncols=A.cols,nrows=A.rows,mcols=B.cols;
    var ad=A.data,bd=B.data,cd=C.data;
    var sum=0.0;

    for (; i < nrows; Ap += ncols, i++) {
        for (p_B = 0, j = 0; j < mcols; Cp++, p_B++, j++) {
            pB = p_B;
            pA = Ap;
            sum = 0.0;
            for (k = 0; k < ncols; pA++, pB += mcols, k++) {
                sum += ad[pA] * bd[pB];
            }
            cd[Cp] = sum;
        }
    }
}


// C = A * B'
function multiply_ABt( C, A, B ){
    var i=0,j=0,k=0;
    var Ap=0,pA=0,pB=0,Cp=0;
    var ncols=A.cols,nrows=A.rows,mrows=B.rows;
    var ad=A.data,bd=B.data,cd=C.data;
    var sum=0.0;

    for (; i < nrows; Ap += ncols, i++) {
        for (pB = 0, j = 0; j < mrows; Cp++, j++) {
            pA = Ap;
            sum = 0.0;
            for (k = 0; k < ncols; pA++, pB++, k++) {
                sum += ad[pA] * bd[pB];
            }
            cd[Cp] = sum;
        }
    }
}


// C = A' * B
function multiply_AtB( C, A, B ){
    var i=0,j=0,k=0;
    var Ap=0,pA=0,pB=0,p_B=0,Cp=0;
    var ncols=A.cols,nrows=A.rows,mcols=B.cols;
    var ad=A.data,bd=B.data,cd=C.data;
    var sum=0.0;

    for (; i < ncols; Ap++, i++) {
        for (p_B = 0, j = 0; j < mcols; Cp++, p_B++, j++) {
            pB = p_B;
            pA = Ap;
            sum = 0.0;
            for (k = 0; k < nrows; pA += ncols, pB += mcols, k++) {
                sum += ad[pA] * bd[pB];
            }
            cd[Cp] = sum;
        }
    }
}


function invert_3x3( from, to ){
    var A = from.data, invA = to.data;
    var t1 = A[4];
    var t2 = A[8];
    var t4 = A[5];
    var t5 = A[7];
    var t8 = A[0];

    var t9 = t8*t1;
    var t11 = t8*t4;
    var t13 = A[3];
    var t14 = A[1];
    var t15 = t13*t14;
    var t17 = A[2];
    var t18 = t13*t17;
    var t20 = A[6];
    var t21 = t20*t14;
    var t23 = t20*t17;
    var t26 = 1.0/(t9*t2-t11*t5-t15*t2+t18*t5+t21*t4-t23*t1);
    invA[0] = (t1*t2-t4*t5)*t26;
    invA[1] = -(t14*t2-t17*t5)*t26;
    invA[2] = -(-t14*t4+t17*t1)*t26;
    invA[3] = -(t13*t2-t4*t20)*t26;
    invA[4] = (t8*t2-t23)*t26;
    invA[5] = -(t11-t18)*t26;
    invA[6] = -(-t13*t5+t1*t20)*t26;
    invA[7] = -(t8*t5-t21)*t26;
    invA[8] = (t9-t15)*t26;
}


function mat3x3_determinant( M ){
    var md=M.data;
    return  md[0] * md[4] * md[8] -
            md[0] * md[5] * md[7] -
            md[3] * md[1] * md[8] +
            md[3] * md[2] * md[7] +
            md[6] * md[1] * md[5] -
            md[6] * md[2] * md[4];
}


// C = A * B
function multiply_3x3( C, A, B ){
    var Cd=C.data, Ad=A.data, Bd=B.data;
    var m1_0 = Ad[0], m1_1 = Ad[1], m1_2 = Ad[2];
    var m1_3 = Ad[3], m1_4 = Ad[4], m1_5 = Ad[5];
    var m1_6 = Ad[6], m1_7 = Ad[7], m1_8 = Ad[8];

    var m2_0 = Bd[0], m2_1 = Bd[1], m2_2 = Bd[2];
    var m2_3 = Bd[3], m2_4 = Bd[4], m2_5 = Bd[5];
    var m2_6 = Bd[6], m2_7 = Bd[7], m2_8 = Bd[8];

    Cd[0] = m1_0 * m2_0 + m1_1 * m2_3 + m1_2 * m2_6;
    Cd[1] = m1_0 * m2_1 + m1_1 * m2_4 + m1_2 * m2_7;
    Cd[2] = m1_0 * m2_2 + m1_1 * m2_5 + m1_2 * m2_8;
    Cd[3] = m1_3 * m2_0 + m1_4 * m2_3 + m1_5 * m2_6;
    Cd[4] = m1_3 * m2_1 + m1_4 * m2_4 + m1_5 * m2_7;
    Cd[5] = m1_3 * m2_2 + m1_4 * m2_5 + m1_5 * m2_8;
    Cd[6] = m1_6 * m2_0 + m1_7 * m2_3 + m1_8 * m2_6;
    Cd[7] = m1_6 * m2_1 + m1_7 * m2_4 + m1_8 * m2_7;
    Cd[8] = m1_6 * m2_2 + m1_7 * m2_5 + m1_8 * m2_8;
}


function mean_rows( A ){
    var i, j;
    var p = 0;
    var nrows = A.rows;
    var ncols = A.cols;
    var Ad = A.data;
    var mean = new Array( ncols );

    for( j = 0; j < ncols; ++j ){
        mean[ j ] = 0.0;
    }

    for( i = 0; i < nrows; ++i ){
        for( j = 0; j < ncols; ++j, ++p ){
            mean[ j ] += Ad[ p ];
        }
    }

    for( j = 0; j < ncols; ++j ){
        mean[ j ] /= nrows;
    }

    return mean;
}


function mean_cols( A ){
    var i, j;
    var p = 0;
    var nrows = A.rows;
    var ncols = A.cols;
    var Ad = A.data;
    var mean = new Array( nrows );

    for( j = 0; j < nrows; ++j ){
        mean[ j ] = 0.0;
    }

    for( i = 0; i < ncols; ++i ){
        for( j = 0; j < nrows; ++j, ++p ){
            mean[ j ] += Ad[ p ];
        }
    }

    for( j = 0; j < nrows; ++j ){
        mean[ j ] /= ncols;
    }

    return mean;
}


function sub_rows( A, row ){
    var i, j;
    var p = 0;
    var nrows = A.rows;
    var ncols = A.cols;
    var Ad = A.data;

    for( i = 0; i < nrows; ++i ){
        for( j = 0; j < ncols; ++j, ++p ){
            Ad[ p ] -= row[ j ];
        }
    }
}


function sub_cols( A, col ){
    var i, j;
    var p = 0;
    var nrows = A.rows;
    var ncols = A.cols;
    var Ad = A.data;

    for( i = 0; i < ncols; ++i ){
        for( j = 0; j < nrows; ++j, ++p ){
            Ad[ p ] -= col[ j ];
        }
    }
}


function add_rows( A, row ){
    var i, j;
    var p = 0;
    var nrows = A.rows;
    var ncols = A.cols;
    var Ad = A.data;

    for( i = 0; i < nrows; ++i ){
        for( j = 0; j < ncols; ++j, ++p ){
            Ad[ p ] += row[ j ];
        }
    }
}


function add_cols( A, col ){
    var i, j;
    var p = 0;
    var nrows = A.rows;
    var ncols = A.cols;
    var Ad = A.data;

    for( i = 0; i < ncols; ++i ){
        for( j = 0; j < nrows; ++j, ++p ){
            Ad[ p ] += col[ j ];
        }
    }
}


function swap( A, i0, i1, t ){
    t = A[i0];
    A[i0] = A[i1];
    A[i1] = t;
}


function hypot( a, b ){
    a = Math.abs(a);
    b = Math.abs(b);
    if( a > b ) {
        b /= a;
        return a*Math.sqrt(1.0 + b*b);
    }
    if( b > 0 ) {
        a /= b;
        return b*Math.sqrt(1.0 + a*a);
    }
    return 0.0;
}


var EPSILON = 0.0000001192092896;
var FLT_MIN = 1E-37;


function JacobiSVDImpl( At, astep, _W, Vt, vstep, m, n, n1 ){
    var eps = EPSILON * 2.0;
    var minval = FLT_MIN;
    var i=0,j=0,k=0,iter=0,max_iter=Math.max(m, 30);
    var Ai=0,Aj=0,Vi=0,Vj=0,changed=0;
    var c=0.0, s=0.0, t=0.0;
    var t0=0.0,t1=0.0,sd=0.0,beta=0.0,gamma=0.0,delta=0.0,a=0.0,p=0.0,b=0.0;
    var seed = 0x1234;
    var val=0.0,val0=0.0,asum=0.0;

    var W = new Float64Array( n<<3 );

    for(; i < n; i++) {
        for(k = 0, sd = 0; k < m; k++) {
            t = At[i*astep + k];
            sd += t*t;
        }
        W[i] = sd;

        if(Vt) {
            for(k = 0; k < n; k++) {
                Vt[i*vstep + k] = 0;
            }
            Vt[i*vstep + i] = 1;
        }
    }

    for(; iter < max_iter; iter++) {
        changed = 0;

        for(i = 0; i < n-1; i++) {
            for(j = i+1; j < n; j++) {
                Ai = (i*astep)|0;
                Aj = (j*astep)|0;
                a = W[i];
                p = 0;
                b = W[j];

                k = 2;
                p += At[Ai]*At[Aj];
                p += At[Ai+1]*At[Aj+1];

                for(; k < m; k++)
                    p += At[Ai+k]*At[Aj+k];

                if(Math.abs(p) <= eps*Math.sqrt(a*b)) continue;

                p *= 2.0;
                beta = a - b;
                gamma = hypot(p, beta);
                if( beta < 0 ) {
                    delta = (gamma - beta)*0.5;
                    s = Math.sqrt(delta/gamma);
                    c = (p/(gamma*s*2.0));
                } else {
                    c = Math.sqrt((gamma + beta)/(gamma*2.0));
                    s = (p/(gamma*c*2.0));
                }

                a=0.0;
                b=0.0;

                k = 2; // unroll
                t0 = c*At[Ai] + s*At[Aj];
                t1 = -s*At[Ai] + c*At[Aj];
                At[Ai] = t0; At[Aj] = t1;
                a += t0*t0; b += t1*t1;

                t0 = c*At[Ai+1] + s*At[Aj+1];
                t1 = -s*At[Ai+1] + c*At[Aj+1];
                At[Ai+1] = t0; At[Aj+1] = t1;
                a += t0*t0; b += t1*t1;

                for( ; k < m; k++ )
                {
                    t0 = c*At[Ai+k] + s*At[Aj+k];
                    t1 = -s*At[Ai+k] + c*At[Aj+k];
                    At[Ai+k] = t0; At[Aj+k] = t1;

                    a += t0*t0; b += t1*t1;
                }

                W[i] = a;
                W[j] = b;

                changed = 1;

                if(Vt) {
                    Vi = (i*vstep)|0;
                    Vj = (j*vstep)|0;

                    k = 2;
                    t0 = c*Vt[Vi] + s*Vt[Vj];
                    t1 = -s*Vt[Vi] + c*Vt[Vj];
                    Vt[Vi] = t0; Vt[Vj] = t1;

                    t0 = c*Vt[Vi+1] + s*Vt[Vj+1];
                    t1 = -s*Vt[Vi+1] + c*Vt[Vj+1];
                    Vt[Vi+1] = t0; Vt[Vj+1] = t1;

                    for(; k < n; k++) {
                        t0 = c*Vt[Vi+k] + s*Vt[Vj+k];
                        t1 = -s*Vt[Vi+k] + c*Vt[Vj+k];
                        Vt[Vi+k] = t0; Vt[Vj+k] = t1;
                    }
                }
            }
        }
        if(changed === 0) break;
    }

    for(i = 0; i < n; i++) {
        for(k = 0, sd = 0; k < m; k++) {
            t = At[i*astep + k];
            sd += t*t;
        }
        W[i] = Math.sqrt(sd);
    }

    for(i = 0; i < n-1; i++) {
        j = i;
        for(k = i+1; k < n; k++) {
            if(W[j] < W[k])
                j = k;
        }
        if(i != j) {
            swap(W, i, j, sd);
            if(Vt) {
                for(k = 0; k < m; k++) {
                    swap(At, i*astep + k, j*astep + k, t);
                }

                for(k = 0; k < n; k++) {
                    swap(Vt, i*vstep + k, j*vstep + k, t);
                }
            }
        }
    }

    for(i = 0; i < n; i++) {
        _W[i] = W[i];
    }

    if(!Vt) {
        return;
    }

    for(i = 0; i < n1; i++) {

        sd = i < n ? W[i] : 0;

        while(sd <= minval) {
            // if we got a zero singular value, then in order to get the corresponding left singular vector
            // we generate a random vector, project it to the previously computed left singular vectors,
            // subtract the projection and normalize the difference.
            val0 = (1.0/m);
            for(k = 0; k < m; k++) {
                seed = (seed * 214013 + 2531011);
                val = (((seed >> 16) & 0x7fff) & 256) !== 0 ? val0 : -val0;
                At[i*astep + k] = val;
            }
            for(iter = 0; iter < 2; iter++) {
                for(j = 0; j < i; j++) {
                    sd = 0;
                    for(k = 0; k < m; k++) {
                        sd += At[i*astep + k]*At[j*astep + k];
                    }
                    asum = 0.0;
                    for(k = 0; k < m; k++) {
                        t = (At[i*astep + k] - sd*At[j*astep + k]);
                        At[i*astep + k] = t;
                        asum += Math.abs(t);
                    }
                    asum = asum ? 1.0/asum : 0;
                    for(k = 0; k < m; k++) {
                        At[i*astep + k] *= asum;
                    }
                }
            }
            sd = 0;
            for(k = 0; k < m; k++) {
                t = At[i*astep + k];
                sd += t*t;
            }
            sd = Math.sqrt(sd);
        }

        s = (1.0/sd);
        for(k = 0; k < m; k++) {
            At[i*astep + k] *= s;
        }
    }
}


function svd( A, W, U, V ){
    var at=0,i=0,_m=A.rows,_n=A.cols,m=_m,n=_n;

    if(m < n) {
        at = 1;
        i = m;
        m = n;
        n = i;
    }

    var a_mt = new Matrix( m, m );
    var w_mt = new Matrix( 1, n );
    var v_mt = new Matrix( n, n );

    if(at === 0) {
        transpose(a_mt, A);
    } else {
        for(i = 0; i < _n*_m; i++) {
            a_mt.data[i] = A.data[i];
        }
        for(; i < n*m; i++) {
            a_mt.data[i] = 0;
        }
    }

    JacobiSVDImpl( a_mt.data, m, w_mt.data, v_mt.data, n, m, n, m );

    if(W) {
        for(i=0; i < n; i++) {
            W.data[i] = w_mt.data[i];
        }
        for(; i < _n; i++) {
            W.data[i] = 0;
        }
    }

    if (at === 0) {
        if( U ) transpose(U, a_mt);
        if( V ) transpose(V, v_mt);
    } else {
        if( U ) transpose(U, v_mt);
        if( V ) transpose(V, a_mt);
    }
}


function principalAxes( points ){

    // console.time( "principalAxes" );

    var n = points.rows;
    var pointsT = new Matrix( n, 3 );
    var A = new Matrix( 3, 3 );
    var W = new Matrix( 1, 3 );
    var U = new Matrix( 3, 3 );
    var V = new Matrix( 3, 3 );

    var mean = mean_rows( points );
    sub_rows( points, mean );
    transpose( pointsT, points );
    multiply_ABt( A, pointsT, pointsT );
    svd( A, W, U, V );

    // console.log( points, pointsT, mean )
    // console.log( n, A, W, U, V );

    var vm = new Vector3( mean[0], mean[1], mean[2] );
    var va = new Vector3( U.data[0], U.data[3], U.data[6] );
    var vb = new Vector3( U.data[1], U.data[4], U.data[7] );
    var vc = new Vector3( U.data[2], U.data[5], U.data[8] );

    va.multiplyScalar( Math.sqrt( W.data[0] / ( n / 3 ) ) );
    vb.multiplyScalar( Math.sqrt( W.data[1] / ( n / 3 ) ) );
    vc.multiplyScalar( Math.sqrt( W.data[2] / ( n / 3 ) ) );

    var begA = new Vector3().copy( vm ).sub( va );
    var endA = new Vector3().copy( vm ).add( va );
    var begB = new Vector3().copy( vm ).sub( vb );
    var endB = new Vector3().copy( vm ).add( vb );
    var begC = new Vector3().copy( vm ).sub( vc );
    var endC = new Vector3().copy( vm ).add( vc );

    // console.timeEnd( "principalAxes" );

    return [ [ begA, endA ], [ begB, endB ], [ begC, endC ], vm ];
}

//

function m4new(){
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

function m4set( out, n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ){
    out[ 0 ] = n11; out[ 4 ] = n12; out[ 8 ] = n13; out[ 12 ] = n14;
    out[ 1 ] = n21; out[ 5 ] = n22; out[ 9 ] = n23; out[ 13 ] = n24;
    out[ 2 ] = n31; out[ 6 ] = n32; out[ 10 ] = n33; out[ 14 ] = n34;
    out[ 3 ] = n41; out[ 7 ] = n42; out[ 11 ] = n43; out[ 15 ] = n44;
}

function m4identity( out ){
    m4set( out,
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}
m4identity.__deps = [ m4set ];

function m4multiply( out, a, b ){
    var a11 = a[ 0 ], a12 = a[ 4 ], a13 = a[ 8 ], a14 = a[ 12 ];
    var a21 = a[ 1 ], a22 = a[ 5 ], a23 = a[ 9 ], a24 = a[ 13 ];
    var a31 = a[ 2 ], a32 = a[ 6 ], a33 = a[ 10 ], a34 = a[ 14 ];
    var a41 = a[ 3 ], a42 = a[ 7 ], a43 = a[ 11 ], a44 = a[ 15 ];

    var b11 = b[ 0 ], b12 = b[ 4 ], b13 = b[ 8 ], b14 = b[ 12 ];
    var b21 = b[ 1 ], b22 = b[ 5 ], b23 = b[ 9 ], b24 = b[ 13 ];
    var b31 = b[ 2 ], b32 = b[ 6 ], b33 = b[ 10 ], b34 = b[ 14 ];
    var b41 = b[ 3 ], b42 = b[ 7 ], b43 = b[ 11 ], b44 = b[ 15 ];

    out[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    out[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    out[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    out[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    out[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    out[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    out[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    out[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    out[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    out[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    out[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    out[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    out[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    out[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    out[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    out[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
}

function m4makeScale( out, x, y, z ){
    m4set( out,
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    );
}
m4makeScale.__deps = [ m4set ];

function m4makeTranslation( out, x, y, z ){
    m4set( out,
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
    );
}
m4makeTranslation.__deps = [ m4set ];

function m4makeRotationY( out, theta ){
    var c = Math.cos( theta ), s = Math.sin( theta );
    m4set( out,
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    );
}
m4makeRotationY.__deps = [ m4set ];

//

function m3new(){
    return new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]);
}

function m3makeNormal( out, m4 ){
    var r0 = v3new([ m4[0], m4[1], m4[2] ]);
    var r1 = v3new([ m4[4], m4[5], m4[6] ]);
    var r2 = v3new([ m4[8], m4[9], m4[10] ]);
    var cp = v3new();
    //        [ r0 ]       [ r1 x r2 ]
    // M3x3 = [ r1 ]   N = [ r2 x r0 ]
    //        [ r2 ]       [ r0 x r1 ]
    v3cross( cp, r1, r2 );
    out[ 0 ] = cp[ 0 ];
    out[ 1 ] = cp[ 1 ];
    out[ 2 ] = cp[ 2 ];
    v3cross( cp, r2, r0 );
    out[ 3 ] = cp[ 0 ];
    out[ 4 ] = cp[ 1 ];
    out[ 5 ] = cp[ 2 ];
    v3cross( cp, r0, r1 );
    out[ 6 ] = cp[ 0 ];
    out[ 7 ] = cp[ 1 ];
    out[ 8 ] = cp[ 2 ];
}
m3makeNormal.__deps = [ v3new, v3cross ];


export {
    Matrix,
    svd,
    principalAxes,
    mean_rows,
    mean_cols,
    sub_rows,
    sub_cols,
    add_rows,
    add_cols,
    transpose,
    multiply,
    multiply_ABt,
    multiply_AtB,
    invert_3x3,
    multiply_3x3,
    mat3x3_determinant,

    m4new,
    m4identity,
    m4multiply,
    m4makeScale,
    m4makeTranslation,
    m4makeRotationY,

    m3new,
    m3makeNormal
};
