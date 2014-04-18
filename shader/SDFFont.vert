
attribute vec2 inputMapping;
attribute vec2 inputTexCoord;
attribute float inputSize;

varying vec2 texCoord;


void main(void){

	texCoord = inputTexCoord;

    vec3 cameraPos = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;
    vec4 cameraCornerPos = vec4( cameraPos, 1.0 );
    cameraCornerPos.xy += inputMapping * inputSize;

    gl_Position = projectionMatrix * cameraCornerPos;
}