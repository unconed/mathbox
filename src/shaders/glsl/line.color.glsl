uniform vec3 lineColor;
uniform float lineOpacity;

void setLineColor() {
	gl_FragColor = vec4(lineColor, lineOpacity);
}
