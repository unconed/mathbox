uniform float stereoBend;
uniform vec4 basisScale;
uniform vec4 basisOffset;
uniform mat4 viewMatrix;
uniform vec2 view4D;

vec4 getStereographic4Position(vec4 position, inout vec4 stpq) {
  
  vec4 transformed;
  if (stereoBend > 0.0001) {

    float r = length(position);
    float w = r + position.w;
    vec4 project = vec4(position.xyz / w, r);
    
    transformed = mix(position, project, stereoBend);
  }
  else {
    transformed = position;
  }

  vec4 pos4 = transformed * basisScale - basisOffset;
  vec3 xyz = (viewMatrix * vec4(pos4.xyz, 1.0)).xyz;
  return vec4(xyz, pos4.w * view4D.y + view4D.x);
}
