Transform = require './transform'

class Spread extends Transform
  @traits: ['node', 'bind', 'transform', 'spread']

  shader: (shader) ->
    shader.concat @transform

  make: () ->
    super

    # Uniforms
    uniforms =
      spreadMatrix: @_attributes.make @_types.mat4()
      spreadOffset: @_attributes.make @_types.vec4()

    @spreadMatrix = uniforms.spreadMatrix
    @spreadOffset = uniforms.spreadOffset

    # Build shader to spread data on one dimension
    transform = @_shaders.shader()
    transform.callback()
    @bind.source.shader transform
    transform.join()
    transform.call 'spread.position', uniforms

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
    if changed['spread'] or
       init

      if @bind.source
        anchor = @_get 'spread.anchor'
        dims = @bind.source.getActive()

        matrix = @spreadMatrix.value
        els = matrix.elements

        order = { width: 0, height: 1, depth: 2, items: 3 }
        for key of dims
          i = order[key]
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


module.exports = Spread
