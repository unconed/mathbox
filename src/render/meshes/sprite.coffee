Base           = require './base'
SpriteGeometry = require('../geometry').SpriteGeometry

class Sprite extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    uniforms = options.uniforms ? {}
    position = options.position
    color    = options.color

    @geometry = new SpriteGeometry
      items:  options.items
      width:  options.width
      height: options.height
      depth:  options.depth

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    v = factory.vertex
    if color
      v.require color
      v.pipe 'mesh.vertex.color',   @uniforms
    v.require position if position
    v.pipe 'sprite.position',       @uniforms
    v.pipe 'project.position',      @uniforms

    f = factory.fragment
    f.pipe 'style.color',           @uniforms
    f.pipe 'mesh.fragment.color',   @uniforms if color
    f.pipe 'fragment.round',        @uniforms

    @material = new THREE.ShaderMaterial factory.build
      side: THREE.DoubleSide
      defaultAttributeValues: null
      index0AttributeName: "position4"

    object = new THREE.Mesh @geometry, @material

    @_raw object
    @objects = [object]

  show: (transparent, blending, order, depth) ->
    super true, blending, order, depth

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @objects = @geometry = @material = null
    super

module.exports = Sprite
