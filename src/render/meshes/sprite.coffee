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
    mask     = options.mask

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

    @_vertexColor v, color, mask

    v.require position if position
    v.require 'mesh.vertex.stpq',   @uniforms
    v.require sprite   if sprite
    v.pipe 'sprite.position',       @uniforms
    v.pipe 'project.position',      @uniforms

    # Shared fragment shader
    f = factory.fragment

    blend = color || mask || hasStyle

    f.split()                                       if blend
    f  .require map
    f  .pipe 'sprite.fragment',        @uniforms
    f.next()                                        if blend

    @_fragmentColor f, hasStyle, false, color, mask

    f.join()                                        if blend
    f.pipe combine                                  if combine
    f.pipe Util.GLSL.binaryOperator 'vec4', '*'     if !combine

    # Split fragment into edge and fill pass for better z layering
    edgeFactory = shaders.material()
    edgeFactory.vertex.pipe v
    edgeFactory.fragment.pipe f
    edgeFactory.fragment.pipe 'fragment.transparent', @uniforms

    fillFactory = shaders.material()
    fillFactory.vertex.pipe v
    fillFactory.fragment.pipe f
    fillFactory.fragment.pipe 'fragment.solid', @uniforms

    @fillMaterial = @_material fillFactory.link
      side: THREE.DoubleSide
      index0AttributeName: "position4"

    @edgeMaterial = @_material edgeFactory.link
      side: THREE.DoubleSide
      index0AttributeName: "position4"

    @fillObject = new THREE.Mesh @geometry, @fillMaterial
    @edgeObject = new THREE.Mesh @geometry, @edgeMaterial

    @_raw @fillObject
    @_raw @edgeObject

    @objects = [@fillObject, @edgeObject]

  show: (transparent, blending, order, depth) ->
    @_show @edgeObject, true,        blending, order, depth
    @_show @fillObject, transparent, blending, order, depth

  dispose: () ->
    @geometry.dispose()
    @edgeMaterial.dispose()
    @fillMaterial.dispose()
    @objects = @geometry = @edgeMaterial = @fillMaterial = @edgeObject = @fillObject = null
    super

module.exports = Sprite
