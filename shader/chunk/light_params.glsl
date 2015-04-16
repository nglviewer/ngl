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



vec4 lit(float NdotL, float NdotH, float m) {
    float ambient = 1.0;
    float diffuse = max(NdotL, 0.0);
    float specular = pow(abs(NdotH),m);
    if(NdotL < 0.0 || NdotH < 0.0)
        specular = 0.0;
    return vec4(ambient, diffuse, specular, 1.0);
}

