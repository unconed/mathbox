Transition = require './transition'
Util = require '../../../util'

class Reveal extends Transition
  @traits = ['node', 'transition', 'mask', 'visible', 'active']

  mask: (shader) ->
    if shader
      s = @_shaders.shader()
      s.pipe Util.GLSL.identity 'vec4'
      s.fan()
      s  .pipe shader, @uniforms
      s.next()
      s  .pipe 'reveal.mask', @uniforms
      s.end()
      s.pipe "float combine(float a, float b) { return min(a, b); }"
    else
      s = @_shaders.shader()
      s.pipe 'reveal.mask', @uniforms

    @_inherit('mask')?.mask(s) ? s

module.exports = Reveal