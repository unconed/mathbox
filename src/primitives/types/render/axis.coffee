Primitive = require '../../primitive'
Util = require '../../../util'

class Axis extends Primitive
  @traits: ['node', 'object', 'style', 'stroke', 'axis', 'span', 'interval', 'arrow', 'position']

  constructor: (model, attributes, renderables, shaders, helpers) ->
    super model, attributes, renderables, shaders, helpers

    @axisPosition = @axisStep = @resolution = @line = @arrows = null

  make: () ->
    # Prepare position shader
    types = @_attributes.types
    positionUniforms =
      axisPosition:   @_attributes.make types.vec4()
      axisStep:       @_attributes.make types.vec4()

    @axisPosition   = positionUniforms.axisPosition.value
    @axisStep       = positionUniforms.axisStep.value

    # Build transform chain
    @_helpers.position.make()

    position = @_shaders.shader()
    position.call 'axis.position', positionUniforms
    @_helpers.position.shader position

    @transform position

    # Prepare bound uniforms
    styleUniforms  = @_helpers.style.uniforms()
    strokeUniforms = @_helpers.stroke.uniforms()
    arrowUniforms  = @_helpers.arrow.uniforms()

    # Make line renderable
    detail  = @_get 'axis.detail'
    samples = detail + 1
    @resolution = 1 / detail

    # Clip start/end for terminating arrow
    start   = @_get 'arrow.start'
    end     = @_get 'arrow.end'

    @line = @_renderables.make 'line',
              uniforms: @_helpers.object.merge arrowUniforms, strokeUniforms, styleUniforms
              samples:  samples
              position: position
              clip:     start or end

    # Make arrow renderables
    @arrows = []

    if start
      @arrows.push @_renderables.make 'arrow',
                uniforms: @_helpers.object.merge arrowUniforms, styleUniforms
                flip:     true
                samples:  samples
                position: position

    if end
      @arrows.push @_renderables.make 'arrow',
                uniforms: @_helpers.object.merge arrowUniforms, styleUniforms
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
    @rebuild() if changed['axis.detail']?

    if touched['interval'] or
       touched['span']     or
       touched['view']     or
       init

      dimension = @_get 'interval.axis'
      range = @_helpers.span.get '', dimension

      min = range.x
      max = range.y

      Util.setDimension(@axisPosition, dimension).multiplyScalar(min)
      Util.setDimension(@axisStep, dimension).multiplyScalar((max - min) * @resolution)


module.exports = Axis