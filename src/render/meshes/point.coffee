Base           = require './base'
SpriteGeometry = require('../geometry').SpriteGeometry

class Point extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    uniforms = options.uniforms ? {}
    position = options.position
    color    = options.color
    mask     = options.mask
    _shape    = +options.shape   ? 0
    fill     = options.fill ? true

    hasStyle = uniforms.styleColor?

    shapes   = ['circle', 'square', 'diamond', 'triangle']
    passes   = ['circle', 'generic', 'generic', 'generic']
    shape    = shapes[_shape] ? shapes[0]
    pass     = passes[_shape] ? passes[0]
    alpha    = if fill then pass else "#{pass}.hollow"

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
    v.pipe 'point.position',        @uniforms
    v.pipe 'project.position',      @uniforms

    # Shared fragment shader
    f = factory.fragment

    @_fragmentColor f, hasStyle, false, color, mask

    # Split fragment into edge and fill pass for better z layering
    edgeFactory = shaders.material()
    edgeFactory.vertex.pipe v
    f = edgeFactory.fragment.pipe factory.fragment
    f.require "point.mask.#{shape}",   @uniforms
    f.require "point.alpha.#{alpha}",  @uniforms
    f.pipe 'point.edge',               @uniforms

    fillFactory = shaders.material()
    fillFactory.vertex.pipe v
    f = fillFactory.fragment.pipe factory.fragment
    f.require "point.mask.#{shape}",   @uniforms
    f.require "point.alpha.#{alpha}",  @uniforms
    f.pipe 'point.fill',               @uniforms

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
    @objects = @edgeObject = @fillObject = @geometry = @edgeMaterial = @fillMaterial = null
    super

module.exports = Point
