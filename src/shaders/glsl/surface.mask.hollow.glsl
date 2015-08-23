attribute vec4 position4;

float getSurfaceHollowMask(vec4 xyzw) {
  vec4 df = abs(fract(position4) - .5);
  vec2 df2 = min(df.xy, df.zw);
  float df3 = min(df2.x, df2.y);
  return df3;
}