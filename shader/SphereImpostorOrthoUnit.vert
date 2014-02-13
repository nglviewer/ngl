attribute lowp vec2 inputMapping;

// uniform lowp float sphereRadius;
uniform float viewWidth;
uniform float viewHeight;

varying highp vec3 cameraSpherePos;
varying lowp vec2 mapping;

#define M_PI 3.1415926535897932384626433832795

void main(void){
    lowp vec2 offset;
    
    cameraSpherePos = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;
    float sphereRadius = min( viewWidth, viewHeight ) / 4.0;

    mapping = inputMapping;
    offset = inputMapping * sphereRadius;

    vec4 cameraCornerPos = vec4( cameraSpherePos, 1.0 );
    cameraCornerPos.xy = offset;
    // fov = 2 * Math.atan( height / ( 2 * dist ) ) * ( 180 / Math.PI );
    // fov / ( 2 * ( 180 / Math.PI ) ) = Math.atan( height / ( 2 * dist ) )
    // Math.tan( fov / ( 2 * ( 180 / Math.PI ) ) ) = height / ( 2 * dist )
    // height / Math.tan( fov / ( 2 * ( 180 / Math.PI ) ) ) = 2 * dist
    float fov = 40.0;
    float radius = min( viewWidth, viewHeight );
    float dist = ( radius / tan( fov / ( 2.0 * ( 180.0 / M_PI ) ) ) ) / 4.0;
    cameraCornerPos.z = -dist;

    gl_Position = projectionMatrix * cameraCornerPos;
}