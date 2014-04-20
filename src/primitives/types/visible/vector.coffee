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

    @line.geometry.clip 0, ribbons * strips * @detail

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
    @detail = detail
    @resolution = 1 / detail

    # Fetch position
    if detail > 1
      # Subdivide vector if needed
      types = @_attributes.types
      vectorUniforms =
        subdivideStride: @_attributes.make types.number 1 / samples
        subdivideScale:  @_attributes.make types.number samples / detail

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
    strips  = Math.floor dims.width
    ribbons = dims.height * dims.depth

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