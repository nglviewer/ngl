
#extension GL_OES_standard_derivatives : enable

uniform sampler2D fontTexture;

varying vec3 vColor;
varying vec2 texCoord;

#include fog_params

#ifndef ANTIALIAS
    const float smoothness = 8.0;
#else
    const float smoothness = 16.0;
#endif

const float gamma = 2.2;

void main() {

    // retrieve signed distance
    float sdf = texture2D( fontTexture, texCoord ).a;

    // perform adaptive anti-aliasing of the edges
    float w = clamp(
        smoothness * ( abs( dFdx( texCoord.x ) ) + abs( dFdy( texCoord.y ) ) ),
        0.0,
        0.5
    );
    float a = smoothstep( 0.5 - w, 0.5 + w, sdf );

    #ifndef ANTIALIAS
        if( a < 0.5 ) discard;
        a = 1.0;
    #else
        // gamma correction for linear attenuation
        a = pow( a, 1.0 / gamma );
    #endif

    gl_FragColor = vec4( vColor, a );

    #include fog

}

