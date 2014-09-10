Base           = require './base'
SpriteGeometry = require('../geometry').SpriteGeometry

class Sprite extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    uniforms = options.uniforms ? {}
    position = options.position
    color    = options.color
    shape    = options.shape    ? 'circle'

    @geometry = new SpriteGeometry
      items:  options.items
      width:  options.width
      height: options.height
      depth:  options.depth

    @_adopt uniforms
    @_adopt @geometry.uniforms

    # Shared vertex shader
    v = shaders.shader()
    if color
      v.require color
      v.pipe 'mesh.vertex.color',   @uniforms
    v.require position if position
    v.pipe 'sprite.position',       @uniforms
    v.pipe 'project.position',      @uniforms

    # Split fragment into edge and fill pass for better z layering
    edgeFactory = shaders.material()
    edgeFactory.vertex.pipe v

    f = edgeFactory.fragment
    f.pipe 'style.color',              @uniforms
    f.pipe 'mesh.fragment.color',      @uniforms if color
    f.require "sprite.mask.#{shape}",  @uniforms
    f.require "sprite.alpha.#{shape}", @uniforms
    f.pipe 'sprite.edge',              @uniforms

    fillFactory = shaders.material()
    fillFactory.vertex.pipe v

    f = fillFactory.fragment
    f.pipe 'style.color',              @uniforms
    f.pipe 'mesh.fragment.color',      @uniforms if color
    f.require "sprite.mask.#{shape}",  @uniforms
    f.require "sprite.alpha.#{shape}", @uniforms
    f.pipe 'sprite.fill',              @uniforms

    @edgeMaterial = new THREE.ShaderMaterial edgeFactory.build
      side: THREE.DoubleSide
      defaultAttributeValues: null
      index0AttributeName: "position4"

    @fillMaterial = new THREE.ShaderMaterial fillFactory.build
      side: THREE.DoubleSide
      defaultAttributeValues: null
      index0AttributeName: "position4"

    @edgeObject = new THREE.Mesh @geometry, @edgeMaterial
    @fillObject = new THREE.Mesh @geometry, @fillMaterial

    @_raw @edgeObject
    @_raw @fillObject

    @objects = [@edgeObject, @fillObject]

  show: (transparent, blending, order, depth) ->
    @_show @edgeObject, true,        blending, order, depth
    @_show @fillObject, transparent, blending, order, depth

  dispose: () ->
    @geometry.dispose()
    @edgeMaterial.dispose()
    @fillMaterial.dispose()
    @objects = @edgeObject = @fillObject = @geometry = @material = null
    super

module.exports = Sprite
