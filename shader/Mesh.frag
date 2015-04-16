
#ifdef FLAT_SHADED
    #extension GL_OES_standard_derivatives : enable
#endif

uniform float opacity;
uniform float nearClip;

varying vec4 cameraPos;

#ifdef PICKING
    uniform float objectId;
    varying vec3 vPickingColor;
#else
    varying vec3 vColor;
    varying vec3 vNormal;
#endif

#include light_params

#include fog_params


void main()
{

    #ifdef NEAR_CLIP
        if( dot( cameraPos, vec4( 0.0, 0.0, 1.0, nearClip ) ) > 0.0 )
            discard;
    #endif

    #ifdef PICKING

        gl_FragColor = vec4( vPickingColor, objectId );

    #else

        #ifdef FLAT_SHADED
            vec3 fdx = dFdx( cameraPos.xyz );
            vec3 fdy = dFdy( cameraPos.xyz );
            vec3 normal = normalize( cross( fdx, fdy ) );
        #else
            vec3 normal = normalize( vNormal );
        #endif

        vec3 transformedNormal = normalize( normal );
        #ifndef FLAT_SHADED
            #ifdef DOUBLE_SIDED
                transformedNormal = transformedNormal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );
            #endif
            #ifdef FLIP_SIDED
                transformedNormal = -transformedNormal;
            #endif
        #endif

        vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );

        #ifndef NOLIGHT
            #include light
        #endif

        #ifdef OPAQUE_BACK
            #ifdef FLIP_SIDED
                if( float( gl_FrontFacing ) == 1.0 ){
                    gl_FragColor = vec4( vColor, 1.0 );
                }else{
                    gl_FragColor = vec4( vColor, opacity );
                }
            #else
                if( float( gl_FrontFacing ) == 1.0 ){
                    gl_FragColor = vec4( vColor, opacity );
                }else{
                    gl_FragColor = vec4( vColor, 1.0 );
                }
            #endif
        #else
            gl_FragColor = vec4( vColor, opacity );
        #endif

        #ifndef NOLIGHT
            gl_FragColor.rgb *= vLightFront;
        #endif

    #endif

    #include fog

}
