#define STANDARD

uniform float clipNear;
uniform vec3 clipCenter;

#if defined( NEAR_CLIP ) || defined( RADIUS_CLIP ) || !defined( PICKING )
    varying vec3 vViewPosition;
#endif

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

attribute vec3 dir;
attribute float size;

#ifdef PICKING
    #include unpack_color
    attribute float primitiveId;
    varying vec3 vPickingColor;
#else
    #include color_pars_vertex
    #ifndef FLAT_SHADED
        varying vec3 vNormal;
    #endif
#endif

#include common

void main(void){

    #ifdef PICKING
        vPickingColor = unpackColor( primitiveId );
    #else
        #include color_vertex
        #include beginnormal_vertex
        #include defaultnormal_vertex
        // Normal computed with derivatives when FLAT_SHADED
        #ifndef FLAT_SHADED
            vNormal = normalize( transformedNormal );
        #endif
    #endif

    #include begin_vertex

    transformed += normalize( dir ) * size;

    #include project_vertex

    #if defined( NEAR_CLIP ) || defined( RADIUS_CLIP ) || !defined( PICKING )
        vViewPosition = -mvPosition.xyz;
    #endif

    #if defined( RADIUS_CLIP )
        vClipCenter = -( modelViewMatrix * vec4( clipCenter, 1.0 ) ).xyz;
    #endif

    #include nearclip_vertex

}