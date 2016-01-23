#define STANDARD

#if defined( PICKING )
    attribute vec3 pickingColor;
    varying vec3 vPickingColor;
#elif defined( NOLIGHT )
    varying vec3 vColor;
#else
    varying vec3 vViewPosition;
    #include color_pars_vertex
    #ifndef FLAT_SHADED
        varying vec3 vNormal;
    #endif
#endif

#include common

void main(){

    #if defined( PICKING )
        vPickingColor = pickingColor;
    #elif defined( NOLIGHT )
        vColor = color;
    #else
        #include color_vertex
        #include beginnormal_vertex
        #include defaultnormal_vertex
        #ifndef FLAT_SHADED  // Normal computed with derivatives when FLAT_SHADED
            vNormal = normalize( transformedNormal );
        #endif
    #endif

    #include begin_vertex
    #include project_vertex

    #if !defined( PICKING ) && !defined( NOLIGHT )
        vViewPosition = -mvPosition.xyz;
    #endif
}