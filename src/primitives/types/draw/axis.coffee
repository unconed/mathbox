Primitive = require '../../primitive'
Util      = require '../../../util'

class Axis extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'axis', 'span', 'interval', 'arrow', 'position']

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
    @_helpers.position.make()

    position = @_shaders.shader()
    position.pipe 'axis.position', positionUniforms
    @_helpers.position.shader position

    # Prepare bound uniforms
    styleUniforms = @_helpers.style.uniforms()
    lineUniforms  = @_helpers.line.uniforms()
    arrowUniforms = @_helpers.arrow.uniforms()

    # Line geometry
    detail  = @_get 'axis.detail'
    samples = detail + 1
    @resolution = 1 / detail

    # Clip start/end for terminating arrow
    start   = @_get 'arrow.start'
    end     = @_get 'arrow.end'

    # Make line renderable
    uniforms = Util.JS.merge arrowUniforms, lineUniforms, styleUniforms
    @line = @_renderables.make 'line',
              uniforms: uniforms
              samples:  samples
              position: position
              clip:     start or end

    # Make arrow renderables
    @arrows = []
    uniforms = Util.JS.merge arrowUniforms, styleUniforms

    if start
      @arrows.push @_renderables.make 'arrow',
                uniforms: uniforms
                flip:     true
                samples:  samples
                position: position

    if end
      @arrows.push @_renderables.make 'arrow',
                uniforms: uniforms
                samples:  samples
                position: position

    # Object and span traits
    @_helpers.object.make @arrows.concat [@line]
    @_helpers.span.make()

  unmake: () ->
    @_helpers.object.unmake()
    @_helpers.span.unmake()
    @_helpers.position.unmake()

  change: (changed, touched, init) ->
    return @rebuild() if changed['axis.detail']

    if touched['interval'] or
       touched['span']     or
       touched['view']     or
       init

      dimension = @_get 'interval.axis'
      range = @_helpers.span.get '', dimension

      min = range.x
      max = range.y

      Util.Axis.setDimension(@axisPosition, dimension).multiplyScalar(min)
      Util.Axis.setDimension(@axisStep, dimension).multiplyScalar((max - min) * @resolution)


module.exports = Axis