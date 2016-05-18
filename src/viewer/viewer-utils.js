/**
 * @file Viewer Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import TiledRenderer from "./tiled-renderer.js";


function trimCanvas( canvas, r, g, b, a ){

    var canvasHeight = canvas.height;
    var canvasWidth = canvas.width;

    var ctx = canvas.getContext( '2d' );
    var pixels = ctx.getImageData(0, 0, canvasWidth, canvasHeight ).data;

    var x, y, doBreak;

    doBreak = false;
    for( y = 0; y < canvasHeight; y++ ) {
        for( x = 0; x < canvasWidth; x++ ) {
            var off = ( y * canvasWidth + x ) * 4;
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
            var off = ( y * canvasWidth + x ) * 4;
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
            var off = ( y * canvasWidth + x ) * 4;
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
            var off = ( y * canvasWidth + x ) * 4;
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
    trimedCanvas.style.display = "hidden";
    document.body.appendChild( trimedCanvas );

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
                if( m.uniforms.size[ "__seen" ] === undefined ){
                    m.uniforms.size.value *= _factor;
                    m.uniforms.size[ "__seen" ] = true;
                }
            }
        } );
        viewer.scene.traverse( function( o ){
            var m = o.material;
            if( m && m.uniforms && m.uniforms.size ){
                delete m.uniforms.size[ "__seen" ];
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
            return trimCanvas( canvas, r, g, b, a );
        }else{
            return canvas;
        }
    }

    function onProgress( i, n, finished ){
        if( typeof p.onProgress === "function" ){
            p.onProgress( i, n, finished );
        }
    }

    return new Promise( function( resolve, reject ){

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
                    tiledRenderer.dispose();
                    onProgress( n, n, true );
                    resolve( blob );
                },
                "image/png"
            );
        }

    } );

}


export {
	makeImage
};
