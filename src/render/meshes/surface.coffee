Base            = require './base'
SurfaceGeometry = require('../geometry').SurfaceGeometry

class Surface extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    uniforms = options.uniforms ? {}
    position = options.position
    color    = options.color
    shaded   = options.shaded ? true

    @geometry = new SurfaceGeometry
      width:    options.width
      height:   options.height
      surfaces: options.surfaces
      layers:   options.layers

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    v = factory.vertex
    if color
      v.require color
      v.pipe 'mesh.vertex.color',       @uniforms
    v.require position if position
    v.pipe 'surface.position',          @uniforms if !shaded
    v.pipe 'surface.position.normal',   @uniforms if  shaded
    v.pipe 'project.position',          @uniforms

    f = factory.fragment
    f.pipe 'style.color',               @uniforms if !shaded
    f.pipe 'style.color.shaded',        @uniforms if  shaded
    f.pipe 'mesh.fragment.color',       @uniforms if  color
    f.pipe 'fragment.color',            @uniforms

    @material = new THREE.ShaderMaterial factory.build
      side: THREE.DoubleSide
      defaultAttributeValues: null
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
