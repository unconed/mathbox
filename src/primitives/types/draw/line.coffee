Primitive = require '../../primitive'
Util      = require '../../../util'

class Line extends Primitive
  @traits = ['node', 'object', 'style', 'line', 'arrow', 'geometry', 'position', 'bind']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @line = @arrows = null

  resize: () ->
    return unless @bind.points?
    dims = @bind.points.getActiveDimensions()

    samples = dims.width
    strips  = dims.height
    ribbons = dims.depth
    layers  = dims.items

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
    position = @bind.points.sourceShader position

    # Transform position to view
    position = @_helpers.position.pipeline position

    # Prepare bound uniforms
    styleUniforms = @_helpers.style.uniforms()
    lineUniforms  = @_helpers.line.uniforms()
    arrowUniforms = @_helpers.arrow.uniforms()
    unitUniforms  = @_inherit('unit').getUnitUniforms()

    # Clip start/end for terminating arrow
    start   = @props.start
    end     = @props.end

    # Stroke style
    stroke  = @props.stroke

    # Fetch geometry dimensions
    dims    = @bind.points.getDimensions()
    samples = dims.width
    strips  = dims.height
    ribbons = dims.depth
    layers  = dims.items

    # Build color lookup
    if @bind.colors
      color = @_shaders.shader()
      @bind.colors.sourceShader color

    # Build transition mask lookup
    mask = @_helpers.object.mask()

    # Make line renderable
    uniforms = Util.JS.merge arrowUniforms, lineUniforms, styleUniforms, unitUniforms
    @line = @_renderables.make 'line',
              uniforms: uniforms
              samples:  samples
              strips:   strips
              ribbons:  ribbons
              layers:   layers
              position: position
              color:    color
              clip:     start or end
              stroke:   stroke
              mask:     mask

    # Make arrow renderables
    @arrows = []
    if start
      @arrows.push @_renderables.make 'arrow',
                uniforms: uniforms
                flip:     true
                samples:  samples
                strips:   strips
                ribbons:  ribbons
                layers:   layers
                position: position
                color:    color
                mask:     mask

    if end
      @arrows.push @_renderables.make 'arrow',
                uniforms: uniforms
                samples:  samples
                strips:   strips
                ribbons:  ribbons
                layers:   layers
                position: position
                color:    color
                mask:     mask

    @_helpers.object.make @arrows.concat [@line]

  made: () -> @resize()

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.object.unmake()

    @line = @arrows = null

  change: (changed, touched, init) ->
    return @rebuild() if changed['geometry.points'] or
                         changed['line.stroke'] or
                         changed['arrow.start'] or
                         changed['arrow.end']

module.exports = Line
