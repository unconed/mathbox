Mesh          = require './mesh'
ArrowGeometry = require('../geometry').ArrowGeometry

class Arrow extends Mesh
  constructor: (gl, shaders, options) ->
    super gl, shaders

    uniforms = options.uniforms ? {}
    position = options.position

    @geometry = new ArrowGeometry
      sides:   options.sides   || 12
      samples: options.samples || 2
      strips:  options.strips  || 1
      ribbons: options.ribbons || 1
      anchor:  options.anchor  || options.samples - 1

    factory = shaders.material()

    v = factory.vertex
    v.import position if position
    v.call 'arrow.position', uniforms
    v.call 'project.position'

    f = factory.fragment
    f.call 'style.color', uniforms

    @material = new THREE.ShaderMaterial factory.build
      defaultAttributeValues: null

    window.material = @material

    @object = new THREE.Mesh @geometry, @material
    @object.frustumCulled = false;
    @object.matrixAutoUpdate = false;

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @object = @geometry = @material = null
    super

module.exports = Arrow
