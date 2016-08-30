/**
 * @file Viewer Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Matrix4, Points } from "../../lib/three.es6.js";

import TiledRenderer from "./tiled-renderer.js";
import { quicksortCmp } from "../math/array-utils.js";


function _trimCanvas( canvas, r, g, b, a ){

    var canvasHeight = canvas.height;
    var canvasWidth = canvas.width;

    var ctx = canvas.getContext( '2d' );
    var pixels = ctx.getImageData(0, 0, canvasWidth, canvasHeight ).data;

    var x, y, doBreak, off;

    doBreak = false;
    for( y = 0; y < canvasHeight; y++ ) {
        for( x = 0; x < canvasWidth; x++ ) {
            off = ( y * canvasWidth + x ) * 4;
            if( pixels[ off ] !== r || pixels[ off + 1 ] !== g ||
                    pixels[ off + 2 ] !== b || pixels[ off + 3 ] !== a ){
                doBreak = true;
                break;
            }
        }
        if( doBreak ){
            break;
        }
    }
    var topY = y;

    doBreak = false;
    for( x = 0; x < canvasWidth; x++ ) {
        for( y = 0; y < canvasHeight; y++ ) {
            off = ( y * canvasWidth + x ) * 4;
            if( pixels[ off ] !== r || pixels[ off + 1 ] !== g ||
                    pixels[ off + 2 ] !== b || pixels[ off + 3 ] !== a ){
                doBreak = true;
                break;
            }
        }
        if( doBreak ){
            break;
        }
    }
    var topX = x;

    doBreak = false;
    for( y = canvasHeight-1; y >= 0; y-- ) {
        for( x = canvasWidth-1; x >= 0; x-- ) {
            off = ( y * canvasWidth + x ) * 4;
            if( pixels[ off ] !== r || pixels[ off + 1 ] !== g ||
                    pixels[ off + 2 ] !== b || pixels[ off + 3 ] !== a ){
                doBreak = true;
                break;
            }
        }
        if( doBreak ){
            break;
        }
    }
    var bottomY = y;

    doBreak = false;
    for( x = canvasWidth-1; x >= 0; x-- ) {
        for( y = canvasHeight-1; y >= 0; y-- ) {
            off = ( y * canvasWidth + x ) * 4;
            if( pixels[ off ] !== r || pixels[ off + 1 ] !== g ||
                    pixels[ off + 2 ] !== b || pixels[ off + 3 ] !== a ){
                doBreak = true;
                break;
            }
        }
        if( doBreak ){
            break;
        }
    }
    var bottomX = x;

    var trimedCanvas = document.createElement( 'canvas' );
    trimedCanvas.width = bottomX - topX;
    trimedCanvas.height = bottomY - topY;

    var trimedCtx = trimedCanvas.getContext( '2d' );
    trimedCtx.drawImage(
        canvas,
        topX, topY,
        trimedCanvas.width, trimedCanvas.height,
        0, 0,
        trimedCanvas.width, trimedCanvas.height
    );

    return trimedCanvas;

}


function makeImage( viewer, params ){

    var p = params || {};

    var trim = p.trim!==undefined ? p.trim : false;
    var factor = p.factor!==undefined ? p.factor : 1;
    var antialias = p.antialias!==undefined ? p.antialias : false;
    var transparent = p.transparent!==undefined ? p.transparent : false;

    var renderer = viewer.renderer;
    var camera = viewer.camera;

    var originalClearAlpha = renderer.getClearAlpha();
    var backgroundColor = renderer.getClearColor();

    function setLineWidthAndPixelSize( invert ){
        var _factor = factor;
        if( antialias ) _factor *= 2;
        if( invert ) _factor = 1 / _factor;
        viewer.scene.traverse( function( o ){
            var m = o.material;
            if( m && m.linewidth ){
                m.linewidth *= _factor;
            }
            if( m && m.uniforms && m.uniforms.size ){
                if( m.uniforms.size.__seen === undefined ){
                    m.uniforms.size.value *= _factor;
                    m.uniforms.size.__seen = true;
                }
            }
        } );
        viewer.scene.traverse( function( o ){
            var m = o.material;
            if( m && m.uniforms && m.uniforms.size ){
                delete m.uniforms.size.__seen;
            }
        } );
    }

    function trimCanvas( canvas ){
        if( trim ){
            var bg = backgroundColor;
            var r = ( transparent ? 0 : bg.r * 255 ) | 0;
            var g = ( transparent ? 0 : bg.g * 255 ) | 0;
            var b = ( transparent ? 0 : bg.b * 255 ) | 0;
            var a = ( transparent ? 0 : 255 ) | 0;
            return _trimCanvas( canvas, r, g, b, a );
        }else{
            return canvas;
        }
    }

    function onProgress( i, n, finished ){
        if( typeof p.onProgress === "function" ){
            p.onProgress( i, n, finished );
        }
    }

    return new Promise( function( resolve ){

        var tiledRenderer = new TiledRenderer(
            renderer, camera, viewer,
            {
                factor: factor,
                antialias: antialias,
                onProgress: onProgress,
                onFinish: onFinish
            }
        );

        renderer.setClearAlpha( transparent ? 0 : 1 );
        setLineWidthAndPixelSize();
        tiledRenderer.renderAsync();

        function onFinish( i, n ){
            var canvas = trimCanvas( tiledRenderer.canvas );
            canvas.toBlob(
                function( blob ){
                    renderer.setClearAlpha( originalClearAlpha );
                    setLineWidthAndPixelSize( true );
                    viewer.requestRender();
                    onProgress( n, n, true );
                    resolve( blob );
                },
                "image/png"
            );
        }

    } );

}


var vertex = new Vector3();
var matrix = new Matrix4();
var modelViewProjectionMatrix = new Matrix4();

function sortProjectedPosition( scene, camera ){

    // console.time( "sort" );

    var i;

    scene.traverseVisible( function ( o ){

        if( !( o instanceof Points ) || !o.sortParticles ){
            return;
        }

        var attributes = o.geometry.attributes;
        var n = attributes.position.count;

        if( n === 0 ) return;

        matrix.multiplyMatrices(
            camera.matrixWorldInverse, o.matrixWorld
        );
        modelViewProjectionMatrix.multiplyMatrices(
            camera.projectionMatrix, matrix
        );

        var sortData, sortArray, zArray, cmpFn;

        if( !o.userData.sortData ){

            zArray = new Float32Array( n );
            sortArray = new Uint32Array( n );
            cmpFn = function( ai, bi ){
                var a = zArray[ ai ];
                var b = zArray[ bi ];
                if( a > b ) return 1;
                if( a < b ) return -1;
                return 0;
            };

            sortData = {
                __zArray: zArray,
                __sortArray: sortArray,
                __cmpFn: cmpFn
            };

            o.userData.sortData = sortData;

        }else{

            sortData = o.userData.sortData;
            zArray = sortData.__zArray;
            sortArray = sortData.__sortArray;
            cmpFn = sortData.__cmpFn;

        }

        for( i = 0; i < n; ++i ){

            vertex.fromArray( attributes.position.array, i * 3 );
            vertex.applyProjection( modelViewProjectionMatrix );

            // negate, so that sorting order is reversed
            zArray[ i ] = -vertex.z;
            sortArray[ i ] = i;

        }

        quicksortCmp( sortArray, cmpFn );

        var index, indexSrc, indexDst, tmpTab;

        for( var name in attributes ){

            var attr = attributes[ name ];
            var array = attr.array;
            var itemSize = attr.itemSize;

            if( !sortData[ name ] ){
                sortData[ name ] = new Float32Array(
                    itemSize * n
                );
            }

            tmpTab = sortData[ name ];
            sortData[ name ] = array;

            for( i = 0; i < n; ++i ){

                index = sortArray[ i ];

                for( var j = 0; j < itemSize; ++j ){
                    indexSrc = index * itemSize + j;
                    indexDst = i * itemSize + j;
                    tmpTab[ indexDst ] = array[ indexSrc ];
                }

            }

            attributes[ name ].array = tmpTab;
            attributes[ name ].needsUpdate = true;

        }

    } );

    // console.timeEnd( "sort" );

}


var projectionMatrixInverse = new Matrix4();
var projectionMatrixTranspose = new Matrix4();

function updateMaterialUniforms( group, camera, renderer, cDist, bRadius ){

    var canvasHeight = renderer.getSize().height;
    var pixelRatio = renderer.getPixelRatio();
    var ortho = camera.type === "OrthographicCamera" ? true : false;

    projectionMatrixInverse.getInverse( camera.projectionMatrix );
    projectionMatrixTranspose.copy( camera.projectionMatrix ).transpose();

    group.traverse( function( o ){

        var m = o.material;
        if( !m ) return;

        var u = o.material.uniforms;
        if( !u ) return;

        if( m.clipNear ){
            var nearFactor = ( 50 - m.clipNear ) / 50;
            var nearClip = cDist - ( bRadius * nearFactor );
            u.nearClip.value = nearClip;
        }

        if( u.canvasHeight ){
            u.canvasHeight.value = canvasHeight;
        }

        if( u.pixelRatio ){
            u.pixelRatio.value = pixelRatio;
        }

        if( u.projectionMatrixInverse ){
            u.projectionMatrixInverse.value.copy(
                projectionMatrixInverse
            );
        }

        if( u.projectionMatrixTranspose ){
            u.projectionMatrixTranspose.value.copy(
                projectionMatrixTranspose
            );
        }

        if( u.ortho ){
            u.ortho.value = ortho;
        }

    } );

}


export {
    makeImage,
    sortProjectedPosition,
    updateMaterialUniforms
};
