Operator = require './operator'

class Clamp extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'clamp']

  indexShader:  (shader) ->
    shader.pipe @operator
    super shader

  sourceShader: (shader) ->
    shader.pipe @operator
    super shader

  make: () ->
    super
    return unless @bind.source?

    # Max index on all 4 dimensions
    uniforms =
      clampLimit: @_attributes.make @_types.vec4()
    @clampLimit = uniforms.clampLimit

    # Build shader to clamp along all dimensions
    transform = @_shaders.shader()
    transform.pipe 'clamp.position', uniforms
    @operator = transform

  unmake: () ->
    super

  resize: () ->
    if @bind.source?
      dims = @bind.source.getActiveDimensions()
      @clampLimit.value.set dims.width - 1, dims.height - 1, dims.depth - 1, dims.items - 1

    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator'] or
                         touched['clamp']

module.exports = Clamp
