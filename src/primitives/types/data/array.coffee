Buffer = require './buffer'
Util = require '../../../util'

class Array_ extends Buffer
  @traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'array', 'texture', 'raw']

  init: () ->
    @buffer = @spec = null

    @space =
      width:   0
      history: 0

    @used =
      width:   0

    @storage = 'arrayBuffer'
    @passthrough = (emit, x) -> emit x, 0, 0, 0

    super

  sourceShader: (shader) ->
    dims = @getDimensions()
    @alignShader dims, shader
    @buffer.shader shader

  getDimensions: () ->
    items:  @items
    width:  @space.width
    height: @space.history
    depth:  1

  getActiveDimensions: () ->
    items:  @items
    width:  @used.width
    height: @buffer.getFilled()
    depth:  1

  getFutureDimensions: () ->
    items:  @items
    width:  @used.width
    height: @space.history
    depth:  1

  getRawDimensions: () ->
    items:  @items
    width:  space.width
    height: 1
    depth:  1

  make: () ->
    super

    # Read sampling parameters
    minFilter = @minFilter ? @props.minFilter
    magFilter = @magFilter ? @props.magFilter
    type      = @type      ? @props.type

    # Read given dimensions
    width    = @props.width
    history  = @props.history
    reserve  = @props.bufferWidth
    channels = @props.channels
    items    = @props.items

    dims = @spec = {channels, items, width}

    @items    = dims.items
    @channels = dims.channels

    # Init to right size if data supplied
    data = @props.data
    dims = Util.Data.getDimensions data, dims

    space = @space
    space.width   = Math.max reserve, dims.width || 1
    space.history = history

    # Create array buffer
    @buffer = @_renderables.make @storage,
              width:     space.width
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
                         changed['array.bufferWidth']

    return unless @buffer

    if changed['array.width']
      width = @props.width
      return @rebuild() if width > @space.width

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
    l = used.width

    filled = @buffer.getFilled()

    @syncBuffer (abort) =>

      if data?
        dims = Util.Data.getDimensions data, @spec

        # Grow width if needed
        if dims.width > space.width
          abort()
          return @rebuild()

        used.width = dims.width

        @buffer.setActive used.width
        @buffer.callback.rebind? data
        @buffer.update()
      else
        width  = @spec.width  || 1

        @buffer.setActive width

        width = @buffer.update()
        used.width = width

    if used.width != l or
       filled != @buffer.getFilled()
      @trigger
        type: 'source.resize'

module.exports = Array_
