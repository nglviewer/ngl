
#extension GL_OES_standard_derivatives : enable

uniform float opacity;
uniform float nearClip;

varying vec4 cameraPos;

#ifdef PICKING
    uniform float objectId;
    varying vec3 vPickingColor;
#else
    varying vec3 color;
    varying vec3 vNormal;
#endif

#include light_params

#include fog_params


void main() {

    #ifdef NEAR_CLIP
        if( dot( cameraPos, vec4( 0.0, 0.0, 1.0, nearClip ) ) > 0.0 )
            discard;
    #endif

    #ifdef PICKING
        gl_FragColor = vec4( vPickingColor, objectId );
        //gl_FragColor.rgb = vec3( 1.0, 0.0, 0.0 );
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

        #include light

        gl_FragColor = vec4( color, opacity );
        // gl_FragColor.rgb = vec3( 1.0, 0.0, 0.0 );
        gl_FragColor.rgb *= vLightFront;
        // gl_FragColor.rgb = normalx;
        //gl_FragColor.rgb = color;
    #endif

    #include fog
}
