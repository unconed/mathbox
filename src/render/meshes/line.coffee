vertexShader = """

/*
//Data sampler

uniform sampler2D dataTexture;
uniform vec2 dataResolution;
uniform vec2 dataPointer;

vec2 mapUV(vec2 xy) {
  return vec2(xy.y, 0);
}

vec4 sampleData(vec2 xy) {
  vec2 uv = fract((mapUV(xy) + dataPointer) * dataResolution);
  vec4 sample = texture2D(dataTexture, uv);
  return transformData(uv, sample);
}

*/

/*
// Grid
uniform vec2 gridRange;
uniform vec4 gridAxis;
uniform vec4 gridOffset;

vec4 transformData(vec2 uv, vec4 data) {
  return vec4(data.r, 0, 0, 0) + gridAxis * uv.x + gridOffset;
}
*/

/*
// Axis
*/
uniform vec4 axisStep;
uniform vec4 axisPosition;

vec4 sampleData(vec2 uv) {
  return axisStep * uv.x + axisPosition;
}

/*
// Viewport
*/
uniform mat4 cartesianMatrix;

vec4 cartesian(vec4 position) {
//  return cartesianMatrix * vec4(position.xyz, 1.0);
  return vec4(position.xyz, 1.0);
}

/*
vec4 cartesian4(vec4 position) {
  return cartesian4Matrix * position;
}
*/

/*
// Pipeline
*/
vec3 worldToView(vec4 position) {
  return (modelViewMatrix * vec4(position.xyz, 1.0)).xyz;
}

vec3 transformToView(vec4 position) {
  return worldToView(cartesian(position));
}

vec3 samplePosition(vec2 xy) {
  vec4 sample = sampleData(xy);
  return transformToView(sample);
}


/*
//Line
*/

void getLineGeometry(vec2 xy, float edge, inout vec3 left, inout vec3 center, inout vec3 right) {
  vec2 step = vec2(1.0, 0.0);

  center = samplePosition(xy);
  left = (edge < -0.5) ? center : samplePosition(xy - step);
  right = (edge > 0.5) ? center : samplePosition(xy + step);
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
    vec3 joinLeft = normalize(cross(normal, legLeft));
    vec3 joinRight = normalize(cross(normal, legRight));
    float dotLR = dot(joinLeft, joinRight);
    float scale = min(8.0, tan(acos(dotLR * .999) * .5) * .5);
    bitangent = normalize(joinLeft + joinRight) * sqrt(1.0 + scale * scale);
  }
  
  return bitangent;
}

uniform float lineWidth;
attribute vec2 line;
//attribute vec3 position;

vec3 getLinePosition() {
  vec3 left, center, right, join;

  float edge = line.x;
  float offset = line.y;

  getLineGeometry(position.xy, edge, left, center, right);
  join = getLineJoin(edge, left, center, right);
  return center + join * offset * lineWidth;
}

////

void projectPosition(vec3 point) {
	vec4 glPosition = projectionMatrix * vec4(point, 1.0);
  gl_Position = glPosition;
}

void main() {
  vec3 position = getLinePosition();
  projectPosition(position);
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
  constructor: (gl, shaders, options) ->
    super gl, shaders

    uniforms = options.uniforms ? {}
    position = options.position

    @geometry = new LineGeometry
      samples: options.samples || 2
      strips:  options.strips  || 1
      ribbons: options.ribbons || 1

    factory = shaders.material()

    v = factory.vertex
    v.import position if position
    v.call 'line.position', uniforms
    v.call 'project.position'

    f = factory.fragment
    f.call 'line.color', uniforms

    @material = new THREE.ShaderMaterial factory.build
      side: THREE.DoubleSide
      defaultAttributeValues: null

    window.material = @material

    @object = new THREE.Mesh @geometry, @material
    @object.frustumCulled = false;

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @object = @geometry = @material = null
    super

module.exports = Line
