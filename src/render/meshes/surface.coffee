Base            = require './base'
SurfaceGeometry = require('../geometry').SurfaceGeometry
Util            = require '../../util'

class Surface extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    {uniforms, position, color, mask, shaded} = options

    uniforms ?= {}
    shaded   ?= true

    hasStyle  = uniforms.styleColor?
    hasHollow = uniforms.surfaceHollow?

    @geometry = new SurfaceGeometry
      width:    options.width
      height:   options.height
      surfaces: options.surfaces
      layers:   options.layers

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    v = factory.vertex

    @_vertexColor v, color, mask

    v.require position if position
    v.require 'mesh.vertex.stpq',     @uniforms
    v.pipe 'surface.position',        @uniforms if !shaded
    v.pipe 'surface.position.normal', @uniforms if  shaded
    v.pipe 'project.position',        @uniforms

    f = factory.fragment

    @_fragmentColor f, hasStyle, shaded, color, mask

    f.pipe 'fragment.color',          @uniforms

    @material = @_material factory.link
      side: THREE.DoubleSide
      index0AttributeName: "position4"

    object = new THREE.Mesh @geometry, @material

    @_raw object
    @objects = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @objects = @geometry = @material = null
    super

module.exports = Surface
