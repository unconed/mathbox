class Renderable
  constructor: (@gl) ->
    @uniforms ?= {}

  dispose: () ->
    @uniforms = null

  _adopt: (uniforms) ->
    @uniforms[key] = value for key, value of uniforms

  _map: (map, uniforms) ->
    @uniforms ?= {}
    @uniforms[key] = map[key] for key of uniforms when map[key]?

  _set: (uniforms) ->
    @uniforms[key].value = value for key, value of uniforms when @uniforms[key]?

module.exports = Renderable
