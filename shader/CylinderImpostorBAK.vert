attribute lowp vec2 inputMapping;
attribute lowp vec3 inputColor;
attribute highp vec3 inputAxis;
attribute lowp float inputCylinderRadius;
attribute lowp float inputCylinderHeight;

varying lowp vec2 mapping;
varying mat3 cameraToCylinder;
varying lowp vec3 color;
varying highp vec3 cameraCylinderPos;
varying highp vec3 cylinderCenter;
varying highp vec3 cylinderAxis;
varying lowp float cylinderRadius;
varying lowp float cylinderHeight;

const lowp float g_boxCorrection = 1.6;

void main(void){
    lowp vec2 offset;

    color = inputColor;
    cylinderCenter = ( projectionMatrix * ( modelViewMatrix * vec4( position, 1.0 ) ) ).xyz;
    cameraCylinderPos = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;
    cylinderRadius = inputCylinderRadius;
    cylinderHeight = inputCylinderHeight;
    // cylinderAxis = ( modelViewMatrix * vec4( inputAxis, 1.0 ) ).xyz;
    // cylinderAxis = ( projectionMatrix * vec4( inputAxis, 1.0 ) ).xyz;
    cylinderAxis = inputAxis;

    mapping = inputMapping * g_boxCorrection;
    offset = inputMapping * max( inputCylinderRadius, inputCylinderHeight );

    vec4 cameraCornerPos = vec4( cameraCylinderPos, 1.0 );
    cameraCornerPos.xy += offset * g_boxCorrection;

    gl_Position = projectionMatrix * cameraCornerPos;


    // Now let's do a favor for the frag shader, create the matrix that rotates
    // cylinderAxis to (0.0, 1.0, 0.0). It has to be done only once per drawing,
    // so this is the right place for it.

    // The dot of y and the axis will give us the cosine of the angle,
    // and the cross product will give us the axis, around we want to rotate.
    // And we can create the matrix from those.
    vec3 yAxis = vec3( 0.0, 1.0, 0.0 );
    vec3 cylNormAxis = normalize( cylinderAxis );
    float cosang = dot( cylNormAxis, yAxis );
    float ang = acos( cosang );
    float S = sin( ang ), iS = 1.0 - S;
    float C = cosang, iC = 1.0 - C;
    vec3 axis = cross( cylNormAxis, yAxis );
    float x = axis.x, y = axis.y, z = axis.z;
    // cameraToCylinder = transpose( mat3(
    //         C + x*x*iC,            iC*x*y - z*S,           iC*x*z + y*S,
    //         iC*x*y + z*S,          C + y*y*iC,             iC*y*z - x*S,
    //         iC*x*z - y*S,          iC*y*z + x*S,           C + z*z*iC
    // ));
    cameraToCylinder = mat3(
            C + x*x*iC,            iC*x*y - z*S,           iC*x*z + y*S,
            iC*x*y + z*S,          C + y*y*iC,             iC*y*z - x*S,
            iC*x*z - y*S,          iC*y*z + x*S,           C + z*z*iC
    );

    // cameraToCylinder = mat3(
    //     C + x*x*iC,     iC*x*y + z*S,   iC*x*z - y*S,
    //     iC*x*y - z*S,   C + y*y*iC,     iC*y*z + x*S,
    //     iC*x*z + y*S,   iC*y*z - x*S,   C + z*z*iC
    // );
}