uniform vec3 styleColor;
uniform float styleOpacity;

varying vec3 vNormal;
varying vec3 vLight;
varying vec3 vPosition;

void setStyleColor() {
  
  vec3 color = styleColor * styleColor;
  vec3 color2 = styleColor;

  vec3 normal = normalize(vNormal);
  vec3 light = normalize(vLight);
  vec3 position = normalize(vPosition);
  
  float side    = gl_FrontFacing ? -1.0 : 1.0;
  float cosine  = side * dot(normal, light);
  float diffuse = mix(max(0.0, cosine), .5 + .5 * cosine, .1);
  
  vec3  halfLight = normalize(light + position);
	float cosineHalf = max(0.0, side * dot(normal, halfLight));
	float specular = pow(cosineHalf, 16.0);
	
	gl_FragColor = vec4(sqrt(color * (diffuse * .95 + .05) + .25 * color2 * specular), styleOpacity);
}
