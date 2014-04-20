varying vec2 vClip;

void clipStyle() {
  if (vClip.x < 0.0 || vClip.y < 0.0) discard;
}
