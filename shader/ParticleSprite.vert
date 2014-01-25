
attribute lowp vec2 inputMapping;
attribute lowp float inputSphereRadius;
attribute lowp vec3 inputColor;

varying lowp vec2 mapping;
varying highp vec3 cameraSpherePos;
varying lowp float sphereRadius;
varying highp vec3 color;

const lowp float g_boxCorrection = 1.5;

void main(void){
    lowp vec2 offset;

    cameraSpherePos = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;
    sphereRadius = inputSphereRadius;

    color = inputColor;
    mapping = inputMapping * g_boxCorrection;
    offset = inputMapping * sphereRadius;

    vec4 cameraCornerPos = vec4( cameraSpherePos, 1.0 );
    cameraCornerPos.xy += offset * g_boxCorrection;

    gl_Position = projectionMatrix * cameraCornerPos;
}