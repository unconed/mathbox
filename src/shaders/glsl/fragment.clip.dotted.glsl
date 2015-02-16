varying float vClipStrokeWidth;
varying float vClipStrokeIndex;
varying vec3  vClipStrokeEven;
varying vec3  vClipStrokeOdd;
varying vec3  vClipStrokePosition;

void clipStrokeFragment() {
  bool odd = mod(vClipStrokeIndex, 2.0) >= 1.0;

  vec3 tangent;
  if (odd) {
    tangent = vClipStrokeOdd;
  }
  else {
    tangent = vClipStrokeEven;
  }

  float travel = dot(vClipStrokePosition, normalize(tangent)) / vClipStrokeWidth;
  if (mod(travel, 4.0) > 2.0) {
    discard;
  }
}
