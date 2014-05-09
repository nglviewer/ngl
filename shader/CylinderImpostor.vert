
attribute vec3 mapping;
attribute vec3 position2;
attribute vec3 color;
attribute vec3 color2;
attribute float radius;


varying vec3 vColor;
varying vec3 vColor2;
varying float vRadius;  

varying vec3 point;
varying vec3 axis;
varying vec3 base;
varying vec3 end;
varying vec3 U;
varying vec3 V;
varying float b;


uniform mat4 modelViewMatrixInverse;
uniform float shift;


void main()
{

    vec3 center = ( position + position2 ) / 2.0;
    vec3 dir = normalize( position2 - position );
    float ext = length( position2 - position ) / 2.0;
    vec3 ldir;

    vColor = color;
    vColor2 = color2;
    vRadius = radius;

    // vec3 cam_dir = normalize( cameraPosition - center );
    // needed for jsmol which rotes the model not the camera
    vec3 cam_dir = normalize( (modelViewMatrixInverse*vec4(0,0,0,1)).xyz - center ); 

    b = dot( cam_dir, dir );
    if( b < 0.0 ) // direction vector looks away, so flip
        ldir = -ext * dir;
    else // direction vector already looks in my direction
        ldir = ext * dir;

    vec3 left = normalize( cross( cam_dir, ldir ) );
    vec3 leftShift = shift * left * radius;
    if( b < 0.0 )
        leftShift *= -1.0;
    left = radius * left;
    vec3 up = radius * normalize( cross( left, ldir ) );

    // transform to modelview coordinates
    axis =  normalize( normalMatrix * ldir );
    U = normalize( normalMatrix * up );
    V = normalize( normalMatrix * left );

    vec4 base4 = modelViewMatrix * vec4( center - ldir + leftShift, 1.0 );
    base = base4.xyz / base4.w;

    vec4 top_position = modelViewMatrix * vec4( center + ldir + leftShift, 1.0 );
    vec4 end4 = top_position;
    end = end4.xyz / end4.w;

    vec4 w = modelViewMatrix * vec4( 
        center + leftShift + mapping.x*ldir + mapping.y*left + mapping.z*up, 1.0
    );
    point = w.xyz / w.w;

    gl_Position = projectionMatrix * w;
    
    // move out of viewing frustum to avoid clipping artifacts
    if( gl_Position.z<=1.0 )
        gl_Position.z = -10.0;

}


