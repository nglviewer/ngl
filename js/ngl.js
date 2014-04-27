

$.loadImage = function(url) {
    // from: http://aboutcode.net/2013/01/09/load-images-with-jquery-deferred.html
    // Define a "worker" function that should eventually resolve or reject the deferred object.
    var loadImage = function( deferred ) {
        var image = new Image();
         
        // Set up event handlers to know when the image has loaded
        // or fails to load due to an error or abort.
        image.onload = loaded;
        image.onerror = errored; // URL returns 404, etc
        image.onabort = errored; // IE may call this if user clicks "Stop"
         
        // Setting the src property begins loading the image.
        image.src = url;
         
        function loaded() {
            unbindEvents();
            // Calling resolve means the image loaded sucessfully and is ready to use.
            deferred.resolve( image );
        }
        function errored() {
            unbindEvents();
            // Calling reject means we failed to load the image (e.g. 404, server offline, etc).
            deferred.reject( image );
        }
        function unbindEvents() {
            // Ensures the event callbacks only get called once.
            image.onload = null;
            image.onerror = null;
            image.onabort = null;
        }
    };

    // Create the deferred object that will contain the loaded image.
    // We don't want callers to have access to the resolve() and reject() methods, 
    // so convert to "read-only" by calling `promise()`.
    return $.Deferred( loadImage ).promise();
};


var log = _.throttle( function(x,y){ console.log(x,y); }, 1000 );


// X-ray shader
// https://github.com/cryos/avogadro/tree/master/libavogadro/src/extensions/shaders


NGL = { REVISION: '1dev' };


NGL.Resources = {

    // fonts
    'font/Arial.png': 'image',
    'font/Arial.fnt': '',

    // shaders
    'shader/BezierRaymarch.vert': '',
    'shader/BezierRaymarch.frag': '',
    'shader/HelixImpostor.vert': '',
    'shader/HelixImpostor.frag': '',
    'shader/HelixImpostor2.vert': '',
    'shader/HelixImpostor2.frag': '',
    'shader/HyperballSphereImpostor.vert': '',
    'shader/HyperballSphereImpostor.frag': '',
    'shader/HyperballStickImpostor.vert': '',
    'shader/HyperballStickImpostor.frag': '',
    'shader/Ribbon.vert': '',
    'shader/Ribbon.frag': '',
    'shader/SphereImpostor.vert': '',
    'shader/SphereImpostor.frag': '',
    'shader/SphereMesh.vert': '',
    'shader/SphereMesh.frag': '',
    'shader/SphereHalo.vert': '',
    'shader/SphereHalo.frag': '',
    'shader/CylinderImpostor.vert': '',
    'shader/CylinderImpostor.frag': '',
    'shader/CylinderImpostor2.vert': '',
    'shader/CylinderImpostor2.frag': '',
    'shader/SDFFont.vert': '',
    'shader/SDFFont.frag': '',
    'shader/LineSprite.vert': '',
    'shader/LineSprite.frag': '',
    'shader/Mesh.vert': '',
    'shader/Mesh.frag': '',
    'shader/ParticleSprite.vert': '',
    'shader/ParticleSprite.frag': '',
    'shader/Quad.vert': '',
    'shader/Quad.frag': '',
    'shader/QuadricImpostor.vert': '',
    'shader/QuadricImpostor.frag': '',

    // shader chunks
    'shader/chunk/light_params.glsl': '',
    'shader/chunk/light.glsl': '',
    'shader/chunk/fog.glsl': '',
    'shader/chunk/fog_params.glsl': '',

};


NGL.UniformsLib = {

    'fog': THREE.UniformsLib[ "fog" ],

    'lights': THREE.UniformsUtils.merge([
        THREE.UniformsLib[ "lights" ],
        {
            "ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) },
            "emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
        }
    ])

};


NGL.Utils = {

    lineLineIntersect: function( p1, p2, p3, p4 ){

        // converted from http://paulbourke.net/geometry/pointlineplane/lineline.c
        var p13 = new THREE.Vector3(),
            p43 = new THREE.Vector3(),
            p21 = new THREE.Vector3();
        var d1343, d4321, d1321, d4343, d2121;
        var denom, numer;

        p13.x = p1.x - p3.x;
        p13.y = p1.y - p3.y;
        p13.z = p1.z - p3.z;
        p43.x = p4.x - p3.x;
        p43.y = p4.y - p3.y;
        p43.z = p4.z - p3.z;
        if( Math.abs(p43.x) < NGL.eps && Math.abs(p43.y) < NGL.eps && Math.abs(p43.z) < NGL.eps )
            return null;

        p21.x = p2.x - p1.x;
        p21.y = p2.y - p1.y;
        p21.z = p2.z - p1.z;
        if( Math.abs(p21.x) < NGL.eps && Math.abs(p21.y) < NGL.eps && Math.abs(p21.z) < NGL.eps )
            return null;

        d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
        d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
        d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
        d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
        d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;

        denom = d2121 * d4343 - d4321 * d4321;
        if( Math.abs(denom) < NGL.eps )
            return null;
        numer = d1343 * d4321 - d1321 * d4343;

        var mua = numer / denom;
        var mub = ( d1343 + d4321 * mua ) / d4343;

        var pa = new THREE.Vector3(
            p1.x + mua * p21.x,
            p1.y + mua * p21.y,
            p1.z + mua * p21.z
        );
        var pb = new THREE.Vector3(
            p3.x + mub * p43.x,
            p3.y + mub * p43.y,
            p3.z + mub * p43.z
        );

        return [ pa, pb ];

    },

};


NGL.init = function () {

    NGL.initResources();

    NGL.materialCache = {};

    this.textures = [];

}


NGL.initResources = function(){

    var deferreds = [];

    _.each( NGL.Resources, function( v, url ){
        var d;
        if( v=="image" ){
            d = $.loadImage( url ).done( 
                function( image ){ NGL.Resources[ url ] = image; }
            );
        }else{
            d = $.ajax({
                url: url,
                success: function( data ){
                    if( v=="chunk" ){
                        NGL.Resources[ url ] = data;
                    }else{
                        NGL.Resources[ url ] = data;
                    }
                },
                dataType: "text"
            });
        }
        deferreds.push( d );
    });

    $.when.apply( $, deferreds ).then( function() {
        $( NGL ).triggerHandler( "initialized" );
    });

},


NGL.getMaterial = function( params ){

    var key = JSON.stringify( params );

    if (!NGL.materialCache[ key ]) {
        NGL.materialCache[ key ] = new THREE.MeshLambertMaterial( params )
    }

    return NGL.materialCache[ key ];

};


NGL.getShader = function( name, defines ) {

    var shader = NGL.Resources[ 'shader/' + name ];
    var re = /^(?!\/\/)\s*#include\s+(\S+)/gmi;

    shader = shader.replace( re, function( match, p1 ){

        var path = 'shader/chunk/' + p1 + '.glsl';
        var chunk = NGL.Resources[ path ] || THREE.ShaderChunk[ p1 ];

        return chunk ? chunk : "";

    });

    return _.map( defines, function( def ){ return "#define " + def })
                .join("\n") + "\n" + shader;

};


NGL.JSmolControls = function ( viewer ) {

    this.handleResize();

    // force an update at start
    this.update();



}

NGL.JSmolControls.prototype = Object.create( THREE.EventDispatcher.prototype );

NGL.JSmolControls.prototype.update = function( jsmolView ){



};

NGL.JSmolControls.prototype.handleResize = function(){

};


///////////
// Viewer

NGL.Viewer = function( eid ){

    this.container = document.getElementById( eid );

    console.log( "Viewer container", this.container );

    if ( this.container === document ) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    } else {
        var box = this.container.getBoundingClientRect();
        this.width = box.width;
        this.height = box.height;
    }

    this.aspect = this.width / this.height;

    this.initParams();

    this.initCamera();

    this.initRenderer();

    this.initScene();

    this.initLights();

    this.initControls();

    this.initStats();

    window.addEventListener( 'resize', _.bind( this.onWindowResize, this ), false );

    // fog & background
    this.setBackground();
    this.setFog();

}

NGL.Viewer.prototype = {
    
    constructor: NGL.Viewer,

    initParams: function(){

        this.params = {
        
            fogType: null,
            fogColor: 0x000000,
            fogNear: 0,
            fogFar: 1000,
            fogDensity: 0.00025,

            // backgroundColor: 0xFFFFFF,
            backgroundColor: 0x000000,

            cameraType: 1,
            cameraFov: 40,
            cameraNear: 1,
            cameraFar: 10000,
            cameraZ: -300,

            specular: 0x050505,

            updateDisplay: true,

        };

    },

    initCamera: function(){

        var p = this.params;
        var lookAt = new THREE.Vector3( 0, 0, 0 );

        this.perspectiveCamera = new THREE.PerspectiveCamera( 
            p.cameraFov, this.aspect, p.cameraNear, p.cameraFar
        );
        this.perspectiveCamera.position.z = p.cameraZ;
        this.perspectiveCamera.lookAt( lookAt );

        this.orthographicCamera = new THREE.OrthographicCamera(
            this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 
            p.cameraNear, p.cameraFar
        );
        this.orthographicCamera.position.z = p.cameraZ/2;
        this.orthographicCamera.lookAt( lookAt );

        if( p.cameraType ){
            this.camera = this.perspectiveCamera;
        }else{
            this.camera = this.orthographicCamera;
        }

        this.camera.updateProjectionMatrix();

    },

    initRenderer: function(){

        this.renderer = new THREE.WebGLRenderer( { alpha: false, antialias: false } );
        this.renderer.setSize( this.width, this.height );
        this.renderer.autoClear = true;

        var _glExtensionFragDepth = this.renderer.context.getExtension('EXT_frag_depth');
        //if(!_glExtensionFragDepth) { throw "ERROR getting 'EXT_frag_depth'" }

        this.renderer.context.getExtension('OES_standard_derivatives');
        this.renderer.context.getExtension('OES_element_index_uint');

        this.container.appendChild( this.renderer.domElement );

    },

    initScene: function(){

        this.scene = new THREE.Scene();

        this.modelGroup = new THREE.Object3D();
        this.rotationGroup = new THREE.Object3D();

        this.rotationGroup.add( this.modelGroup );
        this.scene.add( this.rotationGroup );

    },

    initLights: function(){
        
        var directionalLight = new THREE.DirectionalLight( 0xFFFFFF );
        directionalLight.position = new THREE.Vector3( 1, 1, -2.5 ).normalize();
        directionalLight.intensity = 0.5;
        
        var ambientLight = new THREE.AmbientLight( 0x101010 );
        
        var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0.01)
        
        this.scene.add( directionalLight );
        this.scene.add( ambientLight );
        this.scene.add( hemisphereLight );

    },

    initControls: function(){

        this.controls = new THREE.TrackballControls( 
            this.camera, this.renderer.domElement 
        );

        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;
        this.controls.keys = [65, 83, 68];

    },

    initStats: function(){

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.container.appendChild( this.stats.domElement );

        this.rendererStats = new THREEx.RendererStats();
        this.rendererStats.domElement.style.position = 'absolute';
        this.rendererStats.domElement.style.bottom = '0px';
        this.container.appendChild( this.rendererStats.domElement );

    },

    add: function( buffer ){

        console.log( buffer );
        this.modelGroup.add( buffer.mesh );

    },

    setFog: function( type, color, near, far, density ){

        var p = this.params;

        if( !_.isNull(type) ) p.fogType = type;
        if( color ) p.fogColor = color;
        if( near ) p.fogNear = near;
        if( far ) p.fogFar = far;
        if( density ) p.fogDensity = density;

        if( p.fogType=="linear" ){
            this.scene.fog = new THREE.Fog( p.fogColor, p.fogNear, p.fogFar );
        }else if( p.fogType=="exp2" ){
            this.scene.fog = new THREE.FogExp2( p.fogColor, p.fogDensity );
        }else{
            this.scene.fog = null;
        }

        _.each( this.modelGroup.children, function( o ){
            if( o.material ) o.material.needsUpdate = true;
        });

        _.each( NGL.materialCache, function( m ){
            m.needsUpdate = true;
        });

    },

    setBackground: function( color ){

        var p = this.params;

        if( color ) p.backgroundColor = color;

        this.setFog( null, p.backgroundColor );
        this.renderer.setClearColor( p.backgroundColor, 1 );

    },

    setCamera: function( type, fov, near, far ){

        var p = this.params;

        if( !_.isNull(type) ) p.cameraType = type;
        if( fov ) p.cameraFov = fov;
        if( near ) p.cameraNear = near;
        if( far ) p.cameraFar = far;

        if( p.cameraType ){
            this.camera = this.perspectiveCamera;
        }else{
            this.camera = this.orthographicCamera;
        }
        
        this.perspectiveCamera.fov = p.cameraFov;
        this.perspectiveCamera.near = p.cameraNear;
        this.perspectiveCamera.far = p.cameraFar;

        this.orthographicCamera.near = p.cameraNear;
        this.orthographicCamera.far = p.cameraFar;
        
        this.controls.object = this.camera;
        this.camera.updateProjectionMatrix();

    },

    onWindowResize: function(){

        if ( this.container === document ) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        } else {
            var box = this.container.getBoundingClientRect();
            this.width = box.width;
            this.height = box.height;
        }
        this.aspect = this.width / this.height;

        this.perspectiveCamera.aspect = this.aspect;

        var az = this.controls.accumulatedZoom;
        this.orthographicCamera.left = az * -this.width / 2;
        this.orthographicCamera.right = az * this.width / 2;
        this.orthographicCamera.top = az * this.height / 2;
        this.orthographicCamera.bottom = az * -this.height / 2;

        this.camera.updateProjectionMatrix();
        this.controls.handleResize();
        this.renderer.setSize( this.width, this.height );

    },

    animate: function(){

        requestAnimationFrame( _.bind( this.animate, this ) );

        if( this.params.updateDisplay ){
            
            this.controls.update();
            this.render();

        }

    },

    render: function(){

        this.updateDynamicUniforms();

        // needed for font texture, but I don't know why
        _.each( NGL.textures, function( v ){
            v.uniform.value = v.tex;
        });

        this.rotationGroup.updateMatrix();
        this.rotationGroup.updateMatrixWorld( true );

        this.modelGroup.updateMatrix();
        this.modelGroup.updateMatrixWorld( true );

        this.renderer.render( this.scene, this.camera );

        this.stats.update();
        this.rendererStats.update( this.renderer );

    },

    updateDynamicUniforms: function(){

        var i, o, u;
        var matrix = new THREE.Matrix4();
        var objects = this.modelGroup.children;
        var nObjects = objects.length;
        var camera = this.camera;
        
        camera.updateMatrix();
        camera.updateMatrixWorld( true );
        camera.matrixWorldInverse.getInverse( camera.matrixWorld );
        camera.updateProjectionMatrix();

        for( i = 0; i < nObjects; i ++ ) {

            o = objects[i];
            if( !o.material ) continue;

            u = o.material.uniforms;
            if( !u ) continue;

            o.updateMatrix();
            o.updateMatrixWorld( true );

            if( u.modelViewMatrixInverse ){
                matrix.multiplyMatrices( 
                    camera.matrixWorldInverse, o.matrixWorld
                );
                u.modelViewMatrixInverse.value.getInverse( matrix );
            }

            if( u.modelViewMatrixInverseTranspose ){
                matrix.multiplyMatrices( 
                    camera.matrixWorldInverse, o.matrixWorld
                );
                u.modelViewMatrixInverseTranspose.value.getInverse( matrix ).transpose();
            }

            if( u.projectionMatrixInverse ){
                u.projectionMatrixInverse.value.getInverse(
                    camera.projectionMatrix
                );
            }

            if( u.projectionMatrixTranspose ){
                u.projectionMatrixTranspose.value.copy(
                    camera.projectionMatrix
                ).transpose();
            }

            if( u.modelViewProjectionMatrix ){
                matrix.multiplyMatrices( 
                    camera.matrixWorldInverse, o.matrixWorld
                );
                u.modelViewProjectionMatrix.value.multiplyMatrices(
                    camera.projectionMatrix, matrix
                )
            }

            if( u.modelViewProjectionMatrixInverse ){
                matrix.multiplyMatrices( 
                    camera.matrixWorldInverse, o.matrixWorld
                );
                u.modelViewProjectionMatrixInverse.value.multiplyMatrices(
                    camera.projectionMatrix, matrix
                )
                u.modelViewProjectionMatrixInverse.value.getInverse( 
                    u.modelViewProjectionMatrixInverse.value
                );
            }

        }

    },

    clear: function(){

        console.log( "scene cleared" );

        this.scene.remove( this.rotationGroup );
        
        this.modelGroup = new THREE.Object3D();
        this.rotationGroup = new THREE.Object3D();

        this.rotationGroup.add( this.modelGroup );
        this.scene.add( this.rotationGroup );

        this.renderer.clear();

    },

}


////////////////
// Buffer Core

NGL.Buffer = function () {

    // required properties:
    // - size
    // - attributeSize

    this.geometry = new THREE.BufferGeometry();

    this.addAttributes({
        "position": { type: "v3", value: null },
        "color": { type: "c", value: null },
    });
    
    this.uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
    ]);
    
}

NGL.Buffer.prototype = {
    
    constructor: NGL.Buffer,

    attributes: {},

    finalize: function(){

        this.makeIndex();

        this.material = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            attributes: this.attributes,
            vertexShader: NGL.getShader( this.vertexShader ),
            fragmentShader: NGL.getShader( this.fragmentShader ),
            depthTest: true,
            transparent: false,
            depthWrite: true,
            lights: true,
            fog: true
        });

        this.mesh = new THREE.Mesh( this.geometry, this.material );

    },

    addUniforms: function( uniforms ){

        this.uniforms = THREE.UniformsUtils.merge([ this.uniforms, uniforms ]);
    
    },

    addAttributes: function( attributes ){

        var itemSize = {
            "f": 1, "v2": 2, "v3": 3, "c": 3
        };

        _.each( attributes, function( a, name ){

            this.attributes[ name ] = { 
                "type": a.type, "value": null
            };

            this.geometry.addAttribute( 
                name, 
                new THREE.Float32Attribute( this.attributeSize, itemSize[ a.type ] )
            );

        }, this );

    },

    setAttributes: function( data ){

        var attributes = this.geometry.attributes;

        _.each( data, function( d, name ){
            
            attributes[ name ].set( data[ name ] );

        }, this );

    },

    makeIndex: function(){

        this.geometry.addAttribute( 
            "index", new THREE.Uint16Attribute( this.index.length, 1 )
        );

        this.geometry.attributes[ "index" ].array.set( this.index );

    }

};


NGL.MeshBuffer = function ( position, color, index, normal ) {

    this.size = position.length / 3;
    this.attributeSize = this.size;
    this.vertexShader = 'Mesh.vert';
    this.fragmentShader = 'Mesh.frag';
    
    this.index = index;

    NGL.Buffer.call( this );
    
    this.addAttributes({
        "normal": { type: "v3", value: null },
    });
    
    this.setAttributes({
        "position": position,
        "color": color,
        "normal": normal,
    });
    
    this.finalize();
    
}

NGL.MeshBuffer.prototype = Object.create( NGL.Buffer.prototype );


NGL.MappedBuffer = function () {

    this.mappedSize = this.size * this.mappingSize;
    this.attributeSize = this.mappedSize;

    NGL.Buffer.call( this );

    this.addAttributes({
        "mapping": { type: this.mappingType, value: null },
    });

}

NGL.MappedBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.MappedBuffer.prototype.finalize = function(){

    this.makeMapping();

    NGL.Buffer.prototype.finalize.call( this );

},

NGL.MappedBuffer.prototype.setAttributes = function( data ){

    var attributes = this.geometry.attributes;
    var size = this.size;
    var mappingSize = this.mappingSize;

    var a, d, itemSize, array, n, i, j;

    _.each( data, function( d, name ){
        
        d = data[ name ];
        a = attributes[ name ];
        itemSize = a.itemSize;
        array = a.array;
        
        for( var k = 0; k < size; ++k ) {
            
            n = k * itemSize;
            i = n * mappingSize;
            
            for( var l = 0; l < mappingSize; ++l ) {
                
                j = i + (itemSize * l);

                for( var m = 0; m < itemSize; ++m ) {
                    
                    array[ j + m ] = d[ n + m ];

                }

            }

        }

    }, this );

}

NGL.MappedBuffer.prototype.makeMapping = function(){

    var size = this.size;
    var mapping = this.mapping;
    var mappingSize = this.mappingSize;
    var mappingItemSize = this.mappingItemSize;

    var aMapping = this.geometry.attributes[ "mapping" ].array;

    for( var v = 0; v < size; v++ ) {

        aMapping.set( mapping, v * mappingItemSize * mappingSize );
        
    }

}

NGL.MappedBuffer.prototype.makeIndex = function(){

    var size = this.size;
    var chunkSize = NGL.calculateChunkSize( this.mappingSize );
    var mappingSize = this.mappingSize;
    var mappingIndices = this.mappingIndices;
    var mappingIndicesSize = this.mappingIndicesSize;
    var mappingItemSize = this.mappingItemSize;

    this.geometry.addAttribute( 
        "index", new THREE.Uint32Attribute( size * mappingIndicesSize, 1 )
    );

    var index = this.geometry.attributes[ "index" ].array;

    var i, ix, it;

    for( var v = 0; v < size; v++ ) {

        i = v * mappingItemSize * mappingSize;
        ix = v * mappingIndicesSize;
        it = v * mappingSize;
        
        index.set( mappingIndices, ix );

        for( var s=0; s<mappingIndicesSize; ++s ){
            index[ ix + s ] += it;
        }

    }

}


NGL.QuadBuffer = function () {

    this.mapping = new Float32Array([
        -1.0,  1.0,
        -1.0, -1.0,
         1.0,  1.0,
         1.0, -1.0
    ]);

    this.mappingIndices = new Uint32Array([
        0, 1, 2,
        1, 3, 2
    ]);

    this.mappingIndicesSize = 6;
    this.mappingType = "v2";
    this.mappingSize = 4;
    this.mappingItemSize = 2;

    NGL.MappedBuffer.call( this );

}

NGL.QuadBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );


NGL.BoxBuffer = function () {

    this.mapping = new Float32Array([
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0
    ]);

    this.mappingIndices = new Uint32Array([
        0, 1, 2,
        0, 2, 3,
        1, 5, 6,
        1, 6, 2,
        4, 6, 5,
        4, 7, 6,
        0, 7, 4,
        0, 3, 7,
        0, 5, 1,
        0, 4, 5,
        3, 2, 6,
        3, 6, 7
    ]);

    this.mappingIndicesSize = 36;
    this.mappingType = "v3";
    this.mappingSize = 8;
    this.mappingItemSize = 3;

    NGL.MappedBuffer.call( this );

}

NGL.BoxBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );


NGL.AlignedBoxBuffer = function () {

    this.mapping = new Float32Array([
        -1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0
    ]);

    this.mappingIndices = new Uint32Array([
        0, 1, 2,
        1, 4, 2,
        2, 4, 3,
        4, 5, 3
    ]);

    this.mappingIndicesSize = 12;
    this.mappingType = "v3";
    this.mappingSize = 6;
    this.mappingItemSize = 3;

    NGL.MappedBuffer.call( this );

}

NGL.AlignedBoxBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );


////////////////////////
// Impostor Primitives

NGL.SphereImpostorBuffer = function ( position, color, radius ) {

    this.size = position.length / 3;
    this.vertexShader = 'SphereImpostor.vert';
    this.fragmentShader = 'SphereImpostor.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
    });
    
    this.addAttributes({
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "color": color,
        "radius": radius,
    });

    this.finalize();

}

NGL.SphereImpostorBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );


NGL.HaloBuffer = function ( position, radius ) {

    this.size = position.length / 3;
    this.vertexShader = 'SphereHalo.vert';
    this.fragmentShader = 'SphereHalo.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        "color"  : { type: "c", value: new THREE.Color( 0x007700 ) },
        'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
    });
    
    this.addAttributes({
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "radius": radius,
    });

    this.finalize();

    this.material.transparent = true;
    this.material.depthWrite = false;
    this.material.lights = false;
    this.material.blending = THREE.AdditiveBlending;

}

NGL.HaloBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );


NGL.CylinderImpostorBuffer = function ( from, to, color, color2, radius ) {

    this.size = from.length / 3;
    this.vertexShader = 'CylinderImpostor.vert';
    this.fragmentShader = 'CylinderImpostor.frag';

    NGL.AlignedBoxBuffer.call( this );

    this.addUniforms({
        
    });
    
    this.addAttributes({
        "position2": { type: "v3", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius,
    });

    this.finalize();

}

NGL.CylinderImpostorBuffer.prototype = Object.create( NGL.AlignedBoxBuffer.prototype );


NGL.HyperballStickImpostorBuffer = function ( position1, position2, color1, color2, radius1, radius2, shrink ) {

    this.size = position1.length / 3;
    this.vertexShader = 'HyperballStickImpostor.vert';
    this.fragmentShader = 'HyperballStickImpostor.frag';

    NGL.BoxBuffer.call( this );

    this.addUniforms({
        'modelViewProjectionMatrix': { type: "m4", value: new THREE.Matrix4() },
        'modelViewProjectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'modelViewMatrixInverseTranspose': { type: "m4", value: new THREE.Matrix4() },
        'shrink': { type: "f", value: shrink },
    });
    
    this.addAttributes({
        "inputColor1": { type: "c", value: null },
        "inputColor2": { type: "c", value: null },
        "inputRadius1": { type: "f", value: null },
        "inputRadius2": { type: "f", value: null },
        "inputPosition1": { type: "v3", value: null },
        "inputPosition2": { type: "v3", value: null },
    });

    this.setAttributes({
        "inputColor1": color1,
        "inputColor2": color2,
        "inputRadius1": radius1,
        "inputRadius2": radius2,
        "inputPosition1": position1,
        "inputPosition2": position2,

        //"position": position1,
    });

    this.finalize();

}

NGL.HyperballStickImpostorBuffer.prototype = Object.create( NGL.BoxBuffer.prototype );


//////////////////////
// Pixel Primitives

// TODO
NGL.ParticleBuffer = function ( position, color, size ) {
    
    this.size = position.length / 3;

    this.material = new THREE.ParticleSystemMaterial({
        vertexColors: true,
        size: size,
        sizeAttenuation: false,
        fog: true
    });

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute( 'position', new THREE.Float32Attribute( this.size, 3 ) );
    this.geometry.addAttribute( 'color', new THREE.Float32Attribute( this.size, 3 ) );

    this.geometry.attributes.position.array.set( position );
    this.geometry.attributes.color.set( color );

    var particle = new THREE.ParticleSystem( this.geometry, this.material );
    NGL.group.add( particle );

}

// TODO
NGL.LineBuffer = function ( from, to, color, color2 ) {

    this.size = from.length / 3;

    var n = this.size;
    var n6 = n * 6;
    var nX = n * 2;
    if( color2 ){
        nX *= 2;
    }

    this.material = new THREE.LineBasicMaterial({
        vertexColors: true,
        fog: true
    });

    // make geometry and populate buffer
    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute( 'position', new THREE.Float32Attribute( nX, 3 ) );
    this.geometry.addAttribute( 'color', new THREE.Float32Attribute( nX, 3 ) );

    var aPosition = this.geometry.attributes.position.array;
    var aColor = this.geometry.attributes.color.array;

    var i, j;

    if( !color2 ){

        for( var v = 0; v < n; v++ ){
            
            i = v * 2 * 3;
            j = v * 3;

            aPosition[ i + 0 ] = from[ j + 0 ];
            aPosition[ i + 1 ] = from[ j + 1 ];
            aPosition[ i + 2 ] = from[ j + 2 ];
            aPosition[ i + 3 ] = to[ j + 0 ];
            aPosition[ i + 4 ] = to[ j + 1 ];
            aPosition[ i + 5 ] = to[ j + 2 ];

            aColor[ i + 0 ] = color[ j + 0 ];
            aColor[ i + 1 ] = color[ j + 1 ];
            aColor[ i + 2 ] = color[ j + 2 ];
            aColor[ i + 3 ] = color[ j + 0 ];
            aColor[ i + 4 ] = color[ j + 1 ];
            aColor[ i + 5 ] = color[ j + 2 ];
        }

    }else{

        var x, y, z, x1, y1, z1, x2, y2, z2;

        for( var v = 0; v < n; v++ ){

            j = v * 3;

            x1 = from[ j + 0 ];
            y1 = from[ j + 1 ];
            z1 = from[ j + 2 ];

            x2 = to[ j + 0 ];
            y2 = to[ j + 1 ];
            z2 = to[ j + 2 ];

            x = ( x1 + x2 ) / 2.0;
            y = ( y1 + y2 ) / 2.0;
            z = ( z1 + z2 ) / 2.0;

            i = v * 2 * 3;
            aPosition[ i + 0 ] = from[ j + 0 ];
            aPosition[ i + 1 ] = from[ j + 1 ];
            aPosition[ i + 2 ] = from[ j + 2 ];
            aPosition[ i + 3 ] = x;
            aPosition[ i + 4 ] = y;
            aPosition[ i + 5 ] = z;
            aColor[ i + 0 ] = color[ j + 0 ];
            aColor[ i + 1 ] = color[ j + 1 ];
            aColor[ i + 2 ] = color[ j + 2 ];
            aColor[ i + 3 ] = color[ j + 0 ];
            aColor[ i + 4 ] = color[ j + 1 ];
            aColor[ i + 5 ] = color[ j + 2 ];

            i2 = i + n6;
            aPosition[ i2 + 0 ] = x;
            aPosition[ i2 + 1 ] = y;
            aPosition[ i2 + 2 ] = z;
            aPosition[ i2 + 3 ] = to[ j + 0 ];
            aPosition[ i2 + 4 ] = to[ j + 1 ];
            aPosition[ i2 + 5 ] = to[ j + 2 ];
            aColor[ i2 + 0 ] = color2[ j + 0 ];
            aColor[ i2 + 1 ] = color2[ j + 1 ];
            aColor[ i2 + 2 ] = color2[ j + 2 ];
            aColor[ i2 + 3 ] = color2[ j + 0 ];
            aColor[ i2 + 4 ] = color2[ j + 1 ];
            aColor[ i2 + 5 ] = color2[ j + 2 ];
        }
    }

    var line = new THREE.Line( this.geometry, this.material, THREE.LinePieces );
    NGL.group.add( line );

}


//////////////////////
// Sprite Primitives

NGL.ParticleSpriteBuffer = function ( position, color, radius ) {

    this.size = position.length / 3;
    this.vertexShader = 'ParticleSprite.vert';
    this.fragmentShader = 'ParticleSprite.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
    });
    
    this.addAttributes({
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "color": color,
        "radius": radius,
    });

    this.finalize();

    this.material.lights = false;

}

NGL.ParticleSpriteBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );




////////////////
// Text & Font

NGL.getFont = function( name ){

    // see also https://github.com/libgdx/libgdx/wiki/Distance-field-fonts
    //
    // fnt format
    // id -  The ID of the character from the font file.
    // x - X position within the bitmap image file.
    // y - Y position within the bitmap image file.
    // width - Width of the character in the image file.
    // height - Height of the character in the image file.
    // xoffset - Number of pixels to move right before drawing this character.
    // yoffset - Number of pixels to move down before drawing this character.
    // xadvance - Number of pixels to jump right after drawing this character.
    // page - The image to use if characters are split across multiple images.
    // chnl - The color channel, if color channels are used for separate characters.

    var fnt = NGL.Resources[ 'font/' + name + '.fnt' ].split('\n');
    var font = {};
    var tWidth = 1024;
    var tHeight = 1024;
    var base = 29;
    var lineHeight = 37;

    _.each( fnt, function( line, i ){

        if( line.substr( 0, 5 )=='char ' ){

            var character = {};
            var ls = line.substr(5).split( /\s+/ );
            _.each( ls, function( field, i ){
                var fs = field.split('=');
                character[ fs[0] ] = parseInt( fs[1] );
            });
            var x = character.x;
            var y = character.y;
            var width = character.width;
            var height = character.height;
            character.textureCoords = new Float32Array([
                x/tWidth            ,1 - y/tHeight,                 // top left
                x/tWidth            ,1 - (y+height)/tHeight,        // bottom left
                (x+width)/tWidth    ,1 - y/tHeight,                 // top right
                (x+width)/tWidth    ,1 - (y+height)/tHeight,        // bottom right
            ]);
            character.width2 = (20*width)/tWidth;
            character.height2 = (20*height)/tHeight;
            character.xadvance2 = (20*(character.xadvance))/tWidth;
            character.xoffset2 = (20*(character.xoffset))/tWidth;
            character.yoffset2 = (20*(character.yoffset))/tHeight;
            character.lineHeight = (20*37)/512;
            font[ character['id'] ] = character;

        }else{

            //console.log( i, line );

        }

    })
    
    return font;

}


NGL.TextBuffer = function ( position, size, text ) {

    var type = 'Arial';
    var font = NGL.getFont( type );
    var tex = new THREE.Texture( NGL.Resources[ 'font/' + type + '.png' ] );
    tex.needsUpdate = true;

    var n = position.length / 3;
    text = [];
    for( var i = 0; i < n; i++ ){
        text.push( "#" + i );
    }

    var charCount = _.reduce( text, function( memo, t ){ return memo + t.length; }, 0 );

    this.size = charCount;
    this.vertexShader = 'SDFFont.vert';
    this.fragmentShader = 'SDFFont.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        "color"  : { type: "c", value: new THREE.Color( 0xFFFFFF ) },
        "fontTexture"  : { type: "t", value: tex }
    });

    NGL.textures.push({ uniform: this.uniforms.fontTexture, tex: tex });
    
    this.addAttributes({
        "inputTexCoord": { type: "v2", value: null },
        "inputSize": { type: "f", value: null },
    });

    var aPosition = this.geometry.attributes[ "position" ].array;
    var inputTexCoord = this.geometry.attributes[ "inputTexCoord" ].array;
    var inputSize = this.geometry.attributes[ "inputSize" ].array;
    var inputMapping = this.geometry.attributes[ "mapping" ].array;

    var c;
    var i, j, o;
    var iCharAll = 0;
    var txt, xadvance, iChar, nChar;

    for( var v = 0; v < n; v++ ) {

        o = 3 * v;
        txt = text[ v ];
        xadvance = 0;
        nChar = txt.length;

        for( iChar = 0; iChar < nChar; iChar++, iCharAll++ ) {

            c = font[ txt.charCodeAt( iChar ) ];
            i = iCharAll * 2 * 4;

            // top left
            inputMapping[ i + 0 ] = xadvance + c.xoffset2;
            inputMapping[ i + 1 ] = c.lineHeight - c.yoffset2;
            // bottom left
            inputMapping[ i + 2 ] = xadvance + c.xoffset2;
            inputMapping[ i + 3 ] = c.lineHeight - c.yoffset2 - c.height2;
            // top right
            inputMapping[ i + 4 ] = xadvance + c.xoffset2 + c.width2;
            inputMapping[ i + 5 ] = c.lineHeight - c.yoffset2;
            // bottom right
            inputMapping[ i + 6 ] = xadvance + c.xoffset2 + c.width2;
            inputMapping[ i + 7 ] = c.lineHeight - c.yoffset2 - c.height2;

            inputTexCoord.set( c.textureCoords, i );

            for( var m = 0; m < 4; m++ ) {

                j = iCharAll * 4 * 3 + (3 * m);

                aPosition[ j + 0 ] = position[ o + 0 ];
                aPosition[ j + 1 ] = position[ o + 1 ];
                aPosition[ j + 2 ] = position[ o + 2 ];

                inputSize[ (iCharAll * 4) + m ] = size[ v ];

            }

            xadvance += c.xadvance2;
        }

    }

    this.finalize();

    this.material.transparent = true;
    this.material.depthWrite = false;
    this.material.lights = false;
    this.material.blending = THREE.AdditiveBlending;

}

NGL.TextBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );

NGL.TextBuffer.prototype.setAttributes = function( data ){ 
    
    // TODO implement; move code from contructor here

    // NGL.QuadBuffer.prototype.setAttributes.call( this, data );

}

NGL.TextBuffer.prototype.makeMapping = function(){ 
    
    // mapping done in the contructor

}


/////////////
// Geometry

// NGL.GeometryBuffer

// // geometries
// this.sphereGeometry = new THREE.IcosahedronGeometry( 2, 1 );
// var matrix = new THREE.Matrix4().makeRotationX( Math.PI/ 2  );
// this.cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, true);
// this.cylinderGeometry.applyMatrix( matrix );
// this.cylinderCappedGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false);
// this.cylinderCappedGeometry.applyMatrix( matrix );




/////////////////
// Experimental

NGL.getPathData = function( position, color, size, segments ){
    var n = position.length/3;
    var n1 = n - 1;
    var numpoints = segments*n1 + 2;
    var numpoints3 = numpoints * 3;
    var numpoints1 = numpoints - 1;
    
    var points = [];
    var j;
    for( var v = 0; v < n; ++v ) {
        j = 3 * v;
        points.push( new THREE.Vector3( 
            position[ j + 0 ], position[ j + 1 ], position[ j + 2 ] )
        );
    }
    var path = new THREE.SplineCurve3( points )
    
    var frames = new THREE.TubeGeometry.FrenetFrames( path, numpoints, false );
    var tangents = frames.tangents;
    var normals = frames.normals;
    var binormals = frames.binormals;

    var aPoints = new Float32Array( numpoints3 );
    var aNormals = new Float32Array( numpoints3 );
    var aBinormals = new Float32Array( numpoints3 );
    var aTangents = new Float32Array( numpoints3 );
    var aColor = new Float32Array( numpoints3 );
    var aSize = new Float32Array( numpoints );

    var i3, p, j;
    for ( var i = 0; i < numpoints; i++ ) {
        i3 = i*3;
        p = path.getPointAt( i / numpoints1 );
        // p = path.getPoint( i / numpoints1 );
        
        aPoints[ i3 + 0 ] = p.x;
        aPoints[ i3 + 1 ] = p.y;
        aPoints[ i3 + 2 ] = p.z;
        
        aNormals[ i3 + 0 ] = normals[ i ].x;
        aNormals[ i3 + 1 ] = normals[ i ].y;
        aNormals[ i3 + 2 ] = normals[ i ].z;
        
        aBinormals[ i3 + 0 ] = binormals[ i ].x;
        aBinormals[ i3 + 1 ] = binormals[ i ].y;
        aBinormals[ i3 + 2 ] = binormals[ i ].z;

        aTangents[ i3 + 0 ] = tangents[ i ].x;
        aTangents[ i3 + 1 ] = tangents[ i ].y;
        aTangents[ i3 + 2 ] = tangents[ i ].z;
        
        j = Math.min( Math.floor( i / segments ), n1 );
        j3 = j * 3;
        aColor[ i3 + 0 ] = color[ j3 + 0 ];
        aColor[ i3 + 1 ] = color[ j3 + 1 ];
        aColor[ i3 + 2 ] = color[ j3 + 2 ];
    }

    var curSize, stepSize, l;
    var prevSize = size[0];
    for ( var i = 0; i < n1; i++ ) {
        j = i * segments;
        curSize = size[ i ];
        if( curSize<0 ){
            prevSize = curSize * -1.5;
            curSize = 0;
        }
        stepSize = (prevSize-curSize)/(segments-1);
        for ( var l = 0; l < segments; l++ ) {
            aSize[ j + l ] = prevSize - l * stepSize;
            if( curSize==0 ) aSize[ j + l ] *= -1;
        }
        prevSize = curSize==0 ? Math.abs( size[ i ] ) : curSize;
    }
    
    return {
        "position": aPoints,
        "normal": aNormals,
        "dir": aBinormals,
        "color": aColor,
        "size": aSize,
        "binormals": aBinormals,
        "normals": aNormals,
        "tangents": aTangents
    }
}


// TODO
NGL.TubeImpostorBufferX = function ( position, normal, dir, color, radius ) {

    this.size = from.length / 3;
    this.vertexShader = 'TubeImpostor.vert';
    this.fragmentShader = 'TubeImpostor.frag';

    NGL.AlignedBoxBuffer.call( this );

    this.addUniforms({
        
    });
    
    this.addAttributes({
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "radius": radius,
    });

    this.finalize();

    this.material.transparent = true;
    this.material.depthWrite = false;
    this.material.lights = false;
    this.material.blending = THREE.AdditiveBlending;

}

NGL.TubeImpostorBufferX.prototype = Object.create( NGL.AlignedBoxBuffer.prototype );


NGL.HyperballSphereImpostorBuffer = function ( position, color, radius ) {

    this.size = position.length / 3;
    this.vertexShader = 'HyperballSphereImpostor.vert';
    this.fragmentShader = 'HyperballSphereImpostor.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        'modelViewProjectionMatrix': { type: "m4", value: new THREE.Matrix4() },
        'modelViewProjectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'modelViewMatrixInverseTranspose': { type: "m4", value: new THREE.Matrix4() },
    });
    
    this.addAttributes({
        "aRadius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "color": color,
        "aRadius": radius,
    });

    this.finalize();

}

NGL.HyperballSphereImpostorBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );


// TODO
NGL.CrossBuffer = function ( position, color, size ) {
    
    // screen aligned; pixel buffer

}


/////////
// Todo

// NGL.chunkSize = 65536;
NGL.chunkSize = 65520; // divisible by 4 (quad mapping) and 6 (box mapping) and 8 (box mapping 2)
// NGL.chunkSize = 4294967296;


NGL.calculateOffsets = function ( n, nTriangle, nVertex ) {
    var ratio = nTriangle / nVertex;
    var offsets = [];
    var offsetCount = n / NGL.chunkSize;
    for (var i = 0; i < offsetCount; i++) {
        var offset = {
            start: i * NGL.chunkSize * ratio * 3,
            index: i * NGL.chunkSize,
            count: Math.min(
                n*ratio - (i * NGL.chunkSize * ratio), 
                NGL.chunkSize * ratio
            ) * 3
        };
        offsets.push( offset );
    }
    return offsets;
}


NGL.calculateChunkSize = function( nVertex ){

    return NGL.chunkSize - ( NGL.chunkSize % nVertex );

}


NGL.BufferVectorHelper = function( position, vector, color ){

    var geometry, material, line;
    var n = position.length/3;
    var n2 = n * 2;
    var n6 = n * 6;

    material = new THREE.LineBasicMaterial({ color: color, fog: true });
    geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.Float32Attribute( n2, 3 ) );

    var aPosition = geometry.attributes.position.array;

    var i, j;

    for( var v = 0; v < n; v++ ){
        
        i = v * 2 * 3;
        j = v * 3;

        aPosition[ i + 0 ] = position[ j + 0 ];
        aPosition[ i + 1 ] = position[ j + 1 ];
        aPosition[ i + 2 ] = position[ j + 2 ];
        aPosition[ i + 3 ] = position[ j + 0 ] + vector[ j + 0 ] * 5;
        aPosition[ i + 4 ] = position[ j + 1 ] + vector[ j + 1 ] * 5;
        aPosition[ i + 5 ] = position[ j + 2 ] + vector[ j + 2 ] * 5;
    }

    // console.log( "position", aPosition );

    line = new THREE.Line( geometry, material, THREE.LinePieces );
    NGL.group.add( line );


    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.line = line;
    this.n = n;
}


NGL.BezierRaymarchBuffer = function ( p0, p1, p2, color, radius ) {

    // http://http.developer.nvidia.com/GPUGems3/gpugems3_ch25.html
    // https://github.com/Quoturnix/bezier-fragment-shader-demo
    // http://gamedev.stackexchange.com/questions/49373/how-to-draw-a-bezier-line-with-shaders

    // http://glsl.heroku.com/e#4971.0
    // http://glsl.heroku.com/e#5007.0

    // http://arcadeengine.googlecode.com/svn/trunk/Framework/Graphic/shaders/bezier.vert

    // https://www.shadertoy.com/view/XsX3zf
    // https://www.shadertoy.com/view/ldj3Wh

    // smoothness
    // http://html5tutorial.com/how-to-join-two-bezier-curves-with-the-canvas-api/

    // Approximating cubic Bezier curves by quadratic ones
    // http://www.caffeineowl.com/graphics/2d/vectorial/cubic2quad01.html
    // http://stackoverflow.com/questions/2009160/how-do-i-convert-the-2-control-points-of-a-cubic-curve-to-the-single-control-poi
    // http://academia.wikia.com/wiki/Approximating_cubic_Bezier_curves
    //

    var geometry, material, mesh;
    var n = p0.length/3;
    var n6 = n * 6;

    // make shader material
    var attributes = {
        inputP0: { type: 'v3', value: null },
        inputP1: { type: 'v3', value: null },
        inputP2: { type: 'v3', value: null },
        inputMapping: { type: 'v2', value: null },
        inputColor: { type: 'c', value: null },
        inputAxis: { type: 'v3', value: null },
        inputCylinderRadius: { type: 'f', value: null },
        inputCylinderHeight: { type: 'f', value: null },
        inputBezierRadius: { type: 'f', value: null }
    };
    
    var uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
    ]);

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'BezierRaymarch.vert' ),
        fragmentShader: NGL.getShader( 'BezierRaymarch.frag' ),
        depthTest: true,
        transparent: false,
        depthWrite: true,
        lights: true,
        //blending: THREE.CustomBlending,
        // blendSrc: THREE.OneFactor,
        fog: true
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputP0', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputP1', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputP2', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputMapping', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputColor', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputAxis', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputCylinderRadius', new THREE.Float32Attribute( n6, 1 ) );
    geometry.addAttribute( 'inputCylinderHeight', new THREE.Float32Attribute( n6, 1 ) );
    geometry.addAttribute( 'inputBezierRadius', new THREE.Float32Attribute( n6, 1 ) );

    var aPosition = geometry.attributes.position.array;
    var aP0 = geometry.attributes.inputP0.array;
    var aP1 = geometry.attributes.inputP1.array;
    var aP2 = geometry.attributes.inputP2.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputColor = geometry.attributes.inputColor.array;
    var inputAxis = geometry.attributes.inputAxis.array;
    var inputCylinderRadius = geometry.attributes.inputCylinderRadius.array;
    var inputCylinderHeight = geometry.attributes.inputCylinderHeight.array;
    var inputBezierRadius = geometry.attributes.inputBezierRadius.array;

    geometry.addAttribute( 'index', new THREE.Uint16Attribute( n * 12, 1 ) );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n6, 4, 6 );

    var r, g, b;
    var ax, ay, az;
    var bx, by, bz;
    var cx, cy, cz;
    var mx, my, mz;
    var height;
    var len1, len2, height2;
    var i, j, k, ix, it;
    var chunkSize = NGL.calculateChunkSize( 6 );

    for( var v = 0; v < n; v++ ) {
        i = v * 3 * 6;
        k = v * 3;

        inputMapping.set( NGL.BoxMapping, i );

        ax = p2[ k + 0 ] - p0[ k + 0 ];
        ay = p2[ k + 1 ] - p0[ k + 1 ];
        az = p2[ k + 2 ] - p0[ k + 2 ];

        bx = p2[ k + 0 ] - p1[ k + 0 ];
        by = p2[ k + 1 ] - p1[ k + 1 ];
        bz = p2[ k + 2 ] - p1[ k + 2 ];

        cx = p1[ k + 0 ] - p0[ k + 0 ];
        cy = p1[ k + 1 ] - p0[ k + 1 ];
        cz = p1[ k + 2 ] - p0[ k + 2 ];

        mx = ( p0[ k + 0 ] + p1[ k + 0 ] + p2[ k + 0 ] ) / 3;
        my = ( p0[ k + 1 ] + p1[ k + 1 ] + p2[ k + 1 ] ) / 3;
        mz = ( p0[ k + 2 ] + p1[ k + 2 ] + p2[ k + 2 ] ) / 3;

        r = color[ k + 0 ];
        g = color[ k + 1 ];
        b = color[ k + 2 ];

        height = Math.sqrt( ax*ax + ay*ay + az*az );
        len1 = Math.sqrt( bx*bx + by*by + bz*bz );
        len2 = Math.sqrt( cx*cx + cy*cy + cz*cz );

        height2 = Math.sqrt( 
            2*( len1*len1*len2*len2 + len2*len2*height*height + height*height*len1*len1 ) - 
            ( len1*len1*len1*len1 + len2*len2*len2*len2 + height*height*height*height )
        )/(2*height);

        for( var m = 0; m < 6; m++ ) {
            j = v * 6 * 3 + (3 * m);

            inputColor[ j + 0 ] = r;
            inputColor[ j + 1 ] = g;
            inputColor[ j + 2 ] = b;

            aPosition[ j + 0 ] = mx;
            aPosition[ j + 1 ] = my;
            aPosition[ j + 2 ] = mz;

            inputAxis[ j + 0 ] = ax;
            inputAxis[ j + 1 ] = ay;
            inputAxis[ j + 2 ] = az;

            aP0[ j + 0 ] = p0[ k + 0 ];
            aP0[ j + 1 ] = p0[ k + 1 ];
            aP0[ j + 2 ] = p0[ k + 2 ];

            aP1[ j + 0 ] = p1[ k + 0 ];
            aP1[ j + 1 ] = p1[ k + 1 ];
            aP1[ j + 2 ] = p1[ k + 2 ];

            aP2[ j + 0 ] = p2[ k + 0 ];
            aP2[ j + 1 ] = p2[ k + 1 ];
            aP2[ j + 2 ] = p2[ k + 2 ];

            inputCylinderRadius[ (v * 6) + m ] = (height2/2) + 2*radius[ v ];
            inputCylinderHeight[ (v * 6) + m ] = height + 2*radius[ v ];
            inputBezierRadius[ (v * 6) + m ] = radius[ v ];
        }

        ix = v * 12;
        it = v * 6;

        indices.set( NGL.BoxIndices, ix );
        for( var s=0; s<12; ++s ){
            indices[ix + s] = (it + indices[ix + s]) % chunkSize;
        }
    }

    // console.log( "inputMapping", inputMapping );
    // console.log( "inputColor", inputColor );
    // console.log(  "aPosition", aPosition );
    // console.log( "inputCylinderRadius", inputCylinderRadius );
    // console.log( "inputCylinderHeight", inputCylinderHeight );
    // console.log( "indices", indices );

    mesh = new THREE.Mesh( geometry, material );
    NGL.group.add( mesh );


    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
    this.n = n;
}


NGL.BezierImpostorBuffer = function ( p0, p1, p2, color, radius, segments ) {

    var n = p0.length/3;
    var n3 = n * 3;
    var nx = n * segments;
    var nx3 = nx * 3;

    var cylFrom = new Float32Array( nx3 );
    var cylTo = new Float32Array( nx3 );
    var cylColor = new Float32Array( nx3 );
    var cylRadius = new Float32Array( nx );
    var spherePos = new Float32Array( nx3 );
    var frenetNormal = new Float32Array( nx3 + 3 );

    var frames, tangents, normals, binormals;

    var path, i, j, k, l, rad, s, j1;
    var pPrev, pCur, pNext;
    var nPrev, nCur, nNext;
    var p0, p1, p2;
    var r, g, b;
    for( var v = 0; v < n; v++ ) {
        i = 3 * v;
        k = i * segments;
        l = v * segments;

        r = color[ i + 0 ];
        g = color[ i + 1 ];
        b = color[ i + 2 ];

        rad = radius[ v ];

        path = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3( p0[ i + 0 ], p0[ i + 1 ], p0[ i + 2 ] ),
            new THREE.Vector3( p1[ i + 0 ], p1[ i + 1 ], p1[ i + 2 ] ),
            new THREE.Vector3( p2[ i + 0 ], p2[ i + 1 ], p2[ i + 2 ] )
        );

        frames = new THREE.TubeGeometry.FrenetFrames( path, segments, false );
        tangents = frames.tangents;
        normals = frames.normals;
        binormals = frames.binormals;
        
        // console.log(path);
        // console.log( p0[ i + 0 ], p0[ i + 1 ], p0[ i + 2 ] );
        // console.log( p1[ i + 0 ], p1[ i + 1 ], p1[ i + 2 ] );
        // console.log( p2[ i + 0 ], p2[ i + 1 ], p2[ i + 2 ] );


        frenetNormal[ 0 ] = normals[ 0 ].x
        frenetNormal[ 1 ] = normals[ 0 ].y
        frenetNormal[ 2 ] = normals[ 0 ].z

        var pPrev = path.getPointAt( 0 );
        //var pCur = path.getPointAt( 1 );
        //var nPrev = 
        //console.log( "bezier", v + 1 );
        //console.log( pPrev );
        for ( j = 1; j <= segments; j++ ) {

            // add from frenet frame to shader and 

            j1 = j - 1;
            s = k + 3 * j1;
            t = k + 3 * j;
            //pCur = path.getPointAt( j / ( segments ) );
            pNext = path.getPoint( j / ( segments ) );
            // console.log( pNext, normals[j] );

            cylFrom[ s + 0 ] = pPrev.x;
            cylFrom[ s + 1 ] = pPrev.y;
            cylFrom[ s + 2 ] = pPrev.z;

            cylTo[ s + 0 ] = pNext.x;
            cylTo[ s + 1 ] = pNext.y;
            cylTo[ s + 2 ] = pNext.z;

            cylColor[ s + 0 ] = r;
            cylColor[ s + 1 ] = g;
            cylColor[ s + 2 ] = b;

            frenetNormal[ t + 0 ] = normals[ j ].x
            frenetNormal[ t + 1 ] = normals[ j ].y
            frenetNormal[ t + 2 ] = normals[ j ].z

            cylRadius[ l + j1 ] = rad;

            pPrev = pNext;
        }
    }

    // console.log( "cylFrom", cylFrom );
    // console.log( "cylTo", cylTo );
    // console.log( "cylColor", cylColor );
    // console.log( "cylRadius", cylRadius );
    // console.log( "frenetNormal", frenetNormal );

    new NGL.CylinderImpostorBuffer( cylFrom, cylTo, cylColor, cylColor, cylRadius, segments );
    new NGL.SphereImpostorBuffer( cylFrom, cylColor, cylRadius, false );
    new NGL.SphereImpostorBuffer( cylTo, cylColor, cylRadius, false );
}


NGL.EllipticBezierImpostorBuffer = function ( p0, p1, p2, color, radius, segments ) {

    var n = p0.length/3;
    var n3 = n * 3;
    var nx = n * segments;
    var nx3 = nx * 3;

    var position = new Float32Array( nx3 );
    var xdir = new Float32Array( nx3 );
    var ydir = new Float32Array( nx3 );
    var zdir = new Float32Array( nx3 );
    var inputColor = new Float32Array( nx3 );

    var frames, tangents, normals, binormals;

    var path, i, j, k, l, rad, s, j1;
    var p = new THREE.Vector3();
    var pv = new THREE.Vector3();
    var pPrev, pNext;
    var p0, p1, p2;
    var r, g, b;
    for( var v = 0; v < n; v++ ) {
        i = 3 * v;
        k = i * segments;
        l = v * segments;

        r = color[ i + 0 ];
        g = color[ i + 1 ];
        b = color[ i + 2 ];

        rad = radius[ v ];

        path = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3( p0[ i + 0 ], p0[ i + 1 ], p0[ i + 2 ] ),
            new THREE.Vector3( p1[ i + 0 ], p1[ i + 1 ], p1[ i + 2 ] ),
            new THREE.Vector3( p2[ i + 0 ], p2[ i + 1 ], p2[ i + 2 ] )
        );

        frames = new THREE.TubeGeometry.FrenetFrames( path, segments, false );
        tangents = frames.tangents;
        normals = frames.normals;
        binormals = frames.binormals;
        
        pPrev = path.getPointAt( 0 );

        for ( j = 1; j <= segments; j++ ) {

            j1 = j - 1;
            s = k + 3 * j1;
            t = k + 3 * j;

            pNext = path.getPoint( j / ( segments ) );
            p.copy( pPrev ).add( pNext ).divideScalar( 2.0 );

            position[ s + 0 ] = p.x;
            position[ s + 1 ] = p.y;
            position[ s + 2 ] = p.z;

            binormals[ j1 ].setLength( 3.0 );
            normals[ j1 ].setLength( 1.0 );
            tangents[ j1 ].setLength( pPrev.distanceTo( pNext ) / 2.0 );

            xdir[ s + 0 ] = binormals[ j1 ].x;
            xdir[ s + 1 ] = binormals[ j1 ].y;
            xdir[ s + 2 ] = binormals[ j1 ].z;

            ydir[ s + 0 ] = normals[ j1 ].x;
            ydir[ s + 1 ] = normals[ j1 ].y;
            ydir[ s + 2 ] = normals[ j1 ].z;

            pv.copy( pNext ).sub( pPrev ).divideScalar( 2.0 );

            zdir[ s + 0 ] = pv.x;
            zdir[ s + 1 ] = pv.y;
            zdir[ s + 2 ] = pv.z;

            inputColor[ s + 0 ] = r;
            inputColor[ s + 1 ] = g;
            inputColor[ s + 2 ] = b;

            pPrev = pNext;
        }
    }

    // console.log( "position", position );
    // console.log( "binormals", binormals );
    // console.log( "cylColor", cylColor );
    // console.log( "cylRadius", cylRadius );
    // console.log( "frenetNormal", frenetNormal );

    // new NGL.BufferVectorHelper( position, xdir, new THREE.Color( "blue" ) );
    // new NGL.BufferVectorHelper( position, ydir, new THREE.Color( "green" ) );
    // new NGL.BufferVectorHelper( position, zdir, new THREE.Color( "red" ) );

    new NGL.EllipticCylinderImpostorBuffer( position, xdir, ydir, zdir, inputColor, segments );
}


NGL.BezierGroup = function ( p0, p1, p2, color, radius ) {

    var group;
    var n = p0.length/3;

    group = new THREE.Object3D();

    var path, geometry, mesh, i;
    var p0, p1, p2;
    var colr = new THREE.Color();
    for( var v = 0; v < n; v++ ) {
        i = 3 * v;
        colr.r = color[ i + 0 ];
        colr.g = color[ i + 1 ];
        colr.b = color[ i + 2 ];

        path = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3( p0[ i + 0 ], p0[ i + 1 ], p0[ i + 2 ] ),
            new THREE.Vector3( p1[ i + 0 ], p1[ i + 1 ], p1[ i + 2 ] ),
            new THREE.Vector3( p2[ i + 0 ], p2[ i + 1 ], p2[ i + 2 ] )
        );

        geometry = new THREE.TubeGeometry( path, 4, radius[ v ], 8 );

        mesh = new THREE.Mesh(
            geometry,
            NGL.getMaterial({ 
                color: colr, 
                specular: 0x050505, 
                visible: true,
                wireframe: false,
                side: THREE.DoubleSide, 
                fog: true
            })
        );
        group.add( mesh );
    }

    NGL.group.add( group );

    // public attributes
    this.group = group;
    this.n = n;
}


NGL.TubeImpostorBuffer = function ( position, normal, dir, color, radius ) {

    var n = ( position.length/3 ) - 1;
    var n3 = n * 3;

    var cylFrom = new Float32Array( n3 );
    var cylTo = new Float32Array( n3 );
    var cylColor = new Float32Array( n3 );
    var cylColor2 = new Float32Array( n3 );
    var cylRadius = new Float32Array( n );
    var spherePos = new Float32Array( n3 );


    var i;
    for( var v = 0; v < n; v++ ) {
        i = 3 * v;

        cylFrom[ i + 0 ] = position[ i + 0 ];
        cylFrom[ i + 1 ] = position[ i + 1 ];
        cylFrom[ i + 2 ] = position[ i + 2 ];

        cylTo[ i + 0 ] = position[ i + 3 ];
        cylTo[ i + 1 ] = position[ i + 4 ];
        cylTo[ i + 2 ] = position[ i + 5 ];

        cylColor[ i + 0 ] = color[ i + 0 ];
        cylColor[ i + 1 ] = color[ i + 1 ];
        cylColor[ i + 2 ] = color[ i + 2 ];

        cylColor2[ i + 0 ] = color[ i + 3 ];
        cylColor2[ i + 1 ] = color[ i + 4 ];
        cylColor2[ i + 2 ] = color[ i + 5 ];

        cylRadius[ v ] = radius[ v ]
    }

    // console.log( "cylFrom", cylFrom );
    // console.log( "cylTo", cylTo );
    // console.log( "cylColor", cylColor );
    // console.log( "cylRadius", cylRadius );

    new NGL.CylinderImpostorBuffer( cylFrom, cylTo, cylColor, cylColor, cylRadius, n );
}


NGL.TubeGroup = function( position, color, radius, segments ){

    var group = new THREE.Object3D();
    var n = position.length/3;

    var i;    
    var points = []
    for( var v = 0; v < n; v++ ) {
        i = 3 * v;
        points.push( new THREE.Vector3( 
            position[ i + 0 ], position[ i + 1 ], position[ i + 2 ] )
        );
    }
    var path = new THREE.SplineCurve3( points )

    var geometry = new THREE.TubeGeometry( path, n*segments, radius[ 0 ], 12 );

    var mesh = new THREE.Mesh(
        geometry,
        NGL.getMaterial({ 
            //color: new THREE.Color( 0.5, 0.5, 0.5 ), 
            specular: 0x050505, 
            visible: true,
            wireframe: false,
            side: THREE.DoubleSide,
            fog: true
        })
    );
    group.add( mesh );


    NGL.group.add( group );

    // public attributes
    this.group = group;
    this.n = n;
}


NGL.RibbonBuffer = function( position, normal, dir, color, size ){

    var geometry, material, mesh;
    var n = ( position.length/3 ) - 1;
    var n4 = n * 4;


    // make shader material
    var attributes = {
        inputDir: { type: 'v3', value: null },
        inputSize: { type: 'f', value: null },
        inputNormal: { type: 'v3', value: null },
        inputColor: { type: 'v3', value: null }
    };
    var uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
    ]);

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'Ribbon.vert' ),
        fragmentShader: NGL.getShader( 'Ribbon.frag' ),
        side: THREE.DoubleSide,
        lights: true,
        fog: true
    });


    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', new THREE.Float32Attribute( n4, 3 ) );
    geometry.addAttribute( 'inputDir', new THREE.Float32Attribute( n4, 3 ) );
    geometry.addAttribute( 'inputSize', new THREE.Float32Attribute( n4, 1 ) );
    geometry.addAttribute( 'normal', new THREE.Float32Attribute( n4, 3 ) );
    //geometry.addAttribute( 'inputNormal', new THREE.Float32Attribute( n4, 3 ) );
    geometry.addAttribute( 'inputColor', new THREE.Float32Attribute( n4, 3 ) );

    var aPosition = geometry.attributes.position.array;
    var inputDir = geometry.attributes.inputDir.array;
    var inputSize = geometry.attributes.inputSize.array;
    var inputNormal = geometry.attributes.normal.array;
    //var inputNormal = geometry.attributes.inputNormal.array;
    var inputColor = geometry.attributes.inputColor.array;

    geometry.addAttribute( 'index', new THREE.Uint16Attribute( n * 6, 1 ) );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n4, 2, 4 );
    var chunkSize = NGL.calculateChunkSize( 4 );

    var i, k, p, l, it, ix, v3;
    var prevSize = size[0];
    for( var v = 0; v < n; ++v ){
        v3 = v * 3;
        k = v * 3 * 4;
        l = v * 4;

        aPosition[ k + 0 ] = position[ v3 + 0 ];
        aPosition[ k + 1 ] = position[ v3 + 1 ];
        aPosition[ k + 2 ] = position[ v3 + 2 ];

        aPosition[ k + 3 ] = position[ v3 + 0 ];
        aPosition[ k + 4 ] = position[ v3 + 1 ];
        aPosition[ k + 5 ] = position[ v3 + 2 ];

        aPosition[ k + 6 ] = position[ v3 + 3 ];
        aPosition[ k + 7 ] = position[ v3 + 4 ];
        aPosition[ k + 8 ] = position[ v3 + 5 ];

        aPosition[ k + 9 ] = position[ v3 + 3 ];
        aPosition[ k + 10 ] = position[ v3 + 4 ];
        aPosition[ k + 11 ] = position[ v3 + 5 ];

        inputNormal[ k + 0 ] = normal[ v3 + 0 ];
        inputNormal[ k + 1 ] = normal[ v3 + 1 ];
        inputNormal[ k + 2 ] = normal[ v3 + 2 ];

        inputNormal[ k + 3 ] = normal[ v3 + 0 ];
        inputNormal[ k + 4 ] = normal[ v3 + 1 ];
        inputNormal[ k + 5 ] = normal[ v3 + 2 ];

        inputNormal[ k + 6 ] = normal[ v3 + 3 ];
        inputNormal[ k + 7 ] = normal[ v3 + 4 ];
        inputNormal[ k + 8 ] = normal[ v3 + 5 ];

        inputNormal[ k + 9 ] = normal[ v3 + 3 ];
        inputNormal[ k + 10 ] = normal[ v3 + 4 ];
        inputNormal[ k + 11 ] = normal[ v3 + 5 ];


        for( i = 0; i<4; ++i ){
            p = k + 3 * i;

            inputColor[ p + 0 ] = color[ v3 + 0 ];
            inputColor[ p + 1 ] = color[ v3 + 1 ];
            inputColor[ p + 2 ] = color[ v3 + 2 ];

            // inputSize[ l + i ] = size[ v ];
        }

        if( prevSize!=size[ v ] && prevSize<0 ){
            inputSize[ l + 0 ] = Math.abs( prevSize );
            inputSize[ l + 1 ] = Math.abs( prevSize );
            inputSize[ l + 2 ] = Math.abs( size[ v ] );
            inputSize[ l + 3 ] = Math.abs( size[ v ] );
        }else{
            inputSize[ l + 0 ] = Math.abs( size[ v ] );
            inputSize[ l + 1 ] = Math.abs( size[ v ] );
            inputSize[ l + 2 ] = Math.abs( size[ v ] );
            inputSize[ l + 3 ] = Math.abs( size[ v ] );
        }
        prevSize = size[ v ];

        inputDir[ k + 0 ] = dir[ v3 + 0 ];
        inputDir[ k + 1 ] = dir[ v3 + 1 ];
        inputDir[ k + 2 ] = dir[ v3 + 2 ];

        inputDir[ k + 3 ] = -dir[ v3 + 0 ];
        inputDir[ k + 4 ] = -dir[ v3 + 1 ];
        inputDir[ k + 5 ] = -dir[ v3 + 2 ];

        inputDir[ k + 6 ] = dir[ v3 + 3 ];
        inputDir[ k + 7 ] = dir[ v3 + 4 ];
        inputDir[ k + 8 ] = dir[ v3 + 5 ];

        inputDir[ k + 9 ] = -dir[ v3 + 3 ];
        inputDir[ k + 10 ] = -dir[ v3 + 4 ];
        inputDir[ k + 11 ] = -dir[ v3 + 5 ];


        ix = v * 6;
        it = v * 4;

        indices.set( NGL.QuadIndices, ix );
        for( var s=0; s<6; ++s ){
            indices[ix + s] = (it + indices[ix + s]) % chunkSize;
        }
    }

    // console.log( "inputDir", inputDir );
    // console.log( "inputNormal", inputNormal );
    // console.log( "RibbonBuffer aPosition", aPosition, aPosition.length );
    // console.log( position );
    // console.log( "inputSize", inputSize, size );
    // console.log( "inputColor", inputColor );
    // console.log( "indices", indices );

    mesh = new THREE.Mesh( geometry, material );
    NGL.group.add( mesh );

    new NGL.BufferVectorHelper( position, normal, new THREE.Color("rgb(255,0,0)") );
    new NGL.BufferVectorHelper( position, dir, new THREE.Color("rgb(255,255,0)") );

    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
    this.n = n;
}


NGL.QuadricImpostorBuffer = function( position, T, color, type, tubeData ){

    // http://www.bmsc.washington.edu/people/merritt/graphics/quadrics.html
    // http://people.eecs.ku.edu/~miller/Papers/GeomAppNPQSIC.pdf
    // http://marctenbosch.com/photon/mbosch_intersection.pdf
    // https://unihub.ru/tools/ofservice/browser/trunk/1.7/ThirdParty-1.7.1/paraview-3.8.0/Plugins/PointSprite/Rendering/Resources/Shaders/Quadrics_vs.glsl?rev=2
    // http://sourceforge.net/p/hyperballs/code/HEAD/tree/src/shaders/

    // https://www.shadertoy.com/view/lssGDX
    // https://www.shadertoy.com/view/MssGzn

    var geometry, material, mesh;
    var n = position.length/3;
    var n2 = n * 2;
    var n4 = n * 4;
    
    var attributes = {
        inputMapping: { type: 'v2', value: null },
        inputSphereRadius: { type: 'f', value: null },
        inputColor: { type: 'v3', value: null },
        T1: { type: 'v4', value: null },
        T2: { type: 'v4', value: null },
        T3: { type: 'v4', value: null },
        T4: { type: 'v4', value: null },
        Ti1: { type: 'v4', value: null },
        Ti2: { type: 'v4', value: null },
        Ti3: { type: 'v4', value: null },
        Ti4: { type: 'v4', value: null }
    };
    if( tubeData ){
        attributes['inputP'] = { type: 'v3', value: null };
        attributes['inputQ'] = { type: 'v3', value: null };
        attributes['inputR'] = { type: 'v3', value: null };
        attributes['inputS'] = { type: 'v3', value: null };
        attributes['inputAxisA'] = { type: 'v3', value: null };
        attributes['inputAxisB'] = { type: 'v3', value: null };
    }
    var uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
        {
            'modelViewMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
            'modelViewMatrixInverseTranspose': { type: "m4", value: new THREE.Matrix4() },
            'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
            'projectionMatrixTranspose': { type: "m4", value: new THREE.Matrix4() },
        }
    ]);
    var defines = [ type || "ELLIPSOID" ];

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'QuadricImpostor.vert', defines ),
        fragmentShader: NGL.getShader( 'QuadricImpostor.frag', defines ),
        fog: true,
        depthTest: true,
        transparent: true,
        depthWrite: true,
        lights: true,
        //blending: THREE.AdditiveBlending,
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', new THREE.Float32Attribute( n4, 3 ) );
    geometry.addAttribute( 'inputMapping', new THREE.Float32Attribute( n4, 2 ) );
    geometry.addAttribute( 'inputColor', new THREE.Float32Attribute( n4, 3 ) );
    geometry.addAttribute( 'T1', new THREE.Float32Attribute( n4, 4 ) );
    geometry.addAttribute( 'T2', new THREE.Float32Attribute( n4, 4 ) );
    geometry.addAttribute( 'T3', new THREE.Float32Attribute( n4, 4 ) );
    geometry.addAttribute( 'T4', new THREE.Float32Attribute( n4, 4 ) );
    geometry.addAttribute( 'Ti1', new THREE.Float32Attribute( n4, 4 ) );
    geometry.addAttribute( 'Ti2', new THREE.Float32Attribute( n4, 4 ) );
    geometry.addAttribute( 'Ti3', new THREE.Float32Attribute( n4, 4 ) );
    geometry.addAttribute( 'Ti4', new THREE.Float32Attribute( n4, 4 ) );
    if( tubeData ){
        geometry.addAttribute( 'inputP', new THREE.Float32Attribute( n4, 3 ) );
        geometry.addAttribute( 'inputQ', new THREE.Float32Attribute( n4, 3 ) );
        geometry.addAttribute( 'inputR', new THREE.Float32Attribute( n4, 3 ) );
        geometry.addAttribute( 'inputS', new THREE.Float32Attribute( n4, 3 ) );
        geometry.addAttribute( 'inputAxisA', new THREE.Float32Attribute( n4, 3 ) );
        geometry.addAttribute( 'inputAxisB', new THREE.Float32Attribute( n4, 3 ) );
    }

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputColor = geometry.attributes.inputColor.array;
    var T1 = geometry.attributes.T1.array;
    var T2 = geometry.attributes.T2.array;
    var T3 = geometry.attributes.T3.array;
    var T4 = geometry.attributes.T4.array;
    var Ti1 = geometry.attributes.Ti1.array;
    var Ti2 = geometry.attributes.Ti2.array;
    var Ti3 = geometry.attributes.Ti3.array;
    var Ti4 = geometry.attributes.Ti4.array;
    if( tubeData ){
        var inputP = geometry.attributes.inputP.array;
        var inputQ = geometry.attributes.inputQ.array;
        var inputR = geometry.attributes.inputR.array;
        var inputS = geometry.attributes.inputS.array;
        var inputAxisA = geometry.attributes.inputAxisA.array;
        var inputAxisB = geometry.attributes.inputAxisB.array;
    }

    geometry.addAttribute( 'index', new THREE.Uint16Attribute( n * 6, 1 ) );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n4, 2, 4 );

    var x, y, z;
    var r, g, b;
    var i, j, k, ix, it;
    var chunkSize = NGL.calculateChunkSize( 4 );
    var mat = new THREE.Matrix4(), e;
    var mati = new THREE.Matrix4(), ei;
    var eye = new THREE.Vector3( 0, 0, 0 );
    var target = new THREE.Vector3();
    var up = new THREE.Vector3( 0, 1, 0 );
    var rot = new THREE.Matrix4();

    for( var v = 0; v < n; v++ ) {
        i = v * 2 * 4;
        k = v * 3;
        t = v * 16;

        inputMapping.set( NGL.QuadMapping, i );

        r = color[ k + 0 ];
        g = color[ k + 1 ];
        b = color[ k + 2 ];

        x = position[ k + 0 ];
        y = position[ k + 1 ];
        z = position[ k + 2 ];

        mat.elements.set( T.subarray( t, t + 16 ) );
        e = mat.elements;
        mati.getInverse( mat );
        ei = mati.elements;

        for( var m = 0; m < 4; m++ ) {
            j = v * 4 * 3 + (3 * m);
            tt = v * 4 * 4 + (4 * m);

            inputColor[ j + 0 ] = r;
            inputColor[ j + 1 ] = g;
            inputColor[ j + 2 ] = b;

            aPosition[ j + 0 ] = x;
            aPosition[ j + 1 ] = y;
            aPosition[ j + 2 ] = z;

            T1[ tt + 0 ] = e[  0 ];
            T1[ tt + 1 ] = e[  4 ];
            T1[ tt + 2 ] = e[  8 ];
            T1[ tt + 3 ] = e[  12 ];

            T2[ tt + 0 ] = e[  1 ];
            T2[ tt + 1 ] = e[  5 ];
            T2[ tt + 2 ] = e[  9 ];
            T2[ tt + 3 ] = e[ 13 ];

            T3[ tt + 0 ] = e[  2 ];
            T3[ tt + 1 ] = e[  6 ];
            T3[ tt + 2 ] = e[ 10 ];
            T3[ tt + 3 ] = e[ 14 ];

            T4[ tt + 0 ] = e[  3 ];
            T4[ tt + 1 ] = e[  7 ];
            T4[ tt + 2 ] = e[ 11 ];
            T4[ tt + 3 ] = e[ 15 ];

            Ti1[ tt + 0 ] = ei[  0 ];
            Ti1[ tt + 1 ] = ei[  4 ];
            Ti1[ tt + 2 ] = ei[  8 ];
            Ti1[ tt + 3 ] = ei[  12 ];

            Ti2[ tt + 0 ] = ei[  1 ];
            Ti2[ tt + 1 ] = ei[  5 ];
            Ti2[ tt + 2 ] = ei[  9 ];
            Ti2[ tt + 3 ] = ei[ 13 ];

            Ti3[ tt + 0 ] = ei[  2 ];
            Ti3[ tt + 1 ] = ei[  6 ];
            Ti3[ tt + 2 ] = ei[ 10 ];
            Ti3[ tt + 3 ] = ei[ 14 ];

            Ti4[ tt + 0 ] = ei[  3 ];
            Ti4[ tt + 1 ] = ei[  7 ];
            Ti4[ tt + 2 ] = ei[ 11 ];
            Ti4[ tt + 3 ] = ei[ 15 ];

            if( tubeData ){
                inputP[ j + 0 ] = tubeData.p[ k + 0 ];
                inputP[ j + 1 ] = tubeData.p[ k + 1 ];
                inputP[ j + 2 ] = tubeData.p[ k + 2 ];

                inputQ[ j + 0 ] = tubeData.q[ k + 0 ];
                inputQ[ j + 1 ] = tubeData.q[ k + 1 ];
                inputQ[ j + 2 ] = tubeData.q[ k + 2 ];

                inputR[ j + 0 ] = tubeData.r[ k + 0 ];
                inputR[ j + 1 ] = tubeData.r[ k + 1 ];
                inputR[ j + 2 ] = tubeData.r[ k + 2 ];

                inputS[ j + 0 ] = tubeData.s[ k + 0 ];
                inputS[ j + 1 ] = tubeData.s[ k + 1 ];
                inputS[ j + 2 ] = tubeData.s[ k + 2 ];

                inputAxisA[ j + 0 ] = tubeData.axisA[ k + 0 ];
                inputAxisA[ j + 1 ] = tubeData.axisA[ k + 1 ];
                inputAxisA[ j + 2 ] = tubeData.axisA[ k + 2 ];

                inputAxisB[ j + 0 ] = tubeData.axisB[ k + 0 ];
                inputAxisB[ j + 1 ] = tubeData.axisB[ k + 1 ];
                inputAxisB[ j + 2 ] = tubeData.axisB[ k + 2 ];
            }
        }

        ix = v * 6;
        it = v * 4;

        indices.set( NGL.QuadIndices, ix );
        for( var s=0; s<6; ++s ){
            indices[ix + s] = (it + indices[ix + s]) % chunkSize;
        }
    }

    // console.log( "inputMapping", inputMapping );
    // console.log( "aPosition", aPosition, aPosition.length );
    // console.log( "inputColor", inputColor );
    // console.log( "indices", indices );
    // console.log( "T1", T1 );
    // console.log( "T2", T2 );
    // console.log( "T3", T3 );
    // console.log( "T4", T4 );
    // console.log( "Ti1", Ti1 );
    // console.log( "Ti2", Ti2 );
    // console.log( "Ti3", Ti3 );
    // console.log( "Ti4", Ti4 );

    mesh = new THREE.Mesh( geometry, material );
    NGL.group.add( mesh );

    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
    this.n = n;
}


NGL.HelixImpostorBuffer = function ( from, to, dir, color, color2, radius ) {

    // http://math.stackexchange.com/questions/13341/shortest-distance-between-a-point-and-a-helix
    // https://github.com/nithins/proteinvis/tree/master/pv_app/resources

    var geometry, material, mesh;
    var n = from.length/3;
    var n6 = n * 6;

    // make shader material
    var attributes = {
        inputMapping: { type: 'v2', value: null },
        inputColor: { type: 'c', value: null },
        inputAxis: { type: 'v3', value: null },
        inputDir: { type: 'v3', value: null },
        inputQ: { type: 'v3', value: null },
        inputR: { type: 'v3', value: null },
        inputCylinderRadius: { type: 'f', value: null },
        inputCylinderHeight: { type: 'f', value: null }
    };
    if( color2 ){
        attributes['inputColor2'] = { type: 'c', value: null };
    }
    var uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
    ]);

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'HelixImpostor.vert' ),
        fragmentShader: NGL.getShader( 'HelixImpostor.frag' ),
        depthTest: true,
        transparent: false,
        depthWrite: true,
        lights: true,
        side: THREE.DoubleSide,
        fog: true
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputMapping', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputColor', new THREE.Float32Attribute( n6, 3 ) );
    if( color2 ){
        geometry.addAttribute( 'inputColor2', new THREE.Float32Attribute( n6, 3 ) );
    }
    geometry.addAttribute( 'inputAxis', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputDir', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputQ', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputR', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputCylinderRadius', new THREE.Float32Attribute( n6, 1 ) );
    geometry.addAttribute( 'inputCylinderHeight', new THREE.Float32Attribute( n6, 1 ) );

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputColor = geometry.attributes.inputColor.array;
    if( color2 ){
        var inputColor2 = geometry.attributes.inputColor2.array;
    }
    var inputAxis = geometry.attributes.inputAxis.array;
    var inputDir = geometry.attributes.inputDir.array;
    var inputQ = geometry.attributes.inputQ.array;
    var inputR = geometry.attributes.inputR.array;
    var inputCylinderRadius = geometry.attributes.inputCylinderRadius.array;
    var inputCylinderHeight = geometry.attributes.inputCylinderHeight.array;

    geometry.addAttribute( 'index', new THREE.Uint16Attribute( n * 12, 1 ) );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n6, 4, 6 );

    var r, g, b;
    if( color2 ){
        var r2, g2, b2;
    }
    var x, y, z;
    var x1, y1, z1, x2, y2, z2;
    var vx, vy, vz;
    var dx, dy, dz;
    var height;
    var i, j, k, ix, it;
    var chunkSize = NGL.calculateChunkSize( 6 );

    for( var v = 0; v < n; v++ ) {
        i = v * 3 * 6;
        k = v * 3;

        inputMapping.set( NGL.BoxMapping, i );

        r = color[ k + 0 ];
        g = color[ k + 1 ];
        b = color[ k + 2 ];

        if( color2 ){
            r2 = color2[ k + 0 ];
            g2 = color2[ k + 1 ];
            b2 = color2[ k + 2 ];
        }

        x1 = from[ k + 0 ];
        y1 = from[ k + 1 ];
        z1 = from[ k + 2 ];

        x2 = to[ k + 0 ];
        y2 = to[ k + 1 ];
        z2 = to[ k + 2 ];

        dx = dir[ k + 0 ];
        dy = dir[ k + 1 ];
        dz = dir[ k + 2 ];

        x = ( x1 + x2 ) / 2.0;
        y = ( y1 + y2 ) / 2.0;
        z = ( z1 + z2 ) / 2.0;

        vx = x1 - x2;
        vy = y1 - y2;
        vz = z1 - z2;

        height = Math.sqrt( vx*vx + vy*vy + vz*vz ); 

        for( var m = 0; m < 6; m++ ) {
            j = v * 6 * 3 + (3 * m);

            inputColor[ j + 0 ] = r;
            inputColor[ j + 1 ] = g;
            inputColor[ j + 2 ] = b;

            if( color2 ){
                inputColor2[ j + 0 ] = r2;
                inputColor2[ j + 1 ] = g2;
                inputColor2[ j + 2 ] = b2;
            }

            aPosition[ j + 0 ] = x;
            aPosition[ j + 1 ] = y;
            aPosition[ j + 2 ] = z;

            inputAxis[ j + 0 ] = vx;
            inputAxis[ j + 1 ] = vy;
            inputAxis[ j + 2 ] = vz;

            inputDir[ j + 0 ] = dx;
            inputDir[ j + 1 ] = dy;
            inputDir[ j + 2 ] = dz;

            inputQ[ j + 0 ] = x1;
            inputQ[ j + 1 ] = y1;
            inputQ[ j + 2 ] = z1;

            inputR[ j + 0 ] = x2;
            inputR[ j + 1 ] = y2;
            inputR[ j + 2 ] = z2;

            inputCylinderRadius[ (v * 6) + m ] = radius[ v ];
            inputCylinderHeight[ (v * 6) + m ] = height;
        }

        ix = v * 12;
        it = v * 6;

        indices.set( NGL.BoxIndices, ix );
        for( var s=0; s<12; ++s ){
            indices[ix + s] = (it + indices[ix + s]) % chunkSize;
        }
    }

    // console.log( "inputMapping", inputMapping );
    // console.log( "inputColor", inputColor );
    // console.log( "aPosition", aPosition );
    // console.log( "inputQ", inputQ );
    // console.log( "inputR", inputR );
    // console.log( "inputCylinderRadius", inputCylinderRadius );
    // console.log( "inputCylinderHeight", inputCylinderHeight );
    // console.log( "indices", indices );

    // mesh = new THREE.Line( geometry, material, THREE.LinePieces );
    mesh = new THREE.Mesh( geometry, material );
    NGL.group.add( mesh );


    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
    this.n = n;
}


NGL.HelixImpostorBuffer2 = function ( from, to, dir, color, color2, radius ) {

    // http://math.stackexchange.com/questions/13341/shortest-distance-between-a-point-and-a-helix
    // https://github.com/nithins/proteinvis/tree/master/pv_app/resources

    var geometry, material, mesh;
    var n = from.length/3;
    var n8 = n * 8;

    // make shader material
    var attributes = {
        inputMapping: { type: 'v3', value: null },
        inputColor: { type: 'c', value: null },
        inputAxis: { type: 'v3', value: null },
        inputDir: { type: 'v3', value: null },
        inputQ: { type: 'v3', value: null },
        inputR: { type: 'v3', value: null },
        inputCylinderRadius: { type: 'f', value: null },
        inputCylinderHeight: { type: 'f', value: null }
    };
    if( color2 ){
        attributes['inputColor2'] = { type: 'c', value: null };
    }
    var uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
    ]);

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'HelixImpostor2.vert' ),
        fragmentShader: NGL.getShader( 'HelixImpostor2.frag' ),
        depthTest: true,
        transparent: false,
        depthWrite: true,
        lights: true,
        side: THREE.DoubleSide,
        fog: true
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputMapping', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputColor', new THREE.Float32Attribute( n8, 3 ) );
    if( color2 ){
        geometry.addAttribute( 'inputColor2', new THREE.Float32Attribute( n8, 3 ) );
    }
    geometry.addAttribute( 'inputAxis', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputDir', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputQ', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputR', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputCylinderRadius', new THREE.Float32Attribute( n8, 1 ) );
    geometry.addAttribute( 'inputCylinderHeight', new THREE.Float32Attribute( n8, 1 ) );

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputColor = geometry.attributes.inputColor.array;
    if( color2 ){
        var inputColor2 = geometry.attributes.inputColor2.array;
    }
    var inputAxis = geometry.attributes.inputAxis.array;
    var inputDir = geometry.attributes.inputDir.array;
    var inputQ = geometry.attributes.inputQ.array;
    var inputR = geometry.attributes.inputR.array;
    var inputCylinderRadius = geometry.attributes.inputCylinderRadius.array;
    var inputCylinderHeight = geometry.attributes.inputCylinderHeight.array;

    geometry.addAttribute( 'index', new THREE.Uint16Attribute( n * 36, 1 ) );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n8, 12, 8 );

    var r, g, b;
    if( color2 ){
        var r2, g2, b2;
    }
    var x, y, z;
    var x1, y1, z1, x2, y2, z2;
    var vx, vy, vz;
    var dx, dy, dz;
    var height;
    var i, j, k, ix, it;
    var chunkSize = NGL.calculateChunkSize( 8 );

    var BoxMapping2 = new Float32Array([
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0
    ]);

    var BoxIndices2 = new Uint16Array([
        0, 1, 2,
        1, 3, 2,
        4, 6, 5,
        5, 6, 7,
        4, 5, 0,
        5, 0, 1,
        6, 2, 7,
        2, 3, 7,
        1, 5, 7,
        7, 3, 1,
        2, 6, 0,
        6, 4, 0
    ]);

    for( var v = 0; v < n; v++ ) {
        i = v * 3 * 8;
        k = v * 3;

        inputMapping.set( BoxMapping2, i );

        r = color[ k + 0 ];
        g = color[ k + 1 ];
        b = color[ k + 2 ];

        if( color2 ){
            r2 = color2[ k + 0 ];
            g2 = color2[ k + 1 ];
            b2 = color2[ k + 2 ];
        }

        x1 = from[ k + 0 ];
        y1 = from[ k + 1 ];
        z1 = from[ k + 2 ];

        x2 = to[ k + 0 ];
        y2 = to[ k + 1 ];
        z2 = to[ k + 2 ];

        dx = dir[ k + 0 ];
        dy = dir[ k + 1 ];
        dz = dir[ k + 2 ];

        x = ( x1 + x2 ) / 2.0;
        y = ( y1 + y2 ) / 2.0;
        z = ( z1 + z2 ) / 2.0;

        vx = x1 - x2;
        vy = y1 - y2;
        vz = z1 - z2;

        height = Math.sqrt( vx*vx + vy*vy + vz*vz ); 

        for( var m = 0; m < 8; m++ ) {
            j = v * 8 * 3 + (3 * m);

            inputColor[ j + 0 ] = r;
            inputColor[ j + 1 ] = g;
            inputColor[ j + 2 ] = b;

            if( color2 ){
                inputColor2[ j + 0 ] = r2;
                inputColor2[ j + 1 ] = g2;
                inputColor2[ j + 2 ] = b2;
            }

            aPosition[ j + 0 ] = x;
            aPosition[ j + 1 ] = y;
            aPosition[ j + 2 ] = z;

            inputAxis[ j + 0 ] = vx;
            inputAxis[ j + 1 ] = vy;
            inputAxis[ j + 2 ] = vz;

            inputDir[ j + 0 ] = dx;
            inputDir[ j + 1 ] = dy;
            inputDir[ j + 2 ] = dz;

            inputQ[ j + 0 ] = x1;
            inputQ[ j + 1 ] = y1;
            inputQ[ j + 2 ] = z1;

            inputR[ j + 0 ] = x2;
            inputR[ j + 1 ] = y2;
            inputR[ j + 2 ] = z2;

            inputCylinderRadius[ (v * 8) + m ] = radius[ v ];
            inputCylinderHeight[ (v * 8) + m ] = height;
        }

        ix = v * 36;
        it = v * 8;

        indices.set( BoxIndices2, ix );
        for( var s=0; s<36; ++s ){
            indices[ix + s] = (it + indices[ix + s]) % chunkSize;
        }
    }

    // console.log( "inputMapping", inputMapping );
    // console.log( "inputColor", inputColor );
    // console.log( "aPosition", aPosition );
    // console.log( "inputQ", inputQ );
    // console.log( "inputR", inputR );
    // console.log( "inputCylinderRadius", inputCylinderRadius );
    // console.log( "inputCylinderHeight", inputCylinderHeight );
    // console.log( "indices", indices );

    // mesh = new THREE.Line( geometry, material, THREE.LinePieces );
    mesh = new THREE.Mesh( geometry, material );
    NGL.group.add( mesh );


    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
    this.n = n;
}


NGL.EllipsoidImpostorBuffer = function ( position, xdir, ydir, zdir, color ) {
    // xdir, ydir, zdir must be mutually perpendicular
    // direction and length are used

    var n = position.length/3;
    var n3 = n * 3;
    var n16 = n * 16;

    var aPosition = new Float32Array( n3 );
    var aColor = new Float32Array( n3 );
    var T = new Float32Array( n16 );

    var i, x, y, z;
    var mat = new THREE.Matrix4();
    var m1 = new THREE.Matrix4();
    var o = new THREE.Vector3( 0, 0, 0 );
    var vx = new THREE.Vector3();
    var vy = new THREE.Vector3();
    var vz = new THREE.Vector3();

    aPosition.set( position );
    aColor.set( color );

    for( var v = 0; v < n; v++ ) {
        i = 3 * v;
        t = 16 * v;

        x = position[ i + 0 ];
        y = position[ i + 1 ];
        z = position[ i + 2 ];

        vx.set( xdir[ i + 0 ], xdir[ i + 1 ], xdir[ i + 2 ] );
        vy.set( ydir[ i + 0 ], ydir[ i + 1 ], ydir[ i + 2 ] );
        vz.set( zdir[ i + 0 ], zdir[ i + 1 ], zdir[ i + 2 ] );

        mat.set(
            vx.length(), 0.0, 0.0, 0.0,
            0.0, vy.length(), 0.0, 0.0,
            0.0, 0.0, vz.length(), 0.0,
            //x, y, z, 1.0
            0.0, 0.0, 0.0, 1.0
        );
        m1.identity().lookAt( vz, o, vy ).transpose();
        mat.multiplyMatrices( mat, m1 );
        m1.makeTranslation( x, y, z ).transpose();
        mat.multiplyMatrices( mat, m1 );

        T.set( mat.elements, t );
    }

    // console.log( "aPosition", aPosition );
    // console.log( "T", T );
    // console.log( "aColor", aColor );

    new NGL.QuadricImpostorBuffer( aPosition, T, aColor, "ELLIPSOID" );
}


NGL.EllipticCylinderImpostorBuffer = function ( position, xdir, ydir, zdir, color, tube ) {
    // xdir, ydir, zdir must be mutually perpendicular
    // direction and length are used

    var n = position.length/3;
    var n3 = n * 3;
    var n16 = n * 16;

    var aPosition = new Float32Array( n3 );
    var aColor = new Float32Array( n3 );
    var T = new Float32Array( n16 );

    if( tube ){
        var aP = new Float32Array( n3 );
        var aQ = new Float32Array( n3 );
        var aR = new Float32Array( n3 );
        var aS = new Float32Array( n3 );
        var aX = new Float32Array( n3 );
        var aY = new Float32Array( n3 );
        var aRadius = new Float32Array( n );
    }

    var i, x, y, z, x1, y1, z1;
    var mat = new THREE.Matrix4();
    var m1 = new THREE.Matrix4();
    var o = new THREE.Vector3( 0, 0, 0 );
    var p = new THREE.Vector3();
    var vx = new THREE.Vector3();
    var vy = new THREE.Vector3();
    var vz = new THREE.Vector3();
    var from = new THREE.Vector3();
    var to = new THREE.Vector3();
    var fromPrev = new THREE.Vector3( 0, 0, 0 );
    var pNext = new THREE.Vector3( 0, 0, 0 );
    var vxNext = new THREE.Vector3( 0, 0, 0 );
    var toNext = new THREE.Vector3( 0, 0, 0 );

    aPosition.set( position );
    aColor.set( color );

    for( var v = 0; v < n; v++ ) {
        i = 3 * v;
        t = 16 * v;

        x = position[ i + 0 ];
        y = position[ i + 1 ];
        z = position[ i + 2 ];

        vx.set( xdir[ i + 0 ], xdir[ i + 1 ], xdir[ i + 2 ] );
        vy.set( ydir[ i + 0 ], ydir[ i + 1 ], ydir[ i + 2 ] );
        vz.set( zdir[ i + 0 ], zdir[ i + 1 ], zdir[ i + 2 ] );

        mat.set(
            vx.length(), 0.0, 0.0, 0.0,
            0.0, vy.length(), 0.0, 0.0,
            0.0, 0.0, vz.length()*(tube ? 1.7 : 1.0), 0.0,
            //x, y, z, 1.0
            0.0, 0.0, 0.0, 1.0
        );
        m1.identity().lookAt( vz, o, vy ).transpose();
        mat.multiplyMatrices( mat, m1 );
        m1.makeTranslation( x, y, z ).transpose();
        mat.multiplyMatrices( mat, m1 );

        T.set( mat.elements, t );

        if( tube ){
            p.set( x, y, z );
            from.copy( p ).sub( vz );
            to.copy( p ).add( vz );

            if( v%tube==0 ){
                fromPrev.copy( from ).sub( vz );
            }

            if( v%tube==tube-1 ){
                toNext.copy( to ).add( vz );
            }else{
                pNext.set( position[ i + 3 ], position[ i + 4 ], position[ i + 5 ] );
                vxNext.set( zdir[ i + 3 ], zdir[ i + 4 ], zdir[ i + 5 ] );
                toNext.copy( pNext ).add( vxNext );
            }

            aP[ i + 0 ] = fromPrev.x;
            aP[ i + 1 ] = fromPrev.y;
            aP[ i + 2 ] = fromPrev.z;

            aQ[ i + 0 ] = from.x;
            aQ[ i + 1 ] = from.y;
            aQ[ i + 2 ] = from.z;

            aR[ i + 0 ] = to.x;
            aR[ i + 1 ] = to.y;
            aR[ i + 2 ] = to.z;

            aS[ i + 0 ] = toNext.x;
            aS[ i + 1 ] = toNext.y;
            aS[ i + 2 ] = toNext.z;

            aX[ i + 0 ] = vx.x;
            aX[ i + 1 ] = vx.y;
            aX[ i + 2 ] = vx.z;

            aY[ i + 0 ] = vy.x;
            aY[ i + 1 ] = vy.y;
            aY[ i + 2 ] = vy.z;
            
            fromPrev.copy( from );
            aRadius[ v ] = 2.0;
        }
    }

    // console.log( "aPosition", aPosition );
    // console.log( "T", T );
    // console.log( "aColor", aColor );
    // if( tube ){
    //     console.log( "aP", aP );
    //     console.log( "aQ", aQ );
    //     console.log( "aR", aR );
    //     console.log( "aS", aS );
    //     console.log( "aX", aX );
    //     console.log( "aY", aY );
    // }

    if( tube ){
        var tubeData = { "p": aP, "q": aQ, "r": aR, "s": aS, "axisA": aX, "axisB": aY };
        // new NGL.SphereImpostorBuffer( aP, aColor, aRadius );
        // new NGL.SphereImpostorBuffer( aQ, aColor, aRadius );
        // new NGL.SphereImpostorBuffer( aR, aColor, aRadius );
        // new NGL.SphereImpostorBuffer( aS, aColor, aRadius );
    }

    new NGL.QuadricImpostorBuffer( aPosition, T, aColor, "CYLINDER", tubeData );
}


NGL.EllipticTubeImpostorBuffer = function ( position, xdir, ydir, zdir, color ) {

    var n = ( position.length/3 ) - 1;
    var n3 = n * 3;

    var aPosition = new Float32Array( n3 );
    var aColor = new Float32Array( n3 );
    var aXdir = new Float32Array( n3 );
    var aYdir = new Float32Array( n3 );
    var aZdir = new Float32Array( n3 );


    var i;
    var p = new THREE.Vector3( 0, 0, 0 );
    var pv = new THREE.Vector3( 0, 0, 0 );
    var pPrev = new THREE.Vector3( 0, 0, 0 );
    var pNext = new THREE.Vector3( 0, 0, 0 );

    for( var v = 0; v < n; v++ ) {
        i = 3 * v;

        pPrev.set( position[ i + 0 ], position[ i + 1 ], position[ i + 2 ] );
        pNext.set( position[ i + 3 ], position[ i + 4 ], position[ i + 5 ] );
        p.copy( pPrev ).add( pNext ).divideScalar( 2.0 );

        aPosition[ i + 0 ] = p.x;
        aPosition[ i + 1 ] = p.y;
        aPosition[ i + 2 ] = p.z;

        aXdir[ i + 0 ] = xdir[ i + 0 ] * 3;
        aXdir[ i + 1 ] = xdir[ i + 1 ] * 3;
        aXdir[ i + 2 ] = xdir[ i + 2 ] * 3;

        aYdir[ i + 0 ] = ydir[ i + 0 ] * 0.7;
        aYdir[ i + 1 ] = ydir[ i + 1 ] * 0.7;
        aYdir[ i + 2 ] = ydir[ i + 2 ] * 0.7;

        pv.copy( pNext ).sub( pPrev ).divideScalar( 2.0 );

        aZdir[ i + 0 ] = pv.x;
        aZdir[ i + 1 ] = pv.y;
        aZdir[ i + 2 ] = pv.z;


        aColor[ i + 0 ] = color[ i + 0 ];
        aColor[ i + 1 ] = color[ i + 1 ];
        aColor[ i + 2 ] = color[ i + 2 ];

    }

    new NGL.EllipticCylinderImpostorBuffer( aPosition, aXdir, aYdir, aZdir, aColor, n );
}


NGL.ConeImpostorBuffer = function ( position, xdir, ydir, zdir, color ) {
    // xdir, ydir, zdir must be mutually perpendicular
    // direction and length are used

    var n = position.length/3;
    var n3 = n * 3;
    var n16 = n * 16;

    var aPosition = new Float32Array( n3 );
    var aColor = new Float32Array( n3 );
    var T = new Float32Array( n16 );

    var i, x, y, z;
    var mat = new THREE.Matrix4();
    var m1 = new THREE.Matrix4();
    var o = new THREE.Vector3( 0, 0, 0 );
    var vx = new THREE.Vector3();
    var vy = new THREE.Vector3();
    var vz = new THREE.Vector3();

    aPosition.set( position );
    aColor.set( color );

    for( var v = 0; v < n; v++ ) {
        i = 3 * v;
        t = 16 * v;

        x = position[ i + 0 ];
        y = position[ i + 1 ];
        z = position[ i + 2 ];

        vx.set( xdir[ i + 0 ], xdir[ i + 1 ], xdir[ i + 2 ] );
        vy.set( ydir[ i + 0 ], ydir[ i + 1 ], ydir[ i + 2 ] );
        vz.set( zdir[ i + 0 ], zdir[ i + 1 ], zdir[ i + 2 ] );

        mat.set(
            vx.length(), 0.0, 0.0, 0.0,
            0.0, vy.length(), 0.0, 0.0,
            0.0, 0.0, vz.length(), 0.0,
            //x, y, z, 1.0
            0.0, 0.0, 0.0, 1.0
        );
        m1.identity().lookAt( vz, o, vy ).transpose();
        mat.multiplyMatrices( mat, m1 );
        m1.makeTranslation( x, y, z ).transpose();
        mat.multiplyMatrices( mat, m1 );

        T.set( mat.elements, t );
    }

    // console.log( "aPosition", aPosition );
    // console.log( "T", T );
    // console.log( "aColor", aColor );

    new NGL.QuadricImpostorBuffer( aPosition, T, aColor, "CONE" );
}


NGL.HyperboloidOneImpostorBuffer = function ( position, xdir, ydir, zdir, color ) {
    // xdir, ydir, zdir must be mutually perpendicular
    // direction and length are used

    var n = position.length/3;
    var n3 = n * 3;
    var n16 = n * 16;

    var aPosition = new Float32Array( n3 );
    var aColor = new Float32Array( n3 );
    var T = new Float32Array( n16 );

    var i, x, y, z;
    var mat = new THREE.Matrix4();
    var m1 = new THREE.Matrix4();
    var o = new THREE.Vector3( 0, 0, 0 );
    var vx = new THREE.Vector3();
    var vy = new THREE.Vector3();
    var vz = new THREE.Vector3();

    aPosition.set( position );
    aColor.set( color );

    for( var v = 0; v < n; v++ ) {
        i = 3 * v;
        t = 16 * v;

        x = position[ i + 0 ];
        y = position[ i + 1 ];
        z = position[ i + 2 ];

        vx.set( xdir[ i + 0 ], xdir[ i + 1 ], xdir[ i + 2 ] );
        vy.set( ydir[ i + 0 ], ydir[ i + 1 ], ydir[ i + 2 ] );
        vz.set( zdir[ i + 0 ], zdir[ i + 1 ], zdir[ i + 2 ] );

        mat.set(
            vx.length(), 0.0, 0.0, 0.0,
            0.0, vy.length(), 0.0, 0.0,
            0.0, 0.0, vz.length(), 0.0,
            //x, y, z, 1.0
            0.0, 0.0, 0.0, 1.0
        );
        m1.identity().lookAt( vz, o, vy ).transpose();
        mat.multiplyMatrices( mat, m1 );
        m1.makeTranslation( x, y, z ).transpose();
        mat.multiplyMatrices( mat, m1 );

        T.set( mat.elements, t );
    }

    // console.log( "aPosition", aPosition );
    // console.log( "T", T );
    // console.log( "aColor", aColor );

    new NGL.QuadricImpostorBuffer( aPosition, T, aColor, "HYPERBOLOID1" );
}


NGL.HyperboloidTwoImpostorBuffer = function ( position, xdir, ydir, zdir, color ) {
    // xdir, ydir, zdir must be mutually perpendicular
    // direction and length are used

    var n = position.length/3;
    var n3 = n * 3;
    var n16 = n * 16;

    var aPosition = new Float32Array( n3 );
    var aColor = new Float32Array( n3 );
    var T = new Float32Array( n16 );

    var i, x, y, z;
    var mat = new THREE.Matrix4();
    var m1 = new THREE.Matrix4();
    var o = new THREE.Vector3( 0, 0, 0 );
    var vx = new THREE.Vector3();
    var vy = new THREE.Vector3();
    var vz = new THREE.Vector3();

    aPosition.set( position );
    aColor.set( color );

    for( var v = 0; v < n; v++ ) {
        i = 3 * v;
        t = 16 * v;

        x = position[ i + 0 ];
        y = position[ i + 1 ];
        z = position[ i + 2 ];

        vx.set( xdir[ i + 0 ], xdir[ i + 1 ], xdir[ i + 2 ] );
        vy.set( ydir[ i + 0 ], ydir[ i + 1 ], ydir[ i + 2 ] );
        vz.set( zdir[ i + 0 ], zdir[ i + 1 ], zdir[ i + 2 ] );

        mat.set(
            vx.length(), 0.0, 0.0, 0.0,
            0.0, vy.length(), 0.0, 0.0,
            0.0, 0.0, vz.length(), 0.0,
            //x, y, z, 1.0
            0.0, 0.0, 0.0, 1.0
        );
        m1.identity().lookAt( vz, o, vy ).transpose();
        mat.multiplyMatrices( mat, m1 );
        m1.makeTranslation( x, y, z ).transpose();
        mat.multiplyMatrices( mat, m1 );

        T.set( mat.elements, t );
    }

    // console.log( "aPosition", aPosition );
    // console.log( "T", T );
    // console.log( "aColor", aColor );

    new NGL.QuadricImpostorBuffer( aPosition, T, aColor, "HYPERBOLOID2" );
}


NGL.LineSpriteBuffer = function ( from, to, color, color2, width ) {

    var geometry, material, mesh;
    var n = from.length/3;
    var n2 = n * 2;
    var n4 = n * 4;
    
    // make shader material
    var attributes = {
        inputMapping: { type: 'v3', value: null },
        inputWidth: { type: 'f', value: null },
        inputAxis: { type: 'v3', value: null },
        inputColor: { type: 'v3', value: null }
    };
    if( color2 ){
        attributes['inputColor2'] = { type: 'v3', value: null };
    }
    var uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        {}
    ]);

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'LineSprite.vert' ),
        fragmentShader: NGL.getShader( 'LineSprite.frag' ),
        fog: true
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', new THREE.Float32Attribute( n4, 3 ) );
    geometry.addAttribute( 'inputMapping', new THREE.Float32Attribute( n4, 2 ) );
    geometry.addAttribute( 'inputWidth', new THREE.Float32Attribute( n4, 1 ) );
    geometry.addAttribute( 'inputAxis', new THREE.Float32Attribute( n4, 3 ) );
    geometry.addAttribute( 'inputColor', new THREE.Float32Attribute( n4, 3 ) );
    if( color2 ){
        geometry.addAttribute( 'inputColor2', new THREE.Float32Attribute( n4, 3 ) );
    }

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputWidth = geometry.attributes.inputWidth.array;
    var inputAxis = geometry.attributes.inputAxis.array;
    var inputColor = geometry.attributes.inputColor.array;
    if( color2 ){
        var inputColor2 = geometry.attributes.inputColor2.array;
    }

    geometry.addAttribute( 'index', new THREE.Uint16Attribute( n * 6, 1 ) );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n4, 2, 4 );

    var x, y, z;
    var x1, y1, z1, x2, y2, z2;
    var vx, vy, vz;
    var r, g, b;
    if( color2 ){
        var r2, g2, b2;
    }
    var i, j, k, ix, it;

    var chunkSize = NGL.calculateChunkSize( 4 );

    for( var v = 0; v < n; v++ ) {
        i = v * 2 * 4;
        k = v * 3;

        inputMapping.set( NGL.QuadMapping, i );

        r = color[ k + 0 ];
        g = color[ k + 1 ];
        b = color[ k + 2 ];
        if( color2 ){
            r2 = color2[ k + 0 ];
            g2 = color2[ k + 1 ];
            b2 = color2[ k + 2 ];
        }

        x1 = from[ k + 0 ];
        y1 = from[ k + 1 ];
        z1 = from[ k + 2 ];

        x2 = to[ k + 0 ];
        y2 = to[ k + 1 ];
        z2 = to[ k + 2 ];

        x = ( x1 + x2 ) / 2.0;
        y = ( y1 + y2 ) / 2.0;
        z = ( z1 + z2 ) / 2.0;

        vx = x1 - x2;
        vy = y1 - y2;
        vz = z1 - z2;

        for( var m = 0; m < 4; m++ ) {
            j = v * 4 * 3 + (3 * m);

            inputColor[ j + 0 ] = r;
            inputColor[ j + 1 ] = g;
            inputColor[ j + 2 ] = b;

            if( color2 ){
                inputColor2[ j + 0 ] = r2;
                inputColor2[ j + 1 ] = g2;
                inputColor2[ j + 2 ] = b2;
            }

            aPosition[ j + 0 ] = x;
            aPosition[ j + 1 ] = y;
            aPosition[ j + 2 ] = z;

            inputAxis[ j + 0 ] = vx;
            inputAxis[ j + 1 ] = vy;
            inputAxis[ j + 2 ] = vz;

            inputWidth[ (v * 4) + m ] = width[ v ]/4.0;
        }

        ix = v * 6;
        it = v * 4;

        indices.set( NGL.QuadIndices, ix );
        for( var s=0; s<6; ++s ){
            indices[ix + s] = (it + indices[ix + s]) % chunkSize;
        }
    }

    // console.log( "inputMapping", inputMapping );
    // console.log( "LineSprite aPosition", aPosition, aPosition.length );
    // console.log( "inputWidth", inputWidth );
    // console.log( "inputAxis", inputAxis );
    // console.log( "inputColor", inputColor );
    // console.log( "indices", indices );

    mesh = new THREE.Mesh( geometry, material );
    NGL.group.add( mesh );


    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
    this.n = n;
}


NGL.SphereGroup = function ( position, color, radius ) {

    var group;
    var n = position.length/3;
    var sphereGeometry = new THREE.IcosahedronGeometry( 2, 1 );

    group = new THREE.Object3D();

    var sphere, i;
    var colr = new THREE.Color();
    for( var v = 0; v < n; v++ ) {
        i = 3 * v;
        colr.r = color[ i + 0 ];
        colr.g = color[ i + 1 ];
        colr.b = color[ i + 2 ];
        sphere = new THREE.Mesh(
            sphereGeometry, 
            NGL.getMaterial({ 
                color: colr, 
                specular: 0x050505, 
                visible: true,
                wireframe: false,
                fog: true
            })
        );
        sphere.scale.x = sphere.scale.y = sphere.scale.z = radius[ v ] / 2.0;
        sphere.position.x = position[ i + 0 ];
        sphere.position.y = position[ i + 1 ];
        sphere.position.z = position[ i + 2 ];
        sphere.matrixAutoUpdate = false;
        sphere.updateMatrix();
        group.add( sphere );
    }

    // NGL.group.add( group );

    // public attributes
    this.mesh = group;
    this.n = n;
}


NGL.SphereMeshBuffer = function ( position, color, radius ) {
    var sphereGeometry = new THREE.IcosahedronGeometry( 1, 1 );
    console.log( "vertices", sphereGeometry.vertices );
    console.log( "faces", sphereGeometry.faces );
}


NGL.CylinderGroup = function ( from, to, color, radius ) {

    var group;
    var n = from.length/3;

    group = new THREE.Object3D();

    var cylinder, i;
    var colr = new THREE.Color();
    var vFrom = new THREE.Vector3();
    var vTo = new THREE.Vector3();
    for( var v = 0; v < n; v++ ) {
        i = v * 3;
        colr.r = color[ i + 0 ];
        colr.g = color[ i + 1 ];
        colr.b = color[ i + 2 ];
        cylinder = new THREE.Mesh(
            NGL.cylinderGeometry, 
            NGL.getMaterial({ color: colr, specular: 0x050505, fog: true })
        );

        vFrom.set( from[ i + 0 ], from[ i + 1 ], from[ i + 2 ] );
        vTo.set( to[ i + 0 ], to[ i + 1 ], to[ i + 2 ] );
        cylinder.position.addVectors( vFrom, vTo ).divideScalar( 2 );
        cylinder.lookAt( vFrom );
        cylinder.scale.set( radius[ v ], radius[ v ], vFrom.distanceTo( vTo ) );
        cylinder.matrixAutoUpdate = false;
        cylinder.updateMatrix();

        group.add( cylinder );
    }

    NGL.group.add( group );

    // public attributes
    this.group = group;
    this.n = n;
}


NGL.CylinderImpostorBufferX = function ( from, to, color, color2, radius, tube ) {

    var geometry, material, mesh;
    var n = from.length/3;
    var n6 = n * 6;

    var aRadius = new Float32Array( n6 );

    // make shader material
    var attributes = {
        inputMapping: { type: 'v2', value: null },
        inputColor: { type: 'c', value: null },
        inputAxis: { type: 'v3', value: null },
        inputCylinderRadius: { type: 'f', value: null },
        inputCylinderHeight: { type: 'f', value: null }
    };
    if( color2 ){
        attributes['inputColor2'] = { type: 'c', value: null };
    }
    if( tube ){
        attributes['inputP'] = { type: 'v3', value: null };
        attributes['inputQ'] = { type: 'v3', value: null };
        attributes['inputR'] = { type: 'v3', value: null };
        attributes['inputS'] = { type: 'v3', value: null };
    }
    var uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
    ]);

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'CylinderImpostor.vert' ),
        fragmentShader: NGL.getShader( 'CylinderImpostor.frag' ),
        depthTest: true,
        transparent: false,
        depthWrite: true,
        lights: true,
        fog: true
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputMapping', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputColor', new THREE.Float32Attribute( n6, 3 ) );
    if( color2 ){
        geometry.addAttribute( 'inputColor2', new THREE.Float32Attribute( n6, 3 ) );
    }
    if( tube ){
        geometry.addAttribute( 'inputP', new THREE.Float32Attribute( n6, 3 ) );
        geometry.addAttribute( 'inputQ', new THREE.Float32Attribute( n6, 3 ) );
        geometry.addAttribute( 'inputR', new THREE.Float32Attribute( n6, 3 ) );
        geometry.addAttribute( 'inputS', new THREE.Float32Attribute( n6, 3 ) );
    }
    geometry.addAttribute( 'inputAxis', new THREE.Float32Attribute( n6, 3 ) );
    geometry.addAttribute( 'inputCylinderRadius', new THREE.Float32Attribute( n6, 1 ) );
    geometry.addAttribute( 'inputCylinderHeight', new THREE.Float32Attribute( n6, 1 ) );

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputColor = geometry.attributes.inputColor.array;
    if( color2 ){
        var inputColor2 = geometry.attributes.inputColor2.array;
    }
    if( tube ){
        var inputP = geometry.attributes.inputP.array;
        var inputQ = geometry.attributes.inputQ.array;
        var inputR = geometry.attributes.inputR.array;
        var inputS = geometry.attributes.inputS.array;
    }
    var inputAxis = geometry.attributes.inputAxis.array;
    var inputCylinderRadius = geometry.attributes.inputCylinderRadius.array;
    var inputCylinderHeight = geometry.attributes.inputCylinderHeight.array;

    geometry.addAttribute( 'index', new THREE.Uint16Attribute( n * 12, 1 ) );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n6, 4, 6 );

    var r, g, b;
    if( color2 ){
        var r2, g2, b2;
    }
    var x, y, z;
    var x1, y1, z1, x2, y2, z2;
    var vx, vy, vz;
    var xp, yp, zp, xn, yn, zn;
    var height;
    var i, j, k, ix, it;
    var chunkSize = NGL.calculateChunkSize( 6 );
    var radPrev = radius[0];

    for( var v = 0; v < n; v++ ) {
        i = v * 3 * 6;
        k = v * 3;

        inputMapping.set( NGL.BoxMapping, i );

        r = color[ k + 0 ];
        g = color[ k + 1 ];
        b = color[ k + 2 ];

        if( color2 ){
            r2 = color2[ k + 0 ];
            g2 = color2[ k + 1 ];
            b2 = color2[ k + 2 ];
        }

        if( tube ){
            if( v%tube==0 ){
                xp = from[ k + 0 ] + ( from[ k + 0 ] - to[ k + 0 ] );
                yp = from[ k + 1 ] + ( from[ k + 1 ] - to[ k + 1 ] );
                zp = from[ k + 2 ] + ( from[ k + 2 ] - to[ k + 2 ] );
            }else{
                xp = from[ k - 3 + 0 ];
                yp = from[ k - 3 + 1 ];
                zp = from[ k - 3 + 2 ];
            }

            if( v%tube==tube-1 ){
                xn = to[ k + 0 ] - ( from[ k + 0 ] - to[ k + 0 ] );
                yn = to[ k + 1 ] - ( from[ k + 1 ] - to[ k + 1 ] );
                zn = to[ k + 2 ] - ( from[ k + 2 ] - to[ k + 2 ] );
            }else{
                xn = to[ k + 3 + 0 ];
                yn = to[ k + 3 + 1 ];
                zn = to[ k + 3 + 2 ];
            }
        }

        x1 = from[ k + 0 ];
        y1 = from[ k + 1 ];
        z1 = from[ k + 2 ];

        x2 = to[ k + 0 ];
        y2 = to[ k + 1 ];
        z2 = to[ k + 2 ];

        x = ( x1 + x2 ) / 2.0;
        y = ( y1 + y2 ) / 2.0;
        z = ( z1 + z2 ) / 2.0;

        vx = x1 - x2;
        vy = y1 - y2;
        vz = z1 - z2;

        height = Math.sqrt( vx*vx + vy*vy + vz*vz ); 

        for( var m = 0; m < 6; m++ ) {
            j = v * 6 * 3 + (3 * m);

            inputColor[ j + 0 ] = r;
            inputColor[ j + 1 ] = g;
            inputColor[ j + 2 ] = b;

            if( color2 ){
                inputColor2[ j + 0 ] = r2;
                inputColor2[ j + 1 ] = g2;
                inputColor2[ j + 2 ] = b2;
            }

            if( tube ){
                inputP[ j + 0 ] = xp;
                inputP[ j + 1 ] = yp;
                inputP[ j + 2 ] = zp;

                inputQ[ j + 0 ] = x1;
                inputQ[ j + 1 ] = y1;
                inputQ[ j + 2 ] = z1;

                inputR[ j + 0 ] = x2;
                inputR[ j + 1 ] = y2;
                inputR[ j + 2 ] = z2;

                inputS[ j + 0 ] = xn;
                inputS[ j + 1 ] = yn;
                inputS[ j + 2 ] = zn;
            }

            aPosition[ j + 0 ] = x;
            aPosition[ j + 1 ] = y;
            aPosition[ j + 2 ] = z;

            inputAxis[ j + 0 ] = vx;
            inputAxis[ j + 1 ] = vy;
            inputAxis[ j + 2 ] = vz;

            inputCylinderRadius[ (v * 6) + m ] = radius[ v ];
            inputCylinderHeight[ (v * 6) + m ] = height;

            aRadius[ (v * 6) + m ] = 2.0;
        }

        ix = v * 12;
        it = v * 6;

        indices.set( NGL.BoxIndices, ix );
        for( var s=0; s<12; ++s ){
            indices[ix + s] = (it + indices[ix + s]) % chunkSize;
        }
    }

    // console.log( "inputMapping", inputMapping );
    // console.log( "inputColor", inputColor );
    // if(normal) console.log( "inputFrenetNormal", inputFrenetNormal );
    // console.log( "aPosition", aPosition );
    // console.log( "inputCylinderRadius", inputCylinderRadius );
    // console.log( "inputCylinderHeight", inputCylinderHeight );
    // console.log( "indices", indices );
    console.log( "n, tube", n, tube );

    mesh = new THREE.Mesh( geometry, material );
    NGL.group.add( mesh );
    
    //new NGL.SphereImpostorBuffer( inputP, inputColor, inputCylinderRadius, false );
    //new NGL.SphereImpostorBuffer( inputS, inputColor, inputCylinderRadius, false );
    //console.log( "inputP", inputP );
    //console.log( "inputQ", inputQ );

    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
    this.n = n;

    // new NGL.SphereImpostorBuffer( inputP, inputColor, inputCylinderRadius );
    // new NGL.SphereImpostorBuffer( inputQ, inputColor, inputCylinderRadius );
    // new NGL.SphereImpostorBuffer( inputR, inputColor, inputCylinderRadius );
    // new NGL.SphereImpostorBuffer( inputS, inputColor, inputCylinderRadius );
}


NGL.CylinderImpostorBuffer2 = function ( from, to, color, color2, radius, tube ) {

    // http://math.stackexchange.com/questions/13341/shortest-distance-between-a-point-and-a-helix
    // https://github.com/nithins/proteinvis/tree/master/pv_app/resources

    var geometry, material, mesh;
    var n = from.length/3;
    var n8 = n * 8;

    // make shader material
    var attributes = {
        inputMapping: { type: 'v2', value: null },
        inputColor: { type: 'c', value: null },
        inputAxis: { type: 'v3', value: null },
        inputDir: { type: 'v3', value: null },
        inputP: { type: 'v3', value: null },
        inputQ: { type: 'v3', value: null },
        inputR: { type: 'v3', value: null },
        inputS: { type: 'v3', value: null },
        inputCylinderRadius: { type: 'f', value: null },
        inputCylinderHeight: { type: 'f', value: null }
    };
    if( color2 ){
        attributes['inputColor2'] = { type: 'c', value: null };
    }
    var uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
    ]);

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'CylinderImpostor2.vert' ),
        fragmentShader: NGL.getShader( 'CylinderImpostor2.frag' ),
        depthTest: true,
        transparent: true,
        depthWrite: true,
        lights: true,
        side: THREE.DoubleSide,
        fog: true
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputMapping', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputColor', new THREE.Float32Attribute( n8, 3 ) );
    if( color2 ){
        geometry.addAttribute( 'inputColor2', new THREE.Float32Attribute( n8, 3 ) );
    }
    geometry.addAttribute( 'inputAxis', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputDir', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputP', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputQ', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputR', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputS', new THREE.Float32Attribute( n8, 3 ) );
    geometry.addAttribute( 'inputCylinderRadius', new THREE.Float32Attribute( n8, 1 ) );
    geometry.addAttribute( 'inputCylinderHeight', new THREE.Float32Attribute( n8, 1 ) );

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputColor = geometry.attributes.inputColor.array;
    if( color2 ){
        var inputColor2 = geometry.attributes.inputColor2.array;
    }
    var inputAxis = geometry.attributes.inputAxis.array;
    var inputDir = geometry.attributes.inputDir.array;
    var inputP = geometry.attributes.inputP.array;
    var inputQ = geometry.attributes.inputQ.array;
    var inputR = geometry.attributes.inputR.array;
    var inputS = geometry.attributes.inputS.array;
    var inputCylinderRadius = geometry.attributes.inputCylinderRadius.array;
    var inputCylinderHeight = geometry.attributes.inputCylinderHeight.array;

    geometry.addAttribute( 'index', new THREE.Uint16Attribute( n * 36, 1 ) );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n8, 12, 8 );

    var r, g, b;
    if( color2 ){
        var r2, g2, b2;
    }
    var x, y, z;
    var x1, y1, z1, x2, y2, z2;
    var xp, yp, zp, xn, yn, zn;
    var vx, vy, vz;
    var dx, dy, dz;
    var height;
    var i, j, k, ix, it;
    var chunkSize = NGL.calculateChunkSize( 8 );

    var BoxMapping2 = new Float32Array([
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0
    ]);
    
    var BoxIndices2 = new Uint16Array([
        0, 1, 2,
        1, 3, 2,
        4, 6, 5,
        5, 6, 7,
        4, 5, 0,
        5, 0, 1,
        6, 2, 7,
        2, 3, 7,
        1, 5, 7,
        7, 3, 1,
        2, 6, 0,
        6, 4, 0
    ]);

    for( var v = 0; v < n; v++ ) {
        i = v * 3 * 8;
        k = v * 3;

        inputMapping.set( BoxMapping2, i );

        r = color[ k + 0 ];
        g = color[ k + 1 ];
        b = color[ k + 2 ];

        if( color2 ){
            r2 = color2[ k + 0 ];
            g2 = color2[ k + 1 ];
            b2 = color2[ k + 2 ];
        }

        if( v%tube==0 ){
            xp = from[ k + 0 ];// + ( from[ k + 0 ] - to[ k + 0 ] );
            yp = from[ k + 1 ];// + ( from[ k + 1 ] - to[ k + 1 ] );
            zp = from[ k + 2 ];// + ( from[ k + 2 ] - to[ k + 2 ] );
        }else{
            xp = from[ k - 3 + 0 ];
            yp = from[ k - 3 + 1 ];
            zp = from[ k - 3 + 2 ];
        }

        x1 = from[ k + 0 ];
        y1 = from[ k + 1 ];
        z1 = from[ k + 2 ];

        x2 = to[ k + 0 ];
        y2 = to[ k + 1 ];
        z2 = to[ k + 2 ];

        if( v%tube==tube-1 ){
            xn = to[ k + 0 ];// + ( to[ k + 0 ] - from[ k + 0 ] );
            yn = to[ k + 1 ];// + ( to[ k + 1 ] - from[ k + 1 ] );
            zn = to[ k + 2 ];// + ( to[ k + 2 ] - from[ k + 2 ] );
        }else{
            xn = to[ k + 3 + 0 ];
            yn = to[ k + 3 + 1 ];
            zn = to[ k + 3 + 2 ];
        }

        // dx = dir[ k + 0 ];
        // dy = dir[ k + 1 ];
        // dz = dir[ k + 2 ];

        x = ( x1 + x2 ) / 2.0;
        y = ( y1 + y2 ) / 2.0;
        z = ( z1 + z2 ) / 2.0;

        vx = x1 - x2;
        vy = y1 - y2;
        vz = z1 - z2;

        height = Math.sqrt( vx*vx + vy*vy + vz*vz ); 

        for( var m = 0; m < 8; m++ ) {
            j = v * 8 * 3 + (3 * m);

            inputColor[ j + 0 ] = r;
            inputColor[ j + 1 ] = g;
            inputColor[ j + 2 ] = b;

            if( color2 ){
                inputColor2[ j + 0 ] = r2;
                inputColor2[ j + 1 ] = g2;
                inputColor2[ j + 2 ] = b2;
            }

            aPosition[ j + 0 ] = x;
            aPosition[ j + 1 ] = y;
            aPosition[ j + 2 ] = z;

            inputAxis[ j + 0 ] = vx;
            inputAxis[ j + 1 ] = vy;
            inputAxis[ j + 2 ] = vz;

            // inputDir[ j + 0 ] = dx;
            // inputDir[ j + 1 ] = dy;
            // inputDir[ j + 2 ] = dz;

            inputP[ j + 0 ] = xp;
            inputP[ j + 1 ] = yp;
            inputP[ j + 2 ] = zp;

            inputQ[ j + 0 ] = x1;
            inputQ[ j + 1 ] = y1;
            inputQ[ j + 2 ] = z1;

            inputR[ j + 0 ] = x2;
            inputR[ j + 1 ] = y2;
            inputR[ j + 2 ] = z2;

            inputS[ j + 0 ] = xn;
            inputS[ j + 1 ] = yn;
            inputS[ j + 2 ] = zn;

            inputCylinderRadius[ (v * 8) + m ] = radius[ v ];
            inputCylinderHeight[ (v * 8) + m ] = height;
        }

        ix = v * 36;
        it = v * 8;

        indices.set( BoxIndices2, ix );
        for( var s=0; s<36; ++s ){
            indices[ix + s] = (it + indices[ix + s]) % chunkSize;
        }
    }

    // console.log( "inputMapping", inputMapping );
    // console.log( "inputColor", inputColor );
    // console.log( "aPosition", aPosition );
    // console.log( "inputP", inputP );
    // console.log( "inputQ", inputQ );
    // console.log( "inputR", inputR );
    // console.log( "inputS", inputS );
    // console.log( "inputCylinderRadius", inputCylinderRadius );
    // console.log( "inputCylinderHeight", inputCylinderHeight );
    // console.log( "indices", indices );

    // mesh = new THREE.Line( geometry, material, THREE.LinePieces );
    mesh = new THREE.Mesh( geometry, material );
    NGL.group.add( mesh );


    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
    this.n = n;
}










