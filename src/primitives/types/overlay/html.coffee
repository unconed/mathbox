Overlay = require './overlay'

class HTML extends Overlay
  @traits = ['node', 'overlay', 'html']

  init: () ->
    @element = null

  make: () ->
    selector = @_get 'html.element'
    @element = document.querySelector selector

  unmake: () ->
    @element = null

  change: (changed, touched, init) ->
    return @rebuild() if touched['html']

    if changed['overlay.opacity'] or
       init

      @element.style.opacity = @_get 'overlay.opacity' if @element

module.exports = HTML
