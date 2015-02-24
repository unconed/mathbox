Primitive = require '../../primitive'
Util      = require '../../../util'

class Grid extends Primitive
  @traits = ['node', 'object', 'style', 'line', 'grid', 'area', 'position',
            'axis:x',  'axis:y',
            'scale:x', 'scale:y',
            'span:x',  'span:y']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @axes = null

  make: () ->

    axis = (first, second) =>
      # Prepare data buffer of tick positions
      detail     = @_get first + 'axis.detail'
      samples    = detail + 1
      resolution = 1 / detail

      strips = @_helpers.scale.divide second
      buffer = @_renderables.make 'dataBuffer',
               width:    strips
               channels: 1

      # Prepare position shader
      positionUniforms =
        gridPosition:  @_attributes.make @_types.vec4()
        gridStep:      @_attributes.make @_types.vec4()
        gridAxis:      @_attributes.make @_types.vec4()

      values =
        gridPosition: positionUniforms.gridPosition.value
        gridStep:     positionUniforms.gridStep.value
        gridAxis:     positionUniforms.gridAxis.value

      # Build transform chain
      p = position = @_shaders.shader()

      # Require buffer sampler as callback
      p.require buffer.shader @_shaders.shader(), 2

      # Calculate grid position
      p.pipe 'grid.position', positionUniforms

      # Apply view transform
      position = @_helpers.position.pipeline p

      # Prepare bound uniforms
      styleUniforms = @_helpers.style.uniforms()
      lineUniforms  = @_helpers.line.uniforms()
      uniforms      = Util.JS.merge lineUniforms, styleUniforms

      # Make line renderable
      line = @_renderables.make 'line',
                uniforms: uniforms
                samples:  samples
                strips:   strips
                position: position
                stroke:   stroke

      # Store axis object for manipulation later
      {first, second, resolution, samples, line, buffer, values}

    # Generate both line sets
    first  = @_get 'grid.first'
    second = @_get 'grid.second'

    # Stroke style
    stroke  = @_get 'line.stroke'

    @axes = []
    first  && @axes.push axis 'x.', 'y.'
    second && @axes.push axis 'y.', 'x.'

    # Register lines
    lines = (axis.line for axis in @axes)
    @_helpers.object.make lines
    @_helpers.span.make()
    
  unmake: () ->
    @_helpers.object.unmake()
    @_helpers.span.unmake()

    for axis in @axes
      axis.buffer.dispose()

    @axes = null

  change: (changed, touched, init) ->

    return @rebuild() if changed['x.axis.detail'] or
                         changed['y.axis.detail'] or
                         changed['grid.first']    or
                         changed['grid.second']   or
                         changed['line.stroke']

    axis = (x, y, range1, range2, axis) =>
      {first, second, resolution, samples, line, buffer, values} = axis

      # Set line steps along first axis
      min    = range1.x
      max    = range1.y
      Util.Axis.setDimension(values.gridPosition, x).multiplyScalar(min)
      Util.Axis.setDimension(values.gridStep,     x).multiplyScalar((max - min) * resolution)

      # Calculate scale along second axis
      min    = range2.x
      max    = range2.y
      ticks  = @_helpers.scale.generate second, buffer, min, max
      Util.Axis.setDimension values.gridAxis, y

      # Clip to number of ticks
      n = ticks.length
      line.geometry.clip samples, n, 1, 1

    if touched['x']    or
       touched['y']    or
       touched['area'] or
       touched['grid'] or
       touched['view'] or
       init

      # Fetch grid range in both dimensions
      axes   = @_get 'area.axes'
      range1 = @_helpers.span.get 'x.', axes[0]
      range2 = @_helpers.span.get 'y.', axes[1]

      # Update both line sets
      first  = @_get 'grid.first'
      second = @_get 'grid.second'

      if first
        axis axes[0], axes[1], range1, range2, @axes[0]
      if second
        axis axes[1], axes[0], range2, range1, @axes[+first]

module.exports = Grid
