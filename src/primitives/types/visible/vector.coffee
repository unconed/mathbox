Primitive = require '../../primitive'
Data = require '../data/data'

class Vector extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'vector', 'arrow', 'position', 'bind']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @resolution = @line = @arrows = null

  clip: () ->
    return unless @line and @bind.points
    dims = @bind.points.getActive()
    ribbons = Math.floor dims.width
    strips = dims.height * dims.depth

    @line.geometry.clip 0, ribbons * strips

  make: () ->
    # Bind to attached data sources
    @_helper.bind.make
      'vector.points': Data

    # Build transform chain
    position = @_shaders.shader()
    @_helper.position.make()

    # Vector subdivision
    detail  = @_get 'vector.detail'
    samples = detail + 1
    @resolution = 1 / detail

    # Fetch position
    if detail > 1
      vectorUniforms =
        subdivideStride: @_attributes.make types.number @resolution

      # Subdivide vector if needed
      position.callback()
      @bind.points.shader position
      position.join()
      position.call 'vector.subdivide', vectorUniforms

    else
      @bind.points.shader position

    # Transform position to view
    @_helper.position.shader position
    @transform position

    # Prepare bound uniforms
    styleUniforms = @_helper.style.uniforms()
    lineUniforms  = @_helper.line.uniforms()
    arrowUniforms = @_helper.arrow.uniforms()

    # Make line renderable
    dims    = @bind.points.getDimensions()
    ribbons = Math.floor dims.width
    strips  = dims.height * dims.depth

    # Clip start/end for terminating arrow
    start   = @_get 'arrow.start'
    end     = @_get 'arrow.end'

    @line = @_factory.make 'line',
              uniforms: @_helper.object.merge arrowUniforms, lineUniforms, styleUniforms
              samples:  samples
              ribbons:  ribbons
              strips:   strips
              position: position
              clip:     start or end

    # Make arrow renderables
    @arrows = []

    if start
      @arrows.push @_factory.make 'arrow',
                uniforms: @_helper.object.merge arrowUniforms, styleUniforms
                flip:     true
                samples:  samples
                ribbons:  ribbons
                strips:   strips
                position: position

    if end
      @arrows.push @_factory.make 'arrow',
                uniforms: @_helper.object.merge arrowUniforms, styleUniforms
                samples:  samples
                ribbons:  ribbons
                strips:   strips
                position: position

    @clip()

    @_helper.object.make @arrows.concat [@line]

  unmake: () ->
    @_helper.bind.unmake()
    @_helper.object.unmake()
    @_helper.position.unmake()

  change: (changed, touched, init) ->
    @rebuild() if changed['vector.points']? or
                  changed['vector.start']?  or
                  changed['vector.end']?    or
                  changed['vector.detail']?

module.exports = Vector