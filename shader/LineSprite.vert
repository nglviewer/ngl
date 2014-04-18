
attribute lowp vec2 inputMapping;
attribute lowp vec3 inputColor;
attribute lowp vec3 inputColor2;
attribute lowp vec3 inputAxis;
attribute lowp float inputWidth;

varying float dist;
varying lowp vec3 color;
varying lowp vec3 color2;


// void main2(void){
//     colorx = inputColor;

//     vec2 B;
//     vec3 C;
//     if (inputAxis.y != 0.0 || inputAxis.z != 0.0){
//         C = vec3(1.0, 0.0, 0.0);
//     }else{
//         C = vec3(0.0, 1.0, 0.0);
//     }
//     B = normalize(cross(inputAxis, C).xy);

//     vec4 cameraCornerPos = modelViewMatrix * vec4( position, 1.0 );
//     cameraCornerPos.xy += inputMapping * (B.xy * inputWidth);

//     gl_Position = projectionMatrix * cameraCornerPos;
// }


void main(void){
    mat4 MVMatrix = modelViewMatrix;
    mat4 PMatrix = projectionMatrix;
    vec4 EyePoint = vec4( cameraPosition, 1.0 );

    vec3 center = position.xyz;   
    vec3 dir = normalize(inputAxis);
    // float ext = inputCylinderHeight/2.0;
    vec3 ldir;

    vec3 cam_dir = normalize(EyePoint.xyz - center);
    float b = dot(cam_dir, dir);
    if(b<0.0) // direction vector looks away, so flip
        //ldir = -ext*dir;
        ldir = -(length(inputAxis)/2.0) * normalize(inputAxis);
    else // direction vector already looks in my direction
        //ldir = ext*dir;
        ldir = (length(inputAxis)/2.0) * normalize(inputAxis);

    vec3 left = cross(cam_dir, ldir);
    vec3 up = cross(left, ldir);
    left = inputWidth*normalize(left);
    up = inputWidth*normalize(up);

    vec4 w = MVMatrix * vec4( 
        center + inputMapping.x*ldir + inputMapping.y*left, 1.0 
    );

    gl_Position = PMatrix * w;


    vec4 base4 = MVMatrix * vec4(center-ldir, 1.0);
    vec3 base = base4.xyz / base4.w;

    vec4 top_position = MVMatrix*(vec4(center+ldir,1.0));
    vec4 end4 = top_position;
    vec3 end = end4.xyz / end4.w;

    vec3 point = w.xyz / w.w;

    color = inputColor;
    color2 = inputColor2;
    
    // TODO compare without sqrt
    if( distance( point, end ) < distance( point, base ) ){
        dist = b > 0.0 ? 1.0 : 0.0;
    }else{
        dist = b < 0.0 ? 1.0 : 0.0;
    }

}