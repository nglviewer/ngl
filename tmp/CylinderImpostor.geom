#version 330
#extension GL_EXT_gpu_shader4 : enable

layout(std140) uniform;
layout(points) in;
layout(triangle_strip, max_vertices=4) out;

uniform Projection
{
	mat4 cameraToClipMatrix;
};

const float g_boxCorrection = 1.6;

in VertexData
{
    vec3 cylCenter, cylAxis;
	mat3 cameraToCylinder;
	float cylRadius, cylHeight;
} vert[];

out FragData
{
	flat vec3 cameraCylCenter, cylAxis;
	flat mat3 cameraToCylinder;
	flat float cylRadius, cylHeight;
	smooth vec2 mapping;
};

void main()
{
	for(int i=0; i<4; i++){
	    float xsign = i > 1 ? 1.0 : -1.0;
	    float ysign = i%2 == 1 ? 1.0 : -1.0;
        mapping = vec2(xsign, ysign) * g_boxCorrection;
        cameraCylCenter = vert[0].cylCenter;
        cylAxis = vert[0].cylAxis;
        cameraToCylinder = vert[0].cameraToCylinder;
        cylRadius = vert[0].cylRadius;
        cylHeight = vert[0].cylHeight;
        vec4 cameraCornerPos = vec4(vert[0].cylCenter, 1.0);
        cameraCornerPos.xy += vec2(xsign * max(cylRadius,cylHeight), ysign * max(cylRadius,cylHeight)) * g_boxCorrection;
        gl_Position = cameraToClipMatrix * cameraCornerPos;
        gl_PrimitiveID = gl_PrimitiveIDIn;
        EmitVertex();
	}
}
