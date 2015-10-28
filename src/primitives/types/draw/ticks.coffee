Primitive = require '../../primitive'
Util      = require '../../../util'

class Ticks extends Primitive
  @traits = ['node', 'object', 'visible', 'style', 'line', 'ticks', 'geometry', 'position', 'bind', 'shade']

  init: () ->
    @tickStrip = @line = null

  resize: () ->
    return unless @bind.points?
    dims = @bind.points.getActiveDimensions()

    active  = +(dims.items > 0)
    strips  = dims.width  * active
    ribbons = dims.height * active
    layers  = dims.depth  * active

    @line.geometry.clip 2, strips, ribbons, layers
    @tickStrip.set 0, strips - 1

  make: () ->

    # Bind to attached data sources
    @_helpers.bind.make [
      { to: 'geometry.points', trait: 'source' }
      { to: 'geometry.colors', trait: 'source' }
    ]

    return unless @bind.points?

    # Prepare bound uniforms
    styleUniforms = @_helpers.style.uniforms()
    lineUniforms  = @_helpers.line.uniforms()
    unitUniforms  = @_inherit('unit').getUnitUniforms()
    uniforms      = Util.JS.merge lineUniforms, styleUniforms, unitUniforms

    # Prepare position shader
    positionUniforms =
      tickEpsilon: @node.attributes['ticks.epsilon']
      tickSize:    @node.attributes['ticks.size']
      tickNormal:  @node.attributes['ticks.normal']
      tickStrip:   @_attributes.make @_types.vec2 0, 0
      worldUnit:   uniforms.worldUnit
      focusDepth:  uniforms.focusDepth

    @tickStrip = positionUniforms.tickStrip.value

    # Build transform chain
    p = position = @_shaders.shader()

    # Require buffer sampler as callback
    p.require @bind.points.sourceShader @_shaders.shader()

    # Require view transform as callback
    p.require @_helpers.position.pipeline @_shaders.shader()

    # Link to tick shader
    p.pipe 'ticks.position', positionUniforms

    # Stroke style
    {stroke, join} = @props

    # Fetch geometry dimensions
    dims    = @bind.points.getDimensions()
    strips  = dims.width
    ribbons = dims.height
    layers  = dims.depth

    # Build color lookup
    if @bind.colors
      color = @_shaders.shader()
      @bind.colors.sourceShader color

    # Build transition mask lookup
    mask = @_helpers.object.mask()

    # Build fragment material lookup
    material = @_helpers.shade.pipeline() || false

    # Make line renderable
    {swizzle, swizzle2} = @_helpers.position
    @line = @_renderables.make 'line',
              uniforms: uniforms
              samples:  2
              strips:   strips
              ribbons:  ribbons
              layers:   layers
              position: position
              color:    color
              stroke:   stroke
              join:     join
              mask:     swizzle mask, 'yzwx'
              material: material

    @_helpers.visible.make()
    @_helpers.object.make [@line]

  made: () -> @resize()

  unmake: () ->
    @line = null

    @_helpers.visible.unmake()
    @_helpers.object.unmake()


  change: (changed, touched, init) ->
    return @rebuild() if changed['geometry.points'] or
                         changed['line.stroke'] or
                         changed['line.join']


module.exports = Ticks