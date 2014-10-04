
attribute vec2 mapping;
attribute vec2 inputTexCoord;
attribute float inputSize;
attribute vec3 color;

varying vec3 vColor;
varying vec2 texCoord;


void main(void){

    vColor = color;
    texCoord = inputTexCoord;

    vec3 cameraPos = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;
    vec4 cameraCornerPos = vec4( cameraPos, 1.0 );
    cameraCornerPos.xy += mapping * inputSize;

    gl_Position = projectionMatrix * cameraCornerPos;

}
