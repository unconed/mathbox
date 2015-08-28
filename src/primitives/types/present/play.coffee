Track = require './track'

class Clock extends Track
  @traits = ['node', 'track', 'play', 'bind']

  init: () ->
    super
    @clock = null
    @last  = -1

  reset: (go = true) ->
    @clock = if go then -@props.delay * @props.speed / @props.pace else null

  make: () ->
    super

    # Start on slide, or immediately if not inside slide
    @_listen 'slide', 'slide.step', (e) =>
      trigger = @props.trigger
      return @reset()      if trigger? and e.index == trigger
      return @reset(false) if trigger? and e.index == 0
    @reset() if !@props.trigger or !@_inherit('slide')?

    # Update clock before change notifications fire
    @_listen 'root', 'root.pre', () =>
      {from, to, speed, pace} = @props
      @playhead =
        if @clock?
          delta = if @props.realtime then @_context.time.delta else @_context.time.step
          @clock += delta * speed / pace
          @playhead = Math.min to, from + Math.max 0, @clock
        else
          0
      @update()

  update: () ->
    super

  change: (changed, touched, init) ->
    return @rebuild() if changed['clock.trigger'] or changed['clock.realtime']
    super changed, touched, init

module.exports = Clock