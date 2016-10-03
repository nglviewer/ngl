uniform vec3 diffuse;
uniform float opacity;
uniform float nearClip;
uniform float clipRadius;

varying vec3 vViewPosition;

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

#ifdef USE_MAP
    uniform sampler2D map;
#endif

#include common
#include color_pars_fragment
#include fog_pars_fragment

void main(){

    #include nearclip_fragment
    #include radiusclip_fragment

    vec3 outgoingLight = vec3( 0.0 );
    vec4 diffuseColor = vec4( diffuse, 1.0 );

    #ifdef USE_MAP
        diffuseColor *= texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) );
    #endif

    #include color_fragment
    #include alphatest_fragment

    outgoingLight = diffuseColor.rgb;

    gl_FragColor = vec4( outgoingLight, diffuseColor.a * opacity );

    #include premultiplied_alpha_fragment
    #include tonemapping_fragment
    #include encodings_fragment
    #include fog_fragment

}