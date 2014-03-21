Mesh         = require './mesh'
LineGeometry = require('../geometry').LineGeometry

class Line extends Mesh
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
