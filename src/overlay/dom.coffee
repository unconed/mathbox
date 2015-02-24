Overlay = require './overlay'
Util    = require '../util'

class DOM extends Overlay
  el:      Util.DOM.element
  hint:    Util.DOM.hint
  apply:   Util.DOM.apply
  recycle: Util.DOM.recycle

  init: (options) ->
    @last = null
    @mount()

  dispose: () ->
    @unmount()
    super

  mount: () ->
    overlay = document.createElement 'div'
    overlay.classList.add 'mathbox-overlay'
    @element.appendChild overlay
    @overlay = overlay

  unmount: (overlay) ->
    @element.removeChild overlay
    @overlay = null

  render: (el) ->
    # Wrap naked string or array in a div
    el      = @el 'div', null, el if typeof el == 'string'
    el      = @el 'div', null, el if el instanceof Array

    # See if it can be mounted directly
    naked   = el.type == 'div'

    # Fetch last DOM state
    last    = @last

    # Start with root node
    overlay = @overlay
    node    = if naked then overlay else overlay.childNodes[0]
    parent  = if naked then overlay.parentNode else overlay

    # Create phantom DOM state if mounting into existing element
    last = @el 'div' if !last && node

    # Update DOM
    @apply el, last, node, parent, 0
    @last = el

    # Recycle old descriptors
    @recycle last if last?
    return

module.exports = DOM