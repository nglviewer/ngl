
#extension GL_ARB_texture_rectangle : enable

varying mat4    matrix_near;
varying vec4        color_atom1;
varying vec4        color_atom2;
varying float       shrink;

varying vec4        prime1;
varying vec4        prime2;

uniform sampler2DRect texturePosition;
uniform sampler2DRect textureColors;
uniform sampler2DRect textureSizes;
uniform sampler2DRect textureShrink;
uniform sampler2DRect textureScale;

void main()
{

    vec4 spaceposition;
    vec3 position_atom1;
    vec3 position_atom2;
    vec4 vertex_position;

    color_atom1 = texture2DRect(textureColors, gl_MultiTexCoord0.xy);
    color_atom2 = texture2DRect(textureColors, gl_MultiTexCoord1.xy);

    shrink = texture2DRect(textureShrink, gl_MultiTexCoord2.xy).x;

    float radius1, radius2;
    float size, scale;
    size = texture2DRect(textureSizes, gl_MultiTexCoord0.xy).x;
    scale = texture2DRect(textureScale, gl_MultiTexCoord2.xy).x;
    radius1 = size * scale * 10.0;
    size = texture2DRect(textureSizes, gl_MultiTexCoord1.xy).x;
    radius2 = size * scale * 10.0;

    position_atom1 = texture2DRect(texturePosition, gl_MultiTexCoord0.xy).xyz;
    position_atom2 = texture2DRect(texturePosition, gl_MultiTexCoord1.xy).xyz;

    // ??? distance( position_atom1, position_atom2 );
    float distance = sqrt( (position_atom1.x - position_atom2.x)*(position_atom1.x - position_atom2.x) + (position_atom1.y - position_atom2.y)*(position_atom1.y - position_atom2.y) + (position_atom1.z - position_atom2.z)*(position_atom1.z - position_atom2.z) );

    spaceposition.z = gl_Vertex.z * distance;

    if (radius1 > radius2) {
        spaceposition.y = gl_Vertex.y * 1.5 * radius1;
        spaceposition.x = gl_Vertex.x * 1.5 * radius1;
    } else {
        spaceposition.y = gl_Vertex.y * 1.5 * radius2;
        spaceposition.x = gl_Vertex.x * 1.5 * radius2;
    }
    spaceposition.w = 1.0;




    vec4 e3;
    vec3 e1, e1_temp, e2, e2_temp;

    // Calculation of bond direction: e3
    e3.xyz = normalize(position_atom1-position_atom2);

    // little hack to avoid some problems of precision due to graphic card limitation using float: To improve soon
    if (e3.z == 0.0) { e3.z = 0.0000000000001;}
    if ( (position_atom1.x - position_atom2.x) == 0.0) { position_atom1.x += 0.001;}
    if ( (position_atom1.y - position_atom2.y) == 0.0) { position_atom1.y += 0.001;}
    if ( (position_atom1.z - position_atom2.z) == 0.0) { position_atom1.z += 0.001;}

    // Focus calculation
    vec4 focus;
    focus.x = ( position_atom1.x*position_atom1.x - position_atom2.x*position_atom2.x + ( radius2*radius2 - radius1*radius1 )*e3.x*e3.x/shrink )/(2.0*(position_atom1.x - position_atom2.x));
    focus.y = ( position_atom1.y*position_atom1.y - position_atom2.y*position_atom2.y + ( radius2*radius2 - radius1*radius1 )*e3.y*e3.y/shrink )/(2.0*(position_atom1.y - position_atom2.y));
    focus.z = ( position_atom1.z*position_atom1.z - position_atom2.z*position_atom2.z + ( radius2*radius2 - radius1*radius1 )*e3.z*e3.z/shrink )/(2.0*(position_atom1.z - position_atom2.z));

     // e1 calculation
     e1.x = 1.0;
     e1.y = 1.0;
     e1.z = ( (e3.x*focus.x + e3.y*focus.y + e3.z*focus.z) - e1.x*e3.x - e1.y*e3.y)/e3.z;
     e1_temp = e1 - focus.xyz;
     e1 = normalize(e1_temp);

     // e2 calculation
     e2_temp = e1.yzx * e3.zxy - e1.zxy * e3.yzx;
     e2 = normalize(e2_temp);

     //ROTATION:
     // final form of change of basis matrix:
     mat3 R= mat3(e1.xyz, e2.xyz, e3.xyz);
     // Apply rotation and translation to the bond primitive
     vertex_position.xyz = R*spaceposition.xyz;
     vertex_position.w = 1.0;

    // TRANSLATION:
    vertex_position.x +=  (position_atom1.x+position_atom2.x)/2.0;
    vertex_position.y +=  (position_atom1.y+position_atom2.y)/2.0;
    vertex_position.z +=  (position_atom1.z+position_atom2.z)/2.0;

    // New position
    gl_Position = (gl_ModelViewProjectionMatrix*vertex_position);





    vec4 i_near, i_far;

    // Calcul near from position
    vec4 near = gl_Position ;
    near.z = 0.0 ;
    near = (gl_ModelViewProjectionMatrixInverse*near) ;
    i_near = near;
    //i_near = vec4(1.0,1.0,1.0,1.0);

    // Calcul far from position
    vec4 far = gl_Position ;
    far.z = far.w ;
    i_far = (gl_ModelViewProjectionMatrixInverse*far) ;
    //i_far = vec4(1.0,1.0,1.0,1.0);


    prime1.xyz = position_atom1 - (position_atom1 - focus.xyz)*shrink;
    prime2.xyz = position_atom2 - (position_atom2 - focus.xyz)*shrink;

    float Rsquare  = (radius1*radius1/shrink) - ( (position_atom1.x - focus.x)*(position_atom1.x - focus.x) + (position_atom1.y - focus.y)*(position_atom1.y - focus.y) + (position_atom1.z - focus.z)*(position_atom1.z - focus.z) );

    focus.w = Rsquare;

    matrix_near = mat4( i_near, i_far, focus, e3 );
}

