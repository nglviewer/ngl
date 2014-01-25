#extension GL_EXT_frag_depth : enable

// not available in WebGL
// #extension GL_ARB_conservative_depth : enable
// layout(depth_less) out float gl_FragDepthEXT;

uniform mat4 projectionMatrix;

varying lowp vec2 mapping;
varying lowp vec3 color;
varying highp vec3 cameraSpherePos;
varying lowp float sphereRadius;

varying vec2 vUv;

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

uniform sampler2D tUnitSphere;

uniform sampler2D tDepth;
uniform float viewWidth;
uniform float viewHeight;

#include fog_pars_fragment


void Impostor(out vec3 cameraPos, out vec3 cameraNormal)
{
    float lensqr = dot(mapping, mapping);
    if(lensqr > 1.0)
        discard;
        
    cameraNormal = vec3(mapping, sqrt(1.0 - lensqr));
    cameraPos = (cameraNormal * sphereRadius) + cameraSpherePos;
}



float unpackDepth( const in vec4 rgba_depth ) {
    const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
    float depth = dot( rgba_depth, bit_shift );
    return depth;
}



void main(void)
{   
    float lensqr = dot(mapping, mapping);
    if(lensqr > 1.0)
        discard;

    // float fov = 40.0;
    // float radius = min( viewWidth, viewHeight );
    // vec2 texCoord2 = vUv;
    // float dist = ( radius / tan( fov / ( 2.0 * ( 180.0 / M_PI ) ) ) ) / 4.0;

    // vec2 texCoord = gl_FragCoord.xy / vec2( viewWidth, viewHeight );
    // //float depthT = 1.0 - unpackDepth( texture2D( tDepth, texCoord ) );
    // float depthT = unpackDepth( texture2D( tDepth, texCoord ) );
    // //discard;

    // if( depthT<gl_FragCoord.z )
    //     discard;

    //Impostor(cameraPos, cameraNormal);
    cameraNormal = vec3(mapping, sqrt(1.0 - lensqr));
    cameraPos = (cameraNormal * sphereRadius) + cameraSpherePos;

    //Set the depth based on the new cameraPos.
    vec4 clipPos = projectionMatrix * vec4(cameraPos, 1.0);
    float ndcDepth = clipPos.z / clipPos.w;
    float depth2 = ((gl_DepthRange.diff * ndcDepth) + gl_DepthRange.near + gl_DepthRange.far) / 2.0;
    gl_FragDepthEXT = depth2;

    // vec3 transformedNormal = cameraNormal;
    // vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );
    // //vec3 vLightFront = color;
    // #if MAX_DIR_LIGHTS > 0
    //     for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {
    //         vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );
    //         vec3 dirVector = normalize( lDirection.xyz );
    //         float dotProduct = dot( transformedNormal, dirVector );
    //         vec3 directionalLightWeighting = vec3( max( dotProduct, 0.0 ) );
    //         vLightFront += directionalLightColor[ i ] * directionalLightWeighting;
    //     }
    // #endif
    // #if MAX_HEMI_LIGHTS > 0
    //     for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {
    //         vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );
    //         vec3 lVector = normalize( lDirection.xyz );
    //         float dotProduct = dot( transformedNormal, lVector );
    //         float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;
    //         float hemiDiffuseWeightBack = -0.5 * dotProduct + 0.5;
    //         vLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );
    //     }
    // #endif
    // // vLightFront = vLightFront * diffuse + ambient * ambientLightColor + emissive;
    // vLightFront = vLightFront + ambient * ambientLightColor + emissive;

    // gl_FragColor = vec4( color, 1.0 );
    // gl_FragColor.xyz *= vLightFront;

    gl_FragColor = texture2D( tUnitSphere, vUv );
    if ( gl_FragColor.a == 0.0 ) discard;
    gl_FragColor.xyz *= color;

    // float depth3 = ((gl_DepthRange.diff * ndcDepth ) + gl_DepthRange.near + gl_DepthRange.far- sphereRadius) / 2.0;
    // if( depth2 <= 0.01 )
    //     gl_FragColor.xyz = vec3( 1.0, 0.0, 0.0 );

    //gl_FragColor = pack_depth( depth2 );
    //gl_FragColor = pack_depth( gl_FragCoord.z );
    //gl_FragColor = vec4( vec3( depthT ), 1.0 );
    //gl_FragColor = texture2D( tDepth, texCoord );
    // if( depthT<0.005 ){
    //     gl_FragColor = vec4( 1.0, depthT, depthT, 1.0 );
    // }else{
    //     gl_FragColor = vec4( vec3( depthT ), 1.0 );
    // }

    #include fog_fragment
}


void main2(void)
{
    gl_FragColor = vec4( color, 1.0 );
    //gl_FragColor = pack_depth( gl_FragCoord.z );
}



