#define STANDARD
#define IMPOSTOR

// Copyright (C) 2010-2011 by
// Laboratoire de Biochimie Theorique (CNRS),
// Laboratoire d'Informatique Fondamentale d'Orleans (Universite d'Orleans), (INRIA) and
// Departement des Sciences de la Simulation et de l'Information (CEA).
//
// License: CeCILL-C license (http://www.cecill.info/)
//
// Contact: Marc Baaden
// E-mail: baaden@smplinux.de
// Webpage: http://hyperballs.sourceforge.net

// Contributions by Alexander Rose
// - ported to WebGL
// - dual color
// - picking color
// - custom clipping
// - three.js lighting

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 interiorColor;
uniform float interiorDarkening;
uniform float roughness;
uniform float metalness;
uniform float opacity;
uniform float clipNear;
uniform float shrink;
uniform mat4 modelViewMatrix;
uniform mat4 modelViewProjectionMatrix;
uniform mat4 modelViewMatrixInverseTranspose;
uniform mat4 projectionMatrix;

varying mat4 matrix_near;
varying vec4 prime1;
varying vec4 prime2;
varying float vRadius;
varying float vRadius2;

#ifdef PICKING
    uniform float objectId;
    varying vec3 vPickingColor;
#else
    varying vec3 vColor1;
    varying vec3 vColor2;
    #include common
    #include fog_pars_fragment
    #include bsdfs
    #include lights_pars_begin
    #include lights_physical_pars_fragment
#endif

bool interior = false;

float calcClip( vec4 cameraPos ){
    return dot( cameraPos, vec4( 0.0, 0.0, 1.0, clipNear - 0.5 ) );
}

float calcClip( vec3 cameraPos ){
    return calcClip( vec4( cameraPos, 1.0 ) );
}

float calcDepth( in vec3 cameraPos ){
    vec2 clipZW = cameraPos.z * projectionMatrix[2].zw + projectionMatrix[3].zw;
    return 0.5 + 0.5 * clipZW.x / clipZW.y;
}

struct Ray {
    vec3 origin ;
    vec3 direction ;
};

bool cutoff_plane (vec3 M, vec3 cutoff, vec3 x3){
    float a = x3.x;
    float b = x3.y;
    float c = x3.z;
    float d = -x3.x*cutoff.x-x3.y*cutoff.y-x3.z*cutoff.z;
    float l = a*M.x+b*M.y+c*M.z+d;
    if (l<0.0) {return true;}
    else{return false;}
}

vec3 isect_surf(Ray r, mat4 matrix_coef){
    vec4 direction = vec4(r.direction, 0.0);
    vec4 origin = vec4(r.origin, 1.0);
    float a = dot(direction,(matrix_coef*direction));
    float b = dot(origin,(matrix_coef*direction));
    float c = dot(origin,(matrix_coef*origin));
    float delta =b*b-a*c;
    gl_FragColor.a = 1.0;
    if (delta<0.0){
        discard;
        // gl_FragColor.a = 0.5;
    }
    float t1 =(-b-sqrt(delta))/a;

    // Second solution not necessary if you don't want
    // to see inside spheres and cylinders, save some fps
    //float t2 = (-b+sqrt(delta)) / a  ;
    //float t =(t1<t2) ? t1 : t2;

    return r.origin+t1*r.direction;
}

vec3 isect_surf2(Ray r, mat4 matrix_coef){
    vec4 direction = vec4(r.direction, 0.0);
    vec4 origin = vec4(r.origin, 1.0);
    float a = dot(direction,(matrix_coef*direction));
    float b = dot(origin,(matrix_coef*direction));
    float c = dot(origin,(matrix_coef*origin));
    float delta =b*b-a*c;
    gl_FragColor.a = 1.0;
    if (delta<0.0){
        discard;
        // gl_FragColor.a = 0.5;
    }
    float t2 =(-b+sqrt(delta))/a;

    return r.origin+t2*r.direction;
}

Ray primary_ray(vec4 near1, vec4 far1){
    vec3 near=near1.xyz/near1.w;
    vec3 far=far1.xyz/far1.w;
    return Ray(near,far-near);
}

float update_z_buffer(vec3 M, mat4 ModelViewP){
    float  depth1;
    vec4 Ms=(ModelViewP*vec4(M,1.0));
    return depth1=(1.0+Ms.z/Ms.w)/2.0;
}

void main(){

    float radius = max( vRadius, vRadius2 );

    vec4 i_near, i_far, focus;
    vec3 e3, e1, e1_temp, e2;

    i_near = vec4(matrix_near[0][0],matrix_near[0][1],matrix_near[0][2],matrix_near[0][3]);
    i_far  = vec4(matrix_near[1][0],matrix_near[1][1],matrix_near[1][2],matrix_near[1][3]);
    focus = vec4(matrix_near[2][0],matrix_near[2][1],matrix_near[2][2],matrix_near[2][3]);
    e3 = vec3(matrix_near[3][0],matrix_near[3][1],matrix_near[3][2]);

    e1.x = 1.0;
    e1.y = 1.0;
    e1.z = ( (e3.x*focus.x + e3.y*focus.y + e3.z*focus.z) - e1.x*e3.x - e1.y*e3.y)/e3.z;
    e1_temp = e1 - focus.xyz;
    e1 = normalize(e1_temp);

    e2 = normalize(cross(e1,e3));

    vec4 equation = focus;

    float shrinkfactor = shrink;
    float t1 = -1.0/(1.0-shrinkfactor);
    float t2 = 1.0/(shrinkfactor);
    // float t3 = 2.0/(shrinkfactor);

    vec4 colonne1, colonne2, colonne3, colonne4;
    mat4 mat;

    vec3 equation1 = vec3(t2,t2,t1);

    float A1 = - e1.x*equation.x - e1.y*equation.y - e1.z*equation.z;
    float A2 = - e2.x*equation.x - e2.y*equation.y - e2.z*equation.z;
    float A3 = - e3.x*equation.x - e3.y*equation.y - e3.z*equation.z;

    float A11 = equation1.x*e1.x*e1.x +  equation1.y*e2.x*e2.x + equation1.z*e3.x*e3.x;
    float A21 = equation1.x*e1.x*e1.y +  equation1.y*e2.x*e2.y + equation1.z*e3.x*e3.y;
    float A31 = equation1.x*e1.x*e1.z +  equation1.y*e2.x*e2.z + equation1.z*e3.x*e3.z;
    float A41 = equation1.x*e1.x*A1   +  equation1.y*e2.x*A2   + equation1.z*e3.x*A3;

    float A22 = equation1.x*e1.y*e1.y +  equation1.y*e2.y*e2.y + equation1.z*e3.y*e3.y;
    float A32 = equation1.x*e1.y*e1.z +  equation1.y*e2.y*e2.z + equation1.z*e3.y*e3.z;
    float A42 = equation1.x*e1.y*A1   +  equation1.y*e2.y*A2   + equation1.z*e3.y*A3;

    float A33 = equation1.x*e1.z*e1.z +  equation1.y*e2.z*e2.z + equation1.z*e3.z*e3.z;
    float A43 = equation1.x*e1.z*A1   +  equation1.y*e2.z*A2   + equation1.z*e3.z*A3;

    float A44 = equation1.x*A1*A1 +  equation1.y*A2*A2 + equation1.z*A3*A3 - equation.w;

    colonne1 = vec4(A11,A21,A31,A41);
    colonne2 = vec4(A21,A22,A32,A42);
    colonne3 = vec4(A31,A32,A33,A43);
    colonne4 = vec4(A41,A42,A43,A44);

    mat = mat4(colonne1,colonne2,colonne3,colonne4);

    // Ray calculation using near and far
    Ray ray = primary_ray(i_near,i_far) ;

    // Intersection between ray and surface for each pixel
    vec3 M;
    M = isect_surf(ray, mat);

    // cut the extremities of bonds to superimpose bond and spheres surfaces
    if (cutoff_plane(M, prime1.xyz, -e3) || cutoff_plane(M, prime2.xyz, e3)){ discard; }

    // Transform normal to model space to view-space
    vec4 M1 = vec4(M,1.0);
    vec4 M2 =  mat*M1;
    // vec3 _normal = normalize( ( modelViewMatrixInverseTranspose * M2 ).xyz );
    vec3 _normal = ( modelViewMatrixInverseTranspose * M2 ).xyz;

    // Recalculate the depth in function of the new pixel position
    gl_FragDepthEXT = update_z_buffer(M, modelViewProjectionMatrix) ;

    #ifdef NEAR_CLIP
        if( calcClip( modelViewMatrix * vec4( M, 1.0 ) ) > 0.0 ){
            M = isect_surf2(ray, mat);
            if( calcClip( modelViewMatrix * vec4( M, 1.0 ) ) > 0.0 )
                discard;
            interior = true;
            gl_FragDepthEXT = update_z_buffer(M, modelViewProjectionMatrix) ;
            if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = max( 0.0, calcDepth( vec3( - ( clipNear - 0.5 ) ) ) + ( 0.0000001 / radius ) );
            }
        }else if( gl_FragDepthEXT <= 0.0 ){
            M = isect_surf2(ray, mat);
            interior = true;
            gl_FragDepthEXT = update_z_buffer(M, modelViewProjectionMatrix);
            if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = 0.0 + ( 0.0000001 / radius );
            }
        }
    #else
        if( gl_FragDepthEXT <= 0.0 ){
            M = isect_surf2(ray, mat);
            interior = true;
            gl_FragDepthEXT = update_z_buffer(M, modelViewProjectionMatrix) ;
            if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = 0.0 + ( 0.0000001 / radius );
            }
        }
    #endif

    // cut the extremities of bonds to superimpose bond and spheres surfaces
    if (cutoff_plane(M, prime1.xyz, -e3) || cutoff_plane(M, prime2.xyz, e3)){ discard; }

    if (gl_FragDepthEXT < 0.0)
        discard;
    if (gl_FragDepthEXT > 1.0)
        discard;

    // Mix the color bond in function of the two atom colors
    float distance_ratio = ((M.x-prime2.x)*e3.x + (M.y-prime2.y)*e3.y +(M.z-prime2.z)*e3.z) /
                                distance(prime2.xyz,prime1.xyz);

    #ifdef PICKING

        if( opacity < 0.3 )
            discard;
        gl_FragColor = vec4( vPickingColor, objectId );

    #else

        vec3 vViewPosition = -( modelViewMatrix * vec4( M, 1.0 ) ).xyz;
        vec3 vNormal = _normal;
        vec3 vColor;

        if( distance_ratio>0.5 ){
            vColor = vColor1;
        }else{
            vColor = vColor2;
        }

        vec4 diffuseColor = vec4( diffuse, opacity );
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveLight = emissive;

        #include color_fragment
        #include roughnessmap_fragment
        #include metalnessmap_fragment

        // don't use #include normal_fragment_begin
        vec3 normal = normalize( vNormal );
        vec3 geometryNormal = normal;

        #include lights_physical_fragment
        #include lights_fragment_begin
        #include lights_fragment_end

        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveLight;

        if( interior ){
            #ifdef USE_INTERIOR_COLOR
                outgoingLight.xyz = interiorColor;
            #else
                #ifdef DIFFUSE_INTERIOR
                    outgoingLight.xyz = vColor;
                #endif
            #endif
            outgoingLight.xyz *= 1.0 - interiorDarkening;
        }

        gl_FragColor = vec4( outgoingLight, diffuseColor.a );

        #include premultiplied_alpha_fragment
        #include tonemapping_fragment
        #include encodings_fragment
        #include fog_fragment

    #endif

}