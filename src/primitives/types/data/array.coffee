Data = require './data'
Util = require '../../../util'

class Array_ extends Data
  @traits: ['node', 'data', 'source', 'array', 'texture']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @buffer = @spec = @expression = null
    @filled = false

    @space =
      length:  0
      history: 0

    @used =
      length:  0

  sourceShader: (shader) ->
    @buffer.shader shader

  getDimensions: () ->
    space = @space

    items:  @items
    width:  space.length
    height: space.history
    depth:  1

  getActive: () ->
    used = @used

    items:  @items
    width:  used.length
    height: @buffer.getFilled()
    depth:  1

  make: () ->
    super

    # Read sampling parameters
    minFilter = @_get 'texture.minFilter'
    magFilter = @_get 'texture.magFilter'
    type      = @_get 'texture.type'

    # Read given dimensions
    length   = @_get 'array.length'
    history  = @_get 'array.history'
    channels = @_get 'data.dimensions'
    items    = @_get 'data.items'

    dims = @spec =
      channels: channels
      items:    items
      width:    length

    @items    = dims.items
    @channels = dims.channels

    # Init to right size if data supplied
    data = @_get 'data.data'
    dims = Util.Data.getDimensions data, dims

    space = @space
    space.length  = Math.max space.length, dims.width || 1
    space.history = history

    # Create array buffer
    @buffer = @_renderables.make 'arrayBuffer',
              length:    space.length
              history:   space.history
              channels:  channels
              items:     items
              minFilter: minFilter
              magFilter: magFilter
              type:      type

    # Create data thunk to copy (multi-)array if bound to one
    if data?
      thunk   = Util.Data.getThunk    data
      emitter = Util.Data.makeEmitter thunk, items, channels, 1
      @buffer.callback = emitter

    # Notify of buffer reallocation
    @trigger
      type: 'source.rebuild'

  unmake: () ->
    super
    if @buffer
      @buffer.dispose()
      @buffer = @spec = @expression = null

  change: (changed, touched, init) ->
    return @rebuild() if touched['array'] or
                         touched['texture'] or
                         changed['data.dimensions']

    return unless @buffer

    if changed['data.expression']? or
       init

      @buffer.callback = @callback @_get 'data.expression' if !data?

  update: () ->
    return unless @buffer
    return unless !@filled or @_get 'data.live'

    data = @_get 'data.data'

    space    = @space
    used     = @used
    filled   = @buffer.getFilled()

    l = used.length

    if data?
      dims = Util.Data.getDimensions data, @spec

      # Grow length if needed
      if dims.width > space.length
        # Size up by 200%, up to 128 increase.
        length = space.length
        step   = Math.min 128, length

        # But always at least size to fit
        space.length = Math.max length + step, dims.width

        @rebuild()

      used.length = dims.width

      @buffer.callback.rebind data
      @buffer.update()
    else
      length = @buffer.update()

      used.length = length

    if used.length != l or
       filled != @buffer.getFilled()
      @trigger
        type: 'source.resize'

    @filled = true

module.exports = Array_
