attribute lowp vec2 inputMapping;
attribute lowp float inputSphereRadius;

varying lowp vec2 mapping;
varying highp vec3 cameraSpherePos;
varying lowp float sphereRadius;

void main(void){
    lowp vec2 offset;

    cameraSpherePos = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;
    sphereRadius = inputSphereRadius * 1.3;

    mapping = inputMapping;
    offset = inputMapping * sphereRadius;

    vec4 cameraCornerPos = vec4( cameraSpherePos, 1.0 );
    cameraCornerPos.xy += offset;

    gl_Position = projectionMatrix * cameraCornerPos;
}