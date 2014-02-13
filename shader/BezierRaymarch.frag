#extension GL_EXT_frag_depth : enable

uniform mat4 projectionMatrix;

// http://glsl.heroku.com/e#5007.0

// quadratic bezier curve evaluation
// From "Random-Access Rendering of General Vector Graphics"
// posted by Trisomie21

varying vec3 p0;
varying vec3 p1;
varying vec3 p2;

varying vec3 mapping;
varying mat3 cameraToCylinder;
varying vec3 color;
varying vec3 cylinderCenter;
varying vec3 cylinderAxis;
varying float cylinderRadius;
varying float cylinderHeight;
varying float bezierRadius;

varying vec3 point;
varying vec3 axis;
varying vec3 base;
varying vec3 end;
varying vec3 U;
varying vec3 V;
varying float b;


#define PI     3.14159265358979323846264338
#define TWOPI (2.0*PI)


#include light_params

#include fog_params


const float MAXD = 10000.0;


float det(vec2 a, vec2 b) 
{
    return a.x*b.y-b.x*a.y;
}

// http://research.microsoft.com/en-us/um/people/hoppe/ravg.pdf
// https://www.shadertoy.com/view/ldj3Wh
vec3 get_distance_vector3( vec2 b0, vec2 b1, vec2 b2 ) 
{
  float a =     det(b0,b2);
  float b = 2.0*det(b1,b0);
  float d = 2.0*det(b2,b1);
  float f = b*d - a*a;
  vec2  d21 = b2-b1;
  vec2  d10 = b1-b0;
  vec2  d20 = b2-b0;
  vec2  gf = 2.0*(b*d21+d*d10+a*d20);
        gf = vec2(gf.y,-gf.x);
  vec2  pp = -f*gf/dot(gf,gf);
  vec2  d0p = b0-pp;
  float ap = det(d0p,d20);
  float bp = 2.0*det(d10,d0p);
  float t = clamp( (ap+bp)/(2.0*a+b+d), 0.0 ,1.0 );
  return vec3( mix(mix(b0,b1,t), mix(b1,b2,t),t), t );
}


const int MAX_RAYMARCH_ITER = 200;
const float MIN_RAYMARCH_DELTA = 0.001;

void raymarch(in vec3 ray_start, in vec3 ray_dir, 
                out float dist, out vec3 p, out int iterations, out vec3 normal) {

    // put into vertex shader
    vec3 a = p0;
    vec3 b = p1+(p1-((p0+p2)*0.5));
    vec3 c = p2;

    vec3 w = normalize( cross( c-b, a-b ) );
    vec3 u = normalize( c-b );
    vec3 v = normalize( cross( w, u ) );

    vec2 a2 = vec2( dot(a-b,u), dot(a-b,v) );
    vec2 b2 = vec2( 0.0 );
    vec2 c2 = vec2( dot(c-b,u), dot(c-b,v) );
    //

    dist = 0.0;
    iterations = 0;
    float minStep = 0.001;
    float mapDist;
    vec3 p3;
    vec3 cp;

    for (int i = 1; i <= MAX_RAYMARCH_ITER; i++) {
        p = ray_start + ray_dir * dist;
        p3 = vec3( dot(p-b,u), dot(p-b,v), dot(p-b,w) );
        cp = get_distance_vector3( a2-p3.xy, b2-p3.xy, c2-p3.xy );
        mapDist = sqrt(dot(cp.xy,cp.xy)+p3.z*p3.z) - bezierRadius;
        if (mapDist <= MIN_RAYMARCH_DELTA) {
            // normal is wrong
            normal = -vec3(cp.xy, p3.z);
            iterations = i;
            break;
        }else if(dist >= cylinderHeight){
            break;
        }else{
            dist += max( mapDist, minStep );
        }
    }
}

void main(void)
{

    float d;
    vec3 p;
    int iterations;
    vec3 normal = vec3( 0.5, 0.0, 0.0 );
    raymarch(point, normalize( point ), d, p, iterations, normal);
    if( iterations==0 )
        discard;

    vec4 clipPos = projectionMatrix * vec4(p, 1.0);
    float ndcDepth = clipPos.z / clipPos.w;
    float depth2 = ((gl_DepthRange.diff * ndcDepth) + gl_DepthRange.near + gl_DepthRange.far) / 2.0;
    gl_FragDepthEXT = depth2;


    vec3 transformedNormal = normalize( normal );
    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );
    
    #include light

    gl_FragColor.xyz = color;
    gl_FragColor.xyz *= vLightFront;

    #include fog
}

void main2(void)
{
    gl_FragColor = vec4( color, 1.0 );
}



