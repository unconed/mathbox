Parent = require '../base/parent'

class Slide extends Parent
  @traits = ['node', 'slide', 'visible', 'active']

  make: () ->
    @_helpers.visible.make()
    @_helpers.active.make()

    @_inherit('present').adopt @

  unmake: () ->
    @_helpers.visible.unmake()
    @_helpers.active.unmake()

    @_inherit('present') unadopt @

  change: (changed, touched, init) ->
    return @rebuild if changed['slide.stay'] or
                       changed['slide.enters'] or
                       changed['slide.exits'] or
                       changed['slide.stay']

  slideReset: () ->            @_instant    false
  slideEnter: (step) ->        @_transition true,    step
  slideExit:  (step) ->        @_transition false,   step
  slideStep:  (index, step) -> @_step       index, step

  _transition: (enabled, step) ->
    #console.log 'slide:transition', enabled, step
    @trigger
      'type': 'transition.latch'
      'step': step

    @_instant enabled

    @trigger
      'type': 'transition.release'

  _instant: (enabled) ->
    #console.log 'slide:instant', enabled
    @setVisible enabled
    @setActive  enabled

  _step: (index, step) ->
    #console.log 'slide:step', index, step
    @trigger
      'type': 'slide.step'
      'index': index
      'step': step

module.exports = Slide