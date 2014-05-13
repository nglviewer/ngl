precision mediump float;
uniform sampler2D diffuse;
varying vec2 texCoord;
void main(void) {
    vec4 color = texture2D(diffuse, texCoord);
    gl_FragColor = vec4(color.rgb, color.a);
}