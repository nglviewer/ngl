uniform float nearClip;
uniform float clipRadius;
uniform vec3 clipCenter;
uniform float xOffset;
uniform float yOffset;
uniform float zOffset;
uniform bool ortho;

#if defined( NEAR_CLIP ) || defined( RADIUS_CLIP ) || ( !defined( PICKING ) && !defined( NOLIGHT ) )
    varying vec3 vViewPosition;
#endif

varying vec2 texCoord;

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

#if defined( PICKING )
    #include unpack_color
    attribute float primitiveId;
    varying vec3 vPickingColor;
#else
    #include color_pars_vertex
#endif

attribute vec2 mapping;
attribute vec2 inputTexCoord;
attribute float inputSize;

#include matrix_scale
#include common

void main(void){

    #if defined( PICKING )
        vPickingColor = unpackColor( primitiveId );
    #else
        #include color_vertex
    #endif

    texCoord = inputTexCoord;

    float scale = matrixScale( modelViewMatrix );

    float _zOffset = zOffset * scale;
    if( texCoord.x == 10.0 ){
        _zOffset -= 0.001;
    }

    vec3 pos = position;
    if( ortho ){
        pos += normalize( cameraPosition ) * _zOffset;
    }
    vec4 cameraPos = modelViewMatrix * vec4( pos, 1.0 );
    vec4 cameraCornerPos = vec4( cameraPos.xyz, 1.0 );
    cameraCornerPos.xy += mapping * inputSize * 0.01 * scale;
    cameraCornerPos.x += xOffset * scale;
    cameraCornerPos.y += yOffset * scale;
    if( !ortho ){
        cameraCornerPos.xyz += normalize( -cameraCornerPos.xyz ) * _zOffset;
    }

    gl_Position = projectionMatrix * cameraCornerPos;

    #if defined( NEAR_CLIP ) || defined( RADIUS_CLIP ) || ( !defined( PICKING ) && !defined( NOLIGHT ) )
        vViewPosition = -cameraCornerPos.xyz;
    #endif

    #if defined( RADIUS_CLIP )
        vClipCenter = -( modelViewMatrix * vec4( clipCenter, 1.0 ) ).xyz;
    #endif

    #include nearclip_vertex
    #include radiusclip_vertex

}