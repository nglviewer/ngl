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

    this.debugBufferList = [];

    this.init( params );

};

NGL.Representation.prototype = {

    type: "",

    parameters: {},

    init: function( params ){

        params = params || {};

        this.visible = params.visible === undefined ? true : params.visible;
        this.quality = params.quality;

    },

    setColor: function( type ){

        if( type && type !== this.color ){

            this.color = type;

            this.update({ "color": true });

        }

        return this;

    },

    create: function(){

        this.bufferList = [];

    },

    update: function(){

        this.rebuild();

    },

    rebuild: function( params ){

        if( params ){
            this.init( params );
        }

        this.dispose();
        this.create();
        this.attach();

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

        if( rebuild ){

            this.rebuild();

        }else if( what && Object.keys( what ).length ){

            this.update( what );

        }

        return this;

    },

    getParameters: function(){

        // TODO
        var params = {

            color: this.color,
            radius: this.radius,
            scale: this.scale,
            visible: this.visible,
            sele: this.selection.string,
            disableImpostor: this.disableImpostor,
            quality: this.quality

        };

        Object.keys( this.parameters ).forEach( function( name ){

            params[ name ] = this[ name ];

        }, this );

        return params;

    },

    dispose: function(){

        this.bufferList.forEach( function( buffer ){

            this.viewer.remove( buffer );
            buffer.dispose();
            buffer = null;  // aid GC

        }, this );

        this.bufferList = [];

        this.debugBufferList.forEach( function( debugBuffer ){

            this.viewer.remove( debugBuffer );
            debugBuffer.dispose();
            debugBuffer = null;  // aid GC

        }, this );

        this.debugBufferList = [];

    }

};


/////////////////////////////
// Structure representation

NGL.StructureRepresentation = function( structure, viewer, params ){

    this.selection = new NGL.Selection( params.sele );

    this.setStructure( structure );

    NGL.Representation.call( this, structure, viewer, params );

    // must come after atomSet to ensure selection change signals
    // have already updated the atomSet
    this.selection.signals.stringChanged.add( function( string ){

        this.rebuild();

    }, this );

    this.create();
    this.attach();

};

NGL.StructureRepresentation.prototype = NGL.createObject(

    NGL.Representation.prototype, {

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

    }, NGL.Representation.prototype.parameters ),

    defaultScale: {
        "vdw": 1.0,
        "covalent": 1.0,
        "bfactor": 0.01,
        "ss": 1.0
    },

    defaultSize: 1.0,

    init: function( params ){

        params = params || {};

        this.color = params.color === undefined ? "element" : params.color;
        this.radius = params.radius || "vdw";
        this.scale = params.scale || 1.0;

        this.setSelection( params.sele, true );

        NGL.Representation.prototype.init.call( this, params );

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

        if( params && params[ "radiusType" ]!==undefined ){

            if( params[ "radiusType" ] === "size" ){
                this.radius = this.defaultSize;
            }else{
                this.radius = params[ "radiusType" ];
            }
            what[ "radius" ] = true;

        }

        if( params && params[ "radius" ]!==undefined ){

            this.radius = params[ "radius" ];
            what[ "radius" ] = true;

        }

        if( params && params[ "scale" ]!==undefined ){

            this.scale = params[ "scale" ];
            what[ "scale" ] = true;

        }

        NGL.Representation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    },

    attach: function(){

        var viewer = this.viewer;
        var structure = this.structure;

        // console.log( structure.biomolDict )
        // console.log( Object.values( structure.biomolDict[ 1 ].matrixDict ) );

        var matrixList;

        // TODO
        if( structure.biomolDict && structure.biomolDict[ 1 ] ){
            matrixList = Object.values( structure.biomolDict[ 1 ].matrixDict )//.slice(0,5);
        }else{
            matrixList = [];
        }

        this.bufferList.forEach( function( buffer ){

            if( matrixList.length > 1 ){
                viewer.add( buffer, matrixList );
            }else{
                viewer.add( buffer );
            }

        } );

        this.debugBufferList.forEach( function( debugBuffer ){

            if( matrixList.length > 1 ){
                viewer.add( debugBuffer, matrixList );
            }else{
                viewer.add( debugBuffer );
            }

        } );

        this.setVisibility( this.visible );

    }

} );


NGL.SpacefillRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.SpacefillRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "spacefill",

    parameters: Object.assign( {

        sphereDetail: {
            type: "integer", max: 3, min: 0
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};

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

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        this.sphereBuffer = new NGL.SphereBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.atomSet.atomRadius( null, this.radius, this.scale ),
            this.atomSet.atomColor( null, "picking" ),
            this.sphereDetail,
            this.disableImpostor
        );

        this.bufferList = [ this.sphereBuffer ];

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

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "sphereDetail" ]!==undefined ){

            this.sphereDetail = params[ "sphereDetail" ];
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.LabelRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.LabelRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "label",

    parameters: Object.assign( {

        labelType: {
            type: "select", options: NGL.LabelFactory.types
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};

        params.color = params.color || 0xFFFFFF;

        this.labelType = params.labelType || "res";

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var text = [];
        var labelFactory = new NGL.LabelFactory( this.labelType );

        this.atomSet.eachAtom( function( a ){

            text.push( labelFactory.atomLabel( a ) );

        } );

        this.textBuffer = new NGL.TextBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomRadius( null, this.radius, this.scale ),
            this.atomSet.atomColor( null, this.color ),
            text
        );

        this.bufferList = [ this.textBuffer ];

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

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "labelType" ] ){

            this.labelType = params[ "labelType" ];
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.BallAndStickRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.BallAndStickRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "ball+stick",

    defaultSize: 0.15,

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5
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

        this.sphereBuffer = new NGL.SphereBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.atomSet.atomRadius(
                null, this.radius, this.scale * this.aspectRatio
            ),
            this.atomSet.atomColor( null, "picking" ),
            this.sphereDetail,
            this.disableImpostor
        );

        this.__center = new Float32Array( this.atomSet.bondCount * 3 );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            this.atomSet.bondPosition( null, 0 ),
            this.atomSet.bondPosition( null, 1 ),
            this.atomSet.bondColor( null, 0, this.color ),
            this.atomSet.bondColor( null, 1, this.color ),
            this.atomSet.bondRadius( null, null, this.radius, this.scale ),
            null,
            null,
            this.atomSet.bondColor( null, 0, "picking" ),
            this.atomSet.bondColor( null, 1, "picking" ),
            this.radiusSegments,
            this.disableImpostor
        );

        this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

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

        }

        if( params && params[ "sphereDetail" ]!==undefined ){

            this.sphereDetail = params[ "sphereDetail" ];
            rebuild = true;

        }

        if( params && params[ "radiusSegments" ] ){

            this.radiusSegments = params[ "radiusSegments" ];
            rebuild = true;

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

    type: "licorice",

    defaultSize: 0.15,

    parameters: Object.assign( {

        sphereDetail: {
            type: "integer", max: 3, min: 0
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5
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

        this.sphereBuffer = new NGL.SphereBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.atomSet.atomRadius( null, this.radius, this.scale ),
            this.atomSet.atomColor( null, "picking" ),
            this.sphereDetail,
            this.disableImpostor
        );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            this.atomSet.bondPosition( null, 0 ),
            this.atomSet.bondPosition( null, 1 ),
            this.atomSet.bondColor( null, 0, this.color ),
            this.atomSet.bondColor( null, 1, this.color ),
            this.atomSet.bondRadius( null, null, this.radius, this.scale ),
            null,
            null,
            this.atomSet.bondColor( null, 0, "picking" ),
            this.atomSet.bondColor( null, 1, "picking" ),
            this.radiusSegments,
            this.disableImpostor
        );

        this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

    },

    update: function( what ){

        this.aspectRatio = 1.0;

        NGL.BallAndStickRepresentation.prototype.update.call( this, what );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "sphereDetail" ]!==undefined ){

            this.sphereDetail = params[ "sphereDetail" ];
            rebuild = true;

        }

        if( params && params[ "radiusSegments" ] ){

            this.radiusSegments = params[ "radiusSegments" ];
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.LineRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.LineRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "line",

    parameters: Object.assign( {}, NGL.Representation.prototype.parameters ),

    create: function(){

        this.lineBuffer = new NGL.LineBuffer(
            this.atomSet.bondPosition( null, 0 ),
            this.atomSet.bondPosition( null, 1 ),
            this.atomSet.bondColor( null, 0, this.color ),
            this.atomSet.bondColor( null, 1, this.color )
        );

        this.bufferList = [ this.lineBuffer ];

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

    type: "hyperball",

    parameters: Object.assign( {

        shrink: {
            type: "number", precision: 3, max: 1.0, min: 0.001
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.scale = params.scale || 0.2;

        this.shrink = params.shrink || 0.12;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        this.sphereBuffer = new NGL.SphereBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.atomSet.atomRadius( null, this.radius, this.scale ),
            this.atomSet.atomColor( null, "picking" )
        );

        this.__center = new Float32Array( this.atomSet.bondCount * 3 );

        this.cylinderBuffer = new NGL.HyperballStickBuffer(
            this.atomSet.bondPosition( null, 0 ),
            this.atomSet.bondPosition( null, 1 ),
            this.atomSet.bondColor( null, 0, this.color ),
            this.atomSet.bondColor( null, 1, this.color ),
            this.atomSet.bondRadius( null, 0, this.radius, this.scale ),
            this.atomSet.bondRadius( null, 1, this.radius, this.scale ),
            this.shrink,
            this.atomSet.bondColor( null, 0, "picking" ),
            this.atomSet.bondColor( null, 1, "picking" )
        );

        this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

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

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "shrink" ] ){

            this.shrink = params[ "shrink" ];
            this.cylinderBuffer.uniforms[ "shrink" ].value = this.shrink;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.BackboneRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.BackboneRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "backbone",

    defaultSize: 0.25,

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5
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

        var backboneAtomSet, backboneBondSet;
        var sphereBuffer, cylinderBuffer;

        var bufferList = [];
        var atomSetList = [];
        var bondSetList = [];

        var color = this.color;
        var radius = this.radius;
        var scale = this.scale;
        var aspectRatio = this.aspectRatio;
        var sphereDetail = this.sphereDetail;
        var radiusSegments = this.radiusSegments;
        var test = this.selection.test;
        var disableImpostor = this.disableImpostor;

        this.structure.eachFiber( function( f ){

            if( f.residueCount < 2 ) return;

            backboneAtomSet = new NGL.AtomSet();
            backboneBondSet = new NGL.BondSet();

            backboneAtomSet.structure = f.structure;
            backboneBondSet.structure = f.structure;

            atomSetList.push( backboneAtomSet );
            bondSetList.push( backboneBondSet );

            var a1, a2;

            f.eachResidueN( 2, function( r1, r2 ){

                a1 = r1.getAtomByName( f.traceAtomname );
                a2 = r2.getAtomByName( f.traceAtomname );

                if( test( a1 ) && test( a2 ) ){

                    backboneAtomSet.addAtom( a1 );
                    backboneBondSet.addBond( a1, a2, true );

                }

            } );

            if( test( a1 ) && test( a2 ) ){

                backboneAtomSet.addAtom( a2 );

            }

            sphereBuffer = new NGL.SphereBuffer(
                backboneAtomSet.atomPosition(),
                backboneAtomSet.atomColor( null, color ),
                backboneAtomSet.atomRadius( null, radius, scale * aspectRatio ),
                backboneAtomSet.atomColor( null, "picking" ),
                sphereDetail,
                disableImpostor
            );

            cylinderBuffer = new NGL.CylinderBuffer(
                backboneBondSet.bondPosition( null, 0 ),
                backboneBondSet.bondPosition( null, 1 ),
                backboneBondSet.bondColor( null, 0, color ),
                backboneBondSet.bondColor( null, 1, color ),
                backboneBondSet.bondRadius( null, 0, radius, scale ),
                null,
                null,
                backboneBondSet.bondColor( null, 0, "picking" ),
                backboneBondSet.bondColor( null, 1, "picking" ),
                radiusSegments,
                disableImpostor
            );

            bufferList.push( sphereBuffer )
            bufferList.push( cylinderBuffer );

        } );

        this.bufferList = bufferList;
        this.atomSetList = atomSetList;
        this.bondSetList = bondSetList;

    },

    update: function( what ){

        what = what || {};

        var backboneAtomSet, backboneBondSet;
        var sphereBuffer, cylinderBuffer;
        var sphereData, cylinderData;

        var i;
        var color = this.color;
        var n = this.atomSetList.length;

        for( i = 0; i < n; ++i ){

            backboneAtomSet = this.atomSetList[ i ];
            backboneBondSet = this.bondSetList[ i ];

            sphereBuffer = this.bufferList[ i * 2 ];
            cylinderBuffer = this.bufferList[ i * 2 + 1 ];

            sphereData = {};
            cylinderData = {};

            if( what[ "position" ] ){

                sphereData[ "position" ] = backboneAtomSet.atomPosition();

                var from = backboneBondSet.bondPosition( null, 0 );
                var to = backboneBondSet.bondPosition( null, 1 );

                cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                    from, to
                );
                cylinderData[ "position1" ] = from;
                cylinderData[ "position2" ] = to;

            }

            if( what[ "color" ] ){

                sphereData[ "color" ] = backboneAtomSet.atomColor( null, this.color );

                cylinderData[ "color" ] = backboneBondSet.bondColor( null, 0, this.color );
                cylinderData[ "color2" ] = backboneBondSet.bondColor( null, 1, this.color );

            }

            if( what[ "radius" ] || what[ "scale" ] ){

                sphereData[ "radius" ] = backboneAtomSet.atomRadius(
                    null, this.radius, this.scale * this.aspectRatio
                );

                cylinderData[ "radius" ] = backboneBondSet.bondRadius(
                    null, 0, this.radius, this.scale
                );

            }

            sphereBuffer.setAttributes( sphereData );
            cylinderBuffer.setAttributes( cylinderData );

        }

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "aspectRatio" ] ){

            this.aspectRatio = params[ "aspectRatio" ];
            what[ "radius" ] = true;
            what[ "scale" ] = true;

        }

        if( params && params[ "sphereDetail" ]!==undefined ){

            this.sphereDetail = params[ "sphereDetail" ];
            rebuild = true;

        }

        if( params && params[ "radiusSegments" ] ){

            this.radiusSegments = params[ "radiusSegments" ];
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.TubeRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.TubeRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "tube",

    defaultSize: 0.25,

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1
        },
        radialSegments: {
            type: "integer", max: 50, min: 1
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean"
        },
        wireframe: {
            type: "boolean"
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.color = params.color || "ss";
        params.radius = params.radius || this.defaultSize;

        if( params.quality === "low" ){
            this.subdiv = 3;
            this.radialSegments = 5;
        }else if( params.quality === "medium" ){
            this.subdiv = 6;
            this.radialSegments = 10;
        }else if( params.quality === "high" ){
            this.subdiv = 12;
            this.radialSegments = 20;
        }else{
            this.subdiv = params.subdiv || 6;
            this.radialSegments = params.radialSegments || 10;
        }

        this.tension = params.tension || NaN;
        this.capped = params.capped || true;
        this.wireframe = params.wireframe || false;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
            var subSize = spline.getSubdividedSize(
                scope.subdiv, scope.radius, scope.scale
            );

            var rx = 1.0;
            var ry = 1.0;

            scope.bufferList.push(

                new NGL.TubeMeshBuffer(
                    subPos.position,
                    subPos.normal,
                    subPos.binormal,
                    subPos.tangent,
                    subCol.color,
                    subSize.size,
                    scope.radialSegments,
                    subCol.pickingColor,
                    rx,
                    ry,
                    scope.capped,
                    scope.wireframe
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
                var subSize = spline.getSubdividedSize(
                    this.subdiv, this.radius, this.scale
                );

                bufferData[ "position" ] = subPos.position;
                bufferData[ "normal" ] = subPos.normal;
                bufferData[ "binormal" ] = subPos.binormal;
                bufferData[ "tangent" ] = subPos.tangent;
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

        if( params && params[ "subdiv" ] ){

            this.subdiv = params[ "subdiv" ];
            rebuild = true;

        }

        if( params && params[ "radialSegments" ] ){

            this.radialSegments = params[ "radialSegments" ];
            rebuild = true;

        }

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "radius" ] = true;

        }

        if( params && params[ "capped" ] !== undefined ){
            this.capped = params[ "capped" ];
            rebuild = true;

        }

        if( params && params[ "wireframe" ] !== undefined ){

            this.wireframe = params[ "wireframe" ];
            rebuild = true;

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

    type: "cartoon",

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        subdiv: {
            type: "integer", max: 50, min: 1
        },
        radialSegments: {
            type: "integer", max: 50, min: 1
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean"
        },
        wireframe: {
            type: "boolean"
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.color = params.color || "ss";
        params.radius = params.radius || "ss";

        if( params.quality === "low" ){
            this.subdiv = 3;
            this.radialSegments = 6;
        }else if( params.quality === "medium" ){
            this.subdiv = 6;
            this.radialSegments = 10;
        }else if( params.quality === "high" ){
            this.subdiv = 12;
            this.radialSegments = 20;
        }else{
            this.subdiv = params.subdiv || 6;
            this.radialSegments = params.radialSegments || 10;
        }

        this.aspectRatio = params.aspectRatio || 3.0;
        this.tension = params.tension || NaN;
        this.capped = params.capped || true;
        this.wireframe = params.wireframe || false;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        if( NGL.GET( "debug" ) ){

            scope.debugBufferList = [];

        }

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
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
                    subPos.normal,
                    subPos.binormal,
                    subPos.tangent,
                    subCol.color,
                    subSize.size,
                    scope.radialSegments,
                    subCol.pickingColor,
                    rx,
                    ry,
                    scope.capped,
                    scope.wireframe
                )

            );

            if( NGL.GET( "debug" ) ){

                scope.debugBufferList.push(

                    new NGL.BufferVectorHelper(
                        subPos.position,
                        subPos.normal,
                        "skyblue",
                        1.5
                    )

                );

                scope.debugBufferList.push(

                    new NGL.BufferVectorHelper(
                        subPos.position,
                        subPos.binormal,
                        "lightgreen",
                        1.5
                    )

                );

                scope.debugBufferList.push(

                    new NGL.BufferVectorHelper(
                        subPos.position,
                        subPos.tangent,
                        "orange",
                        1.5
                    )

                );

            }

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

            this.bufferList[ i ].rx = this.aspectRatio;

            if( what[ "position" ] || what[ "radius" ] || what[ "scale" ] ){

                var subPos = spline.getSubdividedPosition( this.subdiv, this.tension );
                var subSize = spline.getSubdividedSize(
                    this.subdiv, this.radius, this.scale
                );

                bufferData[ "position" ] = subPos.position;
                bufferData[ "normal" ] = subPos.normal;
                bufferData[ "binormal" ] = subPos.binormal;
                bufferData[ "tangent" ] = subPos.tangent;
                bufferData[ "size" ] = subSize.size;

            }

            if( what[ "color" ] ){

                var subCol = spline.getSubdividedColor( this.subdiv, this.color );

                bufferData[ "color" ] = subCol.color;
                bufferData[ "pickingColor" ] = subCol.pickingColor;

            }

            this.bufferList[ i ].setAttributes( bufferData );

            if( NGL.GET( "debug" ) ){

                this.debugBufferList[ i * 3 + 0 ].setAttributes( bufferData );
                this.debugBufferList[ i * 3 + 1 ].setAttributes( bufferData );
                this.debugBufferList[ i * 3 + 2 ].setAttributes( bufferData );

            }

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

        if( params && params[ "subdiv" ] ){

            this.subdiv = params[ "subdiv" ];
            rebuild = true;

        }

        if( params && params[ "radialSegments" ] ){

            this.radialSegments = params[ "radialSegments" ];
            rebuild = true;

        }

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "position" ] = true;

        }

        if( params && params[ "capped" ] !== undefined ){

            this.capped = params[ "capped" ];
            rebuild = true;

        }

        if( params && params[ "wireframe" ] !== undefined ){

            this.wireframe = params[ "wireframe" ];
            rebuild = true;

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

    type: "ribbon",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.color = params.color || "ss";
        params.radius = params.radius || "ss";
        params.scale = params.scale || 3.0;

        if( params.quality === "low" ){
            this.subdiv = 3;
        }else if( params.quality === "medium" ){
            this.subdiv = 6;
        }else if( params.quality === "high" ){
            this.subdiv = 12;
        }else{
            this.subdiv = params.subdiv || 6;
        }

        this.tension = params.tension || NaN;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
            var subSize = spline.getSubdividedSize(
                scope.subdiv, scope.radius, scope.scale
            );

            scope.bufferList.push(

                new NGL.RibbonBuffer(
                    subPos.position,
                    subPos.binormal,
                    subPos.normal,
                    subCol.color,
                    subSize.size,
                    subCol.pickingColor
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
                bufferData[ "normal" ] = subPos.binormal;
                bufferData[ "dir" ] = subPos.normal;

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

        if( params && params[ "subdiv" ] ){

            this.subdiv = params[ "subdiv" ];
            rebuild = true;

        }

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            this.update({ "position": true });

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

    type: "trace",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        }

    }, NGL.Representation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.color = params.color || "ss";

        if( params.quality === "low" ){
            this.subdiv = 3;
        }else if( params.quality === "medium" ){
            this.subdiv = 6;
        }else if( params.quality === "high" ){
            this.subdiv = 12;
        }else{
            this.subdiv = params.subdiv || 6;
        }

        this.tension = params.tension || NaN;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );

            scope.bufferList.push(
                new NGL.TraceBuffer( subPos.position, subCol.color )
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

        if( params && params[ "subdiv" ] ){

            this.subdiv = params[ "subdiv" ];
            rebuild = true;

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


NGL.HelixorientRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.HelixorientRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

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

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 || fiber.isNucleic() ) return;

            var helixorient = new NGL.Helixorient( fiber );
            var position = helixorient.getPosition();
            var color = helixorient.getColor( scope.color );
            var size = helixorient.getSize( scope.radius, scope.scale );

            var axis = helixorient.getAxis();

            scope.bufferList.push(

                new NGL.SphereBuffer(
                    position.center,
                    color.color,
                    size.size,
                    color.pickingColor,
                    scope.sphereDetail,
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

            scope.bufferList.push(

                new NGL.BufferVectorHelper(
                    axis.begin,
                    axis.axis,
                    "tomato",
                    1
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

            if( what[ "position" ] ){

                var position = helixorient.getPosition();

                bufferData[ "position" ] = position.center;

                this.bufferList[ i * 3 + 1 ].setAttributes( {
                    "position": position.center,
                    "vector": position.axis,
                } );
                this.bufferList[ i * 3 + 2 ].setAttributes( {
                    "position": position.center,
                    "vector": position.redir,
                } );

            }

            if( what[ "color" ] ){

                var color = helixorient.getColor( this.color );

                bufferData[ "color" ] = color.color;

            }

            if( what[ "radius" ] || what[ "scale" ] ){

                var size = helixorient.getSize( this.radius, this.scale );

                bufferData[ "radius" ] = size.size;

            }

            this.bufferList[ i * 3 ].setAttributes( bufferData );

        };

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.RocketRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.RocketRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "rocket",

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

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];
        this.centerList = [];

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 || fiber.isNucleic() ) return;

            var helixorient = new NGL.Helixorient( fiber );
            var position = helixorient.getPosition();
            var color = helixorient.getColor( scope.color );
            var size = helixorient.getSize( scope.radius, scope.scale );

            var axis = helixorient.getAxis();

            scope.bufferList.push(

                new NGL.CylinderBuffer(
                    axis.begin,
                    axis.end,
                    axis.color,
                    axis.color,
                    axis.size,
                    null,
                    null,
                    axis.pickingColor,
                    axis.pickingColor,
                    scope.radiusSegments,
                    scope.disableImpostor
                )

            );

            scope.fiberList.push( fiber );

            scope.centerList.push( new Float32Array( axis.begin.length ) );

        }, this.selection );

    },

    update: function( what ){

        this.rebuild();

        return;

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        for( i = 0; i < n; ++i ){

            var fiber = this.fiberList[ i ]

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var helixorient = new NGL.Helixorient( fiber );
            var axis = helixorient.getAxis();

            if( what[ "position" ] ){

                bufferData[ "position" ] = NGL.Utils.calculateCenterArray(
                    axis.begin, axis.end, this.centerList[ i ]
                );
                bufferData[ "position1" ] = axis.begin;
                bufferData[ "position2" ] = axis.end;

            }

            if( what[ "color" ] ){

                bufferData[ "color" ] = axis.color;
                bufferData[ "color2" ] = axis.color;

            }

            if( what[ "radius" ] || what[ "scale" ] ){

                bufferData[ "radius" ] = axis.size;

            }

            this.bufferList[ i ].setAttributes( bufferData );

        };

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.RopeRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.RopeRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "rope",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1
        },
        radialSegments: {
            type: "integer", max: 50, min: 1
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean"
        },
        wireframe: {
            type: "boolean"
        },
        smooth: {
            type: "boolean"
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.color = params.color || "ss";
        params.radius = params.radius || this.defaultSize;

        if( params.quality === "low" ){
            this.subdiv = 3;
            this.radialSegments = 5;
        }else if( params.quality === "medium" ){
            this.subdiv = 6;
            this.radialSegments = 10;
        }else if( params.quality === "high" ){
            this.subdiv = 12;
            this.radialSegments = 20;
        }else{
            this.subdiv = params.subdiv || 6;
            this.radialSegments = params.radialSegments || 10;
        }

        this.tension = params.tension || 0.5;
        this.capped = params.capped || true;
        this.wireframe = params.wireframe || false;
        this.smooth = params.smooth || true;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 || fiber.isNucleic() ) return;

            var helixorient = new NGL.Helixorient( fiber );

            var spline = new NGL.Spline( helixorient.getFiber( scope.smooth ) );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
            var subSize = spline.getSubdividedSize(
                scope.subdiv, scope.radius, scope.scale
            );

            var rx = 1.0;
            var ry = 1.0;

            scope.bufferList.push(

                new NGL.TubeMeshBuffer(
                    subPos.position,
                    subPos.normal,
                    subPos.binormal,
                    subPos.tangent,
                    subCol.color,
                    subSize.size,
                    scope.radialSegments,
                    subCol.pickingColor,
                    rx,
                    ry,
                    scope.capped,
                    scope.wireframe
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
            var spline = new NGL.Spline( helixorient.getFiber( this.smooth ) );

            if( what[ "position" ] || what[ "radius" ] || what[ "scale" ] ){

                var subPos = spline.getSubdividedPosition(
                    this.subdiv, this.tension
                );
                var subSize = spline.getSubdividedSize(
                    this.subdiv, this.radius, this.scale
                );

                bufferData[ "position" ] = subPos.position;
                bufferData[ "normal" ] = subPos.normal;
                bufferData[ "binormal" ] = subPos.binormal;
                bufferData[ "tangent" ] = subPos.tangent;
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

        if( params && params[ "subdiv" ] ){

            this.subdiv = params[ "subdiv" ];
            rebuild = true;

        }

        if( params && params[ "radialSegments" ] ){

            this.radialSegments = params[ "radialSegments" ];
            rebuild = true;

        }

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "radius" ] = true;

        }

        if( params && params[ "capped" ] !== undefined ){
            this.capped = params[ "capped" ];
            rebuild = true;

        }

        if( params && params[ "wireframe" ] !== undefined ){

            this.wireframe = params[ "wireframe" ];
            rebuild = true;

        }

        if( params && params[ "smooth" ] !== undefined ){

            this.smooth = params[ "smooth" ];
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

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

    type: "",

    parameters: Object.assign( {

        wireframe: {
            type: "boolean"
        },
        background: {
            type: "boolean"
        }

    }, NGL.Representation.prototype.parameters ),

    init: function( params ){

        params = params || {};

        this.color = params.color || 0xDDDDDD;
        this.background = params.background || true;
        this.wireframe = params.wireframe || false;

        NGL.Representation.prototype.init.call( this, params );

    },

    attach: function(){

        var viewer = this.viewer;
        var background = this.background;

        this.bufferList.forEach( function( buffer ){

            if( background ){

                viewer.addBackground( buffer );

            }else{

                viewer.add( buffer );

            }

        });

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

            var n = geo.attributes.position.array.length / 3;
            var an = geo.attributes.normal.array;

            // assume there are no normals if the first is zero
            if( an[ 0 ] === 0 && an[ 1 ] === 0 && an[ 2 ] === 0 ){
                geo.computeVertexNormals();
            }

            position = geo.attributes.position.array;
            var tc = new THREE.Color( this.color );
            color = NGL.Utils.uniformArray3(
                n, tc.r, tc.g, tc.b
            );
            index = null;
            normal = geo.attributes.normal.array;

        }else{

            position = NGL.Utils.positionFromGeometry( geo );
            color = NGL.Utils.colorFromGeometry( geo );
            index = NGL.Utils.indexFromGeometry( geo );
            normal = NGL.Utils.normalFromGeometry( geo );

        }

        var meshBuffer = new NGL.MeshBuffer(
            position, color, index, normal, undefined, this.wireframe
        );

        this.bufferList = [ meshBuffer ];

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "wireframe" ] !== undefined ){

            this.wireframe = params[ "wireframe" ];
            rebuild = true;

        }

        if( params && params[ "background" ] !== undefined ){

            this.background = params[ "background" ];
            rebuild = true;

        }

        NGL.Representation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

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
