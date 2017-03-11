/**
 * @file Colormaker Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { generateUUID } from "../math/math-utils.js";
import Colormaker from "./colormaker.js";
import SelectionColormaker from "./selection-colormaker.js";


var ColormakerScales = {

    "": "",

    // Sequential
    "OrRd": "[S] Orange-Red",
    "PuBu": "[S] Purple-Blue",
    "BuPu": "[S] Blue-Purple",
    "Oranges": "[S] Oranges",
    "BuGn": "[S] Blue-Green",
    "YlOrBr": "[S] Yellow-Orange-Brown",
    "YlGn": "[S] Yellow-Green",
    "Reds": "[S] Reds",
    "RdPu": "[S] Red-Purple",
    "Greens": "[S] Greens",
    "YlGnBu": "[S] Yellow-Green-Blue",
    "Purples": "[S] Purples",
    "GnBu": "[S] Green-Blue",
    "Greys": "[S] Greys",
    "YlOrRd": "[S] Yellow-Orange-Red",
    "PuRd": "[S] Purple-Red",
    "Blues": "[S] Blues",
    "PuBuGn": "[S] Purple-Blue-Green",

    // Diverging
    "Spectral": "[D] Spectral",
    "RdYlGn": "[D] Red-Yellow-Green",
    "RdBu": "[D] Red-Blue",
    "PiYG": "[D] Pink-Yellowgreen",
    "PRGn": "[D] Purplered-Green",
    "RdYlBu": "[D] Red-Yellow-Blue",
    "BrBG": "[D] Brown-Bluegreen",
    "RdGy": "[D] Red-Grey",
    "PuOr": "[D] Purple-Orange",

    // Qualitative
    "Set1": "[Q] Set1",
    "Set2": "[Q] Set2",
    "Set3": "[Q] Set3",
    "Dark2": "[Q] Dark2",
    "Paired": "[Q] Paired",
    "Pastel1": "[Q] Pastel1",
    "Pastel2": "[Q] Pastel2",
    "Accent": "[Q] Accent",

    // Other
    "roygb": "[?] Rainbow",
    "rwb": "[?] Red-White-Blue",

};

var ColormakerModes = {

    "": "",

    "rgb": "Red Green Blue",
    "hsv": "Hue Saturation Value",
    "hsl": "Hue Saturation Lightness",
    "hsi": "Hue Saturation Intensity",
    "lab": "CIE L*a*b*",
    "hcl": "Hue Chroma Lightness"

};


class ColormakerRegistry{

    constructor(){

        this.schemes = {};
        this.userSchemes = {};

    }

    getScheme( params ){

        var p = params || {};

        var id = p.scheme || "";

        var schemeClass;

        if( id in this.schemes ){

            schemeClass = this.schemes[ id ];

        }else if( id in this.userSchemes ){

            schemeClass = this.userSchemes[ id ];

        }else{

            schemeClass = Colormaker;

        }

        return new schemeClass( params );

    }

    getPickingScheme( params ){

        var p = Object.assign( params || {} );
        p.scheme = "picking";

        return this.getScheme( p );

    }

    getSchemes(){

        var types = {};

        Object.keys( this.schemes ).forEach( function( k ){
            types[ k ] = k;
        } );

        Object.keys( this.userSchemes ).forEach( function( k ){
            types[ k ] = k.split( "|" )[ 1 ];
        } );

        return types;

    }

    getScales(){

        return ColormakerScales;

    }

    getModes(){

        return ColormakerModes;

    }

    add( id, scheme ){

        this.schemes[ id ] = scheme;

    }

    addScheme( scheme, label ){

        if( !( scheme instanceof Colormaker ) ){
            scheme = this.createScheme( scheme, label );
        }

        return this.addUserScheme( scheme, label );

    }

    addUserScheme( scheme, label ){

        label = label || "";
        var id = "" + generateUUID() + "|" + label;
        this.userSchemes[ id ] = scheme;

        return id;

    }

    removeScheme( id ){

        delete this.userSchemes[ id ];

    }

    createScheme( constructor, label ){

        var _Colormaker = function( params ){
            Colormaker.call( this, params );
            this.label = label || "";
            constructor.call( this, params );
        };

        _Colormaker.prototype = Colormaker.prototype;
        _Colormaker.prototype.constructor = Colormaker;

        return _Colormaker;

    }

    addSelectionScheme( dataList, label ){

        class MySelectionColormaker extends SelectionColormaker{
            constructor( params ){
                super( Object.assign( { dataList: dataList }, params ) );
            }
        }

        return this.addUserScheme( MySelectionColormaker, label );

    }

    hasScheme( id ) {
        return id in this.schemes || id in this.userSchemes;
    }

}


export default ColormakerRegistry;
