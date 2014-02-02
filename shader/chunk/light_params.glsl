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