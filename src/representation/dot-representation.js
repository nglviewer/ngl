/**
 * @file Dot Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { ExtensionFragDepth } from "../globals.js";
import Representation from "./representation.js";
import Volume from "../surface/volume.js";
import SphereBuffer from "../buffer/sphere-buffer.js";
import PointBuffer from "../buffer/point-buffer.js";


function DotRepresentation( surface, viewer, params ){

    Representation.call( this, surface, viewer, params );

    if( surface instanceof Volume ){
        this.surface = undefined;
        this.volume = surface;
    }else{
        this.surface = surface;
        this.volume = undefined;
    }

    this.build();

}

DotRepresentation.prototype = Object.assign( Object.create(

    Representation.prototype ), {

    constructor: DotRepresentation,

    type: "dot",

    parameters: Object.assign( {

        thresholdType: {
            type: "select", rebuild: true, options: {
                "value": "value", "sigma": "sigma"
            }
        },
        thresholdMin: {
            type: "number", precision: 3, max: Infinity, min: -Infinity, rebuild: true
        },
        thresholdMax: {
            type: "number", precision: 3, max: Infinity, min: -Infinity, rebuild: true
        },
        thresholdOut: {
            type: "boolean", rebuild: true
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
                "abs-value": "abs-value",
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
        disableImpostor: {
            type: "boolean", rebuild: true
        },

        pointSize: {
            type: "number", precision: 1, max: 100, min: 0, buffer: true
        },
        sizeAttenuation: {
            type: "boolean", buffer: true
        },
        sortParticles: {
            type: "boolean", rebuild: true
        },
        useTexture: {
            type: "boolean", buffer: true
        },
        alphaTest: {
            type: "range", step: 0.001, max: 1, min: 0, buffer: true
        },
        forceTransparent: {
            type: "boolean", buffer: true
        },
        edgeBleach: {
            type: "range", step: 0.001, max: 1, min: 0, buffer: true
        },

    }, Representation.prototype.parameters, {

        colorScheme: {
            type: "select", update: "color", options: {
                "": "",
                "value": "value",
                "uniform": "uniform",
                // "value-min": "value-min",
                // "deviation": "deviation",
                // "size": "size"
            }
        },

    } ),

    defaultSize: 0.1,

    init: function( params ){

        var p = params || {};
        p.colorScheme = p.colorScheme || "uniform";
        p.colorValue = p.colorValue || 0xDDDDDD;

        if( p.quality === "low" ){
            this.sphereDetail = 0;
        }else if( p.quality === "medium" ){
            this.sphereDetail = 1;
        }else if( p.quality === "high" ){
            this.sphereDetail = 2;
        }else{
            this.sphereDetail = p.sphereDetail || 1;
        }
        this.disableImpostor = p.disableImpostor || false;

        this.thresholdType  = p.thresholdType !== undefined ? p.thresholdType : "sigma";
        this.thresholdMin = p.thresholdMin !== undefined ? p.thresholdMin : 2.0;
        this.thresholdMax = p.thresholdMax !== undefined ? p.thresholdMax : Infinity;
        this.thresholdOut = p.thresholdOut !== undefined ? p.thresholdOut : false;
        this.dotType = p.dotType !== undefined ? p.dotType : "point";
        this.radius = p.radius !== undefined ? p.radius : 0.1;
        this.scale = p.scale !== undefined ? p.scale : 1.0;

        this.pointSize = p.pointSize || 1;
        this.sizeAttenuation = p.sizeAttenuation !== undefined ? p.sizeAttenuation : true;
        this.sortParticles = p.sortParticles !== undefined ? p.sortParticles : false;
        this.useTexture = p.useTexture !== undefined ? p.useTexture : false;
        this.alphaTest = p.alphaTest !== undefined ? p.alphaTest : 0.5;
        this.forceTransparent = p.forceTransparent !== undefined ? p.forceTransparent : false;
        this.edgeBleach = p.edgeBleach !== undefined ? p.edgeBleach : 0.0;

        Representation.prototype.init.call( this, p );

    },

    attach: function( callback ){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );

        }, this );

        this.setVisibility( this.visible );

        callback();

    },

    create: function(){

        var position, color, size, pickingColor;

        if( this.volume ){

            var thresholdMin, thresholdMax;

            if( this.thresholdType === "sigma" ){
                thresholdMin = this.volume.getValueForSigma( this.thresholdMin );
                thresholdMax = this.volume.getValueForSigma( this.thresholdMax );
            }else{
                thresholdMin = this.thresholdMin;
                thresholdMax = this.thresholdMax;
            }
            this.volume.filterData( thresholdMin, thresholdMax, this.thresholdOut );

            position = this.volume.getDataPosition();
            color = this.volume.getDataColor( this.getColorParams() );
            size = this.volume.getDataSize( this.radius, this.scale );
            pickingColor = this.volume.getPickingDataColor( this.getColorParams() );

        }else{

            position = this.surface.getPosition();
            color = this.surface.getColor( this.getColorParams() );
            size = this.surface.getSize( this.radius, this.scale );
            pickingColor = this.surface.getPickingColor( this.getColorParams() );

        }

        if( this.dotType === "sphere" ){

            this.dotBuffer = new SphereBuffer(
                position,
                color,
                size,
                pickingColor,
                this.getBufferParams( {
                    sphereDetail: this.sphereDetail,
                    disableImpostor: this.disableImpostor,
                    dullInterior: false
                } )
            );

        }else{

            this.dotBuffer = new PointBuffer(
                position,
                color,
                this.getBufferParams( {
                    pointSize: this.pointSize,
                    sizeAttenuation: this.sizeAttenuation,
                    sortParticles: this.sortParticles,
                    useTexture: this.useTexture,
                    alphaTest: this.alphaTest,
                    forceTransparent: this.forceTransparent,
                    edgeBleach: this.edgeBleach
                } )
            );

        }

        this.bufferList.push( this.dotBuffer );

    },

    update: function( what ){

        if( this.bufferList.length === 0 ) return;

        what = what || {};

        var dotData = {};

        if( what.color ){

            if( this.volume ){

                dotData.color = this.volume.getDataColor(
                    this.getColorParams()
                );

            }else{

                dotData.color = this.surface.getColor(
                    this.getColorParams()
                );

            }

        }

        if( this.dotType === "sphere" && ( what.radius || what.scale ) ){

            if( this.volume ){

                dotData.radius = this.volume.getDataSize(
                    this.radius, this.scale
                );

            }else{

                dotData.radius = this.surface.getSize(
                    this.radius, this.scale
                );

            }

        }

        this.dotBuffer.setAttributes( dotData );

    },

    setParameters: function( params, what, rebuild ){

        what = what || {};

        if( params && params.thresholdType !== undefined &&
            this.volume instanceof Volume
        ){

            if( this.thresholdType === "value" &&
                params.thresholdType === "sigma"
            ){

                this.thresholdMin = this.volume.getSigmaForValue(
                    this.thresholdMin
                );
                this.thresholdMax = this.volume.getSigmaForValue(
                    this.thresholdMax
                );

            }else if( this.thresholdType === "sigma" &&
                params.thresholdType === "value"
            ){

                this.thresholdMin = this.volume.getValueForSigma(
                    this.thresholdMin
                );
                this.thresholdMax = this.volume.getValueForSigma(
                    this.thresholdMax
                );

            }

            this.thresholdType = params.thresholdType;

        }

        if( params && params.radiusType !== undefined ){

            if( params.radiusType === "radius" ){
                this.radius = this.defaultSize;
            }else{
                this.radius = params.radiusType;
            }
            what.radius = true;
            if( this.dotType === "sphere" &&
                ( !ExtensionFragDepth || this.disableImpostor )
            ){
                rebuild = true;
            }

        }

        if( params && params.radius !== undefined ){

            what.radius = true;
            if( this.dotType === "sphere" &&
                ( !ExtensionFragDepth || this.disableImpostor )
            ){
                rebuild = true;
            }

        }

        if( params && params.scale !== undefined ){

            what.scale = true;
            if( this.dotType === "sphere" &&
                ( !ExtensionFragDepth || this.disableImpostor )
            ){
                rebuild = true;
            }

        }

        Representation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


export default DotRepresentation;
