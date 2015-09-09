// LIGHT
// IN: transformedNormal, vLightFront
// OUT: vLightFront

// Give light vector position perpendicular to the screen
vec3 lightvec = normalize( vec3( 0.0, 0.0, 1.2 ) );
vec3 eyepos = vec3( 0.0, 0.0, 1.0 );

// calculate half-angle vector
vec3 halfvec = normalize( lightvec + eyepos );

// Parameters used to calculate per pixel lighting
// see http://http.developer.nvidia.com/CgTutorial/cg_tutorial_chapter05.html
float diffuse = dot( transformedNormal,lightvec );
float specular = dot( transformedNormal, halfvec );
vec4 lighting = lit( diffuse, specular, 512.0 );

vec3 specularcolor = vec3( 1.0, 1.0, 1.0 );

vLightFront = ( vLightFront + lighting.y * vec3( 1.0, 1.0, 1.0 ) + lighting.z * specularcolor ).xyz;