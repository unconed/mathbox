Primitive = require '../../primitive'
Util      = require '../../../util'

class Strip extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'mesh', 'geometry', 'position', 'bind']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @strip = null

  resize: () ->
    return unless @strip and @bind.points
    dims = @bind.points.getActive()

    items  = dims.items
    width  = dims.width
    height = dims.height
    depth  = dims.depth

    #console.log 'strip', dims

    @strip.geometry.clip width, height, depth, items

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make
      'geometry.points': 'source'
      'geometry.colors': 'source'

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

    # Fetch geometry dimensions
    dims    = @bind.points.getDimensions()
    items   = dims.items
    width   = dims.width
    height  = dims.height
    depth   = dims.depth

    # Build color lookup
    if @bind.colors
      color = @_shaders.shader()
      @bind.colors.sourceShader color

    # Make line renderable
    ###
    uniforms = Util.JS.merge arrowUniforms, lineUniforms, styleUniforms
    @line = @_renderables.make 'line',
              uniforms: uniforms
              samples:  samples
              ribbons:  ribbons
              strips:   strips
              layers:   layers
              position: position
              color:    color
              clip:     start or end
    ###

    # Make strip renderable
    uniforms = Util.JS.merge styleUniforms, {}

    @strip = @_renderables.make 'strip',
              uniforms: uniforms
              width:    width
              height:   height
              depth:    depth
              items:    items
              position: position
              color:    color

    @resize()

    @_helpers.object.make [@strip]

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.object.unmake()
    @_helpers.position.unmake()

    @strip = null

  change: (changed, touched, init) ->
    return @rebuild() if changed['geometry.points']

module.exports = Strip
