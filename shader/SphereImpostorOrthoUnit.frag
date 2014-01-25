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

uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 emissive;

uniform vec3 ambientLightColor;

#if MAX_DIR_LIGHTS > 0
    uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
    uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];
#endif

#if MAX_HEMI_LIGHTS > 0
    uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
    uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
    uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];
#endif


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
    //vec3 vLightFront = color;
    #if MAX_DIR_LIGHTS > 0
        for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {
            vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );
            vec3 dirVector = normalize( lDirection.xyz );
            float dotProduct = dot( transformedNormal, dirVector );
            vec3 directionalLightWeighting = vec3( max( dotProduct, 0.0 ) );
            vLightFront += directionalLightColor[ i ] * directionalLightWeighting;
        }
    #endif
    #if MAX_HEMI_LIGHTS > 0
        for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {
            vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );
            vec3 lVector = normalize( lDirection.xyz );
            float dotProduct = dot( transformedNormal, lVector );
            float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;
            float hemiDiffuseWeightBack = -0.5 * dotProduct + 0.5;
            vLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );
        }
    #endif
    // vLightFront = vLightFront * diffuse + ambient * ambientLightColor + emissive;
    vLightFront = vLightFront + ambient * ambientLightColor + emissive;

    gl_FragColor = vec4( color, 1.0 );
    gl_FragColor.xyz *= vLightFront;
}


void main2(void)
{
    gl_FragColor = vec4( color, 1.0 );
    //gl_FragColor = pack_depth( gl_FragCoord.z );
}



