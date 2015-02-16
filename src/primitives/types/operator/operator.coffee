Source = require '../base/source'

class Operator extends Source
  @traits = ['node', 'bind', 'operator', 'source', 'index']

  indexShader:   (shader)   -> @bind.source?.indexShader?   shader
  sourceShader:  (shader)   -> @bind.source?.sourceShader?  shader

  getDimensions: () ->
    @bind.source.getDimensions()

  getActive: () ->
    @bind.source.getActive()

  make: () ->
    super

    # Bind to attached data sources
    @_helpers.bind.make
      'operator.source': 'source'

  made: () -> @resize()

  unmake: () ->
    @_helpers.bind.unmake()

  resize: () ->
    @trigger
      type: 'source.resize'

module.exports = Operator