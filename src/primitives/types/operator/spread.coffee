Operator = require './operator'

class Spread extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'spread']

  sourceShader: (shader) -> shader.pipe @operator

  make: () ->
    super
    return unless @bind.source?

    # Uniforms
    uniforms =
      spreadMatrix: @_attributes.make @_types.mat4()
      spreadOffset: @_attributes.make @_types.vec4()

    @spreadMatrix = uniforms.spreadMatrix
    @spreadOffset = uniforms.spreadOffset

    # Build shader to spread data on one dimension
    transform = @_shaders.shader()
    transform.require @bind.source.sourceShader @_shaders.shader()
    transform.pipe 'spread.position', uniforms

    @operator = transform

  unmake: () ->
    super

  resize: () ->
    if @bind.source
      anchor = @_get 'spread.anchor'
      dims = @bind.source.getActive()

      matrix = @spreadMatrix.value
      els = matrix.elements

      order = ['width', 'height', 'depth', 'items']
      for key, i in order
        id = "spread.#{key}"
        spread = @_get id

        factor = 0
        if spread?
          d = dims[key] ? 1
          offset = -(d - 1) * (.5 - anchor * .5)
        else
          offset = 0

        for k in [0...4]
          v = spread?.getComponent(k) ? 0
          els[i*4+k] = v * 2

        @spreadOffset.value.setComponent i, offset

    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator']


module.exports = Spread
