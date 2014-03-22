Util = require '../../util'
View = require './view/view'

helpers =

  span:
    make: () ->
      # Look up nearest view to inherit from
      # Monitor size changes
      @span = @_inherit View
      @spanHandler = (event) => @change {}, true
      @span.on 'resize', @spanHandler

    unmake: () ->
      @span.off 'resize', @spanHandler
      delete @span
      delete @spanHandler

    get: (prefix, dimension) ->
      range = @_get prefix + 'span.range'
      return range if range?

      if @span
        return @span.axis dimension

  scale:
    generate: (prefix, buffer, min, max) ->
      divide = @_get prefix + 'scale.divide'
      unit   = @_get prefix + 'scale.unit'
      base   = @_get prefix + 'scale.base'
      mode   = @_get prefix + 'scale.mode'

      ticks = Util.Ticks.make mode, min, max, divide, unit, base, true, 0
      buffer.copy ticks
      ticks

  object:

    visible: (mesh) ->
      opacity = 1
      if @node.attributes['style.opacity']
        opacity = @_get 'style.opacity'
      visible = @_get 'object.visible'

      if visible && opacity > 0
        mesh.show opacity < 1
      else
        mesh.hide()

module.exports = (object) ->
  h = {}
  for trait, methods of helpers
    h[trait] = {}
    h[trait][key] = method.bind(object) for key, method of methods
  h
