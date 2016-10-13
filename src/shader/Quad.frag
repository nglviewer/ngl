varying vec2 vUv;

uniform sampler2D tForeground;
uniform float scale;

void main() {

    vec4 foreground = texture2D( tForeground, vUv );
    gl_FragColor = foreground * scale;

}