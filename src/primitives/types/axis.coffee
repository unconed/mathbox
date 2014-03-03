Primitive = require('../primitive')

class Axis extends Primitive
  @traits: ['object', 'style', 'line', 'axis']

  constructor: (model, attributes, factory) ->
    super model, attributes, factory

    @line   = null

  _make: () ->

    @inherit = @_inherit 'view.range'

    detail = @model.get 'axis.detail'
    samples = detail + 1
    resolution = 1 / detail

    types = @_attributes.types
    uniforms =
      lineWidth:      @model.attributes['line.width']
      lineColor:      @model.attributes['style.color']
      lineOpacity:    @model.attributes['style.opacity']
      axisPosition:   @_attributes.make types.vec4()
      axisStep:       @_attributes.make types.vec4()

    @axisPosition   = uniforms.axisPosition.value
    @axisStep       = uniforms.axisStep.value
    @resolution     = 1 / detail

    @line = @_factory.make 'line',
              uniforms: uniforms
              samples:  samples

    @_render @line

  _unmake: () ->
    @_unrender @line
    @line.dispose()
    @line = null

    @_unherit()

  _change: (changed, first) ->
    @rebuild() if changed['axis.detail']?

    if changed['view.range']? or
       changed['axis.range']? or
       changed['axis.dimension']? or
       changed['axis.inherit']? or
       first

      inherit   = @model.get 'axis.inherit'
      dimension = @model.get 'axis.dimension'

      if inherit and @inherit
        ranges = @inherit.model.get 'view.range'
        range  = ranges[dimension - 1]
      else
        range  = @model.get 'axis.range'

      min = range.x
      max = range.y

      x = if dimension == 1 then 1 else 0
      y = if dimension == 2 then 1 else 0
      z = if dimension == 3 then 1 else 0
      w = if dimension == 4 then 1 else 0

      @axisPosition.set(x, y, z, w).multiplyScalar(min)
      @axisStep.set(x, y, z, w).multiplyScalar((max - min) * @resolution)

module.exports = Axis