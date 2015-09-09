
precision highp float;
precision highp int;

// uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat3 normalMatrix;
// uniform vec3 cameraPosition;

attribute vec3 position;
attribute vec3 color;

varying vec3 vColor;
varying vec4 cameraPos;


void main()
{

    vColor = color;

    cameraPos =  modelViewMatrix * vec4( position, 1.0 );

    gl_Position = projectionMatrix * vec4( cameraPos.xyz, 1.0 );

}
