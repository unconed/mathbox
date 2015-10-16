Primitive = require '../../primitive'
Util      = require '../../../util'

class Point extends Primitive
  @traits = ['node', 'object', 'visible', 'style', 'point', 'geometry', 'position', 'bind', 'shade']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @point = null

  resize: () ->
    return unless @bind.points?

    dims = @bind.points.getActiveDimensions()
    {items, width, height, depth} = dims

    @point.geometry.clip width, height, depth, items

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make [
      { to: 'geometry.points', trait: 'source' }
      { to: 'geometry.colors', trait: 'source' }
      { to: 'point.sizes',     trait: 'source' }
    ]

    return unless @bind.points?

    # Build transform chain
    position = @_shaders.shader()

    # Fetch position and transform to view
    position = @bind.points.sourceShader position
    position = @_helpers.position.pipeline position

    # Fetch geometry dimensions
    dims   = @bind.points.getDimensions()
    {items, width, height, depth} = dims

    # Prepare bound uniforms
    styleUniforms = @_helpers.style.uniforms()
    pointUniforms = @_helpers.point.uniforms()
    unitUniforms  = @_inherit('unit').getUnitUniforms()

    # Build color lookup
    if @bind.colors
      color = @_shaders.shader()
      @bind.colors.sourceShader color

    # Build size lookup
    if @bind.sizes
      size = @_shaders.shader()
      @bind.sizes.sourceShader size

    # Build transition mask lookup
    mask = @_helpers.object.mask()

    # Build fragment material lookup
    material = @_helpers.shade.pipeline() || false

    # Point style
    shape   = @props.shape
    fill    = @props.fill
    optical = @props.optical

    # Make point renderable
    uniforms = Util.JS.merge unitUniforms, pointUniforms, styleUniforms
    @point = @_renderables.make 'point',
              uniforms: uniforms
              width:    width
              height:   height
              depth:    depth
              items:    items
              position: position
              color:    color
              size:     size
              shape:    shape
              optical:  optical
              fill:     fill
              mask:     mask
              material: material

    @_helpers.visible.make()
    @_helpers.object.make [@point]

  made: () -> @resize()

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.visible.unmake()
    @_helpers.object.unmake()

    @point = null

  change: (changed, touched, init) ->
    return @rebuild() if changed['geometry.points'] or
                         changed['point.shape'] or
                         changed['point.fill']

module.exports = Point