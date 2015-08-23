Track = require './track'

class Steps extends Track
  @traits = ['node', 'track', 'steps', 'bind']

  make: () ->
    super

    @lastIndex = 0
    @animate = @_animator.make @_types.number(0),
      step: (value) =>
        @playhead = value
        @update()

    @stops = @props.stops ? [0...@script.length]

    # Update playhead in response to slide change
    @_listen 'slide', 'slide.step', (e) =>
      {delay, duration, pace, speed, playback, rewind, skip, trigger} = @props

      # Note: enter phase is from 0 to 1, subtract default trigger 1 to not animate instantly
      i = Math.max 0, Math.min @stops.length - 1, e.index - trigger
      step = i - @lastIndex
      @lastIndex = i

      from = @playhead
      to   = @stops[i]

      # Apply rewind factor
      factor = speed * if e.step >= 0 then 1 else rewind

      # Pass through multiple steps at faster rate if skip is enabled
      factor *= if skip then Math.max 1, step else 1

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
    return @rebuild() if changed['steps.stops']
    super changed, touched, init

module.exports = Steps