
#extension GL_EXT_frag_depth : enable

uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying lowp vec3 color;
varying lowp vec3 color2;
varying lowp float cylinderRadius;

varying vec3 point;
varying vec3 axis;
varying vec3 base;
varying vec3 end;
varying vec3 U;
varying vec3 V;
varying float b;

varying vec3 p;
varying vec3 q;
varying vec3 r;
varying vec3 s;

#include light_params

#include fog_params


// void main2(void)
// {
//     gl_FragColor = vec4( color, 1.0 );
// }




// round caps
// http://sourceforge.net/p/pymol/code/HEAD/tree/trunk/pymol/data/shaders/cylinder.fs

// quadric intersect
// http://cse.csusb.edu/tong/courses/cs621/notes/intersect.php



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
    float d = a1*a1 - a0*a2;
    if (d < 0.0)
        // outside of the cylinder
        discard;

    float dist = (-a1 + sqrt(d))/a2;

    // point of intersection on cylinder surface
    vec3 new_point = ray_target + dist * ray_direction;



    // vec3 axis_perp = vec3( 0.0, 0.0, 1.0/axis.z );
    // vec3 axis_perp2 = cross( axis, axis_perp );

    // X == A + ((P-A).D)D

    // vec3 pointXaxis = base + dot( new_point-base, axis ) * axis;
    // vec3 pointXaxisDir = normalize( pointXaxis-new_point );
    // float cosang = dot( pointXaxisDir, axis );

    // #define foobar
    #ifdef foobar
        float dist2 = (-a1 - sqrt(d))/a2;
        // point of intersection on cylinder surface back
        vec3 new_point2 = ray_target + dist2 * ray_direction;

        float foo = cylinderHeight/7.0;

        // TODO base is in the center and new_point on the surface...
        bool front = mod( distance(new_point, base)/foo, 2.0 ) <= 0.01;
        bool back = mod( distance(new_point2, base)/foo, 2.0 ) <= 0.01;
        if( front && back )
            discard;

        if( front )
            new_point = new_point2;
    #endif


    vec3 tmp_point = new_point - base;
    vec3 normal = normalize(tmp_point - axis * dot(tmp_point, axis));
    #ifdef foobar
        if( front )
            normal *= -1.0;
    #endif

    ray_origin = mix(ray_origin, surface_point, ortho);

    bool test = false;
    // test front cap
    float cap_test = dot((new_point - base), axis);

    // to calculate caps, simply check the angle between
    // the point of intersection - cylinder end vector
    // and a cap plane normal (which is the cylinder cylinder_axis)
    // if the angle < 0, the point is outside of cylinder
    // test front cap

    // flat
    if (cap_test < 0.0) 
    {
        // ray-plane intersection
        float dNV = dot(-axis, ray_direction);
        if (dNV < 0.0) 
            discard;
        float near = dot(-axis, (base)) / dNV;
        new_point = ray_direction * near + ray_origin;
        // within the cap radius?
        if (dot(new_point - base, new_point-base) > radius2) 
            discard;
        normal = -axis;
        test = true;
    }

    // test end cap
    cap_test = dot((new_point - end_cyl), axis);

    // flat
    if (cap_test > 0.0) 
    {
        // ray-plane intersection
        float dNV = dot(axis, ray_direction);
        if (dNV < 0.0) 
            discard;
        float near = dot(axis, end_cyl) / dNV;
        new_point = ray_direction * near + ray_origin;
        // within the cap radius?
        if (dot(new_point - end_cyl, new_point-base) > radius2) 
            discard;
        normal = axis;
        test = true;
    }

    vec2 clipZW = new_point.z * PMatrix[2].zw + PMatrix[3].zw;
    float depth2 = 0.5 + 0.5 * clipZW.x / clipZW.y;

    // this is a workaround necessary for Mac
    // otherwise the modified fragment won't clip properly
    if (depth2 <= 0.0)
        discard;
    if (depth2 >= 1.0)
        discard;

    gl_FragDepthEXT = depth2;


    if(!test || true){
        vec3 pt    = new_point;
        vec3 qr    = normalize(r-q);
        vec3 pqr    = (normalize(q-p) + qr)/2.0;
        vec3 qrs    = (qr + normalize(s-r))/2.0;

        if(side_of_plane(pt,pqr,q-qr*plane_shift_eps) < 0.0 || 
            side_of_plane(pt,qrs,r+qr*plane_shift_eps) > 0.0 )
                discard;

        vec3 pt_q    = plane_line_ixn(pqr,q,qr,pt);
        vec3 pt_r    = plane_line_ixn(qrs,r,qr,pt);  
        float wt     = length(pt-pt_q)/length(pt_r-pt_q);  
        normal = (1.0-wt)*normalize(pt_q - q) + wt*normalize(pt_r-r);
    }


    vec3 transformedNormal = normal;
    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );
    
    #include light

    // TODO compare without sqrt
    if( distance( new_point, end_cyl) < distance( new_point, base ) ){
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
    //gl_FragColor.w = 0.5;
    //gl_FragColor.xyz = transformedNormal;
    //gl_FragColor.xyz = point;

    //gl_FragColor = vec4( normalize(ray_origin - ray_target), 1.0 );

    #include fog
}




