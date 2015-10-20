Operator = require './operator'

class Grow extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'grow']

  sourceShader: (shader) ->
    shader.pipe @operator

  make: () ->
    super
    return unless @bind.source?

    # Uniforms
    uniforms =
      growScale:  @node.attributes['grow.scale']
      growMask:   @_attributes.make @_types.vec4()
      growAnchor: @_attributes.make @_types.vec4()

    @growMask   = uniforms.growMask.value
    @growAnchor = uniforms.growAnchor.value

    # Build shader to spread data on one dimension
    transform = @_shaders.shader()
    transform.require @bind.source.sourceShader @_shaders.shader()
    transform.pipe 'grow.position', uniforms

    @operator = transform

  unmake: () ->
    super

  resize: () ->
    @update()
    super

  update: () ->
      # Size to fit to include future history
      dims = @bind.source.getFutureDimensions()

      order = ['width', 'height', 'depth', 'items']

      m = (d, anchor) ->  ((d || 1) - 1) * (.5 - anchor * .5)

      for key, i in order
        anchor = @props[key]

        @growMask  .setComponent i, +!anchor?
        @growAnchor.setComponent i, if anchor? then m(dims[key], anchor) else 0

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator']

    if touched['grow']

      @update()


module.exports = Grow
