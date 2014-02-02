
#extension GL_EXT_frag_depth : enable

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

varying lowp vec3 mapping;
varying mat3 cameraToCylinder;
varying lowp vec3 color;
varying lowp vec3 color2;
varying highp vec3 cameraCylinderPos;
varying highp vec3 cylinderCenter;
varying highp vec3 cylinderAxis;
varying lowp float cylinderRadius;
varying lowp float cylinderHeight;

varying vec3 point;
varying vec3 x_dir;

varying vec3 p;
varying vec3 q;
varying vec3 r;
varying vec3 s;


const float pitch      = 5.4;
const float width      = 1.8;
const float add_radius = 0.0;

#include light_params

#include fog_params


void main2(void)
{
    gl_FragColor = vec4( color, 0.7 );
}

#define ENABLE_CAPS

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


void main()
{
    vec3 mc_pos = point;
    float radius = 2.0;//cylinderRadius; //length(x_dir)+add_radius;
    // vec3    e    = (viewMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;
    vec3 e = cameraPosition;
    vec3 edir    = mc_pos-e;

    vec3 pnear = vec3(0.0, 0.0, 0.0);
    vec3 pfar = vec3(0.0, 0.0, 0.0);

    if(ray_cylinder_ixn(q,r-q,radius,e,edir,pnear,pfar) == false)
        discard;

    vec3 pt    = pnear;
    vec3 qr    = normalize(r-q);
    // vec3 y_dir = cross(qr,x_dir);

    #ifdef ENABLE_CAPS
        vec3  p = q - qr;
    #endif  

    vec3 pqr    = (normalize(q-p) + qr)/2.0;
    vec3 qrs    = (qr + normalize(s-r))/2.0;
  
    #ifndef ENABLE_CAPS

        if(side_of_plane(pt,pqr,q-qr*plane_shift_eps) < 0.0 || 
            side_of_plane(pt,qrs,r+qr*plane_shift_eps) > 0.0 )
                discard;
    
        vec3 pt_q    = plane_line_ixn(pqr,q,qr,pt);
        vec3 pt_r    = plane_line_ixn(qrs,r,qr,pt);  
        float wt     = length(pt-pt_q)/length(pt_r-pt_q);  
        vec3  normal = (1.0-wt)*normalize(pt_q - q) + wt*normalize(pt_r-r);

    #else  

        vec3 normal = vec3( 0.0, 0.0, 0.0 );
  
        if(side_of_plane(pt,qrs,r+qr*plane_shift_eps) > 0.0 )
        {
            discard;
        }
        else if(side_of_plane(pt,pqr,q-qr*plane_shift_eps) < 0.0)     
        {
            if(abs(dot(edir,qr)) < 0.000000001)
                discard;     
     
            pt     = plane_line_ixn(qr,q,edir,e);
            normal = -qr;      
    
            if( length (pt - q) > radius)
                discard;
        }
        else
        {        
            vec3 pt_q   = plane_line_ixn(pqr,q,qr,pt);
            vec3 pt_r   = plane_line_ixn(qrs,r,qr,pt);  
            float wt    = length(pt-pt_q)/length(pt_r-pt_q);  
            normal      = (1.0-wt)*normalize(pt_q - q) + wt*normalize(pt_r-r);
        }  
    #endif   

    normal = normalize(normalMatrix*normal);

    vec3 wc_pt = (modelViewMatrix*vec4(pt,1.0)).xyz;
    vec4 dc_pt = projectionMatrix*vec4(wc_pt,1); 
    gl_FragDepthEXT = (dc_pt.z/dc_pt.w +1.0)/2.0;

    vec3 transformedNormal = normal;
    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );
    
    #include light

    gl_FragColor = vec4( color, 1.0 );
    gl_FragColor.xyz *= vLightFront;

    #include fog
}



// round caps
// http://sourceforge.net/p/pymol/code/HEAD/tree/trunk/pymol/data/shaders/cylinder.fs

// quadric intersect
// http://cse.csusb.edu/tong/courses/cs621/notes/intersect.php






