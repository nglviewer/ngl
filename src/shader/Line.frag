uniform float opacity;
uniform float nearClip;

varying vec3 vViewPosition;

#include common
#include color_pars_fragment
#include fog_pars_fragment

void main(){

    #include nearclip_fragment

    gl_FragColor = vec4( vColor, opacity );

    #include premultiplied_alpha_fragment
    #include tonemapping_fragment
    #include encodings_fragment
    #include fog_fragment

}