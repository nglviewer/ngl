
varying lowp vec2 mapping;
varying highp vec3 cameraSpherePos;
varying lowp float sphereRadius;

varying highp vec3 color;

#include fog_params


void main() {

	highp vec3 cameraPlanePos = vec3(mapping * sphereRadius, 0.0) + cameraSpherePos;
    highp vec3 rayDirection = normalize(cameraPlanePos);
    
    float B = -2.0 * dot(rayDirection, cameraSpherePos);
    float C = dot(cameraSpherePos, cameraSpherePos) - (sphereRadius*sphereRadius);
    float det = (B * B) - (4.0 * C);
    if(det < 0.0)
        discard;

	float lensqr = dot(mapping, mapping);
    if(lensqr > 1.0)
        discard;

	gl_FragColor = vec4( color, 1.0 );

    #include fog
}
