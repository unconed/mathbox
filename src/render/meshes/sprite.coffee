Base            = require './base'
SpriteGeometry  = require('../geometry').SpriteGeometry

class Sprite extends Base
  constructor: (gl, shaders, options) ->
    super gl, shaders

    uniforms = options.uniforms ? {}
    position = options.position

    @geometry = new SpriteGeometry
      items:  options.items
      width:  options.width
      height: options.height
      depth:  options.depth

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    v = factory.vertex
    v.import position if position
    v.call 'sprite.position',  @uniforms
    v.call 'project.position', @uniforms

    f = factory.fragment
    f.call 'style.color',      @uniforms
    f.call 'fragment.round',   @uniforms

    @material = new THREE.ShaderMaterial factory.build
      side: THREE.DoubleSide
      defaultAttributeValues: null
      index0AttributeName: "position4"

    window.material = @material

    object = new THREE.Mesh @geometry, @material
    object.frustumCulled = false;
    object.matrixAutoUpdate = false;

    @objects = [object]

  show: (transparent) ->
    for object in @objects
      object.visible = true
      object.material.transparent = true

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @objects = @geometry = @material = null
    super

module.exports = Sprite
