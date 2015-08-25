Track = require './track'

class Clock extends Track
  @traits = ['node', 'track', 'clock', 'bind']

  init: () ->
    super
    @clock = null
    @last  = -1

  reset: (go = true) ->
    @clock = if go then -@props.delay * @props.speed / @props.pace else null

  realTime: () -> +new Date() / 1000

  realDelta: () ->
    time = @realTime()
    delta =  if @last then time - @last else 0
    @last = time
    delta

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
      {start, end, speed, pace} = @props
      @playhead =
        if @clock?
          delta = if @props.realTime then @realDelta() else @_context.time.delta
          @clock += delta * speed / pace
          @playhead = Math.min end, start + Math.max 0, @clock
        else
          0
      @update()

  update: () ->
    super

  change: (changed, touched, init) ->
    return @rebuild() if changed['clock.trigger'] or changed['clock.realTime']
    super changed, touched, init

module.exports = Clock