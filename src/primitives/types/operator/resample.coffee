Operator = require './operator'
Util     = require '../../../util'

class Resample extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'resample', 'sampler:width', 'sampler:height', 'sampler:depth', 'sampler:items']

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
    if @scaled
      dims.items  *= r.items  if r.items?
      dims.width  *= r.width  if r.width?
      dims.height *= r.height if r.height?
      dims.depth  *= r.depth  if r.depth?
    else
      dims.items   = r.items  if r.items?
      dims.width   = r.width  if r.width?
      dims.height  = r.height if r.height?
      dims.depth   = r.depth  if r.depth?
    dims

  make: () ->
    super
    return unless @bind.source?

    # Bind to attached shader
    @_helpers.bind.make [
      { to: 'resample.shader', trait: 'shader', optional: true }
    ]

    # Get custom shader
    indices    = @_get 'resample.indices'
    dimensions = @_get 'resample.channels'
    shader     = @bind.shader

    # Get resampled dimensions (if any)
    map    = @_get 'resample.map'
    unit   = @_get 'resample.unit'
    items  = @_get 'resample.items'
    width  = @_get 'resample.width'
    height = @_get 'resample.height'
    depth  = @_get 'resample.depth'

    # Sampler behavior
    relativeMap  = map  == @node.attributes['resample.map'] .enum.relative
    relativeUnit = unit == @node.attributes['resample.unit'].enum.relative

    @resampled = {}
    @resampled.items  = items  if items?
    @resampled.width  = width  if width?
    @resampled.height = height if height?
    @resampled.depth  = depth  if depth?

    # Build shader to resample data
    operator = @_shaders.shader()
    indexer  = @_shaders.shader()

    # Uniforms
    type = [null, @_types.number, @_types.vec2, @_types.vec3, @_types.vec4][indices]
    uniforms =
      dataSize:         @_attributes.make type(0, 0, 0, 0)
      dataResolution:   @_attributes.make type(0, 0, 0, 0)
      dataOffset:       @_attributes.make @_types.vec2(.5, .5)

      targetSize:       @_attributes.make type(0, 0, 0, 0)
      targetResolution: @_attributes.make type(0, 0, 0, 0)
      targetOffset:     @_attributes.make @_types.vec2(.5, .5)

      resampleFactor:   @_attributes.make @_types.vec4(0, 0, 0, 0)
      resampleBias:     @_attributes.make @_types.vec4(0, 0, 0, 0)

    @dataResolution   = uniforms.dataResolution
    @dataSize         = uniforms.dataSize
    @targetResolution = uniforms.targetResolution
    @targetSize       = uniforms.targetSize
    @resampleFactor   = uniforms.resampleFactor
    @resampleBias     = uniforms.resampleBias

    shifted = false

    # Add padding
    operator.pipe 'resample.padding', uniforms

    # Add centered sampling offset
    vec = []
    any = false
    for key, i in ['width', 'height', 'depth', 'items']
      centered = @_get "#{key}.sampler.centered"
      any || = centered
      vec[i] = if centered then "0.5" else "0.0"

    if any
      shifted = true
      vec = "vec4(#{vec})"
      operator.pipe Util.GLSL.binaryOperator 4, '+', vec4

    if relativeMap
      # Addressing relative to target
      if items? or width? or height? or depth?
        operator.pipe 'resample.relative', uniforms
        indexer .pipe 'resample.relative', uniforms
      else
        indexer .pipe Util.GLSL.identity 'vec4'

    if shader?
      operator.pipe Util.GLSL.truncateVec 4, indices             if indices != 4

      operator.callback()
      operator.pipe Util.GLSL.extendVec indices, 4               if indices != 4
      operator.pipe Util.GLSL.binaryOperator 4, '-', vec         if shifted
      operator.pipe @bind.source.sourceShader @_shaders.shader()
      operator.pipe Util.GLSL.truncateVec 4, dimensions          if dimensions != 4
      operator.join()

      operator.pipe @bind.shader.shaderBind uniforms             if @bind.shader?

      operator.pipe Util.GLSL.extendVec dimensions, 4            if dimensions != 4
    else
      operator.pipe Util.GLSL.binaryOperator 4, '-', vec         if shifted
      operator.pipe @bind.source.sourceShader @_shaders.shader()

    @operator = operator
    @indexer  = indexer
    @indices  = indices
    @scaled   = relativeUnit

  unmake: () ->
    super
    @operator = null

  resize: () ->
    return unless @bind.source?

    dims   = @bind.source.getActiveDimensions()
    target = @getActiveDimensions()

    axis = (key) =>
      centered = @_get "#{key}.sampler.centered"
      pad      = @_get "#{key}.sampler.padding"

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

    if @indices == 1
      @dataResolution  .value = 1 / dims.width
      @targetResolution.value = 1 / target.width

      @dataSize  .value       = dims.width
      @targetSize.value       = target.width

      @resampleFactor.value   = rw
      @resampleBias.value     = bw

    else
      @dataResolution  .value.set 1 / dims.width, 1 / dims.height, 1 / dims.depth, 1 / dims.items
      @targetResolution.value.set 1 / target.width, 1 / target.height, 1 / target.depth, 1 / target.items

      @dataSize   .value.set      dims.width, dims.height, dims.depth, dims.items
      @targetSize .value.set      target.width, target.height, target.depth, target.items

      @resampleFactor.value.set   rw, rh, rd, ri
      @resampleBias.value.set     bw, bh, bd, bi

    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator'] or
                         touched['resample'] or
                         touched['sampler']

module.exports = Resample
