#version 330 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4 : enable

layout(lines) in;
layout(triangle_strip, max_vertices=24) out;

out vec3  q;
out vec3  r;
out vec3  mc_pos;

const float radius = 0.2;

void draw_quad(vec3 a, vec3 b,vec3 c,vec3 d)
{
  mc_pos = a;
  gl_Position  = gl_ModelViewProjectionMatrix*vec4(mc_pos,1); 
  EmitVertex();  

  mc_pos = b;
  gl_Position  = gl_ModelViewProjectionMatrix*vec4(mc_pos,1); 
  EmitVertex();  

  mc_pos = c;
  gl_Position  = gl_ModelViewProjectionMatrix*vec4(mc_pos,1); 
  EmitVertex();  

  mc_pos = d;
  gl_Position  = gl_ModelViewProjectionMatrix*vec4(mc_pos,1); 
  EmitVertex();  

  EndPrimitive();
}

void main()
{
  q     = gl_PositionIn[0].xyz;
  r     = gl_PositionIn[1].xyz;
  
  vec3  qr = normalize(r-q);
  vec3   c = (q + r) /2;

  vec3 oqr1 = vec3(0,0,1);

  if(dot(oqr1,qr) > 0.99)
    oqr1 = vec3(0,1,0);
  
  vec3 oqr2 = normalize(cross(qr,oqr1));
  oqr1 = normalize(cross(oqr2,qr));
  
  oqr1 *= radius;
  oqr2 *= radius;

  vec3 c0q0 = q-oqr1-oqr2;
  vec3 c1q0 = q+oqr1-oqr2;
  vec3 c1q1 = q+oqr1+oqr2;
  vec3 c0q1 = q-oqr1+oqr2;

  vec3 c0r0 = r-oqr1-oqr2;
  vec3 c1r0 = r+oqr1-oqr2;
  vec3 c1r1 = r+oqr1+oqr2;
  vec3 c0r1 = r-oqr1+oqr2;

  gl_FrontColor = gl_FrontColorIn[1];

  draw_quad(c1r0,c1r1,c0r0,c0r1);
  draw_quad(c1q0,c0q0,c1q1,c0q1);

  draw_quad(c0q0,c1q0,c0r0,c1r0);
  draw_quad(c0q1,c0r1,c1q1,c1r1);

  draw_quad(c0q0,c0r0,c0q1,c0r1);
  draw_quad(c1q0,c1q1,c1r0,c1r1);
}