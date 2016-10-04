/**
 * @file Shader Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ShaderChunk } from "../../lib/three.es6.js";

import "./chunk/dull_interior_fragment.glsl";
import "./chunk/fog_fragment.glsl";
import "./chunk/nearclip_vertex.glsl";
import "./chunk/nearclip_fragment.glsl";
import "./chunk/radiusclip_vertex.glsl";
import "./chunk/radiusclip_fragment.glsl";
import "./chunk/opaque_back_fragment.glsl";

import { ShaderRegistry } from "../globals.js";


function getDefines( defines ){

    if( defines === undefined ) return "";

    var lines = [];

    for ( var name in defines ) {

        var value = defines[ name ];

        if ( value === false ) continue;

        lines.push( '#define ' + name + ' ' + value );

    }

    return lines.join( '\n' ) + "\n";

}


var reInclude = /^(?!\/\/)\s*#include\s+(\S+)/gmi;
var shaderCache = {};

function getShader( name, defines ){

    defines = defines || {};

    var hash = name + "|";
    for( var key in defines ){
        hash += key + ":" + defines[ key ];
    }

    if( !shaderCache[ hash ] ){

        var definesText = getDefines( defines );

        var shaderText = ShaderRegistry.get( 'shader/' + name );
        if( !shaderText ){
            throw "empty shader, '" + name + "'";
        }
        shaderText = shaderText.replace( reInclude, function( match, p1 ){

            var path = 'shader/chunk/' + p1 + '.glsl';
            var chunk = ShaderRegistry.get( path ) || ShaderChunk[ p1 ];

            return chunk ? chunk : "";

        } );

        shaderCache[ hash ] = definesText + shaderText;

    }

    return shaderCache[ hash ];

}


export {
	getShader
};
