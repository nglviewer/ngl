
varying vec3 vNormal;
varying vec3 vColor;

#include light_params

#include fog_params


void main()
{

	vec3 transformedNormal = normalize( vNormal );
	if( !gl_FrontFacing ) transformedNormal = -normalize( vNormal );
		

    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );

	#include light

    gl_FragColor = vec4( vColor, 1.0 );
    //gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
	gl_FragColor.xyz *= vLightFront;

	#include fog

}
