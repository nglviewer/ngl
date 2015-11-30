#define STANDARD

varying vec3 vViewPosition;

attribute vec3 dir;
attribute float size;

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

void main(void){

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
    transformed += normalize( dir ) * size;
    #include project_vertex
    vViewPosition = -mvPosition.xyz;

}