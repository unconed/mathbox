class RenderFactory
  constructor: (@classes, @renderer, @shaders) ->

  getTypes: () ->
    Object.keys @classes

  make: (type, options) ->
    new @classes[type] @renderer, @shaders, options

module.exports = RenderFactory