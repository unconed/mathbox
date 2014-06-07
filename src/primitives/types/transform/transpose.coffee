Transform = require './transform'
Util      = require '../../../util'

letters = 'xyzw'.split('')
labels =
  x: 'width'
  y: 'height'
  z: 'depth'
  w: 'items'

class Transpose extends Transform
  @traits: ['node', 'bind', 'transform', 'transpose']

  shader: (shader) ->
    shader.call @swizzler
    @bind.source.shader shader

  getDimensions: () ->
    @_remap @transpose, @bind.source.getDimensions()

  getActive: () ->
    @_remap @transpose, @bind.source.getActive()

  _remap: (transpose, dims) ->
    # Map dimensions onto their new axis
    out = {}

    for letter, i in letters
      dst = labels[letter]
      src = labels[transpose[i]]

      out[dst] = dims[src] ? 1

    out

  make: () ->
    super

    # Transposition order
    order = @_get 'transpose.order'
    @transpose = order.split ''
    @swizzler  = Util.GLSL.invertSwizzleVec4 order

    # Notify of reallocation
    @trigger
      event: 'rebuild'

  unmake: () ->
    super

  change: (changed, touched, init) ->
    @rebuild() if touched['transpose']


module.exports = Transpose
