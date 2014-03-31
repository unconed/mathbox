Primitive = require '../../primitive'
Util = require '../../../util'

class Axis extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'axis', 'span', 'interval', 'arrow']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @axisPosition = @axisStep = @resolution = @line = null

  make: () ->
    # Prepare position shader
    types = @_attributes.types
    positionUniforms =
      axisPosition:   @_attributes.make types.vec4()
      axisStep:       @_attributes.make types.vec4()

    @axisPosition   = positionUniforms.axisPosition.value
    @axisStep       = positionUniforms.axisStep.value

    # Build transform chain
    position = @_shaders.shader()
    position.call 'axis.position', positionUniforms
    @transform position

    # Prepare bound uniforms
    styleUniforms = @_helper.style.uniforms()
    lineUniforms  = @_helper.line.uniforms()
    arrowUniforms = @_helper.arrow.uniforms()

    lineUniforms.clipRange = arrowUniforms.arrowSize

    # Make line renderable
    detail = @_get 'axis.detail'
    samples = detail + 1
    @resolution = 1 / detail

    @line = @_factory.make 'line',
              uniforms: @_helper.object.merge lineUniforms, styleUniforms
              samples:  samples
              position: position
              clip:     true

    # Make arrow renderable
    @arrow = @_factory.make 'arrow',
              uniforms: @_helper.object.merge arrowUniforms, styleUniforms
              samples:  samples
              position: position

    # Object and span traits
    @_helper.object.make [@line, @arrow]
    @_helper.span.make()

  unmake: () ->
    @_helper.object.unmake()
    @_helper.span.unmake()

  change: (changed, touched, init) ->
    @rebuild() if changed['axis.detail']?

    if touched['interval'] or
       touched['span']     or
       touched['view']     or
       init

      dimension = @_get 'interval.axis'
      range = @_helper.span.get '', dimension

      min = range.x
      max = range.y

      Util.setDimension(@axisPosition, dimension).multiplyScalar(min)
      Util.setDimension(@axisStep, dimension).multiplyScalar((max - min) * @resolution)


module.exports = Axis