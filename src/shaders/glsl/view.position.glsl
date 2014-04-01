vec3 getViewPosition(vec4 position) {
  return (viewMatrix * vec4(position.xyz, 1.0)).xyz;
}