Track = require './track'

class Step extends Track
  @traits = ['node', 'track', 'step', 'trigger', 'bind']

  make: () ->
    super

    clock = @_inherit 'clock'

    @actualIndex ?= null
    @animateIndex = @_animator.make @_types.number(0),
      clock:    clock
      realtime: @props.realtime
      step: (value) =>
        @actualIndex = value

    @lastIndex ?= null
    @animateStep = @_animator.make @_types.number(0),
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
        @animateStep .set to
        @animateIndex.set i
        return

      # Calculate actual step from current offset (may be still animating)
      last = (@actualIndex ? @lastIndex ? 0)
      step = i - last

      # Don't count duped stops
      skips = @stops.slice Math.min(last, i), Math.max(last, i)
      free  = 0
      last  = skips.shift()
      for stop in skips
        free++ if last == stop
        last = stop

      # Remember last intended stop
      @lastIndex = i

      # Apply rewind factor
      factor = speed * if e.step >= 0 then 1 else rewind

      # Pass through multiple steps at faster rate if skip is enabled
      factor *= if skip then Math.max 1, Math.abs(step) - free else 1

      # Apply pace
      duration += Math.abs(to - from) * pace / factor

      if from != to
        @animateIndex.immediate i,  {delay, duration, ease: playback}
        @animateStep .immediate to, {delay, duration, ease: playback}

  made: () ->
    @update()

  unmake: () ->
    @animateIndex.dispose()
    @animateStep .dispose()
    @animateIndex = @animateStep = null

    super

  change: (changed, touched, init) ->
    return @rebuild() if changed['step.stops'] or changed['step.realtime']
    super changed, touched, init

module.exports = Step