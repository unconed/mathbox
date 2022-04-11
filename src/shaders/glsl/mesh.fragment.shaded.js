export default /* glsl */ `
#extension GL_OES_standard_derivatives : enable
varying vec3 vNormal;
varying vec3 vLight;
varying vec3 vPosition;

vec3 offSpecular(vec3 color) {
  vec3 c = 1.0 - color;
  return 1.0 - c * c;
}

vec4 getShadedColor(vec4 rgba) {
  
  vec3 color = rgba.xyz;
  vec3 color2 = offSpecular(rgba.xyz);

  vec3 normal = normalize(vNormal);
  vec3 light = normalize(vLight);
  vec3 position = normalize(vPosition);
  
  // Workaround to avoid gl_FrontFacing. See https://github.com/unconed/mathbox/pull/26
  vec3 pdx = dFdx(vPosition);
  vec3 pdy = dFdy(vPosition);
  bool frontFacting = dot(vNormal, cross(pdx, pdy)) > 0.0;

  float side = frontFacting ? 1.0 : -1.0;
  float cosine  = side * dot(normal, light);
  float diffuse = mix(max(0.0, cosine), .5 + .5 * cosine, .1);
  
  vec3  halfLight = normalize(light + position);
	float cosineHalf = max(0.0, side * dot(normal, halfLight));
	float specular = pow(cosineHalf, 16.0);
	
	return vec4(color * (diffuse * .9 + .05) + .25 * color2 * specular, rgba.a);
}
`;
