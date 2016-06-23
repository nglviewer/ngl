/**
 * @file Ball And Stick Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import { ExtensionFragDepth, RepresentationRegistry } from "../globals.js";
import { calculateCenterArray } from "../math/array-utils.js";
import StructureRepresentation from "./structure-representation.js";
import SphereBuffer from "../buffer/sphere-buffer.js";
import CylinderBuffer from "../buffer/cylinder-buffer.js";
import LineBuffer from "../buffer/line-buffer.js";


/**
 * Ball And Stick representation parameter object.
 * @typedef {Object} BallAndStickRepresentationParameters - ball and stick representation parameters
 * @mixes RepresentationParameters
 * @mixes StructureRepresentationParameters
 *
 * @property {Integer} sphereDetail - sphere quality (icosahedron subdivisions)
 * @property {Integer} radiusSegments - cylinder quality (number of segments)
 * @property {Boolean} disableImpostor - disable use of raycasted impostors for rendering
 * @property {Float} aspectRatio - size difference between atom and bond radii
 * @property {Boolean} lineOnly - render only bonds, and only as lines
 * @property {Boolean} cylinderOnly - render only bonds (no atoms)
 * @property {Boolean} multipleBond - whether or not to render multiple bonds
 * @property {Float} bondSpacing - spacing for multiple bond rendering
 */


/**
 * Ball And Stick representation object
 * @class
 * @param {Structure} structure - the structure to be represented
 * @param {Viewer} viewer - a viewer object
 * @param {BallAndStickRepresentationParameters} params - ball and stick representation parameters
 */
function BallAndStickRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

}

BallAndStickRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: BallAndStickRepresentation,

    type: "ball+stick",

    defaultSize: 0.15,

    parameters: Object.assign( {

        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: "impostor"
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: "impostor"
        },
        disableImpostor: {
            type: "boolean", rebuild: true
        },
        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        lineOnly: {
            type: "boolean", rebuild: true
        },
        cylinderOnly: {
            type: "boolean", rebuild: true
        },
        multipleBond: {
            type: "boolean", rebuild: true
        },
        bondSpacing: {
            type: "number", precision: 2, max: 1.0, min: 0.5
        }

    }, StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.radius = defaults( p.radius, this.defaultSize );

        if( p.quality === "low" ){
            this.sphereDetail = 0;
            this.radiusSegments = 5;
        }else if( p.quality === "medium" ){
            this.sphereDetail = 1;
            this.radiusSegments = 10;
        }else if( p.quality === "high" ){
            this.sphereDetail = 2;
            this.radiusSegments = 20;
        }else{
            this.sphereDetail = defaults( p.sphereDetail, 1 );
            this.radiusSegments = defaults( p.radiusSegments, 10 );
        }
        this.disableImpostor = defaults( p.disableImpostor, false );

        this.aspectRatio = defaults( p.aspectRatio, 2.0 );
        this.lineOnly = defaults( p.lineOnly, false );
        this.cylinderOnly = defaults( p.cylinderOnly, false );
        this.multipleBond = defaults( p.multipleBond, false );
        this.bondSpacing = defaults( p.bondSpacing, 0.85 );

        StructureRepresentation.prototype.init.call( this, p );

    },

    getAtomParams: function( what, params ){

        params = Object.assign( {
            radiusParams: { "radius": this.radius, "scale": this.scale * this.aspectRatio }
        }, params );

        return StructureRepresentation.prototype.getAtomParams.call( this, what, params );

    },

    getAtomData: function( sview, what, params ){

        return sview.getAtomData( this.getAtomParams( what, params ) );

    },

    getBondParams: function( what, params ){

        params = Object.assign( {
            multipleBond: this.multipleBond,
            bondSpacing: this.bondSpacing
        }, params );

        return StructureRepresentation.prototype.getBondParams.call( this, what, params );

    },

    getBondData: function( sview, what, params ){

        return sview.getBondData( this.getBondParams( what, params ) );

    },

    createData: function( sview ){

        var bondData = this.getBondData( sview );
        var bufferList = [];

        if( this.lineOnly ){

            this.lineBuffer = new LineBuffer(
                bondData.position1,
                bondData.position2,
                bondData.color1,
                bondData.color2,
                this.getBufferParams()
            );

            bufferList.push( this.lineBuffer );

        }else{

            if( !this.cylinderOnly ){

                var atomData = this.getAtomData( sview );

                var sphereBuffer = new SphereBuffer(
                    atomData.position,
                    atomData.color,
                    atomData.radius,
                    atomData.pickingColor,
                    this.getBufferParams( {
                        sphereDetail: this.sphereDetail,
                        disableImpostor: this.disableImpostor,
                        dullInterior: true
                    } )
                );

                bufferList.push( sphereBuffer );

            }
            var cylinderBuffer = new CylinderBuffer(
                bondData.position1,
                bondData.position2,
                bondData.color1,
                bondData.color2,
                bondData.radius,
                bondData.pickingColor1,
                bondData.pickingColor2,
                this.getBufferParams( {
                    cap: true,
                    radiusSegments: this.radiusSegments,
                    disableImpostor: this.disableImpostor,
                    dullInterior: true
                } )
            );

            bufferList.push( cylinderBuffer );

        }

        return {
            bufferList: bufferList
        };

    },

    updateData: function( what, data ){

        if( this.multipleBond && what && what.radius ){
            what.position = true;
        }

        var bondData = this.getBondData( data.sview, what );

        if( this.lineOnly ){

            var lineData = {};

            if( !what || what.position ){
                lineData.from = bondData.position1;
                lineData.to = bondData.position2;
            }

            if( !what || what.color ){
                lineData.color = bondData.color1;
                lineData.color2 = bondData.color2;
            }

            data.bufferList[ 0 ].setAttributes( lineData );

        }else{

            var atomData = this.getAtomData( data.sview, what );
            var sphereData = {};
            var cylinderData = {};

            if( !what || what.position ){
                sphereData.position = atomData.position;
                cylinderData.position1 = bondData.position1;
                cylinderData.position2 = bondData.position2;
            }

            if( !what || what.color ){
                sphereData.color = atomData.color;
                cylinderData.color = bondData.color1;
                cylinderData.color2 = bondData.color2;
            }

            if( !what || what.radius ){
                sphereData.radius = atomData.radius;
                cylinderData.radius = bondData.radius;
            }

            data.bufferList[ 0 ].setAttributes( sphereData );
            data.bufferList[ 1 ].setAttributes( cylinderData );

        }

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && ( params.aspectRatio || params.bondSpacing ) ){

            what.radius = true;
            if( !ExtensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


RepresentationRegistry.add( "ball+stick", BallAndStickRepresentation );


export default BallAndStickRepresentation;
