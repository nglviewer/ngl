uniform mat4 projectionMatrixInverse;
uniform float clipNear;

varying float vRadius;
varying float vRadiusSq;
varying vec3 vPoint;
varying vec3 vPointViewPosition;

attribute vec2 mapping;
attribute float radius;

#ifdef PICKING
    #include unpack_color
    attribute float primitiveId;
    varying vec3 vPickingColor;
#else
    #include color_pars_vertex
#endif

#include matrix_scale

const mat4 D = mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, -1.0
);

mat4 transposeM( in mat4 inMatrix ) {
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
// Compute point size and center using the technique described in:
// "GPU-Based Ray-Casting of Quadratic Surfaces"
// by Christian Sigg, Tim Weyrich, Mario Botsch, Markus Gross.
//
// Code based on
/*=========================================================================

 Program:   Visualization Toolkit
 Module:    Quadrics_fs.glsl and Quadrics_vs.glsl

 Copyright (c) Ken Martin, Will Schroeder, Bill Lorensen
 All rights reserved.
 See Copyright.txt or http://www.kitware.com/Copyright.htm for details.

 This software is distributed WITHOUT ANY WARRANTY; without even
 the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 PURPOSE.  See the above copyright notice for more information.

 =========================================================================*/

// .NAME Quadrics_fs.glsl and Quadrics_vs.glsl
// .SECTION Thanks
// <verbatim>
//
//  This file is part of the PointSprites plugin developed and contributed by
//
//  Copyright (c) CSCS - Swiss National Supercomputing Centre
//                EDF - Electricite de France
//
//  John Biddiscombe, Ugo Varetto (CSCS)
//  Stephane Ploix (EDF)
//
// </verbatim>
//
// Contributions by Alexander Rose
// - ported to WebGL
// - adapted to work with quads
void ComputePointSizeAndPositionInClipCoordSphere(){

    vec2 xbc;
    vec2 ybc;

    mat4 T = mat4(
        radius, 0.0, 0.0, 0.0,
        0.0, radius, 0.0, 0.0,
        0.0, 0.0, radius, 0.0,
        position.x, position.y, position.z, 1.0
    );

    mat4 R = transposeM( projectionMatrix * modelViewMatrix * T );
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
    gl_Position.xy -= mapping * vec2( sx, sy );
    gl_Position.xy *= gl_Position.w;

}

void main(void){

    #ifdef PICKING
        vPickingColor = unpackColor( primitiveId );
    #else
        #include color_vertex
    #endif

    vRadius = radius * matrixScale( modelViewMatrix );

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    // avoid clipping, added again in fragment shader
    mvPosition.z -= vRadius;

    gl_Position = projectionMatrix * vec4( mvPosition.xyz, 1.0 );
    ComputePointSizeAndPositionInClipCoordSphere();


    vRadiusSq = vRadius * vRadius;
    vec4 vPoint4 = projectionMatrixInverse * gl_Position;
    vPoint = vPoint4.xyz / vPoint4.w;
    vPointViewPosition = -mvPosition.xyz / mvPosition.w;

}