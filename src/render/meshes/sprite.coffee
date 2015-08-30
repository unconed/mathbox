Base           = require './base'
SpriteGeometry = require('../geometry').SpriteGeometry

class Sprite extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    {uniforms, material, position, sprite, map, combine, linear, color, mask, stpq} = options
    uniforms ?= {}

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

    v.pipe @_vertexColor color, mask

    v.require @_vertexPosition position, material, map, 2, stpq
    v.require sprite
    v.pipe 'sprite.position',       @uniforms
    v.pipe 'project.position',      @uniforms

    # Shared fragment shader
    factory.fragment = f =
      @_fragmentColor hasStyle, material, color, mask, map, 2, stpq, combine, linear

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

    @edgeMaterial = @_material edgeFactory.link
      side: THREE.DoubleSide

    @fillObject = new THREE.Mesh @geometry, @fillMaterial
    @edgeObject = new THREE.Mesh @geometry, @edgeMaterial

    @_raw @fillObject
    @_raw @edgeObject

    @renders = [@fillObject, @edgeObject]

  show: (transparent, blending, order, depth) ->
    @_show @edgeObject, true,        blending, order, depth
    @_show @fillObject, transparent, blending, order, depth

  dispose: () ->
    @geometry.dispose()
    @edgeMaterial.dispose()
    @fillMaterial.dispose()
    @nreders = @geometry = @edgeMaterial = @fillMaterial = @edgeObject = @fillObject = null
    super

module.exports = Sprite
