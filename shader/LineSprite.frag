
varying float dist;
varying highp vec3 color;
varying highp vec3 color2;
varying vec3 vNormal;

#include light_params

#include fog_params


void main() {

	vec3 transformedNormal = vNormal;
	if ( !gl_FrontFacing )
		transformedNormal *= -1.0;
    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );
    
    #include light

    if( dist > 0.5 ){
        gl_FragColor = vec4( color, 1.0 );    
    }else{
        gl_FragColor = vec4( color2, 1.0 );
    }

    gl_FragColor.xyz *= vLightFront;

    #include fog
}
