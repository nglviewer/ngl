
precision highp float;
precision highp int;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

attribute vec3 position;
attribute vec3 inputDir;
attribute float inputSize;
attribute vec3 normal;

varying vec4 cameraPos;

#ifdef PICKING
    attribute vec3 pickingColor;
    varying vec3 vPickingColor;
#else
    attribute vec3 inputColor;
    varying vec3 color;
    varying vec3 vNormal;
#endif

void main(void){

    #ifdef PICKING
        vPickingColor = pickingColor;
    #else
        color = inputColor;
        vNormal = normalize( normalMatrix * normal );
    #endif

    cameraPos = modelViewMatrix * vec4(
        position + ( normalize( inputDir ) * inputSize ), 1.0
    );

    gl_Position = projectionMatrix * vec4( cameraPos.xyz, 1.0 );

}
