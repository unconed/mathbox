Source = require '../base/source'

class Frames extends Source
  @traits = ['node', 'bind', 'operator', 'source', 'image']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @width = @height = @frames = @size = null

  resize:        () -> @trigger type: 'resize'
  getDimensions: () -> @bind.source.getDimensions()
  getActive:     () -> @bind.source.getActive()

  imageShader:   (shader) ->
    @bind.source.imageShader  shader

  sourceShader:  (shader) ->
    @bind.source.sourceShader shader

  make: () ->
    @_helpers.bind.make
      'operator.source': 'frames'

    @uniforms =
      frameIndex:    @node.attributes['frame.frame']
      frameTextures: @bind.source.getFrames()

    # Notify of buffer reallocation
    @trigger
      type: 'rebuild'

  unmake: (rebuild) ->
    @_helpers.bind.unmake()

  change: (changed, touched, init) ->
    @rebuild() if touched['operator']

module.exports = Frames