#extension GL_EXT_frag_depth : enable

uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform mat4 projectionMatrixInverse;
uniform mat4 projectionMatrixTranspose;
uniform mat4 modelViewMatrixInverse;

uniform vec2 viewport;



varying vec4 me_c0_;
varying vec4 me_c1_;
varying vec4 me_c2_;
varying vec4 me_c3_;
varying vec4 mc_c2_;
varying vec4 diag_ ;

const vec4 konstant = vec4(0, 0.5, 1, 2);

void main()
{
    mat4 p_inv   = projectionMatrixInverse;
    // vec4 viewport2   = vec4( viewport, 0.0016667, 0.002499 );
    vec4 viewport2   = vec4( viewport, 0.0, 0.0 );
    // vec4 lightpos  = gl_LightSource[0].position;
    
    vec4 view_c, view_e, pos, eqn, tmp;
    
    //inverse viewport transformation
    view_c.xy = ((gl_FragCoord * viewport2.zwxy) - konstant.z).xy;
    
    //view direction in eye space
    view_e = (p_inv[1] * view_c.y) + p_inv[3];
    view_e = (p_inv[0] * view_c.x) + view_e;
    
    //view direction in parameter space
    view_c = (me_c0_ * view_e.x);
    view_c = (me_c1_ * view_e.y) + view_c;
    view_c = (me_c2_ * view_e.z) + view_c;
    view_c = (me_c3_ * view_e.w) + view_c;
    
    //quadratic equation
    tmp = diag_ * view_c;
    eqn.y = dot(tmp,mc_c2_);
    eqn.z = dot(tmp,view_c);
    
    eqn.xyz = eqn.xyz * me_c3_.w;
    
    eqn.w = (eqn.y * eqn.y) - eqn.z;
    
    // if(eqn.w < 0.0)
    //     discard;
    
    tmp.w = 1.0 / sqrt(eqn.w);
    eqn.w = (eqn.w * -tmp.w) -eqn.y;
    
    gl_FragDepthEXT = (eqn.w * konstant.y) + konstant.y;
    
    view_c.xyz = ((mc_c2_ * eqn.w) + view_c).xyz;
    eqn.x = dot(view_c.xyz,me_c0_.xyz);
    eqn.y = dot(view_c.xyz,me_c1_.xyz);
    eqn.z = dot(view_c.xyz,me_c2_.xyz);
    eqn.xyz = normalize(eqn).xyz;
    
    // view_e.w = (p_inv[2].w * eqn.w) + view_e.w;
    // pos.xyz = view_e.xyz / view_e.w;
    
    // view_c.xyz = lightpos.xyz - pos.xyz;
    // view_c.xyz = normalize(view_c).xyz;
    
    // tmp.x = dot(eqn.xyz,view_c.xyz);
    
    // view_e.xyz = normalize(pos).xyz;
    // view_e = view_c - view_e;
    // view_e.xyz = normalize(view_e).xyz;
    
    // tmp.y = dot(eqn.xyz,view_e.xyz);
    
    
    // tmp.w = gl_FrontMaterial.shininess;
    
    // eqn = (tmp.y * gl_LightSource[0].diffuse) + gl_LightSource[0].ambient;
    // eqn = gl_Color * eqn;
    // gl_FragColor = (tmp.z * gl_LightSource[0].specular) + eqn;

    gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}