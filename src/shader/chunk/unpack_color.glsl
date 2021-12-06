vec3 unpackColor(float f) {
    vec3 color;
    color.r = floor(f / 256.0 / 256.0);
    color.g = floor((f - color.r * 256.0 * 256.0) / 256.0);
    color.b = floor(f - color.r * 256.0 * 256.0 - color.g * 256.0);
    return color / 255.0;
}