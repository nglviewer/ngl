#define STANDARD
#define IMPOSTOR

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
uniform float nearClip;
uniform mat4 projectionMatrix;

varying float vRadius;
varying vec3 vPoint;
varying vec3 vViewPosition;

#ifdef PICKING
    uniform float objectId;
    varying vec3 vPickingColor;
#else
    #include common
    #include color_pars_fragment
    #include fog_pars_fragment
    #include bsdfs
    #include lights_pars
    #include lights_standard_pars_fragment
#endif

bool flag2 = false;
bool interior = false;
vec3 cameraPos;
vec3 cameraNormal;

// vec4 poly_color = gl_Color;
//   if(uf_use_border_hinting == 1.0)
//   {
//     vec3 wc_eye_dir = normalize(wc_sp_pt);
//     float n_dot_e   = abs(dot(wc_sp_nrml,wc_eye_dir));
//     float alpha     = max(uf_border_color_start_cosine - n_dot_e,0.0)/uf_border_color_start_cosine;
//     poly_color      = mix(gl_Color,uf_border_color,0.75*alpha);
//   }
//   color += (diff + amb)*poly_color + spec*gl_FrontMaterial.specular;

// Calculate depth based on the given camera position.
float calcDepth( in vec3 cameraPos ){
    vec2 clipZW = cameraPos.z * projectionMatrix[2].zw + projectionMatrix[3].zw;
    return 0.5 + 0.5 * clipZW.x / clipZW.y;
}

float calcClip( vec3 cameraPos ){
    return dot( vec4( cameraPos, 1.0 ), vec4( 0.0, 0.0, 1.0, nearClip - 0.5 ) );
}

bool Impostor( out vec3 cameraPos, out vec3 cameraNormal ){

    vec3 cameraSpherePos2 = -vViewPosition;
    cameraSpherePos2.z += vRadius;

    vec3 rayDirection = normalize( vPoint );

    float B = -2.0 * dot( rayDirection, cameraSpherePos2 );
    float C = dot( cameraSpherePos2, cameraSpherePos2 ) - ( vRadius * vRadius );

    float det = ( B * B ) - ( 4.0 * C );
    if( det < 0.0 ){
        discard;
        return false;
    }else{
        float sqrtDet = sqrt( det );
        float posT = ( -B + sqrtDet ) / 2.0;
        float negT = ( -B - sqrtDet ) / 2.0;

        float intersectT = min(posT, negT);
        cameraPos = rayDirection * intersectT;

        #ifdef NEAR_CLIP
            if( calcDepth( cameraPos ) <= 0.0 ){
                cameraPos = rayDirection * max( posT, negT );
                interior = true;
                return false;
            }else if( calcClip( cameraPos ) > 0.0 ){
                cameraPos = rayDirection * max( posT, negT );
                interior = true;
                flag2 = true;
                return false;
            }else{
                cameraNormal = normalize( cameraPos - cameraSpherePos2 );
            }
        #else
            if( calcDepth( cameraPos ) <= 0.0 ){
                cameraPos = rayDirection * max( posT, negT );
                interior = true;
                return false;
            }else{
                cameraNormal = normalize( cameraPos - cameraSpherePos2 );
            }
        #endif

        return true;
    }

    return false; // ensure that each control flow has a return

}

void main(void){

    bool flag = Impostor( cameraPos, cameraNormal );

    #ifdef NEAR_CLIP
        if( calcClip( cameraPos ) > 0.0 )
            discard;
    #endif

    // FIXME not compatible with custom clipping plane
    //Set the depth based on the new cameraPos.
    gl_FragDepthEXT = calcDepth( cameraPos );
    if( !flag ){

        // clamp to near clipping plane and add a tiny value to
        // make spheres with a greater radius occlude smaller ones
        #ifdef NEAR_CLIP
            if( flag2 ){
                gl_FragDepthEXT = max( 0.0, calcDepth( vec3( - ( nearClip - 0.5 ) ) ) + ( 0.0000001 / vRadius ) );
            }else if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = 0.0 + ( 0.0000001 / vRadius );
            }
        #else
            if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = 0.0 + ( 0.0000001 / vRadius );
            }
        #endif

    }

    // bugfix (mac only?)
    if (gl_FragDepthEXT < 0.0)
        discard;
    if (gl_FragDepthEXT > 1.0)
        discard;

    #ifdef PICKING

        gl_FragColor = vec4( vPickingColor, objectId );

    #else

        vec3 vNormal = cameraNormal;

        vec4 diffuseColor = vec4( diffuse, opacity );
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveLight = emissive;

        #include color_fragment
        #include roughnessmap_fragment
        #include metalnessmap_fragment
        #include normal_fragment
        if( interior ){
            normal = vec3( 0.0, 0.0, 0.4 );
        }

        #include lights_standard_fragment
        #include lights_template

        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveLight;

        #include linear_to_gamma_fragment
        #include fog_fragment

        gl_FragColor = vec4( outgoingLight, diffuseColor.a );

    #endif

}