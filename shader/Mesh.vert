#define STANDARD

varying vec3 vViewPosition;

#ifdef PICKING
    attribute vec3 pickingColor;
    varying vec3 vPickingColor;
#else
    #include color_pars_vertex
    #ifndef FLAT_SHADED
        varying vec3 vNormal;
    #endif
#endif

#include common

void main(){

    #ifdef PICKING
        vPickingColor = pickingColor;
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
    vViewPosition = -mvPosition.xyz;

}