uniform vec3 lineColor;
uniform float lineOpacity;

void getLineColor() {
	gl_FragColor = vec4(lineColor, lineOpacity);
}
