class Factory
  constructor: (@gl, @classes, @shaders) ->

  getTypes: () ->
    Object.keys @classes

  make: (type, options) ->
    new @classes[type] @gl, @shaders, options

module.exports = Factory