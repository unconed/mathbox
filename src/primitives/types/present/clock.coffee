Parent = require '../base/parent'

class Clock extends Parent
  @traits = ['node', 'clock', 'play']

  init: () ->
    @clock = 0
    @time = {
      now: +new Date() / 1000,
      time: 0,  delta: 0,
      clock: 0, step: 0
    }

  make: () ->
    # Listen to parent clock
    @clockParent = @_inherit 'clock'
    @_listen 'clock', 'clock.tick', @tick

  unmake: () ->
    @clockParent = null

  tick: (e) ->
    {from, to, speed, pace, delay, realtime} = @props

    parent = @clockParent.getTime()

    delta = if realtime then parent.delta else parent.step
    ratio = speed / pace

    delta  *= ratio
    @clock += delta

    @time.now   = parent.now
    @time.time  = parent.time
    @time.delta = parent.delta

    @time.clock = Math.min to, from + Math.max 0, @clock - delay * ratio
    @time.step  = delta

    @trigger e

  getTime: () ->
    @time

module.exports = Clock