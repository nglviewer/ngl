
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

varying vec3 q;
varying vec3 r;


const float pitch      = 5.4;
const float width      = 1.8;
const float add_radius = 0.0;

uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 emissive;

uniform vec3 ambientLightColor;

#if MAX_DIR_LIGHTS > 0
    uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
    uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];
#endif

#if MAX_HEMI_LIGHTS > 0
    uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
    uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
    uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];
#endif

#include fog_pars_fragment


void main2(void)
{
    gl_FragColor = vec4( color, 0.7 );
}



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


// line: l(t) = u + t(v-u) .. 
// returns the coeff (t) of the point on l to which p is closest
float pt_line_proj_coeff(vec3 u,vec3 v,vec3 p)
{
    return dot(p-u,v-u)/dot(v-u,v-u);
}


void main()
{
    vec3 mc_pos = point;
    float radius = cylinderRadius; //length(x_dir)+add_radius;
    // vec3    e    = (viewMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;
    vec3 e = cameraPosition;
    vec3 edir    = mc_pos-e;

    vec3 pnear = vec3(0.0, 0.0, 0.0);
    vec3 pfar = vec3(0.0, 0.0, 0.0);

    if(ray_cylinder_ixn(q,r-q,radius,e,edir,pnear,pfar) == false)
        discard;

    vec3 qr    =  normalize(r-q);
    vec3 y_dir =  cross(qr,x_dir);

    vec3  c       = pnear; 
    bool  isFar   = false;
    float t       = pt_line_proj_coeff(q,r,c);  
    vec3  d       = q + t*(r-q);
    vec3  dc      = normalize(c - d);
    float theta   = TWOPI*length(d-q)/pitch;
    vec3  dh      = (x_dir*cos(theta) + y_dir*sin(theta))/radius;  
    float w       = min(width,length(r-d));    
    if(dot(cross(dc,dh),qr) > 0.0)
        w            = min(width,length(q-d));


    if( t <0.0 || t >= 1.0 || dot(dh,dc)  < cos(w*TWOPI / pitch))
    {
        c        = pfar;    
        isFar    = true;
        t        = pt_line_proj_coeff(q,r,c);
        d        = q + t*(r-q);
        dc       = normalize(c - d);
        theta    = TWOPI*length(d-q)/pitch;
        dh       = (x_dir*cos(theta) + y_dir*sin(theta))/radius;
        w        = min(width,length(r-d));    
        if(dot(cross(dc,dh),qr) > 0.0)
            w      = min(width,length(q-d));

    }

    if( t <0.0 || t >= 1.0 || dot(dh,dc)  < cos(w*TWOPI / pitch))
        discard;

    vec3 normal = dc;

    if(isFar)
        normal *=-1.0;

    normal        = normalize(normalMatrix*normal);

    vec3 wc_pt     = (modelViewMatrix*vec4(c,1.0)).xyz;
    vec4  dc_pt     = projectionMatrix*vec4(wc_pt,1); 
    gl_FragDepthEXT    = (dc_pt.z/dc_pt.w +1.0)/2.0;

    vec3 transformedNormal = normal;
    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );
    //vec3 vLightFront = color;
    #if MAX_DIR_LIGHTS > 0
        for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {
            vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );
            vec3 dirVector = normalize( lDirection.xyz );
            float dotProduct = dot( transformedNormal, dirVector );
            vec3 directionalLightWeighting = vec3( max( dotProduct, 0.0 ) );
            vLightFront += directionalLightColor[ i ] * directionalLightWeighting;
        }
    #endif
    #if MAX_HEMI_LIGHTS > 0
        for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {
            vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );
            vec3 lVector = normalize( lDirection.xyz );
            float dotProduct = dot( transformedNormal, lVector );
            float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;
            float hemiDiffuseWeightBack = -0.5 * dotProduct + 0.5;
            vLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );
        }
    #endif
    // vLightFront = vLightFront * diffuse + ambient * ambientLightColor + emissive;
    vLightFront = vLightFront + ambient * ambientLightColor + emissive;
    gl_FragColor = vec4( color, 1.0 );
    gl_FragColor.xyz *= vLightFront;

    
}



// round caps
// http://sourceforge.net/p/pymol/code/HEAD/tree/trunk/pymol/data/shaders/cylinder.fs

// quadric intersect
// http://cse.csusb.edu/tong/courses/cs621/notes/intersect.php






