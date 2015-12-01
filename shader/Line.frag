uniform float opacity;
uniform float nearClip;

varying vec3 vViewPosition;

#include common
#include color_pars_fragment
#include fog_pars_fragment

void main(){

    #include nearclip_fragment

    vec3 outgoingLight = vColor;

    #include linear_to_gamma_fragment
    #include fog_fragment

    gl_FragColor = vec4( outgoingLight, opacity );

}