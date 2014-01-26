
varying vec3 color;
varying vec3 normalx;


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


void main() {

	vec3 transformedNormal = normalize( normalx );
	#ifdef DOUBLE_SIDED,
		transformedNormal = transformedNormal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );
	#endif

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
    //gl_FragColor.xyz = vec3( 1.0, 0.0, 0.0 );
    gl_FragColor.xyz *= vLightFront;
    //gl_FragColor.xyz = normalx;

    #include fog_fragment
}
