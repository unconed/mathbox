Operator = require './operator'

class Spread extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'spread']

  sourceShader: (shader) ->
    shader.pipe @operator

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
    @update()
    super

  update: () ->
      # Size to fit to include future history
      dims = @bind.source.getFutureDimensions()

      matrix = @spreadMatrix.value
      els = matrix.elements

      order = ['width', 'height', 'depth', 'items']
      align = ['alignWidth', 'alignHeight', 'alignDepth', 'alignItems']

      {unit} = @props
      unitEnum = @node.attributes['spread.unit'].enum

      map =
        switch unit
          when unitEnum.relative
            (key, i, k, v) -> els[i*4+k] = v / Math.max 1, dims[key] - 1
          when unitEnum.absolute
            (key, i, k, v) -> els[i*4+k] = v

      for key, i in order
        spread = @props[key]
        anchor = @props[align[i]]

        if spread?
          d = dims[key] ? 1
          offset = -(d - 1) * (.5 - anchor * .5)
        else
          offset = 0
        @spreadOffset.value.setComponent i, offset

        for k in [0..3]
          v = spread?.getComponent(k) ? 0
          els[i*4+k] = map key, i, k, v

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator']

    if touched['spread']
      @update()


module.exports = Spread
