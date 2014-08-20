
attribute vec3 inputColor;

varying vec3 color;
varying vec3 vNormal;




void main(void){

    color = inputColor;
    vNormal = normal;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}