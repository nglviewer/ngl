
#extension GL_EXT_frag_depth : enable

varying vec2 mapping;

varying vec4 i_near;
varying vec4 i_far;
varying vec4 sphereposition;
varying vec4 vColor;
varying float radius;

uniform mat4 modelViewProjectionMatrix;
uniform mat4 modelViewMatrixInverseTranspose;


struct Ray{
    vec3 origin;
    vec3 direction;
};

vec3 isect_surf(Ray r, mat4 matrix_coef){
    vec4 direction = vec4(r.direction, 0.0);
    vec4 origin = vec4(r.origin, 1.0);
    float a = dot( direction, (matrix_coef*direction) );
    float b = dot( origin, (matrix_coef*direction) );
    float c = dot( origin, (matrix_coef*origin) );
    float delta = b * b - a * c;
    gl_FragColor.a = 1.0;
    if (delta<0.0){
        discard;
        gl_FragColor.a = 0.5;
    }
    float t1 = ( -b - sqrt( delta ) ) / a;

    // Second solution not necessary if you don't want
    // to see inside spheres and cylinders, save some fps
    //float t2 = (-b+sqrt(delta)) / a  ;
    //float t =(t1<t2) ? t1 : t2;

    return r.origin+t1*r.direction;
}

Ray primary_ray(vec4 near1, vec4 far1){
    vec3 near=near1.xyz/near1.w;
    vec3 far=far1.xyz/far1.w;
    return Ray(near,far-near);
}

float update_z_buffer(vec3 M, mat4 ModelViewP){
    float  depth1;
    vec4 Ms=(ModelViewP*vec4(M,1.0));
    return depth1=(1.0+Ms.z/Ms.w)/2.0;
}

vec4 lit(float NdotL, float NdotH, float m) {
    float ambient = 1.0;
    float diffuse = max(NdotL, 0.0);
    float specular = pow(NdotH,m);
    if(NdotL < 0.0 || NdotH < 0.0)
        specular = 0.0;
    return vec4(ambient, diffuse, specular, 1.0);
}


void main()
{
    // Create matrix for the quadric equation of the sphere
    vec4 colonne1, colonne2, colonne3, colonne4;
    mat4 mat;
    vec4 equation = vec4( 1.0, 1.0, 1.0, radius * radius );

    colonne1 = vec4( equation.x, 0.0, 0.0, -equation.x * sphereposition.x );
    colonne2 = vec4( 0.0, equation.y, 0.0, -equation.y * sphereposition.y );
    colonne3 = vec4( 0.0, 0.0, equation.z, -equation.z * sphereposition.z );
    colonne4 = vec4(
        -equation.x * sphereposition.x,
        -equation.y * sphereposition.y,
        -equation.z * sphereposition.z,
        -equation.w + 
            equation.x * sphereposition.x*sphereposition.x +
            equation.y * sphereposition.y*sphereposition.y +
            equation.z * sphereposition.z*sphereposition.z 
    );

    mat = mat4(colonne1,colonne2,colonne3,colonne4);

    // Ray calculation using near and far
    Ray ray = primary_ray(i_near,i_far) ;

    // Intersection between ray and surface for each pixel
    vec3 M;
    M = isect_surf(ray, mat);

    // Recalculate the depth in function of the new pixel position
    gl_FragDepthEXT = update_z_buffer( M, modelViewProjectionMatrix ) ;


    // Transform normal to model space to view-space
    vec4 M1 = vec4(M,1.0);
    vec4 M2 =  (mat*M1);
    vec3 normal = normalize( ( modelViewMatrixInverseTranspose * M2 ).xyz );

    // Give light vector position perpendicular to the screen
    vec3 lightvec = normalize(vec3(0.0,0.0,1.2));
    vec3 eyepos = vec3(0.0,0.0,1.0);

    // calculate half-angle vector
    vec3 halfvec = normalize(lightvec + eyepos);

    // Parameters used to calculate per pixel lighting
    // see http://http.developer.nvidia.com/CgTutorial/cg_tutorial_chapter05.html

    float shininess = 0.5;
    float diffuse = dot(normal,lightvec);
    float specular = dot(halfvec, normal);
    vec4 lighting = lit(diffuse, specular, 256.0) ;

    vec3 diffusecolor = vColor.xyz;
    vec3 specularcolor = vec3(1.0,1.0,1.0);

    // Give color parameters to the Graphic card
    gl_FragColor.rgb = lighting.y * diffusecolor + lighting.z * specularcolor;
    //gl_FragColor.a = 1.0;

    // gl_FragColor.rgb = vec3( 1.0, 0.0, 0.0 );
    // gl_FragColor.rgb = normalize( ray.direction - ray.origin );

    // ############## Fog effect #####################################################
    // To use fog comment the two previous lines: ie  gl_FragColor.rgb = É and   gl_FragColor.a = 1.0;
    // and uncomment the next lines.
    // Color of the fog: white
    //float fogDistance  = update_z_buffer(M, gl_ModelViewMatrix) ;
    //float fogExponent  = fogDistance * fogDistance * 0.007;
    //vec3 fogColor   = vec3(1.0, 1.0, 1.0);
    //float fogFactor   = exp2(-abs(fogExponent));
    //fogFactor = clamp(fogFactor, 0.0, 1.0);

    //vec3 final_color = lighting.y * diffusecolor + lighting.z * specularcolor;
    //gl_FragColor.rgb = mix(fogColor,final_color,fogFactor);
    //gl_FragColor.a = 1.0;
    // ##################################################################################
}


void main2(void)
{
    gl_FragColor = vColor;
}



