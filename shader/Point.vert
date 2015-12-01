uniform float nearClip;
uniform float size;
uniform float canvasHeight;
uniform float pixelRatio;

#include color_pars_vertex
#include common

void main(){

    #include color_vertex

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    #ifdef USE_SIZEATTENUATION
        gl_PointSize = size * pixelRatio * ( ( canvasHeight / 2.0 ) / -mvPosition.z );
    #else
        gl_PointSize = size * pixelRatio;
    #endif

    gl_Position = projectionMatrix * mvPosition;

    vec3 vViewPosition = -mvPosition.xyz;

    #include nearclip_vertex

}