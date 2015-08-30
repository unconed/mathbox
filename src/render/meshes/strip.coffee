Base         = require './base'
StripGeometry = require('../geometry').StripGeometry

class Strip extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    {uniforms, material, position, color, mask, map, combine, linear, stpq} = options

    uniforms ?= {}
    material ?= true

    hasStyle = uniforms.styleColor?

    @geometry = new StripGeometry
      items:  options.items
      width:  options.width
      height: options.height
      depth:  options.depth

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    v = factory.vertex

    v.pipe @_vertexColor color, mask

    v.require @_vertexPosition position, material, map, 2, stpq
    v.pipe 'mesh.position',         @uniforms if !material
    v.pipe 'strip.position.normal', @uniforms if  material
    v.pipe 'project.position',      @uniforms

    factory.fragment = f =
      @_fragmentColor hasStyle, material, color, mask, map, 2, stpq, combine, linear

    f.pipe 'fragment.color',        @uniforms

    @material = @_material factory.link
      side: THREE.DoubleSide

    object = new THREE.Mesh @geometry, @material

    @_raw object
    @renders = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @renders = @geometry = @material = null
    super

module.exports = Strip
