Primitive = require '../../primitive'

class Curve extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'curve']

  constructor: (model, attributes, factory, shaders) ->
    super model, attributes, factory, shaders

    @resolution = @line = null

  make: () ->

    # Look up range of nearest view to inherit from
    @inherit = @_inherit 'view.range'
    @array   = @_attached 'data.source', Array

    # Build transform chain
    position = @_shaders.shader()

    # Fetch position and transform to view
    @array.shader p
    @_transform position

    # Make line renderable
    samples = @buffer.space
    @resolution = 1 / detail

    lineUniforms =
      lineWidth:      @model.attributes['line.width']
      lineColor:      @model.attributes['style.color']
      lineOpacity:    @model.attributes['style.opacity']

    @line = @_factory.make 'line',
              uniforms: lineUniforms
              samples:  samples
              position: position

    @_render @line

  unmake: () ->
    @_unrender @line
    @line.dispose()
    @line    = null

    @array   = null
    @inherit = null

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

module.exports = Curve