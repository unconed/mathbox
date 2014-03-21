Data = require './data'

class Array extends Data
  @traits: ['node', 'data', 'array']

  constructor: (model, attributes, factory, shaders) ->
    super model, attributes, factory, shaders

    @buffer = null
    @space  = 0
    @length = 0

  make: () ->
    super

    samples = @get['array.length']
    history = @get['array.history']

    @space = @length = Math.max @space, samples

    if @space > 0
      @buffer = @_factory.make 'linebuffer',
                samples:  @space
                history:  history
                channels: 4

    @trigger
      event: resize
      buffer: buffer

  unmake: () ->
    super
    if @buffer
      @buffer.dispose()
      @buffer = null

  change: (changed, init) ->
    @rebuild() if changed['array.length'] or
                  changed['array.history']

    return unless @buffer

    if changed['data.expression']? or
       init

      callback = @get['data.expression']
      @buffer.callback = callback ? () ->

  update: () ->
    return unless @buffer

    data = @get['data.source']

    if data?
      @length = data.length
      if @length > @space
        @space = Math.min @length, @space * 2
        @rebuild()
#      if @length < @space * .1
#        @space = @length
#        @rebuild()

      @buffer.copy data

    else
      @length = @buffer.update()


module.exports = Array