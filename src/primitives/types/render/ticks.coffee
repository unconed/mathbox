Primitive = require '../../primitive'
Util = require '../../../util'

class Ticks extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'ticks', 'interval', 'span', 'scale']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @tickAxis = @tickNormal = @resolution = @line = null

  make: () ->

    # Prepare data buffer of tick positions
    @resolution = samples = @_helper.scale.divide ''

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

    # Link to tick shader
    p.join()
    p.call 'ticks.position', positionUniforms

    # Prepare bound uniforms
    styleUniforms = @_helper.style.uniforms()
    lineUniforms  = @_helper.line.uniforms()

    # Make line renderable
    @line = @_factory.make 'line',
              uniforms: @_helper.object.merge lineUniforms, styleUniforms
              samples:  2
              strips:   1
              ribbons:  samples
              position: position

    ###
    @debug = @_factory.make 'debug',
             map: @buffer.texture.textureObject
    @_render @debug
    ###

    @_helper.object.make [@line]
    @_helper.span.make()


  unmake: () ->
    @tickAxis = @tickNormal = null

    @_helper.object.unmake()
    @_helper.span.unmake()

  change: (changed, touched, init) ->
    @rebuild() if changed['scale.divide']

    if touched['view']     or
       touched['interval'] or
       touched['span']     or
       touched['scale']    or
       init

      # Fetch range along axis
      dimension = @_get 'interval.axis'
      range     = @_helper.span.get '', dimension

      # Calculate scale along axis
      min   = range.x
      max   = range.y
      ticks = @_helper.scale.generate '', @buffer, min, max

      Util.setDimension       @tickAxis,   dimension
      Util.setDimensionNormal @tickNormal, dimension

      # Clip to number of ticks
      n = ticks.length
      @line.geometry.clip 0, n

module.exports = Ticks