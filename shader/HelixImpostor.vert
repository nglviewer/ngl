
attribute lowp vec3 inputMapping;
attribute lowp vec3 inputColor;
attribute lowp vec3 inputColor2;
attribute highp vec3 inputAxis;
attribute highp vec3 inputDir;
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
varying vec3 axis;
varying vec3 base;
varying vec3 end;
varying vec3 U;
varying vec3 V;
varying vec3 x_dir;
varying vec3 y_dir;
varying float b;

void main()
{

    mat4 MVMatrix = modelViewMatrix;
    mat4 PMatrix = projectionMatrix;
    mat3 NormalMatrix = normalMatrix;
    vec4 EyePoint = vec4( cameraPosition, 1.0 );

    vec3 center = position.xyz;   
    vec3 dir = normalize(inputAxis);
    float ext = inputCylinderHeight/2.0;
    vec3 ldir;
    vec3 ldir2 = inputCylinderRadius * normalize( inputDir );

    color  = inputColor;
    color2  = inputColor2;
    cylinderRadius = inputCylinderRadius;
    cylinderAxis = inputAxis;

    vec3 cam_dir = normalize(EyePoint.xyz - center);
    b = dot(cam_dir, dir);
    if(b<0.0) // direction vector looks away, so flip
        ldir = -ext*dir;
    else // direction vector already looks in my direction
        ldir = ext*dir;

    cylinderAxis = ldir;

    vec3 left = cross(cam_dir, ldir);
    vec3 up = cross(left, ldir);
    left = cylinderRadius*normalize(left);
    up = cylinderRadius*normalize(up);

    // transform to modelview coordinates
    axis =  normalize(NormalMatrix * ldir);
    U = normalize(NormalMatrix * up);
    V = normalize(NormalMatrix * left);
    
    x_dir = V;
    y_dir = U;

    x_dir = ldir2;//cross( cam_dir, ldir2 );;
    y_dir = cross( x_dir, ldir );
    x_dir = cylinderRadius * normalize(x_dir);
    y_dir = cylinderRadius * normalize(y_dir);
    x_dir = normalize( NormalMatrix * x_dir );
    y_dir = normalize( NormalMatrix * y_dir );

    // vec3 tmp = y_dir;
    // y_dir = x_dir;
    // x_dir = tmp;

    // x_dir = normalize(NormalMatrix * inputDir);
    // y_dir = normalize(NormalMatrix * inputDir);

    vec4 base4 = MVMatrix * vec4(center-ldir, 1.0);
    base = base4.xyz / base4.w;

    vec4 top_position = MVMatrix*(vec4(center+ldir,1.0));
    vec4 end4 = top_position;
    end = end4.xyz / end4.w;

    // vec4 foo4 = MVMatrix * vec4(base+ cylinderRadius*normalize(cross( ldir2, cam_dir )), 1.0);
    // vec3 foo = foo4.xyz / foo4.w;

    // vec4 bar4 = MVMatrix * vec4(base + cylinderRadius*normalize(cross( ldir2, ldir )), 1.0);
    // vec3 bar = bar4.xyz / bar4.w;

    // x_dir = normalize(base-foo);
    // y_dir = normalize(base-bar);

    x_dir *= cylinderRadius;
    y_dir *= cylinderRadius;

    // if( b>0.0 )
    //     x_dir *= -1.0;

    // if( b>0.0 ){
    //     vec3 tmp = end;
    //     end = base;
    //     base = tmp;
    // }

    vec4 w = MVMatrix * vec4( 
        center + inputMapping.x*ldir + inputMapping.y*left + inputMapping.z*up, 1.0 
    );
    point = w.xyz / w.w;

    gl_Position = PMatrix * w;    
}




