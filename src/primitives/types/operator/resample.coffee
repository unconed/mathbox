Operator = require './operator'
Util     = require '../../../util'

class Resample extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'resample', 'sampler']

  indexShader:  (shader) ->
    shader.pipe @indexer
    super shader

  sourceShader: (shader) ->
    shader.pipe @operator

  getDimensions: () ->
    @_resample @bind.source.getDimensions()

  getActiveDimensions: () ->
    @_resample @bind.source.getActiveDimensions()

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
    scale  = @_get 'resample.scale'
    items  = @_get 'resample.items'
    width  = @_get 'resample.width'
    height = @_get 'resample.height'
    depth  = @_get 'resample.depth'

    # Sampler behavior
    centered = @_get 'sampler.centered'
    relativeMap   = map   == @node.attributes['resample.map']  .enum.relative
    relativeScale = scale == @node.attributes['resample.scale'].enum.relative

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

      resampleFactor:   @_attributes.make type(0, 0, 0, 0)

    @dataResolution   = uniforms.dataResolution
    @dataSize         = uniforms.dataSize
    @targetResolution = uniforms.targetResolution
    @targetSize       = uniforms.targetSize
    @resampleFactor   = uniforms.resampleFactor

    shifted = false

    if relativeMap
      # Addressing relative to target
      if items? or width? or height? or depth?
        if centered
          shifted = true
          operator.pipe Util.GLSL.binaryOperator 'vec4', '+', '.5'
          indexer .pipe Util.GLSL.binaryOperator 'vec4', '+', '.5'
        operator.pipe 'resample.relative', uniforms
        indexer .pipe 'resample.relative', uniforms
      else
        indexer .pipe Util.GLSL.identity 'vec4'

    if shader?
      operator.pipe Util.GLSL.truncateVec 4, indices             if indices != 4
      operator.pipe Util.GLSL.binaryOperator indices, '+', '.5'  if centered and !shifted

      operator.callback()
      operator.pipe Util.GLSL.binaryOperator indices, '-', '.5'  if shifted
      operator.pipe Util.GLSL.extendVec indices, 4               if indices != 4
      operator.pipe @bind.source.sourceShader @_shaders.shader()
      operator.pipe Util.GLSL.truncateVec 4, dimensions          if dimensions != 4
      operator.join()

      operator.pipe @bind.shader.shaderBind uniforms             if @bind.shader?

      operator.pipe Util.GLSL.extendVec dimensions, 4            if dimensions != 4
    else
      operator.pipe Util.GLSL.binaryOperator 'vec4', '-', '.5'   if shifted
      operator.pipe @bind.source.sourceShader @_shaders.shader()

    @operator = operator
    @indexer  = indexer
    @indices  = indices
    @centered = centered
    @scaled   = relativeScale

  unmake: () ->
    super
    @operator = null

  resize: () ->
    return unless @bind.source?

    dims   = @bind.source.getActiveDimensions()
    target = @getActiveDimensions()

    if @centered
      ri = dims.items  / Math.max 1, target.items
      rw = dims.width  / Math.max 1, target.width
      rh = dims.height / Math.max 1, target.height
      rd = dims.depth  / Math.max 1, target.depth
    else
      ri = (dims.items  - 1) / Math.max 1, target.items  - 1
      rw = (dims.width  - 1) / Math.max 1, target.width  - 1
      rh = (dims.height - 1) / Math.max 1, target.height - 1
      rd = (dims.depth  - 1) / Math.max 1, target.depth  - 1

    if @indices == 1
      @dataResolution  .value = 1 / dims.width
      @targetResolution.value = 1 / target.width

      @dataSize  .value       = dims.width
      @targetSize.value       = target.width

      @resampleFactor.value   = rw

    else
      @dataResolution  .value.set 1 / dims.width, 1 / dims.height, 1 / dims.depth, 1 / dims.items
      @targetResolution.value.set 1 / target.width, 1 / target.height, 1 / target.depth, 1 / target.items

      @dataSize   .value.set      dims.width, dims.height, dims.depth, dims.items
      @targetSize .value.set      target.width, target.height, target.depth, target.items

      @resampleFactor.value.set   rw, rh, rd, ri

    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator'] or
                         touched['resample'] or
                         touched['sampler']

module.exports = Resample
