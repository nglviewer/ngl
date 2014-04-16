
// LIGHT
// IN: transformedNormal, vLightFront
// OUT: vLightFront

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


// Give light vector position perpendicular to the screen
vec3 lightvec = normalize(vec3(0.0,0.0,1.2));
vec3 eyepos = vec3(0.0,0.0,1.0);

// calculate half-angle vector
vec3 halfvec = normalize(lightvec + eyepos);

// Parameters used to calculate per pixel lighting
// see http://http.developer.nvidia.com/CgTutorial/cg_tutorial_chapter05.html
float diffuse = dot(transformedNormal,lightvec);
float specular = dot(transformedNormal, halfvec);
vec4 lighting = lit(diffuse, specular, 512.0);

vec3 specularcolor = vec3(1.0,1.0,1.0);

vLightFront = ( vLightFront + lighting.y * vec3(1.0, 1.0, 1.0) + lighting.z * specularcolor ).xyz;


