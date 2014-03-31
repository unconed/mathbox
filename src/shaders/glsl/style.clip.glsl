varying float vClip;

void clipStyle() {
  if (vClip < 0.0) discard;
}
