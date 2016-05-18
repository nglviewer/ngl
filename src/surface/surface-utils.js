/**
 * @file Surface Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Debug, Log } from "../globals.js";


function laplacianSmooth( verts, faces, numiter, inflate ){

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
    // ported to JavaScript and adapted to NGL by Alexander Rose

    if( Debug ) Log.time( "laplacianSmooth" );

    numiter = numiter || 1;
    inflate = inflate || true;

    var nv = verts.length / 3;
    var nf = faces.length / 3;

    if( inflate ){

        // Buffer geometry is only used to calculate normals

        var bg = new THREE.BufferGeometry();
        bg.addAttribute( "position", new THREE.BufferAttribute( verts, 3 ) );
        bg.setIndex( new THREE.BufferAttribute( faces, 1 ) );

    }

    var tps = new Float32Array( nv * 3 );

    var ndeg = 20;
    var vertdeg = new Array( ndeg );

    for( var i = 0; i < ndeg; ++i ){
        vertdeg[ i ] = new Uint32Array( nv );
    }

    for( var i = 0; i < nv; ++i ){
        vertdeg[ 0 ][ i ] = 0;
    }

    var j, jl;
    var flagvert;

    // for each face

    for( var i = 0; i < nf; ++i ){

        var ao = i * 3;
        var bo = i * 3 + 1;
        var co = i * 3 + 2;

        // vertex a

        flagvert = true;
        for( j = 0, jl = vertdeg[ 0 ][ faces[ao] ]; j < jl; ++j ){
            if( faces[ bo ] == vertdeg[ j + 1 ][ faces[ ao ]] ){
                flagvert = false;
                break;
            }
        }
        if( flagvert ){
            vertdeg[ 0 ][ faces[ ao ] ]++;
            vertdeg[ vertdeg[ 0 ][ faces[ ao ] ] ][ faces[ ao ] ] = faces[ bo ];
        }

        flagvert = true;
        for( j = 0, jl = vertdeg[ 0 ][ faces[ ao ] ]; j < jl; ++j ){
            if( faces[ co] == vertdeg[ j + 1 ][ faces[ ao ] ] ){
                flagvert = false;
                break;
            }
        }
        if( flagvert ){
            vertdeg[ 0 ][ faces[ ao ] ]++;
            vertdeg[ vertdeg[ 0 ][ faces[ ao ] ] ][ faces[ ao ] ] = faces[ co ];
        }

        // vertex b

        flagvert = true;
        for( j = 0, jl = vertdeg[ 0 ][ faces[ bo ] ]; j < jl; ++j ){
            if( faces[ ao ] == vertdeg[ j + 1 ][ faces[ bo ] ] ){
                flagvert = false;
                break;
            }
        }
        if( flagvert ){
            vertdeg[ 0 ][ faces[ bo ] ]++;
            vertdeg[ vertdeg[ 0 ][ faces[ bo ] ] ][ faces[ bo ] ] = faces[ ao ];
        }

        flagvert = true;
        for( j = 0, jl = vertdeg[ 0 ][ faces[ bo ] ]; j < jl; ++j ){
            if( faces[ co ] == vertdeg[ j + 1 ][ faces[ bo ] ] ){
                flagvert = false;
                break;
            }
        }
        if( flagvert ){
            vertdeg[ 0 ][ faces[ bo ] ]++;
            vertdeg[ vertdeg[ 0 ][ faces[ bo ] ] ][ faces[ bo ] ] = faces[ co ];
        }

        // vertex c

        flagvert = true;
        for( j = 0; j < vertdeg[ 0 ][ faces[ co ] ]; ++j ){
            if( faces[ ao ] == vertdeg[ j + 1 ][ faces[ co ] ] ){
                flagvert = false;
                break;
            }
        }
        if( flagvert ){
            vertdeg[ 0 ][ faces[ co ] ]++;
            vertdeg[ vertdeg[ 0 ][ faces[ co ] ] ][ faces[ co ] ] = faces[ ao ];
        }

        flagvert = true;
        for( j = 0, jl = vertdeg[ 0 ][ faces[ co ] ]; j < jl; ++j ){
            if( faces[ bo ] == vertdeg[ j + 1 ][ faces[ co ] ] ){
                flagvert = false;
                break;
            }
        }
        if( flagvert ){
            vertdeg[ 0 ][ faces[ co ] ]++;
            vertdeg[ vertdeg[ 0 ][ faces[ co ] ] ][ faces[ co ] ] = faces[ bo ];
        }

    }

    var wt = 1.0;
    var wt2 = 0.5;
    var i3, vi3, vi, vdi, wt_vi, wt2_vi;
    var ssign = -1;
    var scaleFactor = 1;
    var outwt = 0.75 / ( scaleFactor + 3.5 );  // area-preserving

    // smoothing iterations

    for( var k = 0; k < numiter; ++k ){

        // for each vertex

        for( var i = 0; i < nv; ++i ){

            i3 = i * 3;
            vdi = vertdeg[ 0 ][ i ];

            if( vdi < 3 ){

                tps[ i3     ] = verts[ i3     ];
                tps[ i3 + 1 ] = verts[ i3 + 1 ];
                tps[ i3 + 2 ] = verts[ i3 + 2 ];

            }else if( vdi === 3 || vdi === 4 ){

                tps[ i3     ] = 0;
                tps[ i3 + 1 ] = 0;
                tps[ i3 + 2 ] = 0;

                for( j = 0; j < vdi; ++j ){
                    vi3 = vertdeg[ j + 1 ][ i ] * 3;
                    tps[ i3     ] += verts[ vi3     ];
                    tps[ i3 + 1 ] += verts[ vi3 + 1 ];
                    tps[ i3 + 2 ] += verts[ vi3 + 2 ];
                }

                tps[ i3     ] += wt2 * verts[ i3 ];
                tps[ i3 + 1 ] += wt2 * verts[ i3 + 1 ];
                tps[ i3 + 2 ] += wt2 * verts[ i3 + 2 ];

                wt2_vi = wt2 + vdi;
                tps[ i3     ] /= wt2_vi;
                tps[ i3 + 1 ] /= wt2_vi;
                tps[ i3 + 2 ] /= wt2_vi;

            }else{

                tps[ i3     ] = 0;
                tps[ i3 + 1 ] = 0;
                tps[ i3 + 2 ] = 0;

                for( j = 0; j < vdi; ++j ){
                    vi3 = vertdeg[ j + 1 ][ i ] * 3;
                    tps[ i3     ] += verts[ vi3     ];
                    tps[ i3 + 1 ] += verts[ vi3 + 1 ];
                    tps[ i3 + 2 ] += verts[ vi3 + 2 ];
                }

                tps[ i3     ] += wt * verts[ i3 ];
                tps[ i3 + 1 ] += wt * verts[ i3 + 1 ];
                tps[ i3 + 2 ] += wt * verts[ i3 + 2 ];

                wt_vi = wt + vdi;
                tps[ i3     ] /= wt_vi;
                tps[ i3 + 1 ] /= wt_vi;
                tps[ i3 + 2 ] /= wt_vi;

            }

        }

        verts.set( tps );  // copy smoothed positions

        if( inflate ){

            bg.computeVertexNormals();
            var norms = bg.attributes.normal.array;
            var nv3 = nv * 3;

            for( i3 = 0; i3 < nv3; i3 += 3 ){

                // if(verts[i].inout) ssign=1;
                // else ssign=-1;

                verts[ i3     ] += ssign * outwt * norms[ i3     ];
                verts[ i3 + 1 ] += ssign * outwt * norms[ i3 + 1 ];
                verts[ i3 + 2 ] += ssign * outwt * norms[ i3 + 2 ];

            }

        }

    }

    if( inflate ){

        bg.dispose();

    }

    if( Debug ) Log.timeEnd( "laplacianSmooth" );

}


export {
	laplacianSmooth
};
