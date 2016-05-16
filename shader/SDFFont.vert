uniform float nearClip;
uniform float xOffset;
uniform float yOffset;
uniform float zOffset;
uniform float ortho;

varying vec3 vViewPosition;
varying vec2 texCoord;

attribute vec2 mapping;
attribute vec2 inputTexCoord;
attribute float inputSize;

#include color_pars_vertex
#include common

void main(void){

    #include color_vertex
    texCoord = inputTexCoord;

    vec3 pos = position;
    if( ortho != 0.0 ){
        pos += normalize( cameraPosition ) * zOffset;
    }
    vec4 cameraPos = modelViewMatrix * vec4( pos, 1.0 );
    vec4 cameraCornerPos = vec4( cameraPos.xyz, 1.0 );
    cameraCornerPos.xy += mapping * inputSize * 0.01;
    cameraCornerPos.x += xOffset;
    cameraCornerPos.y += yOffset;
    if( ortho == 0.0 ){
        cameraCornerPos.xyz += normalize( -cameraCornerPos.xyz ) * zOffset;
    }

    gl_Position = projectionMatrix * cameraCornerPos;

    vViewPosition = -cameraCornerPos.xyz;

    #include nearclip_vertex

}