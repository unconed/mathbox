class Factory
  constructor: (@gl, @classes) ->

  getTypes: () ->
    Object.keys @classes

  make: (type, options, uniforms) ->
    new @classes[type] @gl, options, uniforms

module.exports = Factory