
precision highp float;
precision highp int;

// uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

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

// Note: here the box screen aligned code from Open-Source PyMOL is used

// Contributions by Alexander Rose
// - ported to WebGL
// - dual color
// - adapted for line sprites

attribute vec3 position;
attribute lowp vec2 inputMapping;
attribute lowp vec3 inputColor;
attribute lowp vec3 inputColor2;
attribute lowp vec3 inputAxis;
attribute lowp float inputWidth;

varying float dist;
varying lowp vec3 color;
varying lowp vec3 color2;


// void main2(void){
//     colorx = inputColor;

//     vec2 B;
//     vec3 C;
//     if (inputAxis.y != 0.0 || inputAxis.z != 0.0){
//         C = vec3(1.0, 0.0, 0.0);
//     }else{
//         C = vec3(0.0, 1.0, 0.0);
//     }
//     B = normalize(cross(inputAxis, C).xy);

//     vec4 cameraCornerPos = modelViewMatrix * vec4( position, 1.0 );
//     cameraCornerPos.xy += inputMapping * (B.xy * inputWidth);

//     gl_Position = projectionMatrix * cameraCornerPos;
// }


void main(void){
    mat4 MVMatrix = modelViewMatrix;
    mat4 PMatrix = projectionMatrix;
    vec4 EyePoint = vec4( cameraPosition, 1.0 );

    vec3 center = position.xyz;
    vec3 dir = normalize(inputAxis);
    // float ext = inputCylinderHeight/2.0;
    vec3 ldir;

    vec3 cam_dir = normalize(EyePoint.xyz - center);
    float b = dot(cam_dir, dir);
    // direction vector looks away, so flip
    if(b<0.0)
        //ldir = -ext*dir;
        ldir = -(length(inputAxis)/2.0) * normalize(inputAxis);
    // direction vector already looks in my direction
    else
        //ldir = ext*dir;
        ldir = (length(inputAxis)/2.0) * normalize(inputAxis);

    vec3 left = cross(cam_dir, ldir);
    vec3 up = cross(left, ldir);
    left = inputWidth*normalize(left);
    up = inputWidth*normalize(up);

    vec4 w = MVMatrix * vec4(
        center + inputMapping.x*ldir + inputMapping.y*left, 1.0
    );

    gl_Position = PMatrix * w;


    vec4 base4 = MVMatrix * vec4(center-ldir, 1.0);
    vec3 base = base4.xyz / base4.w;

    vec4 top_position = MVMatrix*(vec4(center+ldir,1.0));
    vec4 end4 = top_position;
    vec3 end = end4.xyz / end4.w;

    vec3 point = w.xyz / w.w;

    color = inputColor;
    color2 = inputColor2;

    // TODO compare without sqrt
    if( distance( point, end ) < distance( point, base ) ){
        dist = b > 0.0 ? 1.0 : 0.0;
    }else{
        dist = b < 0.0 ? 1.0 : 0.0;
    }

}