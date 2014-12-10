
uniform float opacity;
uniform float nearClip;

varying vec3 vNormal;
varying vec4 cameraPos;

#ifdef PICKING
    varying vec3 vPickingColor;
#else
    varying vec3 vColor;
#endif

#include light_params

#include fog_params


void main()
{

    if( dot( cameraPos, vec4( 0.0, 0.0, 1.0, nearClip ) ) > 0.0 )
        discard;

    vec3 transformedNormal = normalize( vNormal );
    #ifdef DOUBLE_SIDED
        transformedNormal = transformedNormal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );
    #endif

    #ifdef FLIP_SIDED
        transformedNormal = -transformedNormal;
    #endif

    #ifdef PICKING

        gl_FragColor.xyz = vPickingColor;

    #else

        vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );

        #ifndef NOLIGHT
            #include light
        #endif

        gl_FragColor = vec4( vColor, opacity );

        #ifndef NOLIGHT
            gl_FragColor.xyz *= vLightFront;
        #endif

    #endif

    #include fog

}
