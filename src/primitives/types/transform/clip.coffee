Transform = require './transform'

class Clip extends Transform
  @traits = ['node', 'vertex', 'clip']

  make: () ->
    @uniforms =
      clipMin: @_attributes.make @_types.vec4()
      clipMax: @_attributes.make @_types.vec4()

  # Calculate vertex clip
  vertex: (shader, pass) ->
    return shader.pipe 'clip.position', @uniforms if pass == @props.pass
    shader

module.exports = Clip