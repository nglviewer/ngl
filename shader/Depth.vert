
attribute lowp vec2 inputMapping;
attribute lowp vec3 inputColor;
attribute lowp float inputSize;

varying lowp vec3 colorx;

void main(void){
    colorx = inputColor;

    vec4 cameraCornerPos = modelViewMatrix * vec4( position, 1.0 );
    cameraCornerPos.xy += inputMapping * inputSize;

    gl_Position = projectionMatrix * cameraCornerPos;
}