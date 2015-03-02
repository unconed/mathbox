Data = require './data'
Util = require '../../../util'

class Array_ extends Data
  @traits = ['node', 'data', 'source', 'array', 'texture']

  init: () ->
    @buffer = @spec = null
    @filled = false

    @space =
      length:  0
      history: 0

    @used =
      length:  0

    @storage = 'arrayBuffer'

    super

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
    reserve  = @_get 'array.bufferLength'
    channels = @_get 'data.channels'
    items    = @_get 'data.items'

    dims = @spec = {channels, items, width: length}

    @items    = dims.items
    @channels = dims.channels

    # Init to right size if data supplied
    data = @_get 'data.data'
    dims = Util.Data.getDimensions data, dims

    space = @space
    space.length  = Math.max reserve, dims.width || 1
    space.history = history

    @spec.width  ?= 1

    # Create array buffer
    @buffer = @_renderables.make @storage,
              length:    space.length
              history:   space.history
              channels:  channels
              items:     items
              minFilter: minFilter
              magFilter: magFilter
              type:      type

  unmake: () ->
    super
    if @buffer
      @buffer.dispose()
      @buffer = @spec = null

  change: (changed, touched, init) ->
    return @rebuild() if touched['texture'] or
                         changed['array.history'] or
                         changed['data.dimensions'] or
                         changed['data.items'] or
                         changed['array.bufferLength']

    return unless @buffer

    if changed['array.length']
      length = @_get 'array.length'
      return @rebuild() if length > @space.length

    if changed['data.expression'] or
       changed['data.data'] or
       init

      @buffer.setCallback @emitter()

  callback: (callback) -> callback

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
        @rebuild()

      used.length = dims.width

      @buffer.setActive used.length
      @buffer.callback.rebind data
      @buffer.update()
    else
      @buffer.setActive @spec.width

      length = @buffer.update()
      used.length = length

    @filled = true

    if used.length != l or
       filled != @buffer.getFilled()
      @trigger
        type: 'source.resize'

module.exports = Array_
