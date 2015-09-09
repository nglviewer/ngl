
precision highp float;
precision highp int;

// uniform mat4 viewMatrix;
// uniform vec3 cameraPosition;

varying float dist;
varying highp vec3 color;
varying highp vec3 color2;

#include fog_params


void main() {

    if( dist > 0.5 ){
        gl_FragColor = vec4( color, 1.0 );
    }else{
        gl_FragColor = vec4( color2, 1.0 );
    }

    #include fog
}
