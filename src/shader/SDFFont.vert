uniform float nearClip;
uniform float xOffset;
uniform float yOffset;
uniform float zOffset;
uniform bool ortho;

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

    float _zOffset = zOffset;
    if( texCoord.x == 10.0 ){
        _zOffset -= 0.001;
    }

    vec3 pos = position;
    if( ortho ){
        pos += normalize( cameraPosition ) * _zOffset;
    }
    vec4 cameraPos = modelViewMatrix * vec4( pos, 1.0 );
    vec4 cameraCornerPos = vec4( cameraPos.xyz, 1.0 );
    cameraCornerPos.xy += mapping * inputSize * 0.01;
    cameraCornerPos.x += xOffset;
    cameraCornerPos.y += yOffset;
    if( !ortho ){
        cameraCornerPos.xyz += normalize( -cameraCornerPos.xyz ) * _zOffset;
    }

    gl_Position = projectionMatrix * cameraCornerPos;

    vViewPosition = -cameraCornerPos.xyz;

    #include nearclip_vertex

}