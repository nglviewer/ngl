#define STANDARD

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
uniform float nearClip;

#if defined( PICKING )
    uniform float objectId;
    varying vec3 vPickingColor;
#elif defined( NOLIGHT )
    varying vec3 vColor;
#else
    varying vec3 vViewPosition;
    #ifndef FLAT_SHADED
        varying vec3 vNormal;
    #endif
    #include common
    #include color_pars_fragment
    #include fog_pars_fragment
    #include bsdfs
    #include ambient_pars
    #include lights_pars
    #include lights_standard_pars_fragment
#endif

void main(){

    #include nearclip_fragment

    #if defined( PICKING )

        gl_FragColor = vec4( vPickingColor, objectId );

    #elif defined( NOLIGHT )

        gl_FragColor = vec4( vColor, opacity );

    #else

        vec4 diffuseColor = vec4( diffuse, opacity );
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveLight = emissive;

        #include color_fragment
        #include roughnessmap_fragment
        #include metalnessmap_fragment
        #include normal_fragment

        #include dull_interior_fragment

        #include lights_standard_fragment
        #include lights_template

        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveLight;

        #include linear_to_gamma_fragment
        #include fog_fragment

        gl_FragColor = vec4( outgoingLight, diffuseColor.a );

        #include opaque_back_fragment

    #endif

}