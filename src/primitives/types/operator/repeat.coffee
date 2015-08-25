Operator = require './operator'

class Repeat extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'repeat']

  indexShader:  (shader) ->
    shader.pipe @operator
    super shader

  sourceShader: (shader) ->
    shader.pipe @operator
    super shader

  getDimensions:       () -> @_resample @bind.source.getDimensions()
  getActiveDimensions: () -> @_resample @bind.source.getActiveDimensions()
  getFutureDimensions: () -> @_resample @bind.source.getFutureDimensions()
  getIndexDimensions:  () -> @_resample @bind.source.getIndexDimensions()

  _resample: (dims) ->
    r = @resample
    items:  r.items  * dims.items
    width:  r.width  * dims.width
    height: r.height * dims.height
    depth:  r.depth  * dims.depth

  make: () ->
    super
    return unless @bind.source?

    # Repeat multipliers
    @resample = {}

    # Modulus on all 4 dimensions
    uniforms =
      repeatModulus: @_attributes.make @_types.vec4()
    @repeatModulus = uniforms.repeatModulus

    # Build shader to repeat along all dimensions
    transform = @_shaders.shader()
    transform.pipe 'repeat.position', uniforms
    @operator = transform

  unmake: () ->
    super

  resize: () ->
    if @bind.source?
      dims = @bind.source.getActiveDimensions()
      @repeatModulus.value.set dims.width, dims.height, dims.depth, dims.items

    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator'] or
                         touched['repeat']

    if init

      for key in ['items', 'width', 'height', 'depth']
        @resample[key] = @props[key]

module.exports = Repeat
