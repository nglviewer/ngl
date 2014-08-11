#version 330
#extension GL_EXT_gpu_shader4 : enable

in FragData
{
	flat vec3 cameraCylCenter, cylAxis;
	flat mat3 cameraToCylinder;
	flat float cylRadius, cylHeight;
	smooth vec2 mapping;
};

out vec4 outputColor;

layout(std140) uniform;

struct MaterialEntry
{
	vec4 diffuseColor;
	vec4 specularColor;
	vec4 specularShininess;		//ATI Array Bug fix. Not really a vec4.
};

const int NUMBER_OF_SPHERES = 4;

uniform Material
{
	MaterialEntry material[NUMBER_OF_SPHERES];
} Mtl;

struct PerLight
{
	vec4 cameraSpaceLightPos;
	vec4 lightIntensity;
};

const int numberOfLights = 2;

uniform Light
{
	vec4 ambientIntensity;
	float lightAttenuation;
	PerLight lights[numberOfLights];
} Lgt;


float CalcAttenuation(in vec3 cameraSpacePosition,
	in vec3 cameraSpaceLightPos,
	out vec3 lightDirection)
{
	vec3 lightDifference =  cameraSpaceLightPos - cameraSpacePosition;
	float lightDistanceSqr = dot(lightDifference, lightDifference);
	lightDirection = lightDifference * inversesqrt(lightDistanceSqr);

	return (1 / ( 1.0 + Lgt.lightAttenuation * lightDistanceSqr));
}

uniform Projection
{
	mat4 cameraToClipMatrix;
};

vec4 ComputeLighting(in PerLight lightData, in vec3 cameraSpacePosition,
	in vec3 cameraSpaceNormal, in MaterialEntry material)
{
	vec3 lightDir;
	vec4 lightIntensity;
	if(lightData.cameraSpaceLightPos.w == 0.0)
	{
		lightDir = vec3(lightData.cameraSpaceLightPos);
		lightIntensity = lightData.lightIntensity;
	}
	else
	{
		float atten = CalcAttenuation(cameraSpacePosition,
			lightData.cameraSpaceLightPos.xyz, lightDir);
		lightIntensity = atten * lightData.lightIntensity;
	}

	vec3 surfaceNormal = normalize(cameraSpaceNormal);
	float cosAngIncidence = dot(surfaceNormal, lightDir);
	cosAngIncidence = cosAngIncidence < 0.0001 ? 0.0 : cosAngIncidence;

	vec3 viewDirection = normalize(-cameraSpacePosition);

	vec3 halfAngle = normalize(lightDir + viewDirection);
	float angleNormalHalf = acos(dot(halfAngle, surfaceNormal));
	float exponent = angleNormalHalf / material.specularShininess.x;
	exponent = -(exponent * exponent);
	float gaussianTerm = exp(exponent);

	gaussianTerm = cosAngIncidence != 0.0 ? gaussianTerm : 0.0;

	vec4 lighting = material.diffuseColor * lightIntensity * cosAngIncidence;
	lighting += material.specularColor * lightIntensity * gaussianTerm;

	return lighting;
}

void CylinderImpostor(out vec3 cameraPos, out vec3 cameraNormal)
{
    // First get the camera space direction of the ray.
	vec3 cameraPlanePos = vec3(mapping * max(cylRadius, cylHeight), 0.0) + cameraCylCenter;
    vec3 cameraRayDirection = normalize(cameraPlanePos);

    // Now transform data into Cylinder space wherethe cyl's symetry axis is up.
    vec3 cylCenter = cameraToCylinder * cameraCylCenter;
    vec3 rayDirection = normalize(cameraToCylinder * cameraPlanePos);


    // We will have to return the one from the intersection of the ray and circles,
    // and the ray and the side, that is closer to the camera. For that, we need to
    // store the results of the computations.
    vec3 circlePos, sidePos;
    vec3 circleNormal, sideNormal;
    bool circleIntersection = false, sideIntersection = false;

    // First check if the ray intersects with the top or bottom circle
    // Note that if the ray is parallel with the circles then we
    // definitely won't get any intersection (but we would divide with 0).
    if(rayDirection.y != 0.0){
        // What we know here is that the distance of the point's y coord
        // and the cylCenter is cylHeight, and the distance from the
        // y axis is less than cylRadius. So we have to find a point
        // which is on the line, and match these conditions.

        // The equation for the y axis distances:
        // rayDirection.y * t - cylCenter.y = +- cylHeight
        // So t = (+-cylHeight + cylCenter.y) / rayDirection.y
        // About selecting the one we need:
        //  - Both has to be positive, or no intersection is visible.
        //  - If both are positive, we need the smaller one.
        float topT = (+cylHeight + cylCenter.y) / rayDirection.y;
        float bottomT = (-cylHeight + cylCenter.y) / rayDirection.y;
        if(topT > 0.0 && bottomT > 0.0){
            bool top = topT < bottomT;
            float t = top ? topT : bottomT;

            // Now check for the x and z axis:
            // If the intersection is inside the circle (so the distance on the xz plain of the point,
            // and the center of circle is less than the radius), then its a point of the cylinder.
            // But we can't yet return because we might get a point from the the cylinder side
            // intersection that is closer to the camera.
            vec3 intersection = rayDirection * t;
            vec2 dist = vec2((intersection.x - cylCenter.x), (intersection.z - cylCenter.z));
            if( length(dist) <= cylRadius ) {
                // The value we will (optianally) return is in camera space.
                circlePos = cameraRayDirection * t;
                // This one is ugly, but i didn't have better idea.
                circleNormal = length(circlePos - cameraCylCenter) <
                               length((circlePos - cameraCylCenter) + cylAxis) ? cylAxis : -cylAxis;
                circleIntersection = true;
            }
        }
    }


    // Find the intersection of the ray and the cylinder's side
    // The distance of the point and the y axis is sqrt(x^2 + z^2), which has to be equal to cylradius
    // (rayDirection.x*t - cylCenter.x)^2 + (rayDirection.z*t - cylCenter.z)^2 = cylRadius^2
    // So its a quadratic for t (A*t^2 + B*t + C = 0) where:
    // A = rayDirection.x^2 + rayDirection.z^2 - if this is 0, we won't get any intersection
    // B = -2*rayDirection.x*cylCenter.x - 2*rayDirection.z*cylCenter.z
    // C = cylCenter.x^2 + cylCenter.z^2 - cylRadius^2
    // It will give two results, we need the smaller one

    float A = rayDirection.x*rayDirection.x + rayDirection.z*rayDirection.z;
    if(A != 0.0) {
        float B = -2*(rayDirection.x*cylCenter.x + rayDirection.z*cylCenter.z);
        float C = cylCenter.x*cylCenter.x + cylCenter.z*cylCenter.z - cylRadius*cylRadius;

        float det = (B * B) - (4 * A * C);
        if(det >= 0.0){
            float sqrtDet = sqrt(det);
            float posT = (-B + sqrtDet)/(2*A);
            float negT = (-B - sqrtDet)/(2*A);

            float IntersectionT = min(posT, negT);
            vec3 Intersect = rayDirection * IntersectionT;

            if(abs(Intersect.y - cylCenter.y) < cylHeight){
                // It's in camera space
                sidePos = cameraRayDirection * IntersectionT;
                sideNormal = normalize(sidePos - cameraCylCenter);
                sideIntersection = true;
            }
        }
    }

    // Now get the results together:
    if(sideIntersection && circleIntersection){
        bool circle = length(circlePos) < length(sidePos);
        cameraPos = circle ? circlePos : sidePos;
        cameraNormal = circle ? circleNormal : sideNormal;
    } else if(sideIntersection){
        cameraPos = sidePos;
        cameraNormal = sideNormal;
    } else if(circleIntersection){
        cameraPos = circlePos;
        cameraNormal = circleNormal;
    } else
        discard;
}

void main()
{

	vec3 cameraPos;
	vec3 cameraNormal;

	CylinderImpostor(cameraPos, cameraNormal);

	//Set the depth based on the new cameraPos.
	vec4 clipPos = cameraToClipMatrix * vec4(cameraPos, 1.0);
	float ndcDepth = clipPos.z / clipPos.w;
	gl_FragDepth = ((gl_DepthRange.diff * ndcDepth) + gl_DepthRange.near + gl_DepthRange.far) / 2.0;

	vec4 accumLighting = Mtl.material[gl_PrimitiveID].diffuseColor * Lgt.ambientIntensity;
	for(int light = 0; light < numberOfLights; light++)
	{
		accumLighting += ComputeLighting(Lgt.lights[light],
			cameraPos, cameraNormal, Mtl.material[gl_PrimitiveID]);
	}

	outputColor = sqrt(accumLighting); //2.0 gamma correction
}
