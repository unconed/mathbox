Operator = require './operator'
Util     = require '../../../util'

labels =
  1: 'width'
  2: 'height'
  3: 'depth'
  4: 'items'

class Transpose extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'transpose']

  indexShader: (shader) ->
    shader.pipe @swizzler if @swizzler
    super shader

  sourceShader: (shader) ->
    shader.pipe @swizzler if @swizzler
    super shader

  getDimensions: () ->
    @_remap @transpose, @bind.source.getDimensions()

  getActive: () ->
    @_remap @transpose, @bind.source.getActive()

  _remap: (transpose, dims) ->
    # Map dimensions onto their new axis
    out = {}

    for i in [0..3]
      dst = labels[i + 1]
      src = labels[transpose[i]]
      out[dst] = dims[src] ? 1

    out

  make: () ->
    super
    return unless @bind.source?

    # Transposition order
    order = @_get 'transpose.order'
    @swizzler = Util.GLSL.invertSwizzleVec4 order if order.join() != '1234'
    @transpose = order

    # Notify of reallocation
    @trigger
      type: 'source.rebuild'

  unmake: () ->
    super
    @swizzler = null

  change: (changed, touched, init) ->
    return @rebuild() if touched['transpose'] or
                         touched['operator']


module.exports = Transpose
