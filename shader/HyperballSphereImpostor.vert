
attribute vec2 inputMapping;
attribute float inputSphereRadius;
attribute vec3 inputColor;

varying vec2 mapping;

varying vec4 i_near;
varying vec4 i_far;
varying vec4 sphereposition;
varying vec4 vColor;
varying float radius;

uniform mat4 modelViewProjectionMatrix;
uniform mat4 modelViewProjectionMatrixInverse;


const float FEPS = 0.000001;
const float DEF_Z = 1.0 - FEPS;
const mat4 D = mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, -1.0
);

mat4 transpose( in mat4 inMatrix ) {
    vec4 i0 = inMatrix[0];
    vec4 i1 = inMatrix[1];
    vec4 i2 = inMatrix[2];
    vec4 i3 = inMatrix[3];

    mat4 outMatrix = mat4(
        vec4(i0.x, i1.x, i2.x, i3.x),
        vec4(i0.y, i1.y, i2.y, i3.y),
        vec4(i0.z, i1.z, i2.z, i3.z),
        vec4(i0.w, i1.w, i2.w, i3.w)
    );
    return outMatrix;
}


//------------------------------------------------------------------------------
/// Compute point size and center using the technique described in:
/// "GPU-Based Ray-Casting of Quadratic Surfaces"
/// by Christian Sigg, Tim Weyrich, Mario Botsch, Markus Gross.
//
// Code based on ...
// 
// ASR: Adapted to work with quads
void ComputePointSizeAndPositionInClipCoordSphere(){
    
    vec2 xbc;
    vec2 ybc;

    mat4 T = mat4(
        inputSphereRadius, 0.0, 0.0, 0.0,
        0.0, inputSphereRadius, 0.0, 0.0,
        0.0, 0.0, inputSphereRadius, 0.0,
        position.x, position.y, position.z, 1.0
    );

    mat4 R = transpose( modelViewProjectionMatrix * T );
    float A = dot( R[ 3 ], D * R[ 3 ] );
    float B = -2.0 * dot( R[ 0 ], D * R[ 3 ] );
    float C = dot( R[ 0 ], D * R[ 0 ] );
    xbc[ 0 ] = ( -B - sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );
    xbc[ 1 ] = ( -B + sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );
    float sx = abs( xbc[ 0 ] - xbc[ 1 ] ) * 0.5;

    A = dot( R[ 3 ], D * R[ 3 ] );
    B = -2.0 * dot( R[ 1 ], D * R[ 3 ] );
    C = dot( R[ 1 ], D * R[ 1 ] );
    ybc[ 0 ] = ( -B - sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );
    ybc[ 1 ] = ( -B + sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );
    float sy = abs( ybc[ 0 ] - ybc[ 1 ]  ) * 0.5;

    gl_Position.xy = vec2( 0.5 * ( xbc.x + xbc.y ), 0.5 * ( ybc.x + ybc.y ) );
    gl_Position.xy -= inputMapping * vec2( sx, sy );
    gl_Position.xy *= gl_Position.w;
}


void main(){

    radius = inputSphereRadius;
    vColor = vec4( inputColor, 1.0 );
    sphereposition = vec4( position, 1.0 );

    gl_Position = modelViewProjectionMatrix * sphereposition;
    ComputePointSizeAndPositionInClipCoordSphere();
    
    // Calculate near from position
    vec4 near = gl_Position;
    near.z = 0.0;
    i_near = modelViewProjectionMatrixInverse * near;

    // Calculate far from position
    vec4 far = gl_Position;
    far.z = far.w;
    i_far = modelViewProjectionMatrixInverse * far;
}



void main2()  {

}

