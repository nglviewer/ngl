// Copyright (C) 2010-2011 by
// Laboratoire de Biochimie Theorique (CNRS),
// Laboratoire d'Informatique Fondamentale d'Orleans (Universite d'Orleans), (INRIA) and
// Departement des Sciences de la Simulation et de l'Information (CEA). 

// License: CeCILL-C license (http://www.cecill.info/)

// Contact: Marc Baaden
// E-mail: baaden@smplinux.de
// Webpage: http://hyperballs.sourceforge.net

#ifndef __BALLIMPROVED_VERT_H__
#define __BALLIMPROVED_VERT_H__
const char ballimproved_vert[] = ""
"\n"
"#extension GL_ARB_texture_rectangle : enable\n"
"\n"
"varying vec4 i_near;\n"
"varying vec4 i_far;\n"
"varying vec4 sphereposition;\n"
"varying vec4 color;\n"
"varying float radius;\n"
"uniform sampler2DRect texturePosition;\n"
"uniform sampler2DRect textureColors;\n"
"uniform sampler2DRect textureSizes;\n"
"uniform sampler2DRect textureScale;\n"
"\n"
"\n"
"void main()\n"
"{\n"
"vec4 spaceposition;\n"
"color = texture2DRect(textureColors, gl_MultiTexCoord0.xy);\n"
"\n"
"radius = texture2DRect(textureSizes, gl_MultiTexCoord0.xy).x *\n"
"		 texture2DRect(textureScale, gl_MultiTexCoord0.xy).x * 10.0 ;\n"
"spaceposition = texture2DRect(texturePosition, gl_MultiTexCoord0.xy);\n"
"spaceposition.w = 1.0;\n"
"sphereposition = texture2DRect(texturePosition, gl_MultiTexCoord0.xy);\n"
"sphereposition.w = 1.0;\n"
"if (radius < 1.0)\n"
"    spaceposition.xyz += gl_Vertex.xyz;\n"
"else\n"
"    spaceposition.xyz += gl_Vertex.xyz*radius*radius;\n"
"gl_Position = (gl_ModelViewProjectionMatrix*spaceposition);\n"
"  // Calcul near from position\n"
"  vec4 near = gl_Position ;\n"
"  near.z = 0.0 ;\n"
"  i_near = (gl_ModelViewProjectionMatrixInverse*near) ;\n"
"  //i_near = near;\n"
"  // Calcul far from position\n"
"  vec4 far = gl_Position ;\n"
"  far.z = far.w ;\n"
"  i_far = (gl_ModelViewProjectionMatrixInverse*far) ;\n"
"}\n"
"\n"
"void main2()  {\n"
"}\n"
;
#endif // __BALLIMPROVED_VERT_H__

