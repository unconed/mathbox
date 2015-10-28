Primitive = require '../../primitive'
Util      = require '../../../util'

class Axis extends Primitive
  @traits = ['node', 'object', 'visible', 'style', 'line', 'axis', 'span', 'interval', 'arrow', 'position', 'origin', 'shade']
  @defaults =
    end: true
    zBias: -1

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @axisPosition = @axisStep = @resolution = @line = @arrows = null

  make: () ->
    # Prepare position shader
    positionUniforms =
      axisPosition:   @_attributes.make @_types.vec4()
      axisStep:       @_attributes.make @_types.vec4()

    @axisPosition   = positionUniforms.axisPosition.value
    @axisStep       = positionUniforms.axisStep.value

    # Build transform chain
    position = @_shaders.shader()
    position.pipe 'axis.position', positionUniforms
    position = @_helpers.position.pipeline position

    # Prepare bound uniforms
    styleUniforms = @_helpers.style.uniforms()
    lineUniforms  = @_helpers.line.uniforms()
    arrowUniforms = @_helpers.arrow.uniforms()
    unitUniforms  = @_inherit('unit').getUnitUniforms()

    # Line geometry
    detail  = @props.detail
    samples = detail + 1
    @resolution = 1 / detail

    # Clip start/end for terminating arrow
    {start, end} = @props

    # Stroke style
    {stroke, join} = @props

    # Build transition mask lookup
    mask = @_helpers.object.mask()

    # Build fragment material lookup
    material = @_helpers.shade.pipeline() || false

    # Indexing by fixed or by given axis
    {crossed, axis} = @props
    if !crossed and mask? and axis > 1
      swizzle = ['x000', 'y000', 'z000', 'w000'][axis]
      mask = @_helpers.position.swizzle mask, swizzle

    # Make line renderable
    uniforms = Util.JS.merge arrowUniforms, lineUniforms, styleUniforms, unitUniforms
    @line = @_renderables.make 'line',
              uniforms: uniforms
              samples:  samples
              position: position
              clip:     start or end
              stroke:   stroke
              join:     join
              mask:     mask
              material: material

    # Make arrow renderables
    @arrows = []
    if start
      @arrows.push @_renderables.make 'arrow',
                uniforms: uniforms
                flip:     true
                samples:  samples
                position: position
                mask:     mask
                material: material

    if end
      @arrows.push @_renderables.make 'arrow',
                uniforms: uniforms
                samples:  samples
                position: position
                mask:     mask
                material: material

    # Visible, object and span traits
    @_helpers.visible.make()
    @_helpers.object.make @arrows.concat [@line]
    @_helpers.span.make()

    # Monitor view range
    @_listen @, 'span.range', @updateRanges

  unmake: () ->
    @_helpers.visible.unmake()
    @_helpers.object.unmake()
    @_helpers.span.unmake()

  change: (changed, touched, init) ->
    return @rebuild() if changed['axis.detail']   or
                         changed['line.stroke']   or
                         changed['line.join']     or
                         changed['axis.crossed']  or
                         (changed['interval.axis'] and @props.crossed)

    if touched['interval'] or
       touched['span']     or
       touched['view']     or
       init

      @updateRanges()

  updateRanges: () ->
    {axis, origin} = @props

    range = @_helpers.span.get '', axis

    min = range.x
    max = range.y

    Util.Axis.setDimension(@axisPosition, axis).multiplyScalar(min)
    Util.Axis.setDimension(@axisStep, axis).multiplyScalar((max - min) * @resolution)

    Util.Axis.addOrigin(@axisPosition, axis, origin)


module.exports = Axis