#version 330

layout(location = 0) in vec3 cylCenter;
layout(location = 1) in vec3 cylAxis;
layout(location = 2) in float cylRadius;
layout(location = 3) in float cylHeight;

out VertexData
{
	vec3 cylCenter, cylAxis;
	mat3 cameraToCylinder;
	float cylRadius, cylHeight;
} outData;

void main()
{
	outData.cylCenter = cylCenter;
	outData.cylAxis   = normalize(cylAxis);
	outData.cylRadius = cylRadius;
	outData.cylHeight = cylHeight;

	// Now let's do a favor for the frag shader, count the matrix that rotates
	// cylAxis to (0.0, 1.0, 0.0). It has to be done only once per drawing, so
	// this is the right place for it.

    // The dot of y and the axis will give us the cosine of the angle,
    // and the cross product will give us the axis, around we want to rotate.
    // And we can create the matrix from those.
    vec3 yAxis = vec3(0.0, 1.0, 0.0);
    vec3 cylNormAxis = normalize(cylAxis);
    float cosang = dot(cylNormAxis, yAxis);
    float ang = acos(cosang);
    float S = sin(ang), iS = 1 - S;
    float C = cosang, iC = 1 - C;
    vec3 axis = cross(cylNormAxis, yAxis);
    float x = axis.x, y = axis.y, z = axis.z;
    outData.cameraToCylinder = transpose(mat3(
     C + x*x*iC,            iC*x*y - z*S,           iC*x*z + y*S,
     iC*x*y + z*S,          C + y*y*iC,             iC*y*z - x*S,
     iC*x*z - y*S,          iC*y*z + x*S,           C + z*z*iC));
}
