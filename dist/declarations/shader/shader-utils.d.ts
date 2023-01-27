/**
 * @file Shader Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import './chunk/fog_fragment.glsl';
import './chunk/interior_fragment.glsl';
import './chunk/matrix_scale.glsl';
import './chunk/nearclip_vertex.glsl';
import './chunk/nearclip_fragment.glsl';
import './chunk/opaque_back_fragment.glsl';
import './chunk/radiusclip_vertex.glsl';
import './chunk/radiusclip_fragment.glsl';
import './chunk/unpack_color.glsl';
export declare type ShaderDefine = ('NEAR_CLIP' | 'RADIUS_CLIP' | 'PICKING' | 'NOLIGHT' | 'FLAT_SHADED' | 'OPAQUE_BACK' | 'DIFFUSE_INTERIOR' | 'USE_INTERIOR_COLOR' | 'USE_SIZEATTENUATION' | 'USE_MAP' | 'ALPHATEST' | 'SDF' | 'FIXED_SIZE' | 'CUBIC_INTERPOLATION' | 'BSPLINE_FILTER' | 'CATMULROM_FILTER' | 'MITCHELL_FILTER');
export declare type ShaderDefines = {
    [k in ShaderDefine]?: number | string;
};
export declare function getShader(name: string, defines?: ShaderDefines): string;
