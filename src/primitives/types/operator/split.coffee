Operator = require './operator'

class Split extends Operator
  @traits: ['node', 'bind', 'operator', 'source', 'split']

  shader: (shader) ->
    shader.concat @transform

  getDimensions: () ->
    @_resample @bind.source.getDimensions()

  getActive: () ->
    @_resample @bind.source.getActive()

  _resample: (dims) ->
    step  = @step
    split = @split
    items:  split.items
    width:  dims.width * Math.floor((dims.items - step.overlap) / step.items)
    height: r.height
    depth:  r.depth  * dims.depth

  make: () ->
    super

    # Build shader to repeat along all dimensions
    transform = @_shaders.shader()

    # Split steps/multipliers/resampling ratio
    @step     = width: 1, height: 1, depth: 1, items: 1
    @split    = width: 1, height: 1, depth: 1, items: 1
    @resample = width: 1, height: 1, depth: 1, items: 1

    # Split on one dimension
    uniforms =
      splitModulus:    @_attributes.make @_types.vec4()
      splitScale:      @_attributes.make @_types.vec4()
      splitDimensions: @_attributes.make @_types.vec4()

    @splitModulus    = uniforms.splitModulus
    @splitScale      = uniforms.splitScale
    @splitDimensions = uniforms.splitDimensions

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
    if touched['split'] or
       init

      step     = @step
      split    = @split
      resample = @resample

      overlap = @_get 'split.overlap'
      dims = @bind.source.getDimensions()
      for key of dims
        id = "split.#{key}"
        split[key] = @_get id
        step[key]  = if split[key] then split[key] - overlap else null

      if split.items
        @splitScale     .value.x = 1/split.items
        @splitModulus   .value.x = split.items
        @splitDimensions.value.x = step.width

      @splitScale     .value.set 1, 1, 1, 1
      @splitModulus   .value.set split.items, split.width, split.height, 1
      @splitDimensions.value.x = step.width

      # Rebuild geometry downstream
      @trigger
        event: 'rebuild'

module.exports = Split
