Base         = require './base'
FaceGeometry = require('../geometry').FaceGeometry

class Face extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    {uniforms, position, color, mask, shaded} = options

    uniforms ?= {}
    shaded   ?= true

    hasStyle = uniforms.styleColor?

    @geometry = new FaceGeometry
      items:  options.items
      width:  options.width
      height: options.height
      depth:  options.depth

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    v = factory.vertex

    @_vertexColor v, color, mask

    v.require position if position
    v.require 'mesh.vertex.stpq',   @uniforms
    v.pipe 'face.position',         @uniforms if !shaded
    v.pipe 'face.position.normal',  @uniforms if  shaded
    v.pipe 'project.position',      @uniforms

    f = factory.fragment

    @_fragmentColor f, hasStyle, shaded, color, mask

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

module.exports = Face
