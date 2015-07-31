/**
 * @file Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.SideTypes = {};
NGL.SideTypes[ THREE.FrontSide ] = "front";
NGL.SideTypes[ THREE.BackSide ] = "back";
NGL.SideTypes[ THREE.DoubleSide ] = "double";


NGL.makeRepresentation = function( type, object, viewer, params ){

    NGL.time( "NGL.makeRepresentation " + type );

    var ReprClass;

    if( type === "buffer" ){

        ReprClass = NGL.BufferRepresentation;

    }else if( object instanceof NGL.Structure ){

        ReprClass = NGL.representationTypes[ type ];

        if( !ReprClass ){

            NGL.error(
                "NGL.makeRepresentation: representation type " + type + " unknown"
            );
            return;

        }

    }else if( object instanceof NGL.Surface || object instanceof NGL.Volume ){

        if( type === "surface" ){

            ReprClass = NGL.SurfaceRepresentation;

        }else if( type === "dot" ){

            ReprClass = NGL.DotRepresentation;

        }else{

            NGL.error(
                "NGL.makeRepresentation: representation type " + type + " unknown"
            );
            return;

        }


    }else if( object instanceof NGL.Trajectory ){

        ReprClass = NGL.TrajectoryRepresentation;

    }else{

        NGL.error(
            "NGL.makeRepresentation: object " + object + " unknown"
        );
        return;

    }

    var repr = new ReprClass( object, viewer, params );

    NGL.timeEnd( "NGL.makeRepresentation " + type );

    return repr;

};


///////////////////
// Representation

NGL.Representation = function( object, viewer, params ){

    this.viewer = viewer;

    this.queue = async.queue( this.make.bind( this ), 1 );
    this.tasks = new NGL.Counter();

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
        },
        flatShaded: {
            type: "boolean", define: "FLAT_SHADED"
        }

    },

    init: function( params ){

        var p = params || {};

        this.nearClip = p.nearClip !== undefined ? p.nearClip : true;
        this.flatShaded = p.flatShaded || false;

        this.visible = p.visible !== undefined ? p.visible : true;
        this.quality = p.quality;

    },

    setColor: function( type ){

        if( type && type !== this.color ){

            this.color = type;

            this.update( { "color": true } );

        }

        return this;

    },

    prepare: function( callback ){

        callback();

    },

    create: function(){

        // this.bufferList.length = 0;
        // this.debugBufferList.length = 0;

    },

    update: function(){

        this.build();

    },

    build: function( params ){

        // don't let tasks accumulate
        if( this.queue.length() > 0 ){

            this.tasks.change( 1 - this.queue.length() );
            this.queue.kill();

        }else{

            this.tasks.increment();

        }

        if( !params ){
            params = this.getParameters();
            delete params.quality;
        }

        this.queue.push( params );

    },

    make: function( params, callback ){

        NGL.time( "NGL.Representation.make " + this.type );

        if( params ){
            this.init( params );
        }

        this.prepare( function(){

            this.clear();
            this.create();

            if( !this.manualAttach && !this.disposed ){

                NGL.time( "NGL.Representation.attach " + this.type );

                this.attach( function(){

                    NGL.timeEnd( "NGL.Representation.attach " + this.type );

                    this.tasks.decrement();

                    callback();

                }.bind( this ) );

            }

            NGL.timeEnd( "NGL.Representation.make " + this.type );

        }.bind( this ) );

    },

    attach: function( callback ){

        this.setVisibility( this.visible );

        callback();

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

                var updateUniform = function( mesh ){

                    var u = mesh.material.uniforms;

                    if( u && u[ name ] ){

                        u[ name ].value = p[ name ];

                    }else{

                        // happens when the buffers in a repr
                        // do not suppport the same parameters

                        // NGL.info( name )

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

                var updateDefine = function( mesh ){

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

                var updateProperty = function( mesh ){

                    if( propertyName in mesh.material ){

                        mesh.material[ propertyName ] = p[ name ];

                    }else{

                        // happens when the buffers in a repr
                        // do not suppport the same parameters

                        // NGL.info( name )

                    }

                    // FIXME generalize?
                    //  add .buffer and .renderOrder to parameters?
                    if( name === "transparent" ){

                        var buffer = mesh.userData[ "buffer" ];
                        buffer.transparent = p[ name ];

                        mesh.renderOrder = buffer.getRenderOrder();

                    }

                    mesh.material.needsUpdate = true;

                }

                this.bufferList.forEach( function( buffer ){

                    buffer.group.children.forEach( updateProperty );
                    // FIXME is there a cleaner way to ensure
                    //  that picking materials are not set transparent?
                    if( buffer.pickingGroup && name !== "transparent" ){
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

            this.build();

        }else if( what && Object.keys( what ).length ){

            // update buffer attribute

            this.update( what );

        }

        return this;

    },

    getParameters: function(){

        // FIXME move specific parts to subclasses
        var params = {

            color: this.color,
            visible: this.visible,
            sele: this.selection ? this.selection.string : undefined,
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

        this.disposed = true;
        this.queue.kill();
        this.tasks.dispose();
        this.clear();

    }

};


NGL.BufferRepresentation = function( buffer, viewer, params ){

    NGL.Representation.call( this, buffer, viewer, params );

    this.buffer = buffer;

    this.build();

};

NGL.BufferRepresentation.prototype = NGL.createObject(

    NGL.Representation.prototype, {

    constructor: NGL.BufferRepresentation,

    type: "buffer",

    create: function(){

        this.bufferList.push( this.buffer );

    },

    attach: function( callback ){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );

        }, this );

        this.setVisibility( this.visible );

        callback();

    }

} );


/////////////////////////////
// Structure representation

NGL.StructureRepresentation = function( structure, viewer, params ){

    this.fiberList = [];

    this.selection = new NGL.Selection(
        params.sele, this.getAssemblySele( params.assembly, structure )
    );
    this.atomSet = new NGL.AtomSet();

    this.setStructure( structure );

    NGL.Representation.call( this, structure, viewer, params );

    if( structure.biomolDict ){
        var biomolOptions = { "__AU": "AU" };
        Object.keys( structure.biomolDict ).forEach( function( k ){
            biomolOptions[ k ] = k;
        } );
        biomolOptions[ "" ] = "";
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
    this.selection.signals.stringChanged.add( function(){
        this.build();
    }.bind( this ) );

    this.build();

};

NGL.StructureRepresentation.prototype = NGL.createObject(

    NGL.Representation.prototype, {

    constructor: NGL.StructureRepresentation,

    type: "structure",

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

        this.color = p.color !== undefined ? p.color : "element";
        this.radius = p.radius || "vdw";
        this.scale = p.scale || 1.0;
        this.transparent = p.transparent !== undefined ? p.transparent : false;
        this.side = p.side !== undefined ? p.side : THREE.DoubleSide;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;
        this.assembly = p.assembly || "";

        // TODO find a nicer way ...
        var combinedString = this.selection.combinedString;
        this.setSelection( p.sele, this.getAssemblySele( p.assembly ), true );
        if( combinedString !== this.selection.combinedString ){
            this.atomSet.applySelection();
        }

        NGL.Representation.prototype.init.call( this, p );

    },

    setStructure: function( structure ){

        this.structure = structure || this.structure;
        this.atomSet.fromStructure( this.structure, this.selection );

        return this;

    },

    getAssemblySele: function( assemblyName, structure ){

        structure = structure || this.structure;
        assemblyName = assemblyName || structure.defaultAssembly;

        var assembly = structure.biomolDict[ assemblyName ];
        var extraString = "";
        if( assembly && assembly.chainList &&
            assembly.chainList.length < structure.chainCount
        ){
            extraString = ":" + assembly.chainList.join( " OR :" );
        }

        // console.log( "getAssemblySele", extraString );

        return extraString;

    },

    setSelection: function( string, extraString, silent ){

        this.selection.setString( string, extraString, silent );

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

            what[ "radius" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        if( params && params[ "scale" ] !== undefined ){

            what[ "scale" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        if( params && params[ "assembly" ] !== undefined ){

            this.setSelection( undefined, this.getAssemblySele( params[ "assembly" ] ) );

        }

        NGL.Representation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    },

    attach: function( callback ){

        var viewer = this.viewer;
        var structure = this.structure;
        var assembly = this.assembly;

        if( assembly === "" ){
            assembly = structure.defaultAssembly;
        }

        // NGL.log( structure.biomolDict );

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

        this.bufferList.forEach( function( buffer, i, list ){

            // async to appease Chrome

            requestAnimationFrame( function(){

                if( instanceList.length >= 1 ){
                    viewer.add( buffer, instanceList );
                }else{
                    viewer.add( buffer );
                }

                if( i === list.length - 1 ){
                    callback();
                }

            }.bind( this ) );

        }.bind( this ) );

        this.debugBufferList.forEach( function( debugBuffer ){

            if( instanceList.length > 1 ){
                viewer.add( debugBuffer, instanceList );
            }else{
                viewer.add( debugBuffer );
            }

        } );

        this.setVisibility( this.visible );

        if( this.bufferList.length === 0 ) callback();

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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
            },
            this.disableImpostor
        );

        this.bufferList.push( this.sphereBuffer );

    },

    update: function( what ){

        if( this.atomSet.atomCount === 0 ) return;

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
    }, NGL.Representation.prototype.parameters, {

        nearClip: null, flatShaded: null

    } ),

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

        if( this.atomSet.atomCount === 0 ) return;

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
                // "Arial": "Arial",
                // "DejaVu": "DejaVu",
                "LatoBlack": "LatoBlack"
            },
            rebuild: true
        },
        antialias: {
            type: "boolean", define: "ANTIALIAS"
        },
        flatShaded: null

    }, NGL.StructureRepresentation.prototype.parameters, {

        side: null, flatShaded: null

    } ),

    init: function( params ){

        var p = params || {};

        p.color = p.color !== undefined ? p.color : 0xFFFFFF;

        this.labelType = p.labelType || "res";
        this.labelText = p.labelText || {};
        this.font = p.font || 'LatoBlack';
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

        if( this.atomSet.atomCount === 0 ) return;

        what = what || {};

        var textData = {};

        if( what[ "position" ] ){

            textData[ "position" ] = this.atomSet.atomPosition();

        }

        if( what[ "radius" ] || what[ "scale" ] ){

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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
            },
            this.disableImpostor
        );

        this.bufferList.push( this.sphereBuffer, this.cylinderBuffer );

    },

    update: function( what ){

        if( this.atomSet.atomCount === 0 ) return;

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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
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

    }, NGL.Representation.prototype.parameters, {

        flatShaded: null

    } ),

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

        if( this.atomSet.atomCount === 0 ) return;

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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
            },
            this.disableImpostor
        );

        this.bufferList.push( this.sphereBuffer, this.cylinderBuffer );

    },

    update: function( what ){

        if( this.atomSet.atomCount === 0 ) return;

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

                a1 = r1.getTraceAtom();
                a2 = r2.getTraceAtom();

                if( !test || ( test( a1 ) && test( a2 ) ) ){

                    baSet.addAtom( a1 );
                    bbSet.addBond( a1, a2, true );

                }

            } );

            if( !test || ( test( a1 ) && test( a2 ) ) ){

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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
            },
            this.disableImpostor
        );

        this.bufferList.push( this.sphereBuffer, this.cylinderBuffer );

    },

    update: function( what ){

        if( this.atomSet.atomCount === 0 ) return;

        what = what || {};

        var baSet = this.backboneAtomSet;
        var bbSet = this.backboneBondSet;

        if( baSet.atomCount === 0 ) return;

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

                a1 = r.getTraceAtom();

                if( bases.indexOf( r.resname ) !== -1 ){
                    a2 = r.getAtomByName( "N1" );
                }else{
                    a2 = r.getAtomByName( "N3" );
                }

                if( !test || test( a1 ) ){

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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
            },
            this.disableImpostor
        );

        this.bufferList.push( this.sphereBuffer, this.cylinderBuffer );

    },

    update: function( what ){

        if( this.atomSet.atomCount === 0 ) return;

        what = what || {};

        var baSet = this.baseAtomSet;
        var bbSet = this.baseBondSet;

        if( baSet.atomCount === 0 ) return;

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
        },
        lineWidth: {
            type: "integer", max: 20, min: 1, property: "linewidth"
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
        this.lineWidth = p.lineWidth || 1;

        NGL.StructureRepresentation.prototype.init.call( this, p );

        this.__fiberList = [];
        this.__bufferList = [];

    },

    prepare: function( callback ){

        this.__fiberList.length = 0;
        this.__bufferList.length = 0;

        if( this.atomSet.atomCount === 0 ){

            callback();
            return;

        }

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            scope.__fiberList.push( fiber );

        }, this.selection, true );

        //

        NGL.processArray(

            this.__fiberList,

            function( _i, _n, fiberList ){

                for( var i = _i; i < _n; ++i ){

                    var fiber = fiberList[ i ];

                    var spline = new NGL.Spline( fiber );
                    var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
                    var subOri = spline.getSubdividedOrientation( scope.subdiv, scope.tension );
                    var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
                    var subSize = spline.getSubdividedSize(
                        scope.subdiv, scope.radius, scope.scale
                    );

                    var rx = 1.0;
                    var ry = 1.0;

                    scope.__bufferList.push(

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
                                lineWidth: scope.lineWidth,
                                flatShaded: scope.flatShaded,
                                transparent: scope.transparent,
                                side: scope.side,
                                opacity: opacity,
                                nearClip: scope.nearClip
                            }
                        )

                    );

                }

            },

            callback,

            50

        );

    },

    create: function(){

        var n = this.__fiberList.length;

        for( var i = 0; i < n; ++i ){

            this.fiberList.push( this.__fiberList[ i ] );
            this.bufferList.push( this.__bufferList[ i ] );

        }

    },

    update: function( what ){

        if( this.atomSet.atomCount === 0 ) return;

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        // NGL.time( this.name, "update" );

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

        // NGL.timeEnd( this.name, "update" );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "tension" ] ){

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
        lineWidth: {
            type: "integer", max: 20, min: 1, property: "linewidth"
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
        this.lineWidth = p.lineWidth || 1;
        this.arrows = p.arrows || false;

        NGL.StructureRepresentation.prototype.init.call( this, p );

        this.__fiberList = [];
        this.__bufferList = [];

    },

    prepare: function( callback ){

        this.__fiberList.length = 0;
        this.__bufferList.length = 0;

        if( this.atomSet.atomCount === 0 ){

            callback();
            return;

        }

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            scope.__fiberList.push( fiber );

        }, this.selection, true );

        //

        NGL.processArray(

            this.__fiberList,

            function( _i, _n, fiberList ){

                for( var i = _i; i < _n; ++i ){

                    var fiber = fiberList[ i ];

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

                    scope.__bufferList.push(

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
                                lineWidth: scope.lineWidth,
                                flatShaded: scope.flatShaded,
                                transparent: scope.transparent,
                                side: scope.side,
                                opacity: opacity,
                                nearClip: scope.nearClip
                            }
                        )

                    );

                }

            },

            callback,

            50

        );

    },

    create: function(){

        var n = this.__fiberList.length;

        for( var i = 0; i < n; ++i ){

            this.fiberList.push( this.__fiberList[ i ] );
            this.bufferList.push( this.__bufferList[ i ] );

        }

    },

    update: function( what ){

        if( this.atomSet.atomCount === 0 ) return;

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        // NGL.time( this.name, "update" );

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

        // NGL.timeEnd( this.name, "update" );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "aspectRatio" ] ){

            what[ "radius" ] = true;

        }

        if( params && params[ "tension" ] ){

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

        this.__fiberList = [];
        this.__bufferList = [];

    },

    prepare: function( callback ){

        this.__fiberList.length = 0;
        this.__bufferList.length = 0;

        if( this.atomSet.atomCount === 0 ){

            callback();
            return;

        }

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            scope.__fiberList.push( fiber );

        }, this.selection, true );

        //

        NGL.processArray(

            this.__fiberList,

            function( _i, _n, fiberList ){

                for( var i = _i; i < _n; ++i ){

                    var fiber = fiberList[ i ];

                    var spline = new NGL.Spline( fiber );
                    var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
                    var subOri = spline.getSubdividedOrientation( scope.subdiv, scope.tension );
                    var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
                    var subSize = spline.getSubdividedSize(
                        scope.subdiv, scope.radius, scope.scale
                    );

                    scope.__bufferList.push(

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
                                nearClip: scope.nearClip,
                                flatShaded: scope.flatShaded
                            }
                        )

                    );

                }

            },

            callback,

            50

        );

    },

    create: function(){

        var n = this.__fiberList.length;

        for( var i = 0; i < n; ++i ){

            this.fiberList.push( this.__fiberList[ i ] );
            this.bufferList.push( this.__bufferList[ i ] );

        }

    },

    update: function( what ){

        if( this.atomSet.atomCount === 0 ) return;

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

    }, NGL.Representation.prototype.parameters, {

        flatShaded: null

    } ),

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

        this.__fiberList = [];
        this.__bufferList = [];

    },

    prepare: function( callback ){

        this.__fiberList.length = 0;
        this.__bufferList.length = 0;

        if( this.atomSet.atomCount === 0 ){

            callback();
            return;

        }

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            scope.__fiberList.push( fiber );

        }, this.selection, true );

        //

        NGL.processArray(

            this.__fiberList,

            function( _i, _n, fiberList ){

                for( var i = _i; i < _n; ++i ){

                    var fiber = fiberList[ i ];

                    var spline = new NGL.Spline( fiber );
                    var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
                    var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );

                    scope.__bufferList.push(

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

                }

            },

            callback,

            50

        );

    },

    create: function(){

        var n = this.__fiberList.length;

        for( var i = 0; i < n; ++i ){

            this.fiberList.push( this.__fiberList[ i ] );
            this.bufferList.push( this.__bufferList[ i ] );

        }

    },

    update: function( what ){

        if( this.atomSet.atomCount === 0 ) return;

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
                        nearClip: scope.nearClip,
                        flatShaded: scope.flatShaded
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

        if( this.atomSet.atomCount === 0 ) return;

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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
            },
            this.disableImpostor
        );

        this.bufferList.push( this.cylinderBuffer );

    },

    update: function( what ){

        if( this.atomSet.atomCount === 0 ) return;

        what = what || {};

        var scope = this;

        var cylinderData = {};

        if( what[ "position" ] ){

            this.build();
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
        lineWidth: {
            type: "integer", max: 20, min: 1, property: "linewidth"
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
        this.lineWidth = p.lineWidth || 1;
        this.smooth = p.smooth === undefined ? 2 : p.smooth;

        NGL.StructureRepresentation.prototype.init.call( this, p );

        this.__fiberList = [];
        this.__bufferList = [];

    },

    prepare: function( callback ){

        this.__fiberList.length = 0;
        this.__bufferList.length = 0;

        if( this.atomSet.atomCount === 0 ){

            callback();
            return;

        }

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 || fiber.isNucleic() ) return;

            scope.__fiberList.push( fiber );

        }, this.selection, true );

        //

        NGL.processArray(

            this.__fiberList,

            function( _i, _n, fiberList ){

                for( var i = _i; i < _n; ++i ){

                    var fiber = fiberList[ i ];

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

                    scope.__bufferList.push(

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
                                lineWidth: scope.lineWidth,
                                flatShaded: scope.flatShaded,
                                transparent: scope.transparent,
                                side: scope.side,
                                opacity: opacity,
                                nearClip: scope.nearClip
                            }
                        )

                    );

                }

            },

            callback,

            50

        );

    },

    create: function(){

        var n = this.__fiberList.length;

        for( var i = 0; i < n; ++i ){

            this.fiberList.push( this.__fiberList[ i ] );
            this.bufferList.push( this.__bufferList[ i ] );

        }

    },

    update: function( what ){

        if( this.atomSet.atomCount === 0 ) return;

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
                        nearClip: scope.nearClip,
                        flatShaded: scope.flatShaded
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
                    nearClip: this.nearClip,
                    flatShaded: this.flatShaded
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

        this.build();

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

        contactType: {
            type: "select", rebuild: true,
            options: {
                "polar": "polar",
                "polarBackbone": "polar backbone"
            }
        },
        maxDistance: {
            type: "number", precision: 1, max: 10, min: 0.1, rebuild: true
        },
        maxAngle: {
            type: "integer", max: 180, min: 0, rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.radius = params.radius || this.defaultSize;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.sphereDetail = 0;
        }else if( params.quality === "medium" ){
            this.sphereDetail = 1;
        }else if( params.quality === "high" ){
            this.sphereDetail = 2;
        }else{
            this.sphereDetail = params.sphereDetail || 1;
        }

        this.contactType = params.contactType || "polar";
        this.maxDistance = params.maxDistance || 3.5;
        this.maxAngle = params.maxAngle || 40;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        var structureSubset = new NGL.StructureSubset(
            this.structure, this.selection
        );

        var contactsFnDict = {
            "polar": NGL.polarContacts,
            "polarBackbone": NGL.polarBackboneContacts
        };

        var contactData = contactsFnDict[ this.contactType ](
            structureSubset, this.maxDistance, this.maxAngle
        );

        this.contactAtomSet = contactData.atomSet;
        this.contactBondSet = contactData.bondSet;

        var atomSet = this.contactAtomSet;
        var bondSet = this.contactBondSet;

        if( atomSet.atomCount === 0 ) return;

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
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
            },
            this.disableImpostor
        );

        this.bufferList.push( this.cylinderBuffer );

    },

    update: function( what ){

        if( what[ "position" ] ){

            // FIXME
            this.build();
            return;

        }

        //

        if( this.atomSet.atomCount === 0 ) return;

        what = what || {};

        var atomSet = this.contactAtomSet;
        var bondSet = this.contactBondSet;

        if( atomSet.atomCount === 0 ) return;

        var sphereData = {};
        var cylinderData = {};

        if( what[ "position" ] ){

            var from = bondSet.bondPosition( null, 0 );
            var to = bondSet.bondPosition( null, 1 );

            cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                from, to
            );
            cylinderData[ "position1" ] = from;
            cylinderData[ "position2" ] = to;

        }

        if( what[ "color" ] ){

            cylinderData[ "color" ] = bondSet.bondColor( null, 0, this.color );
            cylinderData[ "color2" ] = bondSet.bondColor( null, 1, this.color );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            cylinderData[ "radius" ] = bondSet.bondRadius(
                null, 0, this.radius, this.scale
            );

        }

        this.cylinderBuffer.setAttributes( cylinderData );

    },

    clear: function(){

        if( this.contactAtomSet ) this.contactAtomSet.dispose();
        if( this.contactBondSet ) this.contactBondSet.dispose();

        NGL.StructureRepresentation.prototype.clear.call( this );

    }

} );


NGL.MolecularSurfaceRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.MolecularSurfaceRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.MolecularSurfaceRepresentation,

    type: "surface",

    parameters: Object.assign( {

        surfaceType: {
            type: "select", rebuild: true,
            options: {
                "vws": "vws",
                "sas": "sas",
                "ms": "ms",
                "ses": "ses"
            }
        },
        probeRadius: {
            type: "number", precision: 1, max: 20, min: 0,
            rebuild: true
        },
        smooth: {
            type: "integer", precision: 1, max: 10, min: 0,
            rebuild: true
        },
        scaleFactor: {
            type: "number", precision: 1, max: 5, min: 0,
            rebuild: true
        },
        wireframe: {
            type: "boolean", rebuild: true
        },
        lineWidth: {
            type: "integer", max: 20, min: 1, property: "linewidth"
        },
        background: {
            type: "boolean", rebuild: true
        },
        opaqueBack: {
            type: "boolean", define: "OPAQUE_BACK"
        },
        lowResolution: {
            type: "boolean", rebuild: true
        },

    }, NGL.StructureRepresentation.prototype.parameters, {

        radiusType: null,
        radius: null,
        scale: null,

        transparent: {
            type: "boolean", rebuild: true
        },
        side: {
            type: "select", options: NGL.SideTypes, rebuild: true,
            int: true
        }

    } ),

    init: function( params ){

        var p = params || {};

        p.color = p.color !== undefined ? p.color : 0xDDDDDD;

        this.surfaceType = p.surfaceType !== undefined ? p.surfaceType : "ms";
        this.probeRadius = p.probeRadius !== undefined ? p.probeRadius : 1.4;
        this.smooth = p.smooth !== undefined ? p.smooth : 2;
        this.scaleFactor = p.scaleFactor !== undefined ? p.scaleFactor : 2.0;
        this.background = p.background || false;
        this.wireframe = p.wireframe || false;
        this.lineWidth = p.lineWidth || 1;
        this.transparent = p.transparent !== undefined ? p.transparent : false;
        this.opaqueBack = p.opaqueBack !== undefined ? p.opaqueBack : true;
        this.side = p.side !== undefined ? p.side : THREE.DoubleSide;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;
        this.lowResolution = p.lowResolution !== undefined ? p.lowResolution : false;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    prepare: function( callback ){

        if( !this.molsurf || this.__forceNewMolsurf ||
            this.__sele !== this.selection.combinedString
        ){

            if( this.molsurf ) this.molsurf.dispose();

            this.molsurf = new NGL.MolecularSurface( this.atomSet );
            this.__forceNewMolsurf = false;
            this.__sele = this.selection.combinedString;

        }

        this.molsurf.generateSurfaceWorker(
            this.surfaceType, this.probeRadius,
            this.scaleFactor, this.smooth,
            this.lowResolution, callback
        );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var position = this.molsurf.getPosition();
        var color = this.molsurf.getColor( this.color );
        var normal = this.molsurf.getNormal();
        var index = this.molsurf.getIndex();

        var opacity = this.transparent ? this.opacity : 1.0;

        if( this.transparent && this.side === THREE.DoubleSide ){

            var frontBuffer = new NGL.SurfaceBuffer(
                position, color, index, normal, undefined,
                {
                    background: this.background,
                    wireframe: this.wireframe,
                    lineWidth: this.lineWidth,
                    transparent: this.transparent,
                    opaqueBack: this.opaqueBack,
                    side: THREE.FrontSide,
                    opacity: opacity,
                    nearClip: this.nearClip,
                    flatShaded: this.flatShaded
                }
            );

            var backBuffer = new NGL.SurfaceBuffer(
                position, color, index, normal, undefined,
                {
                    background: this.background,
                    wireframe: this.wireframe,
                    lineWidth: this.lineWidth,
                    transparent: this.transparent,
                    opaqueBack: this.opaqueBack,
                    side: THREE.BackSide,
                    opacity: opacity,
                    nearClip: this.nearClip,
                    flatShaded: this.flatShaded
                }
            );

            this.bufferList.push( backBuffer, frontBuffer );

        }else{

            var surfaceBuffer = new NGL.SurfaceBuffer(
                position, color, index, normal, undefined,
                {
                    background: this.background,
                    wireframe: this.wireframe,
                    lineWidth: this.lineWidth,
                    transparent: this.transparent,
                    opaqueBack: this.opaqueBack,
                    side: this.side,
                    opacity: opacity,
                    nearClip: this.nearClip,
                    flatShaded: this.flatShaded
                }
            );

            this.bufferList.push( surfaceBuffer );

        }

    },

    update: function( what ){

        what = what || {};

        var surfaceData = {};

        if( what[ "position" ] ){

            this.__forceNewMolsurf = true;
            this.build();
            return;

        }

        if( what[ "color" ] ){

            surfaceData[ "color" ] = this.molsurf.getColor( this.color );

        }

        this.bufferList.forEach( function( buffer ){

            buffer.setAttributes( surfaceData );

        } );

    },

    setParameters: function( params, what, rebuild ){

        what = what || {};

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    },

    clear: function(){

        NGL.StructureRepresentation.prototype.clear.call( this );

    },

    dispose: function(){

        if( this.molsurf ) this.molsurf.dispose();

        NGL.StructureRepresentation.prototype.dispose.call( this );

    }

} );


NGL.DistanceRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.DistanceRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.DistanceRepresentation,

    type: "distance",

    defaultSize: 0.15,

    parameters: Object.assign( {

        font: {
            type: "select", options: {
                // "Arial": "Arial",
                // "DejaVu": "DejaVu",
                "LatoBlack": "LatoBlack"
            },
            rebuild: true
        },
        labelSize: {
            type: "number", precision: 3, max: 10.0, min: 0.001
        },
        labelColor: {
            type: "color"
        },
        antialias: {
            type: "boolean", define: "ANTIALIAS"
        },
        atomPair: {
            type: "hidden"
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: "impostor"
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};

        p.radius = p.radius || this.defaultSize;

        this.disableImpostor = p.disableImpostor || false;

        if( p.quality === "low" ){
            this.radiusSegments = 5;
        }else if( p.quality === "medium" ){
            this.radiusSegments = 10;
        }else if( p.quality === "high" ){
            this.radiusSegments = 20;
        }else{
            this.radiusSegments = p.radiusSegments || 10;
        }

        this.font = p.font || 'LatoBlack';
        this.labelSize = p.labelSize || 1.0;
        this.labelColor = p.labelColor || 0xFFFFFF;
        this.antialias = p.antialias !== undefined ? p.antialias : true;
        this.atomPair = p.atomPair || [];

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        if( this.atomSet.atomCount === 0 ) return;

        var opacity = this.transparent ? this.opacity : 1.0;

        var n = this.atomPair.length;
        if( n === 0 ) return;

        var text = new Array( n );
        var position = new Float32Array( n * 3 );
        var sele1 = new NGL.Selection();
        var sele2 = new NGL.Selection();

        this.bondSet = new NGL.BondSet();
        this.bondSet.structure = this.structure;
        var bSet = this.bondSet;

        this.atomPair.forEach( function( pair, i ){

            var i3 = i * 3;

            sele1.setString( pair[ 0 ] );
            sele2.setString( pair[ 1 ] );

            var a1 = this.atomSet.getAtoms( sele1, true );
            var a2 = this.atomSet.getAtoms( sele2, true );

            bSet.addBond( a1, a2, true );

            text[ i ] = a1.distanceTo( a2 ).toFixed( 2 );

            position[ i3 + 0 ] = ( a1.x + a2.x ) / 2;
            position[ i3 + 1 ] = ( a1.y + a2.y ) / 2;
            position[ i3 + 2 ] = ( a1.z + a2.z ) / 2;

        }, this );

        var c = new THREE.Color( this.labelColor );

        this.textBuffer = new NGL.TextBuffer(
            position,
            NGL.Utils.uniformArray( n, this.labelSize ),
            NGL.Utils.uniformArray3( n, c.r, c.g, c.b ),
            text,
            {
                font: this.font,
                antialias: this.antialias,
                opacity: opacity,
                nearClip: this.nearClip
            }
        );

        this.__center = new Float32Array( bSet.bondCount * 3 );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            bSet.bondPosition( null, 0 ),
            bSet.bondPosition( null, 1 ),
            bSet.bondColor( null, 0, this.color ),
            bSet.bondColor( null, 1, this.color ),
            bSet.bondRadius( null, null, this.radius, this.scale ),
            bSet.bondColor( null, 0, "picking" ),
            bSet.bondColor( null, 1, "picking" ),
            {
                shift: 0,
                cap: true,
                radiusSegments: this.radiusSegments,
                transparent: this.transparent,
                side: this.side,
                opacity: opacity,
                nearClip: this.nearClip,
                flatShaded: this.flatShaded
            },
            this.disableImpostor
        );

        this.bufferList.push( this.textBuffer, this.cylinderBuffer );

    },

    update: function( what ){

        if( this.atomSet.atomCount === 0 ) return;

        var n = this.atomPair.length;
        if( n === 0 ) return;

        what = what || {};

        var bSet = this.bondSet;

        var textData = {};
        var cylinderData = {};

        if( what[ "position" ] ){

            var position = new Float32Array( n * 3 );
            var sele1 = new NGL.Selection();
            var sele2 = new NGL.Selection();

            this.atomPair.forEach( function( pair, i ){

                var i3 = i * 3;

                sele1.setString( pair[ 0 ] );
                sele2.setString( pair[ 1 ] );

                var a1 = this.atomSet.getAtoms( sele1, true );
                var a2 = this.atomSet.getAtoms( sele2, true );

                position[ i3 + 0 ] = ( a1.x + a2.x ) / 2;
                position[ i3 + 1 ] = ( a1.y + a2.y ) / 2;
                position[ i3 + 2 ] = ( a1.z + a2.z ) / 2;

            }, this );

            textData[ "position" ] = position;

            //

            var from = bSet.bondPosition( null, 0 );
            var to = bSet.bondPosition( null, 1 );

            cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                from, to
            );
            cylinderData[ "position1" ] = from;
            cylinderData[ "position2" ] = to;

        }

        if( what[ "labelSize" ] ){

            textData[ "size" ] = NGL.Utils.uniformArray(
                n, this.labelSize
            );

        }

        if( what[ "labelColor" ] ){

            var c = new THREE.Color( this.labelColor );
            textData[ "color" ] = NGL.Utils.uniformArray3(
                n, c.r, c.g, c.b
            );

        }

        if( what[ "color" ] ){

            cylinderData[ "color" ] = bSet.bondColor( null, 0, this.color );
            cylinderData[ "color2" ] = bSet.bondColor( null, 1, this.color );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            cylinderData[ "radius" ] = bSet.bondRadius(
                null, 0, this.radius, this.scale
            );

        }

        this.textBuffer.setAttributes( textData );
        this.cylinderBuffer.setAttributes( cylinderData );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "labelSize" ] ){

            what[ "labelSize" ] = true;

        }

        if( params && params[ "labelColor" ] ){

            what[ "labelColor" ] = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

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

    attach: function( callback ){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );

        }, this );

        this.setVisibility( this.visible );

        callback();

    },

    prepare: function( callback ){

        // TODO

        callback();

    },

    create: function(){

        // NGL.log( this.selection )
        // NGL.log( this.atomSet )

        if( this.atomSet.atomCount === 0 ) return;

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
                        nearClip: scope.nearClip,
                        flatShaded: scope.flatShaded
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
                        nearClip: scope.nearClip,
                        flatShaded: scope.flatShaded
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
                        nearClip: scope.nearClip,
                        flatShaded: scope.flatShaded
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
                        nearClip: scope.nearClip,
                        flatShaded: scope.flatShaded
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

    this.build();

};

NGL.SurfaceRepresentation.prototype = NGL.createObject(

    NGL.Representation.prototype, {

    constructor: NGL.SurfaceRepresentation,

    type: "surface",

    parameters: Object.assign( {

        isolevelType: {
            type: "select", rebuild: true, options: {
                "value": "value", "sigma": "sigma"
            }
        },
        isolevel: {
            type: "number", precision: 2, max: 1000, min: -1000,
            rebuild: true
        },
        smooth: {
            type: "integer", precision: 1, max: 10, min: 0,
            rebuild: true
        },
        wireframe: {
            type: "boolean", rebuild: true
        },
        lineWidth: {
            type: "integer", max: 20, min: 1, property: "linewidth"
        },
        background: {
            type: "boolean", rebuild: true
        },
        transparent: {
            type: "boolean", rebuild: true
        },
        opaqueBack: {
            type: "boolean", define: "OPAQUE_BACK"
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
        this.isolevelType  = p.isolevelType !== undefined ? p.isolevelType : "sigma";
        this.isolevel = p.isolevel !== undefined ? p.isolevel : 2.0;
        this.smooth = p.smooth !== undefined ? p.smooth : 0;
        this.background = p.background || false;
        this.wireframe = p.wireframe || false;
        this.lineWidth = p.lineWidth || 1;
        this.transparent = p.transparent !== undefined ? p.transparent : false;
        this.opaqueBack = p.opaqueBack !== undefined ? p.opaqueBack : true;
        this.side = p.side !== undefined ? p.side : THREE.DoubleSide;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;

        NGL.Representation.prototype.init.call( this, p );

    },

    attach: function( callback ){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );

        }, this );

        this.setVisibility( this.visible );

        callback();

    },

    prepare: function( callback ){

        if( this.surface instanceof NGL.Volume ){

            var isolevel;

            if( this.isolevelType === "sigma" ){

                isolevel = this.surface.getIsolevelForSigma( this.isolevel );

            }else{

                isolevel = this.isolevel;

            }

            this.surface.generateSurfaceWorker(
                isolevel, this.smooth, callback
            );

        }else{

            callback();

        }

    },

    create: function(){

        var position = this.surface.getPosition();
        var color = this.surface.getColor( this.color );
        var normal = this.surface.getNormal();
        var index = this.surface.getIndex();

        var opacity = this.transparent ? this.opacity : 1.0;

        if( this.transparent && this.side === THREE.DoubleSide ){

            var frontBuffer = new NGL.SurfaceBuffer(
                position, color, index, normal, undefined,
                {
                    background: this.background,
                    wireframe: this.wireframe,
                    lineWidth: this.lineWidth,
                    transparent: this.transparent,
                    opaqueBack: this.opaqueBack,
                    side: THREE.FrontSide,
                    opacity: opacity,
                    nearClip: this.nearClip,
                    flatShaded: this.flatShaded
                }
            );

            var backBuffer = new NGL.SurfaceBuffer(
                position, color, index, normal, undefined,
                {
                    background: this.background,
                    wireframe: this.wireframe,
                    lineWidth: this.lineWidth,
                    transparent: this.transparent,
                    opaqueBack: this.opaqueBack,
                    side: THREE.BackSide,
                    opacity: opacity,
                    nearClip: this.nearClip,
                    flatShaded: this.flatShaded
                }
            );

            this.bufferList.push( backBuffer, frontBuffer );

        }else{

            var surfaceBuffer = new NGL.SurfaceBuffer(
                position, color, index, normal, undefined,
                {
                    background: this.background,
                    wireframe: this.wireframe,
                    lineWidth: this.lineWidth,
                    transparent: this.transparent,
                    opaqueBack: this.opaqueBack,
                    side: this.side,
                    opacity: opacity,
                    nearClip: this.nearClip,
                    flatShaded: this.flatShaded
                }
            );

            this.bufferList.push( surfaceBuffer );

        }

    },

    update: function( what ){

        what = what || {};

        var surfaceData = {};

        if( what[ "color" ] ){

            surfaceData[ "color" ] = this.surface.getColor( this.color );

        }

        this.bufferList.forEach( function( buffer ){

            buffer.setAttributes( surfaceData );

        } );

    },

    setParameters: function( params, what, rebuild ){

        if( params && params[ "isolevelType" ] !== undefined &&
            this.surface instanceof NGL.Volume
        ){

            if( this.isolevelType === "value" &&
                params[ "isolevelType" ] === "sigma"
            ){

                this.isolevel = this.surface.getSigmaForIsolevel(
                    this.isolevel
                );

            }else if( this.isolevelType === "sigma" &&
                params[ "isolevelType" ] === "value"
            ){

                this.isolevel = this.surface.getIsolevelForSigma(
                    this.isolevel
                );

            }

            this.isolevelType = params[ "isolevelType" ];

        }

        NGL.Representation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.DotRepresentation = function( surface, viewer, params ){

    NGL.Representation.call( this, surface, viewer, params );

    this.surface = surface;

    this.build();

};

NGL.DotRepresentation.prototype = NGL.createObject(

    NGL.Representation.prototype, {

    constructor: NGL.DotRepresentation,

    type: "dot",

    parameters: Object.assign( {

        minValue: {
            type: "number", precision: 3, max: 1000, min: -1000, rebuild: true
        },
        maxValue: {
            type: "number", precision: 3, max: 1000, min: -1000, rebuild: true
        },
        dotType: {
            type: "select", rebuild: true, options: {
                "": "",
                "sphere": "sphere",
                "point": "point"
            }
        },
        radiusType: {
            type: "select", options: {
                "": "",
                "value": "value",
                "value-min": "value-min",
                "deviation": "deviation",
                "size": "size"
            }
        },
        radius: {
            type: "number", precision: 3, max: 10.0, min: 0.001, property: "size"
        },
        scale: {
            type: "number", precision: 3, max: 10.0, min: 0.001
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: "impostor"
        },
        transparent: {
            type: "boolean", property: true
        },
        side: {
            type: "select", options: NGL.SideTypes, property: true,
            int: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0, uniform: true
        }

    }, NGL.Representation.prototype.parameters ),

    defaultSize: 0.1,

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

        this.color = p.color || 0xDDDDDD;
        // this.minValue = p.minValue !== undefined ? p.minValue : -Infinity;
        this.minValue = p.minValue !== undefined ? p.minValue : NaN;
        this.maxValue = p.maxValue !== undefined ? p.maxValue : Infinity;
        this.dotType = p.dotType !== undefined ? p.dotType : "point";
        this.radius = p.radius !== undefined ? p.radius : 0.1;
        this.scale = p.scale !== undefined ? p.scale : 1.0;
        this.transparent = p.transparent !== undefined ? p.transparent : false;
        this.side = p.side !== undefined ? p.side : THREE.DoubleSide;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;

        NGL.Representation.prototype.init.call( this, p );

    },

    attach: function( callback ){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );

        }, this );

        this.setVisibility( this.visible );

        callback();

    },

    create: function(){

        this.surface.filterData( this.minValue, this.maxValue );

        var opacity = this.transparent ? this.opacity : 1.0;

        if( this.dotType === "sphere" ){

            this.dotBuffer = new NGL.SphereBuffer(
                this.surface.getDataPosition(),
                this.surface.getDataColor( this.color ),
                this.surface.getDataSize( this.radius, this.scale ),
                undefined,
                {
                    sphereDetail: this.sphereDetail,
                    transparent: this.transparent,
                    side: this.side,
                    opacity: opacity,
                    nearClip: this.nearClip,
                    flatShaded: this.flatShaded
                },
                this.disableImpostor
            );

        }else{

            this.dotBuffer = new NGL.PointBuffer(
                this.surface.getDataPosition(),
                this.surface.getDataColor( this.color ),
                {
                    pointSize: this.radius,
                    sizeAttenuation: true,  // this.sizeAttenuation,
                    sort: false,  // this.sort,
                    transparent: true,  // this.transparent,
                    opacity: opacity,
                    nearClip: this.nearClip
                }
            );

        }

        this.bufferList.push( this.dotBuffer );

    },

    update: function( what ){

        what = what || {};

        var dotData = {};

        if( what[ "color" ] ){

            dotData[ "color" ] = this.surface.getDataColor( this.color );

        }

        if( this.dotType === "sphere" && ( what[ "radius" ] || what[ "scale" ] ) ){

            dotData[ "radius" ] = this.surface.getDataSize(
                this.radius, this.scale
            );

        }

        this.dotBuffer.setAttributes( dotData );

    },

    setParameters: function( params, what, rebuild ){

        what = what || {};

        if( params && params[ "radiusType" ] !== undefined ){

            if( params[ "radiusType" ] === "radius" ){
                this.radius = this.defaultSize;
            }else{
                this.radius = params[ "radiusType" ];
            }
            what[ "radius" ] = true;
            if( this.dotType === "sphere" &&
                ( !NGL.extensionFragDepth || this.disableImpostor )
            ){
                rebuild = true;
            }

        }

        if( params && params[ "radius" ] !== undefined ){

            what[ "radius" ] = true;
            if( this.dotType === "sphere" &&
                ( !NGL.extensionFragDepth || this.disableImpostor )
            ){
                rebuild = true;
            }

        }

        if( params && params[ "scale" ] !== undefined ){

            what[ "scale" ] = true;
            if( this.dotType === "sphere" &&
                ( !NGL.extensionFragDepth || this.disableImpostor )
            ){
                rebuild = true;
            }

        }

        NGL.Representation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


/////////////////////////
// Representation types

( function(){

    NGL.representationTypes = {};
    var reprList = [];

    // find structure representations

    for( var key in NGL ){

        var val = NGL[ key ];

        if( val.prototype instanceof NGL.StructureRepresentation &&
            val.prototype.type
        ){

            reprList.push( val );

        }

    }

    // sort by representation type (i.e. name)

    reprList.sort( function( a, b ){

            return a.prototype.type.localeCompare( b.prototype.type );

    } ).forEach( function( repr ){

        NGL.representationTypes[ repr.prototype.type ] = repr;

    } );

} )();
