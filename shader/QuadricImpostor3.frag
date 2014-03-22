#extension GL_EXT_frag_depth : enable

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

uniform mat4 projectionMatrixInverse;
uniform mat4 projectionMatrixTranspose;
uniform mat4 modelViewMatrixInverse;

uniform vec2 viewport;




//---------------------------- Interpolated Inputs from Vertex Shader ------------------------------
//Midpoint of the impostor/sphere in view space.
varying vec3 mid_v;

//Radius of the sphere.
varying float rad;

//Color of the fragment.
varying vec4 col;


//Diagonal of the normalized diagonal form of the quadric.
varying vec4 diag_;
varying mat4 me;
varying vec4 mc_c2_;

varying float early_discard;  //1 for discard, 0 else

//-------------------------------------- Function Definition ---------------------------------------

//calculates the at most two intersections and the normal of the closer intersection
void calculateIntersection(out vec3 intersection, out vec3 intersection2, out vec3 normal)
{

    //View matrix to transform from world space to view space.
    mat4 view_matrix = viewMatrix;

    //View matrix to transform from view space to world space.
    mat4 view_matrix_inv = modelViewMatrixInverse;

    //Projection matrix to transform from view space to clip space.
    mat4 projection_matrix = projectionMatrix;

    //Projection matrix to transform from clip space to view space.
    mat4 projection_matrix_inv = projectionMatrixInverse;



    vec4 view_c, view_e, eqn;

    // inverse viewport transformation
    // (bug in original code, this here should be correct)
    view_c = vec4(2.0*gl_FragCoord.xy / viewport - 1.0, 0.0, 1.0);

    //view direction in eye space
    view_e = projection_matrix_inv * view_c;

    //view direction in parameter space
    view_c = me * view_e;

    //quadratic equation
    vec4 tmp = diag_ * view_c;
    eqn.y = dot(tmp, mc_c2_);
    eqn.z = dot(tmp, view_c);

    eqn.w = (eqn.y * eqn.y) - eqn.z;

    if(eqn.w < 0.0) {
        discard;
    }
    
    vec2 quadratic_solutions = vec2(- sqrt(eqn.w) - eqn.y, sqrt(eqn.w) - eqn.y);

    intersection  = view_e.xyz / (view_e.w + projection_matrix_inv[2].w * quadratic_solutions.x);
    intersection2 = view_e.xyz / (view_e.w + projection_matrix_inv[2].w * quadratic_solutions.y);

    // Material properties
    normal = normalize(intersection - mid_v);
}


void getPositionAndNormal(out vec4 position, out vec3 normal)
{

    //View matrix to transform from world space to view space.
    mat4 view_matrix = modelViewMatrix;

    //View matrix to transform from view space to world space.
    mat4 view_matrix_inv = modelViewMatrixInverse;

    //Projection matrix to transform from view space to clip space.
    mat4 projection_matrix = projectionMatrix;

    //Projection matrix to transform from clip space to view space.
    mat4 projection_matrix_inv = projectionMatrixInverse;

    // is the fragment clipable?
    int clipable = 1;


    //discard everythin which does not pass the early discard test
    // if(early_discard > 0.0) {
    //     discard;
    // }

    vec3 intersection;
    vec3 intersection2;

    
    calculateIntersection(intersection, intersection2, normal);

    vec4 n = view_matrix_inv * vec4(normal, 1);

    //transform intersection back to world coordiantes and appy clipping planes
    // if(clipable != 0) {
    //     vec4 p = view_matrix_inv * vec4(intersection, 1.0);
    //     vec4 p2 = view_matrix_inv * vec4(intersection2, 1.0);

    //     clip(p, p2, n);

    //     intersection = (view_matrix * p).xyz;
    //     normal = (view_matrix * n).xyz;
    // }

    vec4 proj_pos = projection_matrix * vec4(intersection, 1.0);
    float new_z = proj_pos.z / proj_pos.w;
    gl_FragDepthEXT = (gl_DepthRange.diff * new_z + gl_DepthRange.near + gl_DepthRange.far) / 2.0;

    // vec4 i = vec4(intersection, 1.0);
    // if (clipNearPlane(i, vec4(intersection2, 1), n)) {
    //     intersection = i.xyz;
    //     normal = n.xyz;
    // }

    position = vec4(intersection, 1.0);
}


void getFragDepth(out float depth)
{
    depth = gl_FragDepthEXT;
}


void main(void)
{
    
    vec4 position;
    vec3 normal;
    getPositionAndNormal( position, normal );

    gl_FragColor = col;
    //gl_FragColor = vec4( 2.0*(gl_FragCoord.xy / viewport) - 1.0, 0.0, 1.0 );
}

