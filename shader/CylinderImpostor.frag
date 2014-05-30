
#extension GL_EXT_frag_depth : enable

uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec3 vColor;
varying vec3 vColor2;
varying float vRadius;  

varying vec3 point;
varying vec3 axis;
varying vec3 base;
varying vec3 end;
varying vec3 U;
varying vec3 V;
varying float b;

const float opacity = 0.5;

#include light_params

#include fog_params


// round caps
// http://sourceforge.net/p/pymol/code/HEAD/tree/trunk/pymol/data/shaders/cylinder.fs


void main2(void)
{
    gl_FragColor = vec4( vColor, 1.0 );
}


void main()
{   

    vec3 end_cyl = end;
    vec3 surface_point = point;

    const float ortho=0.0;

    vec3 ray_target = surface_point;
    vec3 ray_origin = vec3(0.0);
    vec3 ray_direction = mix(normalize(ray_origin - ray_target), vec3(0.0, 0.0, 1.0), ortho);
    mat3 basis = mat3( U, V, axis );

    vec3 diff = ray_target - 0.5 * (base + end_cyl);
    vec3 P = diff * basis;

    // angle (cos) between cylinder cylinder_axis and ray direction
    float dz = dot( axis, ray_direction );

    float radius2 = vRadius*vRadius;

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

    float dist = (-a1 + sqrt(d)) / a2;

    // point of intersection on cylinder surface
    vec3 new_point = ray_target + dist * ray_direction;

    vec3 tmp_point = new_point - base;
    vec3 normal = normalize( tmp_point - axis * dot(tmp_point, axis) );

    ray_origin = mix( ray_origin, surface_point, ortho );

    // test front cap
    float cap_test = dot( new_point - base, axis );

    // to calculate caps, simply check the angle between
    // the point of intersection - cylinder end vector
    // and a cap plane normal (which is the cylinder cylinder_axis)
    // if the angle < 0, the point is outside of cylinder
    // test front cap

    #ifndef CAP
        vec3 new_point2 = ray_target + ( (-a1 - sqrt(d)) / a2 ) * ray_direction;
        vec3 tmp_point2 = new_point2 - base;
    #endif

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

        #ifdef CAP
            normal = axis;
        #else
            normal = -normalize( tmp_point2 - axis * dot(tmp_point2, axis) );
        #endif
    }

    // test end cap
    cap_test = dot((new_point - end_cyl), axis);

    // flat
    if( cap_test > 0.0 ) 
    {
        // ray-plane intersection
        float dNV = dot(axis, ray_direction);
        if (dNV < 0.0) 
            discard;
        float near = dot(axis, end_cyl) / dNV;
        new_point = ray_direction * near + ray_origin;
        // within the cap radius?
        if( dot(new_point - end_cyl, new_point-base) > radius2 ) 
            discard;
        
        #ifdef CAP
            normal = axis;
        #else
            normal = -normalize( tmp_point2 - axis * dot(tmp_point2, axis) );
        #endif
    }

    vec2 clipZW = new_point.z * projectionMatrix[2].zw + projectionMatrix[3].zw;
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
    
    #include light

    // TODO compare without sqrt
    if( distance( new_point, end_cyl) < distance( new_point, base ) ){
        if( b < 0.0 ){
            gl_FragColor = vec4( vColor, opacity );
        }else{
            gl_FragColor = vec4( vColor2, opacity );    
        }
    }else{
        if( b > 0.0 ){
            gl_FragColor = vec4( vColor, opacity );
        }else{
            gl_FragColor = vec4( vColor2, opacity );    
        }
    }
    gl_FragColor.xyz *= vLightFront;
    //gl_FragColor.xyz = transformedNormal;

    #include fog
}








