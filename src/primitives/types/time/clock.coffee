Parent = require '../base/parent'

class Clock extends Parent
  @traits = ['node', 'clock', 'seek', 'play']

  init: () ->
    @skew  = 0
    @last  = 0
    @time  = {
      now: +new Date() / 1000,
      time:  0, delta: 0,
      clock: 0, step:  0
    }

  make: () ->
    # Listen to parent clock
    @_listen 'clock', 'clock.tick', @tick

  reset: () ->
    @skew = 0

  tick: (e) ->
    {from, to, speed, seek, pace, delay, realtime} = @props

    parent = @_inherit('clock').getTime()

    time  = if realtime then parent.time  else parent.clock
    delta = if realtime then parent.delta else parent.step
    ratio = speed / pace

    @skew += delta * (ratio - 1)
    @skew = 0 if @last > time

    @time.now   = parent.now + @skew

    @time.time  = parent.time
    @time.delta = parent.delta

    clock = if seek? then seek else parent.clock + @skew
    @time.clock = Math.min to, from + Math.max 0, clock - delay * ratio
    @time.step  = delta * ratio

    @last = time

    @trigger e

  getTime: () ->
    @time

module.exports = Clock