Primitive = require('../primitive')
Ticks = require('../util').Ticks

class Grid extends Primitive
  constructor: (options, attributes, factory) ->
    @_extend 'line', 'object', 'view', 'grid', 'axis:axis1', 'axis:axis2'
    super options, attributes, factory

    @line1 = null
    @line2 = null
    @ticks1 = null
    @ticks2 = null

  _make: () ->

    @ticks1 = @_factory.make 'databuffer'
    @ticks2 = @_factory.make 'databuffer'

    @axis1 = Ticks.linear
    # lookup axis properties somehow

    map =
      lineWidth: @_attributes['line.width']
      lineColor: @_attributes['line.color']

    @line1 = @_factory.make 'line', map
    @line2 = @_factory.make 'line', map

    @_render @line1
    @_render @line2

  _unmake: () ->
    if @line1?
      @_unrender @line1
    if @line2?
      @_unrender @line2

    @line1 = null
    @line2 = null

  change: (changed) ->

module.exports = Grid