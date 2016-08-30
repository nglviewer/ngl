/**
 * @file Label Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Browser, RepresentationRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import LabelFactory from "../utils/label-factory.js";
import StructureRepresentation from "./structure-representation.js";
import TextBuffer from "../buffer/text-buffer.js";


/**
 * Label representation parameter object.
 * @typedef {Object} LabelRepresentationParameters - label representation parameters
 *
 * @property {Integer} clipNear - position of camera near/front clipping plane
 *                                in percent of scene bounding box
 * @property {Float} opacity - translucency: 1 is fully opaque, 0 is fully transparent
 * @property {String} labelType - type of the label, one of:
 *                                 "atomname", "atomindex", "occupancy", "bfactor",
 *                                 "serial", "element", "atom", "resname", "resno",
 *                                 "res", "text", "qualified". When set to "text", the
 *                                 `labelText` list is used.
 * @property {String[]} labelText - list of label strings, must set `labelType` to "text"
 *                                   to take effect
 * @property {String} fontFamily - font family, one of: "sans-serif", "monospace", "serif"
 * @property {String} fontStyle - font style, "normal" or "italic"
 * @property {String} fontWeight - font weight, "normal" or "bold"
 * @property {Boolean} sdf - use "signed distance field"-based rendering for sharper edges
 * @property {Float} xOffset - offset in x-direction
 * @property {Float} yOffset - offset in y-direction
 * @property {Float} zOffset - offset in z-direction (i.e. in camera direction)
 * @property {String} attachment - attachment of the label, one of:
 *                                 "bottom-left", "bottom-center", "bottom-right",
 *                                 "middle-left", "middle-center", "middle-right",
 *                                 "top-left", "top-center", "top-right"
 * @property {Boolean} showBorder - show border/outline
 * @property {Color} borderColor - color of the border/outline
 * @property {Float} borderWidth - width of the border/outline
 * @property {Boolean} showBackground - show background rectangle
 * @property {Color} backgroundColor - color of the background
 * @property {Float} backgroundMargin - width of the background
 * @property {Float} backgroundOpacity - opacity of the background
 */


/**
 * Label representation object
 * @class
 * @extends StructureRepresentation
 * @param {Structure} structure - the structure to be represented
 * @param {Viewer} viewer - a viewer object
 * @param {LabelRepresentationParameters} params - label representation parameters
 */
function LabelRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

}

LabelRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: LabelRepresentation,

    type: "label",

    parameters: Object.assign( {

        labelType: {
            type: "select", options: LabelFactory.types, rebuild: true
        },
        labelText: {
            type: "hidden", rebuild: true
        },
        fontFamily: {
            type: "select", options: {
                "sans-serif": "sans-serif",
                "monospace": "monospace",
                "serif": "serif"
            },
            buffer: true
        },
        fontStyle: {
            type: "select", options: {
                "normal": "normal",
                "italic": "italic"
            },
            buffer: true
        },
        fontWeight: {
            type: "select", options: {
                "normal": "normal",
                "bold": "bold"
            },
            buffer: true
        },
        sdf: {
            type: "boolean", buffer: true
        },
        xOffset: {
            type: "number", precision: 1, max: 20, min: -20, buffer: true
        },
        yOffset: {
            type: "number", precision: 1, max: 20, min: -20, buffer: true
        },
        zOffset: {
            type: "number", precision: 1, max: 20, min: -20, buffer: true
        },
        attachment: {
            type: "select", options: {
                "bottom-left": "bottom-left",
                "bottom-center": "bottom-center",
                "bottom-right": "bottom-right",
                "middle-left": "middle-left",
                "middle-center": "middle-center",
                "middle-right": "middle-right",
                "top-left": "top-left",
                "top-center": "top-center",
                "top-right": "top-right"
            },
            rebuild: true
        },
        showBorder: {
            type: "boolean", buffer: true
        },
        borderColor: {
            type: "color", buffer: true
        },
        borderWidth: {
            type: "number", precision: 2, max: 0.3, min: 0, buffer: true
        },
        showBackground: {
            type: "boolean", rebuild: true
        },
        backgroundColor: {
            type: "color", buffer: true
        },
        backgroundMargin: {
            type: "number", precision: 2, max: 2, min: 0, rebuild: true
        },
        backgroundOpacity: {
            type: "range", step: 0.01, max: 1, min: 0, buffer: true
        },

    }, StructureRepresentation.prototype.parameters, {

        side: null,
        flatShaded: null,
        wireframe: null,
        linewidth: null,

        roughness: null,
        metalness: null,
        diffuse: null,

    } ),

    init: function( params ){

        var p = params || {};

        this.labelType = defaults( p.labelType, "res" );
        this.labelText = defaults( p.labelText, {} );
        this.fontFamily = defaults( p.fontFamily, "sans-serif" );
        this.fontStyle = defaults( p.fontStyle, "normal" );
        this.fontWeight = defaults( p.fontWeight, "bold" );
        this.sdf = defaults( p.sdf, Browser === "Chrome" );
        this.xOffset = defaults( p.xOffset, 0.0 );
        this.yOffset = defaults( p.yOffset, 0.0 );
        this.zOffset = defaults( p.zOffset, 0.5 );
        this.attachment = defaults( p.attachment, "bottom-left" );
        this.showBorder = defaults( p.showBorder, false );
        this.borderColor = defaults( p.borderColor, "lightgrey" );
        this.borderWidth = defaults( p.borderWidth, 0.15 );
        this.showBackground = defaults( p.showBackground, false );
        this.backgroundColor = defaults( p.backgroundColor, "lightgrey" );
        this.backgroundMargin = defaults( p.backgroundMargin, 0.5 );
        this.backgroundOpacity = defaults( p.backgroundOpacity, 1.0 );

        StructureRepresentation.prototype.init.call( this, p );

    },

    createData: function( sview ){

        var what = { position: true, color: true, radius: true };
        var atomData = sview.getAtomData( this.getAtomParams( what ) );

        var text = [];
        var labelFactory = new LabelFactory(
            this.labelType, this.labelText
        );
        sview.eachAtom( function( ap ){
            text.push( labelFactory.atomLabel( ap ) );
        } );

        var textBuffer = new TextBuffer(
            atomData.position,
            atomData.radius,
            atomData.color,
            text,
            this.getBufferParams( {
                fontFamily: this.fontFamily,
                fontStyle: this.fontStyle,
                fontWeight: this.fontWeight,
                sdf: this.sdf,
                xOffset: this.xOffset,
                yOffset: this.yOffset,
                zOffset: this.zOffset,
                attachment: this.attachment,
                showBorder: this.showBorder,
                borderColor: this.borderColor,
                borderWidth: this.borderWidth,
                showBackground: this.showBackground,
                backgroundColor: this.backgroundColor,
                backgroundMargin: this.backgroundMargin,
                backgroundOpacity: this.backgroundOpacity
            } )
        );

        return {
            bufferList: [ textBuffer ]
        };

    },

    updateData: function( what, data ){

        var atomData = data.sview.getAtomData( this.getAtomParams( what ) );
        var textData = {};

        if( !what || what.position ){
            textData.position = atomData.position;
        }

        if( !what || what.radius ){
            textData.size = atomData.radius;
        }

        if( !what || what.color ){
            textData.color = atomData.color;
        }

        data.bufferList[ 0 ].setAttributes( textData );

    }

} );


RepresentationRegistry.add( "label", LabelRepresentation );


export default LabelRepresentation;
