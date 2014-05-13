/*
 * ANSI C code from the article
 * "Intersecting a Ray with a Cylinder"
 * by Joseph M. Cychosz and Warren N. Waggenspack, Jr.,
 * (3ksnn64@ecn.purdue.edu, mewagg@mewnw.dnet.lsu.edu)
 * in "Graphics Gems IV", Academic Press, 1994
 */
#include        "GraphicsGems.h"
#include        <math.h>
/* ---- intcyl - Intersect a ray with a cylinder. --------------------- */
/* /*
/*      Description:                                                    */
/*          Intcyl determines the intersection of a ray with a          */
/*          cylinder.                                                   */
/*
/*      On entry:                                                       */
/*          raybase = The base point of the intersecting ray.           */
/*          raycos  = The direction cosines of the above ray. (unit)    */
/*          base    = The base location of the cylinder.                */
/*          axis    = The axis of symmetry for the cylinder.  (unit)    */
/*          radius  = The radius of the cylinder.                       */
/*
/* On return:
/* in
/* out /*
/*      Returns:  True if the ray intersects the cylinder.              */
                                                    */
= The entering distance of the intersection.        */
= The leaving  distance of the intersection.        */
                                                    */
/*
/*      Note:
/*
/*
/* -------------------------------------------------------------------- */
        Point3          *raybase;
        Vector3         *raycos;
        Point3          *base;
        Vector3         *axis;
        double          radius;
        double          *in;
        double          *out;
        boolean         hit;
        Vector3         RC;
        double          d;
        double          t, s;
        Vector3         n, D, O;
        double          ln;
const   double
        RC.x = raybase->x - base->x;
/* Base of the intersection ray */
/* Direction cosines of the ray */
/* Base of the cylinder         */
/* Axis of the cylinder         */
/* Radius of the cylinder       */
/* Entering distance            */
/* Leaving distance             */
/* True if ray intersects cyl   */
/* Ray base to cylinder base    */
/* Shortest distance between    */
/*   the ray and the cylinder   */
/* Distances along the ray      */
/* Positive infinity            */
{
                                                      */
In and/or out may be negative indicating the          */
cylinder is located behind the origin of the ray.     */
                                                      */
#define HUGE            1.0e21          /* Huge value                   */
boolean intcyl  (raybase,raycos,base,axis,radius,in,out)
pinf = HUGE;
http://www.acm.org/pubs/tog/GraphicsGems/gemsiv/ray_cyl.c (1 of 4) [2/21/2001 9:38:54 AM]
*/ */
*/
*/
http://www.acm.org/pubs/tog/GraphicsGems/gemsiv/ray_cyl.c
        RC.y = raybase->y - base->y;
        RC.z = raybase->z - base->z;
        V3Cross (raycos,axis,&n);
        if  ( (ln = V3Length (&n)) == 0. ) {
            d    = V3Dot (&RC,axis);
            D.x  = RC.x - d*axis->x;
            D.y  = RC.y - d*axis->y;
            D.z  = RC.z - d*axis->z;
            d    = V3Length (&D);
            *in  = -pinf;
            *out =  pinf;
            return (d <= radius);
        V3Normalize (&n);
        d    = fabs (V3Dot (&RC,&n));
        hit  = (d <= radius);
        if  (hit) {
            V3Cross (&RC,axis,&O);
            t = - V3Dot (&O,&n) / ln;
            V3Cross (&n,axis,&O);
            V3Normalize (&O);
            s = fabs (sqrt(radius*radius - d*d) / V3Dot (raycos,&O));
            *in  = t - s;                       /* entering distance    */
            *out = t + s;                       /* exiting  distance    */
        }
        return (hit);
}