#extension GL_EXT_frag_depth : enable

uniform mat4 projectionMatrix;

varying lowp vec2 mapping;
varying mat3 cameraToCylinder;
varying lowp vec3 color;
varying highp vec3 position;
varying highp vec3 cameraCylinderPos;
varying highp vec3 cylinderCenter;
varying highp vec3 cylinderAxis;
varying lowp float cylinderRadius;
varying lowp float cylinderHeight;

highp vec3 cameraPos;
highp vec3 cameraNormal;

#include light_params

#include fog_params

void CylinderImpostor(out vec3 cameraPos, out vec3 cameraNormal)
{

    vec3 cameraCylCenter = cameraCylinderPos;
    vec3 cylAxis = cylinderAxis;
    float cylRadius = cylinderRadius;
    float cylHeight = cylinderHeight;

    // First get the camera space direction of the ray.
    vec3 cameraPlanePos = vec3(mapping * max(cylRadius, cylHeight), 0.0) + cameraCylinderPos;
    vec3 cameraRayDirection = normalize(cameraPlanePos);

    // Now transform data into Cylinder space where the cyl's symetry axis is up.
    vec3 cylCenter = cameraToCylinder * cameraCylCenter;
    vec3 rayDirection = normalize( cameraToCylinder * cameraPlanePos );


    // We will have to return the one from the intersection of the ray and circles,
    // and the ray and the side, that is closer to the camera. For that, we need to
    // store the results of the computations.
    vec3 circlePos, sidePos;
    vec3 circleNormal, sideNormal;
    bool circleIntersection = false, sideIntersection = false;

    // First check if the ray intersects with the top or bottom circle
    // Note that if the ray is parallel with the circles then we
    // definitely won't get any intersection (but we would divide with 0).
    if(false && rayDirection.y != 0.0){
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
        float B = -2.0*(rayDirection.x*cylCenter.x + rayDirection.z*cylCenter.z);
        float C = cylCenter.x*cylCenter.x + cylCenter.z*cylCenter.z - cylRadius*cylRadius;

        float det = (B * B) - (4.0 * A * C);
        if(det >= 0.0){
            float sqrtDet = sqrt(det);
            float posT = (-B + sqrtDet)/(2.0*A);
            float negT = (-B - sqrtDet)/(2.0*A);

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

void CylinderImpostor2(out vec3 cameraPos, out vec3 cameraNormal)
{
    // First get the camera space direction of the ray.
    vec3 cameraPlanePos = vec3(mapping * max(cylinderRadius, cylinderHeight), 0.0) + cameraCylinderPos;
    vec3 cameraRayDirection = normalize(cameraPlanePos);

    // Now transform data into Cylinder space wherethe cyl's symetry axis is up.
    vec3 cylCenter = cameraToCylinder * cameraCylinderPos;
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
        // and the cylCenter is cylinderHeight, and the distance from the
        // y axis is less than cylinderRadius. So we have to find a point
        // which is on the line, and match these conditions.

        // The equation for the y axis distances:
        // rayDirection.y * t - cylCenter.y = +- cylinderHeight
        // So t = (+-cylinderHeight + cylCenter.y) / rayDirection.y
        // About selecting the one we need:
        //  - Both has to be positive, or no intersection is visible.
        //  - If both are positive, we need the smaller one.
        float topT = (+cylinderHeight + cylCenter.y) / rayDirection.y;
        float bottomT = (-cylinderHeight + cylCenter.y) / rayDirection.y;
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
            if( length(dist) <= cylinderRadius ) {
                // The value we will (optianally) return is in camera space.
                circlePos = cameraRayDirection * t;
                // This one is ugly, but i didn't have better idea.
                circleNormal = length(circlePos - cameraCylinderPos) <
                               length((circlePos - cameraCylinderPos) + cylinderAxis) ? cylinderAxis : -cylinderAxis;
                circleIntersection = true;
            }
        }
    }


    // Find the intersection of the ray and the cylinder's side
    // The distance of the point and the y axis is sqrt(x^2 + z^2), which has to be equal to cylradius
    // (rayDirection.x*t - cylCenter.x)^2 + (rayDirection.z*t - cylCenter.z)^2 = cylinderRadius^2
    // So its a quadratic for t (A*t^2 + B*t + C = 0) where:
    // A = rayDirection.x^2 + rayDirection.z^2 - if this is 0, we won't get any intersection
    // B = -2*rayDirection.x*cylCenter.x - 2*rayDirection.z*cylCenter.z
    // C = cylCenter.x^2 + cylCenter.z^2 - cylinderRadius^2
    // It will give two results, we need the smaller one

    float A = rayDirection.x*rayDirection.x + rayDirection.z*rayDirection.z;
    if(A != 0.0) {
        float B = -2.0*(rayDirection.x*cylCenter.x + rayDirection.z*cylCenter.z);
        float C = cylCenter.x*cylCenter.x + cylCenter.z*cylCenter.z - cylinderRadius*cylinderRadius;

        float det = (B * B) - (4.0 * A * C);
        if(det >= 0.0){
            float sqrtDet = sqrt(det);
            float posT = (-B + sqrtDet)/(2.0*A);
            float negT = (-B - sqrtDet)/(2.0*A);

            float IntersectionT = min(posT, negT);
            vec3 Intersect = rayDirection * IntersectionT;

            if(abs(Intersect.y - cylCenter.y) < cylinderHeight){
                // It's in camera space
                sidePos = cameraRayDirection * IntersectionT;
                sideNormal = normalize(sidePos - cameraCylinderPos);
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


void main(void)
{   
    CylinderImpostor(cameraPos, cameraNormal);

    //Set the depth based on the new cameraPos.
    vec4 clipPos = projectionMatrix * vec4(cameraPos, 1.0);
    float ndcDepth = clipPos.z / clipPos.w;
    float depth2 = ((gl_DepthRange.diff * ndcDepth) + gl_DepthRange.near + gl_DepthRange.far) / 2.0;
    gl_FragDepthEXT = depth2;

    vec3 transformedNormal = cameraNormal;
    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );
    
    #include light

    gl_FragColor = vec4( color, 1.0 );
    gl_FragColor.xyz *= vLightFront;

    #include fog
}


void main2(void)
{
    gl_FragColor = vec4( color, 1.0 );
}



