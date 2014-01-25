#extension GL_EXT_frag_depth : enable

// not available in WebGL
// #extension GL_ARB_conservative_depth : enable
// layout(depth_less) out float gl_FragDepthEXT;

uniform mat4 projectionMatrix;

varying lowp vec2 mapping;
varying lowp vec3 color;
varying highp vec3 cameraSpherePos;
varying lowp float sphereRadius;

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

#include fog_pars_fragment


// vec4 poly_color = gl_Color;
  
//   if(uf_use_border_hinting == 1.0)
//   {
//     vec3 wc_eye_dir = normalize(wc_sp_pt);
//     float n_dot_e   = abs(dot(wc_sp_nrml,wc_eye_dir));    
//     float alpha     = max(uf_border_color_start_cosine - n_dot_e,0.0)/uf_border_color_start_cosine;     
//     poly_color      = mix(gl_Color,uf_border_color,0.75*alpha);    
//   }
  
//   color += (diff + amb)*poly_color + spec*gl_FrontMaterial.specular;


vec3 Impostor(out vec3 cameraPos, out vec3 cameraNormal)
{
    highp vec3 cameraPlanePos = vec3(mapping * sphereRadius, 0.0) + cameraSpherePos;
    highp vec3 rayDirection = normalize(cameraPlanePos);
    
    float B = -2.0 * dot(rayDirection, cameraSpherePos);
    float C = dot(cameraSpherePos, cameraSpherePos) - (sphereRadius*sphereRadius);
    
    float det = (B * B) - (4.0 * C);
    if(det < 0.0)
        discard;
        
    float sqrtDet = sqrt(det);
    float posT = (-B + sqrtDet)/2.0;
    float negT = (-B - sqrtDet)/2.0;
    
    float intersectT = min(posT, negT);
    cameraPos = rayDirection * intersectT;
    cameraNormal = normalize(cameraPos - cameraSpherePos);
    return cameraPos;
}


void main(void)
{   
    Impostor(cameraPos, cameraNormal);

    //Set the depth based on the new cameraPos.
    vec4 clipPos = projectionMatrix * vec4(cameraPos, 1.0);
    float ndcDepth = clipPos.z / clipPos.w;
    float depth2 = ((gl_DepthRange.diff * ndcDepth) + gl_DepthRange.near + gl_DepthRange.far) / 2.0;
    gl_FragDepthEXT = depth2;

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
    // gl_FragColor.xyz = transformedNormal;

    // highp vec3 cameraPlanePos = vec3(mapping * sphereRadius, 0.0) + cameraSpherePos;
    // highp vec3 rayDirection = normalize(cameraPlanePos);
    // gl_FragColor = vec4( rayDirection, 1.0 );

    #include fog_fragment
}


void main2(void)
{
    gl_FragColor = vec4( color, 1.0 );
}



