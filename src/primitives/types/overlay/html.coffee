Voxel = require '../data/voxel'
Util = require '../../../util'

class HTML extends Voxel
  @traits = ['node', 'data', 'voxel', 'html']
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
    if dom
      @dom.dispose()
      @dom = null

  update: () ->
    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['html']
    super changed, touched, init

  nodes: () -> @buffer.read()

  callback: (callback) ->
    el = @dom.el

    (emit, i, j, k, l) ->
      callback emit, el, i, j, k, l

module.exports = HTML