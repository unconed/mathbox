Primitive = require '../../primitive'
Util      = require '../../../util'

class Vector extends Primitive
  @traits = ['node', 'object', 'visible', 'style', 'line', 'arrow', 'geometry', 'position', 'bind', 'shade']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @line = @arrows = null

  resize: () ->
    return unless @bind.points?
    dims = @bind.points.getActiveDimensions()

    samples = dims.items
    strips  = dims.width
    ribbons = dims.height
    layers  = dims.depth

    @line.geometry.clip samples, strips, ribbons, layers
    arrow.geometry.clip samples, strips, ribbons, layers for arrow in @arrows

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make [
      { to: 'geometry.points', trait: 'source' }
      { to: 'geometry.colors', trait: 'source' }
    ]

    return unless @bind.points?

    # Build transform chain
    position = @_shaders.shader()

    # Fetch position
    @bind.points.sourceShader position

    # Transform position to view
    @_helpers.position.pipeline position

    # Prepare bound uniforms
    styleUniforms = @_helpers.style.uniforms()
    lineUniforms  = @_helpers.line.uniforms()
    arrowUniforms = @_helpers.arrow.uniforms()
    unitUniforms  = @_inherit('unit').getUnitUniforms()

    # Clip start/end for terminating arrow
    {start, end} = @props

    # Stroke style
    {stroke, join, proximity} = @props
    @proximity = proximity

    # Fetch geometry dimensions
    dims    = @bind.points.getDimensions()
    samples = dims.items
    strips  = dims.width
    ribbons = dims.height
    layers  = dims.depth

    # Build color lookup
    if @bind.colors
      color = @_shaders.shader()
      @bind.colors.sourceShader color

    # Build transition mask lookup
    mask = @_helpers.object.mask()

    # Build fragment material lookup
    material = @_helpers.shade.pipeline() || false

    # Swizzle vector to line
    {swizzle, swizzle2} = @_helpers.position
    position = swizzle2 position, 'yzwx', 'yzwx'
    color    = swizzle  color,    'yzwx'
    mask     = swizzle  mask,     'yzwx'
    material = swizzle  material, 'yzwx'

    # Make line renderable
    uniforms = Util.JS.merge arrowUniforms, lineUniforms, styleUniforms, unitUniforms
    @line = @_renderables.make 'line',
              uniforms:  uniforms
              samples:   samples
              ribbons:   ribbons
              strips:    strips
              layers:    layers
              position:  position
              color:     color
              clip:      start or end
              stroke:    stroke
              join:      join
              proximity: proximity
              mask:      mask
              material:  material

    # Make arrow renderables
    @arrows = []
    if start
      @arrows.push @_renderables.make 'arrow',
                uniforms: uniforms
                flip:     true
                samples:  samples
                ribbons:  ribbons
                strips:   strips
                layers:   layers
                position: position
                color:    color
                mask:     mask
                material: material

    if end
      @arrows.push @_renderables.make 'arrow',
                uniforms: uniforms
                samples:  samples
                ribbons:  ribbons
                strips:   strips
                layers:   layers
                position: position
                color:    color
                mask:     mask
                material: material

    @_helpers.visible.make()
    @_helpers.object.make @arrows.concat [@line]

  made: () -> @resize()

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.visible.unmake()
    @_helpers.object.unmake()

    @line = @arrows = null

  change: (changed, touched, init) ->
    return @rebuild() if changed['geometry.points'] or
                         changed['line.stroke']     or
                         changed['line.join']       or
                         changed['arrow.start']     or
                         changed['arrow.end']

    if changed['line.proximity']
      return @rebuild() if @proximity? != @props.proximity?

module.exports = Vector
