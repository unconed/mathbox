Operator = require './operator'
Util     = require '../../../util'

class Swizzle extends Operator
  @traits: ['node', 'bind', 'operator', 'source', 'swizzle']

  sourceShader: (shader) ->
    @bind.source.sourceShader shader
    shader.pipe @swizzler if @swizzler

  make: () ->
    super

    # Swizzling order
    order = @_get 'swizzle.order'
    @swizzler = Util.GLSL.swizzleVec4 order if order != 'xyzw'

    # Notify of reallocation
    @trigger
      event: 'rebuild'

  unmake: () ->
    super
    @swizzler = null

  change: (changed, touched, init) ->
    @rebuild() if touched['swizzle']


module.exports = Swizzle
