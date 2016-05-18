/**
 * @file EDT Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Debug, Log } from "../globals.js";
import Selection from "../selection.js";
import Volume from "./volume.js";
import Grid from "../geometry/grid.js";


function getSurfaceGrid( bbox, maxRadius, scaleFactor, extraMargin ){

    // need margin to avoid boundary/round off effects
    var margin = ( 1 / scaleFactor ) * 3;
    margin += maxRadius;

    var min = new THREE.Vector3().copy( bbox.min );
    var max = new THREE.Vector3().copy( bbox.max );

    min.subScalar( extraMargin + margin );
    max.addScalar( extraMargin + margin );

    min.multiplyScalar( scaleFactor ).floor().divideScalar( scaleFactor );
    max.multiplyScalar( scaleFactor ).ceil().divideScalar( scaleFactor );

    var dim = new THREE.Vector3()
        .subVectors( max, min )
        .multiplyScalar( scaleFactor )
        .ceil()
        .addScalar( 1 );

    var maxSize = Math.pow( 10, 6 ) * 256;
    var tmpSize = dim.x * dim.y * dim.z * 3;

    if( maxSize <= tmpSize ){

        scaleFactor *= Math.pow( maxSize / tmpSize, 1/3 );

        min.multiplyScalar( scaleFactor ).floor().divideScalar( scaleFactor );
        max.multiplyScalar( scaleFactor ).ceil().divideScalar( scaleFactor );

        dim.subVectors( max, min )
            .multiplyScalar( scaleFactor )
            .ceil()
            .addScalar( 1 );

    }

    var tran = new THREE.Vector3().copy( min ).negate();

    // coordinate transformation matrix
    var matrix = new THREE.Matrix4();
    matrix.multiply(
        new THREE.Matrix4().makeRotationY( THREE.Math.degToRad( 90 ) )
    );
    matrix.multiply(
        new THREE.Matrix4().makeScale(
            -1 / scaleFactor,
             1 / scaleFactor,
             1 / scaleFactor
        )
    );
    matrix.multiply(
        new THREE.Matrix4().makeTranslation(
            -scaleFactor * tran.z,
            -scaleFactor * tran.y,
            -scaleFactor * tran.x
        )
    );

    return {
        dim: dim,
        tran: tran,
        matrix: matrix,
        scaleFactor: scaleFactor
    };

}


function EDTSurface( structure ){

    // based on D. Xu, Y. Zhang (2009) Generating Triangulated Macromolecular
    // Surfaces by Euclidean Distance Transform. PLoS ONE 4(12): e8140.
    //
    // Permission to use, copy, modify, and distribute this program for
    // any purpose, with or without fee, is hereby granted, provided that
    // the notices on the head, the reference information, and this
    // copyright notice appear in all copies or substantial portions of
    // the Software. It is provided "as is" without express or implied
    // warranty.
    //
    // ported to JavaScript by biochem_fan (http://webglmol.sourceforge.jp/)
    // refactored by dkoes (https://github.com/dkoes)
    //
    // adapted to NGL by Alexander Rose

    var bbox = structure.getBoundingBox();
    var atomProxy1 = structure.getAtomProxy();
    var atomProxy2 = structure.getAtomProxy();

    var probeRadius, scaleFactor, cutoff, lowRes;
    var pLength, pWidth, pHeight;
    var matrix, ptran;
    var depty, widxz;
    var cutRadius;
    var setAtomID;
    var vpBits, vpDistance, vpAtomID;

    var radiusProperty;
    var radiusDict;
    var selection;

    function init( btype, _probeRadius, _scaleFactor, _cutoff, _lowRes, _setAtomID ){

        probeRadius = _probeRadius || 1.4;
        scaleFactor = _scaleFactor || 2.0;
        lowRes = _lowRes || false;
        setAtomID = _setAtomID || true;

        if( lowRes ){

            radiusProperty = "resname";
            radiusDict = ResidueRadii;

            selection = new Selection( ".CA" );

        }else{

            radiusProperty = "element";
            radiusDict = VdwRadii;

            selection = undefined;

        }

        var maxRadius = 0;
        for( var name in radiusDict ){
            maxRadius = Math.max( maxRadius, radiusDict[ name ] );
        }

        var grid = getSurfaceGrid(
            bbox, maxRadius, scaleFactor, btype ? probeRadius : 0
        );

        pLength = grid.dim.x;
        pWidth = grid.dim.y;
        pHeight = grid.dim.z;

        matrix = grid.matrix;
        ptran = grid.tran;
        scaleFactor = grid.scaleFactor;

        // boundingatom caches
        depty = {};
        widxz = {};
        boundingatom( btype );

        cutRadius = probeRadius * scaleFactor;

        if( _cutoff ){
            cutoff = _cutoff;
        }else{
            cutoff = Math.max( 0.1, -1.2 + scaleFactor * probeRadius );
        }

        vpBits = new Uint8Array( pLength * pWidth * pHeight );
        if( btype ){
            vpDistance = new Float64Array( pLength * pWidth * pHeight );
        }
        if( setAtomID ){
            vpAtomID = new Int32Array( pLength * pWidth * pHeight );
        }

    }

    // constants for vpBits bitmasks
    var INOUT = 1;
    var ISDONE = 2;
    var ISBOUND = 4;

    var nb = [
        new Int32Array([  1,  0,  0 ]), new Int32Array([ -1,  0,  0 ]),
        new Int32Array([  0,  1,  0 ]), new Int32Array([  0, -1,  0 ]),
        new Int32Array([  0,  0,  1 ]), new Int32Array([  0,  0, -1 ]),
        new Int32Array([  1,  1,  0 ]), new Int32Array([  1, -1,  0 ]),
        new Int32Array([ -1,  1,  0 ]), new Int32Array([ -1, -1,  0 ]),
        new Int32Array([  1,  0,  1 ]), new Int32Array([  1,  0, -1 ]),
        new Int32Array([ -1,  0,  1 ]), new Int32Array([ -1,  0, -1 ]),
        new Int32Array([  0,  1,  1 ]), new Int32Array([  0,  1, -1 ]),
        new Int32Array([  0, -1,  1 ]), new Int32Array([  0, -1, -1 ]),
        new Int32Array([  1,  1,  1 ]), new Int32Array([  1,  1, -1 ]),
        new Int32Array([  1, -1,  1 ]), new Int32Array([ -1,  1,  1 ]),
        new Int32Array([  1, -1, -1 ]), new Int32Array([ -1, -1,  1 ]),
        new Int32Array([ -1,  1, -1 ]), new Int32Array([ -1, -1, -1 ])
    ];

    //

    this.getVolume = function( type, probeRadius, scaleFactor, lowRes, cutoff, setAtomID ){

        if( Debug ) Log.time( "EDTSurface.getVolume" );

        var btype = type !== "vws";
        setAtomID = true;

        init( btype, probeRadius, scaleFactor, cutoff, lowRes, setAtomID );

        fillvoxels( btype );
        buildboundary();

        if( type === "ms" || type === "ses" ){

            fastdistancemap();

        }

        if( type === "ses" ){

            boundingatom( false );
            fillvoxelswaals();

        }

        marchingcubeinit( type );

        var vol = new Volume(
            type, "", vpBits, pHeight, pWidth, pLength, vpAtomID
        );

        vol.setMatrix( matrix );

        if( Debug ) Log.timeEnd( "EDTSurface.getVolume" );

        return vol;

    };

    function boundingatom( btype ){

        var r, j, k;
        var txz, tdept, sradius, tradius, widxz_r;
        var depty_name, indx;

        for( var name in radiusDict ){

            r = radiusDict[ name ];

            if( depty[ name ] ) continue;

            if( !btype ){
                tradius = r * scaleFactor + 0.5;
            }else{
                tradius = ( r + probeRadius ) * scaleFactor + 0.5;
            }

            sradius = tradius * tradius;
            widxz_r = Math.floor( tradius ) + 1;
            depty_name = new Int32Array( widxz_r * widxz_r );
            indx = 0;

            for( j = 0; j < widxz_r; ++j ){

                for( k = 0; k < widxz_r; ++k ){

                    txz = j * j + k * k;

                    if( txz > sradius ){

                        depty_name[ indx ] = -1;

                    }else{

                        tdept = Math.sqrt( sradius - txz );
                        depty_name[ indx ] = Math.floor( tdept );

                    }

                    ++indx;

                }

            }

            widxz[ name ] = widxz_r;
            depty[ name ] = depty_name;

        }

    }

    function fillatom( atomIndex ){

        var cx, cy, cz, ox, oy, oz, mi, mj, mk, i, j, k, si, sj, sk;
        var ii, jj, kk;

        atomProxy1.index = atomIndex;

        if( selection && !selection.test( atomProxy1 ) ) return;

        cx = Math.floor( 0.5 + scaleFactor * ( atomProxy1.x + ptran.x ) );
        cy = Math.floor( 0.5 + scaleFactor * ( atomProxy1.y + ptran.y ) );
        cz = Math.floor( 0.5 + scaleFactor * ( atomProxy1.z + ptran.z ) );

        var at = atomProxy1[ radiusProperty ];
        var depty_at = depty[ at ];
        var nind = 0;
        var cnt = 0;
        var pWH = pWidth * pHeight;
        var n = widxz[ at ];

        var depty_at_nind;

        for( i = 0; i < n; ++i ){
        for( j = 0; j < n; ++j ) {

            depty_at_nind = depty_at[ nind ];

            if( depty_at_nind != -1 ){

                for( ii = -1; ii < 2; ++ii ){
                for( jj = -1; jj < 2; ++jj ){
                for( kk = -1; kk < 2; ++kk ){

                    if( ii !== 0 && jj !== 0 && kk !== 0 ){

                        mi = ii * i;
                        mk = kk * j;

                        for( k = 0; k <= depty_at_nind; ++k ){

                            mj = k * jj;
                            si = cx + mi;
                            sj = cy + mj;
                            sk = cz + mk;

                            if( si < 0 || sj < 0 || sk < 0 ||
                                si >= pLength || sj >= pWidth || sk >= pHeight
                            ){
                                continue;
                            }

                            var index = si * pWH + sj * pHeight + sk;

                            if( !setAtomID ){

                                vpBits[ index ] |= INOUT;

                            }else{

                                if( !( vpBits[ index ] & INOUT ) ){

                                    vpBits[ index ] |= INOUT;
                                    vpAtomID[ index ] = atomIndex;

                                }else if( vpBits[ index ] & INOUT ){
                                // }else{

                                    atomProxy2.index = vpAtomID[ index ];

                                    if( atomProxy2.index !== atomProxy1.index ){

                                        ox = cx + mi - Math.floor( 0.5 + scaleFactor * ( atomProxy2.x + ptran.x ) );
                                        oy = cy + mj - Math.floor( 0.5 + scaleFactor * ( atomProxy2.y + ptran.y ) );
                                        oz = cz + mk - Math.floor( 0.5 + scaleFactor * ( atomProxy2.z + ptran.z ) );

                                        if( mi * mi + mj * mj + mk * mk <
                                            ox * ox + oy * oy + oz * oz
                                        ){
                                            vpAtomID[ index ] = atomIndex;
                                        }

                                    }

                                }

                            }

                        }// k

                    }// if

                }// kk
                }// jj
                }// ii

            }// if

            nind++;

        }// j
        }// i

    }

    function fillvoxels( btype ){

        if( Debug ) Log.time( "EDTSurface fillvoxels" );

        var i, il;

        for( i = 0, il = vpBits.length; i < il; ++i ){
            vpBits[ i ] = 0;
            if( btype ) vpDistance[ i ] = -1.0;
            if( setAtomID ) vpAtomID[ i ] = -1;
        }

        structure.eachSelectedAtom( function( ap ){
            fillatom( ap.index );
        } );

        for( i = 0, il = vpBits.length; i < il; ++i ){
            if( vpBits[ i ] & INOUT ){
                vpBits[ i ] |= ISDONE;
            }
        }

        if( Debug ) Log.timeEnd( "EDTSurface fillvoxels" );

    }

    function fillAtomWaals( atomIndex ){

        var cx, cy, cz, ox, oy, oz, nind = 0;
        var mi, mj, mk, si, sj, sk, i, j, k, ii, jj, kk, n;

        atomProxy1.index = atomIndex;

        if( selection && !selection.test( atomProxy1 ) ) return;

        cx = Math.floor( 0.5 + scaleFactor * ( atomProxy1.x + ptran.x ) );
        cy = Math.floor( 0.5 + scaleFactor * ( atomProxy1.y + ptran.y ) );
        cz = Math.floor( 0.5 + scaleFactor * ( atomProxy1.z + ptran.z ) );

        var at = atomProxy1[ radiusProperty ];
        var pWH = pWidth * pHeight;

        for( i = 0, n = widxz[at]; i < n; ++i ){
        for( j = 0; j < n; ++j ){

            if( depty[ at ][ nind ] != -1 ){

                for( ii = -1; ii < 2; ++ii ){
                for( jj = -1; jj < 2; ++jj ){
                for( kk = -1; kk < 2; ++kk ){

                    if( ii !== 0 && jj !== 0 && kk !== 0 ){

                        mi = ii * i;
                        mk = kk * j;

                        for( k = 0; k <= depty[ at ][ nind ]; ++k ){

                            mj = k * jj;
                            si = cx + mi;
                            sj = cy + mj;
                            sk = cz + mk;

                            if( si < 0 || sj < 0 || sk < 0 ||
                                si >= pLength || sj >= pWidth || sk >= pHeight
                            ){
                                continue;
                            }

                            var index = si * pWH + sj * pHeight + sk;

                            if( !( vpBits[ index ] & ISDONE ) ){

                                vpBits[ index ] |= ISDONE;
                                if( setAtomID ) vpAtomID[ index ] = atomProxy1.index;

                            }else if( setAtomID ){

                                atomProxy2.index = vpAtomID[ index ];

                                ox = Math.floor( 0.5 + scaleFactor * ( atomProxy2.x + ptran.x ) );
                                oy = Math.floor( 0.5 + scaleFactor * ( atomProxy2.y + ptran.y ) );
                                oz = Math.floor( 0.5 + scaleFactor * ( atomProxy2.z + ptran.z ) );

                                if( mi * mi + mj * mj + mk * mk <
                                    ox * ox + oy * oy + oz * oz
                                ){
                                    vpAtomID[ index ] = atomProxy1.index;
                                }

                            }

                        }// k

                    }// if

                }// kk
                }// jj
                }// ii

            }// if

            nind++;

        }// j
        }// i

    }

    function fillvoxelswaals(){

        var i, il;

        for( i = 0, il = vpBits.length; i < il; ++i ){
            vpBits[ i ] &= ~ISDONE;  // not isdone
        }

        structure.eachSelectedAtom( function( ap ){
            fillAtomWaals( ap.index );
        } );

    }

    function buildboundary(){

        var i, j, k;
        var pWH = pWidth * pHeight;

        for( i = 0; i < pLength; ++i ){
        for( j = 0; j < pHeight; ++j ){
        for( k = 0; k < pWidth; ++k ){

            var index = i * pWH + k * pHeight + j;

            if( vpBits[ index ] & INOUT ){

                // var flagbound = false;
                var ii = 0;

                // while( !flagbound && ii < 26 ){
                while( ii < 26 ){

                    var ti = i + nb[ ii ][ 0 ];
                    var tj = j + nb[ ii ][ 2 ];
                    var tk = k + nb[ ii ][ 1 ];

                    if( ti > -1 && ti < pLength &&
                        tk > -1 && tk < pWidth &&
                        tj > -1 && tj < pHeight &&
                        !( vpBits[ ti * pWH + tk * pHeight + tj ] & INOUT )
                    ){

                        vpBits[ index ] |= ISBOUND;
                        // flagbound = true;
                        break;

                    }else{

                        ii++;

                    }

                }

            }

        } // k
        } // j
        } // i

    }

    function fastdistancemap(){

        if( Debug ) Log.time( "EDTSurface fastdistancemap" );

        var eliminate = 0;
        var certificate;
        var i, j, k, n;

        var boundPoint = new Grid(
            pLength, pWidth, pHeight, Uint16Array, 3
        );
        var pWH = pWidth * pHeight;
        var cutRSq = cutRadius * cutRadius;

        var totalsurfacevox = 0;
        var totalinnervox = 0;

        var index;

        // console.log( "lwh", pLength * pWidth * pHeight );
        if( Debug ) console.log( "l, w, h", pLength, pWidth, pHeight );

        for( i = 0; i < pLength; ++i ){
            for( j = 0; j < pWidth; ++j ){
                for( k = 0; k < pHeight; ++k ){

                    index = i * pWH + j * pHeight + k;

                    vpBits[ index ] &= ~ISDONE;

                    if( vpBits[ index ] & INOUT ){

                        if( vpBits[ index ] & ISBOUND ){

                            boundPoint.set(
                                i, j, k,
                                i, j, k
                            );

                            vpDistance[ index ] = 0;
                            vpBits[ index ] |= ISDONE;

                            totalsurfacevox += 1;

                        }else{

                            totalinnervox += 1;

                        }

                    }

                }
            }
        }

        if( Debug ) console.log( "totalsurfacevox", totalsurfacevox );
        if( Debug ) console.log( "totalinnervox", totalinnervox );

        var inarray = new Int32Array( 3 * totalsurfacevox );
        var positin = 0;
        var outarray = new Int32Array( 3 * totalsurfacevox );
        var positout = 0;

        for( i = 0; i < pLength; ++i ){
            for( j = 0; j < pWidth; ++j ){
                for( k = 0; k < pHeight; ++k ){

                    index = i * pWH + j * pHeight + k;

                    if( vpBits[ index ] & ISBOUND ){

                        inarray[ positin     ] = i;
                        inarray[ positin + 1 ] = j;
                        inarray[ positin + 2 ] = k;
                        positin += 3;

                        vpBits[ index ] &= ~ISBOUND;

                    }

                }
            }
        }

        do{

            positout = fastoneshell( inarray, boundPoint, positin, outarray );
            positin = 0;

            if( Debug ) console.log( "positout", positout / 3 );

            for( i = 0, n = positout; i < n; i+=3 ){

                index = pWH * outarray[ i ] + pHeight * outarray[ i + 1 ] + outarray[ i + 2 ];
                vpBits[ index ] &= ~ISBOUND;

                if( vpDistance[ index ] <= 1.0404 * cutRSq ){
                //if( vpDistance[ index ] <= 1.02 * cutRadius ){

                    inarray[ positin     ] = outarray[ i     ];
                    inarray[ positin + 1 ] = outarray[ i + 1 ];
                    inarray[ positin + 2 ] = outarray[ i + 2 ];
                    positin += 3;

                }

            }

        }while( positin > 0 );

        // var cutsf = Math.max( 0, scaleFactor - 0.5 );
        // cutoff = cutRadius - 0.5 / ( 0.1 + cutsf );
        var cutoffSq = cutoff * cutoff;

        var index2;
        var bp = new Uint16Array( 3 );

        for( i = 0; i < pLength; ++i ){
            for( j = 0; j < pWidth; ++j ){
                for( k = 0; k < pHeight; ++k ){

                    index = i * pWH + j * pHeight + k;
                    vpBits[ index ] &= ~ISBOUND;

                    // ses solid

                    if( vpBits[ index ] & INOUT ) {

                        if( !( vpBits[ index ] & ISDONE ) ||
                            ( ( vpBits[ index ] & ISDONE ) && vpDistance[ index ] >= cutoffSq )
                        ){

                            vpBits[ index ] |= ISBOUND;

                            if( setAtomID && ( vpBits[ index ] & ISDONE ) ){

                                boundPoint.toArray( i, j, k, bp );
                                index2 = bp[ 0 ] * pWH + bp[ 1 ] * pHeight + bp[ 2 ];

                                vpAtomID[ index ] = vpAtomID[ index2 ];

                            }

                        }
                    }

                }
            }
        }

        if( Debug ) Log.timeEnd( "EDTSurface fastdistancemap" );

    }

    function fastoneshell( inarray, boundPoint, positin, outarray ){

        if( Debug ) console.log( "positin", positin / 3 );

        // *allocout,voxel2
        // ***boundPoint, int*
        // outnum, int *elimi)
        var tx, ty, tz;
        var dx, dy, dz;
        var i, j, n;
        var square;
        var index;
        var nb_j;
        var bp = new Uint16Array( 3 );
        var positout = 0;

        if( positin === 0 ){
            return positout;
        }

        var tnv_ix = -1;
        var tnv_iy = -1;
        var tnv_iz = -1;

        var pWH = pWidth * pHeight;

        for( i = 0, n = positin; i < n; i+=3 ){

            tx = inarray[ i     ];
            ty = inarray[ i + 1 ];
            tz = inarray[ i + 2 ];
            boundPoint.toArray( tx, ty, tz, bp );

            for( j = 0; j < 6; ++j ){

                nb_j = nb[ j ];
                tnv_ix = tx + nb_j[ 0 ];
                tnv_iy = ty + nb_j[ 1 ];
                tnv_iz = tz + nb_j[ 2 ];

                if( tnv_ix < pLength && tnv_ix > -1 &&
                    tnv_iy < pWidth  && tnv_iy > -1 &&
                    tnv_iz < pHeight && tnv_iz > -1
                ){

                    index = tnv_ix * pWH + pHeight * tnv_iy + tnv_iz;

                    if( ( vpBits[ index ] & INOUT ) && !( vpBits[ index ] & ISDONE ) ){

                        boundPoint.fromArray( tnv_ix, tnv_iy, tnv_iz, bp );
                        dx = tnv_ix - bp[ 0 ];
                        dy = tnv_iy - bp[ 1 ];
                        dz = tnv_iz - bp[ 2 ];
                        square = dx * dx + dy * dy + dz * dz;
                        //square = Math.sqrt( square );

                        vpDistance[ index ] = square;
                        vpBits[ index ] |= ISDONE;
                        vpBits[ index ] |= ISBOUND;

                        outarray[ positout     ] = tnv_ix;
                        outarray[ positout + 1 ] = tnv_iy;
                        outarray[ positout + 2 ] = tnv_iz;
                        positout += 3;

                    }else if( ( vpBits[ index ] & INOUT ) && ( vpBits[ index ] & ISDONE ) ){

                        dx = tnv_ix - bp[ 0 ];
                        dy = tnv_iy - bp[ 1 ];
                        dz = tnv_iz - bp[ 2 ];
                        square = dx * dx + dy * dy + dz * dz;
                        //square = Math.sqrt( square );

                        if( square < vpDistance[ index ] ){

                            boundPoint.fromArray( tnv_ix, tnv_iy, tnv_iz, bp );
                            vpDistance[ index ] = square;

                            if( !( vpBits[ index ] & ISBOUND ) ){

                                vpBits[ index ] |= ISBOUND;

                                outarray[ positout     ] = tnv_ix;
                                outarray[ positout + 1 ] = tnv_iy;
                                outarray[ positout + 2 ] = tnv_iz;
                                positout += 3;

                            }

                        }

                    }

                }
            }
        }

        // console.log("part1", positout);

        for( i = 0, n = positin; i < n; i+=3 ){

            tx = inarray[ i     ];
            ty = inarray[ i + 1 ];
            tz = inarray[ i + 2 ];
            boundPoint.toArray( tx, ty, tz, bp );

            for (j = 6; j < 18; j++) {

                nb_j = nb[ j ];
                tnv_ix = tx + nb_j[ 0 ];
                tnv_iy = ty + nb_j[ 1 ];
                tnv_iz = tz + nb_j[ 2 ];

                if( tnv_ix < pLength && tnv_ix > -1 &&
                    tnv_iy < pWidth  && tnv_iy > -1 &&
                    tnv_iz < pHeight && tnv_iz > -1
                ) {

                    index = tnv_ix * pWH + pHeight * tnv_iy + tnv_iz;

                    if ((vpBits[index] & INOUT) && !(vpBits[index] & ISDONE)) {

                        boundPoint.fromArray( tnv_ix, tnv_iy, tnv_iz, bp );
                        dx = tnv_ix - bp[ 0 ];
                        dy = tnv_iy - bp[ 1 ];
                        dz = tnv_iz - bp[ 2 ];
                        square = dx * dx + dy * dy + dz * dz;
                        //square = Math.sqrt( square );

                        vpDistance[index] = square;
                        vpBits[index] |= ISDONE;
                        vpBits[index] |= ISBOUND;

                        outarray[ positout     ] = tnv_ix;
                        outarray[ positout + 1 ] = tnv_iy;
                        outarray[ positout + 2 ] = tnv_iz;
                        positout += 3;

                    } else if ((vpBits[index] & INOUT) && (vpBits[index] & ISDONE)) {

                        dx = tnv_ix - bp[ 0 ];
                        dy = tnv_iy - bp[ 1 ];
                        dz = tnv_iz - bp[ 2 ];
                        square = dx * dx + dy * dy + dz * dz;
                        //square = Math.sqrt( square );

                        if (square < vpDistance[index]) {

                            boundPoint.fromArray( tnv_ix, tnv_iy, tnv_iz, bp );
                            vpDistance[index] = square;

                            if (!(vpBits[index] & ISBOUND)) {

                                vpBits[index] |= ISBOUND;

                                outarray[ positout     ] = tnv_ix;
                                outarray[ positout + 1 ] = tnv_iy;
                                outarray[ positout + 2 ] = tnv_iz;
                                positout += 3;

                            }

                        }

                    }

                }
            }
        }

        // console.log("part2", positout);

        for( i = 0, n = positin; i < n; i+=3 ){

            tx = inarray[ i     ];
            ty = inarray[ i + 1 ];
            tz = inarray[ i + 2 ];
            boundPoint.toArray( tx, ty, tz, bp );

            for (j = 18; j < 26; j++) {

                nb_j = nb[ j ];
                tnv_ix = tx + nb_j[ 0 ];
                tnv_iy = ty + nb_j[ 1 ];
                tnv_iz = tz + nb_j[ 2 ];

                if( tnv_ix < pLength && tnv_ix > -1 &&
                    tnv_iy < pWidth  && tnv_iy > -1 &&
                    tnv_iz < pHeight && tnv_iz > -1
                ){

                    index = tnv_ix * pWH + pHeight * tnv_iy + tnv_iz;

                    if ((vpBits[index] & INOUT) && !(vpBits[index] & ISDONE)) {

                        boundPoint.fromArray( tnv_ix, tnv_iy, tnv_iz, bp );
                        dx = tnv_ix - bp[ 0 ];
                        dy = tnv_iy - bp[ 1 ];
                        dz = tnv_iz - bp[ 2 ];
                        square = dx * dx + dy * dy + dz * dz;
                        //square = Math.sqrt( square );

                        vpDistance[index] = square;
                        vpBits[index] |= ISDONE;
                        vpBits[index] |= ISBOUND;

                        outarray[ positout     ] = tnv_ix;
                        outarray[ positout + 1 ] = tnv_iy;
                        outarray[ positout + 2 ] = tnv_iz;
                        positout += 3;

                    } else if ((vpBits[index] & INOUT)  && (vpBits[index] & ISDONE)) {

                        dx = tnv_ix - bp[ 0 ];
                        dy = tnv_iy - bp[ 1 ];
                        dz = tnv_iz - bp[ 2 ];
                        square = dx * dx + dy * dy + dz * dz;
                        //square = Math.sqrt( square );

                        if (square < vpDistance[index]) {

                            boundPoint.fromArray( tnv_ix, tnv_iy, tnv_iz, bp );
                            vpDistance[index] = square;

                            if (!(vpBits[index] & ISBOUND)) {

                                vpBits[index] |= ISBOUND;

                                outarray[ positout     ] = tnv_ix;
                                outarray[ positout + 1 ] = tnv_iy;
                                outarray[ positout + 2 ] = tnv_iz;
                                positout += 3;

                            }

                        }

                    }

                }
            }
        }

        // console.log("part3", positout);

        return positout;

    }

    function marchingcubeinit( stype ){

        var n = vpBits.length;

        if( stype === "vws" ) {

            for( var i = 0; i < n; ++i ){

                vpBits[ i ] &= ~ISBOUND;
                vpBits[ i ] = !!( vpBits[ i ] & ISDONE ) ? 1 : 0;

            }

        }else if( stype === "ms" ){  // ses without vdw => ms

            for( var i = 0; i < n; ++i ){

                vpBits[ i ] &= ~ISDONE;
                if( vpBits[ i ] & ISBOUND ){
                    vpBits[ i ] |= ISDONE;
                }
                vpBits[ i ] &= ~ISBOUND;
                vpBits[ i ] = !!( vpBits[ i ] & ISDONE ) ? 1 : 0;

            }

        }else if( stype === "ses" ){

            for( var i = 0; i < n; ++i ){

                if( ( vpBits[ i ] & ISBOUND ) && ( vpBits[ i ] & ISDONE ) ){
                    vpBits[ i ] &= ~ISBOUND;
                }else if( ( vpBits[ i ] & ISBOUND ) && !( vpBits[ i ] & ISDONE ) ){
                    vpBits[ i ] |= ISDONE;
                }
                vpBits[ i ] = !!( vpBits[ i ] & ISDONE ) ? 1 : 0;

            }

        }else if( stype === "sas" ){

            for( var i = 0; i < n; ++i ){

                vpBits[ i ] &= ~ISBOUND;
                vpBits[ i ] = !!( vpBits[ i ] & ISDONE ) ? 1 : 0;

            }

        }

    };

}


export default EDTSurface;
