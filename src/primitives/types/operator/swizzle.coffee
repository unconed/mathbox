Operator = require './operator'
Util     = require '../../../util'

class Swizzle extends Operator
  @traits = ['node', 'bind', 'operator', 'source', 'index', 'swizzle']

  sourceShader: (shader) ->
    shader = super shader
    shader.pipe @swizzler if @swizzler
    shader

  make: () ->
    super
    return unless @bind.source?

    # Swizzling order
    order = @props.order
    @swizzler = Util.GLSL.swizzleVec4 order, 4 if order.join() != '1234'

  unmake: () ->
    super
    @swizzler = null

  change: (changed, touched, init) ->
    return @rebuild() if touched['swizzle'] or
                         touched['operator']


module.exports = Swizzle
