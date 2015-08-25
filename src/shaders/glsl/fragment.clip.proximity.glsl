varying float vClipProximity;

void clipProximityFragment() {
  if (vClipProximity >= 0.5) discard;
}