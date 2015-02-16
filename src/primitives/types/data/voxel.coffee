Data = require './data'
Util = require '../../../util'

class Voxel extends Data
  @traits = ['node', 'data', 'source', 'texture', 'voxel']

  init: () ->
    @buffer = @spec = @emitter = null
    @filled = false

    @space =
      width:  0
      height: 0
      depth:  0

    @used =
      width:  0
      height: 0
      depth:  0

  sourceShader: (shader) ->
    @buffer.shader shader

  getDimensions: () ->
    space = @space

    items:  @items
    width:  space.width
    height: space.height
    depth:  space.depth

  getActive: () ->
    used = @used

    items:  @items
    width:  used.width
    height: used.height
    depth:  used.depth * @buffer.getFilled()

  make: () ->
    super

    # Read sampling parameters
    minFilter = @_get 'texture.minFilter'
    magFilter = @_get 'texture.magFilter'
    type      = @_get 'texture.type'

    # Read given dimensions
    width    = @_get 'voxel.width'
    height   = @_get 'voxel.height'
    depth    = @_get 'voxel.depth'
    reserveX = @_get 'voxel.bufferWidth'
    reserveY = @_get 'voxel.bufferHeight'
    reserveZ = @_get 'voxel.bufferDepth'
    channels = @_get 'data.dimensions'
    items    = @_get 'data.items'

    dims = @spec =
      channels: channels
      items:    items
      width:    width
      height:   height
      depth:    depth

    @items    = dims.items
    @channels = dims.channels

    # Init to right size if data supplied
    data = @_get 'data.data'
    dims = Util.Data.getDimensions data, dims

    space = @space
    space.width  = Math.max reserveX,  dims.width  || 1
    space.height = Math.max reserveY,  dims.height || 1
    space.depth  = Math.max reserveZ,  dims.depth  || 1

    # Create voxel buffer
    @buffer = @_renderables.make 'voxelBuffer',
              width:     space.width
              height:    space.height
              depth:     space.depth
              channels:  channels
              items:     items
              minFilter: minFilter
              magFilter: magFilter
              type:      type

    # Create data thunk to copy (multi-)array if bound to one
    if data?
      thunk    = Util.Data.getThunk    data
      @emitter = Util.Data.makeEmitter thunk, items, channels, 3

  unmake: () ->
    super
    if @buffer
      @buffer.dispose()
      @buffer = @spec = @emitter = null

  change: (changed, touched, init) ->
    return @rebuild() if touched['texture'] or
                         changed['data.dimensions'] or
                         changed['voxel.bufferWidth'] or
                         changed['voxel.bufferHeight'] or
                         changed['voxel.bufferDepth']

    return unless @buffer

    if changed['voxel.width']
      width = @_get 'voxel.width'
      return @rebuild() if width  > @space.width

    if changed['voxel.height']
      height = @_get 'voxel.height'
      return @rebuild() if height > @space.height

    if changed['voxel.depth']
      depth = @_get 'voxel.depth'
      return @rebuild() if depth  > @space.depth

    if changed['data.expression'] or
       changed['data.data'] or
       init

      emitter = @emitter
      data = @_get 'data.data'
      if !data?
        emitter = @callback @_get 'data.expression'
      @buffer.setCallback emitter

  callback: (callback) -> Util.Data.normalizeEmitter emitter, 3

  update: () ->
    return unless @buffer
    return unless !@filled or @_get 'data.live'

    data = @_get 'data.data'

    space    = @space
    used     = @used
    filled   = @buffer.getFilled()

    w = used.width
    h = used.height
    d = used.depth

    if data?
      dims = Util.Data.getDimensions data, @spec

      # Grow dimensions if needed
      if dims.width  > space.width  or
         dims.height > space.height or
         dims.depth  > space.depth
        @rebuild()

      used.width  = dims.width
      used.height = dims.height
      used.depth  = dims.depth

      @buffer.setActive used.width, used.height, used.depth
      @buffer.callback.rebind data
      @buffer.update()
    else
      @buffer.setActive @spec.width, @spec.height, @spec.depth

      length = @buffer.update()

      used.width  = _w = @spec.width
      used.height = _h = @spec.height
      used.depth  = Math.ceil length / _w / _h

    @filled = true

    if used.width  != w or
       used.height != h or
       used.depth  != d or
       filled != @buffer.getFilled()
      @trigger
        type: 'source.resize'

module.exports = Voxel