vertexShader = """

uniform vec2 gridRange;
uniform vec4 gridAxis;
uniform vec4 gridOffset;

vec2 mapUV(vec2 uv) {
  
}

vec4 transformData(vec2 uv, vec4 data) {
  return vec4(data.r, 0, 0, 0) + gridAxis * uv.x + gridOffset;
}

vec3 getViewPos(vec4 position) {
  return (modelViewMatrix * vec4(position.xyz, 1.0)).xyz
}

uniform sampler2D dataTexture;
uniform vec2 dataResolution;
uniform vec2 dataPointer;

uniform float lineWidth;

attribute vec2 line;

vec2 mapUV(vec2 xy) {
  return vec2(xy.y, 0);
}

vec4 sampleData(vec2 xy) {
  vec2 uv = fract((mapUV(xy) + dataPointer) * dataResolution);
  vec4 sample = texture2D(dataTexture, uv);
  return transformData(uv, sample);
}

void getLineGeometry(vec2 xy, float edge, inout vec4 left, inout vec4 center, inout vec4 right) {
  vec2 step = vec2(1.0, 0.0);

  center = sampleData(xy);
  left = (edge < -0.5) ? center : sampleData(xy - step)
  right = (edge > 0.5) ? center : sampleData(xy + step)
}

vec3 getLineJoin(float edge, vec3 left, vec3 center, vec3 right) {
  vec3 bitangent;
  vec3 normal = center;

  vec3 legLeft = center - left;
  vec3 legRight = right - center;

  if (edge > 0.5) {
    bitangent = normalize(cross(normal, legLeft));
  }
  else if (edge < -0.5) {
    bitangent = normalize(cross(normal, legRight));
  }
  else {
    vec3 joinLeft = normalize(cross(joinNormal, legLeft));
    vec3 joinRight = normalize(cross(joinNormal, legRight));
    float scale = min(4.0, tan(acos(dot(joinLeft, joinRight)*.999) * .5) * .5);
    bitangent = normalize(joinLeft + joinRight) * sqrt(1.0 + scale * scale);
  }
  
  return bitangent;
}

void main() {
  float edge = line.x;
  float offset = line.y;

  vec4 left, center, right;
  getLineGeometry(position.xy, edge, left, center, right);

  vec3 viewLeft = getViewPos(left);
  vec3 viewRight = getViewPos(right);
	vec3 viewCenter = getViewPos(center);

  vec3 lineJoin = getLineJoin(edge, left, center, right);

	vec4 glPosition = projectionMatrix * vec4(center + lineJoin * offset * lineWidth, 1.0);

  gl_Position = glPosition;
}

"""

fragmentShader = """
uniform vec3 lineColor;
uniform float lineOpacity;

void main() {
	gl_FragColor = vec4(lineColor, lineOpacity);
}
"""



Renderable = require('../renderable')
LineGeometry = require('../geometry').LineGeometry

class Line extends Renderable
  constructor: (@gl, @options) ->
    map = options.map ? {}
    buffer = options.buffer

    @_map uniforms, ['lineWidth', 'lineColor', 'lineOpacity']

    @geometry = new LineGeometry
      samples: 2
      strips: 1
      ribbons: 1

    @material = new THREE.ShaderMaterial
      attributes: geometry.shaderAttributes()
      uniforms: @uniforms
      vertexShader: vertexShader
      fragmentShader: fragmentShader
      side: THREE.DoubleSide
      defaultAttributeValues: null

    @object = new THREE.Mesh geometry, material
    @object.frustumCulled = false;

  dispose: () ->
    super

module.exports = Line
