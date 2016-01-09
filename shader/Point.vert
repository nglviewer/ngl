uniform float nearClip;
uniform float size;
uniform float canvasHeight;
uniform float pixelRatio;

varying vec3 vViewPosition;

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

    #include nearclip_vertex

}