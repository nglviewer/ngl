attribute vec2 position;
attribute vec2 texture;
varying vec2 texCoord;
void main(void) {
    texCoord = texture;
    gl_Position = vec4(position, 0.0, 1.0);
}