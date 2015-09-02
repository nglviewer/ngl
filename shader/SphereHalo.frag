
precision highp float;
precision highp int;

// uniform mat4 viewMatrix;
// uniform vec3 cameraPosition;

varying vec3 point;
varying vec3 cameraSpherePos;
varying float sphereRadius;

uniform vec3 color;

#include fog_params


void main(void)
{
    vec3 rayDirection = normalize( point );

    float B = -2.0 * dot(rayDirection, cameraSpherePos);
    float C = dot(cameraSpherePos, cameraSpherePos) - (sphereRadius*sphereRadius);
    float det = (B * B) - (4.0 * C);
    if(det < 0.0)
        discard;

    float r2 = sphereRadius*0.97;
    B = -2.0 * dot(rayDirection, cameraSpherePos);
    C = dot(cameraSpherePos, cameraSpherePos) - (r2*r2);
    det = (B * B) - (4.0 * C);

    if(det < 0.0){
        gl_FragColor = vec4( color, 1.0 );

    }else{
    	gl_FragColor = vec4( color, 0.5 );
    }

    #include fog
}


