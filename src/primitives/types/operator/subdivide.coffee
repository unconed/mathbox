Operator = require './operator'
Util     = require '../../../util'

class Subdivide extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'subdivide']

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

    dims.items--
    dims.width--
    dims.height--
    dims.depth--

    dims.items  *= r.items  if r.items?
    dims.width  *= r.width  if r.width?
    dims.height *= r.height if r.height?
    dims.depth  *= r.depth  if r.depth?

    dims.items++
    dims.width++
    dims.height++
    dims.depth++

    dims

  make: () ->
    super
    return unless @bind.source?

    # Get resampled dimensions
    {size, items, width, height, depth, lerp} = @props

    @resampled = {}
    @resampled.items  = items  if items?
    @resampled.width  = width  if width?
    @resampled.height = height if height?
    @resampled.depth  = depth  if depth?

    # Build shader to resample data
    operator = @_shaders.shader()
    indexer  = @_shaders.shader()

    # Uniforms
    uniforms =
      resampleFactor:   @_attributes.make @_types.vec4(0, 0, 0, 0)
      subdivideBevel:   @node.attributes['subdivide.bevel']

    @resampleFactor   = uniforms.resampleFactor
    @resampleBias     = uniforms.resampleBias

    # Has resize props?
    resize  = items? or width? or height? or depth?

    # Addressing relative to target
    if resize
      operator.pipe 'resample.relative', uniforms
      indexer .pipe 'resample.relative', uniforms
    else
      operator.pipe Util.GLSL.identity 'vec4'
      indexer .pipe Util.GLSL.identity 'vec4'

    # Make sampler
    sampler = @bind.source.sourceShader @_shaders.shader()
    lerp = if lerp then '.lerp' else ''

    # Iterate over dimensions (items, width, height, depth)
    for key, i in ['width', 'height', 'depth', 'items']
      id = "subdivide.#{key}#{lerp}"

      if @props[key]?
        sampler = @_shaders.shader().require sampler
        sampler.pipe id, uniforms

    # Combine operator and composite lerp sampler
    operator.pipe sampler

    @operator = operator
    @indexer  = indexer

  unmake: () ->
    super
    @operator = null

  resize: () ->
    return unless @bind.source?

    dims   = @bind.source.getActiveDimensions()
    target = @getActiveDimensions()

    axis = (key) -> Math.max(1, dims[key] - 1) / Math.max 1, target[key] - 1

    rw = axis 'width'
    rh = axis 'height'
    rd = axis 'depth'
    ri = axis 'items'

    @resampleFactor.value.set   rw, rh, rd, ri

    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator'] or
                         touched['subdivide']

module.exports = Subdivide
