varying vec2 vClip;

void clipFragment() {
  if (vClip.x < 0.0 || vClip.y < 0.0) discard;
}
