/**
 * @file Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import {
    Color, Vector3,
    FrontSide, BackSide, DoubleSide, VertexColors,
    BufferGeometry, BufferAttribute,
    UniformsUtils, UniformsLib, Uniform,
    Group, LineSegments, Points, Mesh,
    ShaderMaterial
} from "../../lib/three.es6.js";

import { Log } from "../globals.js";
import { SupportsReadPixelsFloat } from "../globals.js";
import { defaults } from "../utils.js";
import { getShader } from "../shader/shader-utils.js";


/**
 * Buffer parameter object.
 * @typedef {Object} BufferParameters - buffer parameters
 * @property {Boolean} opaqueBack - render back-side opaque
 * @property {Boolean} dullInterior - render back-side with dull lighting
 * @property {String} side - which triangle sides to render, "front" front-side,
 *                            "back" back-side, "double" front- and back-side
 * @property {Float} opacity - translucency: 1 is fully opaque, 0 is fully transparent
 * @property {Integer} clipNear - position of camera near/front clipping plane
 *                                in percent of scene bounding box
 * @property {Boolean} flatShaded - render flat shaded
 * @property {Integer} linewidth - width of lines (when applicable)
 * @property {Boolean} wireframe - render as wireframe
 * @property {Integer} wireframeLinewidth - width of wireframe lines
 * @property {Float} roughness - how rough the material is, between 0 and 1
 * @property {Float} metalness - how metallic the material is, between 0 and 1
 * @property {Color} diffuse - diffuse color for lighting
 * @property {Boolean} forceTransparent - force the material to allow transparency
 */


function getThreeSide( side ){
    if( side === "front" ){
        return FrontSide;
    }else if( side === "back" ){
        return BackSide;
    }else if( side === "double" ){
        return DoubleSide;
    }else{
        return DoubleSide;
    }
}


/**
 * Buffer base class
 * @class
 * @param {Float32Array} position - positions
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} color - colors
 *                               [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Int32Array} [index] - triangle indices
 *                                 [a1,b1,c1, a2,b2,c2, ..., aN,bN,cN]
 * @param {Float32Array} [pickingColor] - picking colors
 *                                      [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {BufferParameters} params - parameters object
 */
function Buffer( position, color, index, pickingColor, params ){

    var p = params || {};

    // required properties:
    // - size
    // - attributeSize
    // - vertexShader
    // - fragmentShader

    this.pickable = false;
    this.dynamic = true;

    this.opaqueBack = defaults( p.opaqueBack, false );
    this.dullInterior = defaults( p.dullInterior, false );
    this.side = defaults( p.side, "double" );
    this.opacity = defaults( p.opacity, 1.0 );
    this.clipNear = defaults( p.clipNear, 0 );
    this.clipRadius = defaults( p.clipRadius, 0 );
    this.clipCenter = defaults( p.clipCenter, new Vector3() );
    this.flatShaded = defaults( p.flatShaded, false );
    this.background = defaults( p.background, false );
    this.linewidth = defaults( p.linewidth, 1 );
    this.wireframe = defaults( p.wireframe, false );
    this.wireframeLinewidth = defaults( p.wireframeLinewidth, 1 );
    this.roughness = defaults( p.roughness, 0.4 );
    this.metalness = defaults( p.metalness, 0.0 );
    this.diffuse = defaults( p.diffuse, 0xffffff );
    this.forceTransparent = defaults( p.forceTransparent, false );

    this.geometry = new BufferGeometry();

    this.addAttributes( {
        "position": { type: "v3", value: position },
        "color": { type: "c", value: color },
    } );

    this.indexVersion = 0;
    this.wireframeIndexVersion = -1;

    if( index ){
        this.geometry.setIndex(
            new BufferAttribute( index, 1 )
        );
        this.geometry.getIndex().setDynamic( this.dynamic );
    }

    if( pickingColor ){
        this.addAttributes( {
            "pickingColor": { type: "c", value: pickingColor },
        } );
        this.pickable = true;
    }

    this.uniforms = UniformsUtils.merge( [
        UniformsLib.common,
        {
            "fogColor": { value: null },
            "fogNear": { value: 0.0 },
            "fogFar": { value: 0.0 },
            "opacity": { value: this.opacity },
            "nearClip": { value: 0.0 },
            "clipRadius": { value: this.clipRadius },
            "clipCenter": { value: this.clipCenter }
        },
        {
            "emissive" : { value: new Color( 0x000000 ) },
            "roughness": { value: this.roughness },
            "metalness": { value: this.metalness }
        },
        UniformsLib.ambient,
        UniformsLib.lights
    ] );

    this.uniforms.diffuse.value.set( this.diffuse );

    var objectId = new Uniform( 0.0 )
        .onUpdate( function( object/*, camera*/ ){
            this.value = SupportsReadPixelsFloat ? object.id : object.id / 255;
        } );

    this.pickingUniforms = {
        "nearClip": { value: 0.0 },
        "objectId": objectId
    };

    this.group = new Group();
    this.wireframeGroup = new Group();
    this.pickingGroup = new Group();

    this.makeWireframeGeometry();

}

Buffer.prototype = {

    constructor: Buffer,

    parameters: {

        opaqueBack: { updateShader: true },
        dullInterior: { updateShader: true },
        side: { updateShader: true, property: true },
        opacity: { uniform: true },
        clipNear: { updateShader: true, property: true },
        clipRadius: { updateShader: true, property: true, uniform: true },
        clipCenter: { uniform: true },
        flatShaded: { updateShader: true },
        background: { updateShader: true },
        linewidth: { property: true },
        wireframe: { updateVisibility: true },
        roughness: { uniform: true },
        metalness: { uniform: true },
        diffuse: { uniform: true },

    },

    get transparent () {

        return this.opacity < 1 || this.forceTransparent;

    },

    makeMaterial: function(){

        var side = getThreeSide( this.side );

        this.material = new ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: "",
            fragmentShader: "",
            depthTest: true,
            transparent: this.transparent,
            depthWrite: true,
            lights: true,
            fog: true,
            side: side,
            linewidth: this.linewidth
        } );
        this.material.vertexColors = VertexColors;
        this.material.extensions.derivatives = this.flatShaded;
        this.material.extensions.fragDepth = this.impostor;
        this.material.clipNear = this.clipNear;

        this.wireframeMaterial = new ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: "",
            fragmentShader: "",
            depthTest: true,
            transparent: this.transparent,
            depthWrite: true,
            lights: false,
            fog: true,
            side: side,
            linewidth: this.linewidth
        } );
        this.wireframeMaterial.vertexColors = VertexColors;
        this.wireframeMaterial.clipNear = this.clipNear;

        this.pickingMaterial = new ShaderMaterial( {
            uniforms: this.pickingUniforms,
            vertexShader: "",
            fragmentShader: "",
            depthTest: true,
            transparent: false,
            depthWrite: true,
            lights: false,
            fog: false,
            side: side,
            linewidth: this.linewidth
        } );
        this.pickingMaterial.vertexColors = VertexColors;
        this.pickingMaterial.extensions.fragDepth = this.impostor;
        this.pickingMaterial.clipNear = this.clipNear;

        // also sets vertexShader/fragmentShader
        this.updateShader();

    },

    makeWireframeGeometry: function(){

        this.makeWireframeIndex();

        var geometry = this.geometry;
        var wireframeIndex = this.wireframeIndex;
        var wireframeGeometry = new BufferGeometry();

        wireframeGeometry.attributes = geometry.attributes;
        if( wireframeIndex ){
            wireframeGeometry.setIndex(
                new BufferAttribute( wireframeIndex, 1 )
                    .setDynamic( this.dynamic )
            );
            wireframeGeometry.setDrawRange( 0, this.wireframeIndexCount );
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
            }else if( !list.includes( b ) ){
                list.push( b );
                return true;
            }

            return false;

        }

        return function makeWireframeIndex(){

            var index = this.geometry.index;

            if( !this.wireframe ){

                this.wireframeIndex = new Uint16Array( 0 );
                this.wireframeIndexCount = 0;

            }else if( index ){

                var array = index.array;
                var n = array.length;
                if( this.geometry.drawRange.count !== Infinity ){
                    n = this.geometry.drawRange.count;
                }
                var wireframeIndex;
                if( this.wireframeIndex && this.wireframeIndex.length > n * 2 ){
                    wireframeIndex = this.wireframeIndex;
                }else{
                    var count = this.geometry.attributes.position.count;
                    var TypedArray = count > 65535 ? Uint32Array : Uint16Array;
                    wireframeIndex = new TypedArray( n * 2 );
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
                this.wireframeIndexVersion = this.indexVersion;

            }

        };

    }(),

    updateWireframeIndex: function(){

        this.wireframeGeometry.setDrawRange( 0, Infinity );
        if( this.wireframeIndexVersion < this.indexVersion ) this.makeWireframeIndex();

        if( this.wireframeIndex.length > this.wireframeGeometry.index.array.length ){

            this.wireframeGeometry.setIndex(
                new BufferAttribute( this.wireframeIndex, 1 )
                    .setDynamic( this.dynamic )
            );

        }else{

            var index = this.wireframeGeometry.getIndex();
            index.set( this.wireframeIndex );
            index.needsUpdate = this.wireframeIndexCount > 0;
            index.updateRange.count = this.wireframeIndexCount;

        }

        this.wireframeGeometry.setDrawRange( 0, this.wireframeIndexCount );

    },

    getRenderOrder: function(){

        var renderOrder = 0;

        if( this.type === "text" ){

            renderOrder = 1;

        }else if( this.transparent ){

            if( this.type === "surface" ){
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

            mesh = new LineSegments( this.geometry, this.material );

        }else if( this.point ){

            mesh = new Points( this.geometry, this.material );
            if( this.sortParticles ) mesh.sortParticles = true;

        }else{

            mesh = new Mesh( this.geometry, this.material );

        }

        mesh.frustumCulled = false;
        mesh.renderOrder = this.getRenderOrder();

        return mesh;

    },

    getWireframeMesh: function(){

        var mesh;

        if( !this.material ) this.makeMaterial();
        if( !this.wireframeGeometry ) this.makeWireframeGeometry();

        mesh = new LineSegments(
            this.wireframeGeometry, this.wireframeMaterial
        );

        mesh.frustumCulled = false;
        mesh.renderOrder = this.getRenderOrder();

        return mesh;

    },

    getPickingMesh: function(){

        var mesh;

        if( !this.material ) this.makeMaterial();

        mesh = new Mesh( this.geometry, this.pickingMaterial );

        mesh.frustumCulled = false;
        mesh.renderOrder = this.getRenderOrder();

        return mesh;

    },

    getShader: function( name, type ){

        return getShader( name, this.getDefines( type ) );

    },

    getVertexShader: function( type ){

        return this.getShader( this.vertexShader, type );

    },

    getFragmentShader: function( type ){

        return this.getShader( this.fragmentShader, type );

    },

    getDefines: function( type ){

        var defines = {};

        if( this.clipNear ){
            defines.NEAR_CLIP = 1;
        }

        if( this.clipRadius ){
            defines.RADIUS_CLIP = 1;
        }

        if( type === "picking" ){

            defines.PICKING = 1;

        }else{

            if( type === "background" || this.background ){
                defines.NOLIGHT = 1;
            }
            if( this.flatShaded ){
                defines.FLAT_SHADED = 1;
            }
            if( this.opaqueBack ){
                defines.OPAQUE_BACK = 1;
            }
            if( this.dullInterior ){
                defines.DULL_INTERIOR = 1;
            }

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

        this.uniforms = UniformsUtils.merge(
            [ this.uniforms, uniforms ]
        );

        this.pickingUniforms = UniformsUtils.merge(
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
                    Log.error( "attribute value has wrong length", name );
                }

                buf = a.value;

            }else{

                buf = new Float32Array(
                    this.attributeSize * itemSize[ a.type ]
                );

            }

            this.geometry.addAttribute(
                name,
                new BufferAttribute( buf, itemSize[ a.type ] )
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

    /**
     * Set buffer parameters
     * @param {BufferParameters} params - buffer parameters object
     * @return {undefined}
     */
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
                if( tp[ name ].uniform !== true ){
                    uniformData[ tp[ name ].uniform ] = p[ name ];
                }else{
                    uniformData[ name ] = p[ name ];
                }
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

            if( name === "flatShaded" ){
                this.material.extensions.derivatives = this.flatShaded;
            }

            if( name === "forceTransparent" ){
                propertyData.transparent = this.transparent;
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
         * var buffer = new Buffer();
         * buffer.setAttributes({ attrName: attrData });
         */

        var geometry = this.geometry;
        var attributes = geometry.attributes;

        for( var name in data ){

            var array = data[ name ];
            var length = array.length;

            if( name === "index" ){

                var index = geometry.getIndex();
                geometry.setDrawRange( 0, Infinity );

                if( length > index.array.length ){

                    geometry.setIndex(
                        new BufferAttribute( array, 1 )
                            .setDynamic( this.dynamic )
                    );

                }else{

                    index.set( array );
                    index.needsUpdate = length > 0;
                    index.updateRange.count = length;
                    geometry.setDrawRange( 0, length );

                }

                this.indexVersion++;
                if( this.wireframe ) this.updateWireframeIndex();

            }else{

                var attribute = attributes[ name ];

                if( length > attribute.array.length ){

                    geometry.addAttribute(
                        name,
                        new BufferAttribute( array, attribute.itemSize )
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
                this.setProperties( { transparent: this.transparent } );
            }

            if( u[ name ] !== undefined ){
                if( u[ name ].value.isVector3 ){
                    u[ name ].value.copy( data[ name ] );
                }else if( u[ name ].value.set ){
                    u[ name ].value.set( data[ name ] );
                }else{
                    u[ name ].value = data[ name ];
                }
            }

            if( wu[ name ] !== undefined ){
                if( wu[ name ].value.isVector3 ){
                    wu[ name ].value.copy( data[ name ] );
                }else if( wu[ name ].value.set ){
                    wu[ name ].value.set( data[ name ] );
                }else{
                    wu[ name ].value = data[ name ];
                }
            }

            if( pu[ name ] !== undefined ){
                if( pu[ name ].value.isVector3 ){
                    pu[ name ].value.copy( data[ name ] );
                }else if( pu[ name ].value.set ){
                    pu[ name ].value.set( data[ name ] );
                }else{
                    pu[ name ].value = data[ name ];
                }
            }

        }

    },

    setProperties: function( data ){

        if( !data ) return;

        var m = this.material;
        var wm = this.wireframeMaterial;
        var pm = this.pickingMaterial;

        for( var name in data ){

            var value = data[ name ];

            if( name === "transparent" ){
                this.updateRenderOrder();
            }else if( name === "side" ){
                value = getThreeSide( value );
            }

            if( m[ name ] !== undefined ){
                m[ name ] = value;
            }

            if( wm[ name ] !== undefined ){
                wm[ name ] = value;
            }

            if( pm[ name ] !== undefined ){
                pm[ name ] = value;
            }

        }

        m.needsUpdate = true;
        wm.needsUpdate = true;
        pm.needsUpdate = true;

    },

    /**
     * Set buffer visibility
     * @param {Boolean} value - visibility value
     * @return {undefined}
     */
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

    /**
     * Free buffer resources
     * @return {undefined}
     */
    dispose: function(){

        if( this.material ) this.material.dispose();
        if( this.wireframeMaterial ) this.wireframeMaterial.dispose();
        if( this.pickingMaterial ) this.pickingMaterial.dispose();

        this.geometry.dispose();
        if( this.wireframeGeometry ) this.wireframeGeometry.dispose();

    }

};


export default Buffer;
