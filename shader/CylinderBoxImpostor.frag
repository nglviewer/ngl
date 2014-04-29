
#extension GL_EXT_frag_depth : enable

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrixInverse;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;


varying vec3 vColor;
varying vec3 vColor2;
varying float vRadius;
varying vec3 point;

varying vec3 q;
varying vec3 r;


#include light_params

#include fog_params



// #define ENABLE_CAPS

#define PI     3.14159265358979323846264338
#define TWOPI (2.0*PI)



bool ray_cylinder_ixn(vec3 c, vec3 cdir, float R, vec3 l, vec3 ldir, 
                      inout vec3 pnear, inout vec3 pfar)
{

    // solve this quadratic eqn for t
    // 
    // ||                 ldir.cdir                         (l-c).cdir     ||2     2
    // || [ ldir - cdir ---------------- ] t +  l-c - cdir --------------- ||  = r
    // ||                 cdir.cdir                         cdir.cdir      ||


    vec3 u = ldir  - cdir*dot(ldir ,cdir)/dot(cdir,cdir);
    vec3 v = (l-c) - cdir*dot((l-c),cdir)/dot(cdir,cdir); 


    float _a = dot(u,u);
    float _b = 2.0*dot(u,v);
    float _c = dot(v,v) - R*R;

    float _d = _b*_b - 4.0*_a*_c;

    if (_d <0.0 ) 
        return false;

    _d =sqrt(_d);

    float tnear = (-_b - _d)/(2.0*_a);
    float tfar  = (-_b + _d)/(2.0*_a);

    pnear = l + tnear*ldir;
    pfar  = l + tfar*ldir;

    return true;
}


float side_of_plane(vec3 pt,vec3 n,vec3 ppt)
{
  return dot(n,pt) - dot(n,ppt);
}


// line: l(t) = u + t(v-u) .. 
// returns the coeff (t) of the point on l to which p is closest
float pt_line_proj_coeff(vec3 u,vec3 v,vec3 p)
{
    return dot(p-u,v-u)/dot(v-u,v-u);
}


vec3 closest_line_pt(vec3 l,vec3 ldir,vec3 p)
{
  return l+ldir*dot(p-l,ldir)/dot(ldir,ldir);
}


vec3 plane_line_ixn(vec3 pn, vec3 pp, vec3 ldir, vec3 l)
{
  return l + ldir*dot(pp-l,pn)/dot(ldir,pn);
}


const float plane_shift_eps = 0.0001;


void main2(void)
{
    gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}


void main()
{

    vec3 mc_pos = point;

    vec3    e    = (modelViewMatrixInverse*vec4(0,0,0,1)).xyz;
    vec3 edir    = normalize(mc_pos-e);

    vec3 pnear   =vec3(0,0,0),pfar=vec3(0,0,0);

    if(ray_cylinder_ixn(q,r-q,vRadius,e,edir,pnear,pfar) == false)
        discard;

    vec3 qr    =  normalize(r-q);

    vec3 pt       = pnear;
    float t       = pt_line_proj_coeff(q,r,pt);  
    vec3 apt      = q + t*(r-q);
    vec3 normal   = normalize(pt - apt);

    #ifndef NEED_INNER_HIT
        #ifndef NEED_CAP
        if( t <0.0 || t >= 1.0 )
            discard;
        #endif
    #endif

    #ifdef NEED_INNER_HIT
        if( t <0.0 || t >= 1.0 )
        {
            pt       = pfar;    
            t        = pt_line_proj_coeff(q,r,pt);
            apt      = q + t*(r-q);
            normal   = normalize(apt - pt);
        }

        if( t <0.0 || t >= 1.0 )
            discard;
    #endif

    #ifdef NEED_CAP
        if( t <0.0 || t >= 1.0 )
        {
            float u  = pt_line_proj_coeff(q,r,pfar);

            if( u <0.0 || u >= 1.0 || dot(edir,qr) < 0.0000001)
                discard; 
              
            vec3 cap_ctr = r;
            normal       = qr;
              
            if( t < 0) 
            {
                cap_ctr = q;
                normal  = -qr;
            }

            pt = plane_line_ixn(qr,cap_ctr,edir,e);    
        }
    #endif


    vec3 wc_pt = ( modelViewMatrix * vec4( pt, 1.0 ) ).xyz;
    vec4 dc_pt = projectionMatrix * vec4( wc_pt, 1.0 ); 
    gl_FragDepthEXT = ( dc_pt.z / dc_pt.w + 1.0 ) / 2.0;

    vec3 transformedNormal = normalize( normalMatrix * normal );
    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );
    
    #include light

    gl_FragColor = vec4( vColor, 1.0 );
    gl_FragColor.xyz *= vLightFront;

    #include fog
}



// round caps
// http://sourceforge.net/p/pymol/code/HEAD/tree/trunk/pymol/data/shaders/cylinder.fs

// quadric intersect
// http://cse.csusb.edu/tong/courses/cs621/notes/intersect.php






