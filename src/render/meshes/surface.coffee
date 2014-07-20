Base            = require './base'
SurfaceGeometry = require('../geometry').SurfaceGeometry

class Surface extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders

    uniforms = options.uniforms ? {}
    position = options.position
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
    v.import position if position
    v.split()
    v  .call 'surface.position',        @uniforms if !shaded
    v  .call 'surface.position.normal', @uniforms, '_shade_' if shaded
    v.pass()
    v.call 'project.position',   @uniforms

    f = factory.fragment
    f.call 'style.color',        @uniforms if !shaded
    f.call 'style.color.shaded', @uniforms, '_shade_' if shaded
    f.call 'fragment.color',     @uniforms

    @material = new THREE.ShaderMaterial factory.build
      side: THREE.DoubleSide
      defaultAttributeValues: null
      index0AttributeName: "position4"

    window.material = @material

    object = new THREE.Mesh @geometry, @material
    object.frustumCulled = false;
    object.matrixAutoUpdate = false;

    @objects = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @objects = @geometry = @material = null
    super

module.exports = Surface
