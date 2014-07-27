Operator = require './operator'

class Repeat extends Operator
  @traits: ['node', 'bind', 'operator', 'source', 'repeat']

  sourceShader: (shader) ->
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

    # Repeat multipliers
    @resample = {}

    # Modulus on all 4 dimensions
    uniforms =
      repeatModulus: @_attributes.make @_types.vec4()

    @repeatModulus = uniforms.repeatModulus

    transform.pipe 'repeat.position', uniforms
    @bind.source.sourceShader transform

    @transform = transform

    # Notify of reallocation
    @trigger
      event: 'rebuild'

  unmake: () ->
    super

  resize: () ->
    @refresh()
    super

  change: (changed, touched, init) ->
    if touched['repeat'] or
       init

      dims = @bind.source.getDimensions()
      for key of dims
        id = "repeat.#{key}"
        @resample[key] = @_get id

      @repeatModulus.value.set dims.width, dims.height, dims.depth, dims.items

      # Rebuild all geometry downstream (TODO: make this work better)
      @trigger
        event: 'rebuild'

module.exports = Repeat
