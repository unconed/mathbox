Base          = require './base'
ArrowGeometry = require('../geometry').ArrowGeometry

class Arrow extends Base
  constructor: (gl, shaders, options) ->
    super gl, shaders

    uniforms = options.uniforms ? {}
    position = options.position

    @geometry = new ArrowGeometry
      sides:   options.sides
      samples: options.samples
      strips:  options.strips
      ribbons: options.ribbons
      layers:  options.layers
      anchor:  options.anchor
      flip:    options.flip

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    v = factory.vertex
    v.import position if position
    v.call 'arrow.position',   @uniforms
    v.call 'project.position', @uniforms

    f = factory.fragment
    f.call 'style.color',      @uniforms

    @material = new THREE.ShaderMaterial factory.build
      defaultAttributeValues: null
      index0AttributeName: "position4"

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
