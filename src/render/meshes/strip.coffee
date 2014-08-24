Base         = require './base'
StripGeometry = require('../geometry').StripGeometry

class Strip extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    uniforms = options.uniforms ? {}
    position = options.position
    shaded   = options.shaded ? true

    @geometry = new StripGeometry
      items:  options.items
      width:  options.width
      height: options.height
      depth:  options.depth

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    v = factory.vertex
    v.require position if position
    v.split()
    v  .pipe 'mesh.position',         @uniforms if !shaded
    v  .pipe 'strip.position.normal', @uniforms if  shaded
    v.pass()
    v.pipe 'project.position',        @uniforms

    f = factory.fragment
    f.pipe 'style.color',             @uniforms if !shaded
    f.pipe 'style.color.shaded',      @uniforms if  shaded
    f.pipe 'fragment.color',          @uniforms

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

module.exports = Strip
