#define STANDARD
#define IMPOSTOR

// Open-Source PyMOL is Copyright (C) Schrodinger, LLC.
//
//  All Rights Reserved
//
//  Permission to use, copy, modify, distribute, and distribute modified
//  versions of this software and its built-in documentation for any
//  purpose and without fee is hereby granted, provided that the above
//  copyright notice appears in all copies and that both the copyright
//  notice and this permission notice appear in supporting documentation,
//  and that the name of Schrodinger, LLC not be used in advertising or
//  publicity pertaining to distribution of the software without specific,
//  written prior permission.
//
//  SCHRODINGER, LLC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,
//  INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN
//  NO EVENT SHALL SCHRODINGER, LLC BE LIABLE FOR ANY SPECIAL, INDIRECT OR
//  CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
//  OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
//  OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE
//  USE OR PERFORMANCE OF THIS SOFTWARE.

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
uniform mat4 projectionMatrix;
uniform float ortho;

varying vec3 axis;
varying vec4 base_radius;
varying vec4 end_b;
varying vec3 U;
varying vec3 V;
varying vec4 w;

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

float distSq3( vec3 v3a, vec3 v3b ){
    return (
        ( v3a.x - v3b.x ) * ( v3a.x - v3b.x ) +
        ( v3a.y - v3b.y ) * ( v3a.y - v3b.y ) +
        ( v3a.z - v3b.z ) * ( v3a.z - v3b.z )
    );
}

// Calculate depth based on the given camera position.
float calcDepth( in vec3 cameraPos ){
    vec2 clipZW = cameraPos.z * projectionMatrix[2].zw + projectionMatrix[3].zw;
    return 0.5 + 0.5 * clipZW.x / clipZW.y;
}

float calcClip( vec3 cameraPos ){
    return dot( vec4( cameraPos, 1.0 ), vec4( 0.0, 0.0, 1.0, clipNear - 0.5 ) );
}

void main(){

    vec3 point = w.xyz / w.w;

    // unpacking
    vec3 base = base_radius.xyz;
    float vRadius = base_radius.w;
    vec3 end = end_b.xyz;
    float b = end_b.w;

    vec3 end_cyl = end;
    vec3 surface_point = point;

    vec3 ray_target = surface_point;
    vec3 ray_origin = vec3(0.0);
    vec3 ray_direction = mix(normalize(ray_origin - ray_target), vec3(0.0, 0.0, 1.0), ortho);
    mat3 basis = mat3( U, V, axis );

    vec3 diff = ray_target - 0.5 * (base + end_cyl);
    vec3 P = diff * basis;

    // angle (cos) between cylinder cylinder_axis and ray direction
    float dz = dot( axis, ray_direction );

    float radius2 = vRadius*vRadius;

    // calculate distance to the cylinder from ray origin
    vec3 D = vec3(dot(U, ray_direction),
                dot(V, ray_direction),
                dz);
    float a0 = P.x*P.x + P.y*P.y - radius2;
    float a1 = P.x*D.x + P.y*D.y;
    float a2 = D.x*D.x + D.y*D.y;

    // calculate a dicriminant of the above quadratic equation
    float d = a1*a1 - a0*a2;
    if (d < 0.0)
        // outside of the cylinder
        discard;

    float dist = (-a1 + sqrt(d)) / a2;

    // point of intersection on cylinder surface
    vec3 new_point = ray_target + dist * ray_direction;

    vec3 tmp_point = new_point - base;
    vec3 _normal = normalize( tmp_point - axis * dot(tmp_point, axis) );

    ray_origin = mix( ray_origin, surface_point, ortho );

    // test caps
    float front_cap_test = dot( tmp_point, axis );
    float end_cap_test = dot((new_point - end_cyl), axis);

    // to calculate caps, simply check the angle between
    // the point of intersection - cylinder end vector
    // and a cap plane normal (which is the cylinder cylinder_axis)
    // if the angle < 0, the point is outside of cylinder
    // test front cap

    #ifndef CAP
        vec3 new_point2 = ray_target + ( (-a1 - sqrt(d)) / a2 ) * ray_direction;
        vec3 tmp_point2 = new_point2 - base;
    #endif

    // flat
    if (front_cap_test < 0.0)
    {
        // ray-plane intersection
        float dNV = dot(-axis, ray_direction);
        if (dNV < 0.0)
            discard;
        float near = dot(-axis, (base)) / dNV;
        vec3 front_point = ray_direction * near + ray_origin;
        // within the cap radius?
        if (dot(front_point - base, front_point-base) > radius2)
            discard;

        #ifdef CAP
            new_point = front_point;
            _normal = axis;
        #else
            new_point = ray_target + ( (-a1 - sqrt(d)) / a2 ) * ray_direction;
            dNV = dot(-axis, ray_direction);
            near = dot(axis, end_cyl) / dNV;
            new_point2 = ray_direction * near + ray_origin;
            if (dot(new_point2 - end_cyl, new_point2-base) < radius2)
                discard;
            interior = true;
        #endif
    }

    // test end cap


    // flat
    if( end_cap_test > 0.0 )
    {
        // ray-plane intersection
        float dNV = dot(axis, ray_direction);
        if (dNV < 0.0)
            discard;
        float near = dot(axis, end_cyl) / dNV;
        vec3 end_point = ray_direction * near + ray_origin;
        // within the cap radius?
        if( dot(end_point - end_cyl, end_point-base) > radius2 )
            discard;

        #ifdef CAP
            new_point = end_point;
            _normal = axis;
        #else
            new_point = ray_target + ( (-a1 - sqrt(d)) / a2 ) * ray_direction;
            dNV = dot(-axis, ray_direction);
            near = dot(-axis, (base)) / dNV;
            new_point2 = ray_direction * near + ray_origin;
            if (dot(new_point2 - base, new_point2-base) < radius2)
                discard;
            interior = true;
        #endif
    }

    gl_FragDepthEXT = calcDepth( new_point );

    #ifdef NEAR_CLIP
        if( calcClip( new_point ) > 0.0 ){
            dist = (-a1 - sqrt(d)) / a2;
            new_point = ray_target + dist * ray_direction;
            if( calcClip( new_point ) > 0.0 )
                discard;
            interior = true;
            gl_FragDepthEXT = calcDepth( new_point );
            if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = max( 0.0, calcDepth( vec3( - ( clipNear - 0.5 ) ) ) + ( 0.0000001 / vRadius ) );
            }
        }else if( gl_FragDepthEXT <= 0.0 ){
            dist = (-a1 - sqrt(d)) / a2;
            new_point = ray_target + dist * ray_direction;
            interior = true;
            gl_FragDepthEXT = calcDepth( new_point );
            if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = 0.0 + ( 0.0000001 / vRadius );
            }
        }
    #else
        if( gl_FragDepthEXT <= 0.0 ){
            dist = (-a1 - sqrt(d)) / a2;
            new_point = ray_target + dist * ray_direction;
            interior = true;
            gl_FragDepthEXT = calcDepth( new_point );
            if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = 0.0 + ( 0.0000001 / vRadius );
            }
        }
    #endif

    // this is a workaround necessary for Mac
    // otherwise the modified fragment won't clip properly
    if (gl_FragDepthEXT < 0.0)
        discard;
    if (gl_FragDepthEXT > 1.0)
        discard;

    #ifdef PICKING

        if( opacity < 0.3 )
            discard;
        gl_FragColor = vec4( vPickingColor, objectId );

    #else

        vec3 vViewPosition = -new_point;
        vec3 vNormal = _normal;
        vec3 vColor;

        if( distSq3( new_point, end_cyl ) < distSq3( new_point, base ) ){
            if( b < 0.0 ){
                vColor = vColor1;
            }else{
                vColor = vColor2;
            }
        }else{
            if( b > 0.0 ){
                vColor = vColor1;
            }else{
                vColor = vColor2;
            }
        }

        vec4 diffuseColor = vec4( diffuse, opacity );
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveLight = emissive;

        #include color_fragment
        #include roughnessmap_fragment
        #include metalnessmap_fragment

        // @fredludlow: Previous comment from @arose says don't use normal_fragment_begin
        // though not clear why, but sticking with it. The r118 version of this chunk also
        // defines geometryNormal, so adding that here
        // #include normal_fragment_begin
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