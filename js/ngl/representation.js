/**
 * @file Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.makeRepresentation = function( type, object, viewer, params ){

    console.time( "NGL.makeRepresentation " + type );

    var ReprClass;

    if( object instanceof NGL.Structure ){

        ReprClass = NGL.representationTypes[ type ];

        if( !ReprClass ){

            console.error(
                "NGL.makeRepresentation: representation type " + type + " unknown"
            );
            return;

        }

    }else if( object instanceof NGL.Surface ){

        ReprClass = NGL.SurfaceRepresentation;

    }else if( object instanceof NGL.Trajectory ){

        ReprClass = NGL.TrajectoryRepresentation;

    }else{

        console.error(
            "NGL.makeRepresentation: object " + object + " unknown"
        );
        return;

    }

    var repr = new ReprClass( object, viewer, params );

    console.timeEnd( "NGL.makeRepresentation " + type );

    return repr;

};


///////////////////
// Representation

NGL.Representation = function( object, viewer, params ){

    this.viewer = viewer;

    this.bufferList = [];
    this.debugBufferList = [];

    this.init( params );

};

NGL.Representation.prototype = {

    constructor: NGL.Representation,

    type: "",

    parameters: {

        nearClip: {
            type: "boolean", define: "NEAR_CLIP"
        }

    },

    init: function( params ){

        var p = params || {};

        this.nearClip = p.nearClip !== undefined ? p.nearClip : true;

        this.visible = p.visible === undefined ? true : p.visible;
        this.quality = p.quality;

    },

    setColor: function( type ){

        if( type && type !== this.color ){

            this.color = type;

            this.update( { "color": true } );

        }

        return this;

    },

    create: function(){

        // this.bufferList.length = 0;
        // this.debugBufferList.length = 0;

    },

    update: function(){

        this.rebuild();

    },

    rebuild: function( params ){

        console.time( "NGL.Representation.rebuild " + this.type );

        if( params ){
            this.init( params );
        }

        this.clear();
        this.create();
        if( !this.manualAttach ) this.attach();

        console.timeEnd( "NGL.Representation.rebuild " + this.type );

    },

    attach: function(){

        this.setVisibility( this.visible );

    },

    setVisibility: function( value ){

        this.visible = value;

        this.bufferList.forEach( function( buffer ){

            buffer.setVisibility( value );

        } );

        this.debugBufferList.forEach( function( debugBuffer ){

            debugBuffer.setVisibility( value );

        } );

        this.viewer.requestRender();

        return this;

    },

    setParameters: function( params, what, rebuild ){

        var p = params;
        var tp = this.parameters;

        rebuild = rebuild || false;

        Object.keys( tp ).forEach( function( name ){

            if( p[ name ] === undefined ) return;
            if( tp[ name ] === undefined ) return;

            if( tp[ name ].int ) p[ name ] = parseInt( p[ name ] );
            if( tp[ name ].float ) p[ name ] = parseFloat( p[ name ] );

            // no value change
            if( p[ name ] === this[ name ] ) return;

            this[ name ] = p[ name ];

            // update buffer material uniform

            if( tp[ name ].uniform ){

                function updateUniform( mesh ){

                    var u = mesh.material.uniforms;

                    if( u && u[ name ] ){

                        u[ name ].value = p[ name ];

                    }else{

                        // happens when the buffers in a repr
                        // do not suppport the same parameters

                        // console.info( name )

                    }

                }

                this.bufferList.forEach( function( buffer ){

                    buffer.group.children.forEach( updateUniform );
                    if( buffer.pickingGroup ){
                        buffer.pickingGroup.children.forEach( updateUniform );
                    }

                } );

            }

            // update buffer material define

            if( tp[ name ].define ){

                function updateDefine( mesh ){

                    if( p[ name ] ){

                        mesh.material.defines[ tp[ name ].define ] = 1;

                    }else{

                        delete mesh.material.defines[ tp[ name ].define ];

                    }

                    mesh.material.needsUpdate = true;

                }

                this.bufferList.forEach( function( buffer ){

                    buffer.group.children.forEach( updateDefine );
                    if( buffer.pickingGroup ){
                        buffer.pickingGroup.children.forEach( updateDefine );
                    }

                } );

            }

            // update buffer material property

            if( tp[ name ].property ){

                var propertyName = (
                    tp[ name ].property === true ? name : tp[ name ].property
                );

                function updateProperty( mesh ){

                    if( propertyName in mesh.material ){

                        mesh.material[ propertyName ] = p[ name ];

                    }else{

                        // happens when the buffers in a repr
                        // do not suppport the same parameters

                        // console.info( name )

                    }

                    mesh.material.needsUpdate = true;

                }

                this.bufferList.forEach( function( buffer ){

                    buffer.group.children.forEach( updateProperty );
                    if( buffer.pickingGroup ){
                        buffer.pickingGroup.children.forEach( updateProperty );
                    }

                } );

            }

            // mark for rebuild

            if( tp[ name ].rebuild &&
                !( tp[ name ].rebuild === "impostor" &&
                    NGL.extensionFragDepth && !this.disableImpostor )
            ){

                rebuild = true;

            }

        }, this );

        if( rebuild ){

            this.rebuild();

        }else if( what && Object.keys( what ).length ){

            // update buffer attribute

            this.update( what );

        }

        return this;

    },

    getParameters: function(){

        var params = {

            color: this.color,
            visible: this.visible,
            sele: this.selection.string,
            disableImpostor: this.disableImpostor,
            quality: this.quality

        };

        Object.keys( this.parameters ).forEach( function( name ){

            params[ name ] = this[ name ];

        }, this );

        if( typeof this.radius === "string" ){

            params[ "radiusType" ] = this.radius;
            delete params[ "radius" ];

        }

        return params;

    },

    clear: function(){

        this.bufferList.forEach( function( buffer ){

            this.viewer.remove( buffer );
            buffer.dispose();

        }, this );

        this.bufferList.length = 0;

        this.debugBufferList.forEach( function( debugBuffer ){

            this.viewer.remove( debugBuffer );
            debugBuffer.dispose();

        }, this );

        this.debugBufferList.length = 0;

        this.viewer.requestRender();

    },

    dispose: function(){

        this.clear();

    }

};


/////////////////////////////
// Structure representation

NGL.StructureRepresentation = function( structure, viewer, params ){

    this.fiberList = [];

    this.selection = new NGL.Selection( params.sele );

    this.setStructure( structure );

    NGL.Representation.call( this, structure, viewer, params );

    if( structure.biomolDict ){
        var biomolOptions = { "__AU": "AU" };
        Object.keys( structure.biomolDict ).forEach( function( k ){
            biomolOptions[ k ] = k;
        } );
        this.parameters.assembly = {
            type: "select",
            options: biomolOptions,
            rebuild: true
        };
    }else{
        this.parameters.assembly = null;
    }

    // must come after atomSet to ensure selection change signals
    // have already updated the atomSet
    this.selection.signals.stringChanged.add( function( string ){

        this.rebuild();

    }, this );

    this.create();
    if( !this.manualAttach ) this.attach();

};

NGL.StructureRepresentation.prototype = NGL.createObject(

    NGL.Representation.prototype, {

    constructor: NGL.StructureRepresentation,

    type: "",

    parameters: Object.assign( {

        radiusType: {
            type: "select", options: NGL.RadiusFactory.types
        },
        radius: {
            type: "number", precision: 3, max: 10.0, min: 0.001
        },
        scale: {
            type: "number", precision: 3, max: 10.0, min: 0.001
        },
        transparent: {
            type: "boolean", property: true
        },
        side: {
            type: "select", options: NGL.SideTypes, property: true,
            int: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0,
            uniform: true
        },
        assembly: null

    }, NGL.Representation.prototype.parameters ),

    defaultScale: {
        "vdw": 1.0,
        "covalent": 1.0,
        "bfactor": 0.01,
        "ss": 1.0
    },

    defaultSize: 1.0,

    init: function( params ){

        var p = params || {};

        this.color = p.color === undefined ? "element" : p.color;
        this.radius = p.radius || "vdw";
        this.scale = p.scale || 1.0;
        this.transparent = p.transparent !== undefined ? p.transparent : false;
        this.side = p.side !== undefined ? p.side : THREE.DoubleSide;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;
        this.assembly = p.assembly || "1";

        this.setSelection( p.sele, true );

        NGL.Representation.prototype.init.call( this, p );

    },

    setStructure: function( structure ){

        this.structure = structure;
        this.atomSet = new NGL.AtomSet( this.structure, this.selection );

        return this;

    },

    setSelection: function( string, silent ){

        this.selection.setString( string, silent );

        return this;

    },

    setParameters: function( params, what, rebuild ){

        what = what || {};

        if( params && params[ "radiusType" ] !== undefined ){

            if( params[ "radiusType" ] === "size" ){
                this.radius = this.defaultSize;
            }else{
                this.radius = params[ "radiusType" ];
            }
            what[ "radius" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        if( params && params[ "radius" ] !== undefined ){

            this.radius = params[ "radius" ];
            what[ "radius" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        if( params && params[ "scale" ] !== undefined ){

            this.scale = params[ "scale" ];
            what[ "scale" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        NGL.Representation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    },

    attach: function(){

        console.time( "StructureRepresentation.attach" );

        var viewer = this.viewer;
        var structure = this.structure;
        var assembly = this.assembly;

        // console.log( structure.biomolDict );

        var instanceList = [];

        if( structure.biomolDict && structure.biomolDict[ assembly ] ){

            var matrixDict = structure.biomolDict[ assembly ].matrixDict;

            Object.keys( matrixDict ).forEach( function( name, i ){

                instanceList.push( {

                    id: i + 1,
                    name: name,
                    assembly: assembly,
                    matrix: matrixDict[ name ]

                } );

            } );

        }

        this.bufferList.forEach( function( buffer ){

            if( instanceList.length >= 1 ){
                viewer.add( buffer, instanceList );
            }else{
                viewer.add( buffer );
            }

        } );

        this.debugBufferList.forEach( function( debugBuffer ){

            if( instanceList.length > 1 ){
                viewer.add( debugBuffer, instanceList );
            }else{
                viewer.add( debugBuffer );
            }

        } );

        this.setVisibility( this.visible );

        console.timeEnd( "StructureRepresentation.attach" );

    },

    clear: function(){

        this.fiberList.length = 0;

        NGL.Representation.prototype.clear.call( this );

    },

    dispose: function(){

        this.atomSet.dispose();

        delete this.structure;

        NGL.Representation.prototype.dispose.call( this );

    }

} );


NGL.SpacefillRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.SpacefillRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.SpacefillRepresentation,

    type: "spacefill",

    parameters: Object.assign( {

        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: "impostor"
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};

        this.disableImpostor = p.disableImpostor || false;

        if( p.quality === "low" ){
            this.sphereDetail = 0;
        }else if( p.quality === "medium" ){
            this.sphereDetail = 1;
        }else if( p.quality === "high" ){
            this.sphereDetail = 2;
        }else{
            this.sphereDetail = p.sphereDetail || 1;
        }

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.sphereBuffer = new NGL.SphereBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.atomSet.atomRadius( null, this.radius, this.scale ),
            this.atomSet.atomColor( null, "picking" ),
            {
                sphereDetail: this.sphereDetail,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.bufferList.push( this.sphereBuffer );

    },

    update: function( what ){

        what = what || {};

        var sphereData = {};

        if( what[ "position" ] ){

            sphereData[ "position" ] = this.atomSet.atomPosition();

        }

        if( what[ "color" ] ){

            sphereData[ "color" ] = this.atomSet.atomColor( null, this.color );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            sphereData[ "radius" ] = this.atomSet.atomRadius(
                null, this.radius, this.scale
            );

        }

        this.sphereBuffer.setAttributes( sphereData );

    }

} );


NGL.PointRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.PointRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.PointRepresentation,

    type: "point",

    parameters: Object.assign( {

        pointSize: {
            type: "integer", max: 20, min: 1, property: "size"
        },
        sizeAttenuation: {
            type: "boolean", property: true
        },
        sort: {
            type: "boolean", rebuild: true
        },
        transparent: {
            type: "boolean", property: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0,
            property: true
        }

        // FIXME nearClip support missing
    }, NGL.Representation.prototype.parameters, { nearClip: null } ),

    init: function( params ){

        var p = params || {};

        this.pointSize = p.pointSize || 1;
        this.sizeAttenuation = p.sizeAttenuation !== undefined ? p.sizeAttenuation : true;
        this.sort = p.sort !== undefined ? p.sort : false;
        p.transparent = p.transparent !== undefined ? p.transparent : true;
        p.opacity = p.opacity !== undefined ? p.opacity : 0.6;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.pointBuffer = new NGL.PointBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            {
                pointSize: this.pointSize,
                sizeAttenuation: this.sizeAttenuation,
                sort: this.sort,
                transparent: this.transparent,
                opacity: opacity,
                nearClip: this.nearClip
            }
        );

        this.bufferList.push( this.pointBuffer );

    },

    update: function( what ){

        what = what || {};

        var pointData = {};

        if( what[ "position" ] ){

            pointData[ "position" ] = this.atomSet.atomPosition();

        }

        if( what[ "color" ] ){

            pointData[ "color" ] = this.atomSet.atomColor( null, this.color );

        }

        this.pointBuffer.setAttributes( pointData );

    }

} );


NGL.LabelRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.LabelRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.LabelRepresentation,

    type: "label",

    parameters: Object.assign( {

        labelType: {
            type: "select", options: NGL.LabelFactory.types, rebuild: true
        },
        font: {
            type: "select", options: {
                "Arial": "Arial",
                "DejaVu": "DejaVu",
                "LatoBlack": "LatoBlack"
            },
            rebuild: true
        },
        antialias: {
            type: "boolean", define: "ANTIALIAS"
        }

    }, NGL.StructureRepresentation.prototype.parameters, { side: null } ),

    init: function( params ){

        var p = params || {};

        p.color = p.color || 0xFFFFFF;

        this.labelType = p.labelType || "res";
        this.labelText = p.labelText || {};
        this.font = p.font || 'Arial';
        this.antialias = p.antialias !== undefined ? p.antialias : true;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        var text = [];
        var labelFactory = new NGL.LabelFactory(
            this.labelType, this.labelText
        );

        this.atomSet.eachAtom( function( a ){

            text.push( labelFactory.atomLabel( a ) );

        } );

        this.textBuffer = new NGL.TextBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomRadius( null, this.radius, this.scale ),
            this.atomSet.atomColor( null, this.color ),
            text,
            {
                font: this.font,
                antialias: this.antialias,
                opacity: opacity,
                nearClip: this.nearClip
            }
        );

        this.bufferList.push( this.textBuffer );

    },

    update: function( what ){

        what = what || {};

        var textData = {};

        if( what[ "position" ] ){

            textData[ "position" ] = this.atomSet.atomPosition();

        }

        if( what[ "size" ] || what[ "scale" ] ){

            textData[ "size" ] = this.atomSet.atomRadius(
                null, this.radius, this.scale
            );

        }

        if( what[ "color" ] ){

            textData[ "color" ] = this.atomSet.atomColor(
                null, this.color
            );

        }

        this.textBuffer.setAttributes( textData );

    }

} );


NGL.BallAndStickRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.BallAndStickRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.BallAndStickRepresentation,

    type: "ball+stick",

    defaultSize: 0.15,

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: "impostor"
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: "impostor"
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.radius = params.radius || this.defaultSize;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.sphereDetail = 0;
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.sphereDetail = 1;
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.sphereDetail = 2;
            this.radiusSegments = 20;
        }else{
            this.sphereDetail = params.sphereDetail || 1;
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.aspectRatio = params.aspectRatio || 2.0;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;
        var atomScale = this.scale * this.aspectRatio;

        this.sphereBuffer = new NGL.SphereBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.atomSet.atomRadius( null, this.radius, atomScale ),
            this.atomSet.atomColor( null, "picking" ),
            {
                sphereDetail: this.sphereDetail,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.__center = new Float32Array( this.atomSet.bondCount * 3 );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            this.atomSet.bondPosition( null, 0 ),
            this.atomSet.bondPosition( null, 1 ),
            this.atomSet.bondColor( null, 0, this.color ),
            this.atomSet.bondColor( null, 1, this.color ),
            this.atomSet.bondRadius( null, null, this.radius, this.scale ),
            this.atomSet.bondColor( null, 0, "picking" ),
            this.atomSet.bondColor( null, 1, "picking" ),
            {
                shift: 0,
                cap: true,
                radiusSegments: this.radiusSegments,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.bufferList.push( this.sphereBuffer, this.cylinderBuffer );

    },

    update: function( what ){

        what = what || {};

        var sphereData = {};
        var cylinderData = {};

        if( what[ "position" ] ){

            sphereData[ "position" ] = this.atomSet.atomPosition();

            var from = this.atomSet.bondPosition( null, 0 );
            var to = this.atomSet.bondPosition( null, 1 );

            cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                from, to, this.__center
            );
            cylinderData[ "position1" ] = from;
            cylinderData[ "position2" ] = to;

        }

        if( what[ "color" ] ){

            sphereData[ "color" ] = this.atomSet.atomColor( null, this.color );

            cylinderData[ "color" ] = this.atomSet.bondColor( null, 0, this.color );
            cylinderData[ "color2" ] = this.atomSet.bondColor( null, 1, this.color );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            sphereData[ "radius" ] = this.atomSet.atomRadius(
                null, this.radius, this.scale * this.aspectRatio
            );

            cylinderData[ "radius" ] = this.atomSet.bondRadius(
                null, null, this.radius, this.scale
            );

        }

        this.sphereBuffer.setAttributes( sphereData );
        this.cylinderBuffer.setAttributes( cylinderData );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "aspectRatio" ] ){

            this.aspectRatio = params[ "aspectRatio" ];
            what[ "radius" ] = true;
            what[ "scale" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.LicoriceRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.LicoriceRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.LicoriceRepresentation,

    type: "licorice",

    defaultSize: 0.15,

    parameters: Object.assign( {

        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: "impostor"
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: "impostor"
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.radius = params.radius || this.defaultSize;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.sphereDetail = 0;
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.sphereDetail = 1;
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.sphereDetail = 2;
            this.radiusSegments = 20;
        }else{
            this.sphereDetail = params.sphereDetail || 1;
            this.radiusSegments = params.radiusSegments || 10;
        }

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.sphereBuffer = new NGL.SphereBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.atomSet.atomRadius( null, this.radius, this.scale ),
            this.atomSet.atomColor( null, "picking" ),
            {
                sphereDetail: this.sphereDetail,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            this.atomSet.bondPosition( null, 0 ),
            this.atomSet.bondPosition( null, 1 ),
            this.atomSet.bondColor( null, 0, this.color ),
            this.atomSet.bondColor( null, 1, this.color ),
            this.atomSet.bondRadius( null, null, this.radius, this.scale ),
            this.atomSet.bondColor( null, 0, "picking" ),
            this.atomSet.bondColor( null, 1, "picking" ),
            {
                shift: 0,
                cap: true,
                radiusSegments: this.radiusSegments,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.bufferList.push( this.sphereBuffer, this.cylinderBuffer );

    },

    update: function( what ){

        this.aspectRatio = 1.0;

        NGL.BallAndStickRepresentation.prototype.update.call( this, what );

    }

} );


NGL.LineRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.LineRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.LineRepresentation,

    type: "line",

    parameters: Object.assign( {

        lineWidth: {
            type: "integer", max: 20, min: 1, property: "linewidth"
        },
        transparent: {
            type: "boolean", property: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0,
            uniform: true
        }

    }, NGL.Representation.prototype.parameters ),

    init: function( params ){

        var p = params || {};

        this.lineWidth = p.lineWidth || 1;
        this.transparent = p.transparent !== undefined ? p.transparent : false;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.lineBuffer = new NGL.LineBuffer(
            this.atomSet.bondPosition( null, 0 ),
            this.atomSet.bondPosition( null, 1 ),
            this.atomSet.bondColor( null, 0, this.color ),
            this.atomSet.bondColor( null, 1, this.color ),
            {
                lineWidth: this.lineWidth,
                transparent: this.transparent,
                opacity: opacity,
                nearClip: this.nearClip
            }
        );

        this.bufferList.push( this.lineBuffer );

    },

    update: function( what ){

        what = what || {};

        var lineData = {};

        if( what[ "position" ] ){

            lineData[ "from" ] = this.atomSet.bondPosition( null, 0 );
            lineData[ "to" ] = this.atomSet.bondPosition( null, 1 );

        }

        if( what[ "color" ] ){

            lineData[ "color" ] = this.atomSet.bondColor( null, 0, this.color );
            lineData[ "color2" ] = this.atomSet.bondColor( null, 1, this.color );

        }

        this.lineBuffer.setAttributes( lineData );

    }

} );


NGL.HyperballRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

    this.defaultScale[ "vdw" ] = 0.2;

};

NGL.HyperballRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.HyperballRepresentation,

    type: "hyperball",

    parameters: Object.assign( {

        shrink: {
            type: "number", precision: 3, max: 1.0, min: 0.001, uniform: true
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: "impostor"
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: "impostor"
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.scale = params.scale || 0.2;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.sphereDetail = 0;
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.sphereDetail = 1;
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.sphereDetail = 2;
            this.radiusSegments = 20;
        }else{
            this.sphereDetail = params.sphereDetail || 1;
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.shrink = params.shrink || 0.12;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.sphereBuffer = new NGL.SphereBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.atomSet.atomRadius( null, this.radius, this.scale ),
            this.atomSet.atomColor( null, "picking" ),
            {
                sphereDetail: this.sphereDetail,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.__center = new Float32Array( this.atomSet.bondCount * 3 );

        this.cylinderBuffer = new NGL.HyperballStickBuffer(
            this.atomSet.bondPosition( null, 0 ),
            this.atomSet.bondPosition( null, 1 ),
            this.atomSet.bondColor( null, 0, this.color ),
            this.atomSet.bondColor( null, 1, this.color ),
            this.atomSet.bondRadius( null, 0, this.radius, this.scale ),
            this.atomSet.bondRadius( null, 1, this.radius, this.scale ),
            this.atomSet.bondColor( null, 0, "picking" ),
            this.atomSet.bondColor( null, 1, "picking" ),
            {
                shrink: this.shrink,
                radiusSegments: this.radiusSegments,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.bufferList.push( this.sphereBuffer, this.cylinderBuffer );

    },

    update: function( what ){

        what = what || {};

        var sphereData = {};
        var cylinderData = {};

        if( what[ "position" ] ){

            sphereData[ "position" ] = this.atomSet.atomPosition();

            var from = this.atomSet.bondPosition( null, 0 );
            var to = this.atomSet.bondPosition( null, 1 );

            cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                from, to, this.__center
            );

            cylinderData[ "position1" ] = from;
            cylinderData[ "position2" ] = to;

        }

        if( what[ "color" ] ){

            sphereData[ "color" ] = this.atomSet.atomColor(
                null, this.color
            );

            cylinderData[ "color" ] = this.atomSet.bondColor(
                null, 0, this.color
            );
            cylinderData[ "color2" ] = this.atomSet.bondColor(
                null, 1, this.color
            );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            sphereData[ "radius" ] = this.atomSet.atomRadius(
                null, this.radius, this.scale
            );

            cylinderData[ "radius" ] = this.atomSet.bondRadius(
                null, 0, this.radius, this.scale
            );
            cylinderData[ "radius2" ] = this.atomSet.bondRadius(
                null, 1, this.radius, this.scale
            );

        }

        this.sphereBuffer.setAttributes( sphereData );
        this.cylinderBuffer.setAttributes( cylinderData );

    }

} );


NGL.BackboneRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.BackboneRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.BackboneRepresentation,

    type: "backbone",

    defaultSize: 0.25,

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: "impostor"
        },
        radiusSegments: {
            type: "integer", max: 50, min: 5, rebuild: "impostor"
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.radius = params.radius || this.defaultSize;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.sphereDetail = 0;
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.sphereDetail = 1;
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.sphereDetail = 2;
            this.radiusSegments = 20;
        }else{
            this.sphereDetail = params.sphereDetail || 1;
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.aspectRatio = params.aspectRatio || 1.0;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        var test = this.selection.test;

        this.backboneAtomSet = new NGL.AtomSet();
        this.backboneBondSet = new NGL.BondSet();

        var baSet = this.backboneAtomSet;
        var bbSet = this.backboneBondSet;

        baSet.structure = this.structure;
        bbSet.structure = this.structure;

        var a1, a2;

        this.structure.eachFiber( function( f ){

            if( f.residueCount < 2 ) return;

            f.eachResidueN( 2, function( r1, r2 ){

                a1 = r1.getAtomByName( f.traceAtomname );
                a2 = r2.getAtomByName( f.traceAtomname );

                if( test( a1 ) && test( a2 ) ){

                    baSet.addAtom( a1 );
                    bbSet.addBond( a1, a2, true );

                }

            } );

            if( test( a1 ) && test( a2 ) ){

                baSet.addAtom( a2 );

            }

        } );

        if( baSet.atomCount === 0 ) return;

        var sphereScale = this.scale * this.aspectRatio;

        this.sphereBuffer = new NGL.SphereBuffer(
            baSet.atomPosition(),
            baSet.atomColor( null, this.color ),
            baSet.atomRadius( null, this.radius, sphereScale ),
            baSet.atomColor( null, "picking" ),
            {
                sphereDetail: this.sphereDetail,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            bbSet.bondPosition( null, 0 ),
            bbSet.bondPosition( null, 1 ),
            bbSet.bondColor( null, 0, this.color ),
            bbSet.bondColor( null, 1, this.color ),
            bbSet.bondRadius( null, 0, this.radius, this.scale ),
            bbSet.bondColor( null, 0, "picking" ),
            bbSet.bondColor( null, 1, "picking" ),
            {
                shift: 0,
                cap: true,
                radiusSegments: this.radiusSegments,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.bufferList.push( this.sphereBuffer, this.cylinderBuffer );

    },

    update: function( what ){

        what = what || {};

        var baSet = this.backboneAtomSet;
        var bbSet = this.backboneBondSet;

        var sphereData = {};
        var cylinderData = {};

        if( what[ "position" ] ){

            sphereData[ "position" ] = baSet.atomPosition();

            var from = bbSet.bondPosition( null, 0 );
            var to = bbSet.bondPosition( null, 1 );

            cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                from, to
            );
            cylinderData[ "position1" ] = from;
            cylinderData[ "position2" ] = to;

        }

        if( what[ "color" ] ){

            sphereData[ "color" ] = baSet.atomColor( null, this.color );

            cylinderData[ "color" ] = bbSet.bondColor( null, 0, this.color );
            cylinderData[ "color2" ] = bbSet.bondColor( null, 1, this.color );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            sphereData[ "radius" ] = baSet.atomRadius(
                null, this.radius, this.scale * this.aspectRatio
            );

            cylinderData[ "radius" ] = bbSet.bondRadius(
                null, 0, this.radius, this.scale
            );

        }

        this.sphereBuffer.setAttributes( sphereData );
        this.cylinderBuffer.setAttributes( cylinderData );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "aspectRatio" ] ){

            this.aspectRatio = params[ "aspectRatio" ];
            what[ "radius" ] = true;
            what[ "scale" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    },

    clear: function(){

        if( this.backboneAtomSet ) this.backboneAtomSet.dispose();
        if( this.backboneBondSet ) this.backboneBondSet.dispose();

        NGL.StructureRepresentation.prototype.clear.call( this );

    }

} );


NGL.BaseRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.BaseRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.BaseRepresentation,

    type: "base",

    defaultSize: 0.2,

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: "impostor"
        },
        radiusSegments: {
            type: "integer", max: 50, min: 5, rebuild: "impostor"
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.radius = params.radius || this.defaultSize;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.sphereDetail = 0;
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.sphereDetail = 1;
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.sphereDetail = 2;
            this.radiusSegments = 20;
        }else{
            this.sphereDetail = params.sphereDetail || 1;
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.aspectRatio = params.aspectRatio || 1.0;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        var test = this.selection.test;

        this.baseAtomSet = new NGL.AtomSet();
        this.baseBondSet = new NGL.BondSet();

        var baSet = this.baseAtomSet;
        var bbSet = this.baseBondSet;

        baSet.structure = this.structure;
        bbSet.structure = this.structure;

        var a1, a2;
        var bases = [ "A", "G", "DA", "DG" ];

        this.structure.eachFiber( function( f ){

            if( f.residueCount < 1 || !f.isNucleic() ) return;

            f.eachResidue( function( r ){

                a1 = r.getAtomByName( f.traceAtomname );

                if( bases.indexOf( r.resname ) !== -1 ){
                    a2 = r.getAtomByName( "N1" );
                }else{
                    a2 = r.getAtomByName( "N3" );
                }

                if( test( a1 ) ){

                    baSet.addAtom( a1 );
                    baSet.addAtom( a2 );
                    bbSet.addBond( a1, a2, true );

                }

            } );

        } );

        if( baSet.atomCount === 0 ) return;

        var sphereScale = this.scale * this.aspectRatio;

        this.sphereBuffer = new NGL.SphereBuffer(
            baSet.atomPosition(),
            baSet.atomColor( null, this.color ),
            baSet.atomRadius( null, this.radius, sphereScale ),
            baSet.atomColor( null, "picking" ),
            {
                sphereDetail: this.sphereDetail,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            bbSet.bondPosition( null, 0 ),
            bbSet.bondPosition( null, 1 ),
            bbSet.bondColor( null, 0, this.color ),
            bbSet.bondColor( null, 1, this.color ),
            bbSet.bondRadius( null, 0, this.radius, this.scale ),
            bbSet.bondColor( null, 0, "picking" ),
            bbSet.bondColor( null, 1, "picking" ),
            {
                shift: 0,
                cap: true,
                radiusSegments: this.radiusSegments,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.bufferList.push( this.sphereBuffer, this.cylinderBuffer );

    },

    update: function( what ){

        what = what || {};

        var baSet = this.baseAtomSet;
        var bbSet = this.baseBondSet;

        var sphereData = {};
        var cylinderData = {};

        if( what[ "position" ] ){

            sphereData[ "position" ] = baSet.atomPosition();

            var from = bbSet.bondPosition( null, 0 );
            var to = bbSet.bondPosition( null, 1 );

            cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                from, to
            );
            cylinderData[ "position1" ] = from;
            cylinderData[ "position2" ] = to;

        }

        if( what[ "color" ] ){

            sphereData[ "color" ] = baSet.atomColor( null, this.color );

            cylinderData[ "color" ] = bbSet.bondColor( null, 0, this.color );
            cylinderData[ "color2" ] = bbSet.bondColor( null, 1, this.color );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            sphereData[ "radius" ] = baSet.atomRadius(
                null, this.radius, this.scale * this.aspectRatio
            );

            cylinderData[ "radius" ] = bbSet.bondRadius(
                null, 0, this.radius, this.scale
            );

        }

        this.sphereBuffer.setAttributes( sphereData );
        this.cylinderBuffer.setAttributes( cylinderData );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "aspectRatio" ] ){

            this.aspectRatio = params[ "aspectRatio" ];
            what[ "radius" ] = true;
            what[ "scale" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    },

    clear: function(){

        if( this.baseAtomSet ) this.baseAtomSet.dispose();
        if( this.baseBondSet ) this.baseAtomSet.dispose();

        NGL.StructureRepresentation.prototype.clear.call( this );

    }

} );


NGL.TubeRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.TubeRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.TubeRepresentation,

    type: "tube",

    defaultSize: 0.25,

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        radialSegments: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean", rebuild: true
        },
        wireframe: {
            type: "boolean", rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.color = p.color || "ss";
        p.radius = p.radius || this.defaultSize;

        if( p.quality === "low" ){
            this.subdiv = 3;
            this.radialSegments = 5;
        }else if( p.quality === "medium" ){
            this.subdiv = 6;
            this.radialSegments = 10;
        }else if( p.quality === "high" ){
            this.subdiv = 12;
            this.radialSegments = 20;
        }else{
            this.subdiv = p.subdiv || 6;
            this.radialSegments = p.radialSegments || 10;
        }

        this.tension = p.tension || NaN;
        this.capped = p.capped || true;
        this.wireframe = p.wireframe || false;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subOri = spline.getSubdividedOrientation( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
            var subSize = spline.getSubdividedSize(
                scope.subdiv, scope.radius, scope.scale
            );

            var rx = 1.0;
            var ry = 1.0;

            scope.bufferList.push(

                new NGL.TubeMeshBuffer(
                    subPos.position,
                    subOri.normal,
                    subOri.binormal,
                    subOri.tangent,
                    subCol.color,
                    subSize.size,
                    subCol.pickingColor,
                    {
                        radialSegments: scope.radialSegments,
                        rx: rx,
                        ry: ry,
                        capped: scope.capped,
                        wireframe: scope.wireframe,
                        transparent: scope.transparent,
                        side: scope.side,
                        opacity: opacity,
                        nearClip: scope.nearClip
                    }
                )

            );

            scope.fiberList.push( fiber );

        }, this.selection, true );

    },

    update: function( what ){

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        // console.time( this.name, "update" );

        for( i = 0; i < n; ++i ){

            var fiber = this.fiberList[ i ];

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var spline = new NGL.Spline( fiber );

            if( what[ "position" ] || what[ "radius" ] || what[ "scale" ] ){

                var subPos = spline.getSubdividedPosition(
                    this.subdiv, this.tension
                );
                var subOri = spline.getSubdividedOrientation(
                    this.subdiv, this.tension
                );
                var subSize = spline.getSubdividedSize(
                    this.subdiv, this.radius, this.scale
                );

                bufferData[ "position" ] = subPos.position;
                bufferData[ "normal" ] = subOri.normal;
                bufferData[ "binormal" ] = subOri.binormal;
                bufferData[ "tangent" ] = subOri.tangent;
                bufferData[ "size" ] = subSize.size;

            }

            if( what[ "color" ] ){

                var subCol = spline.getSubdividedColor(
                    this.subdiv, this.color
                );

                bufferData[ "color" ] = subCol.color;
                bufferData[ "pickingColor" ] = subCol.pickingColor;

            }

            this.bufferList[ i ].setAttributes( bufferData );

        };

        // console.timeEnd( this.name, "update" );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "position" ] = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.CartoonRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.CartoonRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.CartoonRepresentation,

    type: "cartoon",

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        subdiv: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        radialSegments: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean", rebuild: true
        },
        wireframe: {
            type: "boolean", rebuild: true
        },
        arrows: {
            type: "boolean", rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.color = p.color || "ss";
        p.radius = p.radius || "ss";

        if( p.quality === "low" ){
            this.subdiv = 3;
            this.radialSegments = 6;
        }else if( p.quality === "medium" ){
            this.subdiv = 6;
            this.radialSegments = 10;
        }else if( p.quality === "high" ){
            this.subdiv = 12;
            this.radialSegments = 20;
        }else{
            this.subdiv = p.subdiv || 6;
            this.radialSegments = p.radialSegments || 10;
        }

        this.aspectRatio = p.aspectRatio || 3.0;
        this.tension = p.tension || NaN;
        this.capped = p.capped || true;
        this.wireframe = p.wireframe || false;
        this.arrows = p.arrows || false;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;

        /*
            var l = {

                position: [],
                normal: [],
                binormal: [],
                tangent: [],
                color: [],
                size: [],
                pickingColor: []

            };

            var n = 0;
            var length = 0;
        */

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber, scope.arrows );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subOri = spline.getSubdividedOrientation( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
            var subSize = spline.getSubdividedSize(
                scope.subdiv, scope.radius, scope.scale
            );

            var rx = 1.0 * scope.aspectRatio;
            var ry = 1.0;

            if( fiber.isCg() ){
                ry = rx;
            }

            scope.bufferList.push(

                new NGL.TubeMeshBuffer(
                    subPos.position,
                    subOri.normal,
                    subOri.binormal,
                    subOri.tangent,
                    subCol.color,
                    subSize.size,
                    subCol.pickingColor,
                    {
                        radialSegments: scope.radialSegments,
                        rx: rx,
                        ry: ry,
                        capped: scope.capped,
                        wireframe: scope.wireframe,
                        transparent: scope.transparent,
                        side: scope.side,
                        opacity: opacity,
                        nearClip: scope.nearClip
                    }
                )

            );

            /*
                if( NGL.debug ){

                    scope.debugBufferList.push(

                        new NGL.BufferVectorHelper(
                            subPos.position,
                            subOri.normal,
                            "skyblue",
                            1.5
                        )

                    );

                    scope.debugBufferList.push(

                        new NGL.BufferVectorHelper(
                            subPos.position,
                            subOri.binormal,
                            "lightgreen",
                            1.5
                        )

                    );

                    scope.debugBufferList.push(

                        new NGL.BufferVectorHelper(
                            subPos.position,
                            subOri.tangent,
                            "orange",
                            1.5
                        )

                    );

                }
            */

            /*
                l.position.push( subPos.position );
                l.normal.push( subOri.normal );
                l.binormal.push( subOri.binormal );
                l.tangent.push( subOri.tangent );
                l.color.push( subCol.color );
                l.size.push( subSize.size );
                l.pickingColor.push( subCol.pickingColor );

                n += 1;
                length += subSize.size.length;
            */

            scope.fiberList.push( fiber );

        }, this.selection, true );

        /*
            var rx = 1.0 * this.aspectRatio;
            var ry = 1.0;

            if( this.fiberList[ 0 ].isCg() ){
                ry = rx;
            }

            var position = new Float32Array( 3 * length );
            for( var i = 0, offset = 0; i < n; ++i ){
                position.set( l.position[ i ], offset );
                offset += l.position[ i ].length;
            }

            var normal = new Float32Array( 3 * length );
            for( var i = 0, offset = 0; i < n; ++i ){
                normal.set( l.normal[ i ], offset );
                offset += l.normal[ i ].length;
            }

            var binormal = new Float32Array( 3 * length );
            for( var i = 0, offset = 0; i < n; ++i ){
                binormal.set( l.binormal[ i ], offset );
                offset += l.binormal[ i ].length;
            }

            var tangent = new Float32Array( 3 * length );
            for( var i = 0, offset = 0; i < n; ++i ){
                tangent.set( l.tangent[ i ], offset );
                offset += l.tangent[ i ].length;
            }

            var color = new Float32Array( 3 * length );
            for( var i = 0, offset = 0; i < n; ++i ){
                color.set( l.color[ i ], offset );
                offset += l.color[ i ].length;
            }

            var size = new Float32Array( length );
            for( var i = 0, offset = 0; i < n; ++i ){
                size.set( l.size[ i ], offset );
                offset += l.size[ i ].length;
            }

            var pickingColor = new Float32Array( 3 * length );
            for( var i = 0, offset = 0; i < n; ++i ){
                pickingColor.set( l.pickingColor[ i ], offset );
                offset += l.pickingColor[ i ].length;
            }

            this.bufferList.push(

                new NGL.TubeMeshBuffer(
                    position,
                    normal,
                    binormal,
                    tangent,
                    color,
                    size,
                    this.radialSegments,
                    pickingColor,
                    rx,
                    ry,
                    this.capped,
                    this.wireframe,
                    this.transparent,
                    this.side,
                    opacity,
                    this.nearClip
                )

            );
        */

    },

    update: function( what ){

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        // console.time( this.name, "update" );

        for( i = 0; i < n; ++i ){

            var fiber = this.fiberList[ i ];

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var spline = new NGL.Spline( fiber, this.arrows );

            this.bufferList[ i ].rx = this.aspectRatio;

            if( what[ "position" ] || what[ "radius" ] || what[ "scale" ] ){

                var subPos = spline.getSubdividedPosition( this.subdiv, this.tension );
                var subOri = spline.getSubdividedOrientation( this.subdiv, this.tension );
                var subSize = spline.getSubdividedSize(
                    this.subdiv, this.radius, this.scale
                );

                bufferData[ "position" ] = subPos.position;
                bufferData[ "normal" ] = subOri.normal;
                bufferData[ "binormal" ] = subOri.binormal;
                bufferData[ "tangent" ] = subOri.tangent;
                bufferData[ "size" ] = subSize.size;

            }

            if( what[ "color" ] ){

                var subCol = spline.getSubdividedColor( this.subdiv, this.color );

                bufferData[ "color" ] = subCol.color;
                bufferData[ "pickingColor" ] = subCol.pickingColor;

            }

            this.bufferList[ i ].setAttributes( bufferData );

            // if( NGL.debug ){

            //     this.debugBufferList[ i * 3 + 0 ].setAttributes( bufferData );
            //     this.debugBufferList[ i * 3 + 1 ].setAttributes( bufferData );
            //     this.debugBufferList[ i * 3 + 2 ].setAttributes( bufferData );

            // }

        };

        // console.timeEnd( this.name, "update" );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "aspectRatio" ] ){

            this.aspectRatio = params[ "aspectRatio" ];
            what[ "radius" ] = true;

        }

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "position" ] = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.RibbonRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

    this.defaultScale[ "ss" ] *= 3.0;

};

NGL.RibbonRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.RibbonRepresentation,

    type: "ribbon",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.color = p.color || "ss";
        p.radius = p.radius || "ss";
        p.scale = p.scale || 3.0;

        if( p.quality === "low" ){
            this.subdiv = 3;
        }else if( p.quality === "medium" ){
            this.subdiv = 6;
        }else if( p.quality === "high" ){
            this.subdiv = 12;
        }else{
            this.subdiv = p.subdiv || 6;
        }

        this.tension = p.tension || NaN;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subOri = spline.getSubdividedOrientation( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
            var subSize = spline.getSubdividedSize(
                scope.subdiv, scope.radius, scope.scale
            );

            scope.bufferList.push(

                new NGL.RibbonBuffer(
                    subPos.position,
                    subOri.binormal,
                    subOri.normal,
                    subCol.color,
                    subSize.size,
                    subCol.pickingColor,
                    {
                        transparent: scope.transparent,
                        side: scope.side,
                        opacity: opacity,
                        nearClip: scope.nearClip
                    }
                )

            );

            scope.fiberList.push( fiber );

        }, this.selection, true );

    },

    update: function( what ){

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        for( i = 0; i < n; ++i ){

            var fiber = this.fiberList[ i ]

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var spline = new NGL.Spline( fiber );

            if( what[ "position" ] ){

                var subPos = spline.getSubdividedPosition( this.subdiv, this.tension );
                var subOri = spline.getSubdividedOrientation( this.subdiv, this.tension );

                bufferData[ "position" ] = subPos.position;
                bufferData[ "normal" ] = subOri.binormal;
                bufferData[ "dir" ] = subOri.normal;

            }

            if( what[ "radius" ] || what[ "scale" ] ){

                var subSize = spline.getSubdividedSize(
                    this.subdiv, this.radius, this.scale
                );

                bufferData[ "size" ] = subSize.size;

            }

            if( what[ "color" ] ){

                var subCol = spline.getSubdividedColor( this.subdiv, this.color );

                bufferData[ "color" ] = subCol.color;
                bufferData[ "pickingColor" ] = subCol.pickingColor;

            }

            this.bufferList[ i ].setAttributes( bufferData );

        };

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "position" ] = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.TraceRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.TraceRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.TraceRepresentation,

    type: "trace",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        lineWidth: {
            type: "integer", max: 20, min: 1, property: "linewidth"
        },
        transparent: {
            type: "boolean", property: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0,
            uniform: true
        }

    }, NGL.Representation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.color = p.color || "ss";

        if( p.quality === "low" ){
            this.subdiv = 3;
        }else if( p.quality === "medium" ){
            this.subdiv = 6;
        }else if( p.quality === "high" ){
            this.subdiv = 12;
        }else{
            this.subdiv = p.subdiv || 6;
        }

        this.tension = p.tension || NaN;
        this.lineWidth = p.lineWidth || 1;
        this.transparent = p.transparent !== undefined ? p.transparent : false;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        var scope = this;

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );

            scope.bufferList.push(

                new NGL.TraceBuffer(
                    subPos.position,
                    subCol.color,
                    {
                        lineWidth: scope.lineWidth,
                        transparent: scope.transparent,
                        opacity: opacity,
                        nearClip: scope.nearClip
                    }
                )

            );

            scope.fiberList.push( fiber );

        }, this.selection, true );

    },

    update: function( what ){

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        for( i = 0; i < n; ++i ){

            var fiber = this.fiberList[ i ]

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var spline = new NGL.Spline( fiber );

            if( what[ "position" ] ){

                var subPos = spline.getSubdividedPosition( this.subdiv, this.tension );

                bufferData[ "position" ] = subPos.position;

            }

            if( what[ "color" ] ){

                var subCol = spline.getSubdividedColor( this.subdiv, this.color );

                bufferData[ "color" ] = subCol.color;

            }

            this.bufferList[ i ].setAttributes( bufferData );

        };

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "position" ] = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.HelixorientRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.HelixorientRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.HelixorientRepresentation,

    type: "helixorient",

    parameters: Object.assign( {

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.color = params.color || "ss";
        params.radius = params.radius || 0.15;
        params.scale = params.scale || 1.0;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        var scope = this;

        // TODO reduce buffer count as in e.g. rocket repr

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 || fiber.isNucleic() ) return;

            var helixorient = new NGL.Helixorient( fiber );
            var position = helixorient.getPosition();
            var color = helixorient.getColor( scope.color );
            var size = helixorient.getSize( scope.radius, scope.scale );

            scope.bufferList.push(

                new NGL.SphereBuffer(
                    position.center,
                    color.color,
                    size.size,
                    color.pickingColor,
                    {
                        sphereDetail: scope.sphereDetail,
                        transparent: scope.transparent,
                        side: scope.side,
                        opacity: opacity,
                        nearClip: scope.nearClip
                    },
                    scope.disableImpostor
                )

            );

            scope.bufferList.push(

                new NGL.BufferVectorHelper(
                    position.center,
                    position.axis,
                    "skyblue",
                    1
                )

            );

            scope.bufferList.push(

                new NGL.BufferVectorHelper(
                    position.center,
                    position.resdir,
                    "lightgreen",
                    1
                )

            );

            scope.fiberList.push( fiber );

        }, this.selection );

    },

    update: function( what ){

        what = what || {};

        var j;
        var i = 0;
        var n = this.fiberList.length;

        for( i = 0; i < n; ++i ){

            j = i * 3;

            var fiber = this.fiberList[ i ]

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var helixorient = new NGL.Helixorient( fiber );

            if( what[ "position" ] ){

                var position = helixorient.getPosition();

                bufferData[ "position" ] = position.center;

                this.bufferList[ j + 1 ].setAttributes( {
                    "position": position.center,
                    "vector": position.axis,
                } );
                this.bufferList[ j + 2 ].setAttributes( {
                    "position": position.center,
                    "vector": position.redir,
                } );

            }

            this.bufferList[ j ].setAttributes( bufferData );

        };

    }

} );


NGL.RocketRepresentation = function( structure, viewer, params ){

    this.helixbundleList = [];

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.RocketRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.RocketRepresentation,

    type: "rocket",

    parameters: Object.assign( {

        localAngle: {
            type: "integer", max: 180, min: 0, rebuild: true
        },
        centerDist: {
            type: "number", precision: 1, max: 10, min: 0, rebuild: true
        },
        ssBorder: {
            type: "boolean", rebuild: true
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: "impostor"
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.color = params.color || "ss";
        params.radius = params.radius || 1.5;
        params.scale = params.scale || 1.0;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.radiusSegments = 20;
        }else{
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.localAngle = params.localAngle || 30;
        this.centerDist = params.centerDist || 2.5;
        this.ssBorder = params.ssBorder === undefined ? false : params.ssBorder;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        var scope = this;

        var length = 0;
        var axisList = [];

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 || fiber.isNucleic() ) return;

            var helixbundle = new NGL.Helixbundle( fiber );
            var axis = helixbundle.getAxis(
                scope.localAngle, scope.centerDist, scope.ssBorder,
                scope.color, scope.radius, scope.scale
            );

            length += axis.size.length;
            axisList.push( axis );
            scope.helixbundleList.push( helixbundle );

        }, this.selection );

        this.axisData = {
            begin: new Float32Array( length * 3 ),
            end: new Float32Array( length * 3 ),
            size: new Float32Array( length ),
            color: new Float32Array( length * 3 ),
            pickingColor: new Float32Array( length * 3 ),
        };

        var ad = this.axisData;
        var offset = 0;

        axisList.forEach( function( axis ){

            ad.begin.set( axis.begin, offset * 3 );
            ad.end.set( axis.end, offset * 3 );
            ad.size.set( axis.size, offset );
            ad.color.set( axis.color, offset * 3 );
            ad.pickingColor.set( axis.pickingColor, offset * 3 );

            offset += axis.size.length;

        } );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            ad.begin,
            ad.end,
            ad.color,
            ad.color,
            ad.size,
            ad.pickingColor,
            ad.pickingColor,
            {
                shift: 0,
                cap: true,
                radiusSegments: this.radiusSegments,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.bufferList.push( this.cylinderBuffer );

    },

    update: function( what ){

        what = what || {};

        var scope = this;

        var cylinderData = {};

        if( what[ "position" ] ){

            this.rebuild();
            return;

        }

        if( what[ "color" ] || what[ "radius" ] || what[ "scale" ] ){

            var offset = 0;
            var ad = this.axisData;

            this.helixbundleList.forEach( function( helixbundle ){

                var axis = helixbundle.getAxis(
                    scope.localAngle, scope.centerDist, scope.ssBorder,
                    scope.color, scope.radius, scope.scale
                );

                if( what[ "color" ] ){
                    ad.color.set( axis.color, offset * 3 );
                }

                if( what[ "radius" ] || what[ "scale" ] ){
                    ad.size.set( axis.size, offset );
                }

                offset += axis.size.length;

            } );

            if( what[ "color" ] ){
                cylinderData[ "color" ] = ad.color;
                cylinderData[ "color2" ] = ad.color;
            }

            if( what[ "radius" ] || what[ "scale" ] ){
                cylinderData[ "radius" ] = ad.size;
            }

        }

        this.cylinderBuffer.setAttributes( cylinderData );

    },

    clear: function(){

        this.helixbundleList.length = 0;

        NGL.StructureRepresentation.prototype.clear.call( this );

    }

} );


NGL.RopeRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.RopeRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.RopeRepresentation,

    type: "rope",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        radialSegments: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean", rebuild: true
        },
        wireframe: {
            type: "boolean", rebuild: true
        },
        smooth: {
            type: "integer", max: 15, min: 0, rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.color = p.color || "ss";
        p.radius = p.radius || this.defaultSize;

        if( p.quality === "low" ){
            this.subdiv = 3;
            this.radialSegments = 5;
        }else if( p.quality === "medium" ){
            this.subdiv = 6;
            this.radialSegments = 10;
        }else if( p.quality === "high" ){
            this.subdiv = 12;
            this.radialSegments = 20;
        }else{
            this.subdiv = p.subdiv || 6;
            this.radialSegments = p.radialSegments || 10;
        }

        this.tension = p.tension || 0.5;
        this.capped = p.capped || true;
        this.wireframe = p.wireframe || false;
        this.smooth = p.smooth === undefined ? 2 : p.smooth;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 || fiber.isNucleic() ) return;

            var helixorient = new NGL.Helixorient( fiber );

            var spline = new NGL.Spline( helixorient.getFiber( scope.smooth, true ) );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subOri = spline.getSubdividedOrientation( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
            var subSize = spline.getSubdividedSize(
                scope.subdiv, scope.radius, scope.scale
            );

            var rx = 1.0;
            var ry = 1.0;

            scope.bufferList.push(

                new NGL.TubeMeshBuffer(
                    subPos.position,
                    subOri.normal,
                    subOri.binormal,
                    subOri.tangent,
                    subCol.color,
                    subSize.size,
                    subCol.pickingColor,
                    {
                        radialSegments: scope.radialSegments,
                        rx: rx,
                        ry: ry,
                        capped: scope.capped,
                        wireframe: scope.wireframe,
                        transparent: scope.transparent,
                        side: scope.side,
                        opacity: opacity,
                        nearClip: scope.nearClip
                    }
                )

            );

            scope.fiberList.push( fiber );

        }, this.selection );

    },

    update: function( what ){

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        for( i = 0; i < n; ++i ){

            var fiber = this.fiberList[ i ]

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var helixorient = new NGL.Helixorient( fiber );
            var spline = new NGL.Spline( helixorient.getFiber( this.smooth, true ) );

            if( what[ "position" ] || what[ "radius" ] || what[ "scale" ] ){

                var subPos = spline.getSubdividedPosition(
                    this.subdiv, this.tension
                );
                var subOri = spline.getSubdividedOrientation(
                    this.subdiv, this.tension
                );
                var subSize = spline.getSubdividedSize(
                    this.subdiv, this.radius, this.scale
                );

                bufferData[ "position" ] = subPos.position;
                bufferData[ "normal" ] = subOri.normal;
                bufferData[ "binormal" ] = subOri.binormal;
                bufferData[ "tangent" ] = subOri.tangent;
                bufferData[ "size" ] = subSize.size;

            }

            if( what[ "color" ] ){

                var subCol = spline.getSubdividedColor(
                    this.subdiv, this.color
                );

                bufferData[ "color" ] = subCol.color;
                bufferData[ "pickingColor" ] = subCol.pickingColor;

            }

            this.bufferList[ i ].setAttributes( bufferData );

        };

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "radius" ] = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.CrossingRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.CrossingRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.CrossingRepresentation,

    type: "crossing",

    parameters: Object.assign( {

        localAngle: {
            type: "integer", max: 180, min: 0, rebuild: true
        },
        centerDist: {
            type: "number", precision: 1, max: 10, min: 0, rebuild: true
        },
        ssBorder: {
            type: "boolean", rebuild: true
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: "impostor"
        },
        helixDist: {
            type: "number", precision: 1, max: 30, min: 0, rebuild: true
        },
        displayLabel: {
            type: "boolean", rebuild: true
        },
        download: {
            type: "button", methodName: "download"
        },

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.color = params.color || "ss";
        params.radius = params.radius || 0.7;
        params.scale = params.scale || 1.0;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.radiusSegments = 20;
        }else{
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.localAngle = params.localAngle || 30;
        this.centerDist = params.centerDist || 2.5;
        this.ssBorder = params.ssBorder === undefined ? false : params.ssBorder;
        this.helixDist = params.helixDist || 12;
        this.displayLabel = params.displayLabel === undefined ? true : params.displayLabel;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;

        var helixList = [];

        // TODO reduce buffer count as in e.g. rocket repr

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 || fiber.isNucleic() ) return;

            var helixbundle = new NGL.Helixbundle( fiber );
            var axis = helixbundle.getAxis(
                scope.localAngle, scope.centerDist, scope.ssBorder,
                scope.color, scope.radius, scope.scale
            );

            scope.bufferList.push(

                new NGL.CylinderBuffer(
                    axis.begin,
                    axis.end,
                    axis.color,
                    axis.color,
                    axis.size,
                    axis.pickingColor,
                    axis.pickingColor,
                    {
                        shift: 0,
                        cap: true,
                        radiusSegments: scope.radiusSegments,
                        transparent: scope.transparent,
                        side: scope.side,
                        opacity: opacity,
                        nearClip: scope.nearClip
                    },
                    scope.disableImpostor
                )

            );

            scope.fiberList.push( fiber );

            for( var i = 0; i < axis.residue.length; ++i ){

                var helix = new NGL.Helix();
                helix.fromHelixbundleAxis( axis, i );
                helixList.push( helix );

            }

        }, this.selection );

        //

        var helixCrossing = new NGL.HelixCrossing( helixList );
        var crossing = helixCrossing.getCrossing( this.helixDist );

        this.crossing = crossing;

        var n = crossing.end.length / 3;

        this.bufferList.push(

            new NGL.CylinderBuffer(
                new Float32Array( crossing.begin ),
                new Float32Array( crossing.end ),
                NGL.Utils.uniformArray3( n, 0.2, 0.2, 0.9 ),
                NGL.Utils.uniformArray3( n, 0.2, 0.2, 0.9 ),
                NGL.Utils.uniformArray( n, 0.1 ),
                NGL.Utils.uniformArray3( n, 0, 0, 0 ),
                NGL.Utils.uniformArray3( n, 0, 0, 0 ),
                {
                    shift: 0,
                    cap: true,
                    radiusSegments: this.radiusSegments,
                    transparent: this.transparent,
                    side: this.side,
                    opacity: opacity,
                    nearClip: this.nearClip
                },
                this.disableImpostor
            )

        );

        if( this.displayLabel ){

            var m = crossing.helixLabel.length;

            this.bufferList.push(

                new NGL.TextBuffer(
                    crossing.helixCenter,
                    NGL.Utils.uniformArray( m, 2.5 ),
                    NGL.Utils.uniformArray3( m, 1.0, 1.0, 1.0 ),
                    crossing.helixLabel,
                    {
                        nearClip: this.nearClip
                    }
                )

            );

        }

    },

    update: function( what ){

        this.rebuild();

    },

    download: function(){

        var json = JSON.stringify( this.crossing.info, null, '\t' );

        NGL.download(
            new Blob( [ json ], {type : 'text/plain'} ),
            "helixCrossing.json"
        );

    }

} );


NGL.ContactRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.ContactRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.ContactRepresentation,

    type: "contact",

    defaultSize: 0.25,

    parameters: Object.assign( {

        // aspectRatio: {
        //     type: "number", precision: 1, max: 10.0, min: 1.0
        // },
        // sphereDetail: {
        //     type: "integer", max: 3, min: 0, rebuild: "impostor"
        // },
        radiusSegments: {
            type: "integer", max: 50, min: 5, rebuild: "impostor"
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.radius = params.radius || this.defaultSize;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.sphereDetail = 0;
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.sphereDetail = 1;
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.sphereDetail = 2;
            this.radiusSegments = 20;
        }else{
            this.sphereDetail = params.sphereDetail || 1;
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.aspectRatio = params.aspectRatio || 1.0;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        var structureSubset = new NGL.StructureSubset(
            this.structure, this.selection.string
        );

        var contactData = NGL.polarContacts(
            structureSubset, 3.5
        );

        this.contactAtomSet = contactData.atomSet;
        this.contactBondSet = contactData.bondSet;

        var atomSet = this.contactAtomSet;
        var bondSet = this.contactBondSet;

        if( atomSet.atomCount === 0 ) return;

        var sphereScale = this.scale * this.aspectRatio;

        // this.sphereBuffer = new NGL.SphereBuffer(
        //     atomSet.atomPosition(),
        //     atomSet.atomColor( null, this.color ),
        //     atomSet.atomRadius( null, this.radius, sphereScale ),
        //     atomSet.atomColor( null, "picking" ),
        //     {
        //         sphereDetail: this.sphereDetail,
        //         transparent: this.transparent,
        //         side: this.side,
        //         opacity: opacity,
        //         nearClip: this.nearClip
        //     },
        //     this.disableImpostor
        // );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            bondSet.bondPosition( null, 0 ),
            bondSet.bondPosition( null, 1 ),
            bondSet.bondColor( null, 0, this.color ),
            bondSet.bondColor( null, 1, this.color ),
            bondSet.bondRadius( null, 0, this.radius, this.scale ),
            bondSet.bondColor( null, 0, "picking" ),
            bondSet.bondColor( null, 1, "picking" ),
            {
                shift: 0,
                cap: true,
                radiusSegments: this.radiusSegments,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip
            },
            this.disableImpostor
        );

        this.bufferList.push( /*this.sphereBuffer,*/ this.cylinderBuffer );

    },

    update: function( what ){

        what = what || {};

        var atomSet = this.contactAtomSet;
        var bondSet = this.contactBondSet;

        var sphereData = {};
        var cylinderData = {};

        if( what[ "position" ] ){

            // sphereData[ "position" ] = atomSet.atomPosition();

            var from = bondSet.bondPosition( null, 0 );
            var to = bondSet.bondPosition( null, 1 );

            cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                from, to
            );
            cylinderData[ "position1" ] = from;
            cylinderData[ "position2" ] = to;

        }

        if( what[ "color" ] ){

            // sphereData[ "color" ] = atomSet.atomColor( null, this.color );

            cylinderData[ "color" ] = bondSet.bondColor( null, 0, this.color );
            cylinderData[ "color2" ] = bondSet.bondColor( null, 1, this.color );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            // sphereData[ "radius" ] = atomSet.atomRadius(
            //     null, this.radius, this.scale * this.aspectRatio
            // );

            cylinderData[ "radius" ] = bondSet.bondRadius(
                null, 0, this.radius, this.scale
            );

        }

        // this.sphereBuffer.setAttributes( sphereData );
        this.cylinderBuffer.setAttributes( cylinderData );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "aspectRatio" ] ){

            this.aspectRatio = params[ "aspectRatio" ];
            what[ "radius" ] = true;
            what[ "scale" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    },

    clear: function(){

        if( this.contactAtomSet ) this.contactAtomSet.dispose();
        if( this.contactBondSet ) this.contactBondSet.dispose();

        NGL.StructureRepresentation.prototype.clear.call( this );

    }

} );


//////////////////////////////
// Trajectory representation

NGL.TrajectoryRepresentation = function( trajectory, viewer, params ){

    this.manualAttach = true;

    this.trajectory = trajectory;

    NGL.StructureRepresentation.call(
        this, trajectory.structure, viewer, params
    );

};

NGL.TrajectoryRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.TrajectoryRepresentation,

    type: "",

    parameters: Object.assign( {

        drawLine: {
            type: "boolean", rebuild: true
        },
        drawCylinder: {
            type: "boolean", rebuild: true
        },
        drawPoint: {
            type: "boolean", rebuild: true
        },
        drawSphere: {
            type: "boolean", rebuild: true
        },

        lineWidth: {
            type: "integer", max: 20, min: 1, rebuild: true
        },
        pointSize: {
            type: "integer", max: 20, min: 1, rebuild: true
        },
        sizeAttenuation: {
            type: "boolean", rebuild: true
        },
        sort: {
            type: "boolean", rebuild: true
        },
        transparent: {
            type: "boolean", rebuild: true
        },
        side: {
            type: "select", options: NGL.SideTypes, rebuild: true,
            int: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0,
            // FIXME should be uniform but currently incompatible
            // with the underlying Material
            rebuild: true
        },

    }, NGL.Representation.prototype.parameters ),

    init: function( params ){

        var p = params || {};

        p.color = p.color || 0xDDDDDD;

        this.drawLine = p.drawLine || true;
        this.drawCylinder = p.drawCylinder || false;
        this.drawPoint = p.drawPoint || false;
        this.drawSphere = p.drawSphere || false;

        this.lineWidth = p.lineWidth || 1;
        this.pointSize = p.pointSize || 1;
        this.sizeAttenuation = p.sizeAttenuation !== undefined ? p.sizeAttenuation : false;
        this.sort = p.sort !== undefined ? p.sort : true;
        p.transparent = p.transparent !== undefined ? p.transparent : true;
        p.side = p.side !== undefined ? p.side : THREE.DoubleSide;
        p.opacity = p.opacity !== undefined ? p.opacity : 0.6;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    attach: function(){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );

        }, this );

        this.setVisibility( this.visible );

    },

    create: function(){

        // console.log( this.selection )
        // console.log( this.atomSet )

        if( !this.atomSet.atoms.length ) return;

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;
        var index = this.atomSet.atoms[ 0 ].index;

        this.trajectory.getPath( index, function( path ){

            var n = path.length / 3;
            var tc = new THREE.Color( scope.color );

            if( scope.drawSphere ){

                var sphereBuffer = new NGL.SphereBuffer(
                    path,
                    NGL.Utils.uniformArray3( n, tc.r, tc.g, tc.b ),
                    NGL.Utils.uniformArray( n, 0.2 ),
                    NGL.Utils.uniformArray3( n, tc.r, tc.g, tc.b ),
                    {
                        sphereDetail: scope.sphereDetail,
                        transparent: scope.transparent,
                        side: scope.side,
                        opacity: opacity,
                        nearClip: scope.nearClip
                    },
                    scope.disableImpostor
                );

                scope.bufferList.push( sphereBuffer );

            }

            if( scope.drawCylinder ){

                var cylinderBuffer = new NGL.CylinderBuffer(
                    path.subarray( 0, -3 ),
                    path.subarray( 3 ),
                    NGL.Utils.uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    NGL.Utils.uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    NGL.Utils.uniformArray( n, 0.05 ),
                    NGL.Utils.uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    NGL.Utils.uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    {
                        shift: 0,
                        cap: true,
                        radiusSegments: this.radiusSegments,
                        transparent: this.transparent,
                        side: this.side,
                        opacity: opacity,
                        nearClip: scope.nearClip
                    },
                    this.disableImpostor

                );

                scope.bufferList.push( cylinderBuffer );

            }

            if( scope.drawPoint ){

                var pointBuffer = new NGL.PointBuffer(
                    path,
                    NGL.Utils.uniformArray3( n, tc.r, tc.g, tc.b ),
                    {
                        pointSize: scope.pointSize,
                        sizeAttenuation: scope.sizeAttenuation,
                        sort: scope.sort,
                        transparent: scope.transparent,
                        opacity: opacity,
                        nearClip: scope.nearClip
                    }
                );

                scope.bufferList.push( pointBuffer );

            }

            if( scope.drawLine ){

                var lineBuffer = new NGL.LineBuffer(
                    path.subarray( 0, -3 ),
                    path.subarray( 3 ),
                    NGL.Utils.uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    NGL.Utils.uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    {
                        lineWidth: scope.lineWidth,
                        transparent: scope.transparent,
                        opacity: opacity,
                        nearClip: scope.nearClip
                    }
                );

                scope.bufferList.push( lineBuffer );

            }

            scope.attach();

        } );

    }

} );


///////////////////////////
// Surface representation

NGL.SurfaceRepresentation = function( surface, viewer, params ){

    NGL.Representation.call( this, surface, viewer, params );

    this.surface = surface;

    this.create();
    this.attach();

};

NGL.SurfaceRepresentation.prototype = NGL.createObject(

    NGL.Representation.prototype, {

    constructor: NGL.SurfaceRepresentation,

    type: "",

    parameters: Object.assign( {

        wireframe: {
            type: "boolean", rebuild: true
        },
        background: {
            type: "boolean", rebuild: true
        },
        transparent: {
            type: "boolean", rebuild: true
        },
        side: {
            type: "select", options: NGL.SideTypes, rebuild: true,
            int: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0, uniform: true
        }

    }, NGL.Representation.prototype.parameters ),

    init: function( params ){

        var p = params || {};

        this.color = p.color || 0xDDDDDD;
        this.background = p.background || false;
        this.wireframe = p.wireframe || false;
        this.transparent = p.transparent !== undefined ? p.transparent : false;
        this.side = p.side !== undefined ? p.side : THREE.DoubleSide;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;

        NGL.Representation.prototype.init.call( this, p );

    },

    attach: function(){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer, undefined, this.background );

        }, this );

        this.setVisibility( this.visible );

    },

    create: function(){

        var geo;

        var object = this.surface.object;

        if( object instanceof THREE.Geometry ){

            geo = object;

            // TODO check if needed
            geo.computeFaceNormals( true );
            geo.computeVertexNormals( true );

        }else{

            geo = object.children[0].geometry;

        }

        geo.computeBoundingSphere();

        this.center = new THREE.Vector3().copy( geo.boundingSphere.center );

        var position, color, index, normal;

        if( geo instanceof THREE.BufferGeometry ){

            var an = geo.attributes.normal.array;

            // assume there are no normals if the first is zero
            if( an[ 0 ] === 0 && an[ 1 ] === 0 && an[ 2 ] === 0 ){
                geo.computeVertexNormals();
            }

            position = geo.attributes.position.array;
            index = null;
            normal = geo.attributes.normal.array;

        }else{

            // FIXME
            console.log( "TODO non BufferGeometry surface" );

            position = NGL.Utils.positionFromGeometry( geo );
            index = NGL.Utils.indexFromGeometry( geo );
            normal = NGL.Utils.normalFromGeometry( geo );

        }

        var n = position.length / 3;
        var tc = new THREE.Color( this.color );
        color = NGL.Utils.uniformArray3(
            n, tc.r, tc.g, tc.b
        );

        var opacity = this.transparent ? this.opacity : 1.0;

        if( this.transparent && this.side === THREE.DoubleSide ){

            var frontBuffer = new NGL.SurfaceBuffer(
                position, color, index, normal, undefined,
                {
                    wireframe: this.wireframe,
                    transparent: this.transparent,
                    side: THREE.FrontSide,
                    opacity: opacity,
                    nearClip: this.nearClip
                }
            );

            var backBuffer = new NGL.SurfaceBuffer(
                position, color, index, normal, undefined,
                {
                    wireframe: this.wireframe,
                    transparent: this.transparent,
                    side: THREE.BackSide,
                    opacity: opacity,
                    nearClip: this.nearClip
                }
            );

            this.bufferList.push( frontBuffer, backBuffer );

        }else{

            this.surfaceBuffer = new NGL.SurfaceBuffer(
                position, color, index, normal, undefined,
                {
                    wireframe: this.wireframe,
                    transparent: this.transparent,
                    side: this.side,
                    opacity: opacity,
                    nearClip: this.nearClip
                }
            );

            this.bufferList.push( this.surfaceBuffer );

        }

    }

} );


/////////////////////////
// Representation types

NGL.representationTypes = {};

for( var key in NGL ){

    if( NGL[ key ].prototype instanceof NGL.StructureRepresentation ){

        NGL.representationTypes[ NGL[ key ].prototype.type ] = NGL[ key ];

    }

}
