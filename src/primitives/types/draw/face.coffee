Primitive = require '../../primitive'
Util      = require '../../../util'

class Face extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'mesh', 'geometry', 'position', 'bind']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @face = null

  resize: () ->
    return unless @face and @bind.points
    dims = @bind.points.getActive()

    items  = dims.items
    width  = dims.width
    height = dims.height
    depth  = dims.depth

    @face.geometry.clip width, height, depth, items

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

    # Make face renderable
    uniforms = Util.JS.merge styleUniforms, {}

    @face = @_renderables.make 'face',
              uniforms: uniforms
              width:    width
              height:   height
              depth:    depth
              items:    items
              position: position
              color:    color

    @resize()

    @_helpers.object.make [@face]

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.object.unmake()
    @_helpers.position.unmake()

    @face = null

  change: (changed, touched, init) ->
    @rebuild() if changed['geometry.points']?

module.exports = Face
