varying vec2 vClipEnds;

void clipEndsFragment() {
  if (vClipEnds.x < 0.0 || vClipEnds.y < 0.0) discard;
}
