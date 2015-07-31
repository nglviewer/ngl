
#extension GL_EXT_frag_depth : enable

// not available in WebGL
// #extension GL_ARB_conservative_depth : enable
// layout(depth_less) out float gl_FragDepthEXT;

uniform float opacity;
uniform float nearClip;

uniform mat4 projectionMatrix;

varying vec3 point;
varying vec4 cameraSpherePos;
varying float sphereRadius;

#ifdef PICKING
    uniform float objectId;
    varying vec3 vPickingColor;
#else
    varying vec3 vColor;
#endif

#include light_params

#include fog_params


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
float calcDepth( in vec3 cameraPos )
{
    vec2 clipZW = cameraPos.z * projectionMatrix[2].zw + projectionMatrix[3].zw;
    return 0.5 + 0.5 * clipZW.x / clipZW.y;
}


float calcClip( vec3 cameraPos )
{
    return dot( vec4( cameraPos, 1.0 ), vec4( 0.0, 0.0, 1.0, nearClip - 0.5 ) );
}


bool flag2 = false;


bool Impostor(out vec3 cameraPos, out vec3 cameraNormal)
{

    vec3 cameraSpherePos2 = cameraSpherePos.xyz;
    cameraSpherePos2.z += sphereRadius;

    vec3 rayDirection = normalize( point );

    float B = -2.0 * dot(rayDirection, cameraSpherePos2);
    float C = dot(cameraSpherePos2, cameraSpherePos2) - (sphereRadius*sphereRadius);

    float det = (B * B) - (4.0 * C);
    if(det < 0.0){
        discard;
        return false;
    }else{
        float sqrtDet = sqrt(det);
        float posT = (-B + sqrtDet)/2.0;
        float negT = (-B - sqrtDet)/2.0;

        float intersectT = min(posT, negT);
        cameraPos = rayDirection * intersectT;

        #ifdef NEAR_CLIP
            if( calcDepth( cameraPos ) <= 0.0 ){
                cameraPos = rayDirection * max(posT, negT);
                cameraNormal = vec3( 0.0, 0.0, 0.4 );
                return false;
            }else if( calcClip( cameraPos ) > 0.0 ){
                cameraPos = rayDirection * max(posT, negT);
                cameraNormal = vec3( 0.0, 0.0, 0.4 );
                flag2 = true;
                return false;
            }else{
                cameraNormal = normalize(cameraPos - cameraSpherePos2);
            }
        #else
            if( calcDepth( cameraPos ) <= 0.0 ){
                cameraPos = rayDirection * max(posT, negT);
                cameraNormal = vec3( 0.0, 0.0, 0.4 );
                return false;
            }else{
                cameraNormal = normalize(cameraPos - cameraSpherePos2);
            }
        #endif

        return true;
    }

    return false; // ensure that each control flow has a return

}


void main(void)
{

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
                gl_FragDepthEXT = max( 0.0, calcDepth( vec3( - ( nearClip - 0.5 ) ) ) + ( 0.0000001 / sphereRadius ) );
            }else if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = 0.0 + ( 0.0000001 / sphereRadius );
            }
        #else
            if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = 0.0 + ( 0.0000001 / sphereRadius );
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
        //gl_FragColor.rgb = vec3( 1.0, 0.0, 0.0 );
    #else
        vec3 transformedNormal = cameraNormal;
        vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );

        #include light

        gl_FragColor = vec4( vColor, opacity );
        gl_FragColor.rgb *= vLightFront;

        // gl_FragColor.a = 0.5;
        // gl_FragColor.rgb = transformedNormal;
        // gl_FragColor.rgb = point;
    #endif

    // #include fog

    #ifdef USE_FOG
        float depth = gl_FragDepthEXT / gl_FragCoord.w;
        #ifdef FOG_EXP2
            const float LOG2 = 1.442695;
            float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
            fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );
        #else
            float fogFactor = smoothstep( fogNear, fogFar, depth );
        #endif
        gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
    #endif

}


// void main2(void)
// {
//     gl_FragColor = vec4( vColor, 1.0 );
// }



