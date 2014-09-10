Operator = require './operator'
Util     = require '../../../util'

class Remap extends Operator
  @traits: ['node', 'bind', 'operator', 'source', 'remap']

  sourceShader: (shader) ->
    shader.pipe @operator

  resize: () ->
    @refresh()

  make: () ->
    super
    return unless @bind.source?

    # Get custom shader
    indices    = @_get 'remap.indices'
    dimensions = @_get 'remap.dimensions'
    shader     = @_get 'remap.shader'

    # Build shader to remap data
    operator = @_shaders.shader()

    # Uniforms
    uniforms =
      dataSize:       @_attributes.make @_types.vec2(0, 0)
      dataResolution: @_attributes.make @_types.vec2(0, 0)
      dataOffset:     @_attributes.make @_types.vec2(.5, .5)

    @dataResolution = uniforms.dataResolution.value
    @dataSize       = uniforms.dataSize.value

    if shader?
      operator.pipe Util.GLSL.truncateVec 4, indices    if indices != 4

      operator.callback()
      operator.pipe Util.GLSL.extendVec indices, 4      if indices != 4

      @bind.source.sourceShader operator

      operator.pipe Util.GLSL.truncateVec 4, dimensions if dimensions != 4
      operator.join()
      operator.pipe shader, uniforms

      operator.pipe Util.GLSL.extendVec dimensions, 4   if dimensions != 4
    else
      @bind.source.sourceShader operator

    @operator = operator

    # Notify of reallocation
    @trigger
      type: 'rebuild'

  unmake: () ->
    super

  change: (changed, touched, init) ->
    return @rebuild() if touched['operator'] or
                         touched['remap']

    dims = @bind.source.getActive()
    @dataResolution.set 1 / dims.width, 1 / dims.height
    @dataSize.set       dims.width, dims.height


module.exports = Remap
