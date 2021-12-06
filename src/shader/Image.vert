uniform float clipRadius;
uniform vec3 clipCenter;

varying vec2 vUv;
#if defined( NEAR_CLIP ) || defined( RADIUS_CLIP ) || !defined( PICKING )
	varying vec3 vViewPosition;
#endif

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif


void main() {

    #include begin_vertex
    #include project_vertex

	vUv = uv;
	#if defined( NEAR_CLIP ) || defined( RADIUS_CLIP ) || !defined( PICKING )
    	vViewPosition = -mvPosition.xyz;
	#endif

    #if defined( RADIUS_CLIP )
        vClipCenter = -( modelViewMatrix * vec4( clipCenter, 1.0 ) ).xyz;
    #endif

}