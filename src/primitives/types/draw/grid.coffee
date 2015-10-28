Primitive = require '../../primitive'
Util      = require '../../../util'

class Grid extends Primitive
  @traits = ['node', 'object', 'visible', 'style', 'line', 'grid', 'area', 'position', 'origin', 'shade',
            'axis:x',  'axis:y',
            'scale:x', 'scale:y',
            'span:x',  'span:y']
  @defaults =
    width: 1
    zBias: -2

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @axes = null

  make: () ->

    # Build transition mask lookup
    mask = @_helpers.object.mask()

    # Build fragment material lookup
    material = @_helpers.shade.pipeline() || false

    axis = (first, second, transpose) =>
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

      # Align second grid with first in mask space if requested
      if transpose? and mask?
        mask = @_helpers.position.swizzle mask, transpose

      # Require buffer sampler as callback
      p.require buffer.shader @_shaders.shader(), 2

      # Calculate grid position
      p.pipe 'grid.position', positionUniforms

      # Apply view transform
      position = @_helpers.position.pipeline p

      # Prepare bound uniforms
      styleUniforms = @_helpers.style.uniforms()
      lineUniforms  = @_helpers.line.uniforms()
      unitUniforms  = @_inherit('unit').getUnitUniforms()
      uniforms      = Util.JS.merge lineUniforms, styleUniforms, unitUniforms

      # Make line renderable
      line = @_renderables.make 'line',
                uniforms: uniforms
                samples:  samples
                strips:   strips
                position: position
                stroke:   stroke
                join:     join
                mask:     mask
                material: material

      # Store axis object for manipulation later
      {first, second, resolution, samples, line, buffer, values}

    # Generate both line sets
    {lineX, lineY, crossed, axes} = @props
    transpose = ['0000', 'x000', 'y000', 'z000', 'w000'][axes[1]]

    # Stroke style
    {stroke, join}  = @props

    @axes = []
    lineX && @axes.push axis 'x.', 'y.', null
    lineY && @axes.push axis 'y.', 'x.', if crossed then null else transpose

    # Register lines
    lines = (axis.line for axis in @axes)
    @_helpers.visible.make()
    @_helpers.object.make lines
    @_helpers.span.make()

    # Monitor view range
    @_listen @, 'span.range', @updateRanges

  unmake: () ->
    @_helpers.visible.unmake()
    @_helpers.object.unmake()
    @_helpers.span.unmake()

    for axis in @axes
      axis.buffer.dispose()

    @axes = null

  change: (changed, touched, init) ->

    return @rebuild() if changed['x.axis.detail'] or
                         changed['y.axis.detail'] or
                         changed['x.axis.factor'] or
                         changed['y.axis.factor'] or
                         changed['grid.lineX']    or
                         changed['grid.lineY']    or
                         changed['line.stroke']   or
                         changed['line.join']     or
                         changed['grid.crossed']  or
                         (changed['grid.axes']    and @props.crossed)

    if touched['x']    or
       touched['y']    or
       touched['area'] or
       touched['grid'] or
       touched['view'] or
       init

      @updateRanges()

  updateRanges: () ->

    axis = (x, y, range1, range2, axis) =>
      {first, second, resolution, samples, line, buffer, values} = axis

      # Set line steps along first axis
      min    = range1.x
      max    = range1.y
      Util.Axis.setDimension(values.gridPosition, x).multiplyScalar(min)
      Util.Axis.setDimension(values.gridStep,     x).multiplyScalar((max - min) * resolution)

      # Add origin on remaining two axes
      Util.Axis.addOrigin values.gridPosition, axes, origin

      # Calculate scale along second axis
      min    = range2.x
      max    = range2.y
      ticks  = @_helpers.scale.generate second, buffer, min, max
      Util.Axis.setDimension values.gridAxis, y

      # Clip to number of ticks
      n = ticks.length
      line.geometry.clip samples, n, 1, 1

    # Fetch grid range in both dimensions
    {axes, origin} = @props
    range1 = @_helpers.span.get 'x.', axes[0]
    range2 = @_helpers.span.get 'y.', axes[1]

    # Update both line sets
    {lineX, lineY} = @props

    if lineX
      axis axes[0], axes[1], range1, range2, @axes[0]
    if lineY
      axis axes[1], axes[0], range2, range1, @axes[+lineX]


module.exports = Grid
