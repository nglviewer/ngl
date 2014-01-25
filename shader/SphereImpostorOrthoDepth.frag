
varying lowp vec2 mapping;

vec4 pack_depth( const in float depth ) {
    const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
    const vec4 bit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
    vec4 res = fract( depth * bit_shift );
    res -= res.xxyz * bit_mask;
    return res;
}

void main(void)
{   
    float lensqr = dot(mapping, mapping);
    if(lensqr > 1.0)
        discard;
    gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );
}



