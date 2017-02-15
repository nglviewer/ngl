/**
 * @file Colormaker Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Color } from "../../lib/three.es6.js";

import Selection from "../selection.js";
import { generateUUID } from "../math/math-utils.js";
import Colormaker from "./colormaker.js";


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

    addSelectionScheme( pairList, label ){

        return this.addScheme( function(){

            var colorList = [];
            var selectionList = [];

            pairList.forEach( function( pair ){

                colorList.push( new Color( pair[ 0 ] ).getHex() );
                selectionList.push( new Selection( pair[ 1 ] ) );

            } );

            var n = pairList.length;

            this.atomColor = function( a ){

                for( var i = 0; i < n; ++i ){

                    if( selectionList[ i ].test( a ) ){

                        return colorList[ i ];

                    }

                }

                return 0xFFFFFF;

            };

        }, label );

    }

}


export default ColormakerRegistry;
