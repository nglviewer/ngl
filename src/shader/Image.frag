uniform sampler2D map;
uniform float opacity;

varying vec2 vUv;

void main() {

    gl_FragColor = texture2D( map, vUv );
    // gl_FragColor = texture2D( map, vec2( 0.5, 0.5 ) );
    // gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
    // gl_FragColor = vec4( vUv.x, vUv.y, 0.0, 1.0 );

    // gl_FragColor.a = 1.0;
    gl_FragColor.a *= opacity;

}