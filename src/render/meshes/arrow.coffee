Base          = require './base'
ArrowGeometry = require('../geometry').ArrowGeometry

class Arrow extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    uniforms = options.uniforms ? {}
    position = options.position
    color    = options.color
    mask     = options.mask

    hasStyle = uniforms.styleColor?

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

    @_vertexColor v, color, mask

    v.require position if position
    v.require 'mesh.vertex.stpq',   @uniforms
    v.pipe 'arrow.position',        @uniforms
    v.pipe 'project.position',      @uniforms

    f = factory.fragment

    @_fragmentColor f, hasStyle, false, color, mask

    f.pipe 'fragment.color',        @uniforms

    @material = @_material factory.link
      index0AttributeName: "position4"

    object = new THREE.Mesh @geometry, @material
    object.frustumCulled = false;
    object.matrixAutoUpdate = false;

    @_raw object
    @objects = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @objects = @geometry = @material = null
    super

module.exports = Arrow
