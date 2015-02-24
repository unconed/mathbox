Primitive = require '../../primitive'
Util      = require '../../../util'

class Point extends Primitive
  @traits = ['node', 'object', 'style', 'point', 'geometry', 'position', 'bind', 'renderScale']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @point = null

  resize: () ->
    return unless @bind.points?

    dims = @bind.points.getActive()
    {items, width, height, depth} = dims

    @point.geometry.clip width, height, depth, items

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make [
      { to: 'geometry.points', trait: 'source' }
      { to: 'geometry.colors', trait: 'source' }
    ]

    return unless @bind.points?

    # Prepare renderScale helper
    @_helpers.renderScale.make()

    # Build transform chain
    position = @_shaders.shader()

    # Fetch position and transform to view
    position = @bind.points.sourceShader position
    position = @_helpers.position.pipeline position

    # Fetch geometry dimensions
    dims   = @bind.points.getDimensions()
    {items, width, height, depth} = dims

    # Prepare bound uniforms
    styleUniforms  = @_helpers.style.uniforms()
    pointUniforms  = @_helpers.point.uniforms()
    renderUniforms = @_helpers.renderScale.uniforms()

    # Build color lookup
    if @bind.colors
      color = @_shaders.shader()
      @bind.colors.sourceShader color

    # Point style
    shape  = @_get 'point.shape'
    fill   = @_get 'point.fill'

    # Make point renderable
    uniforms = Util.JS.merge renderUniforms, pointUniforms, styleUniforms
    @point = @_renderables.make 'point',
              uniforms: uniforms
              width:    width
              height:   height
              depth:    depth
              items:    items
              position: position
              color:    color
              shape:    shape
              fill:     fill

    @_helpers.object.make [@point]

  made: () -> @resize()

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.renderScale.unmake()
    @_helpers.object.unmake()

    @point = null

  change: (changed, touched, init) ->
    return @rebuild() if changed['geometry.points'] or
                         changed['point.shape'] or
                         changed['point.fill']

module.exports = Point