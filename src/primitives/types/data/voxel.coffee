Data = require './data'
Util = require '../../../util'

class Voxel extends Data
  @traits = ['node', 'data', 'source', 'texture', 'voxel']

  init: () ->
    @buffer = @spec = null
    @filled = false

    @space =
      width:  0
      height: 0
      depth:  0

    @used =
      width:  0
      height: 0
      depth:  0
    
    @storage = 'voxelBuffer'
    
    super

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
    channels = @_get 'data.channels'
    items    = @_get 'data.items'

    dims = @spec = {channels, items, width, height, depth}

    @items    = dims.items
    @channels = dims.channels

    # Init to right size if data supplied
    data = @_get 'data.data'
    dims = Util.Data.getDimensions data, dims

    space = @space
    space.width  = Math.max reserveX,  dims.width  || 1
    space.height = Math.max reserveY,  dims.height || 1
    space.depth  = Math.max reserveZ,  dims.depth  || 1

    @spec.width  ?= 1
    @spec.height ?= 1
    @spec.depth  ?= 1

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
                         changed['data.channels'] or
                         changed['data.items'] or
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

      @buffer.setCallback @emitter()

  callback: (callback) -> callback

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

      if used.depth == 1
        used.height = Math.ceil length / _w
        used.width  = length if used.height == 1          

    @filled = true

    if used.width  != w or
       used.height != h or
       used.depth  != d or
       filled != @buffer.getFilled()
      @trigger
        type: 'source.resize'

module.exports = Voxel