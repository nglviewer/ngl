/**
 * @file Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


////////////////
// Buffer Core

/**
 * The core buffer class.
 * @class
 * @private
 */
NGL.Buffer = function( position, color, pickingColor, params ){

    var p = params || {};

    // required properties:
    // - size
    // - attributeSize
    // - vertexShader
    // - fragmentShader

    this.pickable = false;

    this.transparent = p.transparent !== undefined ? p.transparent : false;
    this.opaqueBack = p.opaqueBack !== undefined ? p.opaqueBack : false;
    this.dullInterior = p.dullInterior !== undefined ? p.dullInterior : false;
    this.side = p.side !== undefined ? p.side : THREE.DoubleSide;
    this.opacity = p.opacity !== undefined ? p.opacity : 1.0;
    this.nearClip = p.nearClip !== undefined ? p.nearClip : true;
    this.background = p.background !== undefined ? p.background : false;
    this.lineWidth = p.lineWidth !== undefined ? p.lineWidth : 1;

    this.attributes = [];
    this.geometry = new THREE.BufferGeometry();

    this.addAttributes({
        "position": { type: "v3", value: position },
        "color": { type: "c", value: color },
    });

    this.group = new THREE.Group();
    this.pickingGroup = new THREE.Group();

    if( pickingColor ){

        this.addAttributes({
            "pickingColor": { type: "c", value: pickingColor },
        });

        this.pickable = true;

    }

    this.uniforms = THREE.UniformsUtils.merge([
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
        {
            "opacity": { type: "f", value: this.opacity },
            "nearClip": { type: "f", value: 0.0 },
            "objectId": { type: "f", value: 0.0 },
        }
    ]);

    this.pickingUniforms = {
        "nearClip": { type: "f", value: 0.0 },
        "objectId": { type: "f", value: 0.0 },
    };

};

NGL.Buffer.prototype = {

    constructor: NGL.Buffer,

    finalize: function(){

        this.makeIndex();

        if( NGL.indexUint16 ){

            this.geometry.computeOffsets();

        }

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

    getMesh: function( type, material ){

        material = material || this.getMaterial( type );

        if( type === "wireframe" || this.wireframe ){

            if( !this.wireframeGeometry ){

                var index = this.geometry.attributes.index.array;
                var n = index.length;
                var wireframeIndex = new Uint32Array( n * 2 );

                for( var i = 0, j = 0; i < n; i+=3, j+=6 ){

                    var a = index[ i + 0 ];
                    var b = index[ i + 1 ];
                    var c = index[ i + 2 ];

                    wireframeIndex[ j + 0 ] = a;
                    wireframeIndex[ j + 1 ] = b;
                    wireframeIndex[ j + 2 ] = a;
                    wireframeIndex[ j + 3 ] = c;
                    wireframeIndex[ j + 4 ] = b;
                    wireframeIndex[ j + 5 ] = c;

                }

                this.wireframeGeometry = this.geometry.clone();
                this.wireframeGeometry.attributes.index.array = wireframeIndex;

                if( NGL.indexUint16 ){
                    this.wireframeGeometry.computeOffsets();
                }else{
                    this.wireframeGeometry.clearDrawCalls();
                }

            }

            return new THREE.LineSegments( this.wireframeGeometry, material );

        }else{

            return new THREE.Mesh( this.geometry, material );

        }

    },

    getMaterial: function( type ){

        var material;

        if( type === "picking" ){

            material = new THREE.ShaderMaterial( {

                uniforms: THREE.UniformsUtils.clone( this.pickingUniforms ),
                attributes: this.attributes,
                vertexShader: NGL.getShader( this.vertexShader ),
                fragmentShader: NGL.getShader( this.fragmentShader ),
                depthTest: true,
                transparent: false,
                depthWrite: true,
                lights: false,
                fog: false

            } );

            material.side = this.side;
            material.defines[ "PICKING" ] = 1;

        }else if( type === "wireframe" || this.wireframe ){

            material = new THREE.ShaderMaterial( {
                uniforms:  THREE.UniformsUtils.clone( this.uniforms ),
                attributes: this.attributes,
                vertexShader: NGL.getShader( "Line.vert" ),
                fragmentShader: NGL.getShader( "Line.frag" ),
                depthTest: true,
                transparent: this.transparent,
                depthWrite: true,
                lights: false,
                fog: true,
                linewidth: this.lineWidth
            } );

        }else{

            material = new THREE.ShaderMaterial( {

                uniforms: THREE.UniformsUtils.clone( this.uniforms ),
                attributes: this.attributes,
                vertexShader: NGL.getShader( this.vertexShader ),
                fragmentShader: NGL.getShader( this.fragmentShader ),
                depthTest: true,
                transparent: this.transparent,
                depthWrite: true,
                // lights: true,
                lights: false,
                fog: true

            } );

            material.side = this.side;

            if( type === "background" || this.background ){

                material.defines[ "NOLIGHT" ] = 1;

            }

            if( this.flatShaded ){

                material.defines[ "FLAT_SHADED" ] = 1;

            }

            if( this.opaqueBack ){

                material.defines[ "OPAQUE_BACK" ] = 1;

            }

            if( this.dullInterior ){

                material.defines[ "DULL_INTERIOR" ] = 1;

            }

        }

        if( this.nearClip ){

            material.defines[ "NEAR_CLIP" ] = 1;

        }

        return material;

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

        Object.keys( attributes ).forEach( function( name ){

            var buf;
            var a = attributes[ name ];

            this.attributes.push( name );

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
            );

        }, this );

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

        var attributes = this.geometry.attributes;

        if( this.wireframeGeometry ){

            var wireframeAttributes = this.wireframeGeometry.attributes;

        }

        Object.keys( data ).forEach( function( name ){

            attributes[ name ].set( data[ name ] );
            attributes[ name ].needsUpdate = true;

            if( this.wireframeGeometry ){

                wireframeAttributes[ name ].set( data[ name ] );
                wireframeAttributes[ name ].needsUpdate = true;

            }

        }, this );

    },

    makeIndex: function(){

        if( this.index ){

            this.geometry.addAttribute(
                "index",
                new THREE.BufferAttribute( this.index, 1 )
            );

        }

    },

    setVisibility: function( value ){

        this.group.visible = value;
        if( this.pickable ){
            this.pickingGroup.visible = value;
        }

    },

    dispose: function(){

        this.group.traverse( function ( o ){
            if( o.material ){
                o.material.dispose();
            }
        } );

        if( this.pickable ){
            this.pickingGroup.traverse( function ( o ){
                if( o.material ){
                    o.material.dispose();
                }
            } );
        }

        this.geometry.dispose();
        if( this.wireframeGeometry ) this.wireframeGeometry.dispose();

    }

};


NGL.MeshBuffer = function( position, color, index, normal, pickingColor, params ){

    var p = params || {};

    this.wireframe = p.wireframe !== undefined ? p.wireframe : false;
    this.flatShaded = p.flatShaded !== undefined ? p.flatShaded : false;

    this.size = position.length / 3;
    this.attributeSize = this.size;
    this.vertexShader = 'Mesh.vert';
    this.fragmentShader = 'Mesh.frag';

    this.index = index;

    NGL.Buffer.call( this, position, color, pickingColor, p );

    this.addAttributes({
        "normal": { type: "v3", value: normal },
    });

    this.finalize();

    if( normal === undefined ){

        this.geometry.computeVertexNormals();

    }

};

NGL.MeshBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.MeshBuffer.prototype.constructor = NGL.MeshBuffer;


NGL.MappedBuffer = function( params ){

    this.mappedSize = this.size * this.mappingSize;
    this.attributeSize = this.mappedSize;

    NGL.Buffer.call( this, null, null, null, params );

    this.addAttributes({
        "mapping": { type: this.mappingType, value: null },
    });

};

NGL.MappedBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.MappedBuffer.prototype.constructor = NGL.MappedBuffer;

NGL.MappedBuffer.prototype.finalize = function(){

    this.makeMapping();

    NGL.Buffer.prototype.finalize.call( this );

};

NGL.MappedBuffer.prototype.setAttributes = function( data ){

    var attributes = this.geometry.attributes;
    var size = this.size;
    var mappingSize = this.mappingSize;

    var a, d, itemSize, array, n, i, j;

    Object.keys( data ).forEach( function( name ){

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

        a.needsUpdate = true;

    }, this );

};

NGL.MappedBuffer.prototype.makeMapping = function(){

    var size = this.size;
    var mapping = this.mapping;
    var mappingSize = this.mappingSize;
    var mappingItemSize = this.mappingItemSize;

    var aMapping = this.geometry.attributes[ "mapping" ].array;

    for( var v = 0; v < size; v++ ) {

        aMapping.set( mapping, v * mappingItemSize * mappingSize );

    }

};

NGL.MappedBuffer.prototype.makeIndex = function(){

    var size = this.size;
    var mappingSize = this.mappingSize;
    var mappingIndices = this.mappingIndices;
    var mappingIndicesSize = this.mappingIndicesSize;
    var mappingItemSize = this.mappingItemSize;

    this.geometry.addAttribute(
        "index",
        new THREE.BufferAttribute(
            new Uint32Array( size * mappingIndicesSize ), 1
        )
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

    this.size = position.length / 3;
    this.vertexShader = 'SphereImpostor.vert';
    this.fragmentShader = 'SphereImpostor.frag';

    NGL.QuadBuffer.call( this, params );

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

    if( pickingColor ){

        this.addAttributes({
            "pickingColor": { type: "c", value: null },
        });

        this.setAttributes({
            "pickingColor": pickingColor,
        });

        this.pickable = true;

    }

    this.finalize();

};

NGL.SphereImpostorBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );

NGL.SphereImpostorBuffer.prototype.constructor = NGL.SphereImpostorBuffer;


NGL.CylinderImpostorBuffer = function( from, to, color, color2, radius, pickingColor, pickingColor2, params ){

    var p = params || p;

    // Moves the cylinder in camera space to get, for example,
    // one of multiple shifted screen-aligned cylinders.
    this.shift = p.shift !== undefined ? p.shift : 0;

    this.cap = p.cap !== undefined ? p.cap : true;

    this.size = from.length / 3;
    this.vertexShader = 'CylinderImpostor.vert';
    this.fragmentShader = 'CylinderImpostor.frag';

    NGL.AlignedBoxBuffer.call( this, p );

    this.addUniforms({
        'modelViewMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'shift': { type: "f", value: this.shift },
    });

    this.addAttributes({
        "position1": { type: "v3", value: null },
        "position2": { type: "v3", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": NGL.Utils.calculateCenterArray( from, to ),

        "position1": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius,
    });

    if( pickingColor ){

        this.addAttributes({
            "pickingColor": { type: "c", value: null },
            "pickingColor2": { type: "c", value: null },
        });

        this.setAttributes({
            "pickingColor": pickingColor,
            "pickingColor2": pickingColor2,
        });

        this.pickable = true;

    }

    this.finalize();

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

    this.size = position1.length / 3;
    this.vertexShader = 'HyperballStickImpostor.vert';
    this.fragmentShader = 'HyperballStickImpostor.frag';

    NGL.BoxBuffer.call( this, p );

    this.addUniforms({
        'modelViewProjectionMatrix': { type: "m4", value: new THREE.Matrix4() },
        'modelViewProjectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'modelViewMatrixInverseTranspose': { type: "m4", value: new THREE.Matrix4() },
        'shrink': { type: "f", value: shrink },
    });

    this.addAttributes({
        "color": { type: "c", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
        "radius2": { type: "f", value: null },
        "position1": { type: "v3", value: null },
        "position2": { type: "v3", value: null },
    });

    this.setAttributes({
        "color": color,
        "color2": color2,
        "radius": radius1,
        "radius2": radius2,
        "position1": position1,
        "position2": position2,

        "position": NGL.Utils.calculateCenterArray( position1, position2 ),
    });

    if( pickingColor ){

        this.addAttributes({
            "pickingColor": { type: "c", value: null },
            "pickingColor2": { type: "c", value: null },
        });

        this.setAttributes({
            "pickingColor": pickingColor,
            "pickingColor2": pickingColor2,
        });

        this.pickable = true;

    }

    this.finalize();

};

NGL.HyperballStickImpostorBuffer.prototype = Object.create( NGL.BoxBuffer.prototype );

NGL.HyperballStickImpostorBuffer.prototype.constructor = NGL.HyperballStickImpostorBuffer;


////////////////////////
// Geometry Primitives


NGL.GeometryBuffer = function( position, color, pickingColor, params ){

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

    this.meshPosition = new Float32Array( this.size * 3 );
    this.meshNormal = new Float32Array( this.size * 3 );
    this.meshIndex = new Uint32Array( n * o * 3 );
    this.meshColor = new Float32Array( this.size * 3 );
    this.meshPickingColor = new Float32Array( this.size * 3 );

    this.transformedGeoPosition = new Float32Array( m * 3 );
    this.transformedGeoNormal = new Float32Array( m * 3 );

    this.makeIndex();

    this.setAttributes({
        "position": position,
        "color": color,
        "pickingColor": pickingColor
    });

    this.meshBuffer = new NGL.MeshBuffer(
        this.meshPosition, this.meshColor, this.meshIndex,
        this.meshNormal, this.meshPickingColor, params
    );

    this.pickable = this.meshBuffer.pickable;
    this.geometry = this.meshBuffer.geometry;

};

NGL.GeometryBuffer.prototype = {

    constructor: NGL.GeometryBuffer,

    get group () {

        return this.meshBuffer.group;

    },

    get pickingGroup () {

        return this.meshBuffer.pickingGroup;

    },

    get transparent () {

        return this.meshBuffer.transparent;

    },

    set transparent ( value ) {

        this.meshBuffer.transparent = value;

    },

    applyPositionTransform: function(){},

    setAttributes: function(){

        var matrix = new THREE.Matrix4();
        var normalMatrix = new THREE.Matrix3();

        return function( data ){

            var position, color, pickingColor;

            if( data[ "position" ] ){
                position = data[ "position" ];
                var geoPosition = this.geoPosition;
                var meshPosition = this.meshPosition;
                var transformedGeoPosition = this.transformedGeoPosition;
            }

            if( data[ "color" ] ){
                color = data[ "color" ];
                var meshColor = this.meshColor;
            }

            if( data[ "pickingColor" ] ){
                pickingColor = data[ "pickingColor" ];
                var meshPickingColor = this.meshPickingColor;
            }

            var updateNormals = ( this.updateNormals && position ) || !this.meshBuffer;

            if( updateNormals ){
                var geoNormal = this.geoNormal;
                var meshNormal = this.meshNormal;
                var transformedGeoNormal = this.transformedGeoNormal;
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
                        position[ i3 + 0 ], position[ i3 + 1 ], position[ i3 + 2 ]
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

                }

                if( color ){

                    for( j = 0; j < m; ++j ){

                        l = k + 3 * j;

                        meshColor[ l + 0 ] = color[ i3 + 0 ];
                        meshColor[ l + 1 ] = color[ i3 + 1 ];
                        meshColor[ l + 2 ] = color[ i3 + 2 ];

                    }

                }

                if( pickingColor ){

                    for( j = 0; j < m; ++j ){

                        l = k + 3 * j;

                        meshPickingColor[ l + 0 ] = pickingColor[ i3 + 0 ];
                        meshPickingColor[ l + 1 ] = pickingColor[ i3 + 1 ];
                        meshPickingColor[ l + 2 ] = pickingColor[ i3 + 2 ];

                    }

                }

            }

            var meshData = {};

            if( position ){
                meshData[ "position" ] = meshPosition;
            }

            if( updateNormals ){
                meshData[ "normal" ] = meshNormal;
            }

            if( color ){
                meshData[ "color" ] = meshColor;
            }

            if( pickingColor ){
                meshData[ "pickingColor" ] = meshPickingColor;
            }

            if( this.meshBuffer ){
                this.meshBuffer.setAttributes( meshData );
            }

        }

    }(),

    makeIndex: function(){

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

    },

    getRenderOrder: function(){

        return this.meshBuffer.getRenderOrder();

    },

    getMesh: function( type, material ){

        return this.meshBuffer.getMesh( type, material );

    },

    getMaterial: function( type ){

        return this.meshBuffer.getMaterial( type );

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

}


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

    this.setAttributes({
        "position1": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius,
        "pickingColor": pickingColor,
        "pickingColor2": pickingColor2
    }, true );

    this.setPositionTransform( this._from, this._to, this._radius );

    NGL.GeometryBuffer.call(
        this, this._position, this._color, this._pickingColor, params
    );

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

NGL.CylinderGeometryBuffer.prototype.setAttributes = function( data, init ){

    if( !this.meshBuffer && !init ){

        NGL.GeometryBuffer.prototype.setAttributes.call( this, data );
        return;

    }

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

    if( this.meshBuffer ){

        NGL.GeometryBuffer.prototype.setAttributes.call( this, geoData );

    }

}


//////////////////////
// Pixel Primitives

NGL.PointBuffer = function( position, color, params ){

    var p = params || {};

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

    NGL.Buffer.call( this, position, color, null, p );

};

NGL.PointBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.PointBuffer.prototype.constructor = NGL.PointBuffer;

NGL.PointBuffer.prototype.getMesh = function( type, material ){

    material = material || this.getMaterial( type );

    var points = new THREE.PointCloud(
        this.geometry, material
    );

    if( this.sort ) points.sortParticles = true

    return points;

};

NGL.PointBuffer.prototype.getMaterial = function( type ){

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

    return material;

};

NGL.PointBuffer.prototype.dispose = function(){

    NGL.Buffer.prototype.dispose.call( this );

    this.tex.dispose();

};


NGL.LineBuffer = function( from, to, color, color2, params ){

    var p = params || {};

    this.transparent = p.transparent !== undefined ? p.transparent : false;
    this.opacity = p.opacity !== undefined ? p.opacity : 1.0;
    this.nearClip = p.nearClip !== undefined ? p.nearClip : true;
    this.lineWidth = p.lineWidth !== undefined ? p.lineWidth : 1;

    this.size = from.length / 3;
    this.vertexShader = 'Line.vert';
    this.fragmentShader = 'Line.frag';

    var n = this.size;
    var n6 = n * 6;
    var nX = n * 2 * 2;

    this.attributes = [ "position", "color" ];

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute(
        'position', new THREE.BufferAttribute( new Float32Array( nX * 3 ), 3 )
    );
    this.geometry.addAttribute(
        'color', new THREE.BufferAttribute( new Float32Array( nX * 3 ), 3 )
    );

    this.setAttributes({
        from: from,
        to: to,
        color: color,
        color2: color2
    });

    this.uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        {
            "opacity": { type: "f", value: this.opacity },
            "nearClip": { type: "f", value: 0.0 },
        }
    ] );

    this.group = new THREE.Group();

};

NGL.LineBuffer.prototype = {

    constructor: NGL.LineBuffer,

    setAttributes: function( data ){

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

            if( from && to ){

                x1 = from[ j + 0 ];
                y1 = from[ j + 1 ];
                z1 = from[ j + 2 ];

                x2 = to[ j + 0 ];
                y2 = to[ j + 1 ];
                z2 = to[ j + 2 ];

                x = ( x1 + x2 ) / 2.0;
                y = ( y1 + y2 ) / 2.0;
                z = ( z1 + z2 ) / 2.0;

                aPosition[ i + 0 ] = from[ j + 0 ];
                aPosition[ i + 1 ] = from[ j + 1 ];
                aPosition[ i + 2 ] = from[ j + 2 ];
                aPosition[ i + 3 ] = x;
                aPosition[ i + 4 ] = y;
                aPosition[ i + 5 ] = z;

            }

            if( color && color2 ){

                aColor[ i + 0 ] = color[ j + 0 ];
                aColor[ i + 1 ] = color[ j + 1 ];
                aColor[ i + 2 ] = color[ j + 2 ];
                aColor[ i + 3 ] = color[ j + 0 ];
                aColor[ i + 4 ] = color[ j + 1 ];
                aColor[ i + 5 ] = color[ j + 2 ];

            }

            i2 = i + n6;

            if( from && to ){

                aPosition[ i2 + 0 ] = x;
                aPosition[ i2 + 1 ] = y;
                aPosition[ i2 + 2 ] = z;
                aPosition[ i2 + 3 ] = to[ j + 0 ];
                aPosition[ i2 + 4 ] = to[ j + 1 ];
                aPosition[ i2 + 5 ] = to[ j + 2 ];

            }

            if( color && color2 ){

                aColor[ i2 + 0 ] = color2[ j + 0 ];
                aColor[ i2 + 1 ] = color2[ j + 1 ];
                aColor[ i2 + 2 ] = color2[ j + 2 ];
                aColor[ i2 + 3 ] = color2[ j + 0 ];
                aColor[ i2 + 4 ] = color2[ j + 1 ];
                aColor[ i2 + 5 ] = color2[ j + 2 ];

            }

        }

    },

    getRenderOrder: NGL.Buffer.prototype.getRenderOrder,

    getMesh: function( type, material ){

        material = material || this.getMaterial( type );

        return new THREE.LineSegments( this.geometry, material );

    },

    getMaterial: function( type ){

        var uniforms = THREE.UniformsUtils.clone( this.uniforms );

        var material = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            attributes: this.attributes,
            vertexShader: NGL.getShader( this.vertexShader ),
            fragmentShader: NGL.getShader( this.fragmentShader ),
            depthTest: true,
            transparent: this.transparent,
            depthWrite: true,
            lights: false,
            fog: true,
            linewidth: this.lineWidth
        } );

        if( this.nearClip ){

            material.defines[ "NEAR_CLIP" ] = 1;

        }

        return material;

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

};


NGL.TraceBuffer = function( position, color, params ){

    this.size = position.length / 3;

    var n = this.size;
    var n1 = n - 1;

    this.from = new Float32Array( n1 * 3 );
    this.to = new Float32Array( n1 * 3 );
    this.lineColor = new Float32Array( n1 * 3 );
    this.lineColor2 = new Float32Array( n1 * 3 );

    this.setAttributes({
        position: position,
        color: color
    });

    this.lineBuffer = new NGL.LineBuffer(
        this.from, this.to, this.lineColor, this.lineColor2, params
    );

    this.pickable = this.lineBuffer.pickable;
    this.geometry = this.lineBuffer.geometry;

};

NGL.TraceBuffer.prototype = {

    constructor: NGL.TraceBuffer,

    get group () {

        return this.lineBuffer.group;

    },

    get pickingGroup () {

        return this.lineBuffer.pickingGroup;

    },

    get transparent () {

        return this.lineBuffer.transparent;

    },

    set transparent ( value ) {

        this.lineBuffer.transparent = value;

    },

    setAttributes: function( data ){

        var position, color;
        var from, to, lineColor, lineColor2;

        if( data[ "position" ] ){
            position = data[ "position" ];
            from = this.from;
            to = this.to;
        }

        if( data[ "color" ] ){
            color = data[ "color" ];
            lineColor = this.lineColor;
            lineColor2 = this.lineColor2;
        }

        var n = this.size;
        var n1 = n - 1;

        for( var i=0, v; i<n1; ++i ){

            v = 3 * i;

            if( position ){

                from[ v + 0 ] = position[ v + 0 ];
                from[ v + 1 ] = position[ v + 1 ];
                from[ v + 2 ] = position[ v + 2 ];

                to[ v + 0 ] = position[ v + 3 ];
                to[ v + 1 ] = position[ v + 4 ];
                to[ v + 2 ] = position[ v + 5 ];

            }

            if( color ){

                lineColor[ v + 0 ] = color[ v + 0 ];
                lineColor[ v + 1 ] = color[ v + 1 ];
                lineColor[ v + 2 ] = color[ v + 2 ];

                lineColor2[ v + 0 ] = color[ v + 3 ];
                lineColor2[ v + 1 ] = color[ v + 4 ];
                lineColor2[ v + 2 ] = color[ v + 5 ];

            }

        }

        var lineData = {};

        if( position ){
            lineData[ "from" ] = from;
            lineData[ "to" ] = to;
        }

        if( color ){
            lineData[ "color" ] = lineColor;
            lineData[ "color2" ] = lineColor2;
        }

        if( this.lineBuffer ){
            this.lineBuffer.setAttributes( lineData );
        }

    },

    getRenderOrder: function(){

        return this.lineBuffer.getRenderOrder();

    },

    getMesh: function( type, material ){

        return this.lineBuffer.getMesh( type, material );

    },

    getMaterial: function( type ){

        return this.lineBuffer.getMaterial( type );

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

};


//////////////////////
// Sprite Primitives

NGL.ParticleSpriteBuffer = function( position, color, radius ){

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

};

NGL.ParticleSpriteBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );

NGL.ParticleSpriteBuffer.prototype.constructor = NGL.ParticleSpriteBuffer;


NGL.RibbonBuffer = function( position, normal, dir, color, size, pickingColor, params ){

    var p = params || {};

    this.transparent = p.transparent !== undefined ? p.transparent : false;
    this.side = p.side !== undefined ? p.side : THREE.DoubleSide;
    this.opacity = p.opacity !== undefined ? p.opacity : 1.0;
    this.nearClip = p.nearClip !== undefined ? p.nearClip : true;
    this.flatShaded = p.flatShaded !== undefined ? p.flatShaded : false;

    this.vertexShader = 'Ribbon.vert';
    this.fragmentShader = 'Ribbon.frag';
    this.size = ( position.length/3 ) - 1;

    var n = this.size;
    var n4 = n * 4;

    this.attributes = [
        "position", "normal",
        "inputDir", "inputSize", "inputNormal", "inputColor"
    ];

    if( pickingColor ){
        this.attributes.push( "pickingColor" );
    }

    this.uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
        {
            "opacity": { type: "f", value: this.opacity },
            "nearClip": { type: "f", value: 0.0 },
            "objectId": { type: "f", value: 0.0 },
        }
    ]);

    this.pickingUniforms = {
        "nearClip": { type: "f", value: 0.0 },
        "objectId": { type: "f", value: 0.0 },
    };

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute(
        'position', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
    );
    this.geometry.addAttribute(
        'inputDir', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
    );
    this.geometry.addAttribute(
        'inputSize', new THREE.BufferAttribute( new Float32Array( n4 ), 1 )
    );
    this.geometry.addAttribute(
        'normal', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
    );
    this.geometry.addAttribute(
        'inputColor', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
    );
    if( pickingColor ){
        this.geometry.addAttribute(
            'pickingColor', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
        );
        this.pickable = true;
    }

    this.setAttributes({
        position: position,
        normal: normal,
        dir: dir,
        color: color,
        size: size,
        pickingColor: pickingColor
    });

    this.group = new THREE.Group();
    this.pickingGroup = new THREE.Group();

    NGL.Buffer.prototype.finalize.call( this );

};

NGL.RibbonBuffer.prototype = {

    constructor: NGL.RibbonBuffer,

    setAttributes: function( data ){

        var n = this.size;
        var n4 = n * 4;

        var attributes = this.geometry.attributes;

        var position, normal, size, dir, color, pickingColor;
        var aPosition, inputNormal, inputSize, inputDir, inputColor, inputPickingColor;

        if( data[ "position" ] ){
            position = data[ "position" ];
            aPosition = attributes[ "position" ].array;
            attributes[ "position" ].needsUpdate = true;
        }

        if( data[ "normal" ] ){
            normal = data[ "normal" ];
            inputNormal = attributes[ "normal" ].array;
            attributes[ "normal" ].needsUpdate = true;
        }

        if( data[ "size" ] ){
            size = data[ "size" ];
            inputSize = attributes[ "inputSize" ].array;
            attributes[ "inputSize" ].needsUpdate = true;
        }

        if( data[ "dir" ] ){
            dir = data[ "dir" ];
            inputDir = attributes[ "inputDir" ].array;
            attributes[ "inputDir" ].needsUpdate = true;
        }

        if( data[ "color" ] ){
            color = data[ "color" ];
            inputColor = attributes[ "inputColor" ].array;
            attributes[ "inputColor" ].needsUpdate = true;
        }

        if( data[ "pickingColor" ] ){
            pickingColor = data[ "pickingColor" ];
            inputPickingColor = attributes[ "pickingColor" ].array;
            attributes[ "pickingColor" ].needsUpdate = true;
        }

        var v, i, k, p, l, v3;
        var prevSize = size ? size[0] : null;

        for( v = 0; v < n; ++v ){

            v3 = v * 3;
            k = v * 3 * 4;
            l = v * 4;

            if( position ){

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

            }

            if( normal ){

                inputNormal[ k + 0 ] = -normal[ v3 + 0 ];
                inputNormal[ k + 1 ] = -normal[ v3 + 1 ];
                inputNormal[ k + 2 ] = -normal[ v3 + 2 ];

                inputNormal[ k + 3 ] = -normal[ v3 + 0 ];
                inputNormal[ k + 4 ] = -normal[ v3 + 1 ];
                inputNormal[ k + 5 ] = -normal[ v3 + 2 ];

                inputNormal[ k + 6 ] = -normal[ v3 + 3 ];
                inputNormal[ k + 7 ] = -normal[ v3 + 4 ];
                inputNormal[ k + 8 ] = -normal[ v3 + 5 ];

                inputNormal[ k + 9 ] = -normal[ v3 + 3 ];
                inputNormal[ k + 10 ] = -normal[ v3 + 4 ];
                inputNormal[ k + 11 ] = -normal[ v3 + 5 ];

            }


            for( i = 0; i<4; ++i ){
                p = k + 3 * i;

                if( color ){

                    inputColor[ p + 0 ] = color[ v3 + 0 ];
                    inputColor[ p + 1 ] = color[ v3 + 1 ];
                    inputColor[ p + 2 ] = color[ v3 + 2 ];

                }

                if( pickingColor ){

                    inputPickingColor[ p + 0 ] = pickingColor[ v3 + 0 ];
                    inputPickingColor[ p + 1 ] = pickingColor[ v3 + 1 ];
                    inputPickingColor[ p + 2 ] = pickingColor[ v3 + 2 ];

                }

            }

            if( size ){

                if( prevSize!=size[ v ] ){
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

            }

            if( dir ){

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

            }

        }

    },

    makeIndex: function(){

        var n = this.size;
        var n4 = n * 4;

        var quadIndices = new Uint32Array([
            0, 1, 2,
            1, 3, 2
        ]);

        this.geometry.addAttribute(
            'index', new THREE.BufferAttribute(
                new Uint32Array( n4 * 3 ), 1
            )
        );

        var index = this.geometry.attributes[ "index" ].array;

        var s, v, ix, it;

        for( v = 0; v < n; ++v ){

            ix = v * 6;
            it = v * 4;

            index.set( quadIndices, ix );
            for( s = 0; s < 6; ++s ){
                index[ ix + s ] += it;
            }

        }

    },

    getRenderOrder: NGL.Buffer.prototype.getRenderOrder,

    getMesh: NGL.Buffer.prototype.getMesh,

    getMaterial: NGL.Buffer.prototype.getMaterial,

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

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
    this.size = position.length / 3;

    var n = this.size;
    var n1 = n - 1;
    var radialSegments1 = this.radialSegments + 1;

    var x = n * this.radialSegments * 3 + 2 * this.capVertices * 3;

    this.meshPosition = new Float32Array( x );
    this.meshColor = new Float32Array( x );
    this.meshNormal = new Float32Array( x );
    this.meshPickingColor = new Float32Array( x );
    this.meshIndex = new Uint32Array(
        n1 * 2 * this.radialSegments * 3 + 2 * this.capTriangles * 3
    );

    this.makeIndex();

    this.setAttributes({
        "position": position,
        "normal": normal,
        "binormal": binormal,
        "tangent": tangent,
        "color": color,
        "size": size,
        "pickingColor": pickingColor
    });

    this.meshBuffer = new NGL.MeshBuffer(
        this.meshPosition, this.meshColor, this.meshIndex,
        this.meshNormal, this.meshPickingColor, p
    );

    this.pickable = this.meshBuffer.pickable;
    this.geometry = this.meshBuffer.geometry;

}

NGL.TubeMeshBuffer.prototype = {

    constructor: NGL.TubeMeshBuffer,

    get group () {

        return this.meshBuffer.group;

    },

    get pickingGroup () {

        return this.meshBuffer.pickingGroup;

    },

    get transparent () {

        return this.meshBuffer.transparent;

    },

    set transparent ( value ) {

        this.meshBuffer.transparent = value;

    },

    setAttributes: function(){

        var vTangent = new THREE.Vector3();
        var vMeshNormal = new THREE.Vector3();

        return function( data ){

            var rx = this.rx;
            var ry = this.ry;

            var n = this.size;
            var n1 = n - 1;
            var capVertices = this.capVertices;
            var radialSegments = this.radialSegments;

            var position, normal, binormal, tangent, color, size, pickingColor;
            var meshPosition, meshColor, meshNormal, meshPickingColor

            if( data[ "position" ] ){
                position = data[ "position" ];
                normal = data[ "normal" ];
                binormal = data[ "binormal" ];
                tangent = data[ "tangent" ];
                size = data[ "size" ];
                meshPosition = this.meshPosition;
                meshNormal = this.meshNormal;
            }

            if( data[ "color" ] ){
                color = data[ "color" ];
                meshColor = this.meshColor;
            }

            if( data[ "pickingColor" ] ){
                pickingColor = data[ "pickingColor" ];
                meshPickingColor = this.meshPickingColor;
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
                        tangent[ k + 0 ], tangent[ k + 1 ], tangent[ k + 2 ]
                    );

                    normX = normal[ k + 0 ];
                    normY = normal[ k + 1 ];
                    normZ = normal[ k + 2 ];

                    biX = binormal[ k + 0 ];
                    biY = binormal[ k + 1 ];
                    biZ = binormal[ k + 2 ];

                    posX = position[ k + 0 ];
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

                        meshPosition[ s + 0 ] = posX + cx * normX + cy * biX;
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

                        meshNormal[ s + 0 ] = vMeshNormal.x;
                        meshNormal[ s + 1 ] = vMeshNormal.y;
                        meshNormal[ s + 2 ] = vMeshNormal.z;

                    }

                    if( color ){

                        meshColor[ s + 0 ] = color[ k + 0 ];
                        meshColor[ s + 1 ] = color[ k + 1 ];
                        meshColor[ s + 2 ] = color[ k + 2 ];

                    }

                    if( pickingColor ){

                        meshPickingColor[ s + 0 ] = pickingColor[ k + 0 ];
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

                    meshPosition[ t + 0 ] = meshPosition[ s + 0 ];
                    meshPosition[ t + 1 ] = meshPosition[ s + 1 ];
                    meshPosition[ t + 2 ] = meshPosition[ s + 2 ];

                    meshNormal[ t + 0 ] = tangent[ k + 0 ];
                    meshNormal[ t + 1 ] = tangent[ k + 1 ];
                    meshNormal[ t + 2 ] = tangent[ k + 2 ];

                }

                if( color ){

                    meshColor[ t + 0 ] = meshColor[ s + 0 ];
                    meshColor[ t + 1 ] = meshColor[ s + 1 ];
                    meshColor[ t + 2 ] = meshColor[ s + 2 ];

                }

                if( pickingColor ){

                    meshPickingColor[ t + 0 ] = meshPickingColor[ s + 0 ];
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

                    meshPosition[ t + 0 ] = meshPosition[ s + 0 ];
                    meshPosition[ t + 1 ] = meshPosition[ s + 1 ];
                    meshPosition[ t + 2 ] = meshPosition[ s + 2 ];

                    meshNormal[ t + 0 ] = tangent[ n1 * 3 + 0 ];
                    meshNormal[ t + 1 ] = tangent[ n1 * 3 + 1 ];
                    meshNormal[ t + 2 ] = tangent[ n1 * 3 + 2 ];

                }

                if( color ){

                    meshColor[ t + 0 ] = meshColor[ s + 0 ];
                    meshColor[ t + 1 ] = meshColor[ s + 1 ];
                    meshColor[ t + 2 ] = meshColor[ s + 2 ];

                }

                if( pickingColor ){

                    meshPickingColor[ t + 0 ] = meshPickingColor[ s + 0 ];
                    meshPickingColor[ t + 1 ] = meshPickingColor[ s + 1 ];
                    meshPickingColor[ t + 2 ] = meshPickingColor[ s + 2 ];

                }

            }


            var meshData = {};

            if( position ){
                meshData[ "position" ] = meshPosition;
                meshData[ "normal" ] = meshNormal;
            }

            if( color ){
                meshData[ "color" ] = meshColor;
            }

            if( pickingColor ){
                meshData[ "pickingColor" ] = meshPickingColor;
            }

            if( this.meshBuffer ){
                this.meshBuffer.setAttributes( meshData );
            }

        }

    }(),

    makeIndex: function(){

        var meshIndex = this.meshIndex;

        var n = this.size;
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

    },

    getRenderOrder: function(){

        return this.meshBuffer.getRenderOrder();

    },

    getMesh: function( type, material ){

        return this.meshBuffer.getMesh( type, material );

    },

    getMaterial: function( type ){

        return this.meshBuffer.getMaterial( type );

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

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

    var fnt = NGL.Resources[ '../fonts/' + name + '.fnt' ].split('\n');
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

    this.antialias = p.antialias !== undefined ? p.antialias : true;

    var fontName = p.font !== undefined ? p.font : 'LatoBlack';
    this.font = NGL.getFont( fontName );

    this.tex = new THREE.Texture(
        NGL.Resources[ '../fonts/' + fontName + '.png' ]
    );
    this.tex.needsUpdate = true;

    var n = position.length / 3;

    var charCount = 0;
    for( var i = 0; i < n; ++i ){
        charCount += text[ i ].length;
    }

    this.text = text;
    this.size = charCount;
    this.positionCount = n;

    this.vertexShader = 'SDFFont.vert';
    this.fragmentShader = 'SDFFont.frag';

    NGL.QuadBuffer.call( this, p );

    this.addUniforms({
        "fontTexture"  : { type: "t", value: this.tex },
        "backgroundColor"  : { type: "c", value: new THREE.Color( "black" ) }
    });

    this.addAttributes({
        "inputTexCoord": { type: "v2", value: null },
        "inputSize": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "size": size,
        "color": color
    });

    this.finalize();

};

NGL.TextBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );

NGL.TextBuffer.prototype.constructor = NGL.TextBuffer;

NGL.TextBuffer.prototype.getMaterial = function(){

    var material = NGL.Buffer.prototype.getMaterial.call( this );

    if( this.antialias ){

        material.transparent = true;
        material.depthWrite = true;
        material.blending = THREE.NormalBlending;
        material.defines[ "ANTIALIAS" ] = 1;

    }

    material.lights = false;
    material.uniforms.fontTexture.value = this.tex;
    material.needsUpdate = true;

    return material;

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

                j = iCharAll * 4 * 3 + (3 * m);

                if( data[ "position" ] ){

                    aPosition[ j + 0 ] = position[ o + 0 ];
                    aPosition[ j + 1 ] = position[ o + 1 ];
                    aPosition[ j + 2 ] = position[ o + 2 ];

                }

                if( data[ "size" ] ){

                    inputSize[ (iCharAll * 4) + m ] = size[ v ];

                }

                if( color ){

                    aColor[ j + 0 ] = color[ o + 0 ];
                    aColor[ j + 1 ] = color[ o + 1 ];
                    aColor[ j + 2 ] = color[ o + 2 ];

                }

            }

        }

    }

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

NGL.BufferVectorHelper = function( position, vector, color, scale ){

    scale = scale || 1;

    var n = position.length/3;
    var n2 = n * 2;

    this.size = n;

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute(
        'position',
        new THREE.BufferAttribute( new Float32Array( n2 * 3 ), 3 )
    );

    this.color = color;
    this.scale = scale;

    this.setAttributes({
        position: position,
        vector: vector
    });

    this.group = new THREE.Group();

};

NGL.BufferVectorHelper.prototype = {

    constructor: NGL.BufferVectorHelper,

    setAttributes: function( data ){

        var n = this.size;

        var attributes = this.geometry.attributes;

        var position;
        var aPosition;

        if( data[ "position" ] ){
            position = data[ "position" ];
            aPosition = attributes[ "position" ].array;
            attributes[ "position" ].needsUpdate = true;
        }

        if( data[ "vector" ] ){
            this.vector = data[ "vector" ];
        }

        var scale = this.scale;
        var vector = this.vector;

        var i, j;

        if( data[ "position" ] ){

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

    },

    getRenderOrder: NGL.Buffer.prototype.getRenderOrder,

    getMesh: function( type, material ){

        material = material || this.getMaterial( type );

        return new THREE.LineSegments( this.geometry, material );

    },

    getMaterial: function( type ){

        return new THREE.LineBasicMaterial( {
            color: this.color, fog: true
        } );

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

}

