Data = require './data'

class _Array extends Data
  @traits: ['node', 'data', _Array]

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @buffer = null
    @space  = 0
    @length = 0

  shader: (shader) ->
    @buffer.shader shader

  make: () ->
    super

    length   = @_get('array.length')
    history  = @_get('array.history')
    channels = @_get('array.dimensions')

    @space = @length = Math.max @space, length
    @channels = channels
    @history  = history

    # Allocate to right array size right away
    data = @_get('data.data')
    if data?
      @space = Math.max @space, Math.floor data.length / channels

    # Create linebuffer
    if @space > 0
      @buffer = @_factory.make 'linebuffer',
                length:   @space
                history:  @history
                channels: channels

    # Notify of buffer reallocation
    @trigger
      event:   'rebuild'
      buffer:  @buffer
      samples: @space

  unmake: () ->
    super
    if @buffer
      @buffer.dispose()
      @buffer = null

  change: (changed, init) ->
    @rebuild() if changed['array.length'] or
                  changed['array.history'] or
                  changed['array.dimensions']

    return unless @buffer

    if changed['data.expression']? or
       init

      callback = @_get('data.expression')
      @buffer.callback = @callback callback

  update: () ->
    return unless @buffer

    data = @_get('data.data')

    length = @length

    if data?
      @length = Math.floor data.length / @channels

      if @length > @space
        @space = Math.min @length, @space * 2
        @rebuild()
#      if @length < @space * .1
#        @space = @length
#        @rebuild()

      @buffer.copy data

    else
      @length = @buffer.update()

    if length != @length
      @trigger
        event:   'resize'
        buffer:  @buffer
        samples: @space
        history: @history


module.exports = _Array
