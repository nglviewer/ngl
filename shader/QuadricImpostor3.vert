
attribute vec2 inputMapping;
attribute vec3 inputColor;
attribute float inputSphereRadius;

uniform mat4 modelViewMatrixInverse;
uniform mat4 modelViewMatrixInverseTranspose;
uniform mat4 projectionMatrixInverse;
uniform mat4 projectionMatrixTranspose;

mat4 transpose( in mat4 inMatrix ) {
    vec4 i0 = inMatrix[0];
    vec4 i1 = inMatrix[1];
    vec4 i2 = inMatrix[2];
    vec4 i3 = inMatrix[3];

    mat4 outMatrix = mat4(
        vec4(i0.x, i1.x, i2.x, i3.x),
        vec4(i0.y, i1.y, i2.y, i3.y),
        vec4(i0.z, i1.z, i2.z, i3.z),
        vec4(i0.w, i1.w, i2.w, i3.w)
    );
    return outMatrix;
}


uniform vec2 viewport;


//--------------------------------------------- Outputs --------------------------------------------
//Midpoint of the impostor in view space.
varying vec3 mid_v;

//Color of the impostor.
varying vec4 col;

//Radius of the impostor.
varying float rad;

//Diagonal of the normalized diagonal form of the quadric.
varying vec4 diag_;

varying mat4 me;
varying vec4 mc_c2_;

varying float early_discard; //1 for discard, 0 else

const vec4 diag = vec4(1.0, 1.0, 1.0, -1.0);

//-------------------------------------- Function Definition ---------------------------------------
//homogeneous dot product
float dph(vec3 a,vec4 b)
{
    return dot(a.xyz,b.xyz) + b.w;
}

float test_early_discard(vec3 midpoint, float radius){ return 0.0; }

//------------------------------------------ Main Program ------------------------------------------
void main()
{

    //View matrix to transform from world space to view space.
    mat4 view_matrix = viewMatrix;

    //View matrix to transform from view space to world space.
    mat4 view_matrix_inv = modelViewMatrixInverse;

    //Projection matrix to transform from view space to clip space.
    mat4 projection_matrix = projectionMatrix;

    //Projection matrix to transform from clip space to view space.
    mat4 projection_matrix_inv = projectionMatrixInverse;

    //Transpose of the view projection matrix.
    mat4 view_proj_matrix_transp = transpose( projectionMatrix * viewMatrix );

    // is the fragment clipable?
    int clipable = 1;

    //Midpoint of the impostor/sphere in world space.
    vec3 midpoint = position;

    //Color of the impostor.
    vec4 color = vec4( inputColor, 1.0 );

    //Radius of the sphere.
    float radius = inputSphereRadius;




    //check if we can discard fragments which are beyond a clipping plane
    early_discard = 0.0;//test_early_discard(midpoint, radius);

    if(clipable != 0 && early_discard == 1.0) {
        gl_PointSize = 0.0;
        
    } else {
        early_discard = 0.0;
        
        mid_v = vec3(view_matrix * vec4(midpoint, 1.0));
        col = color;
        rad = radius;

        //mat4 mvp = transpose(projection_matrix * view_matrix);
        mat4 mvp = view_proj_matrix_transp;

        vec2 center_pos; // center position of the sphere

        vec2 border_pos; // vertical and horizontal border positions

        vec2 box_size; // x = width, y = height

        //screen planes in parameter space
        mat4 tc = mvp * radius;
        tc[0][3] = dph(midpoint, mvp[0]);
        tc[1][3] = dph(midpoint, mvp[1]);
        tc[3][3] = dph(midpoint, mvp[3]);

        //solve two quadratic equations (x,y)
        //solutions are center positions in clip coordinates
        center_pos.x = dot(diag * tc[3],tc[0]);
        border_pos.x = dot(diag * tc[0],tc[0]);

        //solutions are border positions
        center_pos.y = dot(diag * tc[3],tc[1]);
        border_pos.y = dot(diag * tc[1],tc[1]);

        float w =  1.0 / dot(diag * tc[3],tc[3]);

        border_pos = border_pos * w;
        center_pos = center_pos * w;

        //radius in window coordinates
        border_pos = sqrt((center_pos * center_pos) - border_pos);

        //transformed vertex position
        // z-coordinate will be overwitten in fragment shader
        gl_Position = vec4(center_pos, 0.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( midpoint, 1.0 );

        //pointsize
        box_size.xy = border_pos * viewport ;

        //set half of the larger value (width, height) to point size radius
        gl_PointSize = max(box_size.x, box_size.y);
        gl_PointSize = 20.0 * 1.5 * inputSphereRadius * length( ( modelViewMatrix * vec4( midpoint, 1.0 ) ).xyz );
        //output T_e^(-1)
        me = view_matrix_inv / radius;

        //output delta_p
        me[3] = vec4((view_matrix_inv[3].xyz - midpoint) / radius, 1.0);

        mc_c2_ = me[3] * projection_matrix_inv[2].w;

        //output diag/a
        diag_ = diag / dot(diag * mc_c2_, mc_c2_);
    }
}


