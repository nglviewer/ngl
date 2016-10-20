uniform sampler2D fontTexture;
uniform float opacity;
uniform bool showBorder;
uniform vec3 borderColor;
uniform float borderWidth;
uniform vec3 backgroundColor;
uniform float backgroundOpacity;
uniform float nearClip;
uniform float clipRadius;

varying vec3 vViewPosition;
varying vec2 texCoord;

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

#include common
#include color_pars_fragment
#include fog_pars_fragment

#ifdef SDF
    const float smoothness = 16.0;
#else
    const float smoothness = 256.0;
#endif
const float gamma = 2.2;

void main(){

    #include nearclip_fragment
    #include radiusclip_fragment

    if( texCoord.x > 1.0 ){

        gl_FragColor = vec4( backgroundColor, backgroundOpacity );

    }else{

        // retrieve signed distance
        float sdf = texture2D( fontTexture, texCoord ).a;
        if( showBorder ) sdf += borderWidth;

        // perform adaptive anti-aliasing of the edges
        float w = clamp(
            smoothness * ( abs( dFdx( texCoord.x ) ) + abs( dFdy( texCoord.y ) ) ),
            0.0,
            0.5
        );
        float a = smoothstep( 0.5 - w, 0.5 + w, sdf );

        // gamma correction for linear attenuation
        a = pow( a, 1.0 / gamma );
        if( a < 0.2 ) discard;
        a *= opacity;

        vec3 outgoingLight = vColor;
        if( showBorder && sdf < ( 0.5 + borderWidth ) ){
            outgoingLight = borderColor;
        }

        gl_FragColor = vec4( outgoingLight, a );

    }

    #include premultiplied_alpha_fragment
    #include tonemapping_fragment
    #include encodings_fragment
    #include fog_fragment

}