Parent = require '../base/parent'

class Date extends Parent
  @traits = ['node', 'clock', 'date']

  init: () ->
    @clock = 0
    @time = {
      now: +new Date() / 1000,
      time: 0,  delta: 0,
      clock: 0, step: 0
    }

  make: () ->
    # Listen to parent clock
    @clockParent = @inherit 'clock'
    @_listen 'clock', 'clock.tick', @tick

  unmake: () ->
    @clockParent = null

  tick: (e) ->
    @time.now   = @props.now ? +new Date()
    @time.time  = parent.time
    @time.delta = parent.delta
    @time.clock = parent.clock
    @time.step  = parent.step

    @trigger e

  getClock: () ->
    @time

module.exports = Date