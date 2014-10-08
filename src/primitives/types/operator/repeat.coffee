Operator = require './operator'

class Repeat extends Operator
  @traits: ['node', 'bind', 'operator', 'source', 'repeat']

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
    return unless @bind.source?

    # Build shader to repeat along all dimensions
    transform = @_shaders.shader()

    # Repeat multipliers
    @resample = {}

    # Modulus on all 4 dimensions
    uniforms =
      repeatModulus: @_attributes.make @_types.vec4()

    @repeatModulus = uniforms.repeatModulus

    transform.pipe 'repeat.position', uniforms
    @bind.source.sourceShader transform

    @operator = transform

    # Notify of reallocation
    @trigger
      type: 'source.rebuild'

  unmake: () ->
    super

  resize: () ->
    @refresh()
    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator']

    if @bind.source
      dims = @bind.source.getActive()
      @repeatModulus.value.set dims.width, dims.height, dims.depth, dims.items

    if touched['repeat'] or
       init

      for key of @getDimensions()
        id = "repeat.#{key}"
        @resample[key] = @_get id

      # Rebuild all geometry downstream (TODO: make this work better)
      if !init
        @trigger
          type: 'source.rebuild'

module.exports = Repeat
