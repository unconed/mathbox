Primitive = require '../../primitive'

class Axis extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'axis', 'span']

  constructor: (model, attributes, factory, shaders) ->
    super model, attributes, factory, shaders

    @axisPosition = @axisStep = @resolution = @line = null

  make: () ->

    # Look up range of nearest view to inherit from
    @inherit = @_inherit 'view.range'

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

    # Make line renderable
    detail = @_get 'axis.detail'
    samples = detail + 1
    @resolution = 1 / detail

    lineUniforms =
      lineWidth:      @node.attributes['line.width']
      lineColor:      @node.attributes['style.color']
      lineOpacity:    @node.attributes['style.opacity']

    @line = @_factory.make 'line',
              uniforms: lineUniforms
              samples:  samples
              position: position

    @_render @line

  unmake: () ->
    @_unrender @line
    @line.dispose()
    @line = null

    @_unherit()

  change: (changed, init) ->
    @rebuild() if changed['axis.detail']?

    if changed['view.range']     or
       changed['axis.dimension'] or
       changed['span']           or
       init

      dimension = @_get 'axis.dimension'
      range = @_helper.getSpanRange '', dimension

      min = range.x
      max = range.y

      @_helper.setDimension(@axisPosition, dimension).multiplyScalar(min)
      @_helper.setDimension(@axisStep, dimension).multiplyScalar((max - min) * @resolution)

    @_helper.setMeshVisible @line

module.exports = Axis