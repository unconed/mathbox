Operator = require './operator'

class Lerp extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'lerp', 'sampler:width', 'sampler:height', 'sampler:depth', 'sampler:items']

  indexShader: (shader) ->
    shader.pipe @indexer

  sourceShader: (shader) ->
    shader.pipe @operator

  getDimensions:       () -> @_resample @bind.source.getDimensions()
  getActiveDimensions: () -> @_resample @bind.source.getActiveDimensions()
  getFutureDimensions: () -> @_resample @bind.source.getFutureDimensions()
  getIndexDimensions:  () -> @_resample @bind.source.getIndexDimensions()

  _resample: (dims) ->
    r = @resample
    items:  Math.floor r.items  * dims.items
    width:  Math.floor r.width  * dims.width
    height: Math.floor r.height * dims.height
    depth:  Math.floor r.depth  * dims.depth

  make: () ->
    super
    return unless @bind.source?

    # Build shader to resample data one dimension at a time
    transform = @bind.source.sourceShader @_shaders.shader()

    # Build index-only shader
    indexer   = @_shaders.shader()

    # Resampling ratios
    @resample = {}

    # Iterate over dimensions (items, width, height, depth)
    dims = @bind.source.getDimensions()
    for key of dims
      id = "lerp.#{key}"
      size = @props[key] ? dims[key]

      @resample[key] = size / dims[key]

      centered = @_get "#{key}.sampler.centered"
      padding  = @_get "#{key}.sampler.padding"

      size += padding * 2

      if size != dims[key]
        ratio = if centered
                  dims[key] / Math.max 1, size
                else
                  Math.max(1, dims[key] - 1) / Math.max 1, size - 1
        uniforms =
          sampleRatio: @_attributes.make @_types.number ratio
          sampleBias:  @_attributes.make @_types.number ratio * padding

        transform = @_shaders.shader().require transform
        transform.pipe id, uniforms

    @operator = transform
    @indexer  = indexer

  unmake: () ->
    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['lerp'] or
                         touched['operator']


module.exports = Lerp
