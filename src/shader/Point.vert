uniform float nearClip;
uniform float clipRadius;
uniform vec3 clipCenter;
uniform float size;
uniform float canvasHeight;
uniform float pixelRatio;

varying vec3 vViewPosition;

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

#include color_pars_vertex
#include common

void main(){

    #include color_vertex
    #include begin_vertex
    #include project_vertex

    #ifdef USE_SIZEATTENUATION
        gl_PointSize = size * pixelRatio * ( ( canvasHeight / 2.0 ) / -mvPosition.z );
    #else
        gl_PointSize = size * pixelRatio;
    #endif

    vViewPosition = -mvPosition.xyz;

    #if defined( RADIUS_CLIP )
        vClipCenter = -( modelViewMatrix * vec4( clipCenter, 1.0 ) ).xyz;
    #endif

    #include nearclip_vertex
    #include radiusclip_vertex

}