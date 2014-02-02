
varying lowp vec2 mapping;
varying highp vec3 cameraSpherePos;
varying lowp float sphereRadius;

uniform lowp vec3 colorx;

#include fog_params


void main(void)
{   

    float lensqr = dot(mapping, mapping);
    if(lensqr > 1.0)
        discard;

    if(lensqr < 0.65)
        discard;

    if(lensqr < 0.9){
        gl_FragColor = vec4( colorx, 0.5 );
    }else{
        gl_FragColor = vec4( colorx, 1.0 );
    }

    #include fog
}


