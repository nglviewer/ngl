// Open-Source PyMOL is Copyright (C) Schrodinger, LLC.

//  All Rights Reserved

//  Permission to use, copy, modify, distribute, and distribute modified
//  versions of this software and its built-in documentation for any
//  purpose and without fee is hereby granted, provided that the above
//  copyright notice appears in all copies and that both the copyright
//  notice and this permission notice appear in supporting documentation,
//  and that the name of Schrodinger, LLC not be used in advertising or
//  publicity pertaining to distribution of the software without specific,
//  written prior permission.

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

// varying float vRadius;

// varying vec3 point;
varying vec3 axis;
varying vec4 base_radius;
varying vec4 end_b;
varying vec3 U;
varying vec3 V;
// varying float b;
varying vec4 w;

#ifdef PICKING
    attribute vec3 pickingColor;
    attribute vec3 pickingColor2;
    varying vec3 vPickingColor;
    varying vec3 vPickingColor2;
#else
    attribute vec3 color;
    attribute vec3 color2;
    varying vec3 vColor;
    varying vec3 vColor2;
#endif

uniform mat4 modelViewMatrixInverse;
uniform float shift;


void main()
{

    #ifdef PICKING
        vPickingColor = pickingColor;
        vPickingColor2 = pickingColor2;
    #else
        vColor = color;
        vColor2 = color2;
    #endif

    // vRadius = radius;
    base_radius.w = radius;

    vec3 center = position;
    vec3 dir = normalize( position2 - position1 );
    float ext = length( position2 - position1 ) / 2.0;

    vec3 cam_dir = normalize(
        ( modelViewMatrixInverse * vec4( 0, 0, 0, 1 ) ).xyz - center
    );

    vec3 ldir;

    float b = dot( cam_dir, dir );
    end_b.w = b;
    if( b < 0.0 ) // direction vector looks away, so flip
        ldir = -ext * dir;
    else // direction vector already looks in my direction
        ldir = ext * dir;

    vec3 left = normalize( cross( cam_dir, ldir ) );
    vec3 leftShift = shift * left * radius;
    if( b < 0.0 )
        leftShift *= -1.0;
    left = radius * left;
    vec3 up = radius * normalize( cross( left, ldir ) );

    // transform to modelview coordinates
    axis =  normalize( normalMatrix * ldir );
    U = normalize( normalMatrix * up );
    V = normalize( normalMatrix * left );

    vec4 base4 = modelViewMatrix * vec4( center - ldir + leftShift, 1.0 );
    base_radius.xyz = base4.xyz / base4.w;

    vec4 top_position = modelViewMatrix * vec4( center + ldir + leftShift, 1.0 );
    vec4 end4 = top_position;
    end_b.xyz = end4.xyz / end4.w;

    w = modelViewMatrix * vec4(
        center + leftShift + mapping.x*ldir + mapping.y*left + mapping.z*up, 1.0
    );

    gl_Position = projectionMatrix * w;

    // avoid clipping
    gl_Position.z = 1.0;

}


