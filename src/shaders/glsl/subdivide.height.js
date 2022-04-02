export default /* glsl */ `uniform float subdivideBevel;

// External
vec4 sampleData(vec4 xyzw);

vec4 subdivideHeight(vec4 xyzw) {
  float x = xyzw.y;
  float i = floor(x);
  float f = x - i;

  float minf = subdivideBevel * min(f, 1.0 - f);
  float g = (f > 0.5) ? 1.0 - minf : (f < 0.5) ? minf : 0.5;

  return sampleData(vec4(xyzw.x, i + g, xyzw.zw));
}
`;
