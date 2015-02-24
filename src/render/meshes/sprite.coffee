Base           = require './base'
SpriteGeometry = require('../geometry').SpriteGeometry

class Sprite extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    uniforms = options.uniforms ? {}
    position = options.position
    sprite   = options.sprite
    map      = options.map
    combine  = options.combine
    color    = options.color

    hasStyle = uniforms.styleColor?

    @geometry = new SpriteGeometry
      items:  options.items
      width:  options.width
      height: options.height
      depth:  options.depth

    @_adopt uniforms
    @_adopt @geometry.uniforms

    # Shared vertex shader
    factory = shaders.material()
    v = factory.vertex
    if color
      v.require color
      v.pipe 'mesh.vertex.color',   @uniforms
    v.require position if position
    v.require sprite   if sprite
    v.pipe 'sprite.position',       @uniforms
    v.pipe 'project.position',      @uniforms

    blend = color || hasStyle

    f = factory.fragment
    f.split()                                       if blend
    f  .require map
    f  .pipe 'sprite.fragment',        @uniforms 
    f.next()                                        if blend
    f  .pipe 'style.color',            @uniforms    if hasStyle
    f  .pipe 'mesh.fragment.blend',    @uniforms    if color && hasStyle
    f  .pipe 'mesh.fragment.color',    @uniforms    if color && !hasStyle
    f.join()                                        if blend
    f.pipe combine                                  if combine
    f.pipe Util.GLSL.binaryOperator 'vec4', '*'     if !combine
    f.pipe 'fragment.color',           @uniforms

    @material = @_material factory.link
      side: THREE.DoubleSide
      index0AttributeName: "position4"

    @object = new THREE.Mesh @geometry, @material

    @_raw @object

    @objects = [@object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @objects = @geometry = @material = null
    super

module.exports = Sprite
