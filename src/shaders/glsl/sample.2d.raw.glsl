uniform sampler2D dataTexture;

vec4 sample2DRaw(vec2 uv) {
  return texture2D(dataTexture, uv);
}
