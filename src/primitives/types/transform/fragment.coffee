Transform = require './transform'

class Fragment extends Transform
  @traits = ['node', 'include', 'fragment', 'bind']

  make: () ->
    # Bind to attached shader
    @_helpers.bind.make [
      { to: 'include.shader', trait: 'shader', optional: true }
    ]

  unmake: () ->
    @_helpers.bind.unmake()

  change: (changed, touched, init) ->
    return @rebuild() if touched['include']

  fragment: (shader, pass) ->
    if @bind.shader?
      shader.pipe @bind.shader.shaderBind() if pass == @props.pass
    super shader, pass

module.exports = Fragment
