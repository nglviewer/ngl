
varying lowp vec2 mapping;
varying highp vec3 cameraSpherePos;
varying lowp float sphereRadius;

uniform lowp vec3 colorx;

#include fog_params


void main(void)
{   

    highp vec3 cameraPlanePos = vec3(mapping * sphereRadius, 0.0) + cameraSpherePos;
    highp vec3 rayDirection = normalize(cameraPlanePos);
    
    float B = -2.0 * dot(rayDirection, cameraSpherePos);
    float C = dot(cameraSpherePos, cameraSpherePos) - (sphereRadius*sphereRadius);
    float det = (B * B) - (4.0 * C);
    if(det < 0.0)
        discard;

    // float r2 = sphereRadius*0.82;
    // B = -2.0 * dot(rayDirection, cameraSpherePos);
    // C = dot(cameraSpherePos, cameraSpherePos) - (r2*r2);
    // det = (B * B) - (4.0 * C);
    // if(det >= 0.0)
    //     discard;

    float r2 = sphereRadius*0.97;
    B = -2.0 * dot(rayDirection, cameraSpherePos);
    C = dot(cameraSpherePos, cameraSpherePos) - (r2*r2);
    det = (B * B) - (4.0 * C);
    if(det < 0.0){
        gl_FragColor = vec4( colorx, 1.0 );
    }else{
    	gl_FragColor = vec4( colorx, 0.5 );
    }
    // gl_FragColor = vec4( colorx, 1.0 );

    #include fog
}


