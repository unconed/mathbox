vec4 getSample(vec4 xyzw);

float floatStretch(vec4 xyzw, float channelIndex) {
  vec4 sample = getSample(xyzw);
  vec2 xy = channelIndex > 1.5 ? sample.zw : sample.xy;
  return mod(channelIndex, 2.0) > .5 ? xy.y : xy.x;
}