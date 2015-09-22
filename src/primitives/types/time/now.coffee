Parent = require '../base/parent'

class Now extends Parent
  @traits = ['node', 'clock', 'now']

  init: () ->
    @now  = now = +new Date() / 1000
    @skew = 0
    @time = {
      now,
      time:  0, delta: 0,
      clock: 0, step:  0
    }

  make: () ->
    # Listen to parent clock
    @clockParent = @_inherit 'clock'
    @_listen 'clock', 'clock.tick', @tick

  unmake: () ->
    @clockParent = null

  change: (changed, touched, init) ->

    if changed['date.now']
      @skew = 0

  tick: (e) ->
    {now, seek, pace, speed} = @props

    parent = @clockParent.getTime()

    @skew += parent.step * pace / speed
    @skew  = seek if seek?

    @time.now   = @time.time = @time.clock = (@props.now ? @now) + @skew
    @time.delta = @time.step = parent.delta

    @trigger e

  getTime: () ->
    @time

module.exports = Now