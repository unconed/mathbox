Transform = require './transform'

class Vertex extends Transform
  @traits = ['node', 'transform', 'vertex']

  change: (changed, touched, init) ->
    return @rebuild() if touched['vertex']

    @shader = @_get 'vertex.shader'
    @pass   = @_get 'vertex.pass'

  transform: (shader, pass) ->
    shader.pipe @shader, @uniforms if pass == @pass
    super shader, pass

module.exports = Vertex
