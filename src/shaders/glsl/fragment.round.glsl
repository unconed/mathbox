uniform float pointSize;
varying vec2 vSprite;

void setFragmentColor(vec4 color) {
  float c = dot(vSprite, vSprite);
  if (c > 1.0) {
    discard;
  }

  float alpha = min(1.0, .25 * pointSize * (1.0 - c));
	gl_FragColor = vec4(color.rgb, alpha * color.a);
}
