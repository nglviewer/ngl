
#extension GL_EXT_frag_depth : enable

uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 modelViewMatrix;

uniform mat4 projectionMatrixInverse;
uniform mat4 projectionMatrixTranspose;
uniform mat4 modelViewMatrixInverse;

varying vec3 p;
varying vec3 q;
varying vec3 r;
varying vec3 s;

varying vec3 axisA;
varying vec3 axisB;

#include light_params

#include fog_params


float side_of_plane(vec3 pt,vec3 n,vec3 ppt)
{
  return dot(n,pt) - dot(n,ppt);
}

vec3 closest_line_pt(vec3 l,vec3 ldir,vec3 p)
{
  return l+ldir*dot(p-l,ldir)/dot(ldir,ldir);
}

vec3 plane_line_ixn(vec3 pn, vec3 pp, vec3 ldir, vec3 l)
{
  return l + ldir*dot(pp-l,pn)/dot(ldir,pn);
}

const float plane_shift_eps = 0.01;


#define PI     3.14159265358979323846264338
#define TWOPI (2.0*PI)


/*=========================================================================

 Program:   Visualization Toolkit
 Module:    Quadrics_fs.glsl

 Copyright (c) Ken Martin, Will Schroeder, Bill Lorensen
 All rights reserved.
 See Copyright.txt or http://www.kitware.com/Copyright.htm for details.

 This software is distributed WITHOUT ANY WARRANTY; without even
 the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 PURPOSE.  See the above copyright notice for more information.

 =========================================================================*/

// .NAME Quadrics_fs.glsl
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
// IN:
//   - vertex position
//   - point size
//   - ray origin
//   - quadric equation coefficients
//   - color
//   - min point size (pointThreshold)
//
// OUT:
//   - fragment color computed from point intersected by ray shot from
//     viewpoint through point computed from current fragment coordinate
//   - fragment depth computed by projecting the intersection point into screen
//     coordinates


// OPTIMAL
//#define ELLIPSOID
//#define CYLINDER
//#define CONE
//#define HYPERBOLOID1
//#define HYPERBOLOID2
//#define PARABOLOID

// SUB OPTIMAL
//#define HYPER_PARABOLOID

varying float a;
varying float b;
varying float c;
varying float d;
varying float e;
varying float f;
varying float g;
varying float h;
varying float i;
varying float j;

varying vec4 vColor;
varying vec3 point;

vec3 raydir; // ray direction in screen space
vec3 rayorigin; // ray origin in screen space

varying mat4 Ti;

const float FLAT_SHADE_POINT_SIZE = 1.0; //if point size < 1 use flat shading
const float FEPS = 0.0001;
const float BOUND = 1.0 + FEPS;
const vec3 MIN_BOUND = vec3(-BOUND);
const vec3 MAX_BOUND = vec3(BOUND);


//------------------------------------------------------------------------------
// BOUNDS CHECK
// in general it makes sense to check only along the z direction for:
// - paraboloids
// - hyperboloids of one sheet
// - cylinders
// - cones
// and no checking at all is required for ellipsoids
#ifndef ELLIPSOID
bool InBounds( vec3 P )
{
    vec4 v = Ti * modelViewMatrixInverse * vec4( P, 1.0 );
    
    #if defined( CYLINDER ) || defined( CONE ) || defined( HYPERBOLOID1 ) || defined( PARABOLOID )
        return v.z >= -BOUND && v.z <= BOUND;
    #else
        return all( greaterThanEqual( v.xyz, MIN_BOUND ) ) &&
                all( lessThanEqual( v.xyz, MAX_BOUND ) );
    #endif
}
#endif


// INTERSECTION
struct I
{
    vec3 P;
    vec3 N;
    float t;
};


// compute unit normal from gradient
vec3 ComputeNormal(vec3 P)
{
    return normalize(
        vec3( dot(vec4(a, d, e, 1.0), vec4(P, g)), // should multiply by 2 for actual gradient
              dot(vec4(d, b, f, 1.0), vec4(P, h)), // should multiply by 2 for actual gradient
              dot(vec4(e, f, c, 1.0), vec4(P, i))  // should multiply by 2 for actual gradient
        )
    );
}

//
// | a d e g |
// | d b f h |
// | e f c i |
// | g h i j |
// f(x,y,z) = ax^2 + by^2 + cz^2 + 2dxy + 2exz + 2fyz + 2gx + 2hy + 2iz + j = 0

// compute ray quadric intersection; if no intersection occurs I.t is < 0
// main axis length and orientation are used to clip the quadric; not
// required for closed quadrics (ellipsoids)
// | a d e g |
// | d b f h |
// | e f c i |
// | g h i j |
// ax^2 + by^2 + cz^2 + 2dxy +2exz + 2fyz + 2gx + 2hy + 2iz + j = 0
/// @todo pass vec3(a, b, c), vec3( d, e, f ) and vec3( g, h, i ) instead of single coefficients
I ComputeRayQuadricIntersection()
{
    I ip;
    ip.t = -1.0;
    vec3 P = rayorigin;
    vec3 D = raydir;
    float A = 0.0;
    float B = 0.0;
    float C = 0.0;

    A = dot(vec3(a, b, c), D * D) + 2.0 * dot(vec3(d, e, f), D.xxy * D.yzz);
    B = 2.0 * dot(vec3(g, h, i), D);
    C = j;
    
    float delta = B * B - 4.0 * A * C;

    if (delta < 0.0)
        return ip;

    float d = sqrt(delta);
    A = 1.0 / A;
    A *= 0.5;
    float t2 = A * (-B + d);
    float t1 = A * (-B - d);

    #ifdef ELLIPSOID
        ip.P = rayorigin + D * min(t1, t2);
        ip.N = ComputeNormal(ip.P);
        ip.t = 0.0;
    #else
        vec3 P1 = rayorigin + D * min( t1, t2 );
        vec3 P2 = rayorigin + D * max( t1, t2 );
        if( InBounds( P1 ) )
        {
            ip.P = P1;
            ip.N = ComputeNormal( P1 );
            ip.t = 0.0;
        }
        else if( InBounds( P2 ) )
        {
            ip.P = P2;
            ip.N = ComputeNormal( P2 );
            ip.t = 0.0;
        }
    #endif

    return ip;
}


vec3 ellipse_normal( vec3 point, vec3 axis_a, vec3 axis_b, vec3 center )
{
    float fl = sqrt( length(axis_a)*length(axis_a) - length(axis_b)*length(axis_b) );
    vec3 f1 = center + fl*normalize(axis_a);
    vec3 f2 = center - fl*normalize(axis_a);
    vec3 f1_v = point - f1;
    vec3 f2_v = point - f2;
    vec3 normal = normalize(f1_v) + normalize(f2_v);
    return normalize( normal );
}


void main(void)
{   
    rayorigin = vec3( 0.0, 0.0, 0.0 );
    raydir = normalize( point );
    
    // compute intersection
    I i = ComputeRayQuadricIntersection();
    
    // update depth by projecting point and updating depth coordinate
    // the transposed version of the projection matrix is used to
    // perform vector, matrix row product in one line:
    // M[2][*] x V = Vt x Mt[*][2] where:
    //   % V  is a column vector
    //   % Vt is a row vector
    //   % M is a square matrix
    //   % Mt is the transpose of M
    float z = dot( vec4( i.P, 1.0 ), projectionMatrixTranspose[2] );
    float w = dot( vec4( i.P, 1.0 ), projectionMatrixTranspose[3] );
    gl_FragDepthEXT = 0.5 * (z / w + 1.0);

    // bugfix (mac only?)
    if (gl_FragDepthEXT <= 0.0)
        discard;
    if (gl_FragDepthEXT >= 1.0)
        discard;


    vec3 normal;
    vec3 pt_q;
    vec3 pt_r;
    vec3 pt_c;
    float theta;
    vec3 tangent;
    float foo;
    //if(true){
        vec3 pt    = i.P;
        vec3 qr    = normalize(r-q);
        vec3 pqr   = (normalize(q-p) + qr)/2.0;
        vec3 qrs   = (qr + normalize(s-r))/2.0;

        if(side_of_plane(pt,pqr,q-qr*plane_shift_eps) < 0.0 || 
            side_of_plane(pt,qrs,r+qr*plane_shift_eps) > 0.0 )
                discard;

        pt_q    = plane_line_ixn(pqr,q,qr,pt);
        pt_r    = plane_line_ixn(qrs,r,qr,pt);
        //float wt     = length(pt-pt_q)/length(pt_r-pt_q);
        float wt     = distance(pt,pt_q)/distance(pt_r,pt_q);
        normal = (1.0-wt)*normalize(pt_q - q) + wt*normalize(pt_r - r);

        // if(wt<0.5){
        //     normal = (1.0-wt)*i.N + wt*normalize(pt_r - r);
        // }else{
        //     normal = (1.0-wt)*normalize(pt_q - q) + wt*i.N;
        // }

        pt_c = closest_line_pt( r , qr , pt );
        // vec3 pt_cv = normalize( pt-pt_c );
        // theta = acos( dot( normalize(axisA), pt_cv ) );
        // vec3 aa = axisA;
        // vec3 ab = axisB;
        // if( dot( normalize(ab), pt_cv )<0.0 )
        //     ab *= -1.0;
        // tangent = -
        //     (length(aa)*sin(theta))*normalize(aa) + 
        //     (length(ab)*cos(theta))*normalize(ab);
        // vec3 np = cross( aa, ab );
        // normal = cross( tangent, np );


        float fl = sqrt( length(axisA)*length(axisA) - length(axisB)*length(axisB) );
        vec3 f1 = pt_c + fl*normalize(axisA);
        vec3 f2 = pt_c - fl*normalize(axisA);
        vec3 f1_v = pt-f1;
        vec3 f2_v = pt-f2;
        normal = normalize(f1_v) + normalize(f2_v);


        vec3 px = pt_c + fl*axisA;

        vec3 px_q = plane_line_ixn( pqr, q, qr, px );
        vec3 ax_qa = normalize( px_q - q )*3.0;
        vec3 ax_qb = normalize( cross( ax_qa, pqr ) )*0.7;
        vec3 nq = ellipse_normal( pt_q, ax_qa, ax_qb, q );

        vec3 px_r = plane_line_ixn( qrs, r, qr, px );
        vec3 ax_ra = normalize(px_r - r)*3.0;
        vec3 ax_rb = normalize( cross( ax_ra, qrs ) )*0.7;
        vec3 nr = ellipse_normal( pt_r, ax_ra, ax_rb, r );

        normal = (1.0-wt)*nq + wt*nr;
        //normal = nq;

        //foo = degrees( acos( dot( normalize(ax_qa), normalize(ax_qb) ) ) );

        //normal = ellipse_normal( pt, axisA, axisB, pt_c );
    //}



    //vec3 transformedNormal = i.N;
    vec3 transformedNormal = normalize( normal );
    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );
    
    #include light

    gl_FragColor = vec4( vColor.xyz, 1.0 );
    gl_FragColor.xyz *= vLightFront;
    //gl_FragColor = vec4( (transformedNormal+1.0)/2.0, 1.0 );

    // if( foo>89.0 && foo<91.0 )
    //     gl_FragColor = vec4( 0.0, 1.0, 1.0, 1.0 );
    if( length(ax_qa)>8.3 )
        gl_FragColor = vec4( 0.0, 1.0, 1.0, 1.0 );

    //gl_FragColor = vec4( theta/PI, 0.0, 0.0, 1.0 );

    // if( distance( i.P, pt_q )<0.5 ){
    //     gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
    // }
    // if( distance( i.P, pt_r )<0.5 ){
    //     gl_FragColor = vec4( 0.0, 1.0, 0.0, 1.0 );
    // }
    // if( distance( r, pt_r )<1.1 ){
    //     gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );
    // }
    // if( distance( r, pt_r )<1.1 ){
    //     gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );
    // }
    // if( distance( r, q )<distance( pt_r, pt_q ) ){
    //     gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );
    // }
    // if( distance( i.P, pt_c )<1.1 ){
    //     gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );
    // }
    // if( distance( i.P, pt_c + axisA )<0.3 || distance( i.P, pt_c - axisA )<0.3 ){
    //     gl_FragColor = vec4( 0.0, 1.0, 1.0, 1.0 );
    // }
    // if( distance( i.P, pt_c + axisB )<0.1 || distance( i.P, pt_c - axisB )<0.1 ){
    //     gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );
    // }
    // if( length(axisA)>length(axisB) )
    //     gl_FragColor = vec4( 0.0, 1.0, 1.0, 1.0 );

    // if( distance( i.P, f1 )<1.3 || distance( i.P, f2 )<1.3 ){
    //     gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );
    // }


    #include fog

    if( i.t<0.0 ){
        discard;
        gl_FragColor = vec4( vColor.xyz, 0.5 );
        gl_FragDepthEXT = gl_FragCoord.z;
    }
}


void main2(void)
{
    gl_FragColor = vColor;
}



