class Renderable
  constructor: (@renderer, @shaders) ->
    @gl = @renderer.context
    @uniforms ?= {}

  dispose: () ->
    @uniforms = null

  _adopt: (uniforms) ->
    @uniforms[key] = value for key, value of uniforms
    return

  _set: (uniforms) ->
    @uniforms[key].value = value for key, value of uniforms when @uniforms[key]?
    return

module.exports = Renderable
