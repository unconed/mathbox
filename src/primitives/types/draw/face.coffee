Primitive = require '../../primitive'
Util      = require '../../../util'

class Face extends Primitive
  @traits = ['node', 'object', 'style', 'line', 'mesh', 'face', 'geometry', 'position', 'bind']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @face = null

  resize: () ->
    return unless @bind.points?
    dims = @bind.points.getActive()

    items  = dims.items
    width  = dims.width
    height = dims.height
    depth  = dims.depth

    @face.geometry.clip width, height, depth, items if @face
    @line.geometry.clip items, width, height, depth if @line

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make
      'geometry.points': 'source'
      'geometry.colors': 'source'

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

    # Fetch geometry dimensions
    dims    = @bind.points.getDimensions()
    items   = dims.items
    width   = dims.width
    height  = dims.height
    depth   = dims.depth

    # Get display properties
    outline = @_get 'face.outline'
    shaded  = @_get 'mesh.shaded'
    solid   = @_get 'mesh.solid'

    # Build color lookup
    if @bind.colors
      color = @_shaders.shader()
      @bind.colors.sourceShader color

    objects = []

    # Make line renderable
    if outline
      # Swizzle face edges into segments
      swizzle = @_shaders.shader()
      swizzle.pipe Util.GLSL.swizzleVec4 'yzwx'
      swizzle.pipe position

      uniforms = Util.JS.merge lineUniforms, styleUniforms
      @line = @_renderables.make 'line',
                uniforms: uniforms
                samples:  items
                ribbons:  width
                strips:   height
                layers:   depth
                position: swizzle
                color:    color
      objects.push @line

    # Make face renderable
    if solid
      uniforms = Util.JS.merge styleUniforms, {}
      @face = @_renderables.make 'face',
                uniforms: uniforms
                width:    width
                height:   height
                depth:    depth
                items:    items
                position: position
                color:    color
                shaded:   shaded
      objects.push @face

    @_helpers.object.make objects

  made: () -> @resize()

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.object.unmake()

    @face = @line = null

  change: (changed, touched, init) ->
    return @rebuild() if changed['geometry.points']

module.exports = Face
