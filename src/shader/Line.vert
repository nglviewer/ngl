uniform float nearClip;

varying vec3 vViewPosition;

#include color_pars_vertex

void main(){

    #include color_vertex
    #include begin_vertex
    #include project_vertex

    vViewPosition = -mvPosition.xyz;

    #include nearclip_vertex

}