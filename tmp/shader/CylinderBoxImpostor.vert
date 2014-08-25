
attribute vec3 mapping;
attribute vec3 color;
attribute vec3 color2;
attribute float radius;

attribute vec3 inputQ;
attribute vec3 inputR;


varying vec3 vColor;
varying vec3 vColor2;
varying float vRadius;
varying vec3 point;

varying vec3 q;
varying vec3 r;



void main()
{

    vColor  = color;
    vColor2  = color2;
    vRadius = radius;

    q = inputQ;
    r = inputR;

    vec3  qr = normalize( r - q );
    vec3   c = ( q + r ) / 2.0;

    vec3 oqr1 = vec3( 0.0, 0.0, 1.0 );

    if( dot( oqr1, qr ) > 0.999 )
        oqr1 = vec3( 0.0, 1.0, 0.0 );

    vec3 oqr2 = normalize( cross( qr, oqr1 ) );
    oqr1 = normalize( cross( oqr2, qr ) );

    qr *= length( r - q ) / 2.0;
    oqr1 *= vRadius;
    oqr2 *= vRadius;

    point = vec3( 
        ( ( q + r ) / 2.0 ) +
        mapping.x * oqr1 +
        mapping.y * qr +
        mapping.z * oqr2
    );
    
    vec4 cameraPos = modelViewMatrix * vec4( point, 1.0 );
    
    gl_Position = projectionMatrix * vec4( cameraPos.xyz, 1.0 );

}


