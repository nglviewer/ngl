uniform float clipNear;
uniform vec3 clipCenter;

varying vec3 vViewPosition;

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

#include color_pars_vertex

void main(){

    #include color_vertex
    #include begin_vertex
    #include project_vertex

    vViewPosition = -mvPosition.xyz;

    #if defined( RADIUS_CLIP )
        vClipCenter = -( modelViewMatrix * vec4( clipCenter, 1.0 ) ).xyz;
    #endif

    #include nearclip_vertex

}