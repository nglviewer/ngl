

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


// https://github.com/cryos/avogadro/tree/master/libavogadro/src/extensions/shaders


NGL = {
    eps: 0.00001,
	//chunkSize: 65536,
    chunkSize: 65520, // divisible by 4 (quad mapping) and 6 (box mapping) and 8 (box mapping 2)
    BoxMapping: new Float32Array([
        -1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0
    ]),
    BoxIndices: new Uint16Array([
        0, 1, 2,
        1, 4, 2,
        2, 4, 3,
        4, 5, 3
    ]),
    BoxMapping2: new Float32Array([
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0
    ]),
    BoxIndices2: new Uint16Array([
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
    ]),
    QuadMapping: new Float32Array([
        -1.0,  1.0,
        -1.0, -1.0,
         1.0,  1.0,
         1.0, -1.0
    ]),
    QuadIndices: new Uint16Array([
        0, 1, 2,
        1, 3, 2
    ])
};


NGL.params = {
    fogType: 0,
    fogColor: 0x000000,
    fogNear: 0,
    fogFar: 1000,

    // backgroundColor: 0xFFFFFF,
    backgroundColor: 0x000000,

    cameraType: 1,
    cameraWidth: -1,
    cameraHeight: -1,
    cameraFov: 40,
    cameraNear: 1,
    cameraFar: 10000,

    specular: 0x050505,
};


NGL.resources = {
    'font/Arial.png': 'image',
    'font/Arial.fnt': '',

    'shader/BezierRaymarch.vert': '',
    'shader/BezierRaymarch.frag': '',
    'shader/HelixImpostor.vert': '',
    'shader/HelixImpostor.frag': '',
    'shader/HelixImpostor2.vert': '',
    'shader/HelixImpostor2.frag': '',
    'shader/Ribbon.vert': '',
    'shader/Ribbon.frag': '',
    'shader/SphereImpostor.vert': '',
    'shader/SphereImpostor.frag': '',
    'shader/SphereImpostorOrtho.vert': '',
    'shader/SphereImpostorOrtho.frag': '',
    'shader/SphereImpostorOrthoUnit.vert': '',
    'shader/SphereImpostorOrthoUnit.frag': '',
    'shader/SphereImpostorOrthoDepth.vert': '',
    'shader/SphereImpostorOrthoDepth.frag': '',
    'shader/SphereHalo.vert': '',
    'shader/SphereHalo.frag': '',
    'shader/SphereHaloOrtho.vert': '',
    'shader/SphereHaloOrtho.frag': '',
    'shader/CylinderImpostor.vert': '',
    'shader/CylinderImpostor.frag': '',
    'shader/CylinderImpostor2.vert': '',
    'shader/CylinderImpostor2.frag': '',
    'shader/SDFFont.vert': '',
    'shader/SDFFont.frag': '',
    'shader/LineSprite.vert': '',
    'shader/LineSprite.frag': '',
    'shader/ParticleSprite.vert': '',
    'shader/ParticleSprite.frag': '',
    'shader/Quad.vert': '',
    'shader/Quad.frag': '',
    'shader/QuadricImpostor.vert': '',
    'shader/QuadricImpostor.frag': '',
    'shader/QuadricImpostor2.vert': '',
    'shader/QuadricImpostor2.frag': '',
    'shader/QuadricImpostor3.vert': '',
    'shader/QuadricImpostor3.frag': '',

    'shader/chunk/light_params.glsl': '',
    'shader/chunk/light.glsl': '',
    'shader/chunk/fog.glsl': '',
    'shader/chunk/fog_params.glsl': '',
};


NGL.uniforms = {
    'projectionMatrix': new THREE.Matrix4(),
};


NGL.UniformsLib = {
    'fog': THREE.UniformsLib[ "fog" ],
    'lights': THREE.UniformsUtils.merge( [
        THREE.UniformsLib[ "lights" ],
        {
            "ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) },
            "emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
        }
    ])
};


NGL.lineLineIntersect = function( p1, p2, p3, p4 ){
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
}


NGL.ShaderLib = {
    'depthSphereRGBA': {
        uniforms: {},
        vertexShader: [
            "attribute lowp vec2 inputMapping;",
            "attribute lowp vec3 inputColor;",
            "attribute lowp float inputSphereRadius;",
            "void main() {",
                "vec4 cameraCornerPos = modelViewMatrix * vec4( position, 1.0 );",
                "cameraCornerPos.xy += inputMapping * inputSphereRadius;",
                "gl_Position = projectionMatrix * cameraCornerPos;",
            "}"
        ].join("\n"),
        fragmentShader: [
            "vec4 pack_depth( const in float depth ) {",
                "const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );",
                "const vec4 bit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );",
                "vec4 res = fract( depth * bit_shift );",
                "res -= res.xxyz * bit_mask;",
                "return res;",
            "}",
            "void main() {",
                //"gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );",
                //"gl_FragColor = pack_depth( gl_FragCoord.z );",
                "gl_FragColor = vec4( 0.5, 0.5, 1.0, 1.0 );",
            "}"
        ].join("\n")
    }
};


NGL.init = function ( eid ) {

    var p = NGL.params;
    
	var width = window.innerWidth;
	var height = window.innerHeight

	var camera, scene, renderer, controls, stats;

    // camera
	camera = new THREE.PerspectiveCamera( 40, width / height, 1, 10000 );
    // camera = new THREE.CombinedCamera( 
    //     width, height, p.cameraFov, p.cameraNear, p.cameraFar, p.cameraNear, 1000
    // );
    //camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, -10000, 10000 );
    camera.position.z = -300;
    //camera.toOrthographic();

    // scene
    scene = new THREE.Scene();
    group = new THREE.Object3D();
    scene.add( group );
    depthGroup = new THREE.Object3D();
    depthScene = new THREE.Scene();
    depthScene.add( depthGroup );
    unitSphereGroup = new THREE.Object3D();
    unitSphereScene = new THREE.Scene();
    unitSphereScene.add( unitSphereGroup );

    // renderer
    renderer = new THREE.WebGLRenderer( { alpha: false, antialias: false } );
    renderer.setSize( width, height );
    renderer.autoClear = true;

    var _glExtensionFragDepth = renderer.context.getExtension('EXT_frag_depth');
    //if(!_glExtensionFragDepth) { throw "ERROR getting 'EXT_frag_depth'" }
    renderer.context.getExtension('OES_standard_derivatives');

    // lights
    NGL.makeLights( scene );
    NGL.makeLights( unitSphereScene );

    // controls
    controls = NGL.makeControls( camera, renderer.domElement );

    // stats
    var container = document.getElementById( eid );
    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    var rendererStats = new THREEx.RendererStats();
    rendererStats.domElement.style.position = 'absolute'
    rendererStats.domElement.style.bottom   = '0px'
    document.body.appendChild( rendererStats.domElement )

    // window
    window.addEventListener( 'resize', NGL.onWindowResize, false );
    controls.handleResize();

    // resources
    var deferreds = [];
    _.each( NGL.resources, function( v, url ){
        var d;
        if( v=="image" ){
            d = $.loadImage( url ).done( 
                function( image ){ NGL.resources[ url ] = image; }
            );
        }else{
            d = $.ajax({
                url: url,
                success: function( data ){
                    if( v=="chunk" ){
                        NGL.resources[ url ] = data;
                    }else{
                        NGL.resources[ url ] = data;
                    }
                },
                dataType: "text"
            });
        }
        deferreds.push( d );
    });
    $.when.apply( $, deferreds ).then( function() {
        $( NGL ).triggerHandler( "initialized" );
    })

    // geometries
    this.sphereGeometry = new THREE.IcosahedronGeometry( 1, 1 );
    var matrix = new THREE.Matrix4().makeRotationX( Math.PI/ 2  );
    this.cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, true);
    this.cylinderGeometry.applyMatrix( matrix );
    this.cylinderCappedGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false);
    this.cylinderCappedGeometry.applyMatrix( matrix );
    
    // materials
    this.materialCache = {};

    // textures
    this.textures = [];

    // depth
    // var depthShader = THREE.ShaderLib[ "depthRGBA" ];
    var depthShader = NGL.ShaderLib[ "depthSphereRGBA" ];
    //console.log( depthShader );
    var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );
    var depthAttributes = {
        inputMapping: { type: 'v2', value: null },
        inputColor: { type: 'c', value: null },
        inputSize: { type: 'f', value: null }
    };
    this.depthMaterial = new THREE.ShaderMaterial({ 
        fragmentShader: depthShader.fragmentShader, 
        vertexShader: depthShader.vertexShader, 
        uniforms: depthUniforms,
        attributes: depthAttributes,
        blending: THREE.NoBlending
    });
    this.depthMaterial.needsUpdate = true;
    //console.log( this.depthMaterial );

    // var composer = new THREE.EffectComposer( renderer );
    // composer.addPass( new THREE.RenderPass( scene, camera ) );

    this.depthTarget = new THREE.WebGLRenderTarget( 
        width, height,
        {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat
        }
    );
    
    // this.depthPassPlugin = new THREE.DepthPassPlugin();
    // this.depthPassPlugin.renderTarget = this.depthTarget;
    // renderer.addPrePlugin( this.depthPassPlugin );

    // screen quad
    var cameraScreen = new THREE.OrthographicCamera( 
        width / - 2, width / 2, height / 2, height / - 2, -10000, 10000
    );
    cameraScreen.position.z = 100;
    var materialScreen = new THREE.ShaderMaterial( THREE.UnpackDepthRGBAShader );
    materialScreen.uniforms['tDiffuse'].value = this.depthTarget;
    var plane = new THREE.PlaneGeometry( width, height );
    quad = new THREE.Mesh( plane, materialScreen );
    quad.position.z = -100;
    var sceneScreen = new THREE.Scene();
    sceneScreen.add( quad );

    this.cameraScreen = cameraScreen;
    this.sceneScreen = sceneScreen;

    // unit sphere (orthographic)
    $( NGL ).bind( 'initialized', function(){
        unitSphereGroup.add( NGL.makeUnitSphere( 256 ) );
        // NGL.group.add( NGL.makeUnitSphere( 256 ) );
        // console.log( NGL.unitSphereGroup );
    });

    this.unitSphereTarget = new THREE.WebGLRenderTarget( 
        512, 512, //width, height,
        {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat
        }
    );

    // exports
    this.camera = camera;
    this.width = width;
    this.height = height;
    this.scene = scene;
    this.group = group;
    this.depthScene = depthScene;
    this.depthGroup = depthGroup;
    this.unitSphereScene = unitSphereScene;
    this.unitSphereGroup = unitSphereGroup;
    this.renderer = renderer;
    this.controls = controls;
    this.stats = stats;
    this.rendererStats = rendererStats;

    // params
    this.updateDisplay = true;
    this.manualDepthTest = false;

    // fog & background
    var p = NGL.params;
    NGL.setBackground( p.backgroundColor );
    NGL.setFog( p.fogType, p.fogColor, p.fogNear, p.fogFar );
}


NGL.onWindowResize = function() {
    NGL.camera.aspect = window.innerWidth / window.innerHeight;
    NGL.camera.updateProjectionMatrix();
    
    NGL.controls.handleResize();

    NGL.renderer.setSize( window.innerWidth, window.innerHeight );
}


NGL.animate = function() {
    requestAnimationFrame( NGL.animate );

    if( NGL.updateDisplay ){
        NGL.controls.update();
        NGL.render();
        NGL.stats.update();
    }
}


NGL.render = function() {

    NGL.updateDynamicUniforms();

    // needed for font texture, but I don't know why
    _.each( NGL.textures, function( v ){
        v.uniform.value = v.tex;
    });
    
    if( NGL.manualDepthTest ){
        NGL.renderer.render( NGL.depthScene, NGL.camera, NGL.depthTarget, true );
    }

    if( false ){
        NGL.camera.aspect = 1.0;
        NGL.camera.updateProjectionMatrix();
        NGL.renderer.setSize( 256, 256 );
        //NGL.renderer.render( NGL.unitSphereScene, NGL.camera );
        NGL.renderer.render( NGL.unitSphereScene, NGL.camera, NGL.unitSphereTarget, true );

        NGL.camera.aspect = window.innerWidth / window.innerHeight;
        NGL.camera.updateProjectionMatrix();
        NGL.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    NGL.renderer.render( NGL.scene, NGL.camera );
    // NGL.unitSphereControls.update();
    // NGL.renderer.render( NGL.unitSphereScene, NGL.unitSphereCamera );

    NGL.rendererStats.update( NGL.renderer );
}


NGL.updateDynamicUniforms = function(){
    var i, o, u;
    var matrix = new THREE.Matrix4();
    var nObjects = NGL.group.children.length;

    NGL.camera.updateMatrix();
    NGL.camera.updateMatrixWorld();
    NGL.camera.matrixWorldInverse.getInverse( NGL.camera.matrixWorld );
    NGL.camera.updateProjectionMatrix();

    for( i = 0; i < nObjects; i ++ ) {
        o = NGL.group.children[i];

        if( !o.material ) continue;
        u = o.material.uniforms;
        if( !u ) continue;

        if( u.modelViewMatrixInverse ){
            matrix.multiplyMatrices( 
                NGL.camera.matrixWorldInverse, o.matrixWorld
            );
            u.modelViewMatrixInverse.value.getInverse( matrix );
        }

        if( u.modelViewMatrixInverseTranspose ){
            matrix.multiplyMatrices( 
                NGL.camera.matrixWorldInverse, o.matrixWorld
            );
            u.modelViewMatrixInverseTranspose.value.getInverse( matrix ).transpose();
        }

        if( u.projectionMatrixInverse ){
            u.projectionMatrixInverse.value.getInverse(
                NGL.camera.projectionMatrix
            );
        }

        if( u.projectionMatrixTranspose ){
            u.projectionMatrixTranspose.value.copy(
                NGL.camera.projectionMatrix
            ).transpose();
        }
    }
}


NGL.clear = function(){
    NGL.scene.remove( NGL.group );
    NGL.group = new THREE.Object3D();
    NGL.scene.add( NGL.group );
    NGL.depthScene.remove( NGL.depthGroup );
    NGL.depthGroup = new THREE.Object3D();
    NGL.depthScene.add( NGL.depthGroup );
    NGL.renderer.clear();
}


NGL.makeLights = function( scene ){
    // lights
    var directionalLight = new THREE.DirectionalLight( 0xFFFFFF );
    directionalLight.position = new THREE.Vector3( 1, 1, -2.5 ).normalize();
    directionalLight.intensity = 0.5;
    var ambientLight = new THREE.AmbientLight( 0x101010 );
    var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0.01)
    scene.add( directionalLight );
    scene.add( ambientLight );
    scene.add( hemisphereLight );
}


NGL.makeControls = function( camera, domElement ){
    var controls = new THREE.TrackballControls( camera, domElement );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [65, 83, 68];
    return controls;
}


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


NGL.setFog = function( type, color, near, far ){
    var p = NGL.params;
    if( !_.isNull(type) ) p.fogType = type;
    if( color ) p.fogColor = color;
    if( near ) p.fogNear = near;
    if( far ) p.fogFar = far;
    if( p.fogType ){
        NGL.scene.fog = new THREE.Fog( p.fogColor, p.fogNear, p.fogFar );
    }else{
        NGL.scene.fog = null;
    }
    _.each( NGL.group.children, function( o ){
        if( o.material ) o.material.needsUpdate = true;
    });
    _.each( NGL.materialCache, function( m ){
        m.needsUpdate = true;
    });
};


NGL.setBackground = function( color ){
    if( !color ) return;
    NGL.params.backgroundColor = color;
    NGL.setFog( null, color );
    NGL.renderer.setClearColor( color, 1 );
}


NGL.setCamera = function( type, fov ){
    var p = NGL.params;
    if( !_.isNull(type) ) p.cameraType = type;
    if( fov ) p.cameraFov = fov;
    
    NGL.camera.fov = p.cameraFov;
    NGL.camera.updateProjectionMatrix();

    // if( p.cameraType ){
    //     NGL.camera.toPerspective();
    //     NGL.camera.position.z = 300;
    // }else{
    //     NGL.camera.toOrthographic();
    //     NGL.camera.position.z = 300;
    // }
    // NGL.controls = NGL.makeControls( NGL.camera, NGL.renderer.domElement );
    // console.log( type, p, NGL.camera );
};


NGL.getMaterial = function( params ) {
    var key = JSON.stringify( params );
    if (!NGL.materialCache[ key ]) {
        NGL.materialCache[ key ] = new THREE.MeshLambertMaterial( params )
    }
    return NGL.materialCache[ key ];
};


NGL.getShader = function( name, defines ) {
    var shader = NGL.resources[ 'shader/' + name ];
    shader = shader.replace( /^(?!\/\/)\s*#include\s+(\S+)/gmi, function( match, p1 ){
        var path = 'shader/chunk/' + p1 + '.glsl';
        var chunk = NGL.resources[ path ] || THREE.ShaderChunk[ p1 ];
        return chunk ? chunk : "";
    });
    return _.map( defines, function( def ){ return "#define " + def }).join("") + shader;
};


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
    var fnt = NGL.resources[ 'font/' + name + '.fnt' ].split('\n');
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
            character.textureCoords =   [
                x/tWidth            ,1 - y/tHeight,                 // top left
                x/tWidth            ,1 - (y+height)/tHeight,        // bottom left
                (x+width)/tWidth    ,1 - y/tHeight,                 // top right
                (x+width)/tWidth    ,1 - (y+height)/tHeight,        // bottom right
            ]
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
    // console.log( font );
    return font;
}


NGL.getPathData = function( position, color, size, segments ){
    var n = position.length/3;
    var n1 = n - 1;
    var numpoints = segments*n1;
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
    }
}


NGL.BufferVectorHelper = function( position, vector, color ){

    var geometry, material, line;
    var n = position.length/3;
    var n2 = n * 2;
    var n6 = n * 6;

    material = new THREE.LineBasicMaterial({ color: color, fog: true });
    geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', Float32Array, n2, 3 );

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

    geometry.addAttribute( 'position', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputP0', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputP1', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputP2', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputMapping', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputColor', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputAxis', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputCylinderRadius', Float32Array, n6, 1 );
    geometry.addAttribute( 'inputCylinderHeight', Float32Array, n6, 1 );
    geometry.addAttribute( 'inputBezierRadius', Float32Array, n6, 1 );

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

    geometry.addAttribute( 'index', Uint16Array, n * 12, 1 );
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
    // new NGL.CylinderGroup( cylFrom, cylTo, cylColor, cylRadius );
    // new NGL.SphereImpostorBuffer( cylFrom, cylColor, cylRadius, false );
    // new NGL.SphereImpostorBuffer( cylTo, cylColor, cylRadius, false );
    // new NGL.SphereImpostorBuffer( spherePos, cylColor, cylRadius, false );
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

    geometry.addAttribute( 'position', Float32Array, n4, 3 );
    geometry.addAttribute( 'inputDir', Float32Array, n4, 3 );
    geometry.addAttribute( 'inputSize', Float32Array, n4, 1 );
    geometry.addAttribute( 'normal', Float32Array, n4, 3 );
    //geometry.addAttribute( 'inputNormal', Float32Array, n4, 3 );
    geometry.addAttribute( 'inputColor', Float32Array, n4, 3 );

    var aPosition = geometry.attributes.position.array;
    var inputDir = geometry.attributes.inputDir.array;
    var inputSize = geometry.attributes.inputSize.array;
    var inputNormal = geometry.attributes.normal.array;
    //var inputNormal = geometry.attributes.inputNormal.array;
    var inputColor = geometry.attributes.inputColor.array;

    geometry.addAttribute( 'index', Uint16Array, n * 6, 1 );
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

    // new NGL.BufferVectorHelper( position, normal, new THREE.Color("rgb(255,0,0)") );
    // new NGL.BufferVectorHelper( position, dir, new THREE.Color("rgb(255,255,0)") );

    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
    this.n = n;
}


NGL.QuadricImpostorBuffer = function( position, color, radius ){

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
    
    // make shader material
    // #ifndef SPHERE
    // // columns of inverse transform
    // attribute vec4 Ti1;
    // attribute vec4 Ti2;
    // attribute vec4 Ti3;
    // attribute vec4 Ti4;

    // // columns of transform
    // attribute vec4 T1;
    // attribute vec4 T2;
    // attribute vec4 T3;
    // attribute vec4 T4;
    // #endif
    var attributes = {
        inputMapping: { type: 'v2', value: null },
        inputSphereRadius: { type: 'f', value: null },
        inputColor: { type: 'v3', value: null }
    };
    var uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
        {
            'viewport': { type: "v2", value: new THREE.Vector2( NGL.width, NGL.height ) },
            'pointSizeThreshold': { type: "f", value: 1 },
            'MaxPixelSize': { type: "f", value: 4096 },
            'modelViewMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
            'modelViewMatrixInverseTranspose': { type: "m4", value: new THREE.Matrix4() },
            'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
            'projectionMatrixTranspose': { type: "m4", value: new THREE.Matrix4() },
        }
    ]);

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'QuadricImpostor.vert' ),
        fragmentShader: NGL.getShader( 'QuadricImpostor.frag' ),
        fog: true,
        depthTest: true,
        transparent: true,
        depthWrite: true,
        lights: true,
        //blending: THREE.AdditiveBlending,
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', Float32Array, n4, 3 );
    geometry.addAttribute( 'inputMapping', Float32Array, n4, 2 );
    geometry.addAttribute( 'inputSphereRadius', Float32Array, n4, 1 );
    geometry.addAttribute( 'inputColor', Float32Array, n4, 3 );

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputSphereRadius = geometry.attributes.inputSphereRadius.array;
    var inputColor = geometry.attributes.inputColor.array;

    geometry.addAttribute( 'index', Uint16Array, n * 6, 1 );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n4, 2, 4 );

    var x, y, z;
    var r, g, b;
    var i, j, k, ix, it;
    var chunkSize = NGL.calculateChunkSize( 4 );

    for( var v = 0; v < n; v++ ) {
        i = v * 2 * 4;
        k = v * 3;

        inputMapping.set( NGL.QuadMapping, i );

        r = color[ k + 0 ];
        g = color[ k + 1 ];
        b = color[ k + 2 ];

        x = position[ k + 0 ];
        y = position[ k + 1 ];
        z = position[ k + 2 ];

        for( var m = 0; m < 4; m++ ) {
            j = v * 4 * 3 + (3 * m);

            inputColor[ j + 0 ] = r;
            inputColor[ j + 1 ] = g;
            inputColor[ j + 2 ] = b;

            aPosition[ j + 0 ] = x;
            aPosition[ j + 1 ] = y;
            aPosition[ j + 2 ] = z;

            inputSphereRadius[ (v * 4) + m ] = radius[ v ];
        }

        ix = v * 6;
        it = v * 4;

        indices.set( NGL.QuadIndices, ix );
        for( var s=0; s<6; ++s ){
            indices[ix + s] = (it + indices[ix + s]) % chunkSize;
        }
    }

    // console.log( "inputMapping", inputMapping );
    // console.log( "ParticleSprite aPosition", aPosition, aPosition.length );
    // console.log( "inputSize", inputSize );
    // console.log( "inputColor", inputColor );
    // console.log( "indices", indices );

    mesh = new THREE.Mesh( geometry, material );
    //mesh = new THREE.ParticleSystem( geometry, material );
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

    geometry.addAttribute( 'position', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputMapping', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputColor', Float32Array, n6, 3 );
    if( color2 ){
        geometry.addAttribute( 'inputColor2', Float32Array, n6, 3 );
    }
    geometry.addAttribute( 'inputAxis', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputDir', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputQ', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputR', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputCylinderRadius', Float32Array, n6, 1 );
    geometry.addAttribute( 'inputCylinderHeight', Float32Array, n6, 1 );

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

    geometry.addAttribute( 'index', Uint16Array, n * 12, 1 );
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

    geometry.addAttribute( 'position', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputMapping', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputColor', Float32Array, n8, 3 );
    if( color2 ){
        geometry.addAttribute( 'inputColor2', Float32Array, n8, 3 );
    }
    geometry.addAttribute( 'inputAxis', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputDir', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputQ', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputR', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputCylinderRadius', Float32Array, n8, 1 );
    geometry.addAttribute( 'inputCylinderHeight', Float32Array, n8, 1 );

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

    geometry.addAttribute( 'index', Uint16Array, n * 36, 1 );
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

    for( var v = 0; v < n; v++ ) {
        i = v * 3 * 8;
        k = v * 3;

        inputMapping.set( NGL.BoxMapping2, i );

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

        indices.set( NGL.BoxIndices2, ix );
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


NGL.MeshBuffer = function ( position, color, index, normal ) {
    var geometry, material, mesh;
    var n = position.length/3;

    material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        fog: true
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', Float32Array, n, 3 );
    geometry.addAttribute( 'color', Float32Array, n, 3 );
    geometry.addAttribute( 'normal', Float32Array, n, 3 );

    geometry.attributes.position.array = position;
    geometry.attributes.color.array = color;
    geometry.attributes.normal.array = normal;

    geometry.addAttribute( 'index', Uint16Array, n*3, 1 );
    geometry.attributes.index.array = index;

    mesh = new THREE.Mesh( geometry, material );
    NGL.group.add( mesh );


    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
    this.n = n;
}


NGL.ParticleSpriteBuffer = function ( position, color, radius ) {

    var geometry, material, mesh;
    var n = position.length/3;
    var n2 = n * 2;
    var n4 = n * 4;
    
    // make shader material
    var attributes = {
        inputMapping: { type: 'v2', value: null },
        inputSphereRadius: { type: 'f', value: null },
        inputColor: { type: 'v3', value: null }
    };
    var uniforms = THREE.UniformsUtils.merge( [
        THREE.UniformsLib[ "fog" ],
        {}
    ]);

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'ParticleSprite.vert' ),
        fragmentShader: NGL.getShader( 'ParticleSprite.frag' ),
        fog: true
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', Float32Array, n4, 3 );
    geometry.addAttribute( 'inputMapping', Float32Array, n4, 2 );
    geometry.addAttribute( 'inputSphereRadius', Float32Array, n4, 1 );
    geometry.addAttribute( 'inputColor', Float32Array, n4, 3 );

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputSphereRadius = geometry.attributes.inputSphereRadius.array;
    var inputColor = geometry.attributes.inputColor.array;

    geometry.addAttribute( 'index', Uint16Array, n * 6, 1 );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n4, 2, 4 );

    var x, y, z;
    var r, g, b;
    var i, j, k, ix, it;
    var chunkSize = NGL.calculateChunkSize( 4 );

    for( var v = 0; v < n; v++ ) {
        i = v * 2 * 4;
        k = v * 3;

        inputMapping.set( NGL.QuadMapping, i );

        r = color[ k + 0 ];
        g = color[ k + 1 ];
        b = color[ k + 2 ];

        x = position[ k + 0 ];
        y = position[ k + 1 ];
        z = position[ k + 2 ];

        for( var m = 0; m < 4; m++ ) {
            j = v * 4 * 3 + (3 * m);

            inputColor[ j + 0 ] = r;
            inputColor[ j + 1 ] = g;
            inputColor[ j + 2 ] = b;

            aPosition[ j + 0 ] = x;
            aPosition[ j + 1 ] = y;
            aPosition[ j + 2 ] = z;

            inputSphereRadius[ (v * 4) + m ] = radius[ v ];
        }

        ix = v * 6;
        it = v * 4;

        indices.set( NGL.QuadIndices, ix );
        for( var s=0; s<6; ++s ){
            indices[ix + s] = (it + indices[ix + s]) % chunkSize;
        }
    }

    // console.log( "inputMapping", inputMapping );
    // console.log( "ParticleSprite aPosition", aPosition, aPosition.length );
    // console.log( "inputSize", inputSize );
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


NGL.ParticleBuffer = function ( position, color, size ) {
    var geometry, material, particle;
    var n = position.length/3;

    material = new THREE.ParticleSystemMaterial({
        vertexColors: true,
        size: size,
        sizeAttenuation: false,
        fog: true
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', Float32Array, n, 3 );
    geometry.addAttribute( 'color', Float32Array, n, 3 );

    var aPosition = geometry.attributes.position.array;
    var aColor = geometry.attributes.color.array;

    var i, j;

    aPosition.set( position );
    aColor.set( color );

    // console.log( "aPosition", aPosition );
    // console.log( "aColor", aColor );

    particle = new THREE.ParticleSystem( geometry, material );
    NGL.group.add( particle );


    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.particle = particle;
    this.n = n;
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

    geometry.addAttribute( 'position', Float32Array, n4, 3 );
    geometry.addAttribute( 'inputMapping', Float32Array, n4, 2 );
    geometry.addAttribute( 'inputWidth', Float32Array, n4, 1 );
    geometry.addAttribute( 'inputAxis', Float32Array, n4, 3 );
    geometry.addAttribute( 'inputColor', Float32Array, n4, 3 );
    if( color2 ){
        geometry.addAttribute( 'inputColor2', Float32Array, n4, 3 );
    }

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputWidth = geometry.attributes.inputWidth.array;
    var inputAxis = geometry.attributes.inputAxis.array;
    var inputColor = geometry.attributes.inputColor.array;
    if( color2 ){
        var inputColor2 = geometry.attributes.inputColor2.array;
    }

    geometry.addAttribute( 'index', Uint16Array, n * 6, 1 );
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


NGL.LineBuffer = function ( from, to, color, color2 ) {

    var geometry, material, line;
    var n = from.length/3;
    var n6 = n * 6;
    var nX = n * 2;
    if( color2 ){
        nX *= 2;
    }

    material = new THREE.LineBasicMaterial({
        vertexColors: true,
        fog: true
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', Float32Array, nX, 3 );
    geometry.addAttribute( 'color', Float32Array, nX, 3 );

    var aPosition = geometry.attributes.position.array;
    var aColor = geometry.attributes.color.array;

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

    // console.log( "aPosition", aPosition );
    // console.log( "aColor", aColor );

    line = new THREE.Line( geometry, material, THREE.LinePieces );
    NGL.group.add( line );


    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.line = line;
    this.n = n;
}


NGL.TextBuffer = function ( position, radius, text ) {
    var type = 'Arial';
    var font = NGL.getFont( type );
    var tex = new THREE.Texture( NGL.resources[ 'font/' + type + '.png' ] );
    tex.needsUpdate = true;

    var geometry, material, mesh;
    var n = position.length/3;
    var n2 = n * 2;
    var n4 = n * 4;

    text = [];
    for( var i = 0; i < n; i++ ){
        text.push( "#" + i );
    }
        
    var charCount = _.reduce( text, function(memo, t){ return memo + t.length; }, 0);
    var nc = charCount;
    var nc2 = 2 * charCount;
    var nc4 = 4 * charCount;


    // make shader material
    var attributes = {
        position: { type: 'v3', value: null },
        inputMapping: { type: 'v2', value: null },
        inputTexCoord: { type: 'v2', value: null },
        inputSphereRadius: { type: 'f', value: null }
    };
    var uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        {
            "colorx"  : { type: "c", value: new THREE.Color( 0xFFFFFF ) },
            "fontTexture"  : { type: "t", value: tex }
        }
    ]);

    NGL.textures.push({ uniform: uniforms.fontTexture, tex: tex });

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'SDFFont.vert' ),
        fragmentShader: NGL.getShader( 'SDFFont.frag' ),
        depthTest: true,
        transparent: true,
        //alphaTest: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: true
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', Float32Array, nc4, 3 );
    geometry.addAttribute( 'inputMapping', Float32Array, nc4, 2 );
    geometry.addAttribute( 'inputTexCoord', Float32Array, nc4, 2 );
    geometry.addAttribute( 'inputSphereRadius', Float32Array, nc4, 1 );

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputTexCoord = geometry.attributes.inputTexCoord.array;
    var inputSphereRadius = geometry.attributes.inputSphereRadius.array;

    geometry.addAttribute( 'index', Uint16Array, nc * 6, 1 );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( nc4, 2, 4 );

    var c;
    var x, y, z;
    var i, j, k, o, ix, it;
    var iCharAll = 0;
    var chunkSize = NGL.calculateChunkSize( 4 );
    var txt, xadvance, iChar, nChar;

    for( var v = 0; v < n; v++ ) {

        o = 3 * v;
        txt = text[ v ];
        xadvance = 0;
        nChar = txt.length;

        for( iChar = 0; iChar < nChar; iChar++, iCharAll++ ) {

            c = font[ txt.charCodeAt( iChar ) ];
            i = iCharAll * 2 * 4;
            k = iCharAll * 3;

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

            inputTexCoord[ i + 0 ] = c.textureCoords[0];
            inputTexCoord[ i + 1 ] = c.textureCoords[1];
            inputTexCoord[ i + 2 ] = c.textureCoords[2];
            inputTexCoord[ i + 3 ] = c.textureCoords[3];
            inputTexCoord[ i + 4 ] = c.textureCoords[4];
            inputTexCoord[ i + 5 ] = c.textureCoords[5];
            inputTexCoord[ i + 6 ] = c.textureCoords[6];
            inputTexCoord[ i + 7 ] = c.textureCoords[7];

            x = position[ o + 0 ];
            y = position[ o + 1 ];
            z = position[ o + 2 ];

            for( var m = 0; m < 4; m++ ) {
                j = iCharAll * 4 * 3 + (3 * m);

                aPosition[ j + 0 ] = x;
                aPosition[ j + 1 ] = y;
                aPosition[ j + 2 ] = z;

                inputSphereRadius[ (iCharAll * 4) + m ] = Math.abs(radius[ v ]);
            }

            ix = iCharAll * 6;
            it = iCharAll * 4;

            indices[ ix + 0 ] = (it + 0) % chunkSize;
            indices[ ix + 1 ] = (it + 1) % chunkSize;
            indices[ ix + 2 ] = (it + 2) % chunkSize;
            indices[ ix + 3 ] = (it + 3) % chunkSize;
            indices[ ix + 4 ] = (it + 2) % chunkSize;
            indices[ ix + 5 ] = (it + 1) % chunkSize;

            xadvance += c.xadvance2;
        }
    }

    // console.log( "inputMapping", inputMapping );
    // console.log( "inputTexCoord", inputTexCoord );
    // console.log( "aPosition", aPosition );
    // console.log( "inputSphereRadius", inputSphereRadius );
    // console.log( "indices", indices );

    mesh = new THREE.Mesh( geometry, material );
    NGL.group.add( mesh );

    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
    this.n = n;
}


NGL.HaloBuffer = function ( position, radius, ortho ) {

    var geometry, material, mesh;
    var n = position.length/3;
    var n2 = n * 2;
    var n4 = n * 4;
    
    // make shader material
    var attributes = {
        inputMapping: { type: 'v2', value: null },
        inputSphereRadius: { type: 'f', value: null }
    };
    var uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        {
            "colorx"  : { type: "c", value: new THREE.Color( 0x007700 ) }
        }
    ]);

    ortho = ortho ? 'Ortho' : '';
    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'SphereHalo' + ortho + '.vert' ),
        fragmentShader: NGL.getShader( 'SphereHalo' + ortho + '.frag' ),
        depthTest: true,
        transparent: true,
        depthWrite: false,
        lights: false,
        blending: THREE.AdditiveBlending,
        fog: true
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', Float32Array, n4, 3 );
    geometry.addAttribute( 'inputMapping', Float32Array, n4, 2 );
    geometry.addAttribute( 'inputSphereRadius', Float32Array, n4, 1 );

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputSphereRadius = geometry.attributes.inputSphereRadius.array;

    geometry.addAttribute( 'index', Uint16Array, n * 6, 1 );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n4, 2, 4 );

    var x, y, z;
    var i, j, k, ix, it;
    var chunkSize = NGL.calculateChunkSize( 4 );

    for( var v = 0; v < n; v++ ) {
        i = v * 2 * 4;
        k = v * 3;

        inputMapping.set( NGL.QuadMapping, i );

        x = position[ k + 0 ];
        y = position[ k + 1 ];
        z = position[ k + 2 ];

        for( var m = 0; m < 4; m++ ) {
            j = v * 4 * 3 + (3 * m);
            
            aPosition[ j + 0 ] = x;
            aPosition[ j + 1 ] = y;
            aPosition[ j + 2 ] = z;

            inputSphereRadius[ (v * 4) + m ] = radius[ v ];
        }

        ix = v * 6;
        it = v * 4;

        indices.set( NGL.QuadIndices, ix );
        for( var s=0; s<6; ++s ){
            indices[ix + s] = (it + indices[ix + s]) % chunkSize;
        }
    }

    // console.log( "inputMapping", inputMapping );
    // console.log( "Halo aPosition", aPosition, aPosition.length );
    // console.log( "inputSphereRadius", inputSphereRadius );
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

    group = new THREE.Object3D();

    var sphere, i;
    var colr = new THREE.Color();
    for( var v = 0; v < n; v++ ) {
        i = 3 * v;
        colr.r = color[ i + 0 ];
        colr.g = color[ i + 1 ];
        colr.b = color[ i + 2 ];
        sphere = new THREE.Mesh(
            NGL.sphereGeometry, 
            NGL.getMaterial({ 
                color: colr, 
                specular: 0x050505, 
                visible: true,
                wireframe: false,
                fog: true
            })
        );
        sphere.scale.x = sphere.scale.y = sphere.scale.z = radius[ v ];
        sphere.position.x = position[ i + 0 ];
        sphere.position.y = position[ i + 1 ];
        sphere.position.z = position[ i + 2 ];
        sphere.matrixAutoUpdate = false;
        sphere.updateMatrix();
        group.add( sphere );
    }

    NGL.group.add( group );

    // public attributes
    this.group = group;
    this.n = n;
}


NGL.makeUnitSphere = function ( radius ) {

    var geometry, material, mesh;
    var n = 1;
    var n4 = n * 4;

    // make shader material

    var uniforms = THREE.UniformsUtils.merge([
        NGL.UniformsLib[ "lights" ],
        {
            'color': { type: "c", value: new THREE.Color( 0xFFFFFF ) },
            'sphereRadius': { type: "f", value: radius },
            'viewWidth': { type: "f", value: NGL.width },
            'viewHeight': { type: "f", value: NGL.height }
        }
    ]);

    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        attributes: {
            inputMapping: { type: 'v2', value: null }
        },
        vertexShader: NGL.getShader( 'SphereImpostorOrthoUnit.vert' ),
        fragmentShader: NGL.getShader( 'SphereImpostorOrthoUnit.frag' ),
        depthTest: true,
        transparent: false,
        depthWrite: true,
        lights: true,
        fog: false
    });

    // make geometry and populate buffer
    geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', Float32Array, n4, 3 );
    geometry.addAttribute( 'inputMapping', Float32Array, n4, 2 );

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;

    geometry.addAttribute( 'index', Uint16Array, n * 6, 1 );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n4, 2, 4 );

    inputMapping.set( NGL.QuadMapping );

    for( var m = 0, j; m < 4; m++ ) {
        j = 3 * m;
        aPosition[ j + 0 ] = 0;
        aPosition[ j + 1 ] = 0;
        aPosition[ j + 2 ] = 0;
    }

    indices.set( NGL.QuadIndices );

    return new THREE.Mesh( geometry, material );
};


NGL.SphereImpostorBuffer = function ( position, color, radius, ortho ) {

	var geometry, material, mesh;
	var n = position.length/3;
	var n2 = n * 2;
	var n4 = n * 4;

	// make shader material
	var attributes = {
        inputMapping: { type: 'v2', value: null },
        inputColor: { type: 'c', value: null },
        inputSphereRadius: { type: 'f', value: null }
    };
    var uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
        {
            'viewport': { type: "v2", value: new THREE.Vector2( NGL.width, NGL.height ) },
            'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
            'tDepth': { type: "t", value: NGL.depthTarget },
            'tUnitSphere': { type: "t", value: NGL.unitSphereTarget },
            'viewWidth': { type: "f", value: NGL.width },
            'viewHeight': { type: "f", value: NGL.height },
        }
    ]);

    ortho = ortho ? 'Ortho' : '';
    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: NGL.getShader( 'SphereImpostor' + ortho + '.vert' ),
        fragmentShader: NGL.getShader( 'SphereImpostor' + ortho + '.frag' ),
        depthTest: true,
        transparent: false,
        depthWrite: true,
        lights: true,
        fog: true
    });

    if( ortho ){
        depthMaterial = new THREE.ShaderMaterial( {
            //uniforms: uniforms,
            attributes: attributes,
            vertexShader: NGL.getShader( 'SphereImpostor' + ortho + 'Depth.vert' ),
            fragmentShader: NGL.getShader( 'SphereImpostor' + ortho + 'Depth.frag' ),
            depthTest: true,
            transparent: false,
            depthWrite: true,
            lights: false,
            //fog: true
        });
    }
    //material.uniforms['tDepth'].value = NGL.depthTarget;
    //NGL.textures.push({ uniform: material.uniforms.tDepth, tex: NGL.depthTarget });

	// make geometry and populate buffer
	geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', Float32Array, n4, 3 );
    geometry.addAttribute( 'inputMapping', Float32Array, n4, 2 );
    geometry.addAttribute( 'inputColor', Float32Array, n4, 3 );
    geometry.addAttribute( 'inputSphereRadius', Float32Array, n4, 1 );

    var aPosition = geometry.attributes.position.array;
    var inputMapping = geometry.attributes.inputMapping.array;
    var inputColor = geometry.attributes.inputColor.array;
    var inputSphereRadius = geometry.attributes.inputSphereRadius.array;

    geometry.addAttribute( 'index', Uint16Array, n * 6, 1 );
    var indices = geometry.attributes.index.array;

    geometry.offsets = NGL.calculateOffsets( n4, 2, 4 );
    
    var r, g, b;
    var x, y, z;
    var i, j, k, ix, it;
    var chunkSize = NGL.calculateChunkSize( 4 );

    for( var v = 0; v < n; v++ ) {
        i = v * 2 * 4;
        k = v * 3;

        inputMapping.set( NGL.QuadMapping, i );

        r = color[ k + 0 ];
        g = color[ k + 1 ];
        b = color[ k + 2 ];

        x = position[ k + 0 ];
        y = position[ k + 1 ];
        z = position[ k + 2 ];

        for( var m = 0; m < 4; m++ ) {
            j = v * 4 * 3 + (3 * m);

            inputColor[ j + 0 ] = r;
            inputColor[ j + 1 ] = g;
            inputColor[ j + 2 ] = b;

            aPosition[ j + 0 ] = x;
            aPosition[ j + 1 ] = y;
            aPosition[ j + 2 ] = z;

            inputSphereRadius[ (v * 4) + m ] = radius[ v ];
        }

        ix = v * 6;
        it = v * 4;

        indices.set( NGL.QuadIndices, ix );
        for( var s=0; s<6; ++s ){
            indices[ix + s] = (it + indices[ix + s]) % chunkSize;
        }
    }

    // console.log( "inputMapping", inputMapping );
    // console.log( "inputColor", inputColor );
    // console.log( "aPosition", aPosition );
    // console.log( "inputSphereRadius", inputSphereRadius );
    // console.log( "indices", indices );

    mesh = new THREE.Mesh( geometry, material );
    NGL.group.add( mesh );
    if( ortho ){
        depthMesh = new THREE.Mesh( geometry, depthMaterial );
        NGL.depthGroup.add( depthMesh );
    }

    // public attributes
	this.geometry = geometry;
	this.material = material;
	this.mesh = mesh;
	this.n = n;
};


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


NGL.CylinderImpostorBuffer = function ( from, to, color, color2, radius, tube ) {

    var geometry, material, mesh;
    var n = from.length/3;
    var n6 = n * 6;

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

    geometry.addAttribute( 'position', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputMapping', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputColor', Float32Array, n6, 3 );
    if( color2 ){
        geometry.addAttribute( 'inputColor2', Float32Array, n6, 3 );
    }
    if( tube ){
        geometry.addAttribute( 'inputP', Float32Array, n6, 3 );
        geometry.addAttribute( 'inputQ', Float32Array, n6, 3 );
        geometry.addAttribute( 'inputR', Float32Array, n6, 3 );
        geometry.addAttribute( 'inputS', Float32Array, n6, 3 );
    }
    geometry.addAttribute( 'inputAxis', Float32Array, n6, 3 );
    geometry.addAttribute( 'inputCylinderRadius', Float32Array, n6, 1 );
    geometry.addAttribute( 'inputCylinderHeight', Float32Array, n6, 1 );

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

    geometry.addAttribute( 'index', Uint16Array, n * 12, 1 );
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

    var test = new Float32Array( n*3 );
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

    geometry.addAttribute( 'position', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputMapping', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputColor', Float32Array, n8, 3 );
    if( color2 ){
        geometry.addAttribute( 'inputColor2', Float32Array, n8, 3 );
    }
    geometry.addAttribute( 'inputAxis', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputDir', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputP', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputQ', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputR', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputS', Float32Array, n8, 3 );
    geometry.addAttribute( 'inputCylinderRadius', Float32Array, n8, 1 );
    geometry.addAttribute( 'inputCylinderHeight', Float32Array, n8, 1 );

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

    geometry.addAttribute( 'index', Uint16Array, n * 36, 1 );
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

    for( var v = 0; v < n; v++ ) {
        i = v * 3 * 8;
        k = v * 3;

        inputMapping.set( NGL.BoxMapping2, i );

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

        indices.set( NGL.BoxIndices2, ix );
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










