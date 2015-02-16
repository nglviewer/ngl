
attribute vec2 mapping;
attribute vec2 inputTexCoord;
attribute float inputSize;
attribute vec3 color;

varying vec3 vColor;
varying vec2 texCoord;

uniform float nearClip;


void main(void){

    vColor = color;
    texCoord = inputTexCoord;

    vec4 cameraPos = ( modelViewMatrix * vec4( position, 1.0 ) );
    vec4 cameraCornerPos = vec4( cameraPos.xyz, 1.0 );
    cameraCornerPos.xy += mapping * inputSize;

    cameraCornerPos.z += 0.5;

    gl_Position = projectionMatrix * cameraCornerPos;

    #ifdef NEAR_CLIP
        // move out of viewing frustum for custom clipping
        if( dot( cameraPos, vec4( 0.0, 0.0, 1.0, nearClip ) ) > 0.0 )
            gl_Position.w = -10.0;
    #endif

}
