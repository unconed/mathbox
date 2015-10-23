Buffer = require './buffer'
Util = require '../../../util'

class Array_ extends Buffer
  @traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'array', 'texture', 'raw']

  init: () ->
    @buffer = @spec = null

    @space =
      length:  0
      history: 0

    @used =
      length:  0

    @storage = 'arrayBuffer'
    @passthrough = (emit, x) -> emit x, 0, 0, 0

    super

  sourceShader: (shader) ->
    dims = @getDimensions()
    @alignShader dims, shader
    @buffer.shader shader

  getDimensions: () ->
    items:  @items
    width:  @space.length
    height: @space.history
    depth:  1

  getActiveDimensions: () ->
    items:  @items
    width:  @used.length
    height: @buffer.getFilled()
    depth:  1

  getFutureDimensions: () ->
    items:  @items
    width:  @used.length
    height: @space.history
    depth:  1

  getRawDimensions: () ->
    items:  @items
    width:  space.length
    height: 1
    depth:  1

  make: () ->
    super

    # Read sampling parameters
    minFilter = @minFilter ? @props.minFilter
    magFilter = @magFilter ? @props.magFilter
    type      = @type      ? @props.type

    # Read given dimensions
    length   = @props.length
    history  = @props.history
    reserve  = @props.bufferLength
    channels = @props.channels
    items    = @props.items

    dims = @spec = {channels, items, width: length}

    @items    = dims.items
    @channels = dims.channels

    # Init to right size if data supplied
    data = @props.data
    dims = Util.Data.getDimensions data, dims

    space = @space
    space.length  = Math.max reserve, dims.width || 1
    space.history = history

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
                         changed['history.history'] or
                         changed['buffer.channels'] or
                         changed['buffer.items'] or
                         changed['array.bufferLength']

    return unless @buffer

    if changed['array.length']
      length = @props.length
      return @rebuild() if length > @space.length

    if changed['data.map'] or
       changed['data.data'] or
       changed['data.resolve'] or
       changed['data.expr'] or
       init

      @buffer.setCallback @emitter()

  callback: (callback) ->
    if callback.length <= 2
      callback
    else
      (emit, i) =>
        callback emit, i, @bufferClock, @bufferStep

  update: () ->
    return unless @buffer

    {data} = @props
    {space, used} = @
    l = used.length

    filled = @buffer.getFilled()

    @syncBuffer (abort) =>

      if data?
        dims = Util.Data.getDimensions data, @spec

        # Grow length if needed
        if dims.width > space.length
          abort()
          return @rebuild()

        used.length = dims.width

        @buffer.setActive used.length
        @buffer.callback.rebind? data
        @buffer.update()
      else
        width  = @spec.width  || 1

        @buffer.setActive width

        length = @buffer.update()
        used.length = length

    if used.length != l or
       filled != @buffer.getFilled()
      @trigger
        type: 'source.resize'

module.exports = Array_
