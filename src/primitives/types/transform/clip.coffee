Transform = require './transform'

class Clip extends Transform
  @traits = ['node', 'transform', 'clip']

  make: () ->
    @uniforms =
      clipMin: @_attributes.make @_types.vec4()
      clipMax: @_attributes.make @_types.vec4()

  # Calculate vertex clip
  transform: (shader, pass) ->
    return shader.pipe 'clip.position', @uniforms if pass == @props.pass
    shader

module.exports = Layer