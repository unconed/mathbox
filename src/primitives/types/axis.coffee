Primitive = require('../primitive')

class Axis extends Primitive
  constructor: (options, attributes, factory) ->
    @_traits 'object', 'style', 'line', 'axis'
    super options, attributes, factory

    @line   = null

  _make: () ->

    @inherit = @_inherit 'view.range'

    detail = @get 'axis.detail'
    samples = detail + 1
    resolution = 1 / detail

    types = @_attributes.types
    uniforms =
      lineWidth:      @attributes['line.width']
      lineColor:      @attributes['style.color']
      lineOpacity:    @attributes['style.opacity']
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

      inherit   = @get 'axis.inherit'
      dimension = @get 'axis.dimension'

      if inherit and @inherit
        ranges = @inherit.get 'view.range'
        range  = ranges[dimension - 1]
      else
        range  = @get 'axis.range'

      min = range.x
      max = range.y

      x = if dimension == 1 then 1 else 0
      y = if dimension == 2 then 1 else 0
      z = if dimension == 3 then 1 else 0
      w = if dimension == 4 then 1 else 0

      @axisPosition.set(x, y, z, w).multiplyScalar(min)
      @axisStep.set(x, y, z, w).multiplyScalar((max - min) * @resolution)

module.exports = Axis