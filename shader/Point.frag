uniform vec3 diffuse;
uniform float opacity;

#ifdef USE_MAP
    uniform sampler2D map;
#endif

#include common
#include color_pars_fragment
#include fog_pars_fragment

void main(){

    vec3 outgoingLight = vec3( 0.0 );
    vec4 diffuseColor = vec4( diffuse, 1.0 );

    #ifdef USE_MAP
        diffuseColor *= texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) );
    #endif

    #include color_fragment
    #include alphatest_fragment

    outgoingLight = diffuseColor.rgb;

    #include fog_fragment

    gl_FragColor = vec4( outgoingLight, diffuseColor.a * opacity );

}