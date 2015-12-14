Parent = require '../base/parent'

class Slide extends Parent
  @traits = ['node', 'slide', 'visible', 'active']

  make: () ->
    @_helpers.visible.make()
    @_helpers.active.make()

    throw new Error "#{@node.toString()} must be placed inside <present></present>" if !@_inherit 'present'

    @_inherit('present').adopt @

  unmake: () ->
    @_helpers.visible.unmake()
    @_helpers.active.unmake()

    @_inherit('present') unadopt @

  change: (changed, touched, init) ->
    return @rebuild() if changed['slide.early'] or
                         changed['slide.late']  or
                         changed['slide.steps'] or
                         changed['slide.from']  or
                         changed['slide.to']

  slideLatch: (enabled, step) ->
    #console.log 'slide:latch', @node.toString(), enabled, step
    @trigger
      'type': 'transition.latch'
      'step': step

    @_instant enabled if enabled?

  slideStep: (index, step) ->
    #console.log 'slide:step', @node.toString(), index, step
    @trigger
      'type': 'slide.step'
      'index': index
      'step':  step

  slideRelease: () ->
    #console.log 'slide:release', @node.toString()
    @trigger
      'type': 'transition.release'

  slideReset: () ->
    @_instant false
    @trigger
      'type': 'slide.reset'

  _instant: (enabled) ->
    #console.log 'slide:instant', @node.toString(), enabled
    @setVisible enabled
    @setActive  enabled


module.exports = Slide