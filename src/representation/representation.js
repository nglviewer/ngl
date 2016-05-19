/**
 * @file Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Debug, Log, ColorMakerRegistry, ExtensionFragDepth } from "../globals.js";
import Queue from "../utils/queue.js";
import Counter from "../utils/counter.js";


var SideTypes = {};
SideTypes[ THREE.FrontSide ] = "front";
SideTypes[ THREE.BackSide ] = "back";
SideTypes[ THREE.DoubleSide ] = "double";


function Representation( object, viewer, params ){

    this.viewer = viewer;

    this.queue = new Queue( this.make.bind( this ) );
    this.tasks = new Counter();
    this.bufferList = [];

    this.init( params );

}

Representation.prototype = {

    constructor: Representation,

    type: "",

    parameters: {

        clipNear: {
            type: "range", step: 1, max: 100, min: 0, buffer: true
        },
        flatShaded: {
            type: "boolean", buffer: true
        },
        opacity: {
            type: "range", step: 0.01, max: 1, min: 0, buffer: true
        },
        side: {
            type: "select", options: SideTypes, buffer: true,
            int: true
        },
        wireframe: {
            type: "boolean", buffer: true
        },
        linewidth: {
            type: "integer", max: 50, min: 1, buffer: true
        },

        colorScheme: {
            type: "select", update: "color",
            options: ColorMakerRegistry.getTypes()
        },
        colorScale: {
            type: "select", update: "color",
            options: ColorMakerRegistry.getScales()
        },
        colorValue: {
            type: "color", update: "color"
        },
        colorDomain: {
            type: "hidden", update: "color"
        },
        colorMode: {
            type: "select", update: "color",
            options: ColorMakerRegistry.getModes()
        },

        roughness: {
            type: "range", step: 0.01, max: 1, min: 0, buffer: true
        },
        metalness: {
            type: "range", step: 0.01, max: 1, min: 0, buffer: true
        },
        diffuse: {
            type: "color", buffer: true
        },

    },

    init: function( params ){

        var p = params || {};

        this.clipNear = p.clipNear !== undefined ? p.clipNear : 0;
        this.flatShaded = p.flatShaded || false;
        this.side = p.side !== undefined ? p.side : THREE.DoubleSide;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;
        this.wireframe = p.wireframe || false;
        this.linewidth = p.linewidth || 2;

        this.setColor( p.color, p );

        this.colorScheme = p.colorScheme || "uniform";
        this.colorScale = p.colorScale || "";
        this.colorValue = p.colorValue || 0x909090;
        this.colorDomain = p.colorDomain || "";
        this.colorMode = p.colorMode || "hcl";

        this.visible = p.visible !== undefined ? p.visible : true;
        this.quality = p.quality;

        this.roughness = p.roughness !== undefined ? p.roughness : 0.4;
        this.metalness = p.metalness !== undefined ? p.metalness : 0.0;
        this.diffuse = p.diffuse !== undefined ? p.diffuse : 0xffffff;

    },

    getColorParams: function(){

        return {

            scheme: this.colorScheme,
            scale: this.colorScale,
            value: this.colorValue,
            domain: this.colorDomain,
            mode: this.colorMode,

        };

    },

    getBufferParams: function( p ){

        return Object.assign( {

            clipNear: this.clipNear,
            flatShaded: this.flatShaded,
            opacity: this.opacity,
            side: this.side,
            wireframe: this.wireframe,
            linewidth: this.linewidth,

            roughness: this.roughness,
            metalness: this.metalness,
            diffuse: this.diffuse,

        }, p );

    },

    setColor: function( value, p ){

        var types = Object.keys( ColorMakerRegistry.getTypes() );

        if( types.indexOf( value ) !== -1 ){

            if( p ){
                p.colorScheme = value;
            }else{
                this.setParameters( { colorScheme: value } );
            }

        }else if( value !== undefined ){

            value = new THREE.Color( value ).getHex();
            if( p ){
                p.colorScheme = "uniform";
                p.colorValue = value;
            }else{
                this.setParameters( {
                    colorScheme: "uniform", colorValue: value
                } );
            }

        }

        return this;

    },

    prepare: false,

    create: function(){

        // this.bufferList.length = 0;

    },

    update: function(){

        this.build();

    },

    build: function( params ){

        if( !this.prepare ){
            if( !params ){
                params = this.getParameters();
                delete params.quality;
            }
            this.tasks.increment();
            this.make( params, function(){} );
            return;
        }

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

        if( Debug ) Log.time( "Representation.make " + this.type );

        if( params && !params.__update ){
            this.init( params );
        }

        var _make = function(){

            if( params.__update ){
                this.update( params.__update );
                this.viewer.requestRender();
                this.tasks.decrement();
                callback();
            }else{
                this.clear();
                this.create();
                if( !this.manualAttach && !this.disposed ){
                    if( Debug ) Log.time( "Representation.attach " + this.type );
                    this.attach( function(){
                        if( Debug ) Log.timeEnd( "Representation.attach " + this.type );
                        this.tasks.decrement();
                        callback();
                    }.bind( this ) );
                }
            }

            if( Debug ) Log.timeEnd( "Representation.make " + this.type );

        }.bind( this );

        if( this.prepare ){
            this.prepare( _make );
        }else{
            _make();
        }

    },

    attach: function( callback ){

        this.setVisibility( this.visible );

        callback();

    },

    setVisibility: function( value, noRenderRequest ){

        this.visible = value;

        this.bufferList.forEach( function( buffer ){

            buffer.setVisibility( value );

        } );

        if( !noRenderRequest ) this.viewer.requestRender();

        return this;

    },

    setParameters: function( params, what, rebuild ){

        var p = params || {};
        var tp = this.parameters;

        what = what || {};
        rebuild = rebuild || false;

        var bufferParams = {};

        for( var name in p ){

            if( p[ name ] === undefined ) continue;
            if( tp[ name ] === undefined ) continue;

            if( tp[ name ].int ) p[ name ] = parseInt( p[ name ] );
            if( tp[ name ].float ) p[ name ] = parseFloat( p[ name ] );

            // no value change
            if( p[ name ] === this[ name ] ) continue;

            this[ name ] = p[ name ];

            // buffer param
            if( tp[ name ].buffer ){
                if( tp[ name ].buffer === true ){
                    bufferParams[ name ] = p[ name ];
                }else{
                    bufferParams[ tp[ name ].buffer ] = p[ name ];
                }
            }

            // mark for update
            if( tp[ name ].update ){
                what[ tp[ name ].update ] = true;
            }

            // mark for rebuild
            if( tp[ name ].rebuild &&
                !( tp[ name ].rebuild === "impostor" &&
                    ExtensionFragDepth && !this.disableImpostor )
            ){
                rebuild = true;
            }

        }

        //

        if( rebuild ){

            this.build();

        }else{

            this.bufferList.forEach( function( buffer ){
                buffer.setParameters( bufferParams );
            } );

            if( Object.keys( what ).length ){
                this.update( what );  // update buffer attribute
            }

            this.viewer.requestRender();

        }

        return this;

    },

    getParameters: function(){

        var params = {
            visible: this.visible,
            quality: this.quality
        };

        Object.keys( this.parameters ).forEach( function( name ){
            params[ name ] = this[ name ];
        }, this );

        return params;

    },

    clear: function(){

        this.bufferList.forEach( function( buffer ){

            this.viewer.remove( buffer );
            buffer.dispose();

        }, this );

        this.bufferList.length = 0;

        this.viewer.requestRender();

    },

    dispose: function(){

        this.disposed = true;
        this.queue.kill();
        this.tasks.dispose();
        this.clear();

    }

};


export default Representation;
