
attribute vec3 inputMapping;
attribute vec3 inputColor;
attribute vec3 inputAxis;
attribute float inputCylinderRadius;
attribute float inputCylinderHeight;
attribute float inputBezierRadius;

attribute vec3 inputP0;
attribute vec3 inputP1;
attribute vec3 inputP2;

varying vec3 p0;
varying vec3 p1;
varying vec3 p2;

varying vec3 color;
varying vec3 point;
varying float cylinderHeight;
varying float bezierRadius;

void main()
{
    vec4 EyePoint = vec4( cameraPosition, 1.0 );

    vec3 center = position.xyz;   
    vec3 dir = normalize(inputAxis);
    float ext = inputCylinderHeight/2.0;
    vec3 ldir;

    color = inputColor;
    cylinderHeight = inputCylinderHeight;
    bezierRadius = inputBezierRadius;

    vec3 cam_dir = normalize(EyePoint.xyz - center);
    float b = dot(cam_dir, dir);
    if(b<0.0) // direction vector looks away, so flip
        ldir = -ext*dir;
    else // direction vector already looks in my direction
        ldir = ext*dir;

    vec3 left = cross(cam_dir, ldir);
    vec3 up = cross(left, ldir);
    left = inputCylinderRadius*normalize(left);
    up = inputCylinderRadius*normalize(up);

    // transform to modelview coordinates
    vec3 axis =  normalize(normalMatrix * ldir);
    vec3 U = normalize(normalMatrix * up);
    vec3 V = normalize(normalMatrix * left);

    vec4 base4 = modelViewMatrix * vec4(center-ldir, 1.0);
    vec3 base = base4.xyz / base4.w;

    vec4 top_position = modelViewMatrix*(vec4(center+ldir,1.0));
    vec4 end4 = top_position;
    vec3 end = end4.xyz / end4.w;

    vec3 mapping = inputMapping;
    vec4 w = modelViewMatrix * vec4( 
        center + mapping.x*ldir + mapping.y*left + mapping.z*up, 1.0 
    );
    point = w.xyz / w.w;

    vec4 _p0 = modelViewMatrix*vec4(inputP0, 1.0);
    vec4 _p1 = modelViewMatrix*vec4(inputP1, 1.0);
    vec4 _p2 = modelViewMatrix*vec4(inputP2, 1.0);
    p0 = _p0.xyz / _p0.w;
    p1 = _p1.xyz / _p1.w;
    p2 = _p2.xyz / _p2.w;

    gl_Position = projectionMatrix * w;

}



