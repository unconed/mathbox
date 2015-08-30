Track = require './track'

class Step extends Track
  @traits = ['node', 'track', 'step', 'trigger', 'bind']

  make: () ->
    super

    clock = @_inherit 'clock'

    @lastIndex = null
    @animate = @_animator.make @_types.number(0),
      clock:    clock
      realtime: @props.realtime
      step: (value) =>
        @playhead = value
        @update()

    @stops = @props.stops ? [0...@script.length]

    # Seek instantly after reset
    @_listen 'slide', 'slide.reset', (e) => @lastIndex = null

    # Update playhead in response to slide change
    @_listen 'slide', 'slide.step', (e) =>
      {delay, duration, pace, speed, playback, rewind, skip, trigger} = @props

      # Note: enter phase is from index 0 to 1
      i = Math.max  0, Math.min @stops.length - 1, e.index - trigger

      # Animation range
      from = @playhead
      to   = @stops[i]

      # Seek if first step after reset
      if !@lastIndex? and trigger
        @lastIndex = i
        return @animate.set to

      # Calculate step
      step = i - (@lastIndex ? 0)
      @lastIndex = i

      # Apply rewind factor
      factor = speed * if e.step >= 0 then 1 else rewind

      # Pass through multiple steps at faster rate if skip is enabled
      factor *= if skip then Math.max 1, step * step else 1

      # Apply pace
      duration += Math.abs(to - from) * pace / factor

      @animate.immediate to, {delay, duration, ease: playback} if from != to

  made: () ->
    @update()

  unmake: () ->
    @animate.dispose()
    @animate = null

    super

  change: (changed, touched, init) ->
    return @rebuild() if changed['step.stops'] or changed['step.realtime']
    super changed, touched, init

module.exports = Step