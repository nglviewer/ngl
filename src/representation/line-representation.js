/**
 * @file Line Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import { RepresentationRegistry } from "../globals.js";
import StructureRepresentation from "./structure-representation.js";
import LineBuffer from "../buffer/line-buffer.js";


/**
 * Line representation
 */
class LineRepresentation extends StructureRepresentation{

    /**
     * Create Line representation object
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
    constructor( structure, viewer, params ){

        super( structure, viewer, params );

        this.type = "line";

        this.parameters = Object.assign( {

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


        }, this.parameters, {

            flatShaded: null,
            side: null,
            wireframe: null,

            roughness: null,
            metalness: null,
            diffuse: null,

        } );

        this.init( params );

    }

    init( params ){

        var p = params || {};

        this.multipleBond = defaults( p.multipleBond, "off" );
        this.bondSpacing = defaults( p.bondSpacing, 1.0 );

        super.init( p );

    }

    getBondParams( what, params ){

        params = Object.assign( {
            multipleBond: this.multipleBond,
            bondSpacing: this.bondSpacing,
            radiusParams: { "radius": 0.1, "scale": 1 }
        }, params );

        return super.getBondParams( what, params );

    }

    createData( sview ){

        var what = { position: true, color: true };
        var bondData = sview.getBondData( this.getBondParams( what ) );

        var lineBuffer = new LineBuffer(
            bondData, this.getBufferParams()
        );

        return {
            bufferList: [ lineBuffer ]
        };

    }

    updateData( what, data ){

        var bondData = data.sview.getBondData( this.getBondParams( what ) );
        var lineData = {};

        if( !what || what.position ){
            lineData.position1 = bondData.position1;
            lineData.position2 = bondData.position2;
        }

        if( !what || what.color ){
            lineData.color = bondData.color;
            lineData.color2 = bondData.color2;
        }

        data.bufferList[ 0 ].setAttributes( lineData );

    }

    setParameters( params ){

        var rebuild = false;
        var what = {};

        if( params && params.bondSpacing ){
            what.position = true;
        }

        super.setParameters( params, what, rebuild );

        return this;

    }

}


RepresentationRegistry.add( "line", LineRepresentation );


export default LineRepresentation;
