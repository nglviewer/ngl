
// attribute vec3 position;
// attribute vec3 normal;
attribute vec3 color;

varying vec3 vNormal;
varying vec3 vColor;



void main()
{

	vNormal = normalize( normalMatrix * normal );
	vColor = color;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	if( gl_Position.z<=1.0 )
        gl_Position.z = -10.0;
    
}
