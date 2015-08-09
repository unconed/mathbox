Primitive = require '../../primitive'
Util      = require '../../../util'

class Scale extends Primitive
  @traits = ['node', 'source', 'index', 'interval', 'span', 'scale', 'raw']

  init: () ->
    @used = @space = @scaleAxis = @sampler = null

  rawBuffer: () -> @buffer

  sourceShader: (shader) -> shader.pipe @sampler
  indexShader:  (shader) -> shader.pipe Util.GLSL.identity 'vec4'

  getDimensions: () ->
    items:  1
    width:  @space
    height: 1
    depth:  1

  getActiveDimensions: () ->
    items:  1
    width:  @used
    height: @buffer.getFilled()
    depth:  1

  getRawDimensions: () -> @getDimensions()

  make: () ->

    # Prepare data buffer of tick positions
    @space = samples = @_helpers.scale.divide ''

    @buffer = @_renderables.make 'dataBuffer',
              width:    samples
              channels: 1
              items:    1

    # Prepare position shader
    positionUniforms =
      scaleAxis:    @_attributes.make @_types.vec4()

    @scaleAxis = positionUniforms.scaleAxis.value

    # Build sampler
    p = @sampler = @_shaders.shader()
    # Require buffer sampler as callback
    p.require @buffer.shader @_shaders.shader(), 1
    # Shader to expand scalars to 4D vector on an axis.
    p.pipe 'scale.position', positionUniforms

    @_helpers.span.make()

  unmake: () ->
    @scaleAxis = null

    @_helpers.span.unmake()

  change: (changed, touched, init) ->
    return @rebuild() if changed['scale.divide']

    if touched['view']     or
       touched['interval'] or
       touched['span']     or
       touched['scale']    or
       init

      used = @used

      # Fetch range along axis
      dimension = @props.axis
      range     = @_helpers.span.get '', dimension

      # Calculate scale along axis
      min   = range.x
      max   = range.y
      ticks = @_helpers.scale.generate '', @buffer, min, max

      Util.Axis.setDimension @scaleAxis, dimension

      # Clip to number of ticks
      @used = ticks.length

      # Notify of resize
      if @used != used
        @trigger
          type: 'source.resize'

module.exports = Scale