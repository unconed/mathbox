uniform vec2 dataResolution;
uniform vec2 dataPointer;

vec2 map2DData(vec2 xy) {
  return fract((xy + dataPointer) * dataResolution);
}
