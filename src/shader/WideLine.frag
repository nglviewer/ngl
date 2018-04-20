uniform vec3 diffuse;
uniform float opacity;
uniform float clipNear;
uniform float clipRadius;

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

#ifdef PICKING
    uniform float objectId;
    varying vec3 vPickingColor;
#else
    #include common
    #include fog_pars_fragment
    varying vec3 vViewPosition;
    varying vec3 vColor;
    varying vec3 vColor2;
    varying float flag;
#endif

void main() {

    #include nearclip_fragment
    #include radiusclip_fragment

    #if defined( PICKING )

        if( opacity < 0.3 )
            discard;
        gl_FragColor = vec4( vPickingColor, objectId );

    #else

        vec3 outgoingLight = vec3( 0.0 );
        vec4 diffuseColor = vec4( diffuse, 1.0 );

        if ( flag < 0.0 ) {
            diffuseColor.rgb *= vColor;
        } else {
            diffuseColor.rgb *= vColor2;
        }

        #include alphatest_fragment

        outgoingLight = diffuseColor.rgb;

        gl_FragColor = vec4( outgoingLight, diffuseColor.a * opacity );

        #include premultiplied_alpha_fragment
        #include tonemapping_fragment
        #include encodings_fragment
        #include fog_fragment

    #endif

}