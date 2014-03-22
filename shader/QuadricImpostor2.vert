
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

varying vec4 me_c0_;
varying vec4 me_c1_;
varying vec4 me_c2_;
varying vec4 me_c3_;
varying vec4 mc_c2_;
varying vec4 diag_ ;

const vec4 konst   = vec4(0.0, 0.5, 1.0, 2.0);
const vec4 diag    = vec4(1.0, 1.0, 1.0, -1.0);

float dph( in vec4 a, in vec4 b)
{
    return dot( a.xyz, b.xyz ) + b.w;
}

void main()
{

    vec4 position4 = vec4( position, 1.0 );
    mat4 modelViewProjectionMatrixTranspose = transpose( projectionMatrix * modelViewMatrix );

    float _rad      = inputSphereRadius;
    
    //rows of model view matrix
    vec4 mvp_r0     = modelViewProjectionMatrixTranspose[0];
    vec4 mvp_r1     = modelViewProjectionMatrixTranspose[1];
    vec4 mvp_r3     = modelViewProjectionMatrixTranspose[3];
    mat4 mv_inv     = modelViewMatrixInverse;
    vec4 p_inv_c2   = projectionMatrixInverse[2];
    // vec4 viewport2   = vec4( viewport, 0.0016667, 0.002499 );
    vec4 viewport2   = vec4( viewport, 0.0, 0.0 );
    
    vec4 tc_c0, d_tc_c0;
    vec4 tc_c1, d_tc_c1;
    vec4 tc_c3, d_tc_c3;
    vec4 eqn;
    
    //screen planes in parameter space
    tc_c0.xyz = mvp_r0.xyz * _rad;
    tc_c0.w = dph(position4,mvp_r0);
    
    tc_c1.xyz = mvp_r1.xyz * _rad;
    tc_c1.w = dph(position4,mvp_r1);
    
    tc_c3.xyz = mvp_r3.xyz * _rad;
    tc_c3.w = dph(position4,mvp_r3);
    
    //multiply by sign (spheres: {1,1,1,-1})
    d_tc_c0 = diag * tc_c0;
    d_tc_c1 = diag * tc_c1;
    d_tc_c3 = diag * tc_c3;
    
    //solve two quadratic equations (x,y)
    eqn.x = dot(d_tc_c3,tc_c0);
    eqn.z = dot(d_tc_c0,tc_c0);
    
    eqn.y = dot(d_tc_c3,tc_c1);
    eqn.w = dot(d_tc_c1,tc_c1);
    
    tc_c0.w = dot(d_tc_c3,tc_c3);
    tc_c0.w = 1.0 / tc_c0.w;
    eqn = eqn * tc_c0.w;
    
    //transformed vertex position
    gl_Position.xy = eqn.xy;
    gl_Position.zw = konst.xz;
    
    //radius
    tc_c1.xy = ((eqn * eqn) - eqn.zwxy).xy;
    tc_c0.x = 1.0 / sqrt(tc_c1.x);
    tc_c0.y = 1.0 / sqrt(tc_c1.y);
    tc_c1.xy = (tc_c1 * tc_c0).xy;
    
    //pointsize
    tc_c1.xy = (tc_c1 * viewport2).xy;
    tc_c1.xy = (tc_c1 * konst.w).xy;
    gl_PointSize = max(tc_c1.x,tc_c1.y);
    
    tc_c1.w = 1.0 / _rad;
    
    //output T_e^(-1)
    me_c0_ = mv_inv[0] * tc_c1.w;
    me_c1_ = mv_inv[1] * tc_c1.w;
    me_c2_ = mv_inv[2] * tc_c1.w;
    
    tc_c3.xyz = (mv_inv[3] - position4).xyz;
    tc_c3.xyz = (tc_c3 * tc_c1.w).xyz;
    
    me_c3_.xyz = tc_c3.xyz;
    me_c3_.w = konst.z;
    
    //output delta_p
    tc_c3.xyz = tc_c3.xyz * p_inv_c2.w;
    tc_c3.w = p_inv_c2.w;
    mc_c2_ = tc_c3;
    
    //output diag/a
    d_tc_c3 = diag * tc_c3;
    tc_c0.w = dot(d_tc_c3,tc_c3);
    tc_c0.w = 1.0 / tc_c0.w;
    diag_ = tc_c0.w * diag; 
}