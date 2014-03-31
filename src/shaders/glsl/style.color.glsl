uniform vec3 styleColor;
uniform float styleOpacity;

void setStyleColor() {
	gl_FragColor = vec4(styleColor, styleOpacity);
}
