// Open-Source PyMOL is Copyright (C) Schrodinger, LLC.
//
//  All Rights Reserved
//
//  Permission to use, copy, modify, distribute, and distribute modified
//  versions of this software and its built-in documentation for any
//  purpose and without fee is hereby granted, provided that the above
//  copyright notice appears in all copies and that both the copyright
//  notice and this permission notice appear in supporting documentation,
//  and that the name of Schrodinger, LLC not be used in advertising or
//  publicity pertaining to distribution of the software without specific,
//  written prior permission.
//
//  SCHRODINGER, LLC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,
//  INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN
//  NO EVENT SHALL SCHRODINGER, LLC BE LIABLE FOR ANY SPECIAL, INDIRECT OR
//  CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
//  OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
//  OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE
//  USE OR PERFORMANCE OF THIS SOFTWARE.

// Contributions by Alexander Rose
// - ported to WebGL
// - dual color
// - picking color
// - shift

attribute vec3 mapping;
attribute vec3 position1;
attribute vec3 position2;
attribute float radius;

varying vec3 axis; // Cylinder axis
varying vec4 base_radius; // base position and cylinder radius packed into a vec4
varying vec4 end_b; // End position and "b" flag which indicates whether pos1/2 is flipped
varying vec3 U; // axis, U, V form orthogonal basis aligned to the cylinder
varying vec3 V; 
varying vec4 w; // The position of the vertex after applying the mapping

#ifdef PICKING
    #include unpack_color
    attribute float primitiveId;
    varying vec3 vPickingColor;
#else
    attribute vec3 color2;
    varying vec3 vColor1;
    varying vec3 vColor2;
#endif

uniform mat4 modelViewMatrixInverse;
uniform float ortho;

#include matrix_scale

void main(){

    #ifdef PICKING
        vPickingColor = unpackColor( primitiveId );
    #else
        vColor1 = color;
        vColor2 = color2;
    #endif

    // Pack the radius
    base_radius.w = radius * matrixScale( modelViewMatrix );

    // position is supplied by mapped-buffer.ts as midpoint of position1 and 2
    vec3 center = position; 

    vec3 dir = normalize( position2 - position1 );
    float ext = length( position2 - position1 ) / 2.0; // Half-length of cylinder

    // Determine which direction the camera is in (in molecule coords)
    // using cameraPosition fails on some machines, not sure why
    // vec3 cam_dir = normalize( cameraPosition - mix( center, vec3( 0.0 ), ortho ) );
    vec3 cam_dir;
    if( ortho == 0.0 ){
        cam_dir = ( modelViewMatrixInverse * vec4( 0, 0, 0, 1 ) ).xyz - center;
        // Equivalent to, but see note above
        // cam_dir = normalize( cameraPosition - center );
    }else{
        // Orthographic camera looks along -Z
        cam_dir = ( modelViewMatrixInverse * vec4( 0, 0, 1, 0 ) ).xyz;
    }
    cam_dir = normalize( cam_dir );

    // ldir is the cylinder's direction (center->end) in model coords
    // It will always point towards the camera
    vec3 ldir; 

    float b = dot( cam_dir, dir );
    end_b.w = b;
    // direction vector looks away, so flip
    if( b < 0.0 )
        ldir = -ext * dir;
    // direction vector already looks in my direction
    else
        ldir = ext * dir;

    // left, up and ldir are orthogonal coordinates aligned with cylinder (ldir)
    // scaled to the length and radius of the box
    vec3 left = radius * normalize( cross( cam_dir, ldir ) );
    vec3 up = radius * normalize( cross( left, ldir ) );


    // Normalized versions of ldir, up and left, these can be used to convert
    // from modelView <-> cylinder-aligned
    axis = normalize( normalMatrix * ldir );
    U = normalize( normalMatrix * up );
    V = normalize( normalMatrix * left );

    // Transform the base (the distant cap) and pack its coordinate
    vec4 base4 = modelViewMatrix * vec4( center - ldir, 1.0 );
    base_radius.xyz = base4.xyz / base4.w;

    // Similarly with the end (the near cap)
    vec4 end4 = modelViewMatrix * vec4( center + ldir, 1.0 );
    end_b.xyz = end4.xyz / end4.w;

    // w is effective coordinate (apply the mapping)
    w = modelViewMatrix * vec4(
        center + mapping.x*ldir + mapping.y*left + mapping.z*up, 1.0
    );

    gl_Position = projectionMatrix * w;

    // avoid clipping (1.0 seems to induce flickering with some drivers)
    // Is this required?
    gl_Position.z = 0.99;

}