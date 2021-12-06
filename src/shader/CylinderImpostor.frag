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

    // The coordinates of the fragment, somewhere on the aligned mapped box
    vec3 ray_target = w.xyz / w.w;

    // unpack variables
    vec3 base = base_radius.xyz; // center of the base (far end), in modelView space 
    float vRadius = base_radius.w; // radius in model view space
    vec3 end = end_b.xyz; // center of the end (near end) in modelView
    float b = end_b.w; // b is flag to decide if we're flipping this cylinder (see vertex shader)

    vec3 ray_origin = vec3(0.0); // Camera position for perspective mode
    vec3 ortho_ray_direction =  vec3(0.0, 0.0, 1.0); // Ray is cylinder -> camera
    vec3 persp_ray_direction = normalize(ray_origin - ray_target); // Ditto
 
    vec3 ray_direction = mix(persp_ray_direction, ortho_ray_direction, ortho);
    
    // basis is the rotation matrix for cylinder-aligned coords -> modelView
    // (or post-multiply to reverse, see below)
    mat3 basis = mat3( U, V, axis );

    // diff is vector from center of cylinder to target
    vec3 diff = ray_target - 0.5 * (base + end);
    
    // P is point transformed back to cylinder-aligned (post-multiplied)
    vec3 P = diff * basis;

    // angle (cos) between cylinder cylinder_axis and ray direction
    // axis looks towards camera (see vertex shader)
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
    if (d < 0.0) {
        // Point outside of the cylinder, becomes significant in perspective mode when camera is close
        // to the cylinder
        discard;
    }
    float dist = (-a1 + sqrt(d)) / a2;

    // point of intersection on cylinder surface (how far 'behind' the box surface the curved section of the cylinder would be)
    vec3 surface_point = ray_target + dist * ray_direction;

    vec3 base_to_surface = surface_point - base;
    // Calculates surface normal (of cylinder side) by finding point along cylinder axis in line with tmp_point
    vec3 _normal = normalize( base_to_surface - axis * dot(base_to_surface, axis) );

    // test caps
    float base_cap_test = dot( base_to_surface, axis );
    float end_cap_test = dot((surface_point - end), axis);

    // to calculate caps, simply check the angle between
    // the point of intersection - cylinder end vector
    // and a cap plane normal (which is the cylinder cylinder_axis)
    // if the angle < 0, the point is outside of cylinder
    // test base cap

    #ifndef CAP
        vec3 new_point2 = ray_target + ( (-a1 - sqrt(d)) / a2 ) * ray_direction;
        vec3 tmp_point2 = new_point2 - base;
    #endif

    // flat
    if (base_cap_test < 0.0) // The (extended) surface point falls outside the cylinder - beyond the base (away from camera)
    {
        // ray-plane intersection
        // Ortho mode - surface point is ray_target
        float dNV;
        float near;
        vec3 front_point;
        if ( ortho == 1.0 ) {
            front_point = ray_target;
        } else {
            dNV = dot(-axis, ray_direction);
            // @fredludlow: Explicit discard is not required here?
            // if (dNV < 0.0) {
            //     discard;
            // }
            near = dot(-axis, (base)) / dNV;
            front_point = ray_direction * near + ray_origin;
        }
        // within the cap radius?
        if (dot(front_point - base, front_point-base) > radius2) {
            discard;
        }

        #ifdef CAP
            surface_point = front_point;
            _normal = axis;
        #else
            // Calculate interior point
            surface_point = ray_target + ( (-a1 - sqrt(d)) / a2 ) * ray_direction;
            dNV = dot(-axis, ray_direction);
            near = dot(axis, end) / dNV;
            new_point2 = ray_direction * near + ray_origin;
            if (dot(new_point2 - end, new_point2-base) < radius2) {
                discard;
            }
            interior = true;
        #endif
    }

    // test end cap


    // flat
    if( end_cap_test > 0.0 )
    {
        // @fredludlow: NOTE: Perspective and ortho behaviour is quite different here. In perspective mode
        // it is possible to see the inside face of the mapped aligned box and these points should be 
        // discarded. This occcurs when the camera is focused on one end of the cylinder and the cylinder
        // is not quite in line with the camera (In orthographic mode this view is not possible).
        // It is also possible to see the back face of the near (end) cap when looking nearly side-on.
        float dNV;
        float near;
        vec3 end_point;
        if ( ortho == 1.0 ) {
            end_point = ray_target;
        } else {   
            dNV = dot(axis, ray_direction);
            if (dNV < 0.0) {
                // Viewing inside/back face of end-cap
                discard;
            }
            near = dot(axis, end) / dNV;
            end_point = ray_direction * near + ray_origin;
        }
        
        // within the cap radius?
        if( dot(end_point - end, end_point-base) > radius2 ) {
            discard;

        }
        #ifdef CAP
            surface_point = end_point;
            _normal = axis;
        #else
            // Looking down the tube at an interior point, but check to see if interior point is 
            // within range:
            surface_point = ray_target + ( (-a1 - sqrt(d)) / a2 ) * ray_direction;
            dNV = dot(-axis, ray_direction);
            near = dot(-axis, (base)) / dNV;
            new_point2 = ray_direction * near + ray_origin;
            if (dot(new_point2 - base, new_point2-base) < radius2) {
                // Looking down the tube, which should be open-ended
                discard;
            }
            interior = true;
        #endif
    }

    gl_FragDepthEXT = calcDepth( surface_point );
    

    #ifdef NEAR_CLIP
        if( calcClip( surface_point ) > 0.0 ){
            dist = (-a1 - sqrt(d)) / a2;
            surface_point = ray_target + dist * ray_direction;
            if( calcClip( surface_point ) > 0.0 ) {
                discard;
            }
            interior = true;
            gl_FragDepthEXT = calcDepth( surface_point );
            if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = max( 0.0, calcDepth( vec3( - ( clipNear - 0.5 ) ) ) + ( 0.0000001 / vRadius ) );
            }
        }else if( gl_FragDepthEXT <= 0.0 ){
            dist = (-a1 - sqrt(d)) / a2;
            surface_point = ray_target + dist * ray_direction;
            interior = true;
            gl_FragDepthEXT = calcDepth( surface_point );
            if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = 0.0 + ( 0.0000001 / vRadius );
            }
        }
    #else
        if( gl_FragDepthEXT <= 0.0 ){
            dist = (-a1 - sqrt(d)) / a2;
            surface_point = ray_target + dist * ray_direction;
            interior = true;
            gl_FragDepthEXT = calcDepth( surface_point );
            if( gl_FragDepthEXT >= 0.0 ){
                gl_FragDepthEXT = 0.0 + ( 0.0000001 / vRadius );
            }
        }
    #endif

    // this is a workaround necessary for Mac
    // otherwise the modified fragment won't clip properly
    if (gl_FragDepthEXT < 0.0) {
        discard;
    }
    if (gl_FragDepthEXT > 1.0) {
        discard;
    }

    #ifdef PICKING

        if( opacity < 0.3 )
            discard;
        gl_FragColor = vec4( vPickingColor, objectId );

    #else

        vec3 vViewPosition = -surface_point;
        vec3 vNormal = _normal;
        vec3 vColor;

        if( distSq3( surface_point, end ) < distSq3( surface_point, base ) ){
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