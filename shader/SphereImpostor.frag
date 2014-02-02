#extension GL_EXT_frag_depth : enable

// not available in WebGL
// #extension GL_ARB_conservative_depth : enable
// layout(depth_less) out float gl_FragDepthEXT;

uniform mat4 projectionMatrix;

varying lowp vec2 mapping;
varying lowp vec3 color;
varying highp vec3 cameraSpherePos;
varying lowp float sphereRadius;

highp vec3 cameraPos;
highp vec3 cameraNormal;

#include light_params

#include fog_params


// vec4 poly_color = gl_Color;
  
//   if(uf_use_border_hinting == 1.0)
//   {
//     vec3 wc_eye_dir = normalize(wc_sp_pt);
//     float n_dot_e   = abs(dot(wc_sp_nrml,wc_eye_dir));    
//     float alpha     = max(uf_border_color_start_cosine - n_dot_e,0.0)/uf_border_color_start_cosine;     
//     poly_color      = mix(gl_Color,uf_border_color,0.75*alpha);    
//   }
  
//   color += (diff + amb)*poly_color + spec*gl_FrontMaterial.specular;


vec3 Impostor(out vec3 cameraPos, out vec3 cameraNormal)
{
    highp vec3 cameraPlanePos = vec3(mapping * sphereRadius, 0.0) + cameraSpherePos;
    highp vec3 rayDirection = normalize(cameraPlanePos);
    
    float B = -2.0 * dot(rayDirection, cameraSpherePos);
    float C = dot(cameraSpherePos, cameraSpherePos) - (sphereRadius*sphereRadius);
    
    float det = (B * B) - (4.0 * C);
    if(det < 0.0)
        discard;
        
    float sqrtDet = sqrt(det);
    float posT = (-B + sqrtDet)/2.0;
    float negT = (-B - sqrtDet)/2.0;
    
    float intersectT = min(posT, negT);
    cameraPos = rayDirection * intersectT;
    cameraNormal = normalize(cameraPos - cameraSpherePos);
    return cameraPos;
}


void main(void)
{   
    Impostor(cameraPos, cameraNormal);

    //Set the depth based on the new cameraPos.
    vec4 clipPos = projectionMatrix * vec4(cameraPos, 1.0);
    float ndcDepth = clipPos.z / clipPos.w;
    float depth2 = ((gl_DepthRange.diff * ndcDepth) + gl_DepthRange.near + gl_DepthRange.far) / 2.0;
    gl_FragDepthEXT = depth2;

    vec3 transformedNormal = cameraNormal;
    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );
    
    #include light

    gl_FragColor = vec4( color, 1.0 );
    gl_FragColor.xyz *= vLightFront;
    // gl_FragColor.xyz = transformedNormal;

    // highp vec3 cameraPlanePos = vec3(mapping * sphereRadius, 0.0) + cameraSpherePos;
    // highp vec3 rayDirection = normalize(cameraPlanePos);
    // gl_FragColor = vec4( rayDirection, 1.0 );

    #include fog
}


void main2(void)
{
    gl_FragColor = vec4( color, 1.0 );
}



