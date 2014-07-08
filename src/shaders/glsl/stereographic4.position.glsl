uniform float stereoBend;
uniform vec4 basisScale;
uniform vec4 basisOffset;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

vec4 getStereographic4Position(vec4 position) {
  
  vec4 stereo;
  if (stereoBend > 0.0001) {

    float r = length(position);
    float w = r + position.w;
    vec4 project = vec4(position.xyz / w, r);
    
    stereo = mix(position, project, stereoBend);
  }
  else {
    stereo = position;
  }

  vec4 pos4 = stereo * basisScale - basisOffset;
  vec3 pos3 = (projectionMatrix * pos4).xyz;
  return viewMatrix * vec4(pos3, 1.0);
}
