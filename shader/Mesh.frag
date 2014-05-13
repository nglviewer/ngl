
varying vec3 vNormal;
varying vec3 vColor;

const float opacity = 0.5;

#include light_params

#include fog_params


void main()
{

	vec3 transformedNormal = normalize( vNormal );
	if( !gl_FrontFacing ) transformedNormal = -normalize( vNormal );
		

    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );

	#include light

    // gl_FragColor = vec4( vColor * opacity, opacity );
    gl_FragColor = vec4( vec3( 1.0, 0.6, 0.0 ), opacity );
    //gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
	gl_FragColor.xyz *= vLightFront;

	#include fog

}
