Transform = require './transform'

class Vertex extends Transform
  @traits = ['node', 'transform', 'vertex', 'bind']

  make: () ->
    # Bind to attached shader
    @_helpers.bind.make [
      { to: 'vertex.shader', trait: 'shader', optional: true }
    ]

    return unless @bind.shader?

  unmake: () ->
    @_helpers.bind.unmake()

  change: (changed, touched, init) ->
    return @rebuild() if touched['vertex']

  transform: (shader, pass) ->
    if @bind.shader?
      shader.pipe @bind.shader.shaderBind() if pass == @props.pass
    super shader, pass

module.exports = Vertex
