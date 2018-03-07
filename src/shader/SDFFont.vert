uniform float clipNear;
uniform float clipRadius;
uniform vec3 clipCenter;
uniform float xOffset;
uniform float yOffset;
uniform float zOffset;
uniform bool ortho;
uniform float canvasHeight;
uniform float pixelRatio;

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

    float _xOffset = xOffset * scale;
    float _yOffset = yOffset * scale;
    float _zOffset = zOffset * scale;
    if( texCoord.x == 10.0 ){
        _zOffset -= 0.001;
    }

    vec4 cameraPos = modelViewMatrix * vec4( position, 1.0 );

    #ifdef FIXED_SIZE
        if ( ortho ) {
            scale /= pixelRatio * (( canvasHeight / 2.0 ) / -cameraPosition.z) * 0.1;
        } else {
            scale /= pixelRatio * (( canvasHeight / 2.0 ) / -cameraPos.z) * 0.1;
        }
    #endif

    vec4 cameraCornerPos = vec4( cameraPos.xyz, 1.0 );
    cameraCornerPos.xy += mapping * inputSize * 0.01 * scale;
    cameraCornerPos.x += _xOffset;
    cameraCornerPos.y += _yOffset;
    if( ortho ){
        cameraCornerPos.xyz += normalize( -cameraPosition ) * _zOffset;
    } else {
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