
#extension GL_OES_standard_derivatives : enable

uniform sampler2D fontTexture;

varying vec3 vColor;
varying vec2 texCoord;

#include fog_params

// The right value for crisp fonts is 0.25 / (spread * scale),
// where spread is the value you used when generating the font,
// and scale is the scale you're drawing it at.
// const float smoothing = 0.25 / (4.0 * 4.0);

// void main2() {

//     float distance = texture2D( fontTexture, texCoord ).a;
//     float alpha = smoothstep( 0.5 - smoothing, 0.5 + smoothing, distance );
//     gl_FragColor = vec4( colorx, alpha );

//     // gl_FragColor = texture2D( fontTexture, texCoord );

//     #include fog_fragment
// }



const float smoothness = 16.0;
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

    // gamma correction for linear attenuation
    a = pow( a, 1.0 / gamma );
    gl_FragColor = vec4( vColor, a );

    #include fog

}
