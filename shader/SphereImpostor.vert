attribute lowp vec2 inputMapping;
attribute lowp vec3 inputColor;
attribute lowp float inputSphereRadius;

varying lowp vec2 mapping;
varying lowp vec3 color;
varying highp vec3 cameraSpherePos;
varying lowp float sphereRadius;

const lowp float g_boxCorrection = 1.5;

void main(void){
    lowp vec2 offset;

    color = inputColor;
    cameraSpherePos = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;
    sphereRadius = inputSphereRadius;

    mapping = inputMapping * g_boxCorrection;
    offset = inputMapping * inputSphereRadius;

    vec4 cameraCornerPos = vec4( cameraSpherePos, 1.0 );
    cameraCornerPos.xy += offset * g_boxCorrection;

    gl_Position = projectionMatrix * cameraCornerPos;

    // move out of viewing frustum to avoid clipping artifacts
    if( gl_Position.z-inputSphereRadius<=1.0 )
        gl_Position.z = -10.0;
}