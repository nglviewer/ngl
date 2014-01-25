
attribute lowp vec3 inputMapping;
attribute lowp vec3 inputColor;
attribute lowp vec3 inputColor2;
attribute highp vec3 inputAxis;
attribute highp vec3 inputDir;
attribute highp vec3 inputP;
attribute highp vec3 inputQ;
attribute highp vec3 inputR;
attribute highp vec3 inputS;
attribute lowp float inputCylinderRadius;
attribute lowp float inputCylinderHeight;

varying lowp vec3 mapping;
varying mat3 cameraToCylinder;
varying lowp vec3 color;
varying lowp vec3 color2;
varying highp vec3 cameraCylinderPos;
varying highp vec3 cylinderCenter;
varying highp vec3 cylinderAxis;
varying highp vec3 cylinderDir;
varying lowp float cylinderRadius;
varying lowp float cylinderHeight;

varying vec3 point;
varying vec3 x_dir;


varying vec3 p;
varying vec3 q;
varying vec3 r;
varying vec3 s;


vec3 line_plane_ixn(vec3 pn, vec3 pp, vec3 ld, vec3 lp)
{
  float t = (dot(pn,pp) - dot(pn,lp))/(dot(pn,ld));
  return lp + t*ld;
}


void main()
{

    
    color  = inputColor;
    color2  = inputColor2;
    cylinderRadius = inputCylinderRadius *2.0;

    // x_dir = inputDir;

    p = inputP;
    q = inputQ;
    r = inputR;
    s = inputS;

    vec3  qr = normalize(r-q);
    vec3   c = (q + r) / 2.0;

    vec3 pqr = (normalize(q-p) + qr)/2.0;
    vec3 qrs = (qr +  normalize(s-r))/2.0;

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


// vec3 c0q0 = line_plane_ixn(pqr,q,qr,q+radius*(-oqr1-oqr2));
//   vec3 c1q0 = line_plane_ixn(pqr,q,qr,q+radius*(+oqr1-oqr2));
//   vec3 c1q1 = line_plane_ixn(pqr,q,qr,q+radius*(+oqr1+oqr2));
//   vec3 c0q1 = line_plane_ixn(pqr,q,qr,q+radius*(-oqr1+oqr2));

//   vec3 c0r0 = line_plane_ixn(qrs,r,qr,r+radius*(-oqr1-oqr2));
//   vec3 c1r0 = line_plane_ixn(qrs,r,qr,r+radius*(+oqr1-oqr2));
//   vec3 c1r1 = line_plane_ixn(qrs,r,qr,r+radius*(+oqr1+oqr2));
//   vec3 c0r1 = line_plane_ixn(qrs,r,qr,r+radius*(-oqr1+oqr2));


// vec3 c0q0 = q-oqr1-oqr2;
//   vec3 c1q0 = q+oqr1-oqr2;
//   vec3 c1q1 = q+oqr1+oqr2;
//   vec3 c0q1 = q-oqr1+oqr2;

//   vec3 c0r0 = r-oqr1-oqr2;
//   vec3 c1r0 = r+oqr1-oqr2;
//   vec3 c1r1 = r+oqr1+oqr2;
//   vec3 c0r1 = r-oqr1+oqr2;




