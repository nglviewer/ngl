uniform sampler2D fontTexture;
uniform float opacity;
uniform bool showBorder;
uniform vec3 borderColor;
uniform float borderWidth;
uniform vec3 backgroundColor;
uniform float backgroundOpacity;
uniform float clipNear;
uniform float clipRadius;

varying vec3 vViewPosition;
varying vec2 texCoord;

#if defined( RADIUS_CLIP )
    varying vec3 vClipCenter;
#endif

#if defined( PICKING )
    uniform float objectId;
    varying vec3 vPickingColor;
    const vec3 vColor = vec3( 0.0 );
#else
    #include common
    #include color_pars_fragment
    #include fog_pars_fragment
#endif

const float gamma = 2.2 * 1.4142 / 128.0;
const float padding = 0.75;

void main(){

    #include nearclip_fragment
    #include radiusclip_fragment

    if( texCoord.x > 1.0 ){

        gl_FragColor = vec4( backgroundColor, backgroundOpacity );

    }else{

        // retrieve signed distance
        float sdf = texture2D( fontTexture, texCoord ).a;
        if( showBorder ) sdf += borderWidth;

        float a = smoothstep(padding - gamma, padding + gamma, sdf);

        if( a < 0.2 ) discard;
        a *= opacity;

        vec3 outgoingLight = vColor;
        if( showBorder && sdf < ( padding + borderWidth ) ){
            outgoingLight = borderColor;
        }

        gl_FragColor = vec4( outgoingLight, a );

    }

    #if defined( PICKING )

        if( opacity < 0.3 )
            discard;
        gl_FragColor = vec4( vPickingColor, objectId );

    #else

        #include premultiplied_alpha_fragment
        #include tonemapping_fragment
        #include encodings_fragment
        #include fog_fragment

    #endif

}