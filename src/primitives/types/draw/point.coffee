Primitive = require '../../primitive'
Util      = require '../../../util'

class Point extends Primitive
  @traits: ['node', 'object', 'style', 'point', 'geometry', 'position', 'bind', 'renderScale']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @point = null

  resize: () ->
    return unless @point and @bind.points

    dims = @bind.points.getActive()
    width  = dims.width
    height = dims.height
    depth  = dims.depth
    items  = dims.items

    @point.geometry.clip width, height, depth, items

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make
      'geometry.points': 'source'
      'geometry.colors': 'source'

    # Prepare renderScale helper
    @_helpers.renderScale.make()

    # Build transform chain
    position = @_shaders.shader()
    @_helpers.position.make()

    # Fetch position and transform to view
    @bind.points.sourceShader position
    @_helpers.position.shader position

    # Fetch geometry dimensions
    dims   = @bind.points.getDimensions()
    width  = dims.width
    height = dims.height
    depth  = dims.depth
    items  = dims.items

    # Prepare bound uniforms
    styleUniforms  = @_helpers.style.uniforms()
    pointUniforms  = @_helpers.point.uniforms()
    renderUniforms = @_helpers.renderScale.uniforms()

    # Build color lookup
    if @bind.colors
      color = @_shaders.shader()
      @bind.colors.sourceShader color

    # Make sprite renderable
    uniforms = Util.JS.merge renderUniforms, pointUniforms, styleUniforms
    @point = @_renderables.make 'sprite',
              uniforms: uniforms
              width:    width
              height:   height
              depth:    depth
              items:    items
              position: position
              color:    color

    @resize()

    @_helpers.object.make [@point]

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.renderScale.unmake()
    @_helpers.object.unmake()
    @_helpers.position.unmake()

    @point = null

  change: (changed, touched, init) ->
    return @rebuild() if changed['geometry.points']

module.exports = Point