/**
 * @file Line Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import { RepresentationRegistry } from "../globals.js";
import Representation from "./representation.js";
import StructureRepresentation from "./structure-representation.js";
import LineBuffer from "../buffer/line-buffer.js";


/**
 * Line representation object
 * @class
 * @extends StructureRepresentation
 * @param {Structure} structure - the structure to be represented
 * @param {Viewer} viewer - a viewer object
 * @param {RepresentationParameters} params - representation parameters, plus the properties listed below
 * @property {String} multipleBond - one off "off", "symmetric", "offset"
 * @param {Float} params.bondSpacing - spacing for multiple bond rendering
 * @param {null} params.flatShaded - not available
 * @param {null} params.side - not available
 * @param {null} params.wireframe - not available
 * @param {null} params.roughness - not available
 * @param {null} params.metalness - not available
 * @param {null} params.diffuse - not available
 */
function LineRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

}

LineRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: LineRepresentation,

    type: "line",

    parameters: Object.assign( {

        multipleBond: {
            type: "select", rebuild: true,
            options: {
                "off" : "off",
                "symmetric" : "symmetric",
                "offset": "offset"
            }
        },
        bondSpacing: {
            type: "number", precision: 2, max: 2.0, min: 0.5
        }


    }, Representation.prototype.parameters, {

        flatShaded: null,
        side: null,
        wireframe: null,

        roughness: null,
        metalness: null,
        diffuse: null,

    } ),

    init: function( params ){

        var p = params || {};

        this.multipleBond = defaults( p.multipleBond, "off" );
        this.bondSpacing = defaults( p.bondSpacing, 1.0 );

        StructureRepresentation.prototype.init.call( this, p );

    },

    getBondParams: function( what, params ){

        params = Object.assign( {
            multipleBond: this.multipleBond,
            bondSpacing: this.bondSpacing,
            radiusParams: { "radius": 0.1, "scale": 1 }
        }, params );

        return StructureRepresentation.prototype.getBondParams.call( this, what, params );

    },

    createData: function( sview ){

        var what = { position: true, color: true };
        var bondData = sview.getBondData( this.getBondParams( what ) );

        var lineBuffer = new LineBuffer(
            bondData.position1,
            bondData.position2,
            bondData.color1,
            bondData.color2,
            this.getBufferParams()
        );

        return {
            bufferList: [ lineBuffer ]
        };

    },

    updateData: function( what, data ){

        var bondData = data.sview.getBondData( this.getBondParams( what ) );
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

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params.bondSpacing ){
            what.position = true;
        }

        StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


RepresentationRegistry.add( "line", LineRepresentation );


export default LineRepresentation;
