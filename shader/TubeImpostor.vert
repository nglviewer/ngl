
attribute lowp vec3 inputMapping;
attribute lowp vec3 inputColor;
attribute lowp vec3 inputColor2;
attribute highp vec3 inputAxis;
attribute highp vec3 inputFrenetNormal;
attribute lowp float inputCylinderRadius;
attribute lowp float inputCylinderHeight;
attribute highp vec3 inputP;
attribute highp vec3 inputQ;
attribute highp vec3 inputR;
attribute highp vec3 inputS;

varying lowp vec3 color;
varying lowp vec3 color2;
varying lowp float cylinderRadius;  

varying vec3 point;
varying vec3 axis;
varying vec3 base;
varying vec3 end;
varying vec3 U;
varying vec3 V;
varying float b;

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

    vec4 EyePoint = vec4( cameraPosition, 1.0 );

    vec3 center = position.xyz;   
    vec3 dir = normalize(inputAxis);
    float ext = inputCylinderHeight/2.0;
    vec3 ldir;

    color  = inputColor;
    color2  = inputColor2;
    cylinderRadius = inputCylinderRadius;



    p = inputP;
    q = inputQ;
    r = inputR;
    s = inputS;

    vec3  qr = normalize(r-q);
    vec3  qp = normalize(q-p);
    vec3  sr = normalize(s-r);

    // cross
    vec3 c_pqr = normalize( cross(vec3( 0.0, 0.0, 1.0 ), qr) );
    vec3 c_qrs = normalize( cross(vec3( 0.0, 1.0, 0.0 ), qr) );

    // orthogonal
    vec3 o_q = normalize( cross( qr, c_pqr ) );
    vec3 o_r = normalize( cross( qr, o_q ) );

    vec3 pqr = normalize( (qp + qr)/2.0 );
    vec3 qrs = normalize( (qr + sr)/2.0 );

    // radius
    vec3 r_q = q + o_q*cylinderRadius;
    vec3 r_r = r + o_r*cylinderRadius;
    vec3 r_qr = normalize( r_r-r_q );

    // plane
    vec3 pqr_n = normalize( cross( pqr, cross( pqr, qr ) ) );
    vec3 qrs_n = normalize( cross( qrs, cross( qrs, qr ) ) );

    // ix
    vec3 ix_q = line_plane_ixn( pqr_n, q, qr, r_q );
    vec3 ix_r = line_plane_ixn( qrs_n, r, qr, r_r );

    // center
    //center = ( ix_q + ix_r ) / 2.0;

    
    ext = distance( ix_q, ix_r ) / 2.0;
    ext = distance( r_r, r_q ) / 2.0;


    vec3 oqr1 = vec3( 0.0, 0.0, 1.0 );

    if(dot(oqr1,qr) > 0.999)
        oqr1 = vec3( 0.0, 1.0 , 0.0);

    vec3 oqr2 = normalize(cross(qr,oqr1));
    oqr1 = normalize(cross(oqr2,qr));


    ext = distance( r_r, r_q ) / 1.5;



    vec3 cam_dir = normalize(EyePoint.xyz - center);
    b = dot(cam_dir, dir);
    if(b<0.0) // direction vector looks away, so flip
        ldir = -ext*dir;
    else // direction vector already looks in my direction
        ldir = ext*dir;

    vec3 left = cross(cam_dir, ldir);
    vec3 up = cross(left, ldir);
    left = cylinderRadius*normalize(left);
    up = cylinderRadius*normalize(up);

    // transform to modelview coordinates
    axis =  normalize(normalMatrix * ldir);
    U = normalize(normalMatrix * up);
    V = normalize(normalMatrix * left);

    vec4 base4 = modelViewMatrix * vec4(center-ldir, 1.0);
    base = base4.xyz / base4.w;

    vec4 top_position = modelViewMatrix*(vec4(center+ldir,1.0));
    vec4 end4 = top_position;
    end = end4.xyz / end4.w;


    vec4 p4 = modelViewMatrix*(vec4(inputP,1.0));
    p = p4.xyz / p4.w;
    vec4 q4 = modelViewMatrix*(vec4(inputQ,1.0));
    q = q4.xyz / q4.w;
    vec4 r4 = modelViewMatrix*(vec4(inputR,1.0));
    r = r4.xyz / r4.w;
    vec4 s4 = modelViewMatrix*(vec4(inputS,1.0));
    s = s4.xyz / s4.w;


    vec4 w = modelViewMatrix * vec4( 
        center + inputMapping.x*ldir + inputMapping.y*left + inputMapping.z*up, 1.0 
    );
    point = w.xyz / w.w;

    gl_Position = projectionMatrix * w;

    // // vec4 xf0 = modelViewMatrix*vec4(center-ldir+left-up,1.0);
    // // vec4 xf2 = modelViewMatrix*vec4(center-ldir-left-up,1.0);
    // vec4 xc0 = modelViewMatrix*vec4(center+ldir+left-up,1.0);
    // vec4 xc1 = modelViewMatrix*vec4(center+ldir+left+up,1.0);
    // vec4 xc2 = modelViewMatrix*vec4(center+ldir-left-up,1.0);
    // vec4 xc3 = modelViewMatrix*vec4(center+ldir-left+up,1.0);

    // vec4 w0 = xf0;
    // vec4 w1 = xf2;
    // vec4 w2 = xc0;
    // vec4 w3 = xc2;
    // vec4 w4 = xc1;
    // vec4 w5 = xc3;

    // // Vertex 1
    // point = w0.xyz / w0.w;
    // gl_Position = projectionMatrix  * w0;

    // // Vertex 2
    // point = w1.xyz / w1.w;
    // gl_Position = projectionMatrix  * w1;

    // // Vertex 3
    // point = w2.xyz / w2.w;
    // gl_Position = projectionMatrix  * w2;

    // // Vertex 4
    // point = w3.xyz / w3.w;
    // gl_Position = projectionMatrix  * w3;

    // // Vertex 5
    // point = w4.xyz / w4.w;
    // gl_Position = projectionMatrix  * w4;

    // // Vertex 6
    // point = w5.xyz / w5.w;
    // gl_Position = projectionMatrix  * w5;
    
    // move out of viewing frustum to avoid clipping artifacts
    if( gl_Position.z<=5.0 )
        gl_Position.z = -10.0;
}


