Primitive = require('../primitive')
#Shader = require('shadergraph').Shader

class Axis extends Primitive
  @traits: ['object', 'style', 'line', 'axis']

  constructor: (model, attributes, factory, shaders) ->
    super model, attributes, factory, shaders

    @axisPosition = @axisStep = @resolution = @line = null

  _make: () ->

    @inherit = @_inherit 'view.range'

    # Position shader
    types = @_attributes.types
    positionUniforms =
      axisPosition:   @_attributes.make types.vec4()
      axisStep:       @_attributes.make types.vec4()

    @axisPosition   = positionUniforms.axisPosition.value
    @axisStep       = positionUniforms.axisStep.value

    position = @_shaders.shader()
    position.call 'axis.position', positionUniforms
    @_transform position

    # Line geometry
    detail = @model.get 'axis.detail'
    samples = detail + 1
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
        ranges = @inherit.get 'view.range'
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