
#extension GL_EXT_frag_depth : enable

// not available in WebGL
// #extension GL_ARB_conservative_depth : enable
// layout(depth_less) out float gl_FragDepthEXT;

uniform float opacity;

uniform mat4 projectionMatrix;

varying vec3 point;
varying vec4 cameraSpherePos;
varying float sphereRadius;

#ifdef PICKING
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
float calcDepth( in vec3 camPos )
{
    vec2 clipZW = camPos.z * projectionMatrix[2].zw + projectionMatrix[3].zw;
    return 0.5 + 0.5 * clipZW.x / clipZW.y;
}


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
        if( calcDepth( cameraPos ) <= 0.0 ){
            cameraPos = rayDirection * max(posT, negT);
            cameraNormal = vec3( 0.0, 0.0, 0.4 );
            return false;
        }else{
            cameraNormal = normalize(cameraPos - cameraSpherePos2);
        }

        return true;
    }

    return false; // ensure that each control flow has a return

}


void main(void)
{

    bool flag = Impostor(cameraPos, cameraNormal);

    //Set the depth based on the new cameraPos.
    gl_FragDepthEXT = calcDepth( cameraPos );
    if( !flag ){

        if( gl_FragDepthEXT >= 0.0 ){
            // clamp to near clipping plane and add a tiny value to
            // make spheres with a greater radius occlude smaller ones
            gl_FragDepthEXT = 0.0 + ( 0.000001 / sphereRadius );
        }

    }

    // bugfix (mac only?)
    if (gl_FragDepthEXT < 0.0)
        discard;
    if (gl_FragDepthEXT > 1.0)
        discard;

    #ifdef PICKING
        gl_FragColor = vec4( vPickingColor, 1.0 );
        //gl_FragColor.xyz = vec3( 1.0, 0.0, 0.0 );
    #else
        vec3 transformedNormal = cameraNormal;
        vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );

        #include light

        gl_FragColor = vec4( vColor, opacity );
        gl_FragColor.xyz *= vLightFront;

        // gl_FragColor.a = 0.5;
        // gl_FragColor.xyz = transformedNormal;
        // gl_FragColor.xyz = point;
    #endif

    #include fog

}


// void main2(void)
// {
//     gl_FragColor = vec4( vColor, 1.0 );
// }



