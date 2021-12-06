// Copyright (C) 2010-2011 by
// Laboratoire de Biochimie Theorique (CNRS),
// Laboratoire d'Informatique Fondamentale d'Orleans (Universite d'Orleans), (INRIA) and
// Departement des Sciences de la Simulation et de l'Information (CEA).
//
// License: CeCILL-C license (http://www.cecill.info/)
//
// Contact: Marc Baaden
// E-mail: baaden@smplinux.de
// Webpage: http://hyperballs.sourceforge.net

// Contributions by Alexander Rose
// - ported to WebGL
// - dual color
// - picking color

attribute vec3 mapping;
attribute float radius;
attribute float radius2;
attribute vec3 position1;
attribute vec3 position2;

varying mat4 matrix_near;
varying vec4 prime1;
varying vec4 prime2;
varying float vRadius;
varying float vRadius2;

#ifdef PICKING
    #include unpack_color
    attribute float primitiveId;
    varying vec3 vPickingColor;
#else
    // attribute vec3 color;
    attribute vec3 color2;
    varying vec3 vColor1;
    varying vec3 vColor2;
#endif

uniform float shrink;
uniform mat4 modelViewProjectionMatrix;
uniform mat4 modelViewProjectionMatrixInverse;

void main(){

    vRadius = radius;
    vRadius2 = radius2;

    vec4 spaceposition;
    vec3 position_atom1;
    vec3 position_atom2;
    vec4 vertex_position;

    #ifdef PICKING
        vPickingColor = unpackColor( primitiveId );
    #else
        vColor1 = color;
        vColor2 = color2;
    #endif

    float radius1 = radius;

    position_atom1 = position1;
    position_atom2 = position2;

    float distance = distance( position_atom1, position_atom2 );

    spaceposition.z = mapping.z * distance;

    if (radius1 > radius2) {
        spaceposition.y = mapping.y * 1.5 * radius1;
        spaceposition.x = mapping.x * 1.5 * radius1;
    } else {
        spaceposition.y = mapping.y * 1.5 * radius2;
        spaceposition.x = mapping.x * 1.5 * radius2;
    }
    spaceposition.w = 1.0;

    vec4 e3 = vec4( 1.0 );
    vec3 e1, e1_temp, e2, e2_temp;

    // Calculation of bond direction: e3
    e3.xyz = normalize(position_atom1-position_atom2);

    // little hack to avoid some problems of precision due to graphic card limitation using float: To improve soon
    if (e3.z == 0.0) { e3.z = 0.0000000000001;}
    if ( (position_atom1.x - position_atom2.x) == 0.0) { position_atom1.x += 0.001;}
    if ( (position_atom1.y - position_atom2.y) == 0.0) { position_atom1.y += 0.001;}
    if ( (position_atom1.z - position_atom2.z) == 0.0) { position_atom1.z += 0.001;}

    // Focus calculation
    vec4 focus = vec4( 1.0 );
    focus.x = ( position_atom1.x*position_atom1.x - position_atom2.x*position_atom2.x +
        ( radius2*radius2 - radius1*radius1 )*e3.x*e3.x/shrink )/(2.0*(position_atom1.x - position_atom2.x));
    focus.y = ( position_atom1.y*position_atom1.y - position_atom2.y*position_atom2.y +
        ( radius2*radius2 - radius1*radius1 )*e3.y*e3.y/shrink )/(2.0*(position_atom1.y - position_atom2.y));
    focus.z = ( position_atom1.z*position_atom1.z - position_atom2.z*position_atom2.z +
        ( radius2*radius2 - radius1*radius1 )*e3.z*e3.z/shrink )/(2.0*(position_atom1.z - position_atom2.z));

    // e1 calculation
    e1.x = 1.0;
    e1.y = 1.0;
    e1.z = ( (e3.x*focus.x + e3.y*focus.y + e3.z*focus.z) - e1.x*e3.x - e1.y*e3.y)/e3.z;
    e1_temp = e1 - focus.xyz;
    e1 = normalize(e1_temp);

    // e2 calculation
    e2_temp = e1.yzx * e3.zxy - e1.zxy * e3.yzx;
    e2 = normalize(e2_temp);

    //ROTATION:
    // final form of change of basis matrix:
    mat3 R= mat3( e1.xyz, e2.xyz, e3.xyz );
    // Apply rotation and translation to the bond primitive
    vertex_position.xyz = R * spaceposition.xyz;
    vertex_position.w = 1.0;

    // TRANSLATION:
    vertex_position.x += (position_atom1.x+position_atom2.x) / 2.0;
    vertex_position.y += (position_atom1.y+position_atom2.y) / 2.0;
    vertex_position.z += (position_atom1.z+position_atom2.z) / 2.0;

    // New position
    gl_Position = modelViewProjectionMatrix * vertex_position;

    vec4 i_near, i_far;

    // Calculate near from position
    vec4 near = gl_Position;
    near.z = 0.0 ;
    near = modelViewProjectionMatrixInverse * near;
    i_near = near;

    // Calculate far from position
    vec4 far = gl_Position;
    far.z = far.w ;
    i_far = modelViewProjectionMatrixInverse * far;

    prime1 = vec4( position_atom1 - (position_atom1 - focus.xyz)*shrink, 1.0 );
    prime2 = vec4( position_atom2 - (position_atom2 - focus.xyz)*shrink, 1.0 );

    float Rsquare = (radius1*radius1/shrink) - (
                        (position_atom1.x - focus.x)*(position_atom1.x - focus.x) +
                        (position_atom1.y - focus.y)*(position_atom1.y - focus.y) +
                        (position_atom1.z - focus.z)*(position_atom1.z - focus.z)
                    );

    focus.w = Rsquare;

    matrix_near = mat4( i_near, i_far, focus, e3 );

    // avoid clipping
    gl_Position.z = 1.0;

}