
#extension GL_ARB_texture_rectangle : enable

varying vec4 i_near;
varying vec4 i_far;
varying vec4 sphereposition;
varying vec4 color;
varying float radius;
uniform sampler2DRect texturePosition;
uniform sampler2DRect textureColors;
uniform sampler2DRect textureSizes;
uniform sampler2DRect textureScale;


void main()
{
vec4 spaceposition;
color = texture2DRect(textureColors, gl_MultiTexCoord0.xy);

radius = texture2DRect(textureSizes, gl_MultiTexCoord0.xy).x *
		 texture2DRect(textureScale, gl_MultiTexCoord0.xy).x * 10.0 ;
spaceposition = texture2DRect(texturePosition, gl_MultiTexCoord0.xy);
spaceposition.w = 1.0;
sphereposition = texture2DRect(texturePosition, gl_MultiTexCoord0.xy);
sphereposition.w = 1.0;
if (radius < 1.0)
    spaceposition.xyz += gl_Vertex.xyz;
else
    spaceposition.xyz += gl_Vertex.xyz*radius*radius;
gl_Position = (gl_ModelViewProjectionMatrix*spaceposition);
  // Calcul near from position
  vec4 near = gl_Position ;
  near.z = 0.0 ;
  i_near = (gl_ModelViewProjectionMatrixInverse*near) ;
  //i_near = near;
  // Calcul far from position
  vec4 far = gl_Position ;
  far.z = far.w ;
  i_far = (gl_ModelViewProjectionMatrixInverse*far) ;
}

void main2()  {
}
;
#endif // __BALLIMPROVED_VERT_H__

