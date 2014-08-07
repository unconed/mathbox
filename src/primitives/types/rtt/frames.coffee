Source = require '../base/source'

class Frames extends Source
  @traits = ['node', 'bind', 'operator', 'source', 'frames']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @width = @height = @frames = @size = null

  resize: () ->
    return unless @rtt and @bind.source

    dims = @bind.source.getActive()
    width  = dims.width
    height = dims.height
    depth  = dims.depth
    layers = dims.items

    @remap4DScale.set width, height

    @trigger type: 'resize'

  getDimensions: () -> @bind.source.getDimensions()
  getActive:     () -> @bind.source.getActive()

  sourceShader: (shader) ->
    shader.pipe "map.xyzw.xyz"
    @rtt.shaderAbsolute shader, @rtt.getFrames() - 1, @shader

  make: () ->
    @_helpers.bind.make
      'operator.source': 'rtt'

    # Prepare uniforms for remapping to absolute coords on the fly
    @resampleUniforms =
      remap4DScale: @_attributes.make @_types.vec2()
    @remap4DScale = @resampleUniforms.remap4DScale.value

    @rtt = @bind.source.getRTT()
    @shader = @_get 'frames.fragment'

    @resize()

    # Notify of buffer reallocation
    @trigger
      type: 'rebuild'

  unmake: (rebuild) ->
    @_helpers.bind.unmake()

  change: (changed, touched, init) ->
    @rebuild() if touched['operator'] or
                  touched['frames']

module.exports = Frames