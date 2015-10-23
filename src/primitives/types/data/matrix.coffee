Buffer = require './buffer'
Util = require '../../../util'

class Matrix extends Buffer
  @traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'texture', 'matrix', 'raw']

  init: () ->
    @buffer = @spec = null

    @space =
      width:   0
      height:  0
      history: 0

    @used =
      width:   0
      height:  0

    @storage = 'matrixBuffer'
    @passthrough = (emit, x, y) -> emit x, y, 0, 0

    super

  sourceShader: (shader) ->
    dims = @getDimensions()
    @alignShader dims, shader
    @buffer.shader shader

  getDimensions: () ->
    items:  @items
    width:  @space.width
    height: @space.height
    depth:  @space.history

  getActiveDimensions: () ->
    items:  @items
    width:  @used.width
    height: @used.height
    depth:  @buffer.getFilled()

  getFutureDimensions: () ->
    items:  @items
    width:  @used.width
    height: @used.height
    depth:  @space.history

  getRawDimensions: () ->
    items:  @items
    width:  @space.width
    height: @space.height
    depth:  1

  make: () ->
    super

    # Read sampling parameters
    minFilter = @minFilter ? @props.minFilter
    magFilter = @magFilter ? @props.magFilter
    type      = @type      ? @props.type

    # Read given dimensions
    width    = @props.width
    height   = @props.height
    history  = @props.history
    reserveX = @props.bufferWidth
    reserveY = @props.bufferHeight
    channels = @props.channels
    items    = @props.items

    dims = @spec = {channels, items, width, height}

    @items    = dims.items
    @channels = dims.channels

    # Init to right size if data supplied
    data = @props.data
    dims = Util.Data.getDimensions data, dims

    space = @space
    space.width   = Math.max reserveX, dims.width  || 1
    space.height  = Math.max reserveY, dims.height || 1
    space.history = history

    # Create matrix buffer
    @buffer = @_renderables.make @storage,
              width:     space.width
              height:    space.height
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
                         changed['matrix.history'] or
                         changed['buffer.channels'] or
                         changed['buffer.items'] or
                         changed['matrix.bufferWidth'] or
                         changed['matrix.bufferHeight']

    return unless @buffer

    if changed['matrix.width']
      width = @props.width
      return @rebuild() if width  > @space.width

    if changed['matrix.height']
      height = @props.height
      return @rebuild() if height > @space.height

    if changed['data.map'] or
       changed['data.data'] or
       changed['data.resolve'] or
       changed['data.expr'] or
       init

      @buffer.setCallback @emitter()

  callback: (callback) ->
    if callback.length <= 3
      callback
    else
      (emit, i, j) =>
        callback emit, i, j, @bufferClock, @bufferStep

  update: () ->
    return unless @buffer

    {data} = @props
    {space, used} = @
    w = used.width
    h = used.height

    filled = @buffer.getFilled()

    @syncBuffer (abort) =>

      if data?
        dims = Util.Data.getDimensions data, @spec

        # Grow if needed
        if dims.width  > space.width or
           dims.height > space.height
          abort()
          return @rebuild()

        used.width  = dims.width
        used.height = dims.height

        @buffer.setActive used.width, used.height
        @buffer.callback.rebind? data
        @buffer.update()
      else
        width  = @spec.width  || 1
        height = @spec.height || 1

        @buffer.setActive width, height

        length = @buffer.update()

        used.width  = _w = width
        used.height = Math.ceil length / _w
        used.width  = length if used.height == 1

    if used.width  != w or
       used.height != h or
       filled != @buffer.getFilled()
      @trigger
        type: 'source.resize'

module.exports = Matrix
