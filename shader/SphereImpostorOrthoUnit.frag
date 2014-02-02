#extension GL_EXT_frag_depth : enable

uniform mat4 projectionMatrix;
uniform lowp vec3 color;
//uniform lowp float sphereRadius;
uniform float viewWidth;
uniform float viewHeight;

varying highp vec3 cameraSpherePos;
varying lowp vec2 mapping;

highp vec3 cameraPos;
highp vec3 cameraNormal;

#include light_params


// void Impostor(out vec3 cameraPos, out vec3 cameraNormal)
// {
//     float lensqr = dot(mapping, mapping);
//     if(lensqr > 1.0)
//         discard;
        
//     cameraNormal = vec3(mapping, sqrt(1.0 - lensqr));
//     cameraPos = (cameraNormal * sphereRadius) + cameraSpherePos;
// }


void main(void)
{   
    float sphereRadius = min( viewWidth, viewHeight ) / 4.0;
    
    //Impostor(cameraPos, cameraNormal);
    float lensqr = dot(mapping, mapping);
    if(lensqr > 1.0)
        discard;
        
    cameraNormal = vec3(mapping, sqrt(1.0 - lensqr));
    cameraPos = (cameraNormal * sphereRadius) + cameraSpherePos;
    
    //Set the depth based on the new cameraPos.
    vec4 clipPos = projectionMatrix * vec4(cameraPos, 1.0);
    float ndcDepth = clipPos.z / clipPos.w;
    float depth2 = ((gl_DepthRange.diff * ndcDepth) + gl_DepthRange.near + gl_DepthRange.far) / 2.0;
    //gl_FragDepthEXT = depth2;

    vec3 transformedNormal = cameraNormal;
    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );
    
    #include light

    gl_FragColor = vec4( color, 1.0 );
    gl_FragColor.xyz *= vLightFront;
}


void main2(void)
{
    gl_FragColor = vec4( color, 1.0 );
    //gl_FragColor = pack_depth( gl_FragCoord.z );
}



