Primitive = require '../../primitive'
Util      = require '../../../util'

class Strip extends Primitive
  @traits = ['node', 'object', 'visible', 'style', 'line', 'mesh', 'strip', 'geometry', 'position', 'bind', 'shade']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @strip = null

  resize: () ->
    return unless @bind.points?

    dims = @bind.points.getActiveDimensions()
    {items, width, height, depth} = dims

    @strip.geometry.clip width, height, depth, items if @strip
    @line .geometry.clip items, width, height, depth if @line

    if @bind.map?
      map  = @bind.map.getActiveDimensions()
      @strip.geometry.map map.width, map.height, map.depth, map.items if @strip

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make [
      { to: 'geometry.points', trait: 'source' }
      { to: 'geometry.colors', trait: 'source' }
      { to: 'mesh.map',        trait: 'source' }
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
    unitUniforms  = @_inherit('unit').getUnitUniforms()

    # Get display properties
    line    = @props.line
    shaded  = @props.shaded
    fill    = @props.fill

    # Auto z-bias wireframe over surface
    wireUniforms = {}
    wireUniforms.styleZBias  = @_attributes.make @_types.number()
    @wireZBias  = wireUniforms.styleZBias

    # Fetch geometry dimensions
    dims    = @bind.points.getDimensions()
    {items, width, height, depth} = dims

    # Get display properties
    {line, shaded, fill, stroke, join} = @props

    # Build color lookup
    if @bind.colors
      color = @_shaders.shader()
      color = @bind.colors.sourceShader color

    # Build transition mask lookup
    mask = @_helpers.object.mask()

    # Build texture map lookup
    map = @_helpers.shade.map @bind.map?.sourceShader @_shaders.shader()

    # Build fragment material lookup
    material     = @_helpers.shade.pipeline()
    faceMaterial = material || shaded
    lineMaterial = material || false

    objects = []

    # Make line renderable
    if line
      # Swizzle strip edges into segments
      swizzle = @_shaders.shader()
      swizzle.pipe Util.GLSL.swizzleVec4 'yzwx'
      swizzle.pipe position

      uniforms = Util.JS.merge unitUniforms, lineUniforms, styleUniforms, wireUniforms

      @line = @_renderables.make 'line',
                uniforms: uniforms
                samples:  items
                strips:   width
                ribbons:  height
                layers:   depth
                position: swizzle
                color:    color
                stroke:   stroke
                join:     join
                mask:     mask
                material: lineMaterial

      objects.push @line

    # Make strip renderable
    if fill
      uniforms = Util.JS.merge styleUniforms, {}

      @strip = @_renderables.make 'strip',
                uniforms: uniforms
                width:    width
                height:   height
                depth:    depth
                items:    items
                position: position
                color:    color
                material: faceMaterial
      objects.push @strip

    @_helpers.visible.make()
    @_helpers.object.make objects

  made: () -> @resize()

  unmake: () ->
    @_helpers.bind.unmake()
    @_helpers.visible.unmake()
    @_helpers.object.unmake()

    @strip = null

  change: (changed, touched, init) ->
    return @rebuild() if changed['geometry.points'] or touched['mesh']

    if changed['style.zBias']   or
       changed['mesh.lineBias'] or
       init

      {fill, zBias, lineBias} = @props
      @wireZBias.value = zBias + if fill then lineBias else 0

module.exports = Strip
