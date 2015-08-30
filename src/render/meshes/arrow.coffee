Base          = require './base'
ArrowGeometry = require('../geometry').ArrowGeometry

class Arrow extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    {uniforms, material, position, color, mask, map, combine, stpq, linear} = options
    uniforms ?= {}

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

    v.pipe @_vertexColor color, mask

    v.require @_vertexPosition position, material, map, 1, stpq
    v.pipe 'arrow.position',        @uniforms
    v.pipe 'project.position',      @uniforms

    factory.fragment = f =
      @_fragmentColor hasStyle, material, color, mask, map, 1, stpq, combine, linear

    f.pipe 'fragment.color',        @uniforms

    @material = @_material factory.link {}

    object = new THREE.Mesh @geometry, @material
    object.frustumCulled = false;
    object.matrixAutoUpdate = false;

    @_raw object
    @renders = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @renders = @geometry = @material = null
    super

module.exports = Arrow
