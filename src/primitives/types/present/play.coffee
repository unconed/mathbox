Track = require './track'

class Play extends Track
  @traits = ['node', 'track', 'trigger', 'play', 'bind']

  init: () ->
    super
    @clock = null
    @last  = -1

  reset: (go = true) ->
    @clock = if go then 0 else null

  make: () ->
    super

    # Start on slide, or immediately if not inside slide
    @_listen 'slide', 'slide.step', (e) =>
      trigger = @props.trigger
      return @reset()      if trigger? and e.index == trigger
      return @reset(false) if trigger? and e.index == 0
    @reset() if !@props.trigger or !@_inherit('slide')?

    # Find parent clock
    parentClock = @_inherit 'clock'

    # Update clock
    @_listen parentClock, 'clock.tick', () =>
      {from, to, speed, pace, delay, realtime} = @props

      time = parentClock.getTime()

      @playhead =
        if @clock?
          delta = if realtime then time.delta else time.step
          ratio = speed / pace

          @clock   += delta * ratio

          offset = Math.max 0, @clock - delay * ratio
          offset = offset % (to - from) if @props.loop

          @playhead = Math.min to, from + offset
        else
          0

      @update()

  update: () ->
    super

  change: (changed, touched, init) ->
    return @rebuild() if changed['trigger.trigger'] or changed['play.realtime']
    super changed, touched, init

module.exports = Play