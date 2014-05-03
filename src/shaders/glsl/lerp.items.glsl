uniform float itemsOut;
uniform float itemsIn;
uniform float itemsIn1;
uniform float itemsRatio;

// External
vec4 sampleData(vec2 xy);

vec4 lerpItems(vec2 xy) {
  float x = xy.x * itemsOut;
  float i = floor(x);
  float f = x - i;

  float x2 = f * itemsRatio;
  float i2 = min(itemsIn1, floor(x2));
  float f2 = i2 - x2;

  float i3 = i * itemsIn + i2;
    
  vec2 xy1 = vec2(i3, xy.y);
  vec2 xy2 = vec2(i3 + 1.0, xy.y);
  
  vec4 a = sampleData(xy1);
  vec4 b = sampleData(xy2);

  return mix(a, b, f2);
}
