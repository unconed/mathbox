Operator = require './operator'

class Join extends Operator
  @traits: ['node', 'bind', 'operator', 'source', 'join']

  shader: (shader) ->
    shader.concat @transform

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

    # Build shader to repeat along all dimensions
    transform = @_shaders.shader()

    # Split multipliers/resampling ratio
    @split    = width: 1, height: 1, depth: 1, items: 1
    @resample = width: 1, height: 1, depth: 1, items: 1

    # Split across all 4 dimensions
    uniforms =
      splitModulus:    @_attributes.make @_types.vec4()
      splitScale:      @_attributes.make @_types.vec4()
      splitDimensions: @_attributes.make @_types.vec4()

    @splitModulus   = uniforms.splitModulus
    @splitScale     = uniforms.splitScale
    @splitDimension = uniforms.splitDimension

    transform.call 'split.position', uniforms
    @bind.source.shader transform

    @transform = transform

    # Notify of reallocation
    @trigger
      event: 'rebuild'

  unmake: () ->
    super

  resize: () ->
    @change {}, {}, true
    super

  change: (changed, touched, init) ->
    if touched['repeat'] or
       init

      split    = @split
      resample = @resample

      dims = @bind.source.getDimensions()
      for key of dims
        id = "split.#{key}"
        split[key] = @_get id

      @splitScale     .value.set 1/split.items, 1/split.width, 1/split.height, 1
      @splitModulus   .value.set split.items, split.width, split.height, 1
      @splitDimensions.value.set dims.width, dims.height, dims.depth, dims.items

      @resample.items  = 1            / split.items
      @resample.width  = split.items  / split.width
      @resample.height = split.width  / split.height
      @resample.depth  = split.height / 1

      # Rebuild geometry downstream
      @trigger
        event: 'rebuild'

module.exports = Join
