/**
 * @file Shader Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ShaderChunk } from "../../lib/three.es6.js";

import CylinderImpostor_vert from "./CylinderImpostor.vert";
import CylinderImpostor_frag from "./CylinderImpostor.frag";
import HyperballStickImpostor_vert from "./HyperballStickImpostor.vert";
import HyperballStickImpostor_frag from "./HyperballStickImpostor.frag";
import Line_vert from "./Line.vert";
import Line_frag from "./Line.frag";
import Mesh_vert from "./Mesh.vert";
import Mesh_frag from "./Mesh.frag";
import Point_vert from "./Point.vert";
import Point_frag from "./Point.frag";
import Quad_vert from "./Quad.vert";
import Quad_frag from "./Quad.frag";
import Ribbon_vert from "./Ribbon.vert";
import SDFFont_vert from "./SDFFont.vert";
import SDFFont_frag from "./SDFFont.frag";
import SphereImpostor_vert from "./SphereImpostor.vert";
import SphereImpostor_frag from "./SphereImpostor.frag";

import DullInteriorFragment_glsl from "./chunk/dull_interior_fragment.glsl";
import FogFragment_glsl from "./chunk/fog_fragment.glsl";
import NearclipFragment_glsl from "./chunk/nearclip_fragment.glsl";
import NearclipVertex_glsl from "./chunk/nearclip_vertex.glsl";
import OpaqueBackFragment_glsl from "./chunk/opaque_back_fragment.glsl";


var Resources = {

    // shaders
    'shader/CylinderImpostor.vert': CylinderImpostor_vert,
    'shader/CylinderImpostor.frag': CylinderImpostor_frag,
    'shader/HyperballStickImpostor.vert': HyperballStickImpostor_vert,
    'shader/HyperballStickImpostor.frag': HyperballStickImpostor_frag,
    'shader/Line.vert': Line_vert,
    'shader/Line.frag': Line_frag,
    // 'shader/LineSprite.vert': null,
    // 'shader/LineSprite.frag': null,
    'shader/Mesh.vert': Mesh_vert,
    'shader/Mesh.frag': Mesh_frag,
    // 'shader/ParticleSprite.vert': null,
    // 'shader/ParticleSprite.frag': null,
    'shader/Point.vert': Point_vert,
    'shader/Point.frag': Point_frag,
    'shader/Quad.vert': Quad_vert,
    'shader/Quad.frag': Quad_frag,
    'shader/Ribbon.vert': Ribbon_vert,
    'shader/SDFFont.vert': SDFFont_vert,
    'shader/SDFFont.frag': SDFFont_frag,
    // 'shader/SphereHalo.vert': null,
    // 'shader/SphereHalo.frag': null,
    'shader/SphereImpostor.vert': SphereImpostor_vert,
    'shader/SphereImpostor.frag': SphereImpostor_frag,

    // shader chunks
    'shader/chunk/dull_interior_fragment.glsl': DullInteriorFragment_glsl,
    'shader/chunk/fog_fragment.glsl': FogFragment_glsl,
    'shader/chunk/nearclip_fragment.glsl': NearclipFragment_glsl,
    'shader/chunk/nearclip_vertex.glsl': NearclipVertex_glsl,
    'shader/chunk/opaque_back_fragment.glsl': OpaqueBackFragment_glsl,

};


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

        var shaderText = Resources[ 'shader/' + name ];
        if( !shaderText ){
            throw "empty shader, '" + name + "'";
        }
        shaderText = shaderText.replace( reInclude, function( match, p1 ){

            var path = 'shader/chunk/' + p1 + '.glsl';
            var chunk = Resources[ path ] || ShaderChunk[ p1 ];

            return chunk ? chunk : "";

        } );

        shaderCache[ hash ] = definesText + shaderText;

    }

    return shaderCache[ hash ];

}


export {
	getShader
};
