uniform vec3 diffuse;
uniform float opacity;
uniform float clipNear;
uniform float clipRadius;

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

#ifdef USE_MAP
    uniform sampler2D map;
#endif

#if defined( PICKING )
    uniform float objectId;
    varying vec3 vPickingColor;
#else
    #include common
    #include color_pars_fragment
    #include fog_pars_fragment
    varying vec3 vViewPosition;
#endif

void main(){

    #include nearclip_fragment
    #include radiusclip_fragment

    #if defined( PICKING )

        #ifdef USE_MAP
            if( texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) ).a < 0.5 )
                discard;
        #endif

        if( opacity < 0.3 )
            discard;
        gl_FragColor = vec4( vPickingColor, objectId );

    #else

        vec3 outgoingLight = vec3( 0.0 );
        vec4 diffuseColor = vec4( diffuse, 1.0 );

        #ifdef USE_MAP
            diffuseColor *= texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) );
        #endif

        #include color_fragment
        #include alphatest_fragment

        outgoingLight = diffuseColor.rgb;

        gl_FragColor = vec4( outgoingLight, diffuseColor.a * opacity );

        #include premultiplied_alpha_fragment
        #include tonemapping_fragment
        #include encodings_fragment
        #include fog_fragment

    #endif

}