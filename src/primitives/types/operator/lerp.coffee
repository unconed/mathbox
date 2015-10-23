Operator = require './operator'
Util     = require '../../../util'

class Lerp extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'lerp', 'sampler:x', 'sampler:y', 'sampler:z', 'sampler:w']

  indexShader:  (shader) ->
    shader.pipe @indexer
    super shader

  sourceShader: (shader) ->
    shader.pipe @operator

  getDimensions:       () -> @_resample @bind.source.getDimensions()
  getActiveDimensions: () -> @_resample @bind.source.getActiveDimensions()
  getFutureDimensions: () -> @_resample @bind.source.getFutureDimensions()
  getIndexDimensions:  () -> @_resample @bind.source.getIndexDimensions()

  _resample: (dims) ->
    r = @resampled
    c = @centered
    p = @padding

    if @relativeSize
      dims.items--  if !c.items
      dims.width--  if !c.width
      dims.height-- if !c.height
      dims.depth--  if !c.depth

      dims.items  *= r.items  if r.items?
      dims.width  *= r.width  if r.width?
      dims.height *= r.height if r.height?
      dims.depth  *= r.depth  if r.depth?

      dims.items++  if !c.items
      dims.width++  if !c.width
      dims.height++ if !c.height
      dims.depth++  if !c.depth

      dims.items  -= p.items  * 2
      dims.width  -= p.width  * 2
      dims.height -= p.height * 2
      dims.depth  -= p.depth  * 2

    else
      dims.items   = r.items  if r.items?
      dims.width   = r.width  if r.width?
      dims.height  = r.height if r.height?
      dims.depth   = r.depth  if r.depth?

    dims.items  = Math.max 0, Math.floor dims.items
    dims.width  = Math.max 0, Math.floor dims.width
    dims.height = Math.max 0, Math.floor dims.height
    dims.depth  = Math.max 0, Math.floor dims.depth

    dims

  make: () ->
    super
    return unless @bind.source?

    # Get resampled dimensions
    {size, items, width, height, depth} = @props

    # Sampler behavior
    relativeSize   = size   == @node.attributes['lerp.size'].enum.relative

    @resampled = {}
    @resampled.items  = items  if items?
    @resampled.width  = width  if width?
    @resampled.height = height if height?
    @resampled.depth  = depth  if depth?

    @centered  = {}
    @centered.items   = @props.centeredW
    @centered.width   = @props.centeredX
    @centered.height  = @props.centeredY
    @centered.depth   = @props.centeredZ

    @padding  = {}
    @padding.items    = @props.paddingW
    @padding.width    = @props.paddingX
    @padding.height   = @props.paddingY
    @padding.depth    = @props.paddingZ

    # Build shader to resample data
    operator = @_shaders.shader()
    indexer  = @_shaders.shader()

    # Uniforms
    uniforms =
      resampleFactor:   @_attributes.make @_types.vec4(0, 0, 0, 0)
      resampleBias:     @_attributes.make @_types.vec4(0, 0, 0, 0)

    @resampleFactor   = uniforms.resampleFactor
    @resampleBias     = uniforms.resampleBias

    # Has resize props?
    resize  = items? or width? or height? or depth?

    # Add padding
    operator.pipe 'resample.padding', uniforms

    # Prepare centered sampling offset
    vec = []
    any = false
    for key, i in ['width', 'height', 'depth', 'items']
      centered = @centered[key]
      any || = centered
      vec[i] = if centered then "0.5" else "0.0"

    # Add centered sampling offset (from source)
    if any and resize
      vec = "vec4(#{vec})"
      operator.pipe Util.GLSL.binaryOperator 4, '+', vec4
      indexer.pipe  Util.GLSL.binaryOperator 4, '+', vec4

    # Addressing relative to target
    if resize
      operator.pipe 'resample.relative', uniforms
      indexer .pipe 'resample.relative', uniforms
    else
      operator.pipe Util.GLSL.identity 'vec4'
      indexer .pipe Util.GLSL.identity 'vec4'

    # Remove centered sampling offset (to target)
    if any and resize
      operator.pipe Util.GLSL.binaryOperator 4, '-', vec
      indexer .pipe Util.GLSL.binaryOperator 4, '-', vec

    # Make sampler
    sampler = @bind.source.sourceShader @_shaders.shader()

    # Iterate over dimensions (items, width, height, depth)
    for key, i in ['width', 'height', 'depth', 'items']
      id = "lerp.#{key}"

      if @props[key]?
        sampler = @_shaders.shader().require sampler
        sampler.pipe id, uniforms

    # Combine operator and composite lerp sampler
    operator.pipe sampler

    @operator = operator
    @indexer  = indexer

    @relativeSize   = relativeSize

  unmake: () ->
    super
    @operator = null

  resize: () ->
    return unless @bind.source?

    dims   = @bind.source.getActiveDimensions()
    target = @getActiveDimensions()

    axis = (key) =>
      centered = @centered[key]
      pad      = @padding[key]

      target[key] += pad * 2

      res =
        if centered
          dims[key] / Math.max 1, target[key]
        else
          Math.max(1, dims[key] - 1) / Math.max 1, target[key] - 1
      [res, pad]

    [rw, bw] = axis 'width'
    [rh, bh] = axis 'height'
    [rd, bd] = axis 'depth'
    [ri, bi] = axis 'items'

    @resampleFactor.value.set   rw, rh, rd, ri
    @resampleBias.value.set     bw, bh, bd, bi

    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator'] or
                         touched['lerp'] or
                         touched['sampler']

module.exports = Lerp
