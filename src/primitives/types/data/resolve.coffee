Data = require './data'
Util = require '../../../util'

class Resolve extends Data
  @traits = ['node', 'data', 'active', 'source', 'index', 'voxel']

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

    super

  sourceShader: (shader) ->
    @buffer.shader shader

  getDimensions: () ->
    space = @space

    items:  @items
    width:  space.width
    height: space.height
    depth:  space.depth

  getActiveDimensions: () ->
    used = @used

    items:  @items
    width:  used.width
    height: used.height
    depth:  used.depth * @buffer.getFilled()

  make: () ->
    super

    # Read given dimensions
    width    = @props.width
    height   = @props.height
    depth    = @props.depth
    reserveX = @props.bufferWidth
    reserveY = @props.bufferHeight
    reserveZ = @props.bufferDepth

    dims = @spec = {channels: 1, items: 1, width, height, depth}

    # Init to right size if data supplied
    data = @props.data
    dims = Util.Data.getDimensions data, dims

    space = @space
    space.width  = Math.max reserveX,  dims.width  || 1
    space.height = Math.max reserveY,  dims.height || 1
    space.depth  = Math.max reserveZ,  dims.depth  || 1

    @spec.width  ?= 1
    @spec.height ?= 1
    @spec.depth  ?= 1

    # Create voxel buffer to hold item state
    # (enter, exit)
    @buffer = @_renderables.make 'voxelBuffer',
              width:     space.width
              height:    space.height
              depth:     space.depth
              channels:  2
              items:     1

  # Decorate emit callback for a bound source
  callback: () ->

  # 
  emitter: () ->
    super 1, 1

  change: (changed, touched, init) ->
    super
    return @rebuild() if false
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
       changed['data.resolve']
       init

      @buffer.setCallback @emitter()

  update: () ->
    return unless @buffer

    filled = @buffer.getFilled()
    return unless !filled or @props.live

    data = @props.data

    space    = @space
    used     = @used

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

module.exports = Data