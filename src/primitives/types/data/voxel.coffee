Buffer = require './buffer'
Util = require '../../../util'

class Voxel extends Buffer
  @traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'texture', 'voxel', 'raw']

  init: () ->
    @buffer = @spec = null

    @space =
      width:  0
      height: 0
      depth:  0

    @used =
      width:  0
      height: 0
      depth:  0

    @storage = 'voxelBuffer'
    @passthrough = (emit, x, y, z) -> emit x, y, z, 0

    super

  sourceShader: (shader) ->
    dims = @getDimensions()
    @alignShader dims, shader
    @buffer.shader shader

  getDimensions: () ->
    items:  @items
    width:  @space.width
    height: @space.height
    depth:  @space.depth

  getActiveDimensions: () ->
    items:  @items
    width:  @used.width
    height: @used.height
    depth:  @used.depth * @buffer.getFilled()

  getRawDimensions: () -> @getDimensions()

  make: () ->
    super

    # Read sampling parameters
    minFilter = @minFilter ? @props.minFilter
    magFilter = @magFilter ? @props.magFilter
    type      = @type      ? @props.type

    # Read given dimensions
    width    = @props.width
    height   = @props.height
    depth    = @props.depth
    reserveX = @props.bufferWidth
    reserveY = @props.bufferHeight
    reserveZ = @props.bufferDepth
    channels = @props.channels
    items    = @props.items

    dims = @spec = {channels, items, width, height, depth}

    @items    = dims.items
    @channels = dims.channels

    # Init to right size if data supplied
    data = @props.data
    dims = Util.Data.getDimensions data, dims

    space = @space
    space.width  = Math.max reserveX,  dims.width  || 1
    space.height = Math.max reserveY,  dims.height || 1
    space.depth  = Math.max reserveZ,  dims.depth  || 1

    # Create voxel buffer
    @buffer = @_renderables.make @storage,
              width:     space.width
              height:    space.height
              depth:     space.depth
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
                         changed['buffer.channels'] or
                         changed['buffer.items'] or
                         changed['voxel.bufferWidth'] or
                         changed['voxel.bufferHeight'] or
                         changed['voxel.bufferDepth']

    return unless @buffer

    if changed['voxel.width']
      width = @props.width
      return @rebuild() if width  > @space.width

    if changed['voxel.height']
      height = @props.height
      return @rebuild() if height > @space.height

    if changed['voxel.depth']
      depth = @props.depth
      return @rebuild() if depth  > @space.depth

    if changed['data.map'] or
       changed['data.data'] or
       changed['data.resolve'] or
       changed['data.expr'] or
       init

      @buffer.setCallback @emitter()

  callback: (callback) ->
    if callback.length <= 4
      callback
    else
      (emit, i, j, k) =>
        callback emit, i, j, k, @bufferClock, @bufferStep

  update: () =>
    return unless @buffer

    {data} = @props
    {space, used} = @
    w = used.width
    h = used.height
    d = used.depth

    filled = @buffer.getFilled()

    @syncBuffer (abort) =>

      if data?
        dims = Util.Data.getDimensions data, @spec

        # Grow dimensions if needed
        if dims.width  > space.width  or
           dims.height > space.height or
           dims.depth  > space.depth
          abort()
          return @rebuild()

        used.width  = dims.width
        used.height = dims.height
        used.depth  = dims.depth

        @buffer.setActive used.width, used.height, used.depth
        @buffer.callback.rebind? data
        @buffer.update()
      else
        width  = @spec.width  || 1
        height = @spec.height || 1
        depth  = @spec.depth  || 1

        @buffer.setActive width, height, depth

        length = @buffer.update()

        used.width  = _w = width
        used.height = _h = height
        used.depth  = Math.ceil length / _w / _h

        if used.depth == 1
          used.height = Math.ceil length / _w
          used.width  = length if used.height == 1

    if used.width  != w or
       used.height != h or
       used.depth  != d or
       filled != @buffer.getFilled()
      @trigger
        type: 'source.resize'

module.exports = Voxel