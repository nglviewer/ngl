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


// cylinder imposter vertex shader

attribute vec4 attr_origin;
attribute vec4 attr_axis;
attribute vec4 attr_colors;
attribute vec4 attr_colors2;

uniform float uni_radius;

//varying vec3 point; // surface point
//varying vec3 axis; // cylinder axis
//varying vec3 base; // cylinder base
//varying vec3 end; // cylinder end
//varying vec3 U; // cylinder base plane coordinates
//varying vec3 V;
//varying float radius; // radius
//varying float cap; // should we draw the endcap
//varying float inv_sqr_height;

varying vec4 packed_data_0 ;
varying vec4 packed_data_1 ;
varying vec4 packed_data_2 ;
varying vec4 packed_data_3 ;
varying vec4 packed_data_4 ;
varying vec4 packed_data_5 ;

#define point ( packed_data_0.xyz )
#define axis ( packed_data_1.xyz )
#define base ( packed_data_2.xyz )
#define end ( packed_data_3.xyz )
#define U ( packed_data_4.xyz )
#define V ( packed_data_5.xyz )
#define radius (packed_data_3.w)
#define cap (packed_data_4.w)
#define inv_sqr_height (packed_data_5.w)

varying vec4 color1;
varying vec4 color2;
varying vec2 bgTextureLookup;
uniform vec2 pixelSize;

void main(void)
{
    if (uni_radius!=0.0){
        radius = uni_radius * attr_origin.w;
    } else {
        radius = attr_origin.w;
    }
    color1 = attr_colors;
    color2 = attr_colors2;

    float packed_flags = attr_axis.w;

    vec4 flags = mod(vec4(packed_flags/262144.0, packed_flags/4096.0, 
                          packed_flags/64.0, packed_flags), 64.0);

    cap = flags.x;

    float right_v = flags.y;

    float up_v = flags.z;

    float out_v = flags.w;

    // calculate reciprocal of squared height
    inv_sqr_height = length(attr_axis.xyz);
    inv_sqr_height *= inv_sqr_height;
    inv_sqr_height = 1.0 / inv_sqr_height;

    // h is a normalized cylinder axis
    vec3 h = normalize(attr_axis.xyz);

    // axis is the cylinder axis in modelview coordinates
    axis =  normalize(gl_NormalMatrix * h);

    // u, v, h is local system of coordinates
    vec3 u = cross(h, vec3(1.0, 0.0, 0.0));
    if (dot(u,u) < 0.001) 
      u = cross(h, vec3(0.0, 1.0, 0.0));
    u = normalize(u);
    vec3 v = normalize(cross(u, h));

    // transform to modelview coordinates
    U = normalize(gl_NormalMatrix * u);
    V = normalize(gl_NormalMatrix * v);
    
    // compute bounding box vertex position
    vec4 vertex = vec4(attr_origin.xyz, 1.0); 

    vertex.xyz += up_v * attr_axis.xyz;
    vertex.xyz += (2.0 * right_v - 1.0) * radius * u;
    vertex.xyz += (2.0 * out_v - 1.0) * radius * v;
    vertex.xyz += (2.0 * up_v - 1.0) * radius * h;

    vec4 base4 = gl_ModelViewMatrix * vec4(attr_origin.xyz, 1.0);
    base = base4.xyz / base4.w;

    vec4 end4 = gl_ModelViewMatrix * vec4(attr_origin.xyz + 1.0 * attr_axis.xyz, 1.0);
    end = end4.xyz / end4.w;

    vec4 tvertex = gl_ModelViewMatrix * vertex;
    point = tvertex.xyz / tvertex.w;

    gl_Position = gl_ModelViewProjectionMatrix * vertex;
    bgTextureLookup = (gl_Position.xy/gl_Position.w) / 2.0 + 0.5;
}

