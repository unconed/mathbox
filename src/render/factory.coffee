class RenderFactory
  constructor: (@renderer, @classes, @shaders) ->

  getTypes: () ->
    Object.keys @classes

  make: (type, options) ->
    new @classes[type] @renderer, @shaders, options

module.exports = RenderFactory