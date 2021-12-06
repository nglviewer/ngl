uniform float clipNear;
uniform float clipRadius;
uniform vec3 clipCenter;
uniform float size;
uniform float canvasHeight;
uniform float pixelRatio;

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

#if defined( PICKING )
    #include unpack_color
    attribute float primitiveId;
    varying vec3 vPickingColor;
#else
    #include color_pars_vertex
    varying vec3 vViewPosition;
#endif

#include common

void main(){

    #if defined( PICKING )
        vPickingColor = unpackColor( primitiveId );
    #else
        #include color_vertex
    #endif

    #include begin_vertex
    #include project_vertex

    #ifdef USE_SIZEATTENUATION
        gl_PointSize = size * pixelRatio * ( ( canvasHeight / 2.0 ) / -mvPosition.z );
    #else
        gl_PointSize = size * pixelRatio;
    #endif

    #ifndef PICKING
        vViewPosition = -mvPosition.xyz;
    #endif

    #if defined( RADIUS_CLIP )
        vClipCenter = -( modelViewMatrix * vec4( clipCenter, 1.0 ) ).xyz;
    #endif

    #include nearclip_vertex
    #include radiusclip_vertex

}