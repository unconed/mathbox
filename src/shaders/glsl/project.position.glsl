uniform float styleZBias;
uniform float styleZIndex;

void setPosition(vec3 position) {
  vec4 pos = projectionMatrix * vec4(position, 1.0);

  // Apply relative Z bias
  float bias  = (1.0 - styleZBias / 32768.0);
  pos.z *= bias;
  
  // Apply large scale Z index changes
  if (styleZIndex > 0.0) {
    float z = pos.z / pos.w;
    pos.z = ((z + 1.0) / (styleZIndex + 1.0) - 1.0) * pos.w;
  }
  
  gl_Position = pos;
}