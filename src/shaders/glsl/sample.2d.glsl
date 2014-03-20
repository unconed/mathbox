uniform sampler2D dataTexture;
uniform vec2 dataResolution;
uniform vec2 dataPointer;

vec4 sampleData(vec2 xy) {
  vec2 uv = fract((xy + dataPointer) * dataResolution);
  return texture2D(dataTexture, uv);
}
