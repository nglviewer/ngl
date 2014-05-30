
attribute lowp vec3 inputMapping;
attribute lowp vec3 inputColor;
attribute lowp vec3 inputColor2;
attribute highp vec3 inputAxis;
attribute highp vec3 inputDir;
attribute highp vec3 inputQ;
attribute highp vec3 inputR;
attribute lowp float inputCylinderRadius;
attribute lowp float inputCylinderHeight;

varying lowp vec3 color;
varying lowp vec3 color2;
varying highp vec3 cylinderAxis;
varying lowp float cylinderRadius;

varying vec3 point;
varying vec3 x_dir;

varying vec3 q;
varying vec3 r;

void main()
{

    
    color  = inputColor;
    color2  = inputColor2;
    cylinderRadius = inputCylinderRadius;

    x_dir = inputDir;

    q = inputQ;
    r = inputR;

    vec3  qr = normalize(r-q);
    vec3   c = (q + r) / 2.0;

    vec3 oqr1 = vec3( 0.0, 0.0, 1.0 );

    if(dot(oqr1,qr) > 0.999)
        oqr1 = vec3( 0.0, 1.0 , 0.0);

    vec3 oqr2 = normalize(cross(qr,oqr1));
    oqr1 = normalize(cross(oqr2,qr));

    qr *= inputCylinderHeight/2.0;
    oqr1 *= inputCylinderRadius;
    oqr2 *= inputCylinderRadius;

    point = vec3( 
        position.xyz + 
        inputMapping.x*oqr1 +
        inputMapping.y*qr +
        inputMapping.z*oqr2
    );
    vec4 cameraPos = modelViewMatrix * vec4( point, 1.0 );
    gl_Position = projectionMatrix * vec4( cameraPos.xyz, 1.0 );
}









