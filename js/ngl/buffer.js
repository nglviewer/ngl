/**
 * @file Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


////////////////
// Buffer Core

NGL.DoubleSidedBuffer = function( buffer ){

    this.size = buffer.size;
    this.side = buffer.side;
    this.wireframe = buffer.wireframe;
    this.visible = buffer.visible;
    this.geometry = buffer.geometry;
    this.pickable = buffer.pickable;

    this.group = new THREE.Group();
    this.wireframeGroup = new THREE.Group();
    this.pickingGroup = new THREE.Group();

    var frontMeshes = [];
    var backMeshes = [];

    var frontBuffer = buffer;
    var backBuffer = new buffer.constructor();

    frontBuffer.makeMaterial();
    backBuffer.makeMaterial();

    backBuffer.geometry = buffer.geometry;
    backBuffer.wireframeGeometry = buffer.wireframeGeometry;
    backBuffer.size = buffer.size;
    backBuffer.attributeSize = buffer.attributeSize;
    backBuffer.pickable = buffer.pickable;
    backBuffer.setParameters( buffer.getParameters() );
    backBuffer.updateShader();

    frontBuffer.setParameters( {
        side: THREE.FrontSide
    } );
    backBuffer.setParameters( {
        side: THREE.BackSide,
        opacity: backBuffer.opacity
    } );

    this.getMesh = function( picking ){

        var front, back;

        if( picking ){
            back = backBuffer.getPickingMesh();
            front = frontBuffer.getPickingMesh();
        }else{
            back = backBuffer.getMesh();
            front = frontBuffer.getMesh();
        }

        frontMeshes.push( front );
        backMeshes.push( back );

        this.setParameters( { side: this.side } );

        return new THREE.Group().add( back, front );

    };

    this.getWireframeMesh = function(){

        return buffer.getWireframeMesh();

    };

    this.getPickingMesh = function(){

        return this.getMesh( true );

    };

    this.setAttributes = function( data ){

        buffer.setAttributes( data );

    };

    this.setParameters = function( data ){

        data = Object.assign( {}, data );

        if( data.side === THREE.FrontSide ){

            frontMeshes.forEach( function( m ){ m.visible = true; } );
            backMeshes.forEach( function( m ){ m.visible = false; } );

        }else if( data.side === THREE.BackSide ){

            frontMeshes.forEach( function( m ){ m.visible = false; } );
            backMeshes.forEach( function( m ){ m.visible = true; } );

        }else if( data.side === THREE.DoubleSide ){

            frontMeshes.forEach( function( m ){ m.visible = true; } );
            backMeshes.forEach( function( m ){ m.visible = true; } );

        }

        if( data.side !== undefined ){
            this.side = data.side;
        }
        delete data.side;

        frontBuffer.setParameters( data );

        if( data.wireframe !== undefined ){
            this.wireframe = data.wireframe;
            this.setVisibility( this.visible );
        }
        delete data.wireframe;

        backBuffer.setParameters( data );

    };

    this.setVisibility = NGL.Buffer.prototype.setVisibility;

    this.dispose = function(){

        frontBuffer.dispose();
        backBuffer.dispose();

    };

};


/**
 * The core buffer class.
 * @class
 * @private
 */
NGL.Buffer = function( position, color, index, pickingColor, params ){

    var p = params || {};

    // required properties:
    // - size
    // - attributeSize
    // - vertexShader
    // - fragmentShader

    this.pickable = false;
    this.dynamic = true;

    this.opaqueBack = p.opaqueBack !== undefined ? p.opaqueBack : false;
    this.dullInterior = p.dullInterior !== undefined ? p.dullInterior : false;
    this.side = p.side !== undefined ? p.side : THREE.DoubleSide;
    this.opacity = p.opacity !== undefined ? p.opacity : 1.0;
    this.nearClip = p.nearClip !== undefined ? p.nearClip : true;
    this.flatShaded = p.flatShaded !== undefined ? p.flatShaded : false;
    this.background = p.background !== undefined ? p.background : false;
    this.linewidth = p.linewidth !== undefined ? p.linewidth : 1;
    this.wireframe = p.wireframe !== undefined ? p.wireframe : false;
    this.wireframeLinewidth = p.wireframeLinewidth || 1;

    this.geometry = new THREE.BufferGeometry();

    this.addAttributes( {
        "position": { type: "v3", value: position },
        "color": { type: "c", value: color },
    } );

    if( index ){
        this.geometry.addIndex(
            new THREE.BufferAttribute( index, 1 )
        );
        this.geometry.index.setDynamic( this.dynamic );
    }

    if( pickingColor ){
        this.addAttributes( {
            "pickingColor": { type: "c", value: pickingColor },
        } );
        this.pickable = true;
    }

    this.uniforms = {
        "fogColor": { type: "c", value: null },
        "fogNear": { type: "f", value: 0.0 },
        "fogFar": { type: "f", value: 0.0 },
        "opacity": { type: "f", value: this.opacity },
        "nearClip": { type: "f", value: 0.0 }
    };

    this.pickingUniforms = {
        "nearClip": { type: "f", value: 0.0 },
        "objectId": { type: "f", value: 0.0 },
    };

    this.group = new THREE.Group();
    this.wireframeGroup = new THREE.Group();
    this.pickingGroup = new THREE.Group();

    this.makeWireframeGeometry();

};

NGL.Buffer.prototype = {

    constructor: NGL.Buffer,

    parameters: {

        opaqueBack: { updateShader: true },
        dullInterior: { updateShader: true },
        side: { updateShader: true, property: true },
        opacity: { uniform: true },
        nearClip: { updateShader: true },
        flatShaded: { updateShader: true },
        background: { updateShader: true },
        linewidth: { property: true },
        wireframe: { updateVisibility: true }

    },

    get transparent () {

        return this.opacity < 1;

    },

    makeMaterial: function(){

        this.material = new THREE.RawShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: "",
            fragmentShader: "",
            depthTest: true,
            transparent: this.transparent,
            depthWrite: true,
            lights: false,
            fog: true,
            side: this.side,
            linewidth: this.linewidth
        } );

        this.wireframeMaterial = new THREE.RawShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: "Line.vert",
            fragmentShader: "Line.frag",
            depthTest: true,
            transparent: this.transparent,
            depthWrite: true,
            lights: false,
            fog: true,
            side: this.side,
            linewidth: this.linewidth
        } );

        this.pickingMaterial = new THREE.RawShaderMaterial( {
            uniforms: this.pickingUniforms,
            vertexShader: "",
            fragmentShader: "",
            depthTest: true,
            transparent: false,
            depthWrite: true,
            lights: false,
            fog: false,
            side: this.side,
            linewidth: this.linewidth
        } );

        this.updateShader();

    },

    makeWireframeGeometry: function(){

        this.makeWireframeIndex();

        var geometry = this.geometry;
        var wireframeIndex = this.wireframeIndex;
        var wireframeGeometry = new THREE.BufferGeometry();

        wireframeGeometry.attributes = geometry.attributes;
        if( wireframeIndex ){
            wireframeGeometry.addIndex(
                new THREE.BufferAttribute( wireframeIndex, 1 )
                    .setDynamic( this.dynamic )
            );
            wireframeGeometry.addGroup( 0, this.wireframeIndexCount );
        }

        this.wireframeGeometry = wireframeGeometry;

    },

    makeWireframeIndex: function(){

        var edges = [];

        function checkEdge( a, b ) {

            if ( a > b ){

                var tmp = a;
                a = b;
                b = tmp;

            }

            var list = edges[ a ];

            if( list === undefined ){

                edges[ a ] = [ b ];
                return true;

            }else if( list.indexOf( b ) === -1 ){

                list.push( b );
                return true;

            }

            return false;

        }

        return function(){

            var index = this.geometry.index;

            if( index ){

                var array = index.array;
                var n = array.length;
                if( this.geometry.groups.length ){
                    n = this.geometry.groups[ 0 ].count;
                }
                var wireframeIndex;
                if( this.wireframeIndex && this.wireframeIndex.length > n * 2 ){
                    wireframeIndex = this.wireframeIndex;
                }else{
                    wireframeIndex = new Uint32Array( n * 2 );
                }

                var j = 0;
                edges.length = 0;

                for( var i = 0; i < n; i += 3 ){

                    var a = array[ i + 0 ];
                    var b = array[ i + 1 ];
                    var c = array[ i + 2 ];

                    if( checkEdge( a, b ) ){
                        wireframeIndex[ j + 0 ] = a;
                        wireframeIndex[ j + 1 ] = b;
                        j += 2;
                    }
                    if( checkEdge( b, c ) ){
                        wireframeIndex[ j + 0 ] = b;
                        wireframeIndex[ j + 1 ] = c;
                        j += 2;
                    }
                    if( checkEdge( c, a ) ){
                        wireframeIndex[ j + 0 ] = c;
                        wireframeIndex[ j + 1 ] = a;
                        j += 2;
                    }

                }

                this.wireframeIndex = wireframeIndex;
                this.wireframeIndexCount = j;

            }

        }

    }(),

    updateWireframeIndex: function(){

        this.wireframeGeometry.clearGroups();
        this.makeWireframeIndex();

        if( this.wireframeIndex.length > this.wireframeGeometry.index.array.length ){

            this.wireframeGeometry.addIndex(
                new THREE.BufferAttribute( this.wireframeIndex, 1 )
                    .setDynamic( this.dynamic )
            );

        }else{

            this.wireframeGeometry.index.set( this.wireframeIndex );
            this.wireframeGeometry.index.needsUpdate = this.wireframeIndexCount > 0;
            this.wireframeGeometry.index.updateRange.count = this.wireframeIndexCount;

        }

        this.wireframeGeometry.addGroup( 0, this.wireframeIndexCount );

    },

    getRenderOrder: function(){

        var renderOrder = 0;

        if( this instanceof NGL.TextBuffer ){

            renderOrder = 1;

        }else if( this.transparent ){

            if( this instanceof NGL.SurfaceBuffer ){
                renderOrder = 3;
            }else{
                renderOrder = 2;
            }

        }

        return renderOrder;

    },

    getMesh: function(){

        var mesh;

        if( !this.material ) this.makeMaterial();

        if( this.line ){

            mesh = new THREE.LineSegments( this.geometry, this.material );

        }else if( this.point ){

            mesh = new THREE.PointCloud( this.geometry, this.material );
            if( this.sort ) mesh.sortParticles = true;

        }else{

            mesh = new THREE.Mesh( this.geometry, this.material );

        }

        mesh.frustumCulled = false;
        mesh.renderOrder = this.getRenderOrder();

        return mesh;

    },

    getWireframeMesh: function(){

        var mesh;

        if( !this.material ) this.makeMaterial();
        if( !this.wireframeGeometry ) this.makeWireframeGeometry();

        mesh = new THREE.LineSegments(
            this.wireframeGeometry, this.wireframeMaterial
        );

        mesh.frustumCulled = false;
        mesh.renderOrder = this.getRenderOrder();

        return mesh;

    },

    getPickingMesh: function(){

        var mesh;

        if( !this.material ) this.makeMaterial();

        mesh = new THREE.Mesh( this.geometry, this.pickingMaterial );

        mesh.frustumCulled = false;
        mesh.renderOrder = this.getRenderOrder();

        return mesh;

    },

    getShader: function( name, type ){

        return NGL.getShader( name, this.getDefines( type ) );

    },

    getVertexShader: function( type ){

        return this.getShader( this.vertexShader, type );

    },

    getFragmentShader: function( type ){

        return this.getShader( this.fragmentShader, type );

    },

    getDefines: function( type ){

        var defines = {};

        if( this.nearClip ){
            defines[ "NEAR_CLIP" ] = 1;
        }

        if( type === "picking" ){

            if( this.side === THREE.DoubleSide ){
                defines[ "DOUBLE_SIDED" ] = 1;
            }else if( this.side === THREE.BackSide ){
                defines[ "FLIP_SIDED" ] = 1;
            }
            defines[ "PICKING" ] = 1;

        }else{

            if( this.side === THREE.DoubleSide ){
                defines[ "DOUBLE_SIDED" ] = 1;
            }else if( this.side === THREE.BackSide ){
                defines[ "FLIP_SIDED" ] = 1;
            }
            if( type === "background" || this.background ){
                defines[ "NOLIGHT" ] = 1;
            }
            if( this.flatShaded ){
                defines[ "FLAT_SHADED" ] = 1;
            }
            if( this.opaqueBack ){
                defines[ "OPAQUE_BACK" ] = 1;
            }
            if( this.dullInterior ){
                defines[ "DULL_INTERIOR" ] = 1;
            }
            defines[ "USE_FOG" ] = 1;

        }

        return defines;

    },

    getParameters: function(){

        var params = {};

        for( var name in this.parameters ){
            params[ name ] = this[ name ];
        }

        return params;

    },

    addUniforms: function( uniforms ){

        this.uniforms = THREE.UniformsUtils.merge(
            [ this.uniforms, uniforms ]
        );

        this.pickingUniforms = THREE.UniformsUtils.merge(
            [ this.pickingUniforms, uniforms ]
        );

    },

    addAttributes: function( attributes ){

        var itemSize = {
            "f": 1, "v2": 2, "v3": 3, "c": 3
        };

        for( var name in attributes ){

            var buf;
            var a = attributes[ name ];

            if( a.value ){

                if( this.attributeSize * itemSize[ a.type ] !== a.value.length ){
                    NGL.error( "attribute value has wrong length", name );
                }

                buf = a.value;

            }else{

                buf = new Float32Array(
                    this.attributeSize * itemSize[ a.type ]
                );

            }

            this.geometry.addAttribute(
                name,
                new THREE.BufferAttribute( buf, itemSize[ a.type ] )
                    .setDynamic( this.dynamic )
            );

        }

    },

    updateRenderOrder: function(){

        var renderOrder = this.getRenderOrder();
        function setRenderOrder( mesh ){
            mesh.renderOrder = renderOrder;
        }

        this.group.children.forEach( setRenderOrder );
        if( this.pickingGroup ){
            this.pickingGroup.children.forEach( setRenderOrder );
        }

    },

    updateShader: function(){

        var m = this.material;
        var wm = this.wireframeMaterial;
        var pm = this.pickingMaterial;

        m.vertexShader = this.getVertexShader();
        m.fragmentShader = this.getFragmentShader();
        m.needsUpdate = true;

        wm.vertexShader = this.getShader( "Line.vert" );
        wm.fragmentShader = this.getShader( "Line.frag" );
        wm.needsUpdate = true;

        pm.vertexShader = this.getVertexShader( "picking" );
        pm.fragmentShader = this.getFragmentShader( "picking" );
        pm.needsUpdate = true;

    },

    setParameters: function( params ){

        if( !params ) return;

        var p = params;
        var tp = this.parameters;

        var propertyData = {};
        var uniformData = {};
        var doShaderUpdate = false;
        var doVisibilityUpdate = false;

        for( var name in p ){

            if( p[ name ] === undefined ) continue;
            if( tp[ name ] === undefined ) continue;

            this[ name ] = p[ name ];

            if( tp[ name ].property ){
                if( tp[ name ].property !== true ){
                    propertyData[ tp[ name ].property ] = p[ name ];
                }else{
                    propertyData[ name ] = p[ name ];
                }
            }

            if( tp[ name ].uniform ){
                uniformData[ name ] = p[ name ];
            }

            if( tp[ name ].updateShader ){
                doShaderUpdate = true;
            }

            if( tp[ name ].updateVisibility ){
                doVisibilityUpdate = true;
            }

            if( this.dynamic && name === "wireframe" && p[ name ] === true ){
                this.updateWireframeIndex();
            }

        }

        this.setProperties( propertyData );
        this.setUniforms( uniformData );
        if( doShaderUpdate ) this.updateShader();
        if( doVisibilityUpdate ) this.setVisibility( this.visible );

    },

    setAttributes: function( data ){

        /**
         * Sets buffer attributes
         * @param {Object} data - An object where the keys are the attribute names
         *      and the values are the attribute data.
         * @example
         * var buffer = new NGL.Buffer();
         * buffer.setAttributes({ attrName: attrData });
         */

        var geometry = this.geometry;
        var attributes = geometry.attributes;

        for( var name in data ){

            var array = data[ name ];
            var length = array.length;

            if( name === "index" ){

                geometry.clearGroups();

                if( length > geometry.index.array.length ){

                    geometry.addIndex(
                        new THREE.BufferAttribute( array, 1 )
                            .setDynamic( this.dynamic )
                    );

                }else{

                    geometry.index.set( array );
                    geometry.index.needsUpdate = length > 0;
                    geometry.index.updateRange.count = length;
                    geometry.addGroup( 0, length );

                }

                if( this.wireframe ) this.updateWireframeIndex();

            }else{

                var attribute = attributes[ name ];

                if( length > attribute.array.length ){

                    geometry.addAttribute(
                        name,
                        new THREE.BufferAttribute( array, attribute.itemSize )
                            .setDynamic( this.dynamic )
                    );

                }else{

                    attributes[ name ].set( array );
                    attributes[ name ].needsUpdate = length > 0;
                    attributes[ name ].updateRange.count = length;

                }

            }

        }

    },

    setUniforms: function( data ){

        if( !data ) return;

        var u = this.material.uniforms;
        var wu = this.wireframeMaterial.uniforms;
        var pu = this.pickingMaterial.uniforms;

        for( var name in data ){

            if( name === "opacity" ){
                this.setProperties( { transparent: data[ name ] < 1 } );
            }

            if( u[ name ] !== undefined ){
                u[ name ].value = data[ name ];
            }

            if( wu[ name ] !== undefined ){
                wu[ name ].value = data[ name ];
            }

            if( pu[ name ] !== undefined ){
                pu[ name ].value = data[ name ];
            }

        }

    },

    setProperties: function( data ){

        if( !data ) return;

        var m = this.material;
        var wm = this.wireframeMaterial;
        var pm = this.pickingMaterial;

        for( var name in data ){

            if( name === "transparent" ){
                this.updateRenderOrder();
            }

            if( m[ name ] !== undefined ){
                m[ name ] = data[ name ];
            }

            if( wm[ name ] !== undefined ){
                wm[ name ] = data[ name ];
            }

            if( pm[ name ] !== undefined ){
                pm[ name ] = data[ name ];
            }

        }

        m.needsUpdate = true;
        wm.needsUpdate = true;
        pm.needsUpdate = true;

    },

    setVisibility: function( value ){

        this.visible = value;

        if( this.wireframe ){

            this.group.visible = false;
            this.wireframeGroup.visible = value;
            if( this.pickable ){
                this.pickingGroup.visible = false;
            }

        }else{

            this.group.visible = value;
            this.wireframeGroup.visible = false;
            if( this.pickable ){
                this.pickingGroup.visible = value;
            }

        }

    },

    dispose: function(){

        if( this.material ) this.material.dispose();
        if( this.wireframeMaterial ) this.wireframeMaterial.dispose();
        if( this.pickingMaterial ) this.pickingMaterial.dispose();

        this.geometry.dispose();
        if( this.wireframeGeometry ) this.wireframeGeometry.dispose();

    }

};


NGL.MeshBuffer = function( position, color, index, normal, pickingColor, params ){

    var p = params || {};

    this.size = position ? position.length / 3 : 0;
    this.attributeSize = this.size;
    this.vertexShader = 'Mesh.vert';
    this.fragmentShader = 'Mesh.frag';

    NGL.Buffer.call( this, position, color, index, pickingColor, p );

    this.addAttributes( {
        "normal": { type: "v3", value: normal },
    } );

    if( normal === undefined ){
        this.geometry.computeVertexNormals();
    }

};

NGL.MeshBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.MeshBuffer.prototype.constructor = NGL.MeshBuffer;


NGL.MappedBuffer = function( params ){

    // required
    // - mapping
    // - mappingType
    // - mappingSize
    // - mappingItemSize
    // - mappingIndices
    // - mappingIndicesSize

    this.size = this.count;
    this.attributeSize = this.count * this.mappingSize;

    this.index = new Uint32Array( this.count * this.mappingIndicesSize );

    this.makeIndex();

    NGL.Buffer.call( this, null, null, this.index, null, params );

    this.addAttributes( {
        "mapping": { type: this.mappingType, value: null },
    } );

};

NGL.MappedBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.MappedBuffer.prototype.constructor = NGL.MappedBuffer;

NGL.MappedBuffer.prototype.setAttributes = function( data ){

    var count = this.count;
    var mappingSize = this.mappingSize;
    var attributes = this.geometry.attributes;

    var a, d, itemSize, array, n, i, j;

    for( var name in data ){

        d = data[ name ];
        a = attributes[ name ];
        itemSize = a.itemSize;
        array = a.array;

        for( var k = 0; k < count; ++k ) {

            n = k * itemSize;
            i = n * mappingSize;

            for( var l = 0; l < mappingSize; ++l ) {

                j = i + ( itemSize * l );

                for( var m = 0; m < itemSize; ++m ) {

                    array[ j + m ] = d[ n + m ];

                }

            }

        }

        a.needsUpdate = true;

    }

};

NGL.MappedBuffer.prototype.makeMapping = function(){

    var count = this.count;
    var mapping = this.mapping;
    var mappingSize = this.mappingSize;
    var mappingItemSize = this.mappingItemSize;

    var aMapping = this.geometry.attributes[ "mapping" ].array;

    for( var v = 0; v < count; v++ ) {

        aMapping.set( mapping, v * mappingItemSize * mappingSize );

    }

};

NGL.MappedBuffer.prototype.makeIndex = function(){

    var count = this.count;
    var mappingSize = this.mappingSize;
    var mappingIndices = this.mappingIndices;
    var mappingIndicesSize = this.mappingIndicesSize;
    var mappingItemSize = this.mappingItemSize;

    var index = this.index;

    var i, ix, it;

    for( var v = 0; v < count; v++ ) {

        i = v * mappingItemSize * mappingSize;
        ix = v * mappingIndicesSize;
        it = v * mappingSize;

        index.set( mappingIndices, ix );

        for( var s = 0; s < mappingIndicesSize; ++s ){
            index[ ix + s ] += it;
        }

    }

};


NGL.QuadBuffer = function( params ){

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

    NGL.MappedBuffer.call( this, params );

};

NGL.QuadBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );

NGL.QuadBuffer.prototype.constructor = NGL.QuadBuffer;


NGL.BoxBuffer = function( params ){

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

    NGL.MappedBuffer.call( this, params );

};

NGL.BoxBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );

NGL.BoxBuffer.prototype.constructor = NGL.BoxBuffer;


NGL.AlignedBoxBuffer = function( params ){

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

    NGL.MappedBuffer.call( this, params );

};

NGL.AlignedBoxBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );

NGL.AlignedBoxBuffer.prototype.constructor = NGL.AlignedBoxBuffer;


////////////////////////
// Impostor Primitives

NGL.SphereImpostorBuffer = function( position, color, radius, pickingColor, params ){

    this.count = position.length / 3;
    this.vertexShader = 'SphereImpostor.vert';
    this.fragmentShader = 'SphereImpostor.frag';

    NGL.QuadBuffer.call( this, params );

    this.addUniforms( {
        'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
    } );

    this.addAttributes( {
        "radius": { type: "f", value: null },
    } );

    this.setAttributes( {
        "position": position,
        "color": color,
        "radius": radius,
    } );

    if( pickingColor ){

        this.addAttributes( {
            "pickingColor": { type: "c", value: null },
        } );

        this.setAttributes( {
            "pickingColor": pickingColor,
        } );

        this.pickable = true;

    }

    this.makeMapping();

};

NGL.SphereImpostorBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );

NGL.SphereImpostorBuffer.prototype.constructor = NGL.SphereImpostorBuffer;


NGL.CylinderImpostorBuffer = function( from, to, color, color2, radius, pickingColor, pickingColor2, params ){

    var p = params || p;

    // Moves the cylinder in camera space to get, for example,
    // one of multiple shifted screen-aligned cylinders.
    this.shift = p.shift !== undefined ? p.shift : 0;

    this.cap = p.cap !== undefined ? p.cap : true;

    this.count = from.length / 3;
    this.vertexShader = 'CylinderImpostor.vert';
    this.fragmentShader = 'CylinderImpostor.frag';

    NGL.AlignedBoxBuffer.call( this, p );

    this.addUniforms( {
        'modelViewMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'shift': { type: "f", value: this.shift },
    } );

    this.addAttributes( {
        "position1": { type: "v3", value: null },
        "position2": { type: "v3", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
    } );

    this.setAttributes( {
        "position": NGL.Utils.calculateCenterArray( from, to ),

        "position1": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius,
    } );

    if( pickingColor ){

        this.addAttributes( {
            "pickingColor": { type: "c", value: null },
            "pickingColor2": { type: "c", value: null },
        } );

        this.setAttributes( {
            "pickingColor": pickingColor,
            "pickingColor2": pickingColor2,
        } );

        this.pickable = true;

    }

    this.makeMapping();

    // FIXME
    // if( this.cap ){
    //     this.material.defines[ "CAP" ] = 1;
    // }

};

NGL.CylinderImpostorBuffer.prototype = Object.create( NGL.AlignedBoxBuffer.prototype );

NGL.CylinderImpostorBuffer.prototype.constructor = NGL.CylinderImpostorBuffer;

NGL.CylinderImpostorBuffer.prototype.getMaterial = function( type ){

    var material = NGL.Buffer.prototype.getMaterial.call( this, type );

    if( this.cap ){
        material.defines[ "CAP" ] = 1;
    }

    return material;

}


NGL.HyperballStickImpostorBuffer = function( position1, position2, color, color2, radius1, radius2, pickingColor, pickingColor2, params ){

    var p = params || p;

    var shrink = p.shrink !== undefined ? p.shrink : 0.14;

    this.count = position1.length / 3;
    this.vertexShader = 'HyperballStickImpostor.vert';
    this.fragmentShader = 'HyperballStickImpostor.frag';

    NGL.BoxBuffer.call( this, p );

    this.addUniforms( {
        'modelViewProjectionMatrix': { type: "m4", value: new THREE.Matrix4() },
        'modelViewProjectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'modelViewMatrixInverseTranspose': { type: "m4", value: new THREE.Matrix4() },
        'shrink': { type: "f", value: shrink },
    } );

    this.addAttributes( {
        "color": { type: "c", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
        "radius2": { type: "f", value: null },
        "position1": { type: "v3", value: null },
        "position2": { type: "v3", value: null },
    } );

    this.setAttributes( {
        "color": color,
        "color2": color2,
        "radius": radius1,
        "radius2": radius2,
        "position1": position1,
        "position2": position2,

        "position": NGL.Utils.calculateCenterArray( position1, position2 ),
    } );

    if( pickingColor ){

        this.addAttributes( {
            "pickingColor": { type: "c", value: null },
            "pickingColor2": { type: "c", value: null },
        } );

        this.setAttributes( {
            "pickingColor": pickingColor,
            "pickingColor2": pickingColor2,
        } );

        this.pickable = true;

    }

    this.makeMapping();

};

NGL.HyperballStickImpostorBuffer.prototype = Object.create( NGL.BoxBuffer.prototype );

NGL.HyperballStickImpostorBuffer.prototype.constructor = NGL.HyperballStickImpostorBuffer;

NGL.HyperballStickImpostorBuffer.prototype.parameters = Object.assign( {

    shrink: { uniform: true }

}, NGL.BoxBuffer.prototype.parameters );


////////////////////////
// Geometry Primitives

NGL.GeometryBuffer = function( position, color, pickingColor, params ){

    var p = params || {};

    // required properties:
    // - geo

    var geo = this.geo;

    var n = position.length / 3;
    var m = geo.vertices.length;
    var o = geo.faces.length;

    this.size = n * m;
    this.positionCount = n;

    this.geoPosition = NGL.Utils.positionFromGeometry( geo );
    this.geoNormal = NGL.Utils.normalFromGeometry( geo );
    this.geoIndex = NGL.Utils.indexFromGeometry( geo );

    this.transformedGeoPosition = new Float32Array( m * 3 );
    this.transformedGeoNormal = new Float32Array( m * 3 );

    this.meshPosition = new Float32Array( this.size * 3 );
    this.meshNormal = new Float32Array( this.size * 3 );
    this.meshIndex = new Uint32Array( n * o * 3 );
    this.meshColor = new Float32Array( this.size * 3 );
    this.meshPickingColor = new Float32Array( this.size * 3 );

    this.makeIndex();

    NGL.MeshBuffer.call(
        this, this.meshPosition, this.meshColor, this.meshIndex,
        this.meshNormal, this.meshPickingColor, p
    );

    this.initNormals = true;

    this.setAttributes( {
        position: position,
        color: color,
        pickingColor: pickingColor
    } );

    this.initNormals = false;

};

NGL.GeometryBuffer.prototype = Object.create( NGL.MeshBuffer.prototype );

NGL.GeometryBuffer.prototype.constructor = NGL.GeometryBuffer;

NGL.GeometryBuffer.prototype.applyPositionTransform = function(){};

NGL.GeometryBuffer.prototype.setAttributes = function(){

    var matrix = new THREE.Matrix4();
    var normalMatrix = new THREE.Matrix3();

    return function( data ){

        var attributes = this.geometry.attributes;

        var position, color, pickingColor;
        var geoPosition, geoNormal;
        var transformedGeoPosition, transformedGeoNormal;
        var meshPosition, meshColor, meshPickingColor, meshNormal;

        if( data[ "position" ] ){
            position = data[ "position" ];
            geoPosition = this.geoPosition;
            meshPosition = this.meshPosition;
            transformedGeoPosition = this.transformedGeoPosition;
            attributes[ "position" ].needsUpdate = true;
        }

        if( data[ "color" ] ){
            color = data[ "color" ];
            meshColor = this.meshColor;
            attributes[ "color" ].needsUpdate = true;
        }

        if( data[ "pickingColor" ] ){
            pickingColor = data[ "pickingColor" ];
            meshPickingColor = this.meshPickingColor;
            attributes[ "pickingColor" ].needsUpdate = true;
        }

        var updateNormals = !!( this.updateNormals && position );
        var initNormals = !!( this.initNormals && position );

        if( updateNormals || initNormals ){
            geoNormal = this.geoNormal;
            meshNormal = this.meshNormal;
            transformedGeoNormal = this.transformedGeoNormal;
            attributes[ "normal" ].needsUpdate = true;
        }

        var n = this.positionCount;
        var m = this.geo.vertices.length;

        var i, j, k, l, i3;

        for( i = 0; i < n; ++i ){

            k = i * m * 3;
            i3 = i * 3;

            if( position ){

                transformedGeoPosition.set( geoPosition );
                matrix.makeTranslation(
                    position[ i3 ], position[ i3 + 1 ], position[ i3 + 2 ]
                );
                this.applyPositionTransform( matrix, i, i3 );
                matrix.applyToVector3Array( transformedGeoPosition );

                meshPosition.set( transformedGeoPosition, k );

            }

            if( updateNormals ){

                transformedGeoNormal.set( geoNormal );
                normalMatrix.getNormalMatrix( matrix );
                normalMatrix.applyToVector3Array( transformedGeoNormal );

                meshNormal.set( transformedGeoNormal, k );

            }else if( initNormals ){

                meshNormal.set( geoNormal, k );

            }

            if( color ){

                for( j = 0; j < m; ++j ){

                    l = k + 3 * j;

                    meshColor[ l     ] = color[ i3     ];
                    meshColor[ l + 1 ] = color[ i3 + 1 ];
                    meshColor[ l + 2 ] = color[ i3 + 2 ];

                }

            }

            if( pickingColor ){

                for( j = 0; j < m; ++j ){

                    l = k + 3 * j;

                    meshPickingColor[ l     ] = pickingColor[ i3     ];
                    meshPickingColor[ l + 1 ] = pickingColor[ i3 + 1 ];
                    meshPickingColor[ l + 2 ] = pickingColor[ i3 + 2 ];

                }

            }

        }

    }

}();

NGL.GeometryBuffer.prototype.makeIndex = function(){

    var geoIndex = this.geoIndex;
    var meshIndex = this.meshIndex;

    var n = this.positionCount;
    var m = this.geo.vertices.length;
    var o = this.geo.faces.length;

    var p, i, j, q;
    var o3 = o * 3;

    for( i = 0; i < n; ++i ){

        j = i * o3;
        q = j + o3;

        meshIndex.set( geoIndex, j );
        for( p = j; p < q; ++p ) meshIndex[ p ] += i * m;

    }

};


NGL.SphereGeometryBuffer = function( position, color, radius, pickingColor, params ){

    var detail = params.sphereDetail !== undefined ? params.sphereDetail : 1;

    this.geo = new THREE.IcosahedronGeometry( 1, detail );

    this.setPositionTransform( radius );

    NGL.GeometryBuffer.call( this, position, color, pickingColor, params );

};

NGL.SphereGeometryBuffer.prototype = Object.create( NGL.GeometryBuffer.prototype );

NGL.SphereGeometryBuffer.prototype.constructor = NGL.SphereGeometryBuffer;

NGL.SphereGeometryBuffer.prototype.setPositionTransform = function( radius ){

    var r;
    var scale = new THREE.Vector3();

    this.applyPositionTransform = function( matrix, i ){

        r = radius[ i ];
        scale.set( r, r, r );
        matrix.scale( scale );

    }

};

NGL.SphereGeometryBuffer.prototype.setAttributes = function( data ){

    if( data[ "radius" ] ){
        this.setPositionTransform( data[ "radius" ] );
    }

    NGL.GeometryBuffer.prototype.setAttributes.call( this, data );

}


NGL.CylinderGeometryBuffer = function( from, to, color, color2, radius, pickingColor, pickingColor2, params ){

    var radiusSegments = params.radiusSegments !== undefined ? params.radiusSegments : 10;

    this.updateNormals = true;

    var matrix = new THREE.Matrix4().makeRotationX( Math.PI/ 2  );

    // FIXME params.cap
    this.geo = new THREE.CylinderGeometry( 1, 1, 1, radiusSegments, 1, true );
    this.geo.applyMatrix( matrix );

    var n = from.length;
    var m = radius.length;

    this._position = new Float32Array( n * 2 );
    this._color = new Float32Array( n * 2 );
    this._pickingColor = new Float32Array( n * 2 );
    this._from = new Float32Array( n * 2 );
    this._to = new Float32Array( n * 2 );
    this._radius = new Float32Array( m * 2 );

    this.__center = new Float32Array( n );

    NGL.GeometryBuffer.call(
        this, this._position, this._color, this._pickingColor, params
    );

    this.setPositionTransform( this._from, this._to, this._radius );

    this.setAttributes( {
        "position1": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius,
        "pickingColor": pickingColor,
        "pickingColor2": pickingColor2
    } );

};

NGL.CylinderGeometryBuffer.prototype = Object.create( NGL.GeometryBuffer.prototype );

NGL.CylinderImpostorBuffer.prototype.constructor = NGL.CylinderImpostorBuffer;

NGL.CylinderGeometryBuffer.prototype.setPositionTransform = function( from, to, radius ){

    var r;
    var scale = new THREE.Vector3();
    var eye = new THREE.Vector3();
    var target = new THREE.Vector3();
    var up = new THREE.Vector3( 0, 1, 0 );

    this.applyPositionTransform = function( matrix, i, i3 ){

        eye.fromArray( from, i3 );
        target.fromArray( to, i3 );
        matrix.lookAt( eye, target, up );

        r = radius[ i ];
        scale.set( r, r, eye.distanceTo( target ) );
        matrix.scale( scale );

    }

};

NGL.CylinderGeometryBuffer.prototype.setAttributes = function( data ){

    var n = this._position.length / 2;
    var m = this._radius.length / 2;
    var geoData = {};

    if( data[ "position1" ] && data[ "position2" ] ){

        NGL.Utils.calculateCenterArray(
            data[ "position1" ], data[ "position2" ], this.__center
        );
        NGL.Utils.calculateCenterArray(
            data[ "position1" ], this.__center, this._position
        );
        NGL.Utils.calculateCenterArray(
            this.__center, data[ "position2" ], this._position, n
        );

        this._from.set( data[ "position1" ] );
        this._from.set( this.__center, n );

        this._to.set( this.__center );
        this._to.set( data[ "position2" ], n );

        geoData[ "position" ] = this._position;

    }

    if( data[ "color" ] && data[ "color2" ] ){

        this._color.set( data[ "color" ] );
        this._color.set( data[ "color2" ], n );

        geoData[ "color" ] = this._color;

    }

    if( data[ "pickingColor" ] && data[ "pickingColor2" ] ){

        this._pickingColor.set( data[ "pickingColor" ] );
        this._pickingColor.set( data[ "pickingColor2" ], n );

        geoData[ "pickingColor" ] = this._pickingColor;

    }

    if( data[ "radius" ] ){

        this._radius.set( data[ "radius" ] );
        this._radius.set( data[ "radius" ], m );

    }

    if( ( data[ "position1" ] && data[ "position2" ] ) || data[ "radius" ] ){

        this.setPositionTransform( this._from, this._to, this._radius );

    }

    NGL.GeometryBuffer.prototype.setAttributes.call( this, geoData );

}


//////////////////////
// Pixel Primitives

NGL.PointBuffer = function( position, color, params ){

    var p = params || {};

    this.point = true;
    this.pointSize = p.pointSize !== undefined ? p.pointSize : 1;
    this.sizeAttenuation = p.sizeAttenuation !== undefined ? p.sizeAttenuation : true;
    this.sort = p.sort !== undefined ? p.sort : false;

    this.size = position.length / 3;
    this.attributeSize = this.size;
    // this.vertexShader = 'Point.vert';
    // this.fragmentShader = 'Point.frag';

    this.tex = new THREE.Texture(
        NGL.Resources[ '../img/radial.png' ]
        // NGL.Resources[ '../img/spark1.png' ]
        // NGL.Resources[ '../img/circle.png' ]
    );
    this.tex.needsUpdate = true;
    if( !this.sort ) this.tex.premultiplyAlpha = true;

    NGL.Buffer.call( this, position, color, undefined, undefined, p );

};

NGL.PointBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.PointBuffer.prototype.constructor = NGL.PointBuffer;

NGL.PointBuffer.prototype.parameters = Object.assign( {

    pointSize: { property: "size" },
    sizeAttenuation: { property: true },
    sort: {}

}, NGL.Buffer.prototype.parameters, {

    opacity: { property: true },

} );

NGL.PointBuffer.prototype.makeMaterial = function(){

    var material;

    if( this.sort ){

        material = new THREE.PointCloudMaterial({
            map: this.tex,
            blending: THREE.NormalBlending,
            // blending: THREE.AdditiveBlending,
            depthTest:      true,
            transparent:    true,

            vertexColors: true,
            size: this.pointSize,
            sizeAttenuation: this.sizeAttenuation,
            // transparent: this.transparent,
            opacity: this.opacity,
            fog: true
        });

    }else{

        material = new THREE.PointCloudMaterial({
            map: this.tex,
            // blending:       THREE.AdditiveBlending,
            depthTest:      false,
            // alphaTest:      0.001,
            transparent:    true,

            blending: THREE.CustomBlending,
            // blendSrc: THREE.SrcAlphaFactor,
            // blendDst: THREE.OneMinusSrcAlphaFactor,
            blendEquation: THREE.AddEquation,

            // requires premultiplied alpha
            blendSrc: THREE.OneFactor,
            blendDst: THREE.OneMinusSrcAlphaFactor,

            vertexColors: true,
            size: this.pointSize,
            sizeAttenuation: this.sizeAttenuation,
            // transparent: this.transparent,
            opacity: this.opacity,
            fog: true
        });

    }

    this.material = material;
    this.wireframeMaterial = material;
    this.pickingMaterial = material;

};

NGL.PointBuffer.prototype.dispose = function(){

    NGL.Buffer.prototype.dispose.call( this );

    this.tex.dispose();

};


NGL.LineBuffer = function( from, to, color, color2, params ){

    var p = params || {};

    this.size = from.length / 3;
    this.vertexShader = 'Line.vert';
    this.fragmentShader = 'Line.frag';
    this.line = true;

    var n = this.size;
    var n6 = n * 6;
    var nX = n * 2 * 2;

    this.attributeSize = nX;

    this.linePosition = new Float32Array( nX * 3 );
    this.lineColor = new Float32Array( nX * 3 );

    NGL.Buffer.call(
        this, this.linePosition, this.lineColor, undefined, undefined, p
    );

    this.setAttributes( {
        from: from,
        to: to,
        color: color,
        color2: color2
    } );

};

NGL.LineBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.LineBuffer.prototype.constructor = NGL.LineBuffer;

NGL.LineBuffer.prototype.setAttributes = function( data ){

    var from, to, color, color2;
    var aPosition, aColor;

    var attributes = this.geometry.attributes;

    if( data[ "from" ] && data[ "to" ] ){
        from = data[ "from" ];
        to = data[ "to" ];
        aPosition = attributes[ "position" ].array;
        attributes[ "position" ].needsUpdate = true;
    }

    if( data[ "color" ] && data[ "color2" ] ){
        color = data[ "color" ];
        color2 = data[ "color2" ];
        aColor = attributes[ "color" ].array;
        attributes[ "color" ].needsUpdate = true;
    }

    var n = this.size;
    var n6 = n * 6;

    var i, j, i2;
    var x, y, z, x1, y1, z1, x2, y2, z2;

    for( var v = 0; v < n; v++ ){

        j = v * 3;
        i = v * 2 * 3;
        i2 = i + n6;

        if( from && to ){

            x1 = from[ j     ];
            y1 = from[ j + 1 ];
            z1 = from[ j + 2 ];

            x2 = to[ j     ];
            y2 = to[ j + 1 ];
            z2 = to[ j + 2 ];

            x = ( x1 + x2 ) / 2.0;
            y = ( y1 + y2 ) / 2.0;
            z = ( z1 + z2 ) / 2.0;

            aPosition[ i     ] = x1;
            aPosition[ i + 1 ] = y1;
            aPosition[ i + 2 ] = z1;
            aPosition[ i + 3 ] = x;
            aPosition[ i + 4 ] = y;
            aPosition[ i + 5 ] = z;

            aPosition[ i2     ] = x;
            aPosition[ i2 + 1 ] = y;
            aPosition[ i2 + 2 ] = z;
            aPosition[ i2 + 3 ] = x2;
            aPosition[ i2 + 4 ] = y2;
            aPosition[ i2 + 5 ] = z2;

        }

        if( color && color2 ){

            aColor[ i     ] = aColor[ i + 3 ] = color[ j     ];
            aColor[ i + 1 ] = aColor[ i + 4 ] = color[ j + 1 ];
            aColor[ i + 2 ] = aColor[ i + 5 ] = color[ j + 2 ];

            aColor[ i2     ] = aColor[ i2 + 3 ] = color2[ j     ];
            aColor[ i2 + 1 ] = aColor[ i2 + 4 ] = color2[ j + 1 ];
            aColor[ i2 + 2 ] = aColor[ i2 + 5 ] = color2[ j + 2 ];

        }

    }

};


NGL.TraceBuffer = function( position, color, params ){

    var p = params || {};

    this.size = position.length / 3;
    this.vertexShader = 'Line.vert';
    this.fragmentShader = 'Line.frag';
    this.line = true;

    var n = this.size;
    var n1 = n - 1;

    this.attributeSize = n1 * 2;

    this.linePosition = new Float32Array( n1 * 3 * 2 );
    this.lineColor = new Float32Array( n1 * 3 * 2 );

    NGL.Buffer.call(
        this, this.linePosition, this.lineColor, undefined, undefined, p
    );

    this.setAttributes( {
        position: position,
        color: color
    } );

};

NGL.TraceBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.TraceBuffer.prototype.constructor = NGL.TraceBuffer;

NGL.TraceBuffer.prototype.setAttributes = function( data ){

    var position, color;
    var linePosition, lineColor;

    var attributes = this.geometry.attributes;

    if( data[ "position" ] ){
        position = data[ "position" ];
        linePosition = attributes[ "position" ].array;
        attributes[ "position" ].needsUpdate = true;
    }

    if( data[ "color" ] ){
        color = data[ "color" ];
        lineColor = attributes[ "color" ].array;
        attributes[ "color" ].needsUpdate = true;
    }

    if( !position && !color ){
        NGL.warn( "NGL.TraceBuffer.prototype.setAttributes no data" );
        return;
    }

    var v, v2;
    var n = this.size;
    var n1 = n - 1;

    for( var i = 0; i < n1; ++i ){

        v = 3 * i;
        v2 = 3 * i * 2;

        if( position ){

            linePosition[ v2     ] = position[ v     ];
            linePosition[ v2 + 1 ] = position[ v + 1 ];
            linePosition[ v2 + 2 ] = position[ v + 2 ];

            linePosition[ v2 + 3 ] = position[ v + 3 ];
            linePosition[ v2 + 4 ] = position[ v + 4 ];
            linePosition[ v2 + 5 ] = position[ v + 5 ];

        }

        if( color ){

            lineColor[ v2     ] = color[ v     ];
            lineColor[ v2 + 1 ] = color[ v + 1 ];
            lineColor[ v2 + 2 ] = color[ v + 2 ];

            lineColor[ v2 + 3 ] = color[ v + 3 ];
            lineColor[ v2 + 4 ] = color[ v + 4 ];
            lineColor[ v2 + 5 ] = color[ v + 5 ];

        }

    }

};


//////////////////////
// Sprite Primitives

NGL.ParticleSpriteBuffer = function( position, color, radius ){

    this.count = position.length / 3;
    this.vertexShader = 'ParticleSprite.vert';
    this.fragmentShader = 'ParticleSprite.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
    });

    this.addAttributes( {
        "radius": { type: "f", value: null },
    } );

    this.setAttributes( {
        "position": position,
        "color": color,
        "radius": radius,
    } );

    this.material.lights = false;

};

NGL.ParticleSpriteBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );

NGL.ParticleSpriteBuffer.prototype.constructor = NGL.ParticleSpriteBuffer;


NGL.RibbonBuffer = function( position, normal, dir, color, size, pickingColor, params ){

    var p = params || {};

    var n = ( position.length / 3 ) - 1;
    var n4 = n * 4;
    var x = n4 * 3;

    this.meshPosition = new Float32Array( x );
    this.meshColor = new Float32Array( x );
    this.meshNormal = new Float32Array( x );
    this.meshPickingColor = pickingColor ? new Float32Array( x ) : undefined;
    this.meshIndex = new Uint32Array( x );

    this.makeIndex();

    NGL.MeshBuffer.call(
        this, this.meshPosition, this.meshColor, this.meshIndex,
        this.meshNormal, this.meshPickingColor, p
    );

    this.vertexShader = 'Ribbon.vert';
    this.fragmentShader = 'Ribbon.frag';

    this.geometry.addAttribute(
        'dir', new THREE.BufferAttribute( new Float32Array( x ), 3 )
    );
    this.geometry.addAttribute(
        'size', new THREE.BufferAttribute( new Float32Array( n4 ), 1 )
    );

    this.setAttributes( {
        position: position,
        normal: normal,
        dir: dir,
        color: color,
        size: size,
        pickingColor: pickingColor
    } );

};

NGL.RibbonBuffer.prototype = Object.create( NGL.MeshBuffer.prototype );

NGL.RibbonBuffer.prototype.constructor = NGL.RibbonBuffer;

NGL.RibbonBuffer.prototype.setAttributes = function( data ){

    var n4 = this.size;
    var n = n4 / 4;

    var attributes = this.geometry.attributes;

    var position, normal, size, dir, color, pickingColor;
    var aPosition, aNormal, aSize, aDir, aColor, aPickingColor;

    if( data[ "position" ] ){
        position = data[ "position" ];
        aPosition = attributes[ "position" ].array;
        attributes[ "position" ].needsUpdate = true;
    }

    if( data[ "normal" ] ){
        normal = data[ "normal" ];
        aNormal = attributes[ "normal" ].array;
        attributes[ "normal" ].needsUpdate = true;
    }

    if( data[ "size" ] ){
        size = data[ "size" ];
        aSize = attributes[ "size" ].array;
        attributes[ "size" ].needsUpdate = true;
    }

    if( data[ "dir" ] ){
        dir = data[ "dir" ];
        aDir = attributes[ "dir" ].array;
        attributes[ "dir" ].needsUpdate = true;
    }

    if( data[ "color" ] ){
        color = data[ "color" ];
        aColor = attributes[ "color" ].array;
        attributes[ "color" ].needsUpdate = true;
    }

    if( data[ "pickingColor" ] ){
        pickingColor = data[ "pickingColor" ];
        aPickingColor = attributes[ "pickingColor" ].array;
        attributes[ "pickingColor" ].needsUpdate = true;
    }

    var v, i, k, p, l, v3;
    var currSize;
    var prevSize = size ? size[ 0 ] : null;

    for( v = 0; v < n; ++v ){

        v3 = v * 3;
        k = v * 3 * 4;
        l = v * 4;

        if( position ){

            aPosition[ k     ] = aPosition[ k + 3 ] = position[ v3     ];
            aPosition[ k + 1 ] = aPosition[ k + 4 ] = position[ v3 + 1 ];
            aPosition[ k + 2 ] = aPosition[ k + 5 ] = position[ v3 + 2 ];

            aPosition[ k + 6 ] = aPosition[ k +  9 ] = position[ v3 + 3 ];
            aPosition[ k + 7 ] = aPosition[ k + 10 ] = position[ v3 + 4 ];
            aPosition[ k + 8 ] = aPosition[ k + 11 ] = position[ v3 + 5 ];

        }

        if( normal ){

            aNormal[ k     ] = aNormal[ k + 3 ] = -normal[ v3     ];
            aNormal[ k + 1 ] = aNormal[ k + 4 ] = -normal[ v3 + 1 ];
            aNormal[ k + 2 ] = aNormal[ k + 5 ] = -normal[ v3 + 2 ];

            aNormal[ k + 6 ] = aNormal[ k +  9 ] = -normal[ v3 + 3 ];
            aNormal[ k + 7 ] = aNormal[ k + 10 ] = -normal[ v3 + 4 ];
            aNormal[ k + 8 ] = aNormal[ k + 11 ] = -normal[ v3 + 5 ];

        }


        for( i = 0; i<4; ++i ){

            p = k + 3 * i;

            if( color ){

                aColor[ p     ] = color[ v3     ];
                aColor[ p + 1 ] = color[ v3 + 1 ];
                aColor[ p + 2 ] = color[ v3 + 2 ];

            }

            if( pickingColor ){

                aPickingColor[ p     ] = pickingColor[ v3     ];
                aPickingColor[ p + 1 ] = pickingColor[ v3 + 1 ];
                aPickingColor[ p + 2 ] = pickingColor[ v3 + 2 ];

            }

        }

        if( size ){

            currSize = size[ v ];

            if( prevSize !== size[ v ] ){

                aSize[ l     ] = prevSize;
                aSize[ l + 1 ] = prevSize;
                aSize[ l + 2 ] = currSize;
                aSize[ l + 3 ] = currSize;

            }else{

                aSize[ l     ] = currSize;
                aSize[ l + 1 ] = currSize;
                aSize[ l + 2 ] = currSize;
                aSize[ l + 3 ] = currSize;

            }

            prevSize = currSize;

        }

        if( dir ){

            aDir[ k     ] = dir[ v3     ];
            aDir[ k + 1 ] = dir[ v3 + 1 ];
            aDir[ k + 2 ] = dir[ v3 + 2 ];

            aDir[ k + 3 ] = -dir[ v3     ];
            aDir[ k + 4 ] = -dir[ v3 + 1 ];
            aDir[ k + 5 ] = -dir[ v3 + 2 ];

            aDir[ k + 6 ] = dir[ v3 + 3 ];
            aDir[ k + 7 ] = dir[ v3 + 4 ];
            aDir[ k + 8 ] = dir[ v3 + 5 ];

            aDir[ k +  9 ] = -dir[ v3 + 3 ];
            aDir[ k + 10 ] = -dir[ v3 + 4 ];
            aDir[ k + 11 ] = -dir[ v3 + 5 ];

        }

    }

};

NGL.RibbonBuffer.prototype.makeIndex = function(){

    var meshIndex = this.meshIndex;
    var n = meshIndex.length / 4 / 3;

    var quadIndices = new Uint32Array([
        0, 1, 2,
        1, 3, 2
    ]);

    var s, v, ix, it;

    for( v = 0; v < n; ++v ){

        ix = v * 6;
        it = v * 4;

        meshIndex.set( quadIndices, ix );
        for( s = 0; s < 6; ++s ){
            meshIndex[ ix + s ] += it;
        }

    }

};


////////////////////
// Mesh Primitives

NGL.TubeMeshBuffer = function( position, normal, binormal, tangent, color, size, pickingColor, params ){

    var p = params || {};

    this.rx = p.rx !== undefined ? p.rx : 1.5;
    this.ry = p.ry !== undefined ? p.ry : 0.5;
    this.radialSegments = p.radialSegments !== undefined ? p.radialSegments : 4;
    this.capped = p.capped !== undefined ? p.capped : false;

    this.capVertices = this.capped ? this.radialSegments : 0;
    this.capTriangles = this.capped ? this.radialSegments - 2 : 0;

    var n = position.length / 3;
    var n1 = n - 1;
    var radialSegments1 = this.radialSegments + 1;

    var x = n * this.radialSegments * 3 + 2 * this.capVertices * 3;

    this.size2 = n;

    this.meshPosition = new Float32Array( x );
    this.meshColor = new Float32Array( x );
    this.meshNormal = new Float32Array( x );
    this.meshPickingColor = pickingColor ? new Float32Array( x ) : undefined;
    this.meshIndex = new Uint32Array(
        n1 * 2 * this.radialSegments * 3 + 2 * this.capTriangles * 3
    );

    this.makeIndex();

    NGL.MeshBuffer.call(
        this, this.meshPosition, this.meshColor, this.meshIndex,
        this.meshNormal, this.meshPickingColor, p
    );

    this.setAttributes( {
        position: position,
        normal: normal,
        binormal: binormal,
        tangent: tangent,
        color: color,
        size: size,
        pickingColor: pickingColor
    } );

}

NGL.TubeMeshBuffer.prototype = Object.create( NGL.MeshBuffer.prototype );

NGL.TubeMeshBuffer.prototype.constructor = NGL.TubeMeshBuffer;

NGL.TubeMeshBuffer.prototype.setAttributes = function(){

    var vTangent = new THREE.Vector3();
    var vMeshNormal = new THREE.Vector3();

    return function( data ){

        var rx = this.rx;
        var ry = this.ry;

        var n = this.size2;
        var n1 = n - 1;
        var capVertices = this.capVertices;
        var radialSegments = this.radialSegments;

        var attributes = this.geometry.attributes;

        var position, normal, binormal, tangent, color, size, pickingColor;
        var meshPosition, meshColor, meshNormal, meshPickingColor

        if( data[ "position" ] ){

            position = data[ "position" ];
            normal = data[ "normal" ];
            binormal = data[ "binormal" ];
            tangent = data[ "tangent" ];
            size = data[ "size" ];

            meshPosition = attributes[ "position" ].array;
            meshNormal = attributes[ "normal" ].array;

            attributes[ "position" ].needsUpdate = true;
            attributes[ "normal" ].needsUpdate = true;

        }

        if( data[ "color" ] ){

            color = data[ "color" ];
            meshColor = attributes[ "color" ].array;
            attributes[ "color" ].needsUpdate = true;

        }

        if( data[ "pickingColor" ] ){

            pickingColor = data[ "pickingColor" ];
            meshPickingColor = attributes[ "pickingColor" ].array;
            attributes[ "pickingColor" ].needsUpdate = true;

        }

        var i, j, k, l, s, t;
        var v, cx, cy;
        var cx1, cy1, cx2, cy2;
        var radius;
        var irs, irs1;

        var normX, normY, normZ;
        var biX, biY, biZ;
        var posX, posY, posZ;

        var cxArr = [];
        var cyArr = [];
        var cx1Arr = [];
        var cy1Arr = [];
        var cx2Arr = [];
        var cy2Arr = [];

        if( position ){

            for( j = 0; j < radialSegments; ++j ){

                v = ( j / radialSegments ) * 2 * Math.PI;

                cxArr[ j ] = rx * Math.cos( v );
                cyArr[ j ] = ry * Math.sin( v );

                cx1Arr[ j ] = rx * Math.cos( v - 0.01 );
                cy1Arr[ j ] = ry * Math.sin( v - 0.01 );
                cx2Arr[ j ] = rx * Math.cos( v + 0.01 );
                cy2Arr[ j ] = ry * Math.sin( v + 0.01 );

            }

        }

        for( i = 0; i < n; ++i ){

            k = i * 3;
            l = k * radialSegments;

            if( position ){

                vTangent.set(
                    tangent[ k ], tangent[ k + 1 ], tangent[ k + 2 ]
                );

                normX = normal[ k     ];
                normY = normal[ k + 1 ];
                normZ = normal[ k + 2 ];

                biX = binormal[ k     ];
                biY = binormal[ k + 1 ];
                biZ = binormal[ k + 2 ];

                posX = position[ k     ];
                posY = position[ k + 1 ];
                posZ = position[ k + 2 ];

                radius = size[ i ];

            }

            for( j = 0; j < radialSegments; ++j ){

                s = l + j * 3

                if( position ){

                    cx = -radius * cxArr[ j ]; // TODO: Hack: Negating it so it faces outside.
                    cy = radius * cyArr[ j ];

                    cx1 = -radius * cx1Arr[ j ];
                    cy1 = radius * cy1Arr[ j ];
                    cx2 = -radius * cx2Arr[ j ];
                    cy2 = radius * cy2Arr[ j ];

                    meshPosition[ s     ] = posX + cx * normX + cy * biX;
                    meshPosition[ s + 1 ] = posY + cx * normY + cy * biY;
                    meshPosition[ s + 2 ] = posZ + cx * normZ + cy * biZ;

                    // TODO half of these are symmetric
                    vMeshNormal.set(
                        // ellipse tangent approximated as vector from/to adjacent points
                        ( cx2 * normX + cy2 * biX ) -
                            ( cx1 * normX + cy1 * biX ),
                        ( cx2 * normY + cy2 * biY ) -
                            ( cx1 * normY + cy1 * biY ),
                        ( cx2 * normZ + cy2 * biZ ) -
                            ( cx1 * normZ + cy1 * biZ )
                    ).cross( vTangent );

                    meshNormal[ s     ] = vMeshNormal.x;
                    meshNormal[ s + 1 ] = vMeshNormal.y;
                    meshNormal[ s + 2 ] = vMeshNormal.z;

                }

                if( color ){

                    meshColor[ s     ] = color[ k     ];
                    meshColor[ s + 1 ] = color[ k + 1 ];
                    meshColor[ s + 2 ] = color[ k + 2 ];

                }

                if( pickingColor ){

                    meshPickingColor[ s     ] = pickingColor[ k     ];
                    meshPickingColor[ s + 1 ] = pickingColor[ k + 1 ];
                    meshPickingColor[ s + 2 ] = pickingColor[ k + 2 ];

                }

            }

        }

        // front cap

        k = 0;
        l = n * 3 * radialSegments;

        for( j = 0; j < radialSegments; ++j ){

            s = k + j * 3;
            t = l + j * 3;

            if( position ){

                meshPosition[ t     ] = meshPosition[ s     ];
                meshPosition[ t + 1 ] = meshPosition[ s + 1 ];
                meshPosition[ t + 2 ] = meshPosition[ s + 2 ];

                meshNormal[ t     ] = tangent[ k     ];
                meshNormal[ t + 1 ] = tangent[ k + 1 ];
                meshNormal[ t + 2 ] = tangent[ k + 2 ];

            }

            if( color ){

                meshColor[ t     ] = meshColor[ s     ];
                meshColor[ t + 1 ] = meshColor[ s + 1 ];
                meshColor[ t + 2 ] = meshColor[ s + 2 ];

            }

            if( pickingColor ){

                meshPickingColor[ t     ] = meshPickingColor[ s     ];
                meshPickingColor[ t + 1 ] = meshPickingColor[ s + 1 ];
                meshPickingColor[ t + 2 ] = meshPickingColor[ s + 2 ];

            }

        }

        // back cap

        k = ( n - 1 ) * 3 * radialSegments;
        l = ( n + 1 ) * 3 * radialSegments;

        for( j = 0; j < radialSegments; ++j ){

            s = k + j * 3;
            t = l + j * 3;

            if( position ){

                meshPosition[ t     ] = meshPosition[ s     ];
                meshPosition[ t + 1 ] = meshPosition[ s + 1 ];
                meshPosition[ t + 2 ] = meshPosition[ s + 2 ];

                meshNormal[ t     ] = tangent[ n1 * 3     ];
                meshNormal[ t + 1 ] = tangent[ n1 * 3 + 1 ];
                meshNormal[ t + 2 ] = tangent[ n1 * 3 + 2 ];

            }

            if( color ){

                meshColor[ t     ] = meshColor[ s     ];
                meshColor[ t + 1 ] = meshColor[ s + 1 ];
                meshColor[ t + 2 ] = meshColor[ s + 2 ];

            }

            if( pickingColor ){

                meshPickingColor[ t     ] = meshPickingColor[ s     ];
                meshPickingColor[ t + 1 ] = meshPickingColor[ s + 1 ];
                meshPickingColor[ t + 2 ] = meshPickingColor[ s + 2 ];

            }

        }

    }

}();

NGL.TubeMeshBuffer.prototype.makeIndex = function(){

    var meshIndex = this.meshIndex;

    var n = this.size2;
    var n1 = n - 1;
    var capTriangles = this.capTriangles;
    var radialSegments = this.radialSegments;
    var radialSegments1 = this.radialSegments + 1;

    var i, k, irs, irs1, l, j;

    for( i = 0; i < n1; ++i ){

        k = i * radialSegments * 3 * 2

        irs = i * radialSegments;
        irs1 = ( i + 1 ) * radialSegments;

        for( j = 0; j < radialSegments; ++j ){

            l = k + j * 3 * 2;

            // meshIndex[ l + 0 ] = irs + ( ( j + 0 ) % radialSegments );
            meshIndex[ l ] = irs + j;
            meshIndex[ l + 1 ] = irs + ( ( j + 1 ) % radialSegments );
            // meshIndex[ l + 2 ] = irs1 + ( ( j + 0 ) % radialSegments );
            meshIndex[ l + 2 ] = irs1 + j;

            // meshIndex[ l + 3 ] = irs1 + ( ( j + 0 ) % radialSegments );
            meshIndex[ l + 3 ] = irs1 + j;
            meshIndex[ l + 4 ] = irs + ( ( j + 1 ) % radialSegments );
            meshIndex[ l + 5 ] = irs1 + ( ( j + 1 ) % radialSegments );

        }

    }

    // capping

    var strip = [ 0 ];

    for( j = 1; j < radialSegments1 / 2; ++j ){

        strip.push( j );
        if( radialSegments - j !== j ){
            strip.push( radialSegments - j );
        }

    }

    // front cap

    l = n1 * radialSegments * 3 * 2;
    k = n * radialSegments;

    for( j = 0; j < strip.length - 2; ++j ){

        if( j % 2 === 0 ){
            meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 0 ];
            meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ];
            meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 2 ];
        }else{
            meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 2 ];
            meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ];
            meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 0 ];
        }

    }

    // back cap

    l = n1 * radialSegments * 3 * 2 + 3 * capTriangles;
    k = n * radialSegments + radialSegments;

    for( j = 0; j < strip.length - 2; ++j ){

        if( j % 2 === 0 ){
            meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 0 ];
            meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ];
            meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 2 ];
        }else{
            meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 2 ];
            meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ];
            meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 0 ];
        }

    }

};


NGL.SurfaceBuffer = function(){

    NGL.MeshBuffer.apply( this, arguments );

}

NGL.SurfaceBuffer.prototype = Object.create( NGL.MeshBuffer.prototype );

NGL.SurfaceBuffer.prototype.constructor = NGL.SurfaceBuffer;


///////////////////
// API Primitives

NGL.SphereBuffer = function( position, color, radius, pickingColor, params, disableImpostor ){

    if( !NGL.extensionFragDepth || disableImpostor ){

        return new NGL.SphereGeometryBuffer(
            position, color, radius, pickingColor, params
        );

    }else{

        return new NGL.SphereImpostorBuffer(
            position, color, radius, pickingColor, params
        );

    }

};


NGL.CylinderBuffer = function( from, to, color, color2, radius, pickingColor, pickingColor2, params, disableImpostor ){

    if( !NGL.extensionFragDepth || disableImpostor ){

        // FIXME cap support missing

        return new NGL.CylinderGeometryBuffer(
            from, to, color, color2, radius,
            pickingColor, pickingColor2, params
        );

    }else{

        return new NGL.CylinderImpostorBuffer(
            from, to, color, color2, radius,
            pickingColor, pickingColor2, params
        );

    }

};


NGL.HyperballStickBuffer = function( from, to, color, color2, radius1, radius2, pickingColor, pickingColor2, params, disableImpostor ){

    if( !NGL.extensionFragDepth || disableImpostor ){

        return new NGL.CylinderGeometryBuffer(
            from, to, color, color2,
            NGL.Utils.calculateMinArray( radius1, radius2 ),
            pickingColor, pickingColor2, params
        );

    }else{

        return new NGL.HyperballStickImpostorBuffer(
            from, to, color, color2,
            radius1, radius2,
            pickingColor, pickingColor2, params
        );

    }

};


////////////////
// Text & Font


NGL.getFont = function( name ){

    var fnt = NGL.Resources[ 'fonts/' + name + '.fnt' ].split('\n');
    var font = {};
    var m, tWidth, tHeight, base, lineHeight;

    fnt.forEach( function( line ){

        if( line.substr( 0, 5 ) === 'char ' ){

            var character = {};
            var ls = line.substr( 5 ).split( /\s+/ );
            ls.forEach( function( field ){
                var fs = field.split( '=' );
                character[ fs[ 0 ] ] = parseInt( fs[ 1 ] );
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
            character.width2 = (10*width)/tWidth;
            character.height2 = (10*height)/tHeight;
            character.xadvance2 = (10*(character.xadvance))/tWidth;
            character.xoffset2 = (10*(character.xoffset))/tWidth;
            character.yoffset2 = (10*(character.yoffset))/tHeight;
            character.lineHeight = (10*lineHeight)/tHeight;
            font[ character[ 'id' ] ] = character;

        }else if( line.substr( 0, 7 ) === 'common ' ){

            // common lineHeight=38 base=30 scaleW=512 scaleH=512 pages=1 packed=0

            m = line.match( /scaleW=([0-9]+)/ );
            if( m !== null ) tWidth = m[ 1 ];

            m = line.match( /scaleH=([0-9]+)/ );
            if( m !== null ) tHeight = m[ 1 ];

            m = line.match( /base=([0-9]+)/ );
            if( m !== null ) base = m[ 1 ];

            m = line.match( /lineHeight=([0-9]+)/ );
            if( m !== null ) lineHeight = m[ 1 ];

        }else{

            //NGL.log( i, line );

        }

    })

    return font;

};


NGL.TextBuffer = function( position, size, color, text, params ){

    var p = params || {};

    var fontName = p.font !== undefined ? p.font : 'LatoBlack';
    this.font = NGL.getFont( fontName );

    this.tex = new THREE.Texture(
        NGL.Resources[ 'fonts/' + fontName + '.png' ]
    );
    this.tex.needsUpdate = true;

    var n = position.length / 3;

    var charCount = 0;
    for( var i = 0; i < n; ++i ){
        charCount += text[ i ].length;
    }

    this.text = text;
    this.count = charCount;
    this.positionCount = n;

    this.vertexShader = 'SDFFont.vert';
    this.fragmentShader = 'SDFFont.frag';

    NGL.QuadBuffer.call( this, p );

    this.addUniforms( {
        "fontTexture"  : { type: "t", value: this.tex }
    } );

    this.addAttributes( {
        "inputTexCoord": { type: "v2", value: null },
        "inputSize": { type: "f", value: null },
    } );

    this.setAttributes( {
        "position": position,
        "size": size,
        "color": color
    } );

    this.makeMapping();

};

NGL.TextBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );

NGL.TextBuffer.prototype.constructor = NGL.TextBuffer;

NGL.TextBuffer.prototype.makeMaterial = function(){

    NGL.Buffer.prototype.makeMaterial.call( this );

    this.material.lights = false;
    this.material.transparent = true;
    this.material.uniforms.fontTexture.value = this.tex;
    this.material.needsUpdate = true;

};

NGL.TextBuffer.prototype.setAttributes = function( data ){

    var position, size, color;
    var aPosition, inputSize, aColor;

    var text = this.text;
    var attributes = this.geometry.attributes;

    if( data[ "position" ] ){
        position = data[ "position" ];
        aPosition = attributes[ "position" ].array;
        attributes[ "position" ].needsUpdate = true;
    }

    if( data[ "size" ] ){
        size = data[ "size" ];
        inputSize = attributes[ "inputSize" ].array;
        attributes[ "inputSize" ].needsUpdate = true;
    }

    if( data[ "color" ] ){
        color = data[ "color" ];
        aColor = attributes[ "color" ].array;
        attributes[ "color" ].needsUpdate = true;
    }

    var n = this.positionCount;

    var i, j, o;
    var iCharAll = 0;
    var txt, iChar, nChar;

    for( var v = 0; v < n; v++ ) {

        o = 3 * v;
        txt = text[ v ];
        nChar = txt.length;

        for( iChar = 0; iChar < nChar; iChar++, iCharAll++ ) {

            i = iCharAll * 2 * 4;

            for( var m = 0; m < 4; m++ ) {

                j = iCharAll * 4 * 3 + ( 3 * m );

                if( position ){

                    aPosition[ j     ] = position[ o     ];
                    aPosition[ j + 1 ] = position[ o + 1 ];
                    aPosition[ j + 2 ] = position[ o + 2 ];

                }

                if( size ){

                    inputSize[ ( iCharAll * 4 ) + m ] = size[ v ];

                }

                if( color ){

                    aColor[ j     ] = color[ o     ];
                    aColor[ j + 1 ] = color[ o + 1 ];
                    aColor[ j + 2 ] = color[ o + 2 ];

                }

            }

        }

    }

};

NGL.TextBuffer.prototype.setProperties = function( data ){

    // alpha channel must stay enabled for anti-aliasing
    if( data && data.transparent !== undefined ) data.transparent = true;

    NGL.QuadBuffer.prototype.setProperties.call( this, data );

};

NGL.TextBuffer.prototype.makeMapping = function(){

    var font = this.font;
    var text = this.text;

    var inputTexCoord = this.geometry.attributes[ "inputTexCoord" ].array;
    var inputMapping = this.geometry.attributes[ "mapping" ].array;

    var n = this.positionCount;

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

            xadvance += c.xadvance2;

        }

    }

};

NGL.TextBuffer.prototype.dispose = function(){

    NGL.Buffer.prototype.dispose.call( this );

    this.tex.dispose();

};


///////////
// Helper

NGL.VectorBuffer = function( position, vector, params ){

    var p = params || {};

    this.size = position.length / 3;
    this.vertexShader = 'Line.vert';
    this.fragmentShader = 'Line.frag';
    this.line = true;

    var n = this.size;
    var n2 = n * 2;

    this.attributeSize = n2;

    this.scale = p.scale || 1;
    var color = new THREE.Color( p.color || "grey" );

    this.linePosition = new Float32Array( n2 * 3 );
    this.lineColor = NGL.Utils.uniformArray3( n2, color.r, color.g, color.b );

    NGL.Buffer.call(
        this, this.linePosition, this.lineColor, undefined, undefined, p
    );

    this.setAttributes( {
        position: position,
        vector: vector
    } );

};

NGL.VectorBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.VectorBuffer.prototype.constructor = NGL.VectorBuffer;

NGL.VectorBuffer.prototype.setAttributes = function( data ){

    var attributes = this.geometry.attributes;

    var position, vector;
    var aPosition;

    if( data[ "position" ] && data[ "vector" ] ){
        position = data[ "position" ];
        vector = data[ "vector" ];
        aPosition = attributes[ "position" ].array;
        attributes[ "position" ].needsUpdate = true;
    }

    var n = this.size;
    var scale = this.scale;

    var i, j;

    if( data[ "position" ] && data[ "vector" ] ){

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

    }

};
