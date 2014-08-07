Operator = require './operator'
Util     = require '../../../util'

class Remap extends Operator
  @traits: ['node', 'bind', 'operator', 'source', 'remap']

  sourceShader: (shader) ->
    shader.pipe @operator

  make: () ->
    super

    # Get custom shader
    indices    = @_get 'remap.indices'
    dimensions = @_get 'remap.dimensions'
    shader     = @_get 'remap.shader'

    # Build shader to remap data
    operator = @_shaders.shader()

    if shader?
      operator.pipe Util.GLSL.truncateVec 4, indices    if indices != 4

      operator.callback()
      operator.pipe Util.GLSL.extendVec indices, 4      if indices != 4

      @bind.source.sourceShader operator

      operator.pipe Util.GLSL.truncateVec 4, dimensions if dimensions != 4
      operator.join()
      operator.pipe shader

      operator.pipe Util.GLSL.extendVec dimensions, 4   if dimensions != 4
    else
      @bind.source.sourceShader operator

    @operator = operator

    # Notify of reallocation
    @trigger
      event: 'rebuild'

  unmake: () ->
    super

  change: (changed, touched, init) ->
    @rebuild() if touched['operator'] or
                  touched['remap']


module.exports = Remap
