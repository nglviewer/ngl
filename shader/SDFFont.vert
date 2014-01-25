
attribute lowp vec2 inputMapping;
attribute lowp vec2 inputTexCoord;
attribute lowp float inputSphereRadius;

varying lowp vec2 texCoord;

const lowp float g_boxCorrection = 1.5;

void main(void){
    lowp vec2 offset;
    highp vec3 cameraSpherePos;

    cameraSpherePos = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;
    texCoord = inputTexCoord;

    offset = inputMapping * inputSphereRadius;

    vec4 cameraCornerPos = vec4( cameraSpherePos, 1.0 );
    cameraCornerPos.xy += offset * g_boxCorrection;

    gl_Position = projectionMatrix * cameraCornerPos;
}