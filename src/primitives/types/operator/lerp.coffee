Operator = require './operator'

class Lerp extends Operator
  @traits: ['node', 'bind', 'operator', 'source', 'lerp']

  sourceShader: (shader) ->
    shader.pipe @operator

  getDimensions: () ->
    @_resample @bind.source.getDimensions()

  getActive: () ->
    @_resample @bind.source.getActive()

  _resample: (dims) ->
    r = @resample
    items:  r.items  * dims.items
    width:  r.width  * dims.width
    height: r.height * dims.height
    depth:  r.depth  * dims.depth

  make: () ->
    super

    # Build shader to resample data one dimension at a time
    transform = @_shaders.shader()
    @bind.source.sourceShader transform

    # Resampling ratios
    @resample = {}

    # Iterate over dimensions (items, width, height, depth)
    dims = @bind.source.getDimensions()
    for key of dims
      id = "lerp.#{key}"
      size = @_get(id) ? dims[key]

      @resample[key] = size / dims[key]

      if size != dims[key]
        uniforms =
          sampleRatio: @_attributes.make @_types.number (dims[key] - 1) / (size - 1)

        transform = @_shaders.shader().import transform
        transform.pipe id, uniforms

    @operator = transform

    # Notify of reallocation
    @trigger
      type: 'rebuild'

  unmake: () ->
    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['lerp']


module.exports = Lerp
