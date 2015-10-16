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
    return @rebuild() if touched['include'] or changed['fragment.gamma']

  fragment: (shader, pass) ->
    if @bind.shader?
      if pass == @props.pass
        shader.pipe 'mesh.gamma.out' if @props.gamma
        shader.pipe @bind.shader.shaderBind()
        shader.split()
        shader.pipe 'mesh.gamma.in'  if @props.gamma
        shader.pass()
    super shader, pass

module.exports = Fragment
