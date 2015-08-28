Voxel = require '../data/voxel'
Util = require '../../../util'

class HTML extends Voxel
  @traits = ['node', 'buffer', 'data', 'voxel', 'html']
  @defaults =
    channels: 1

  init: () ->
    super
    @storage = 'pushBuffer'

  make: () ->
    super

    # Get our own size
    {items, width, height, depth} = @getDimensions()

    # Prepare DOM element factory
    @dom = @_overlays.make 'dom'
    @dom.hint items * width * height * depth

  unmake: () ->
    super
    if @dom?
      @dom.dispose()
      @dom = null

  change: (changed, touched, init) ->
    return @rebuild() if touched['html']
    super changed, touched, init

  nodes: () -> @buffer.read()

  callback: (callback) ->
    el = @dom.el

    if callback.length <= 6
      (emit, i, j, k, l) ->
        callback emit, el, i, j, k, l
    else
      (emit, i, j, k, l) ->
        callback emit, el, i, j, k, l, @_context.time.clock, @_context.time.step

module.exports = HTML