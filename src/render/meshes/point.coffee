Base           = require './base'
SpriteGeometry = require('../geometry').SpriteGeometry

class Point extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    {uniforms, material, position, color, size, mask, map, combine, linear, shape, optical, fill, stpq} = options

    uniforms ?= {}
    shape     = +shape ? 0
    fill     ?= true

    hasStyle = uniforms.styleColor?

    shapes   = ['circle', 'square', 'diamond', 'up', 'down', 'left', 'right']
    passes   = ['circle', 'generic', 'generic', 'generic', 'generic', 'generic', 'generic']
    scales   = [1.2,       1,         1.414,     1.16, 1.16,   1.16,  1.16]
    pass     = passes[shape] ? passes[0]
    _shape   = shapes[shape] ? shapes[0]
    _scale   = optical and scales[shape] ? 1
    alpha    = if fill then pass else "#{pass}.hollow"

    @geometry = new SpriteGeometry
      items:  options.items
      width:  options.width
      height: options.height
      depth:  options.depth

    @_adopt uniforms
    @_adopt @geometry.uniforms

    defines = POINT_SHAPE_SCALE: +(_scale + .00001)

    # Shared vertex shader
    factory = shaders.material()
    v = factory.vertex

    v.pipe @_vertexColor color, mask

    # Point sizing
    if size
      v.isolate()
      v  .require size
      v  .require 'point.size.varying', @uniforms
      v.end()
    else
      v.require 'point.size.uniform',   @uniforms

    v.require @_vertexPosition position, material, map, 2, stpq

    v.pipe 'point.position',        @uniforms, defines
    v.pipe 'project.position',      @uniforms

    # Shared fragment shader
    factory.fragment = f =
      @_fragmentColor hasStyle, material, color, mask, map, 2, stpq, combine, linear

    # Split fragment into edge and fill pass for better z layering
    edgeFactory = shaders.material()
    edgeFactory.vertex.pipe v
    f = edgeFactory.fragment.pipe factory.fragment
    f.require "point.mask.#{_shape}",  @uniforms
    f.require "point.alpha.#{alpha}",  @uniforms
    f.pipe 'point.edge',               @uniforms

    fillFactory = shaders.material()
    fillFactory.vertex.pipe v
    f = fillFactory.fragment.pipe factory.fragment
    f.require "point.mask.#{_shape}",  @uniforms
    f.require "point.alpha.#{alpha}",  @uniforms
    f.pipe 'point.fill',               @uniforms

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
    @renders = @edgeObject = @fillObject = @geometry = @edgeMaterial = @fillMaterial = null
    super

module.exports = Point
