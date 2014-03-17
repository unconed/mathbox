class Factory
  constructor: (@gl, @classes, @shaders) ->

  getTypes: () ->
    Object.keys @classes

  make: (type, options, uniforms) ->
    new @classes[type] @gl, @shaders, options, uniforms

module.exports = Factory