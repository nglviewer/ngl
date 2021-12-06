uniform float opacity;
uniform float clipNear;
uniform float clipRadius;

varying vec3 vViewPosition;

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

#include common
#include color_pars_fragment
#include fog_pars_fragment

void main(){

    #include nearclip_fragment
    #include radiusclip_fragment

    gl_FragColor = vec4( vColor, opacity );

    #include premultiplied_alpha_fragment
    #include tonemapping_fragment
    #include encodings_fragment
    #include fog_fragment

}