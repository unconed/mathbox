Primitive = require '../../primitive'

class Ticks extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'ticks', 'span', 'scale']
  @EXCESS: 2.5

  constructor: (model, attributes, factory, shaders) ->
    super model, attributes, factory, shaders

    @tickAxis = @tickNormal = @resolution = @line = null

  make: () ->

    # Look up range of nearest view to inherit from
    @inherit = @_inherit 'view.range'

    # Prepare data buffer of tick positions
    divide = @_get 'scale.divide'
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
    @transform position
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

  unmake: () ->
    @_unrender @line
    @line.dispose()
    @line = null

    @tickAxis = @tickNormal = null

    @_unherit()

  change: (changed, init) ->
    @rebuild() if changed['scale.divide']

    if changed['view.range']      or
       changed['ticks.dimension'] or
       changed['span']            or
       changed['scale']           or
       init

      dimension = @_get 'ticks.dimension'
      range  = @_helper.getSpanRange '', dimension

      min = range.x
      max = range.y

      @_helper.setDimension @tickAxis, dimension
      @_helper.setDimensionNormal @tickNormal, dimension
      ticks = @_helper.generateScale '', @buffer, min, max

      n = ticks.length
      @line.geometry.clip 0, n

    @_helper.setMeshVisible @line

module.exports = Ticks