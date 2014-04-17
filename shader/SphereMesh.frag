
varying vec3 color;
varying vec3 vNormal;

#include light_params

#include fog_params


void main() {

	vec3 transformedNormal = vNormal;
    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );
    
    #include light

    gl_FragColor = vec4( color, 1.0 );    

    gl_FragColor.xyz *= vLightFront;

    #include fog
}
