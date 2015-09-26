class OverlayFactory
  constructor: (@classes, @canvas) ->
    div = document.createElement 'div'
    div.classList.add 'mathbox-overlays'
    @div = div

  inject: () ->
    element = @canvas.parentNode
    throw new Error "Canvas not inserted into document." if !element
    element.insertBefore @div, @canvas

  unject: () ->
    element = @div.parentNode
    element.removeChild @div

  getTypes: () ->
    Object.keys @classes

  make: (type, options) ->
    new @classes[type] @div, options

module.exports = OverlayFactory