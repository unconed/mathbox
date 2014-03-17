Primitive = require('../primitive')
Ticks = require('../../util').Ticks
Types = require('./types')

class Grid extends Primitive
  @traits: ['line', 'object', 'grid', 'axis:axis[0]', 'axis:axis[1]']

  constructor: (model, attributes, factory, shaders) ->
    super model, attributes, factory, shaders

    @widths  = []
    @lines   = null
    @buffers = null
    @grids   = []

  _make: () ->

    @inherit = @_inherit 'view'

    uniforms =
      lineWidth:   @attributes['line.width']
      lineColor:   @attributes['style.color']
      lineOpacity: @attributes['style.opacity']

    axis = (prefix, dimension) ->
      types = @_attributes.types

      grid =
        gridRange:  @_attributes.make types.vec2 -1, 1
        gridAxis:   @_attributes.make types.vec3 0, 2, 0
        gridOffset: @_attributes.make types.vec2 0, -1, 0
      grid[key] = value for key, value of uniforms

      ticks = @get prefix + 'ticks'
      width = ticks * 2

      buffer = @_factory.make 'databuffer',
                samples: width
                channels: 1

      line   = @_factory.make 'line',
                uniforms: uniforms
                buffer: buffer

      @widths.push  width
      @buffers.push buffer
      @lines.push   line
      @grids.push   grid

      @_render line

    axes = @get 'grid.axes'
    axis 'axis[0].', axes[0]
    #axis 'axis[1].', axes[1]

  _unmake: () ->
    for buffer in @buffers
      buffer.dispose()

    for line in @lines
      @_unrender line
      line.dispose()

    @widths  = []
    @lines   = null
    @buffers = null

  _change: (changed) ->

    return @rebuild() if changed['axis1.ticks']? || changed['axis2.ticks']?

    axis = (prefix, dimension, buffer, grid) ->
      inherit = @get prefix + 'inherit'

      if inherit and @inherit
        ranges = @inherit.get 'view.range'
        range  = ranges[dimension]
      else
        range  = @get prefix + 'range'

      ticks  = @get prefix + 'ticks'
      unit   = @get prefix + 'unit'
      base   = @get prefix + 'base'
      scale  = @get prefix + 'scale'

      min    = range.x
      max    = range.y
      ticks  = Ticks.make scale, min, max, ticks, unit, base

      buffer.copy ticks

    axes = @get 'grid.axes'
    axis 'axis[0].', axes[0], @buffer[0], @grid[0]
    #axis 'axis[1].', axes[1], @buffer[1], @grid[1]

module.exports = Grid