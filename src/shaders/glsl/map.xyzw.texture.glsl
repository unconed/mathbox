uniform float textureItems;
uniform float textureHeight;

vec2 mapXyzwTexture(vec4 xyzw) {
  
  float x = xyzw.x;
  float y = xyzw.y;
  float z = xyzw.z;
  float i = xyzw.w;
  
  return vec2(i, y) + vec2(x, z) * vec2(textureItems, textureHeight);
}

