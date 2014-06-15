Transform = require './transform'

class Spread extends Transform
  @traits: ['node', 'bind', 'transform', 'spread']

  shader: (shader) ->
    shader.concat @transform

  make: () ->
    super

    # Uniforms
    uniforms =
      spreadAxis:   @node.attributes['spread.axis']
      spreadVector: @node.attributes['spread.vector']
      spreadOffset: @_attributes.make @_types.number()

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
    if changed['spread.anchor'] or
       changed['spread.axis']   or
       init

      if @bind.source
        axis   = @_get 'spread.axis'
        anchor = @_get 'spread.anchor'
        dimensions = @bind.source.getActive()

        dimension = ['width', 'height', 'depth', 'items'][axis - 1]
        @spreadOffset.value = -((dimensions[dimension] ? 1) - 1) * (.5 - anchor * .5)

module.exports = Spread
