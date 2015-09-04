vec4 lit( float NdotL, float NdotH, float m ){
    float ambient = 1.0;
    float diffuse = max( NdotL, 0.0 );
    float specular = pow( abs( NdotH ), m );
    if( NdotL < 0.0 || NdotH < 0.0 )
        specular = 0.0;
    return vec4( ambient, diffuse, specular, 1.0 );
}