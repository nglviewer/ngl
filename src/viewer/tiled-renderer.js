/**
 * @file Tiled Renderer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function TiledRenderer( renderer, camera, viewer, params ){

    var p = params || {};

    var factor = p.factor!==undefined ? p.factor : 2;
    var antialias = p.antialias!==undefined ? p.antialias : false;

    var onProgress = p.onProgress;
    var onFinish = p.onFinish;

    //

    if( antialias ) factor *= 2;
    var n = factor * factor;

    // canvas

    var canvas = document.createElement( 'canvas' );
    var width = viewer.width;
    var height = viewer.height;

    if( antialias ){
        canvas.width = width * factor / 2;
        canvas.height = height * factor / 2;
    }else{
        canvas.width = width * factor;
        canvas.height = height * factor;
    }

    var ctx = canvas.getContext( '2d' );

    var viewerSampleLevel = viewer.sampleLevel;
    viewer.setSampling( -1 );

    function renderTile( i ){

        var x = i % factor;
        var y = Math.floor( i / factor );

        var offsetX = x * width;
        var offsetY = y * height;

        viewer.camera.setViewOffset(
            width * factor,
            height * factor,
            offsetX,
            offsetY,
            width,
            height
        );

        viewer.render();

        if( antialias ){
            ctx.drawImage(
                renderer.domElement,
                Math.floor( offsetX / 2 ),
                Math.floor( offsetY / 2 ),
                Math.ceil( width / 2 ),
                Math.ceil( height / 2 )
            );
        }else{
            ctx.drawImage(
                renderer.domElement,
                Math.floor( offsetX ),
                Math.floor( offsetY ),
                Math.ceil( width ),
                Math.ceil( height )
            );
        }

        if( typeof onProgress === "function" ){
            onProgress( i + 1, n, false );
        }

    }

    function finalize(){

        viewer.setSampling( viewerSampleLevel );
        viewer.camera.view = null;

        if( typeof onFinish === "function" ){
            onFinish( n + 1, n, false );
        }

    }

    function render(){

        for( var i = 0; i <= n; ++i ){
            if( i === n ){
                finalize();
            }else{
                renderTile( i );
            }
        }

    }

    function renderAsync(){

        var count = 0;

        function fn(){
            if( count === n ){
                finalize();
            }else{
                renderTile( count );
            }
            count += 1;
        }

        for( var i = 0; i <= n; ++i ){
            setTimeout( fn, 0, i );
        }

    }

    // API

    this.render = render;
    this.renderAsync = renderAsync;

    this.canvas = canvas;

}

TiledRenderer.prototype.constructor = TiledRenderer;


export default TiledRenderer;
