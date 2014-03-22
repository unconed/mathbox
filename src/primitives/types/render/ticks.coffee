Primitive = require '../../primitive'
Util = require '../../../util'

class Ticks extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'ticks', 'span', 'scale']
  @EXCESS: 2.5

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @tickAxis = @tickNormal = @resolution = @line = null

  make: () ->

    @_helper.span.make()

    # Prepare data buffer of tick positions
    divide = @_get 'scale.divide'
    @resolution = samples = divide * Ticks.EXCESS

    @buffer = @_factory.make 'databuffer',
              samples:  samples
              channels: 1

    # Prepare position shader
    types = @_attributes.types
    positionUniforms =
      tickSize:    @node.attributes['ticks.size']
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
    lineUniforms = @_helper.line.uniforms()
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

    @_helper.span.unmake()

  change: (changed, init) ->
    @rebuild() if changed['scale.divide']

    if changed['view.range']      or
       changed['ticks.dimension'] or
       changed['span']            or
       changed['scale']           or
       init

      # Fetch range along axis
      dimension = @_get 'ticks.dimension'
      range  = @_helper.span.get '', dimension

      # Calculate scale along axis
      min = range.x
      max = range.y
      Util.setDimension @tickAxis, dimension
      Util.setDimensionNormal @tickNormal, dimension
      ticks = @_helper.scale.generate '', @buffer, min, max

      # Clip to number of ticks
      n = ticks.length
      @line.geometry.clip 0, n

    @_helper.object.visible @line

module.exports = Ticks