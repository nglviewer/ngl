
precision highp float;
precision highp int;

// uniform mat4 viewMatrix;
// uniform vec3 cameraPosition;

uniform float opacity;
uniform float nearClip;

varying vec3 vColor;
varying vec4 cameraPos;

#ifdef PICKING
    uniform float objectId;
#endif

#include fog_params


void main()
{

	#ifdef NEAR_CLIP
		if( dot( cameraPos, vec4( 0.0, 0.0, 1.0, nearClip ) ) > 0.0 )
        	discard;
    #endif

    gl_FragColor = vec4( vColor, opacity );

    #include fog

}
