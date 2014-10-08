Operator = require './operator'
Util     = require '../../../util'

class Swizzle extends Operator
  @traits: ['node', 'bind', 'operator', 'source', 'swizzle']

  sourceShader: (shader) ->
    @bind.source.sourceShader shader
    shader.pipe @swizzler if @swizzler

  make: () ->
    super
    return unless @bind.source?

    # Swizzling order
    order = @_get 'swizzle.order'
    @swizzler = Util.GLSL.swizzleVec4 order, 4 if order.join() != '1234'

    # Notify of reallocation
    @trigger
      type: 'source.rebuild'

  unmake: () ->
    super
    @swizzler = null

  change: (changed, touched, init) ->
    return @rebuild() if touched['swizzle'] or
                         touched['operator']


module.exports = Swizzle
