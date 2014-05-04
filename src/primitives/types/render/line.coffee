Primitive = require '../../primitive'
Source = require '../source'

class Line extends Primitive
  @traits: ['node', 'object', 'style', 'stroke', 'line', 'arrow', 'position', 'bind']

  constructor: (model, attributes, renderables, shaders, helpers) ->
    super model, attributes, renderables, shaders, helpers

    @detail = @line = @arrows = null

  resize: () ->
    return unless @line and @bind.points
    dims = @bind.points.getActive()

    if dims.items > 1
      samples = dims.items
      strips  = Math.floor dims.width
      ribbons = dims.height
      layers  = dims.depth

    else
      samples = dims.width
      strips  = 1
      ribbons = dims.height
      layers  = dims.depth

    @line.geometry.clip samples, strips, ribbons, layers
    arrow.geometry.clip samples, strips, ribbons, layers for arrow in @arrows

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make
      'line.points': Source

    # Build transform chain
    position = @_shaders.shader()
    @_helpers.position.make()

    # Fetch geometry dimensions
    dims = @bind.points.getDimensions()
    if dims.items > 1
      samples = dims.items
      strips  = Math.floor dims.width
      ribbons = dims.height * dims.depth

    else
      samples = dims.width
      strips  = 1
      ribbons = dims.height * dims.depth

    # Line subdivision
    detail  = samples - 1
    @detail = detail

    # Fetch position
    @bind.points.shader position

    # Transform position to view
    @_helpers.position.shader position
    @transform position

    # Prepare bound uniforms
    styleUniforms  = @_helpers.style.uniforms()
    strokeUniforms = @_helpers.stroke.uniforms()
    arrowUniforms  = @_helpers.arrow.uniforms()

    # Clip start/end for terminating arrow
    start   = @_get 'arrow.start'
    end     = @_get 'arrow.end'

    # Make line renderable
    @line = @_renderables.make 'line',
              uniforms: @_helpers.object.merge arrowUniforms, strokeUniforms, styleUniforms
              samples:  samples
              ribbons:  ribbons
              strips:   strips
              position: position
              clip:     start or end

    # Make arrow renderables
    @arrows = []

    if start
      @arrows.push @_renderables.make 'arrow',
                uniforms: @_helpers.object.merge arrowUniforms, styleUniforms
                flip:     true
                samples:  samples
                ribbons:  ribbons
                strips:   strips
                position: position

    if end
      @arrows.push @_renderables.make 'arrow',
                uniforms: @_helpers.object.merge arrowUniforms, styleUniforms
                samples:  samples
                ribbons:  ribbons
                strips:   strips
                position: position

    @resize()

    @_helpers.object.make @arrows.concat [@line]

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.object.unmake()
    @_helpers.position.unmake()

    @detail = @line = @arrows = null

  change: (changed, touched, init) ->
    @rebuild() if changed['line.points']? or
                  changed['arrow.start']? or
                  changed['arrow.end']?

module.exports = Line
