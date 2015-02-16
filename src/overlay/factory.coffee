class OverlayFactory
  constructor: (@element, @canvas, @classes) ->
    div = document.createElement 'div'
    div.classList.add 'mathbox-overlays'
    @div = div

  inject: () ->
    @element.insertBefore @div, @canvas

  unject: () ->
    @element.removeChild @div

  getTypes: () ->
    Object.keys @classes

  make: (type, options) ->
    new @classes[type] @div, options

module.exports = OverlayFactory