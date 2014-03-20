Primitive = require '../primitive'
Util      = require '../../util'

class Ticks extends Primitive
  @traits: ['object', 'style', 'line', 'ticks', 'span', 'scale']
  @EXCESS: 2.5

  constructor: (model, attributes, factory, shaders) ->
    super model, attributes, factory, shaders

    @tickAxis = @tickNormal = @resolution = @line = null

  _make: () ->

    # Look up range of nearest view to inherit from
    @inherit = @_inherit 'view.range'

    # Prepare data buffer of tick positions
    divide = @model.get 'scale.divide'
    @resolution = samples = divide * Ticks.EXCESS

    @buffer = @_factory.make 'databuffer',
              samples:  samples
              channels: 1

    # Prepare position shader
    types = @_attributes.types
    positionUniforms =
      tickSize:    @model.attributes['ticks.size']
      tickAxis:    @_attributes.make types.vec4()
      tickNormal:  @_attributes.make types.vec4()

    @tickAxis   = positionUniforms.tickAxis.value
    @tickNormal = positionUniforms.tickNormal.value

    # Build transform chain
    p = position = @_shaders.shader()
    p.split()

    # Collect view transform as callback
    p  .callback();
    @_transform position
    p  .join()
    p.next()

    # Collect buffer sampler as callback
    p  .callback();
    @buffer.shader p
    p  .join()

    ###
    @debug = @_factory.make 'debug',
             map: @buffer.texture.textureObject
    @_render @debug
    ###

    # Link to tick shader
    p.join()
    p.call 'ticks.position', positionUniforms

    # Make line renderable
    lineUniforms =
      lineWidth:      @model.attributes['line.width']
      lineColor:      @model.attributes['style.color']
      lineOpacity:    @model.attributes['style.opacity']

    @line = @_factory.make 'line',
              uniforms: lineUniforms
              samples:  2
              strips:   1
              ribbons:  samples
              position: position

    @_render @line

  _unmake: () ->
    @_unrender @line
    @line.dispose()
    @line = null

    @tickAxis = @tickNormal = null

    @_unherit()

  _change: (changed, first) ->
    @rebuild() if changed['scale.divide']?

    if changed['view.range']?      or
       changed['span.range']?      or
       changed['span.inherit']?    or
       changed['ticks.dimension']? or
       changed['scale.divide']?    or
       changed['scale.unit']?      or
       changed['scale.base']?      or
       changed['scale.mode']?      or
       first

      inherit   = @model.get 'span.inherit'
      dimension = @model.get 'ticks.dimension'

      if inherit and @inherit
        ranges = @inherit.get 'view.range'
        range  = ranges[dimension - 1]
      else
        range  = @model.get 'span.range'

      min = range.x
      max = range.y

      x = if dimension == 1 then 1 else 0
      y = if dimension == 2 then 1 else 0
      z = if dimension == 3 then 1 else 0
      w = if dimension == 4 then 1 else 0

      @tickAxis
        .set(x, y, z, w)
      @tickNormal
        .set(y, z + x, w, 0)

      divide = @model.get 'scale.divide'
      unit   = @model.get 'scale.unit'
      base   = @model.get 'scale.base'
      mode   = @model.get 'scale.mode'

      ticks = Util.Ticks.make mode, min, max, divide, unit, base, true, 0
      @buffer.copy ticks

      n = ticks.length
      line.geometry.clip 0, n * 2

module.exports = Ticks