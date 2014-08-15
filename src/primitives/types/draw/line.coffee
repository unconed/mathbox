Primitive = require '../../primitive'
Util      = require '../../../util'

class Line extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'arrow', 'geometry', 'position', 'bind']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @line = @arrows = null

  resize: () ->
    return unless @line and @bind.points
    dims = @bind.points.getActive()

    samples = dims.width
    strips  = dims.height
    ribbons = dims.depth
    layers  = dims.items

    @line.geometry.clip samples, strips, ribbons, layers
    arrow.geometry.clip samples, strips, ribbons, layers for arrow in @arrows

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make
      'geometry.points': 'source'

    # Build transform chain
    position = @_shaders.shader()
    @_helpers.position.make()

    # Fetch position
    @bind.points.sourceShader position

    # Transform position to view
    @_helpers.position.shader position

    # Prepare bound uniforms
    styleUniforms = @_helpers.style.uniforms()
    lineUniforms  = @_helpers.line.uniforms()
    arrowUniforms = @_helpers.arrow.uniforms()

    # Clip start/end for terminating arrow
    start   = @_get 'arrow.start'
    end     = @_get 'arrow.end'

    # Fetch geometry dimensions
    dims    = @bind.points.getDimensions()
    samples = dims.width
    strips  = dims.height
    ribbons = dims.depth
    layers  = dims.items

    # Make line renderable
    uniforms = Util.JS.merge arrowUniforms, lineUniforms, styleUniforms
    @line = @_renderables.make 'line',
              uniforms: uniforms
              samples:  samples
              strips:   strips
              ribbons:  ribbons
              layers:   layers
              position: position
              clip:     start or end

    # Make arrow renderables
    @arrows = []
    uniforms = Util.JS.merge arrowUniforms, styleUniforms

    if start
      @arrows.push @_renderables.make 'arrow',
                uniforms: uniforms
                flip:     true
                samples:  samples
                strips:   strips
                ribbons:  ribbons
                layers:   layers
                position: position

    if end
      @arrows.push @_renderables.make 'arrow',
                uniforms: uniforms
                samples:  samples
                strips:   strips
                ribbons:  ribbons
                layers:   layers
                position: position

    @resize()

    @_helpers.object.make @arrows.concat [@line]

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.object.unmake()
    @_helpers.position.unmake()

    @line = @arrows = null

  change: (changed, touched, init) ->
    @rebuild() if changed['geometry.points']? or
                  changed['arrow.start']?     or
                  changed['arrow.end']?

module.exports = Line
