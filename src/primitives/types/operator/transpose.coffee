Operator = require './operator'
Util     = require '../../../util'

letters = 'xyzw'.split('')
labels =
  x: 'width'
  y: 'height'
  z: 'depth'
  w: 'items'

class Transpose extends Operator
  @traits: ['node', 'bind', 'operator', 'source', 'transpose']

  sourceShader: (shader) ->
    shader.pipe @swizzler if @swizzler
    @bind.source.sourceShader shader

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
    @swizzler  = Util.GLSL.invertSwizzleVec4 order if order != 'xyzw'

    # Notify of reallocation
    @trigger
      type: 'rebuild'

  unmake: () ->
    super
    @swizzler = null

  change: (changed, touched, init) ->
    @rebuild() if touched['transpose']


module.exports = Transpose
