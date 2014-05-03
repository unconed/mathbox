uniform float textureItems;
uniform float textureHeight;

vec2 map2Dxyzi(vec4 xyzi) {
  
  float x = xyzi.x;
  float y = xyzi.y;
  float z = xyzi.z;
  float i = xyzi.w;
  
  return vec2(i + x * textureItems, y + z * textureHeight);
}

