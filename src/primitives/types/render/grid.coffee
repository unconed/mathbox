Primitive = require('../../primitive')

class Grid extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'grid',
            'axis:x.axis',   'axis:y.axis',
            'scale:x.scale', 'scale:y.scale',
            'span:x.span',   'span:y.span']
  @EXCESS: 2.5

  constructor: (model, attributes, factory, shaders) ->
    super model, attributes, factory, shaders

    @axes        = []

  make: () ->

    # Look up range of nearest view to inherit from
    @inherit = @_inherit 'view.range'

    axis = (first, second) =>
      # Prepare data buffer of tick positions
      detail   = @_get first  + 'axis.detail'
      samples = detail + 1
      resolution = 1 / detail

      divide  = @_get second + 'scale.divide'
      ribbons = divide * Grid.EXCESS

      buffer = @_factory.make 'databuffer',
               samples:  ribbons
               channels: 1

      # Prepare position shader
      types = @_attributes.types
      positionUniforms =
        gridPosition:  @_attributes.make types.vec4()
        gridStep:      @_attributes.make types.vec4()
        gridAxis:      @_attributes.make types.vec4()

      uniforms =
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
      @transform position

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

      quads = samples - 1

      line = @_factory.make 'line',
                uniforms: lineUniforms
                samples:  samples
                strips:   1
                ribbons:  ribbons
                position: position

      @_render line

      {first, second, quads, resolution, line, buffer, uniforms}

    first  = @_get 'grid.first'
    second = @_get 'grid.second'

    first  && @axes.push axis 'x.', 'y.'
    second && @axes.push axis 'y.', 'x.'

  unmake: () ->
    for axis in @axes
      axis.buffer.dispose()
      @_unrender axis.line
      axis.line.dispose()

    @axes = []

  change: (changed, init) ->

    @rebuild() if changed['x.axis.detail'] or
                  changed['y.axis.detail'] or
                  changed['grid.first']    or
                  changed['grid.second']

    axis = (x, y, range1, range2, axis) =>
      {first, second, quads, resolution, line, buffer, uniforms} = axis

      min    = range1.x
      max    = range1.y
      @_helper.setDimension(uniforms.gridPosition, x).multiplyScalar(min)
      @_helper.setDimension(uniforms.gridStep,     x).multiplyScalar((max - min) * resolution)

      min    = range2.x
      max    = range2.y

      @_helper.setDimension uniforms.gridAxis, y
      ticks = @_helper.generateScale second, buffer, min, max

      n = ticks.length
      line.geometry.clip 0, n * quads

    if changed['x']    or
       changed['y']    or
       changed['grid'] or
       changed['view'] or
       init

      axes = @_get 'grid.axes'
      range1 = @_helper.getSpanRange 'x.', axes.x
      range2 = @_helper.getSpanRange 'y.', axes.y

      first  = @_get 'grid.first'
      second = @_get 'grid.second'

      j = 0
      if first
        axis axes.x, axes.y, range1, range2, @axes[0]
        j = 1
      if second
        axis axes.y, axes.x, range2, range1, @axes[j]

    @_helper.setMeshVisible axis.line for axis in @axes

module.exports = Grid
