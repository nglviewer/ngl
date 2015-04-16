
attribute vec3 color;

varying vec3 vColor;
varying vec4 cameraPos;


void main()
{

    vColor = color;

    cameraPos =  modelViewMatrix * vec4( position, 1.0 );

    gl_Position = projectionMatrix * vec4( cameraPos.xyz, 1.0 );

}
