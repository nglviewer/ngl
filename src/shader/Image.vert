uniform float clipRadius;
uniform vec3 clipCenter;

varying vec2 vUv;
varying vec3 vViewPosition;

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif


void main() {

    #include begin_vertex
    #include project_vertex

	vUv = uv;
    vViewPosition = -mvPosition.xyz;

    #if defined( RADIUS_CLIP )
        vClipCenter = -( modelViewMatrix * vec4( clipCenter, 1.0 ) ).xyz;
    #endif

}