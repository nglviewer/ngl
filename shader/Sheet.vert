
attribute vec3 inputDir;
attribute float inputSize;
attribute vec3 inputColor;
//attribute vec3 inputNormal;

varying vec3 color;
varying vec3 normalx;


void main(void){

    color = inputColor;
    //normalx = normalize( inputNormal * normalMatrix );;
    normalx = normalize( normalMatrix * normal );;

    vec3 cameraPos = ( modelViewMatrix * vec4( position + ( normalize(inputDir)*inputSize ), 1.0 ) ).xyz;
    gl_Position = projectionMatrix * vec4( cameraPos, 1.0 );
}
