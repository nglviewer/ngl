// heavily based on code by WestLangley from https://github.com/WestLangley/three.js/blob/af28b2fb706ac109771ecad0a7447fad90ab3210/examples/js/lines/LineMaterial.js

uniform float clipNear;
uniform vec3 clipCenter;
uniform float linewidth;
uniform vec2 resolution;
uniform mat4 projectionMatrixInverse;

attribute vec2 mapping;
attribute vec3 position1;
attribute vec3 position2;

#ifdef PICKING
    #include unpack_color
    attribute float primitiveId;
    varying vec3 vPickingColor;
#else
    attribute vec3 color2;
    varying vec3 vColor;
    varying vec3 vColor2;
    varying float flag;
    varying vec3 vViewPosition;
#endif

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

void trimSegment( const in vec4 start, inout vec4 end ) {
    // trim end segment so it terminates between the camera plane and the near plane
    // conservative estimate of the near plane
    float a = projectionMatrix[ 2 ][ 2 ];  // 3nd entry in 3th column
    float b = projectionMatrix[ 3 ][ 2 ];  // 3nd entry in 4th column
    float nearEstimate = - 0.5 * b / a;
    float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );
    end.xyz = mix( start.xyz, end.xyz, alpha );
}

void main() {

    float aspect = resolution.x / resolution.y;

    #ifdef PICKING
        vPickingColor = unpackColor( primitiveId );
    #else
        flag = mapping.y;
        vColor = color;
        vColor2 = color2;
    #endif

    // camera space
    vec4 start = modelViewMatrix * vec4( position1, 1.0 );
    vec4 end = modelViewMatrix * vec4( position2, 1.0 );

    // special case for perspective projection, and segments that terminate either in, or behind, the camera plane
    // clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
    // but we need to perform ndc-space calculations in the shader, so we must address this issue directly
    // perhaps there is a more elegant solution -- WestLangley
    bool perspective = ( projectionMatrix[ 2 ][ 3 ] == -1.0 ); // 4th entry in the 3rd column
    if ( perspective ) {
        if ( start.z < 0.0 && end.z >= 0.0 ) {
            trimSegment( start, end );
        } else if ( end.z < 0.0 && start.z >= 0.0 ) {
            trimSegment( end, start );
        }
    }

    // clip space
    vec4 clipStart = projectionMatrix * start;
    vec4 clipEnd = projectionMatrix * end;

    // ndc space
    vec2 ndcStart = clipStart.xy / clipStart.w;
    vec2 ndcEnd = clipEnd.xy / clipEnd.w;

    // direction
    vec2 dir = ndcEnd - ndcStart;

    // account for clip-space aspect ratio
    dir.x *= aspect;
    dir = normalize( dir );

    // perpendicular to dir
    vec2 offset = vec2( dir.y, - dir.x );

    // undo aspect ratio adjustment
    dir.x /= aspect;
    offset.x /= aspect;

    // sign flip
    if ( mapping.x < 0.0 ) offset *= - 1.0;

    // not used
    // // endcaps
    // if ( mapping.y < 0.0 ) {
    //     offset += -dir;
    // } else if ( mapping.y > 0.0 ) {
    //     offset += dir;
    // }

    // adjust for linewidth
    offset *= linewidth;

    // adjust for clip-space to screen-space conversion
    offset /= resolution.y;

    // select end
    vec4 clip = ( mapping.y < 0.5 ) ? clipStart : clipEnd;

    // back to clip space
    offset *= clip.w;
    clip.xy += offset;
    gl_Position = clip;

    #ifndef PICKING
        vViewPosition = ( projectionMatrixInverse * clip ).xyz;
    #endif

    #if defined( RADIUS_CLIP )
        vClipCenter = -( modelViewMatrix * vec4( clipCenter, 1.0 ) ).xyz;
    #endif

    #include nearclip_vertex

}