float matrixScale( in mat4 m ){
    vec4 r = m[ 0 ];
    return sqrt( r[ 0 ] * r[ 0 ] + r[ 1 ] * r[ 1 ] + r[ 2 ] * r[ 2 ] );
}