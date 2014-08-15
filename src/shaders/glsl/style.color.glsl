uniform vec3 styleColor;
uniform float styleOpacity;

vec4 getStyleColor() {
  return vec4(styleColor, styleOpacity);
}
