uniform sampler2D dataTexture;
uniform vec2 dataResolution;
uniform vec2 dataPointer;

vec4 sampleData(vec2 xy) {
  vec2 uv = fract((xy + dataPointer) * dataResolution);
  return vec4(texture2D(dataTexture, uv).xyz, 0.0);
}
