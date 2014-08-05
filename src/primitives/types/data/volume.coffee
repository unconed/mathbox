Voxel = require './voxel'

class Volume extends Voxel
  @traits: ['node', 'data', 'source', 'voxel', 'span:x', 'span:y', 'span:z', 'voxel', 'sampler:x', 'sampler:y', 'sampler:z']

  callback: (callback) ->
    dimensions = @_get 'volume.axes'

    width      = @_get 'volume.width'
    height     = @_get 'volume.height'
    depth      = @_get 'volume.depth'
    centeredX  = @_get 'x.sampler.centered'
    centeredY  = @_get 'y.sampler.centered'
    centeredZ  = @_get 'z.sampler.centered'

    rangeX     = @_helpers.span.get 'x.', dimensions.x
    rangeY     = @_helpers.span.get 'y.', dimensions.y
    rangeZ     = @_helpers.span.get 'z.', dimensions.z

    aX = rangeX.x
    aY = rangeY.x
    aZ = rangeZ.x

    if centeredX
      inverseX  = 1 / Math.max 1, width
      aX += inverseX / 2
    else
      inverseX  = 1 / Math.max 1, width - 1

    if centeredY
      inverseY  = 1 / Math.max 1, height
      aY += inverseY / 2
    else
      inverseY  = 1 / Math.max 1, height - 1

    if centeredZ
      inverseZ  = 1 / Math.max 1, depth
      aZ += inverseZ / 2
    else
      inverseZ  = 1 / Math.max 1, depth - 1

    bX = (rangeX.y - rangeX.x) * inverseX
    bY = (rangeY.y - rangeY.x) * inverseY
    bZ = (rangeZ.y - rangeZ.x) * inverseZ

    (i, j, k, emit) ->
      x = aX + bX * i
      y = aY + bY * j
      Z = aZ + bZ * k
      callback x, y, z, i, j, k, emit

  make: () ->
    super
    @_helpers.span.make()

  unmake: () ->
    super
    @_helpers.span.unmake()

module.exports = Volume