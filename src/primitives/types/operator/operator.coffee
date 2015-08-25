Source = require '../base/source'

class Operator extends Source
  @traits = ['node', 'bind', 'operator', 'source', 'index']

  indexShader:   (shader)   -> @bind.source?.indexShader?   shader
  sourceShader:  (shader)   -> @bind.source?.sourceShader?  shader

  getDimensions: () ->       @bind.source.getDimensions()
  getFutureDimensions: () -> @bind.source.getFutureDimensions()
  getActiveDimensions: () -> @bind.source.getActiveDimensions()
  getIndexDimensions:  () -> @bind.source.getIndexDimensions()

  make: () ->
    super

    # Bind to attached data sources
    @_helpers.bind.make [
      { to: 'operator.source', trait: 'source' }
    ]

  made: () ->
    @resize()
    super

  unmake: () ->
    @_helpers.bind.unmake()

  resize: (rebuild) ->
    @trigger
      type: 'source.resize'

module.exports = Operator