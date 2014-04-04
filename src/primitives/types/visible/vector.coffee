Primitive = require '../../primitive'
Data = require '../data/data'

class Vector extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'vector', 'arrow', 'position', 'bind']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @line = @array = @resizeHandler = @rebuildHandler = null

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

    # Fetch position and transform to view
    @bind.points.shader position
    @_helper.position.shader position
    @transform position

    # Prepare bound uniforms
    styleUniforms = @_helper.style.uniforms()
    lineUniforms  = @_helper.line.uniforms()
    arrowUniforms = @_helper.arrow.uniforms()

    lineUniforms.clipRange = arrowUniforms.arrowSize

    # Make line renderable
    dims = @bind.points.getDimensions()
    ribbons = Math.floor dims.width
    strips = dims.height * dims.depth

    @line = @_factory.make 'line',
              uniforms: @_helper.object.merge lineUniforms, styleUniforms
              samples:  2
              ribbons:  ribbons
              strips:   strips
              position: position
              clip: true

    # Make arrow renderable
    @arrow = @_factory.make 'arrow',
              uniforms: @_helper.object.merge arrowUniforms, styleUniforms
              samples:  2
              ribbons:  ribbons
              strips:   strips
              position: position


    @clip()

    @_helper.object.make [@line, @arrow]

  unmake: () ->
    @_helper.bind.unmake()
    @_helper.object.unmake()
    @_helper.position.unmake()

  change: (changed, touched, init) ->
    @rebuild() if changed['vector.points']?

module.exports = Vector