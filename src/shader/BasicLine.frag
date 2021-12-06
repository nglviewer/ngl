uniform vec3 uColor;

#include common
#include fog_pars_fragment

void main(){

    gl_FragColor = vec4( uColor, 1.0 );

    #include premultiplied_alpha_fragment
    #include tonemapping_fragment
    #include encodings_fragment
    #include fog_fragment

}