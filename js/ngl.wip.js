/**
 * @file WIP
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


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



// case "tube":
//     new NGL.TextBuffer( position, radius );
//     if( impostor ){
//         var pd = NGL.getPathData( position, color, radius, 10 );
//         new NGL.TubeImpostorBuffer( pd.position, pd.normal, pd.dir, pd.color, pd.size );
//     }else{
//         new NGL.TubeGroup( position, color, radius, 10 );
//     }
//     break;
// case "elliptic-tube":
//     var pd = NGL.getPathData( position, color, radius, 20 );
//     new NGL.EllipticTubeImpostorBuffer(
//         pd.position,
//         pd.binormals, pd.normals, pd.tangents,
//         pd.color
//     );
//     break;
// case "ribbon":
//     new NGL.TextBuffer( position, radius );
//     var pd = NGL.getPathData( position, color, radius, 2 );
//     new NGL.RibbonBuffer( pd.position, pd.normal, pd.dir, pd.color, pd.size );
//     new NGL.SphereImpostorBuffer( position, color, radius2 );
//     break;



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


NGL.TubeImpostorBuffer = function( position, normal, dir, color, radius ){

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

        cylRadius[ v ] = radius[ v ];

    }

    // console.log( "cylFrom", cylFrom );
    // console.log( "cylTo", cylTo );
    // console.log( "cylColor", cylColor );
    // console.log( "cylRadius", cylRadius );

    this.cylinderBuffer = new NGL.CylinderBuffer(
        cylFrom, cylTo, cylColor, cylColor, cylRadius, n, false
    );

    this.mesh = this.cylinderBuffer.mesh;

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

    console.time( "SplineCurve3" );
    var path = new THREE.SplineCurve3( points );
    console.timeEnd( "SplineCurve3" );

    var geometry = new THREE.TubeGeometry( path, (n-1)*10, radius[ 0 ], 8 );

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
    
    this.mesh = mesh;

}


NGL.RibbonBuffer = function( position, normal, dir, color, size ){

    var geometry, material, mesh;
    var n = ( position.length/3 ) - 1;
    var n4 = n * 4;

    var quadIndices = new Uint32Array([
        0, 1, 2,
        1, 3, 2
    ]);

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

    var aPosition = new Float32Array( n4 * 3 );
    var inputDir = new Float32Array( n4 * 3 );
    var inputSize = new Float32Array( n4 );
    var inputNormal = new Float32Array( n4 * 3 );
    var inputColor = new Float32Array( n4 * 3 );

    geometry.addAttribute( 'position', new THREE.BufferAttribute( aPosition, 3 ) );
    geometry.addAttribute( 'inputDir', new THREE.BufferAttribute( inputDir, 3 ) );
    geometry.addAttribute( 'inputSize', new THREE.BufferAttribute( inputSize, 1 ) );
    geometry.addAttribute( 'normal', new THREE.BufferAttribute( inputNormal, 3 ) );
    geometry.addAttribute( 'inputColor', new THREE.BufferAttribute( inputColor, 3 ) );

    var indices = new Uint32Array( n4 * 3 );
    geometry.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );

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

        indices.set( quadIndices, ix );
        for( var s=0; s<6; ++s ){
            indices[ ix + s ] += it;
        }

    }

    // console.log( n, n4 )
    // console.log( "inputDir", inputDir );
    // console.log( "inputNormal", inputNormal );
    // console.log( "RibbonBuffer aPosition", aPosition, aPosition.length );
    // console.log( position );
    // console.log( "inputSize", inputSize, size );
    // console.log( "inputColor", inputColor );
    // console.log( "indices", indices );

    mesh = new THREE.Mesh( geometry, material );

    // new NGL.BufferVectorHelper( position, normal, new THREE.Color("rgb(255,0,0)") );
    // new NGL.BufferVectorHelper( position, dir, new THREE.Color("rgb(255,255,0)") );

    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;

}


NGL.BufferVectorHelper = function( position, vector, color, scale ){

    scale = scale || 1;

    var geometry, material, line;
    var n = position.length/3;
    var n2 = n * 2;
    var n6 = n * 6;

    material = new THREE.LineBasicMaterial({ color: color, fog: true });
    geometry = new THREE.BufferGeometry();

    var aPosition = new Float32Array( n2 * 3 );
    geometry.addAttribute( 'position', new THREE.BufferAttribute( aPosition, 3 ) );

    var i, j;

    for( var v = 0; v < n; v++ ){
        
        i = v * 2 * 3;
        j = v * 3;

        aPosition[ i + 0 ] = position[ j + 0 ];
        aPosition[ i + 1 ] = position[ j + 1 ];
        aPosition[ i + 2 ] = position[ j + 2 ];
        aPosition[ i + 3 ] = position[ j + 0 ] + vector[ j + 0 ] * scale;
        aPosition[ i + 4 ] = position[ j + 1 ] + vector[ j + 1 ] * scale;
        aPosition[ i + 5 ] = position[ j + 2 ] + vector[ j + 2 ] * scale;

    }

    // console.log( "position", aPosition );

    line = new THREE.Line( geometry, material, THREE.LinePieces );

    // public attributes
    this.geometry = geometry;
    this.material = material;
    this.mesh = line;

}




/////////
// Todo

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


// TODO
NGL.CrossBuffer = function ( position, color, size ) {
    
    // screen aligned; pixel buffer

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



