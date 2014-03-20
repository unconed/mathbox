Util = require '../util'

helpers =

  setDimension: (vec, dimension) ->

    x = if dimension == 1 then 1 else 0
    y = if dimension == 2 then 1 else 0
    z = if dimension == 3 then 1 else 0
    w = if dimension == 4 then 1 else 0
    vec.set x, y, z, w

  setDimensionNormal: (vec, dimension) ->

    x = if dimension == 1 then 1 else 0
    y = if dimension == 2 then 1 else 0
    z = if dimension == 3 then 1 else 0
    w = if dimension == 4 then 1 else 0
    vec.set y, z + x, w, 0

  getSpanRange: (prefix, dimension) ->

    inherit = @_get prefix + 'span.inherit'

    if inherit and @inherit
      ranges = @inherit.get 'view.range'
      range  = ranges[dimension - 1]
    else
      range  = @_get prefix + 'span.range'

    range

  generateScale: (prefix, buffer, min, max) ->
    divide = @_get prefix + 'scale.divide'
    unit   = @_get prefix + 'scale.unit'
    base   = @_get prefix + 'scale.base'
    mode   = @_get prefix + 'scale.mode'

    ticks = Util.Ticks.make mode, min, max, divide, unit, base, true, 0
    buffer.copy ticks
    ticks

  setMeshVisible: (mesh) ->
    opacity = 1
    if @model.attributes['style.opacity']
      opacity = @_get 'style.opacity'
    visible = @_get 'object.visible'

    if visible && opacity > 0
      mesh.show opacity < 1
    else
      mesh.hide()

module.exports = (object) ->
  h = {}
  h[key] = method.bind(object) for key, method of helpers
  h
