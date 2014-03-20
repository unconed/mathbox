Primitive = require('../primitive')
Util      = require '../../util'
Types     = require('./types')

class Grid extends Primitive
  @traits: ['object', 'style', 'line', 'grid',
            'axis:x.axis',   'axis:y.axis',
            'scale:x.scale', 'scale:y.scale',
            'span:x.span',   'span:y.span']
  @EXCESS: 2.5

  constructor: (model, attributes, factory, shaders) ->
    super model, attributes, factory, shaders

    @quads       = []
    @resolutions = []
    @lines       = []
    @buffers     = []
    @axes        = []

  _make: () ->

    # Look up range of nearest view to inherit from
    @inherit = @_inherit 'view.range'

    axis = (first, second) =>
      # Prepare data buffer of tick positions
      detail   = @model.get first  + 'axis.detail'
      samples = detail + 1
      resolution = 1 / detail

      divide  = @model.get second + 'scale.divide'
      ribbons = divide * Grid.EXCESS

      buffer = @_factory.make 'databuffer',
               samples:  ribbons
               channels: 1

      @resolutions.push resolution
      @buffers    .push buffer

      # Prepare position shader
      types = @_attributes.types
      positionUniforms =
        gridPosition:  @_attributes.make types.vec4()
        gridStep:      @_attributes.make types.vec4()
        gridAxis:      @_attributes.make types.vec4()

      @axes.push
        gridPosition: positionUniforms.gridPosition.value
        gridStep:     positionUniforms.gridStep.value
        gridAxis:     positionUniforms.gridAxis.value

      # Build transform chain
      p = position = @_shaders.shader()

      # Collect buffer sampler as callback
      p.callback();
      buffer.shader p
      p.join()

      # Calculate grid position
      p.call 'grid.position', positionUniforms

      # Apply view transform
      @_transform position

      ###
      debug = @_factory.make 'debug',
               map: buffer.texture.textureObject
      @_render debug
      ###

      # Make line renderable
      lineUniforms =
        lineWidth:      @model.attributes['line.width']
        lineColor:      @model.attributes['style.color']
        lineOpacity:    @model.attributes['style.opacity']

      @quads.push samples - 1

      line = @_factory.make 'line',
                uniforms: lineUniforms
                samples:  samples
                strips:   1
                ribbons:  ribbons
                position: position

      @_render line
      @lines.push line

    first  = @model.get 'grid.first'
    second = @model.get 'grid.second'

    first  && axis 'x.', 'y.'
    second && axis 'y.', 'x.'

  _unmake: () ->
    for buffer in @buffers
      buffer.dispose()

    for line in @lines
      @_unrender line
      line.dispose()

    @resolutions = []
    @lines       = []
    @buffers     = []
    @axes        = []

  _change: (changed) ->

    return @rebuild() if changed['x.axis.detail']? or
                         changed['y.axis.detail']? or
                         changed['grid.first']?    or
                         changed['grid.second']?

    setDimension = (vec, dimension) ->
      x = if dimension == 1 then 1 else 0
      y = if dimension == 2 then 1 else 0
      z = if dimension == 3 then 1 else 0
      w = if dimension == 4 then 1 else 0
      vec.set x, y, z, w

    getRange = (prefix, dimension) =>
      inherit = @model.get prefix + 'span.inherit'

      if inherit and @inherit
        ranges = @inherit.get 'view.range'
        range  = ranges[dimension - 1]
      else
        range  = @model.get prefix + 'span.range'

      range

    axis = (first, second, x, y, range1, range2, resolution, buffer, line, axis, quads) =>

      min    = range1.x
      max    = range1.y
      setDimension(axis.gridPosition, x).multiplyScalar(min)
      setDimension(axis.gridStep,     x).multiplyScalar((max - min) * resolution)

      min    = range2.x
      max    = range2.y

      divide = @model.get second + 'scale.divide'
      unit   = @model.get second + 'scale.unit'
      base   = @model.get second + 'scale.base'
      mode   = @model.get second + 'scale.mode'

      setDimension axis.gridAxis, y

      ticks = Util.Ticks.make mode, min, max, divide, unit, base, true, 0
      buffer.copy ticks

      n = ticks.length
      line.geometry.clip 0, n * quads

    axes = @model.get 'grid.axes'
    range1 = getRange 'x.', axes.x
    range2 = getRange 'y.', axes.y

    first  = @model.get 'grid.first'
    second = @model.get 'grid.second'

    j = 0
    if first
      axis 'x.', 'y.', axes.x, axes.y, range1, range2, @resolutions[0], @buffers[0], @lines[0], @axes[0], @quads[0]
      j = 1
    if second
      axis 'y.', 'x.', axes.y, axes.x, range2, range1, @resolutions[j], @buffers[j], @lines[j], @axes[j], @quads[j]

module.exports = Grid
