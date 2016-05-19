/**
 * @file Tiled Renderer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


function TiledRenderer( renderer, camera, viewer, params ){

    var p = params || {};

    this.renderer = renderer;
    this.camera = camera;
    this.viewer = viewer;

    this.factor = p.factor!==undefined ? p.factor : 2;
    this.antialias = p.antialias!==undefined ? p.antialias : false;

    this.onProgress = p.onProgress;
    this.onFinish = p.onFinish;

    this.init();

}

TiledRenderer.prototype = {

    init: function(){

        if( this.antialias ) this.factor *= 2;
        this.n = this.factor * this.factor;

        // canvas

        var canvas = document.createElement( 'canvas' );
        canvas.style.display = "hidden";
        document.body.appendChild( canvas );

        if( this.antialias ){
            canvas.width = this.viewer.width * this.factor / 2;
            canvas.height = this.viewer.height * this.factor / 2;
        }else{
            canvas.width = this.viewer.width * this.factor;
            canvas.height = this.viewer.height * this.factor;
        }

        this.ctx = canvas.getContext( '2d' );
        this.canvas = canvas;

        this.viewerSampleLevel = this.viewer.sampleLevel;
        this.viewer.sampleLevel = -1;

    },

    renderTile: function( i ){

        var factor = this.factor;

        var x = i % factor;
        var y = Math.floor( i / factor );

        var width = this.viewer.width;
        var height = this.viewer.height;
        var offsetX = x * width;
        var offsetY = y * height;

        this.viewer.camera.setViewOffset(
            width * factor,
            height * factor,
            offsetX,
            offsetY,
            width,
            height
        );

        this.viewer.render();

        if( this.antialias ){
            this.ctx.drawImage(
                this.renderer.domElement,
                Math.floor( offsetX / 2 ),
                Math.floor( offsetY / 2 ),
                Math.ceil( width / 2 ),
                Math.ceil( height / 2 )
            );
        }else{
            this.ctx.drawImage(
                this.renderer.domElement,
                Math.floor( offsetX ),
                Math.floor( offsetY ),
                Math.ceil( width ),
                Math.ceil( height )
            );
        }

        if( typeof this.onProgress === "function" ){
            this.onProgress( i + 1, this.n, false );
        }

    },

    finalize: function(){

        this.viewer.sampleLevel = this.viewerSampleLevel;
        this.viewer.camera.view = null;

        if( typeof this.onFinish === "function" ){
            this.onFinish( this.n + 1, this.n, false );
        }

    },

    render: function(){

        var n = this.n;

        for( var i = 0; i <= n; ++i ){
            if( i === n ){
                this.finalize();
            }else{
                this.renderTile( i );
            }
        }

    },

    renderAsync: function(){

        var n = this.n;
        var renderTile = this.renderTile.bind( this );
        var finalize = this.finalize.bind( this );
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

    },

    dispose: function(){

        document.body.removeChild( this.canvas );

    }

};


export default TiledRenderer;
