Primitive = require('../../primitive')
Util = require '../../../util'

class Grid extends Primitive
  @traits: ['node', 'object', 'style', 'line', 'grid', 'area', 'position',
            'axis:x.axis',   'axis:y.axis',
            'scale:x.scale', 'scale:y.scale',
            'span:x.span',   'span:y.span']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @axes        = []

  make: () ->

    axis = (first, second) =>
      # Prepare data buffer of tick positions
      detail   = @_get first  + 'axis.detail'
      samples = detail + 1
      resolution = 1 / detail

      ribbons = @_helper.scale.divide second

      buffer = @_factory.make 'databuffer',
               samples:  ribbons
               channels: 1

      # Prepare position shader
      types = @_attributes.types
      positionUniforms =
        gridPosition:  @_attributes.make types.vec4()
        gridStep:      @_attributes.make types.vec4()
        gridAxis:      @_attributes.make types.vec4()

      values =
        gridPosition: positionUniforms.gridPosition.value
        gridStep:     positionUniforms.gridStep.value
        gridAxis:     positionUniforms.gridAxis.value

      # Build transform chain
      p = position = @_shaders.shader()
      @_helper.position.make()

      # Collect buffer sampler as callback
      p.callback()
      buffer.shader p
      p.join()

      # Calculate grid position
      p.call 'grid.position', positionUniforms

      # Apply view transform
      @_helper.position.shader position
      @transform position

      # Prepare bound uniforms
      styleUniforms = @_helper.style.uniforms()
      lineUniforms  = @_helper.line.uniforms()

      # Make line renderable
      quads = samples - 1

      line = @_factory.make 'line',
                uniforms: @_helper.object.merge lineUniforms, styleUniforms
                samples:  samples
                strips:   1
                ribbons:  ribbons
                position: position

      # Store axis object for manipulation later
      {first, second, quads, resolution, line, buffer, values}

    # Generate both line sets
    first  = @_get 'grid.first'
    second = @_get 'grid.second'

    first  && @axes.push axis 'x.', 'y.'
    second && @axes.push axis 'y.', 'x.'

    # Register lines
    lines = (axis.line for axis in @axes)
    @_helper.object.make lines
    @_helper.span.make()


  unmake: () ->
    @_helper.object.unmake()
    @_helper.span.unmake()
    @_helper.position.unmake()

    for axis in @axes
      axis.buffer.dispose()
      @_unrender axis.line
      axis.line.dispose()

    @axes = []

  change: (changed, touched, init) ->

    @rebuild() if changed['x.axis.detail'] or
                  changed['y.axis.detail'] or
                  changed['grid.first']    or
                  changed['grid.second']

    axis = (x, y, range1, range2, axis) =>
      {first, second, quads, resolution, line, buffer, values} = axis

      # Set line steps along first axis
      min    = range1.x
      max    = range1.y
      Util.setDimension(values.gridPosition, x).multiplyScalar(min)
      Util.setDimension(values.gridStep,     x).multiplyScalar((max - min) * resolution)

      # Calculate scale along second axis
      min    = range2.x
      max    = range2.y
      ticks  = @_helper.scale.generate second, buffer, min, max
      Util.setDimension values.gridAxis, y

      # Clip to number of ticks
      n = ticks.length
      line.geometry.clip 0, n * quads

    if touched['x']    or
       touched['y']    or
       touched['area'] or
       touched['grid'] or
       touched['view'] or
       init

      # Fetch grid range in both dimensions
      axes   = @_get 'area.axes'
      range1 = @_helper.span.get 'x.', axes.x
      range2 = @_helper.span.get 'y.', axes.y

      # Update both line sets
      first  = @_get 'grid.first'
      second = @_get 'grid.second'

      if first
        axis axes.x, axes.y, range1, range2, @axes[0]
      if second
        axis axes.y, axes.x, range2, range1, @axes[+first]

module.exports = Grid
