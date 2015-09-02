
precision highp float;
precision highp int;

// uniform mat4 viewMatrix;
// uniform vec3 cameraPosition;

varying vec3 point;
varying vec3 vColor;
varying vec3 cameraSpherePos;
varying float sphereRadius;

#include fog_params


void main() {

    vec3 rayDirection = normalize( point );

    float B = -2.0 * dot(rayDirection, cameraSpherePos);
    float C = dot(cameraSpherePos, cameraSpherePos) - (sphereRadius*sphereRadius);
    float det = (B * B) - (4.0 * C);
    if(det < 0.0)
        discard;

	gl_FragColor = vec4( vColor, 1.0 );

    #include fog

}
