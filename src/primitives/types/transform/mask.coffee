Parent = require '../base/parent'

class Mask extends Parent
  @traits = ['node', 'include', 'mask', 'bind']

  make: () ->
    # Bind to attached shader
    @_helpers.bind.make [
      { to: 'include.shader', trait: 'shader', optional: true }
    ]

  unmake: () ->
    @_helpers.bind.unmake()

  change: (changed, touched, init) ->
    return @rebuild() if touched['include']

  mask: (shader) ->
    if @bind.shader?
      if shader
        s = @_shaders.shader()
        s.pipe Util.GLSL.identity 'vec4'
        s.fan()
        s  .pipe shader
        s.next()
        s  .pipe @bind.shader.shaderBind()
        s.end()
        s.pipe "float combine(float a, float b) { return min(a, b); }"
      else
        s = @_shaders.shader()
        s.pipe @bind.shader.shaderBind()
    else
      s = shader

    @_inherit('mask')?.mask(s) ? s

module.exports = Mask