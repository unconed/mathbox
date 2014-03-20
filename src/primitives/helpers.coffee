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

    inherit = @model.get prefix + 'span.inherit'

    if inherit and @inherit
      ranges = @inherit.get 'view.range'
      range  = ranges[dimension - 1]
    else
      range  = @model.get prefix + 'span.range'

    range

  generateScale: (prefix, buffer, min, max) ->
    divide = @model.get prefix + 'scale.divide'
    unit   = @model.get prefix + 'scale.unit'
    base   = @model.get prefix + 'scale.base'
    mode   = @model.get prefix + 'scale.mode'

    ticks = Util.Ticks.make mode, min, max, divide, unit, base, true, 0
    buffer.copy ticks
    ticks

  setMeshVisible: (mesh) ->
    opacity = 1
    if @model.attributes['style.opacity']
      opacity = @model.get 'style.opacity'
    visible = @model.get 'object.visible'

    if visible && opacity > 0
      mesh.show opacity < 1
    else
      mesh.hide()

module.exports = (object) ->
  h = {}
  h[key] = method.bind(object) for key, method of helpers
  h
