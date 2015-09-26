Base            = require './base'
SurfaceGeometry = require('../geometry').SurfaceGeometry
Util            = require '../../util'

class Surface extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    {uniforms, material, position, color, mask, map, combine, linear, stpq, intUV} = options

    uniforms ?= {}
    material ?= true

    hasStyle  = uniforms.styleColor?
    hasHollow = uniforms.surfaceHollow?

    @geometry = new SurfaceGeometry
      width:    options.width
      height:   options.height
      surfaces: options.surfaces
      layers:   options.layers
      closedX:  options.closedX
      closedY:  options.closedY

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    v = factory.vertex

    if intUV
      defs =
        POSITION_UV_INT: ''

    v.pipe @_vertexColor color, mask

    v.require @_vertexPosition position, material, map, 2, stpq
    v.pipe 'surface.position',        @uniforms, defs if !material
    v.pipe 'surface.position.normal', @uniforms, defs if  material
    v.pipe 'project.position',        @uniforms

    factory.fragment = f =
      @_fragmentColor hasStyle, material, color, mask, map, 2, stpq, combine, linear

    f.pipe 'fragment.color',          @uniforms

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

module.exports = Surface
