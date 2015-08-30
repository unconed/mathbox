Transform = require './transform'

class Vertex extends Transform
  @traits = ['node', 'include', 'vertex', 'bind']

  make: () ->
    # Bind to attached shader
    @_helpers.bind.make [
      { to: 'include.shader', trait: 'shader', optional: true }
    ]

    return unless @bind.shader?

  unmake: () ->
    @_helpers.bind.unmake()

  change: (changed, touched, init) ->
    return @rebuild() if touched['include']

  vertex: (shader, pass) ->
    if @bind.shader?
      shader.pipe @bind.shader.shaderBind() if pass == @props.pass
    super shader, pass

module.exports = Vertex
