
#extension GL_EXT_frag_depth : enable

uniform mat4 projectionMatrix;

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
varying vec3 axis;
varying vec3 base;
varying vec3 end;
varying vec3 U;
varying vec3 V;
varying vec3 x_dir;
varying vec3 y_dir;
varying float b;

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


// void main2(void)
// {
//     gl_FragColor = vec4( color, 1.0 );
// }



#define PI     3.14159265358979323846264338
#define TWOPI (2.0*PI)

// line: l(t) = u + t(v-u) .. 
// returns the coeff (t) of the point on l to which p is closest
float pt_line_proj_coeff(vec3 u,vec3 v,vec3 p)
{
    return dot(p-u,v-u)/dot(v-u,v-u);
}


// round caps
// http://sourceforge.net/p/pymol/code/HEAD/tree/trunk/pymol/data/shaders/cylinder.fs

// quadric intersect
// http://cse.csusb.edu/tong/courses/cs621/notes/intersect.php

void main()
{   

    float radius = cylinderRadius;
    vec3 end_cyl = end;
    vec3 surface_point = point;
    mat4 PMatrix = projectionMatrix;

    const float ortho=0.0;

    vec3 ray_target = surface_point;
    vec3 ray_origin = vec3(0.0);
    vec3 ray_direction = mix(normalize(ray_origin - ray_target), vec3(0.0, 0.0, 1.0), ortho);
    mat3 basis = mat3(U, V, axis);

    vec3 diff = ray_target - 0.5 * (base + end_cyl);
    vec3 P = diff * basis;

    // angle (cos) between cylinder cylinder_axis and ray direction
    float dz = dot(axis, ray_direction);

    float radius2 = radius*radius;

    // calculate distance to the cylinder from ray origin
    vec3 D = vec3(dot(U, ray_direction),
                dot(V, ray_direction),
                dz);
    float a0 = P.x*P.x + P.y*P.y - radius2;
    float a1 = P.x*D.x + P.y*D.y;
    float a2 = D.x*D.x + D.y*D.y;

    // calculate a dicriminant of the above quadratic equation
    float d_ = a1*a1 - a0*a2;

    if (d_ < 0.0)
        discard; // outside of the cylinder

    // float dist = (-a1 + sqrt(d_))/a2;

    // // point of intersection on cylinder surface
    // vec3 new_point = ray_target + dist * ray_direction;



    // vec3 axis_perp = vec3( 0.0, 0.0, 1.0/axis.z );
    // vec3 axis_perp2 = cross( axis, axis_perp );

    // // X == A + ((P-A).D)D

    // vec3 pointXaxis = base + dot( new_point-base, axis ) * axis;
    // vec3 pointXaxisDir = normalize( pointXaxis-new_point );
    // float cosang = dot( pointXaxisDir, axis );

    // float dist2 = (-a1 - sqrt(d_))/a2;
    // // point of intersection on cylinder surface back
    // vec3 new_point2 = ray_target + dist2 * ray_direction;

    // // bool front = mod( distance(new_point, base), 2.0 ) < 1.2 ;
    // // bool back = mod( distance(new_point2, base), 2.0 ) < 1.2;
    // // if( front && back )
    // //     discard;

    // // if( front )
    // //     new_point = new_point2;


    // vec3 tmp_point = new_point - base;
    // vec3 normal = normalize(tmp_point - axis * dot(tmp_point, axis));
    // // if( front )
    // //     normal *= -1.0;

    // ray_origin = mix(ray_origin, surface_point, ortho);

    vec3 q = base;
    vec3 r = end_cyl;
    vec3 qr = normalize(r-q);
    qr = normalize(cylinderAxis);
    if( distance( ray_origin, q ) > distance( ray_origin, r ) ){
        q = end_cyl;
        r = base;
    }

    qr = normalize(r-q);

    float pitch = 5.4;
    float width = 0.8;

    vec3 pnear, pfar;
    pnear = ray_target + ( (-a1 + sqrt(d_))/a2 ) * ray_direction;
    pfar = ray_target + ( (-a1 - sqrt(d_))/a2 ) * ray_direction;
    // if( b<0.0 ){
    //     pfar = ray_target + ( (-a1 + sqrt(d_))/a2 ) * ray_direction;
    //     pnear = ray_target + ( (-a1 - sqrt(d_))/a2 ) * ray_direction;
    // }
    

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

    if( t < 0.0 || t >= 1.0 || dot(dh,dc) < cos(w*TWOPI / pitch) )
        discard;
    vec3 normal = dc;

    if(isFar)
        normal *= -1.0;

    vec2 clipZW = c.z * PMatrix[2].zw + PMatrix[3].zw;
    float depth2 = 0.5 + 0.5 * clipZW.x / clipZW.y;

    // this is a workaround necessary for Mac
    // otherwise the modified fragment won't clip properly
    if (depth2 <= 0.0)
        discard;
    if (depth2 >= 1.0)
        discard;

    gl_FragDepthEXT = depth2;


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

    // TODO compare without sqrt
    if( distance( c, end_cyl) < distance( c, base ) ){
        if( b < 0.0 ){
            gl_FragColor = vec4( color2, 1.0 );
        }else{
            gl_FragColor = vec4( color, 1.0 );    
        }
    }else{
        if( b > 0.0 ){
            gl_FragColor = vec4( color2, 1.0 );
        }else{
            gl_FragColor = vec4( color, 1.0 );    
        }
    }
    gl_FragColor.xyz *= vLightFront;

    #include fog_fragment
}




