/**
 * @file Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Color, Vector3 } from "../../lib/three.es6.js";

import { Debug, Log, ColorMakerRegistry, ExtensionFragDepth } from "../globals.js";
import { defaults } from "../utils.js";
import Queue from "../utils/queue.js";
import Counter from "../utils/counter.js";


/**
 * Representation parameter object.
 * @typedef {Object} RepresentationParameters - representation parameters
 * @property {Boolean} lazy - only build & update the representation when visible
 *                            otherwise defer changes until set visible again
 * @property {Integer} clipNear - position of camera near/front clipping plane
 *                                in percent of scene bounding box
 * @property {Integer} clipRadius - radius of clipping sphere
 * @property {Vector3} clipCenter - position of for spherical clipping
 * @property {Boolean} flatShaded - render flat shaded
 * @property {Float} opacity - translucency: 1 is fully opaque, 0 is fully transparent
 * @property {String} side - which triangle sides to render, "front" front-side,
 *                            "back" back-side, "double" front- and back-side
 * @property {Boolean} wireframe - render as wireframe
 * @property {Integer} linewidth - width of lines (when applicable)
 * @property {String} colorScheme - color scheme
 * @property {String} colorScale - color scale
 * @property {Color} colorValue - color value
 * @property {Integer[]} colorDomain - scale value range
 * @property {Integer} colorDomain.0 - min value
 * @property {Integer} colorDomain.1 - max value
 * @property {String} colorMode - color mode
 * @property {Float} roughness - how rough the material is, between 0 and 1
 * @property {Float} metalness - how metallic the material is, between 0 and 1
 * @property {Color} diffuse - diffuse color for lighting
 */


/**
 * Representation object
 * @class
 * @param {Object} object - the object to be represented
 * @param {Viewer} viewer - a viewer object
 * @param {RepresentationParameters} [params] - representation parameters
 */
function Representation( object, viewer, params ){

    /**
     * @member {Viewer}
     */
    this.viewer = viewer;

    this.gidPool = params ? params.gidPool : undefined;

    /**
     * Counter that keeps track of tasks related to the creation of
     * the representation, including surface calculations.
     * @member {Counter}
     */
    this.tasks = new Counter();

    /**
     * @member {Queue}
     * @private
     */
    this.queue = new Queue( this.make.bind( this ) );

    /**
     * @member {Array}
     * @private
     */
    this.bufferList = [];

    this.init( params );

}

Representation.prototype = {

    constructor: Representation,

    type: "",

    parameters: {

        lazy: {
            type: "boolean"
        },

        clipNear: {
            type: "range", step: 1, max: 100, min: 0, buffer: true
        },
        clipRadius: {
            type: "number", precision: 1, max: 1000, min: 0, buffer: true
        },
        clipCenter: {
            type: "vector3", precision: 1, buffer: true
        },
        flatShaded: {
            type: "boolean", buffer: true
        },
        opacity: {
            type: "range", step: 0.01, max: 1, min: 0, buffer: true
        },
        side: {
            type: "select", buffer: true,
            options: { front: "front", back: "back", double: "double" },
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

        this.clipNear = defaults( p.clipNear, 0 );
        this.clipRadius = defaults( p.clipRadius, 0 );
        this.clipCenter = defaults( p.clipCenter, new Vector3() );
        this.flatShaded = defaults( p.flatShaded, false );
        this.side = defaults( p.side, "double" );
        this.opacity = defaults( p.opacity, 1.0 );
        this.wireframe = defaults( p.wireframe, false );
        this.linewidth = defaults( p.linewidth, 2 );

        this.setColor( p.color, p );

        this.colorScheme = defaults( p.colorScheme, "uniform" );
        this.colorScale = defaults( p.colorScale, "" );
        this.colorValue = defaults( p.colorValue, 0x909090 );
        this.colorDomain = defaults( p.colorDomain, "" );
        this.colorMode = defaults( p.colorMode, "hcl" );

        this.visible = defaults( p.visible, true );
        this.quality = defaults( p.quality, undefined );

        this.roughness = defaults( p.roughness, 0.4 );
        this.metalness = defaults( p.metalness, 0.0 );
        this.diffuse = defaults( p.diffuse, 0xffffff );

        this.lazy = defaults( p.lazy, false );
        this.lazyProps = {
            build: false,
            bufferParams: {},
            what: {}
        };

        // handle common parameters when applicable

        var tp = this.parameters;

        if( tp.sphereDetail === true ){
            tp.sphereDetail = {
                type: "integer", max: 3, min: 0, rebuild: "impostor"
            };
        }
        if( tp.radialSegments === true ){
            tp.radialSegments = {
                type: "integer", max: 25, min: 5, rebuild: "impostor"
            };
        }
        if( tp.openEnded === true ){
            tp.openEnded = {
                type: "boolean", rebuild: "impostor", buffer: true
            };
        }
        if( tp.disableImpostor === true ){
            tp.disableImpostor = {
                type: "boolean", rebuild: true
            };
        }

        if( p.quality === "low" ){
            if( tp.sphereDetail ) this.sphereDetail = 0;
            if( tp.radialSegments ) this.radialSegments = 5;
        }else if( p.quality === "medium" ){
            if( tp.sphereDetail ) this.sphereDetail = 1;
            if( tp.radialSegments ) this.radialSegments = 10;
        }else if( p.quality === "high" ){
            if( tp.sphereDetail ) this.sphereDetail = 2;
            if( tp.radialSegments ) this.radialSegments = 20;
        }else{
            if( tp.sphereDetail ){
                this.sphereDetail = defaults( p.sphereDetail, 1 );
            }
            if( tp.radialSegments ){
                this.radialSegments = defaults( p.radialSegments, 10 );
            }
        }

        if( tp.openEnded ){
            this.openEnded = defaults( p.openEnded, true );
        }

        if( tp.disableImpostor ){
            this.disableImpostor = defaults( p.disableImpostor, false );
        }

    },

    getColorParams: function( p ){

        return Object.assign( {

            gidPool: this.gidPool,

            scheme: this.colorScheme,
            scale: this.colorScale,
            value: this.colorValue,
            domain: this.colorDomain,
            mode: this.colorMode,

        }, p );

    },

    getBufferParams: function( p ){

        return Object.assign( {

            clipNear: this.clipNear,
            clipRadius: this.clipRadius,
            clipCenter: this.clipCenter,
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

        if( types.includes( value ) ){

            if( p ){
                p.colorScheme = value;
            }else{
                this.setParameters( { colorScheme: value } );
            }

        }else if( value !== undefined ){

            value = new Color( value ).getHex();
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

    build: function( updateWhat ){

        if( this.lazy && !this.visible ){
            this.lazyProps.build = true;
            return;
        }

        if( !this.prepare ){
            this.tasks.increment();
            this.make();
            return;
        }

        // don't let tasks accumulate
        if( this.queue.length() > 0 ){
            this.tasks.change( 1 - this.queue.length() );
            this.queue.kill();
        }else{
            this.tasks.increment();
        }

        this.queue.push( updateWhat || false );

    },

    make: function( updateWhat, callback ){

        if( Debug ) Log.time( "Representation.make " + this.type );

        var _make = function(){

            if( updateWhat ){
                this.update( updateWhat );
                this.viewer.requestRender();
                this.tasks.decrement();
                if( callback ) callback();
            }else{
                this.clear();
                this.create();
                if( !this.manualAttach && !this.disposed ){
                    if( Debug ) Log.time( "Representation.attach " + this.type );
                    this.attach( function(){
                        if( Debug ) Log.timeEnd( "Representation.attach " + this.type );
                        this.tasks.decrement();
                        if( callback ) callback();
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

    /**
     * Set the visibility of the representation
     * @param {Boolean} value - visibility flag
     * @param {Boolean} [noRenderRequest] - whether or not to request a re-render from the viewer
     * @return {Representation} this object
     */
    setVisibility: function( value, noRenderRequest ){

        this.visible = value;

        if( this.visible ){

            var lazyProps = this.lazyProps;
            var bufferParams = lazyProps.bufferParams;
            var what = lazyProps.what;

            if( lazyProps.build ){

                lazyProps.build = false;
                this.build();
                return;

            }else if( Object.keys( bufferParams ).length || Object.keys( what ).length ){

                lazyProps.bufferParams = {};
                lazyProps.what = {};
                this.updateParameters( bufferParams, what );

            }

        }

        this.bufferList.forEach( function( buffer ){
            buffer.setVisibility( value );
        } );

        if( !noRenderRequest ) this.viewer.requestRender();

        return this;

    },

    /**
     * Set the visibility of the representation
     * @param {RepresentationParameters} params - parameters object
     * @param {Object} [what] - buffer data attributes to be updated,
     *                        note that this needs to be implemented in the
     *                        derived classes. Generally it allows more
     *                        fine-grained control over updating than
     *                        forcing a rebuild.
     * @param {Boolean} what.position - update position data
     * @param {Boolean} what.color - update color data
     * @param {Boolean} [rebuild] - whether or not to rebuild the representation
     * @return {Representation} this object
     */
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
            this.updateParameters( bufferParams, what );
        }

        return this;

    },

    updateParameters: function( bufferParams, what ){

        if( this.lazy && !this.visible ){
            Object.assign( this.lazyProps.bufferParams, bufferParams );
            Object.assign( this.lazyProps.what, what );
            return;
        }

        this.bufferList.forEach( function( buffer ){
            buffer.setParameters( bufferParams );
        } );

        if( Object.keys( what ).length ){
            this.update( what );  // update buffer attribute
        }

        this.viewer.requestRender();

    },

    getParameters: function(){

        var params = {
            lazy: this.lazy,
            visible: this.visible,
            quality: this.quality
        };

        Object.keys( this.parameters ).forEach( function( name ){
            if( this.parameters[ name ] !== null ){
                params[ name ] = this[ name ];
            }
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
