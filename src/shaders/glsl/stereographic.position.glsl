uniform float stereoBend;

uniform mat4 viewMatrix;

vec4 getStereoPosition(vec4 position, inout vec4 stpq) {
  if (stereoBend > 0.0001) {

    vec3 pos = position.xyz;
    float r = length(pos);
    float z = r + pos.z;
    vec3 project = vec3(pos.xy / z, r);
    
    vec3 lerped = mix(pos, project, stereoBend);

    return viewMatrix * vec4(lerped, 1.0);
  }
  else {
    return viewMatrix * vec4(position.xyz, 1.0);
  }
}